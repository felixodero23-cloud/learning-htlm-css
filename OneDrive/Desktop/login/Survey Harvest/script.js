const token = localStorage.getItem("surveyHarvestToken");
const authScreen = document.querySelector("#authScreen");
const dashboard = document.querySelector("#dashboard");
const surveyGrid = document.querySelector("#surveyGrid");
const toast = document.querySelector("#toast");
const surveyModal = document.querySelector("#surveyModal");
const surveyForm = document.querySelector("#surveyForm");
let activeSurvey;
let appData;

function showToast(message) { toast.textContent = message; toast.classList.add("show"); setTimeout(() => toast.classList.remove("show"), 3000); }
async function api(path, options = {}) {
	let response;
	try {
		response = await fetch(`/api${path}`, { ...options, headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) } });
	} catch {
		throw new Error("Unable to connect to Survey Harvest. Please check that the server is running.");
	}
	const text = await response.text();
	let data = {};
	try { data = text ? JSON.parse(text) : {}; } catch { throw new Error("The server returned an unreadable response. Please try again."); }
	if (!response.ok) throw new Error(data.error || "We could not complete that request. Please try again.");
	return data;
}

function renderSurveys() {
	surveyGrid.innerHTML = appData.surveys.map((survey, index) => {
		const completed = appData.completed.includes(survey.id);
		return `<article class="survey-card ${["coral", "green", "yellow"][index % 3]} ${completed ? "is-complete" : ""}"><div class="survey-art"><span>${["↗", "▦", "◒"][index % 3]}</span><small>${["98%", "94%", "89%"][index % 3]} match</small></div><div class="survey-content"><span class="tag">${survey.category}</span><h3>${survey.title}</h3><p>${survey.description}</p><div class="survey-meta"><span>◷ ${survey.duration}</span><strong>+${survey.reward_points} pts</strong></div><button class="survey-button" data-survey="${survey.id}" ${completed ? "disabled" : ""}>${completed ? "Completed ✓" : "Start survey →"}</button></div></article>`;
	}).join("");
}

function showDashboard() {
	authScreen.classList.add("hidden"); dashboard.classList.remove("hidden");
	const firstName = appData.user.name.split(" ")[0];
	document.querySelector("#welcomeName").textContent = firstName;
	document.querySelector("#profileName").textContent = firstName;
	document.querySelector("#profileInitial").textContent = firstName[0].toUpperCase();
	document.querySelector("#pointsBalance").textContent = appData.user.points.toLocaleString();
	document.querySelector("#completedCount").textContent = appData.completed.length;
	renderSurveys();
	requestAnimationFrame(() => document.querySelector("#surveyGrid").scrollIntoView({ behavior: "smooth", block: "start" }));
}

let loginMode = true;
function setAuthMode(nextLoginMode) {
	loginMode = nextLoginMode;
	document.querySelector("#authTitle").textContent = loginMode ? "Welcome back" : "Start earning points";
	document.querySelector("#authDescription").textContent = loginMode ? "Log in to continue earning and access your surveys." : "Create your free member profile to see surveys matched to you.";
	document.querySelector("#nameField").classList.toggle("hidden", loginMode);
	document.querySelector("#name").required = !loginMode;
	document.querySelector("#password").autocomplete = loginMode ? "current-password" : "new-password";
	document.querySelector("#authSubmit").firstChild.textContent = loginMode ? "Log in " : "Create my account ";
	document.querySelector("#authModeToggle").textContent = loginMode ? "New here? Create an account" : "Already a member? Log in";
}
document.querySelector("#authModeToggle").addEventListener("click", () => setAuthMode(!loginMode));
setAuthMode(true);

document.querySelector("#authForm").addEventListener("submit", async (event) => {
	event.preventDefault();
	const values = Object.fromEntries(new FormData(event.currentTarget));
	try {
		const result = await api(loginMode ? "/auth/login" : "/auth/register", { method: "POST", body: JSON.stringify(values) });
		localStorage.setItem("surveyHarvestToken", result.token); location.reload();
	} catch (error) { showToast(loginMode ? `Login unsuccessful: ${error.message}` : error.message); }
});

surveyGrid.addEventListener("click", (event) => {
	const button = event.target.closest("[data-survey]");
	if (!button) return;
	activeSurvey = appData.surveys.find((survey) => survey.id === button.dataset.survey);
	document.querySelector("#modalTag").textContent = activeSurvey.category;
	document.querySelector("#modalTitle").textContent = activeSurvey.title;
	document.querySelector("#modalDescription").textContent = activeSurvey.description;
	surveyModal.classList.remove("hidden");
});

document.querySelector("#closeModal").addEventListener("click", () => surveyModal.classList.add("hidden"));
surveyForm.addEventListener("submit", async (event) => {
	event.preventDefault();
	try {
		const answer = new FormData(surveyForm).get("answer");
		const result = await api(`/surveys/${activeSurvey.id}/respond`, { method: "POST", body: JSON.stringify({ answer }) });
		appData.user.points = result.points; appData.completed.push(activeSurvey.id); surveyModal.classList.add("hidden"); surveyForm.reset(); showDashboard(); showToast(`Response submitted. ${result.earned} points added.`);
	} catch (error) { showToast(error.message); }
});

document.querySelector("#payoutForm").addEventListener("submit", async (event) => {
	event.preventDefault();
	try {
		const points = Number(document.querySelector("#payoutPoints").value);
		const result = await api("/payouts", { method: "POST", body: JSON.stringify({ points }) });
		appData.user.points = result.points; showDashboard(); showToast("Payout sent to your Stripe account.");
	} catch (error) { showToast(error.message); }
});

document.querySelector("#connectStripe").addEventListener("click", async () => {
	try { const result = await api("/stripe/onboard", { method: "POST" }); window.location.href = result.url; }
	catch (error) { showToast(error.message); }
});

document.querySelector("#profileButton").addEventListener("click", () => { localStorage.removeItem("surveyHarvestToken"); location.reload(); });

if (token) api("/me").then((data) => { appData = data; showDashboard(); }).catch(() => { localStorage.removeItem("surveyHarvestToken"); });
