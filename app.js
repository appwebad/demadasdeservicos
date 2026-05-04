const STORAGE_KEYS = {
  candidates: 'demanda_candidates',
  companies: 'demanda_companies',
  jobs: 'demanda_jobs',
  applications: 'demanda_applications',
  session: 'demanda_session'
};

const app = document.getElementById('app');
const logoutBtn = document.getElementById('logoutBtn');
const toast = document.getElementById('toast');

const state = {
  route: 'home',
  session: load(STORAGE_KEYS.session, null),
  candidates: load(STORAGE_KEYS.candidates, []),
  companies: load(STORAGE_KEYS.companies, []),
  jobs: load(STORAGE_KEYS.jobs, seedJobs()),
  applications: load(STORAGE_KEYS.applications, [])
};

function seedJobs() {
  return [
    {
      id: crypto.randomUUID(),
      companyId: 'seed-company-1',
      companyName: 'Logística Rápida Brasil',
      jobType: 'Auxiliar de carga e descarga',
      dailyRate: 120,
      paymentDate: '2026-05-10',
      location: 'Campinas - SP',
      placeType: 'Galpão',
      createdAt: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      companyId: 'seed-company-2',
      companyName: 'Loja Centro Popular',
      jobType: 'Repositor de mercadorias',
      dailyRate: 110,
      paymentDate: '2026-05-12',
      location: 'Belo Horizonte - MG',
      placeType: 'Loja',
      createdAt: new Date().toISOString()
    }
  ];
}

function load(key, fallback) {
  const data = localStorage.getItem(key);
  if (!data) return fallback;
  try {
    return JSON.parse(data);
  } catch (error) {
    console.error('Erro ao ler storage', error);
    return fallback;
  }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function persist() {
  save(STORAGE_KEYS.candidates, state.candidates);
  save(STORAGE_KEYS.companies, state.companies);
  save(STORAGE_KEYS.jobs, state.jobs);
  save(STORAGE_KEYS.applications, state.applications);
  save(STORAGE_KEYS.session, state.session);
}

function setRoute(route) {
  state.route = route;
  render();
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.remove('hidden');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.add('hidden'), 2600);
}

function cloneTemplate(id) {
  return document.getElementById(id).content.cloneNode(true);
}

function formatMoney(value) {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(value) {
  if (!value) return '-';
  return new Date(`${value}T00:00:00`).toLocaleDateString('pt-BR');
}

function getCurrentUser() {
  if (!state.session) return null;
  const collection = state.session.type === 'candidate' ? state.candidates : state.companies;
  return collection.find((item) => item.id === state.session.id) || null;
}

function routeGuard() {
  if (state.route === 'candidate-dashboard' && state.session?.type !== 'candidate') {
    state.route = 'candidato-auth';
  }
  if (state.route === 'company-dashboard' && state.session?.type !== 'company') {
    state.route = 'empresa-auth';
  }
}

function render() {
  routeGuard();
  app.innerHTML = '';
  logoutBtn.classList.toggle('hidden', !state.session);

  if (state.route === 'home') {
    renderHome();
    return;
  }

  if (state.route === 'candidato-auth') {
    renderCandidateAuth();
    return;
  }

  if (state.route === 'empresa-auth') {
    renderCompanyAuth();
    return;
  }

  if (state.route === 'candidate-dashboard') {
    renderCandidateDashboard();
    return;
  }

  if (state.route === 'company-dashboard') {
    renderCompanyDashboard();
  }
}

function renderHome() {
  const view = cloneTemplate('home-template');
  app.appendChild(view);
  app.querySelectorAll('[data-route]').forEach((button) => {
    button.addEventListener('click', () => setRoute(button.dataset.route));
  });
}

function renderCandidateAuth() {
  const view = cloneTemplate('candidato-auth-template');
  app.appendChild(view);

  bindRouteButtons();

  const loginForm = document.getElementById('candidateLoginForm');
  const registerForm = document.getElementById('candidateRegisterForm');

  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = new FormData(loginForm);
    const email = form.get('email').toString().trim().toLowerCase();
    const password = form.get('password').toString();
    const candidate = state.candidates.find((item) => item.email === email && item.password === password);

    if (!candidate) {
      showToast('E-mail ou senha do candidato inválidos.');
      return;
    }

    state.session = { id: candidate.id, type: 'candidate' };
    persist();
    setRoute('candidate-dashboard');
    showToast('Login realizado com sucesso.');
  });

  registerForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = new FormData(registerForm);
    const email = form.get('email').toString().trim().toLowerCase();

    if (state.candidates.some((item) => item.email === email)) {
      showToast('Já existe um candidato cadastrado com este e-mail.');
      return;
    }

    const candidate = {
      id: crypto.randomUUID(),
      name: form.get('name').toString().trim(),
      cpf: form.get('cpf').toString().trim(),
      rg: form.get('rg').toString().trim(),
      address: form.get('address').toString().trim(),
      cep: form.get('cep').toString().trim(),
      email,
      whatsapp: form.get('whatsapp').toString().trim(),
      password: form.get('password').toString(),
      createdAt: new Date().toISOString()
    };

    state.candidates.unshift(candidate);
    state.session = { id: candidate.id, type: 'candidate' };
    persist();
    setRoute('candidate-dashboard');
    showToast('Cadastro de candidato concluído.');
  });
}

