import './style.css';

const projects = [
  {
    title: 'Campus Connect',
    type: 'Web development',
    description: 'A student-first platform that brings campus announcements, communities, and resources into one focused digital space.',
    tags: ['HTML', 'CSS', 'JavaScript'],
    number: '01',
    tone: 'sunset'
  },
  {
    title: 'Data Desk',
    type: 'Database systems',
    description: 'A clear, dependable dashboard concept for exploring structured records and turning raw data into decisions.',
    tags: ['SQL', 'Data design', 'UX'],
    number: '02',
    tone: 'mint'
  },
  {
    title: 'Dev Notes',
    type: 'Software engineering',
    description: 'A living space for technical notes, project learnings, and small experiments that make the next build stronger.',
    tags: ['Research', 'Systems', 'Writing'],
    number: '03',
    tone: 'blue'
  }
];

const app = document.querySelector('#app');

app.innerHTML = `
  <header class="site-header">
    <a class="brand" href="#top" aria-label="Felix Odero home"><span>FO</span><b>Felix Odero</b></a>
    <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-nav">Menu <span>+</span></button>
    <nav id="site-nav" class="site-nav" aria-label="Main navigation">
      <a href="#about">About</a>
      <a href="#skills">Skills</a>
      <a href="#work">Work</a>
      <a href="#contact" class="nav-contact">Let's talk <span>↗</span></a>
    </nav>
  </header>

  <main id="top">
    <section class="hero section-grid">
      <div class="hero-copy reveal">
        <p class="eyebrow"><span class="status-dot"></span> Available for opportunities · 2026</p>
        <h1>Building digital <em>clarity</em> from curious ideas.</h1>
        <p class="hero-intro">I’m Felix Odero, an Information Technology student and developer exploring the space where thoughtful design meets dependable systems.</p>
        <div class="hero-actions">
          <a class="button button-dark" href="#work">View my work <span>↗</span></a>
          <a class="text-link" href="#about">More about me <span>↓</span></a>
        </div>
      </div>
      <div class="hero-visual reveal reveal-delay">
        <div class="portrait-frame">
          <div class="portrait-meta"><span>Developer / 001</span><span>Web · Data · Code</span></div>
          <img src="/Felix.a.jpg" alt="Portrait of Felix Odero" />
          <div class="portrait-label">FELIX<br />ODERO</div>
        </div>
        <div class="orbit orbit-one"></div><div class="orbit orbit-two"></div>
        <p class="visual-note">Currently based in<br /><strong>Kenya, KE</strong></p>
      </div>
      <div class="hero-foot"><span>Scroll to explore</span><span class="scroll-line"></span><span>01 / 04</span></div>
    </section>

    <section id="about" class="about section-grid section-pad">
      <div class="section-index">01 <span>/</span> About</div>
      <div class="about-main reveal">
        <p class="kicker">A little context</p>
        <h2>Learning in public.<br /><span>Building with purpose.</span></h2>
        <div class="about-columns">
          <p>I’m a <strong>MMUST student</strong> pursuing Information Technology in the School of Computing and Informatics (SCI). My studies give me a practical foundation in programming, systems analysis, networking, and digital problem-solving.</p>
          <p>I’m interested in web development, database administration, and software engineering. I learn by building, documenting what I discover, and turning complex problems into simple, useful experiences.</p>
        </div>
        <a class="circle-link" href="#contact" aria-label="Get in touch">Get<br />in touch <span>↗</span></a>
      </div>
      <aside class="education-card reveal reveal-delay"><span class="card-label">Education</span><strong>Masinde Muliro<br />University</strong><p>BSc. Information Technology</p><small>School of Computing & Informatics<br />Currently studying</small></aside>
    </section>

    <section id="skills" class="skills section-pad">
      <div class="section-grid skills-heading"><div class="section-index">02 <span>/</span> Toolkit</div><div><p class="kicker">What I bring</p><h2>Five ways I’m<br /><em>learning by doing.</em></h2></div></div>
      <div class="skill-list">
        <div class="skill-row"><span class="skill-number">01</span><h3>Web development</h3><p>Responsive interfaces, clear interactions, and front-end foundations built to last.</p><span class="skill-arrow">↗</span></div>
        <div class="skill-row"><span class="skill-number">02</span><h3>Database administration</h3><p>Organized data, thoughtful schemas, and systems that stay reliable as they grow.</p><span class="skill-arrow">↗</span></div>
        <div class="skill-row"><span class="skill-number">03</span><h3>Software engineering</h3><p>Structured thinking, maintainable code, and a steady approach to solving problems.</p><span class="skill-arrow">↗</span></div>
        <div class="skill-row"><span class="skill-number">04</span><h3>Networking & IT support</h3><p>Understanding how devices connect and helping people solve everyday technology challenges.</p><span class="skill-arrow">↗</span></div>
        <div class="skill-row"><span class="skill-number">05</span><h3>UI/UX & technical communication</h3><p>Researching user needs and explaining technical ideas so teams can move with confidence.</p><span class="skill-arrow">↗</span></div>
      </div>
    </section>

    <section id="work" class="work section-pad">
      <div class="section-grid work-heading"><div class="section-index">03 <span>/</span> Work</div><div><p class="kicker">Experience paths</p><h2>Growing through<br /><em>real problems.</em></h2></div></div>
      <div class="experience-grid">
        <article class="experience-card"><span class="experience-date">Now · MMUST</span><h3>IT student & builder</h3><p>Developing a strong base in software, data, and systems through coursework, independent practice, and portfolio projects.</p><a href="#contact">View learning path <span>↗</span></a></article>
        <article class="experience-card"><span class="experience-date">Open to · 2026</span><h3>Web development intern</h3><p>Ready to support a product or engineering team with responsive interfaces, research, testing, and careful implementation.</p><a href="mailto:felixodero@example.com">Discuss an opportunity <span>↗</span></a></article>
        <article class="experience-card"><span class="experience-date">Exploring next</span><h3>Data & systems assistant</h3><p>Interested in helping teams organize information, maintain databases, and improve the reliability of their daily workflows.</p><a href="#contact">Start a conversation <span>↗</span></a></article>
      </div>
      <div class="work-project-label"><p class="kicker">Selected projects</p></div>
      <div class="project-filters" role="group" aria-label="Filter projects"><button class="filter active" data-filter="All">All</button><button class="filter" data-filter="Web development">Web</button><button class="filter" data-filter="Database systems">Data</button><button class="filter" data-filter="Software engineering">Engineering</button></div>
      <div class="project-grid"></div>
    </section>

    <section id="contact" class="contact section-grid section-pad">
      <div class="section-index">04 <span>/</span> Contact</div>
      <div class="contact-main"><p class="kicker">Have a question or an idea?</p><h2>Let’s make<br /><em>something useful.</em></h2><a class="email-link" href="mailto:felixodero@example.com">felixodero@example.com <span>↗</span></a></div>
      <div class="contact-aside"><p>Open to learning, collaborating, and contributing to projects that make technology more human.</p><div class="socials"><a href="#contact">LinkedIn <span>↗</span></a><a href="#contact">GitHub <span>↗</span></a><a href="#contact">Instagram <span>↗</span></a></div></div>
    </section>
  </main>

  <footer><span>© 2026 Felix Odero</span><span>Designed & built with intention</span><a href="#top">Back to top ↑</a></footer>
`;

