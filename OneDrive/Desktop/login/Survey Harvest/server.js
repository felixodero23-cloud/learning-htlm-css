import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Database from "better-sqlite3";
import Stripe from "stripe";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const db = new Database(process.env.DATABASE_PATH || path.join(__dirname, "survey-harvest.db"));
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
const port = Number(process.env.PORT || 3000);
const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) throw new Error("JWT_SECRET is required");

db.pragma("journal_mode = WAL");
db.exec(`
  CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, stripe_account_id TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
  CREATE TABLE IF NOT EXISTS surveys (id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT NOT NULL, reward_points INTEGER NOT NULL, duration TEXT NOT NULL, category TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS responses (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, survey_id TEXT NOT NULL, answer TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, UNIQUE(user_id, survey_id), FOREIGN KEY(user_id) REFERENCES users(id), FOREIGN KEY(survey_id) REFERENCES surveys(id));
  CREATE TABLE IF NOT EXISTS points_ledger (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, points INTEGER NOT NULL, reason TEXT NOT NULL, reference_id TEXT NOT NULL UNIQUE, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(user_id) REFERENCES users(id));
  CREATE TABLE IF NOT EXISTS payouts (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, points INTEGER NOT NULL, amount_cents INTEGER NOT NULL, stripe_transfer_id TEXT, status TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(user_id) REFERENCES users(id));
`);

const surveySeed = [
  ["commute", "The future of your daily commute", "Help transit leaders understand how people move through their cities.", 180, "4 min", "TRANSPORT"],
  ["groceries", "Your next grocery shop", "Tell us what makes a food shopping trip feel worth your time.", 260, "6 min", "SHOPPING"],
  ["streaming", "What should we watch next?", "Shape the shows, stories, and experiences made for your evenings.", 120, "3 min", "ENTERTAINMENT"]
];
const seedSurvey = db.prepare("INSERT OR IGNORE INTO surveys (id, title, description, reward_points, duration, category) VALUES (?, ?, ?, ?, ?, ?)");
surveySeed.forEach((survey) => seedSurvey.run(...survey));

app.use(cors({ origin: process.env.CLIENT_ORIGIN || true }));
app.use(express.json());
app.use(express.static(__dirname));

function tokenFor(user) { return jwt.sign({ sub: user.id }, jwtSecret, { expiresIn: "7d" }); }
function auth(req, res, next) {
  try { req.userId = jwt.verify((req.headers.authorization || "").replace("Bearer ", ""), jwtSecret).sub; next(); }
  catch { res.status(401).json({ error: "Authentication required" }); }
}
function balanceFor(userId) { return db.prepare("SELECT COALESCE(SUM(points), 0) AS points FROM points_ledger WHERE user_id = ?").get(userId).points; }
function userView(user) { return { id: user.id, name: user.name, email: user.email, points: balanceFor(user.id) }; }

app.post("/api/auth/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password || password.length < 8) return res.status(400).json({ error: "Name, email, and an 8-character password are required" });
  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const result = db.prepare("INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)").run(name.trim(), email.toLowerCase().trim(), passwordHash);
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(result.lastInsertRowid);
    res.status(201).json({ token: tokenFor(user), user: userView(user) });
  } catch (error) { res.status(error.code === "SQLITE_CONSTRAINT_UNIQUE" ? 409 : 500).json({ error: "That email is already registered" }); }
});

app.post("/api/auth/login", async (req, res) => {
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(String(req.body.email || "").toLowerCase().trim());
  if (!user || !(await bcrypt.compare(req.body.password || "", user.password_hash))) return res.status(401).json({ error: "Invalid email or password" });
  res.json({ token: tokenFor(user), user: userView(user) });
});

app.get("/api/me", auth, (req, res) => {
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.userId);
  if (!user) return res.status(401).json({ error: "Account not found" });
  res.json({ user: userView(user), surveys: db.prepare("SELECT * FROM surveys").all(), completed: db.prepare("SELECT survey_id FROM responses WHERE user_id = ?").all(req.userId).map((row) => row.survey_id) });
});

app.post("/api/surveys/:id/respond", auth, (req, res) => {
  const survey = db.prepare("SELECT * FROM surveys WHERE id = ?").get(req.params.id);
  if (!survey || !req.body.answer) return res.status(400).json({ error: "A valid survey response is required" });
  const referenceId = `survey:${req.userId}:${survey.id}`;
  const transaction = db.transaction(() => {
    db.prepare("INSERT INTO responses (user_id, survey_id, answer) VALUES (?, ?, ?)").run(req.userId, survey.id, req.body.answer);
    db.prepare("INSERT INTO points_ledger (user_id, points, reason, reference_id) VALUES (?, ?, ?, ?)").run(req.userId, survey.reward_points, "Survey completion", referenceId);
  });
  try { transaction(); res.status(201).json({ points: balanceFor(req.userId), earned: survey.reward_points }); }
  catch { res.status(409).json({ error: "This survey has already been completed" }); }
});

app.post("/api/stripe/onboard", auth, async (req, res) => {
  if (!stripe) return res.status(503).json({ error: "Stripe is not configured" });
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.userId);
  try {
    let accountId = user.stripe_account_id;
    if (!accountId) {
      const account = await stripe.accounts.create({ type: "express", email: user.email, capabilities: { transfers: { requested: true } } });
      accountId = account.id;
      db.prepare("UPDATE users SET stripe_account_id = ? WHERE id = ?").run(accountId, user.id);
    }
    const link = await stripe.accountLinks.create({ account: accountId, type: "account_onboarding", refresh_url: process.env.STRIPE_RETURN_URL || "http://localhost:3000", return_url: process.env.STRIPE_RETURN_URL || "http://localhost:3000" });
    res.json({ url: link.url });
  } catch (error) { res.status(502).json({ error: error.message || "Could not start Stripe onboarding" }); }
});

app.post("/api/payouts", auth, async (req, res) => {
  const { points } = req.body;
  if (!stripe || !process.env.STRIPE_SECRET_KEY) return res.status(503).json({ error: "Payouts are not configured. Add STRIPE_SECRET_KEY first." });
  if (!Number.isInteger(points) || points < 500) return res.status(400).json({ error: "Minimum payout is 500 points" });
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.userId);
  const available = balanceFor(req.userId);
  if (points > available) return res.status(400).json({ error: "Insufficient points" });
  if (!user.stripe_account_id) return res.status(400).json({ error: "Connect a Stripe account before requesting a payout" });
  try {
    const transfer = await stripe.transfers.create({ amount: points, currency: "usd", destination: user.stripe_account_id, metadata: { userId: String(req.userId) } });
    db.transaction(() => {
      db.prepare("INSERT INTO points_ledger (user_id, points, reason, reference_id) VALUES (?, ?, ?, ?)").run(req.userId, -points, "Payout redemption", `payout:${transfer.id}`);
      db.prepare("INSERT INTO payouts (user_id, points, amount_cents, stripe_transfer_id, status) VALUES (?, ?, ?, ?, ?)").run(req.userId, points, points, transfer.id, "paid");
    })();
    res.status(201).json({ status: "paid", transferId: transfer.id, points: balanceFor(req.userId) });
  } catch (error) { res.status(502).json({ error: error.message || "Payment provider rejected the payout" }); }
});

app.listen(port, () => console.log(`Survey Harvest running at http://localhost:${port}`));
