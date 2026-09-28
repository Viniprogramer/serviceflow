import { useEffect, useMemo, useState } from 'react';

const API = 'http://localhost:4000/api';
const TOKEN_KEY = 'serviceflow_token';

const copy = {
  en: {
    title: 'ServiceFlow',
    subtitle: 'Service Order Management Platform',
    language: 'Language',
    tabs: ['Overview', 'Clients', 'Technicians', 'Services', 'Equipment', 'Work Orders'],
    create: 'Create',
    description: 'Description',
    open: 'Open',
    progress: 'In Progress',
    done: 'Completed',
    canceled: 'Canceled',
    addPhoto: 'Add Photo',
    kpis: ['Clients', 'Technicians', 'Open Orders', 'Completed'],
    loginTitle: 'Access ServiceFlow',
    loginSubtitle: 'Use your company account to manage service operations.',
    email: 'Email',
    password: 'Password',
    name: 'Name',
    login: 'Login',
    register: 'Create account',
    switchToRegister: 'Need an account?',
    switchToLogin: 'Already have an account?',
    logout: 'Logout',
  },
  'pt-BR': {
    title: 'ServiceFlow',
    subtitle: 'Plataforma de Gestão de Ordens de Serviço',
    language: 'Idioma',
    tabs: ['Visão Geral', 'Clientes', 'Técnicos', 'Serviços', 'Equipamentos', 'Ordens de Serviço'],
    create: 'Criar',
    description: 'Descrição',
    open: 'Aberta',
    progress: 'Em Andamento',
    done: 'Concluída',
    canceled: 'Cancelada',
    addPhoto: 'Adicionar Foto',
    kpis: ['Clientes', 'Técnicos', 'Ordens Abertas', 'Concluídas'],
    loginTitle: 'Acessar ServiceFlow',
    loginSubtitle: 'Use sua conta empresarial para gerenciar operações de serviço.',
    email: 'Email',
    password: 'Senha',
    name: 'Nome',
    login: 'Entrar',
    register: 'Criar conta',
    switchToRegister: 'Precisa de uma conta?',
    switchToLogin: 'Já possui uma conta?',
    logout: 'Sair',
  }
};

const statusOptions = ['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELED'];