const projectGrid = document.querySelector('.project-grid');
const renderProjects = (filter = 'All') => {
  projectGrid.innerHTML = projects.filter((project) => filter === 'All' || project.type === filter).map((project) => `
    <article class="project-card ${project.tone}">
      <div class="project-top"><span>${project.number}</span><span>${project.type}</span></div>
      <div class="project-visual"><div class="visual-grid"></div><div class="project-mark">${project.number}</div></div>
      <div class="project-info"><h3>${project.title}</h3><p>${project.description}</p><div class="tag-list">${project.tags.map((tag) => `<span>${tag}</span>`).join('')}</div></div>
    </article>
  `).join('');
};
renderProjects();

document.querySelectorAll('.filter').forEach((button) => button.addEventListener('click', () => {
  document.querySelector('.filter.active').classList.remove('active');
  button.classList.add('active');
  renderProjects(button.dataset.filter);
}));

const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.site-nav');
menuToggle.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.querySelector('span').textContent = open ? '−' : '+';
});
document.querySelectorAll('.site-nav a').forEach((link) => link.addEventListener('click', () => {
  nav.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.querySelector('span').textContent = '+';
}));

const revealObserver = new IntersectionObserver((entries) => entries.forEach((entry) => {
  if (entry.isIntersecting) entry.target.classList.add('visible');
}), { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));