function renderCompanyAuth() {
  const view = cloneTemplate('empresa-auth-template');
  app.appendChild(view);

  bindRouteButtons();

  const loginForm = document.getElementById('companyLoginForm');
  const registerForm = document.getElementById('companyRegisterForm');

  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = new FormData(loginForm);
    const email = form.get('email').toString().trim().toLowerCase();
    const password = form.get('password').toString();
    const company = state.companies.find((item) => item.email === email && item.password === password);

    if (!company) {
      showToast('E-mail ou senha da empresa inválidos.');
      return;
    }

    state.session = { id: company.id, type: 'company' };
    persist();
    setRoute('company-dashboard');
    showToast('Login da empresa realizado com sucesso.');
  });

  registerForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = new FormData(registerForm);
    const email = form.get('email').toString().trim().toLowerCase();

    if (state.companies.some((item) => item.email === email)) {
      showToast('Já existe uma empresa cadastrada com este e-mail.');
      return;
    }

    const company = {
      id: crypto.randomUUID(),
      name: form.get('name').toString().trim(),
      cnpj: form.get('cnpj').toString().trim(),
      segment: form.get('segment').toString().trim(),
      email,
      whatsapp: form.get('whatsapp').toString().trim(),
      password: form.get('password').toString(),
      createdAt: new Date().toISOString()
    };

    state.companies.unshift(company);
    state.session = { id: company.id, type: 'company' };
    persist();
    setRoute('company-dashboard');
    showToast('Cadastro de empresa concluído.');
  });
}

function renderCandidateDashboard() {
  const candidate = getCurrentUser();
  if (!candidate) {
    state.session = null;
    persist();
    setRoute('candidato-auth');
    return;
  }

  const view = cloneTemplate('candidate-dashboard-template');
  app.appendChild(view);
  bindRouteButtons();

  document.getElementById('candidateGreeting').textContent = `Olá, ${candidate.name}`;

  const applications = state.applications.filter((item) => item.candidateId === candidate.id);
  document.getElementById('candidateVacanciesCount').textContent = String(state.jobs.length);
  document.getElementById('candidateApplicationsCount').textContent = String(applications.length);

  const list = document.getElementById('vacanciesList');
  if (!state.jobs.length) {
    list.innerHTML = `<div class="empty-state">Nenhuma demanda publicada até o momento.</div>`;
    return;
  }

  state.jobs
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .forEach((job) => {
      const card = cloneTemplate('vacancy-card-template');
      const alreadyApplied = applications.some((item) => item.jobId === job.id);
      const applicantsCount = state.applications.filter((item) => item.jobId === job.id).length;

      card.querySelector('.job-title').textContent = job.jobType;
      card.querySelector('.job-company').textContent = `${job.companyName} • ${job.location}`;
      card.querySelector('.job-place').textContent = job.placeType;
      card.querySelector('.job-meta').appendChild(buildMetaGrid(job));
      card.querySelector('.job-applicants').innerHTML = `<p><strong>${applicantsCount}</strong> candidato(s) inscrito(s)</p>`;

      const applyButton = card.querySelector('.apply-btn');
      applyButton.textContent = alreadyApplied ? 'Inscrição realizada' : 'Inscrever-se';
      applyButton.disabled = alreadyApplied;
      applyButton.classList.toggle('btn-outline', alreadyApplied);
      if (!alreadyApplied) {
        applyButton.addEventListener('click', () => {
          state.applications.unshift({
            id: crypto.randomUUID(),
            jobId: job.id,
            candidateId: candidate.id,
            createdAt: new Date().toISOString()
          });
          persist();
          render();
          showToast('Você se inscreveu na demanda com sucesso.');
        });
      }

      list.appendChild(card);
    });
}