const statusLabel = (status, locale) => {
  const t = copy[locale];
  if (status === 'OPEN') return t.open;
  if (status === 'IN_PROGRESS') return t.progress;
  if (status === 'COMPLETED') return t.done;
  return t.canceled;
};

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function req(path, init = {}) {
  const token = getToken();
  const headers = {
    ...(init.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(init.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${API}${path}`, { ...init, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export default function App() {
  const [locale, setLocale] = useState('en');
  const [tab, setTab] = useState(0);
  const [profile, setProfile] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [authError, setAuthError] = useState('');
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '', role: 'TECH' });

  const [clients, setClients] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [services, setServices] = useState([]);
  const [equipments, setEquipments] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);

  const [newClient, setNewClient] = useState({ name: '', contact: '', phone: '' });
  const [newTech, setNewTech] = useState({ name: '', specialty: '' });
  const [newService, setNewService] = useState({ title: '', basePrice: '' });
  const [newEquipment, setNewEquipment] = useState({ clientId: '', name: '', serialNumber: '' });
  const [newOrder, setNewOrder] = useState({ clientId: '', technicianId: '', serviceId: '', equipmentId: '', description: '', status: 'OPEN' });

  const t = copy[locale];

  const openOrders = useMemo(() => workOrders.filter((o) => o.status !== 'COMPLETED' && o.status !== 'CANCELED').length, [workOrders]);
  const doneOrders = useMemo(() => workOrders.filter((o) => o.status === 'COMPLETED').length, [workOrders]);

  async function loadAll() {
    const [c, te, se, eq, wo, me] = await Promise.all([
      req('/clients'), req('/technicians'), req('/services'), req('/equipments'), req('/work-orders'), req('/auth/me')
    ]);
    setClients(c);
    setTechnicians(te);
    setServices(se);
    setEquipments(eq);
    setWorkOrders(wo);
    setProfile(me.user);
  }

  useEffect(() => {
    if (getToken()) {
      loadAll().catch(() => {
        clearToken();
        setProfile(null);
      });
    }
  }, []);

  async function submitAuth() {
    setAuthError('');
    try {
      const path = authMode === 'login' ? '/auth/login' : '/auth/register';
      const email = authForm.email.trim().toLowerCase();
      const password = authForm.password.trim();
      const name = authForm.name.trim();
      const payload = authMode === 'login'
        ? { email, password }
        : { name, email, password, role: authForm.role };

      const data = await req(path, { method: 'POST', body: JSON.stringify(payload) });
      setToken(data.token);
      await loadAll();
      setAuthForm({ name: '', email: '', password: '', role: 'TECH' });
    } catch (error) {
      setAuthError(error.message);
    }
  }

  async function create(path, payload, reset) {
    await req(path, { method: 'POST', body: JSON.stringify(payload) });
    reset();
    await loadAll();
  }

  async function updateStatus(orderId, status) {
    await req(`/work-orders/${orderId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
    await loadAll();
  }

  async function addPhoto(orderId) {
    const form = new FormData();
    form.append('fileName', `photo-${Date.now()}.jpg`);
    await req(`/work-orders/${orderId}/photos`, { method: 'POST', body: form });
    await loadAll();
  }

  function logout() {
    clearToken();
    setProfile(null);
    setTab(0);
  }

  if (!profile) {
    return (
      <div className="app-shell">
        <header className="topbar">
          <div>
            <h1>{t.title}</h1>
            <p>{t.subtitle}</p>
          </div>
          <label className="lang-switch">
            {t.language}
            <select value={locale} onChange={(e) => setLocale(e.target.value)}>
              <option value="en">English</option>
              <option value="pt-BR">Português (BR)</option>
            </select>
          </label>
        </header>

        <main className="panel auth-panel">
          <h2>{t.loginTitle}</h2>
          <p>{t.loginSubtitle}</p>

          {authMode === 'register' && (
            <input placeholder={t.name} value={authForm.name} onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })} />
          )}
          <input placeholder={t.email} value={authForm.email} onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })} />
          <input type="password" placeholder={t.password} value={authForm.password} onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })} />

          {authMode === 'register' && (
            <select value={authForm.role} onChange={(e) => setAuthForm({ ...authForm, role: e.target.value })}>
              <option value="TECH">TECH</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          )}

          {authError && <p className="error-text">{authError}</p>}

          <button onClick={submitAuth}>{authMode === 'login' ? t.login : t.register}</button>
          <button className="ghost-btn" onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}>
            {authMode === 'login' ? t.switchToRegister : t.switchToLogin}
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <h1>{t.title}</h1>
          <p>{t.subtitle}</p>
          <small>{profile.name} • {profile.role}</small>
        </div>
        <div className="header-actions">
          <label className="lang-switch">
            {t.language}
            <select value={locale} onChange={(e) => setLocale(e.target.value)}>
              <option value="en">English</option>
              <option value="pt-BR">Português (BR)</option>
            </select>
          </label>
          <button className="logout-btn" onClick={logout}>{t.logout}</button>
        </div>
      </header>

      <section className="kpis">
        <Kpi label={t.kpis[0]} value={clients.length} />
        <Kpi label={t.kpis[1]} value={technicians.length} />
        <Kpi label={t.kpis[2]} value={openOrders} />
        <Kpi label={t.kpis[3]} value={doneOrders} />
      </section>

      <nav className="tabs">
        {t.tabs.map((item, index) => (
          <button key={item} className={tab === index ? 'active' : ''} onClick={() => setTab(index)}>{item}</button>
        ))}
      </nav>

      <main className="panel">
        {tab === 0 && <Overview workOrders={workOrders} locale={locale} />}

        {tab === 1 && (
          <EntityBlock
            title={t.tabs[1]}
            form={
              <>
                <input placeholder="Name" value={newClient.name} onChange={(e) => setNewClient({ ...newClient, name: e.target.value })} />
                <input placeholder="Contact" value={newClient.contact} onChange={(e) => setNewClient({ ...newClient, contact: e.target.value })} />
                <input placeholder="Phone" value={newClient.phone} onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })} />
                <button onClick={() => create('/clients', newClient, () => setNewClient({ name: '', contact: '', phone: '' }))}>{t.create}</button>
              </>
            }
            list={clients.map((c) => `${c.name} • ${c.contact} • ${c.phone}`)}
          />
        )}

        {tab === 2 && (
          <EntityBlock
            title={t.tabs[2]}
            form={
              <>
                <input placeholder="Name" value={newTech.name} onChange={(e) => setNewTech({ ...newTech, name: e.target.value })} />
                <input placeholder="Specialty" value={newTech.specialty} onChange={(e) => setNewTech({ ...newTech, specialty: e.target.value })} />
                <button onClick={() => create('/technicians', newTech, () => setNewTech({ name: '', specialty: '' }))}>{t.create}</button>
              </>
            }
            list={technicians.map((x) => `${x.name} • ${x.specialty}`)}
          />
        )}

        {tab === 3 && (
          <EntityBlock
            title={t.tabs[3]}
            form={
              <>
                <input placeholder="Title" value={newService.title} onChange={(e) => setNewService({ ...newService, title: e.target.value })} />
                <input placeholder="Base Price" value={newService.basePrice} onChange={(e) => setNewService({ ...newService, basePrice: e.target.value })} />
                <button onClick={() => create('/services', { ...newService, basePrice: Number(newService.basePrice) }, () => setNewService({ title: '', basePrice: '' }))}>{t.create}</button>
              </>
            }
            list={services.map((x) => `${x.title} • $${x.basePrice}`)}
          />
        )}

        {tab === 4 && (
          <EntityBlock
            title={t.tabs[4]}
            form={
              <>
                <select value={newEquipment.clientId} onChange={(e) => setNewEquipment({ ...newEquipment, clientId: e.target.value })}>
                  <option value="">Client</option>
                  {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <input placeholder="Equipment" value={newEquipment.name} onChange={(e) => setNewEquipment({ ...newEquipment, name: e.target.value })} />
                <input placeholder="Serial" value={newEquipment.serialNumber} onChange={(e) => setNewEquipment({ ...newEquipment, serialNumber: e.target.value })} />
                <button onClick={() => create('/equipments', newEquipment, () => setNewEquipment({ clientId: '', name: '', serialNumber: '' }))}>{t.create}</button>
              </>
            }
            list={equipments.map((x) => `${x.name} • ${x.serialNumber}`)}
          />
        )}

        {tab === 5 && (
          <section className="entity-grid">
            <h2>{t.tabs[5]}</h2>
            <div className="inline-form">
              <select value={newOrder.clientId} onChange={(e) => setNewOrder({ ...newOrder, clientId: e.target.value })}>
                <option value="">Client</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <select value={newOrder.technicianId} onChange={(e) => setNewOrder({ ...newOrder, technicianId: e.target.value })}>
                <option value="">Technician</option>
                {technicians.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
              </select>
              <select value={newOrder.serviceId} onChange={(e) => setNewOrder({ ...newOrder, serviceId: e.target.value })}>
                <option value="">Service</option>
                {services.map((x) => <option key={x.id} value={x.id}>{x.title}</option>)}
              </select>
              <select value={newOrder.equipmentId} onChange={(e) => setNewOrder({ ...newOrder, equipmentId: e.target.value })}>
                <option value="">Equipment</option>
                {equipments.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
              </select>
              <input placeholder={t.description} value={newOrder.description} onChange={(e) => setNewOrder({ ...newOrder, description: e.target.value })} />
              <button onClick={() => create('/work-orders', newOrder, () => setNewOrder({ clientId: '', technicianId: '', serviceId: '', equipmentId: '', description: '', status: 'OPEN' }))}>{t.create}</button>
            </div>

            <div className="order-list">
              {workOrders.map((order) => (
                <article key={order.id} className="order-card">
                  <div className="order-head">
                    <h3>#{order.id.slice(0, 8)} • {order.description || 'Service order'}</h3>
                    <span className={`badge ${order.status.toLowerCase()}`}>{statusLabel(order.status, locale)}</span>
                  </div>
                  <p>{new Date(order.createdAt).toLocaleString()}</p>
                  <div className="order-actions">
                    <select value={order.status} onChange={(e) => updateStatus(order.id, e.target.value)}>
                      {statusOptions.map((s) => <option key={s} value={s}>{statusLabel(s, locale)}</option>)}
                    </select>
                    <button onClick={() => addPhoto(order.id)}>{t.addPhoto}</button>
                  </div>
                  <small>Photos: {order.photos.length}</small>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function Kpi({ label, value }) {
  return (
    <article className="kpi-card">
      <p>{label}</p>
      <strong>{value}</strong>
    </article>
  );
}

function EntityBlock({ title, form, list }) {
  return (
    <section className="entity-grid">
      <h2>{title}</h2>
      <div className="inline-form">{form}</div>
      <ul className="entity-list">
        {list.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}
      </ul>
    </section>
  );
}

function Overview({ workOrders, locale }) {
  return (
    <section className="entity-grid">
      <h2>{locale === 'en' ? 'Operations Snapshot' : 'Resumo de Operações'}</h2>
      <div className="order-list">
        {workOrders.map((order) => (
          <article key={order.id} className="order-card">
            <div className="order-head">
              <h3>Order #{order.id.slice(0, 8)}</h3>
              <span className={`badge ${order.status.toLowerCase()}`}>{statusLabel(order.status, locale)}</span>
            </div>
            <p>{order.description || '-'}</p>
            <small>{new Date(order.createdAt).toLocaleString()}</small>
          </article>
        ))}
      </div>
    </section>
  );
}