function renderCompanyDashboard() {
  const company = getCurrentUser();
  if (!company) {
    state.session = null;
    persist();
    setRoute('empresa-auth');
    return;
  }

  const view = cloneTemplate('company-dashboard-template');
  app.appendChild(view);
  bindRouteButtons();

  document.getElementById('companyGreeting').textContent = `Olá, ${company.name}`;

  const ownJobs = state.jobs.filter((job) => job.companyId === company.id);
  const ownApplications = state.applications.filter((application) =>
    ownJobs.some((job) => job.id === application.jobId)
  );

  document.getElementById('companyJobsCount').textContent = String(ownJobs.length);
  document.getElementById('companyApplicantsCount').textContent = String(ownApplications.length);

  const jobForm = document.getElementById('jobForm');
  jobForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = new FormData(jobForm);

    const job = {
      id: crypto.randomUUID(),
      companyId: company.id,
      companyName: company.name,
      jobType: form.get('jobType').toString().trim(),
      dailyRate: Number(form.get('dailyRate')),
      paymentDate: form.get('paymentDate').toString(),
      location: form.get('location').toString().trim(),
      placeType: form.get('placeType').toString(),
      createdAt: new Date().toISOString()
    };

    state.jobs.unshift(job);
    persist();
    render();
    showToast('Demanda publicada com sucesso.');
  });

  const list = document.getElementById('companyJobsList');
  if (!ownJobs.length) {
    list.innerHTML = `<div class="empty-state">Você ainda não publicou nenhuma demanda.</div>`;
    return;
  }

  ownJobs
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .forEach((job) => {
      const card = cloneTemplate('company-job-card-template');
      const applications = state.applications.filter((item) => item.jobId === job.id);

      card.querySelector('.job-title').textContent = job.jobType;
      card.querySelector('.job-company').textContent = `${company.segment} • ${job.location}`;
      card.querySelector('.job-place').textContent = job.placeType;
      card.querySelector('.job-meta').appendChild(buildMetaGrid(job));

      const applicantsBox = card.querySelector('.applicants-box');
      if (!applications.length) {
        applicantsBox.innerHTML = `<div class="empty-state">Nenhum candidato inscrito nesta demanda.</div>`;
      } else {
        applicantsBox.innerHTML = '<h4>Candidatos inscritos</h4>';
        applications.forEach((application) => {
          const candidate = state.candidates.find((item) => item.id === application.candidateId);
          if (!candidate) return;
          const item = document.createElement('article');
          item.className = 'applicant-item';
          item.innerHTML = `
            <strong>${candidate.name}</strong>
            <span>CPF: ${candidate.cpf}</span>
            <span>RG: ${candidate.rg}</span>
            <span>Endereço: ${candidate.address}</span>
            <span>CEP: ${candidate.cep}</span>
            <span>E-mail: ${candidate.email}</span>
            <span>WhatsApp: ${candidate.whatsapp}</span>
          `;
          applicantsBox.appendChild(item);
        });
      }

      list.appendChild(card);
    });
}

function buildMetaGrid(job) {
  const wrap = document.createElement('div');
  wrap.className = 'meta-grid';

  const fields = [
    { label: 'Valor diária', value: formatMoney(job.dailyRate) },
    { label: 'Pagamento', value: formatDate(job.paymentDate) },
    { label: 'Local', value: job.location },
    { label: 'Publicado', value: new Date(job.createdAt).toLocaleDateString('pt-BR') }
  ];

  fields.forEach((field) => {
    const item = document.createElement('div');
    item.className = 'meta-item';
    item.innerHTML = `<small>${field.label}</small><strong>${field.value}</strong>`;
    wrap.appendChild(item);
  });

  return wrap;
}

function bindRouteButtons() {
  app.querySelectorAll('[data-route]').forEach((button) => {
    button.addEventListener('click', () => setRoute(button.dataset.route));
  });
}

logoutBtn.addEventListener('click', () => {
  state.session = null;
  persist();
  setRoute('home');
  showToast('Sessão encerrada.');
});

render();
