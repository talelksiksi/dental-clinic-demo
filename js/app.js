/* ═══════════════════════════════════════════
   Dental Clinic par CICTNA RDC — Application principale (FR)
   ═══════════════════════════════════════════ */
'use strict';

/* ── Palette de couleurs pour les avatars ── */
const COLORS = ['#3d6d78','#2f5a46','#c4805a','#1f2e2f','#5a8f9b','#5f8a6c','#a0674a','#46636a'];
const colorFor = str => COLORS[(str||'').split('').reduce((a,c)=>a+c.charCodeAt(0),0) % COLORS.length];

/* ══════════════════════════════════════════
   DB — Couche localStorage
══════════════════════════════════════════ */
const DB = {
  get(k)      { try { return JSON.parse(localStorage.getItem('dc_'+k)) || []; } catch { return []; } },
  set(k,v)    { localStorage.setItem('dc_'+k, JSON.stringify(v)); },
  nextId(k)   { const n=(parseInt(localStorage.getItem('dc_id_'+k)||'0')+1); localStorage.setItem('dc_id_'+k,n); return n; },
  patients()     { return this.get('patients'); },
  appointments() { return this.get('appointments'); },
  treatments()   { return this.get('treatments'); },
  payments()     { return this.get('payments'); },
  staff()        { return this.get('staff'); },
  settings()     { try { return JSON.parse(localStorage.getItem('dc_settings'))||{}; } catch { return {}; } },
  activity()     { return this.get('activity'); },
  savePatients(d)     { this.set('patients',d); },
  saveAppointments(d) { this.set('appointments',d); },
  saveTreatments(d)   { this.set('treatments',d); },
  savePayments(d)     { this.set('payments',d); },
  saveStaff(d)        { this.set('staff',d); },
  saveSettings(d)     { localStorage.setItem('dc_settings', JSON.stringify(d)); },
  logActivity(type, text) {
    const acts = this.activity();
    acts.unshift({ type, text, time: new Date().toISOString() });
    this.set('activity', acts.slice(0,40));
  }
};

/* ══════════════════════════════════════════
   DONNÉES D'EXEMPLE
══════════════════════════════════════════ */
function seedData() {
  if (DB.get('seeded').length) return;

  DB.set('staff',[
    {id:1,firstName:'Sarah',   lastName:'Mitchell',  role:'Dentiste',             phone:'+213 555 010 001',email:'s.mitchell@dental-clinic.example',license:'CD-10023',exp:12,notes:'Dentisterie cosmétique et Invisalign.'},
    {id:2,firstName:'Karim',   lastName:'Boukhalfa', role:'Orthodontiste',         phone:'+213 555 010 002',email:'k.boukhalfa@dental-clinic.example',license:'CD-10045',exp:8, notes:'Appareils, gouttières et corrections d\'occlusion.'},
    {id:3,firstName:'Aïcha',   lastName:'Bensalem',  role:'Chirurgien oral',       phone:'+213 555 010 003',email:'a.bensalem@dental-clinic.example', license:'CD-10067',exp:15,notes:'Implants, extractions, greffes osseuses.'},
    {id:4,firstName:'Yacine',  lastName:'Mahieddine', role:'Endodontiste',         phone:'+213 555 010 004',email:'y.mahieddine@dental-clinic.example',license:'CD-10089',exp:6, notes:'Spécialiste en traitement canalaire.'},
    {id:5,firstName:'Leila',   lastName:'Cherif',    role:'Hygiéniste dentaire',   phone:'+213 555 010 005',email:'l.cherif@dental-clinic.example',   license:'HD-2034', exp:5, notes:'Détartrage, prophylaxie et éducation du patient.'},
    {id:6,firstName:'Mehdi',   lastName:'Lahrech',   role:'Réceptionniste',        phone:'+213 555 010 006',email:'m.lahrech@dental-clinic.example',  license:'',        exp:3, notes:'Accueil et prise en charge administrative.'},
  ]);
  localStorage.setItem('dc_id_staff','6');

  DB.set('patients',[
    {id:1,firstName:'Amina',   lastName:'Boudjemaa', dob:'1985-03-22',gender:'Féminin',   phone:'+213 555 301 001',email:'amina.b@email.dz',   address:'45 Rue Didouche, Alger',        bloodType:'A+', occupation:'Enseignante', referredBy:'Dr. Benamar',patientSince:'2020-01-15',allergies:'Pénicilline',          medications:'Aucun',          conditions:'Anxiété légère',                     dentalHistory:'Deux obturations en 2019',          smoker:'Non',lastVisit:'2024-11-10',notes:'Préfère les rendez-vous le matin.',emergencyName:'Omar Boudjemaa',   emergencyPhone:'+213 555 901 001',emergencyRelation:'Époux',   emergencyEmail:'',createdAt:'2020-01-15T09:00:00Z'},
    {id:2,firstName:'Sofiane', lastName:'Meziani',   dob:'1978-07-14',gender:'Masculin',  phone:'+213 555 301 002',email:'s.meziani@email.dz',  address:'12 Bd Krim Belkacem, Oran',     bloodType:'O+', occupation:'Ingénieur',   referredBy:'',           patientSince:'2021-03-10',allergies:'Latex',               medications:'Lisinopril 10mg',conditions:'Hypertension, Diabète type 2',        dentalHistory:'Traitement canalaire #14 en 2020',  smoker:'Non',lastVisit:'2024-12-01',notes:'Vérifier la tension avant les soins.', emergencyName:'Nadia Meziani',    emergencyPhone:'+213 555 901 002',emergencyRelation:'Épouse',  emergencyEmail:'',createdAt:'2021-03-10T10:00:00Z'},
    {id:3,firstName:'Yasmine', lastName:'Khelifa',   dob:'1995-11-30',gender:'Féminin',   phone:'+213 555 301 003',email:'yasmine.k@email.dz',  address:'88 Cité Universitaire, Constantine',bloodType:'B+',occupation:'Infirmière',referredBy:'Amina Boudjemaa',patientSince:'2022-06-20',allergies:'Aucune',           medications:'Aucun',          conditions:'Aucune',                             dentalHistory:'Appareil orthodontique adolescence',smoker:'Non',lastVisit:'2025-01-15',notes:'Très bonne compliance.',                emergencyName:'Hamid Khelifa',    emergencyPhone:'+213 555 901 003',emergencyRelation:'Père',    emergencyEmail:'',createdAt:'2022-06-20T11:00:00Z'},
    {id:4,firstName:'Noureddine',lastName:'Sahraoui',dob:'1962-04-08',gender:'Masculin',  phone:'+213 555 301 004',email:'n.sahraoui@email.dz', address:'33 Rue des Frères Abbas, Annaba',bloodType:'AB+',occupation:'Retraité',  referredBy:'',           patientSince:'2019-09-05',allergies:'Aspirine, Sulfamides', medications:'Warfarine, Metformine, Atorvastatine',conditions:'Cardiopathie, Diabète, Hypertension',dentalHistory:'Plusieurs extractions, prothèse partielle haute',smoker:'Oui',lastVisit:'2024-10-20',notes:'Warfarine — vérifier l\'INR avant extraction.',emergencyName:'Houria Sahraoui',emergencyPhone:'+213 555 901 004',emergencyRelation:'Épouse',  emergencyEmail:'',createdAt:'2019-09-05T08:00:00Z'},
    {id:5,firstName:'Rania',   lastName:'Belhocine', dob:'2001-08-19',gender:'Féminin',   phone:'+213 555 301 005',email:'rania.b@email.dz',    address:'71 Cité Djamel, Skikda',        bloodType:'O-', occupation:'Étudiante',  referredBy:'Yasmine Khelifa',patientSince:'2023-02-14',allergies:'Aucune',           medications:'Aucun',          conditions:'Aucune',                             dentalHistory:'Aucun antécédent dentaire',          smoker:'Non',lastVisit:'2025-02-28',notes:'Première patiente, légère anxiété dentaire.',emergencyName:'Samira Belhocine',emergencyPhone:'+213 555 901 005',emergencyRelation:'Mère',    emergencyEmail:'',createdAt:'2023-02-14T14:00:00Z'},
    {id:6,firstName:'Tarek',   lastName:'Guettafi',  dob:'1970-12-03',gender:'Masculin',  phone:'+213 555 301 006',email:'t.guettafi@email.dz',  address:'19 Rue Mokhtar Khalef, Batna',  bloodType:'A-', occupation:'Comptable',  referredBy:'',           patientSince:'2020-11-22',allergies:'Codéine',             medications:'Aucun',          conditions:'Aucune',                             dentalHistory:'Couronne sur #30 en 2021',           smoker:'Non',lastVisit:'2025-01-08',notes:'',emergencyName:'Sabrina Guettafi',emergencyPhone:'+213 555 901 006',emergencyRelation:'Épouse',  emergencyEmail:'',createdAt:'2020-11-22T13:00:00Z'},
  ]);
  localStorage.setItem('dc_id_patients','6');

  const today     = new Date();
  const fmt       = d => d.toISOString().split('T')[0];
  const td        = fmt(today);
  const tomorrow  = fmt(new Date(today.getTime()+86400000));
  const yesterday = fmt(new Date(today.getTime()-86400000));

  DB.set('appointments',[
    {id:1,patientId:1,dentistId:1,date:td,       time:'09:00',duration:30, service:'Bilan & Détartrage',           status:'Confirmé',  notes:'Bilan annuel',                         reminder:'1day',  createdAt:new Date().toISOString()},
    {id:2,patientId:2,dentistId:4,date:td,       time:'10:30',duration:60, service:'Traitement canalaire',          status:'En cours',  notes:'Dent #19, 2ème séance',                reminder:'none',  createdAt:new Date().toISOString()},
    {id:3,patientId:3,dentistId:1,date:td,       time:'14:00',duration:45, service:'Obturation composite',          status:'Planifié',  notes:'Carie sur #12',                        reminder:'2hours',createdAt:new Date().toISOString()},
    {id:4,patientId:4,dentistId:3,date:td,       time:'15:30',duration:90, service:'Extraction dentaire',           status:'Planifié',  notes:'Extraction #16 — vérifier Warfarine',  reminder:'1day',  createdAt:new Date().toISOString()},
    {id:5,patientId:5,dentistId:5,date:tomorrow, time:'09:30',duration:30, service:'Bilan & Détartrage',            status:'Planifié',  notes:'Première séance de détartrage',         reminder:'1day',  createdAt:new Date().toISOString()},
    {id:6,patientId:6,dentistId:1,date:tomorrow, time:'11:00',duration:45, service:'Pose de couronne',               status:'Confirmé',  notes:'Couronne définitive sur #30',           reminder:'2hours',createdAt:new Date().toISOString()},
    {id:7,patientId:1,dentistId:2,date:yesterday,time:'10:00',duration:60, service:'Consultation orthodontique',    status:'Terminé',   notes:'Discussion Invisalign',                 reminder:'none',  createdAt:new Date().toISOString()},
    {id:8,patientId:2,dentistId:4,date:yesterday,time:'14:30',duration:60, service:'Traitement canalaire',          status:'Terminé',   notes:'1ère séance',                           reminder:'none',  createdAt:new Date().toISOString()},
  ]);
  localStorage.setItem('dc_id_appointments','8');

  DB.set('treatments',[
    {id:1,patientId:1,dentistId:5,date:yesterday,    teeth:['11','12','21','22','31','41'],procedure:'Détartrage & Polissage',  description:'Prophylaxie complète, tartre léger',                   notes:'Bonne hygiène bucco-dentaire.',               followup:'Brossage 2x/jour, fil dentaire 1x/jour.',       cost:120, status:'Terminé',  createdAt:new Date().toISOString()},
    {id:2,patientId:2,dentistId:4,date:yesterday,    teeth:['19'],           procedure:'Traitement canalaire',    description:'Préparation biomécanique et obturation de la #19',     notes:'3 canaux. Patient bien toléré.',               followup:'Ibuprofène 400mg si douleur. Retour dans 2 sem.', cost:9500,status:'En cours', createdAt:new Date().toISOString()},
    {id:3,patientId:3,dentistId:1,date:fmt(new Date(today.getTime()-7*86400000)),  teeth:['12'],procedure:'Obturation composite',  description:'Restauration composite classe II',                     notes:'Carie MO, teinte A2.',                         followup:'Éviter les aliments durs pendant 24h.',          cost:1800,status:'Terminé',  createdAt:new Date().toISOString()},
    {id:4,patientId:6,dentistId:1,date:fmt(new Date(today.getTime()-14*86400000)), teeth:['30'],procedure:'Préparation de couronne',description:'Préparation couronne céramique intégrale, temporaire posée',notes:'Préparation sous digue. Temporaire collée.',followup:'Éviter les aliments collants. Retour dans 2 sem.',cost:7500,status:'Terminé',  createdAt:new Date().toISOString()},
    {id:5,patientId:4,dentistId:3,date:fmt(new Date(today.getTime()-30*86400000)), teeth:['14','15'],procedure:'Extraction chirurgicale',description:'Extraction chirurgicale #14 et #15',               notes:'INR 2,1 — dans les limites. Hémostase obtenue.',followup:'Compresse 30 min. Alimentation molle 3 j. Amoxicilline 500mg x7.',cost:4200,status:'Terminé',createdAt:new Date().toISOString()},
  ]);
  localStorage.setItem('dc_id_treatments','5');

  DB.set('payments',[
    {id:1,patientId:1,date:yesterday,   dueDate:'',method:'Espèces',        status:'Payé',       paidAmount:120,  discount:0,notes:'',invoiceNumber:'FAC-001',items:[{description:'Détartrage & Polissage',amount:120}],  createdAt:new Date().toISOString()},
    {id:2,patientId:2,date:yesterday,   dueDate:fmt(new Date(today.getTime()+14*86400000)),method:'Assurance',status:'Partiel',paidAmount:5000,discount:0,notes:'Dossier assurance soumis.',invoiceNumber:'FAC-002',items:[{description:'Traitement canalaire - Séance 1',amount:9500}],createdAt:new Date().toISOString()},
    {id:3,patientId:3,date:fmt(new Date(today.getTime()-7*86400000)), dueDate:'',method:'Espèces', status:'Payé',paidAmount:1800,discount:0,notes:'',invoiceNumber:'FAC-003',items:[{description:'Obturation composite #12',amount:1800}],createdAt:new Date().toISOString()},
    {id:4,patientId:6,date:fmt(new Date(today.getTime()-14*86400000)),dueDate:td,method:'Carte de débit',status:'Partiel',paidAmount:4000,discount:5,notes:'Solde dû à la pose de couronne.',invoiceNumber:'FAC-004',items:[{description:'Préparation couronne',amount:7500},{description:'Couronne provisoire',amount:800}],createdAt:new Date().toISOString()},
    {id:5,patientId:4,date:fmt(new Date(today.getTime()-30*86400000)),dueDate:'',method:'Espèces',status:'Payé',paidAmount:4200,discount:0,notes:'',invoiceNumber:'FAC-005',items:[{description:'Extraction chirurgicale #14',amount:2100},{description:'Extraction chirurgicale #15',amount:2100}],createdAt:new Date().toISOString()},
  ]);
  localStorage.setItem('dc_id_payments','5');
  localStorage.setItem('dc_id_invoices','5');

  DB.set('seeded',[true]);
}

/* ══════════════════════════════════════════
   UTILITAIRES
══════════════════════════════════════════ */
const Utils = {
  formatDate(iso) {
    if (!iso) return '—';
    const d = new Date(iso+(iso.length===10?'T00:00:00':''));
    return d.toLocaleDateString('fr-FR',{day:'numeric',month:'short',year:'numeric'});
  },
  age(dob) {
    if (!dob) return '—';
    return Math.floor((Date.now()-new Date(dob+'T00:00:00').getTime())/(365.25*24*3600*1000));
  },
  currency(n) {
    return parseFloat(n||0).toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2})+' €';
  },
  patientName(id) {
    const p = DB.patients().find(x=>x.id==id);
    return p ? p.firstName+' '+p.lastName : 'Inconnu';
  },
  dentistName(id) {
    const s = DB.staff().find(x=>x.id==id);
    return s ? 'Dr '+s.firstName+' '+s.lastName : 'Inconnu';
  },
  statusBadge(status) {
    const map = {
      'Planifié':'planifie','Confirmé':'confirme','En cours':'en-cours',
      'Terminé':'termine','Annulé':'annule','Absent':'absent',
      'Payé':'paye','En attente':'en-attente','Partiel':'partiel','En retard':'en-retard'
    };
    return `<span class="badge badge-${map[status]||'planifie'}">${status}</span>`;
  },
  today() { return new Date().toISOString().split('T')[0]; },
  timeAgo(iso) {
    const diff = Date.now()-new Date(iso).getTime();
    if (diff<60000)    return 'à l\'instant';
    if (diff<3600000)  return Math.floor(diff/60000)+'min';
    if (diff<86400000) return Math.floor(diff/3600000)+'h';
    return Math.floor(diff/86400000)+'j';
  }
};

/* ══════════════════════════════════════════
   APP — navigation, modales, global
══════════════════════════════════════════ */
const App = {
  currentPage:      'dashboard',
  currentPatientId: null,

  init() {
    if (window.Chart) { Chart.defaults.font.family = "'Archivo', system-ui, sans-serif"; Chart.defaults.color = '#4a5a5b'; }
    seedData();
    this._bindLogin();
    this._bindNav();
    this._bindSearch();
    this._bindMobileMenu();
    this._bindModalTabs();
    this._bindPatientDetailTabs();
    document.getElementById('topbar-date').textContent =
      new Date().toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  },

  _bindLogin() {
    document.querySelectorAll('.role-btn').forEach(btn=>btn.addEventListener('click',()=>{
      document.querySelectorAll('.role-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
    }));
    document.getElementById('login-form').addEventListener('submit',e=>{
      e.preventDefault();
      const role = document.querySelector('.role-btn.active')?.dataset.role||'admin';
      const user = document.getElementById('login-user').value||'Admin';
      this._login(user,role);
    });
  },

  _login(username, role) {
    document.getElementById('login-screen').style.display='none';
    document.getElementById('app').classList.remove('hidden');
    const name = username.charAt(0).toUpperCase()+username.slice(1);
    document.getElementById('sidebar-user-name').textContent = name;
    document.getElementById('sidebar-user-role').textContent = ({admin:'Administrateur',dentist:'Dentiste',receptionist:'Réceptionniste'})[role]||role;
    document.getElementById('sidebar-avatar').textContent = name[0].toUpperCase();
    document.getElementById('greeting-name').textContent = name;
    const h = new Date().getHours();
    document.getElementById('greeting-time').textContent = h<12?'Bonjour':h<17?'Bon après-midi':'Bonsoir';
    document.getElementById('logout-btn').addEventListener('click',()=>{
      document.getElementById('login-screen').style.display='';
      document.getElementById('app').classList.add('hidden');
    });
    this.navigate('dashboard');
    this.updateBadges();
  },

  _bindNav() {
    document.querySelectorAll('.nav-item[data-page]').forEach(item=>{
      item.addEventListener('click',e=>{
        e.preventDefault();
        this.navigate(item.dataset.page);
        this.closeMobileSidebar();
      });
    });
    document.getElementById('sidebar-toggle').addEventListener('click',()=>{
      document.getElementById('sidebar').classList.toggle('collapsed');
    });
  },

  _bindMobileMenu() {
    document.getElementById('mobile-menu-btn').addEventListener('click',()=>{
      document.getElementById('sidebar').classList.add('mobile-open');
      document.getElementById('sidebar-overlay').classList.add('visible');
    });
  },

  closeMobileSidebar() {
    document.getElementById('sidebar').classList.remove('mobile-open');
    document.getElementById('sidebar-overlay').classList.remove('visible');
  },

  _bindModalTabs() {
    document.addEventListener('click',e=>{
      const btn = e.target.closest('.modal-tab[data-mtab]');
      if (!btn) return;
      const body = btn.closest('.modal-body');
      body.querySelectorAll('.modal-tab').forEach(b=>b.classList.remove('active'));
      body.querySelectorAll('.modal-tab-content').forEach(c=>c.classList.remove('active'));
      btn.classList.add('active');
      body.querySelector('#'+btn.dataset.mtab)?.classList.add('active');
    });
  },

  _bindPatientDetailTabs() {
    document.addEventListener('click',e=>{
      const btn = e.target.closest('.tab[data-tab]');
      if (!btn) return;
      const wrap = btn.closest('.patient-detail-main');
      if (!wrap) return;
      wrap.querySelectorAll('.tab').forEach(b=>b.classList.remove('active'));
      wrap.querySelectorAll('.tab-content').forEach(c=>c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.tab)?.classList.add('active');
    });
  },

  navigate(page) {
    this.currentPage = page;
    document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
    document.getElementById('page-'+page)?.classList.add('active');
    document.querySelectorAll('.nav-item[data-page]').forEach(n=>n.classList.remove('active'));
    document.querySelector(`.nav-item[data-page="${page}"]`)?.classList.add('active');
    const titles = {
      dashboard:'Tableau de bord', patients:'Patients',
      appointments:'Rendez-vous', treatments:'Traitements & Soins',
      'dental-chart':'Schéma dentaire', payments:'Paiements & Factures',
      reports:'Rapports & Analyses', staff:'Personnel',
      settings:'Paramètres', 'patient-detail':'Fiche patient'
    };
    document.getElementById('topbar-title').textContent = titles[page]||page;

    if (page==='dashboard')    Dashboard.render();
    if (page==='patients')     Patients.render();
    if (page==='appointments') { Appointments.populateFilters(); Appointments.render(); }
    if (page==='treatments')   { Treatments.populateFilters();   Treatments.render(); }
    if (page==='payments')     Payments.render();
    if (page==='reports')      Reports.render();
    if (page==='staff')        Staff.render();
    if (page==='settings')     Settings.render();
    if (page==='dental-chart') DentalChart.init();
  },

  openModal(id) {
    if (id==='modal-add-appointment') Appointments.populateFilters();
    if (id==='modal-add-treatment')   Treatments.populateFilters();
    if (id==='modal-add-payment') {
      const pSel=document.getElementById('pay-patient-id');
      if (pSel) pSel.innerHTML='<option value="">— Sélectionner un patient —</option>'+
        DB.patients().map(p=>`<option value="${p.id}">${p.firstName} ${p.lastName}</option>`).join('');
    }
    document.getElementById('modal-overlay').classList.remove('hidden');
    document.querySelectorAll('.modal').forEach(m=>m.style.display='none');
    const el = document.getElementById(id);
    if (el) el.style.display='flex';
  },

  closeModal(id) {
    const el=document.getElementById(id);
    if (el) el.style.display='none';
    if (!document.querySelector('.modal[style*="flex"]'))
      document.getElementById('modal-overlay').classList.add('hidden');
  },

  closeModalOnOverlay(e) {
    if (e.target===document.getElementById('modal-overlay')) {
      document.querySelectorAll('.modal').forEach(m=>m.style.display='none');
      document.getElementById('modal-overlay').classList.add('hidden');
    }
  },

  confirmDelete(msg,cb) {
    document.getElementById('confirm-delete-msg').textContent = msg;
    document.getElementById('confirm-delete-btn').onclick = ()=>{ cb(); this.closeModal('modal-confirm-delete'); };
    this.openModal('modal-confirm-delete');
  },

  updateBadges() {
    const p  = DB.patients();
    const a  = DB.appointments();
    const pa = DB.payments();
    document.getElementById('nav-badge-patients').textContent = p.length;
    document.getElementById('nav-badge-appts').textContent    = a.filter(x=>x.date===Utils.today()&&!['Annulé','Absent','Terminé'].includes(x.status)).length;
    const pend = pa.filter(x=>['En attente','Partiel','En retard'].includes(x.status));
    document.getElementById('nav-badge-pending').textContent  = pend.length;
    document.getElementById('notif-dot').classList.toggle('visible', pend.length>0);
  },

  openPatient(id) {
    this.currentPatientId = id;
    this.navigate('patient-detail');
    Patients.renderDetail(id);
  },

  toast(msg,type='success') {
    const icons={success:'fa-circle-check',error:'fa-circle-xmark',warning:'fa-triangle-exclamation',info:'fa-circle-info'};
    const el=document.createElement('div');
    el.className=`toast toast-${type}`;
    el.innerHTML=`<i class="fa-solid ${icons[type]||icons.success}"></i> ${msg}`;
    document.getElementById('toast-container').appendChild(el);
    setTimeout(()=>{ el.classList.add('toast-out'); setTimeout(()=>el.remove(),300); },3000);
  },

  _bindSearch() {
    const inp = document.getElementById('global-search');
    const res = document.getElementById('search-results');
    inp.addEventListener('input',()=>{
      const q=inp.value.trim().toLowerCase();
      if (!q) { res.classList.remove('visible'); return; }
      const list = DB.patients().filter(p=>(p.firstName+' '+p.lastName).toLowerCase().includes(q)||(p.phone||'').includes(q)||(p.email||'').toLowerCase().includes(q)).slice(0,5);
      if (!list.length) { res.innerHTML='<div class="search-result-item">Aucun résultat</div>'; res.classList.add('visible'); return; }
      res.innerHTML=list.map(p=>`
        <div class="search-result-item" onclick="App.openPatient(${p.id});document.getElementById('global-search').value='';document.getElementById('search-results').classList.remove('visible')">
          <div class="sr-icon" style="background:${colorFor(p.firstName)}22;color:${colorFor(p.firstName)}">${p.firstName[0]}${p.lastName[0]}</div>
          <div><strong>${p.firstName} ${p.lastName}</strong><br><small style="color:var(--text-muted)">${p.phone||p.email||''}</small></div>
        </div>`).join('');
      res.classList.add('visible');
    });
    document.addEventListener('click',e=>{ if(!e.target.closest('.search-box')) res.classList.remove('visible'); });
  }
};

/* ══════════════════════════════════════════
   TABLEAU DE BORD
══════════════════════════════════════════ */
const Dashboard = {
  charts: {},
  render() {
    const patients   = DB.patients();
    const appts      = DB.appointments();
    const treatments = DB.treatments();
    const payments   = DB.payments();
    const today      = Utils.today();
    const now        = new Date();
    const ms         = new Date(now.getFullYear(),now.getMonth(),1).toISOString().split('T')[0];

    document.getElementById('stat-total-patients').textContent = patients.length;
    document.getElementById('stat-today-appts').textContent    = appts.filter(a=>a.date===today).length;
    const rev = payments.filter(p=>p.date>=ms&&p.status!=='En attente').reduce((s,p)=>s+parseFloat(p.paidAmount||0),0);
    document.getElementById('stat-monthly-revenue').textContent= Utils.currency(rev);
    document.getElementById('stat-pending-payments').textContent= payments.filter(p=>['En attente','Partiel','En retard'].includes(p.status)).length;

    // Planning du jour
    const todayAppts = appts.filter(a=>a.date===today).sort((a,b)=>a.time.localeCompare(b.time));
    const el = document.getElementById('today-schedule-list');
    const dotColor={Planifié:'#94a3b8',Confirmé:'#10b981','En cours':'#f59e0b',Terminé:'#059669',Annulé:'#ef4444',Absent:'#9ca3af'};
    el.innerHTML = todayAppts.length ? todayAppts.map(a=>`
      <div class="schedule-item" onclick="App.navigate('appointments')">
        <div class="schedule-time">${a.time}</div>
        <div class="schedule-dot" style="background:${dotColor[a.status]||'#94a3b8'}"></div>
        <div class="schedule-info">
          <div class="schedule-patient">${Utils.patientName(a.patientId)}</div>
          <div class="schedule-service">${a.service}</div>
        </div>
        <div class="schedule-dentist">${Utils.dentistName(a.dentistId).replace('Dr ','Dr.')}</div>
        ${Utils.statusBadge(a.status)}
      </div>`).join('') : '<div class="empty-state-sm"><i class="fa-solid fa-calendar-xmark"></i> Aucun rendez-vous aujourd\'hui</div>';

    // Activité récente
    const acts = DB.activity();
    const actEl = document.getElementById('recent-activity-list');
    const imap = {appt:'fa-calendar-check',patient:'fa-user-plus',treatment:'fa-syringe',payment:'fa-file-invoice-dollar'};
    actEl.innerHTML = acts.length ? acts.slice(0,8).map(a=>`
      <div class="activity-item">
        <div class="activity-icon ${a.type}"><i class="fa-solid ${imap[a.type]||'fa-circle'}"></i></div>
        <div class="activity-text">${a.text}</div>
        <div class="activity-time">${Utils.timeAgo(a.time)}</div>
      </div>`).join('') : '<div class="empty-state-sm"><i class="fa-solid fa-inbox"></i> Aucune activité récente</div>';

    this._renderRevenueChart(payments);
    const pc={};
    treatments.forEach(t=>{ pc[t.procedure]=(pc[t.procedure]||0)+1; });
    this._renderTreatmentChart(pc);
    App.updateBadges();
  },

  _renderRevenueChart(payments) {
    const months=[],revs=[];
    for (let i=5;i>=0;i--) {
      const d=new Date(); d.setMonth(d.getMonth()-i);
      const k=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      months.push(d.toLocaleDateString('fr-FR',{month:'short'}));
      revs.push(payments.filter(p=>p.date&&p.date.startsWith(k)&&p.status!=='En attente').reduce((s,p)=>s+parseFloat(p.paidAmount||0),0));
    }
    const ctx=document.getElementById('revenue-chart')?.getContext('2d');
    if (!ctx) return;
    if (this.charts.rev) this.charts.rev.destroy();
    this.charts.rev=new Chart(ctx,{
      type:'bar',
      data:{labels:months,datasets:[{label:'Revenu',data:revs,backgroundColor:'rgba(61,109,120,.15)',borderColor:'#3d6d78',borderWidth:2,borderRadius:6,hoverBackgroundColor:'rgba(61,109,120,.3)'}]},
      options:{responsive:true,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,ticks:{callback:v=>v+' €'},grid:{color:'rgba(0,0,0,.04)'}},x:{grid:{display:false}}}}
    });
  },

  _renderTreatmentChart(data) {
    const labels=Object.keys(data), vals=Object.values(data);
    const pal=['#3d6d78','#2f5a46','#e7a982','#1f2e2f','#8fb3ba','#7fa58c','#c4805a','#b8c7c5'];
    const ctx=document.getElementById('treatment-chart')?.getContext('2d');
    const leg=document.getElementById('treatment-legend');
    if (!ctx) return;
    if (this.charts.treat) this.charts.treat.destroy();
    if (!labels.length) { if(leg) leg.innerHTML='<div class="empty-state-sm">Aucun acte enregistré</div>'; return; }
    this.charts.treat=new Chart(ctx,{type:'doughnut',data:{labels,datasets:[{data:vals,backgroundColor:pal.slice(0,labels.length),borderWidth:2,borderColor:'#fff'}]},options:{responsive:true,cutout:'65%',plugins:{legend:{display:false}}}});
    if (leg) leg.innerHTML=labels.map((l,i)=>`<div class="chart-legend-item"><div class="chart-legend-dot" style="background:${pal[i]}"></div><span class="chart-legend-label">${l}</span><span class="chart-legend-value">${vals[i]}</span></div>`).join('');
  }
};

/* ══════════════════════════════════════════
   PATIENTS
══════════════════════════════════════════ */
const Patients = {
  view:'grid',
  render() {
    const list = DB.patients();
    document.getElementById('patients-empty').classList.toggle('hidden', list.length>0);
    this._renderCards(list);
    this._renderTable(list);
  },
  _renderCards(list) {
    const el=document.getElementById('patients-grid');
    el.innerHTML=list.length ? list.map(p=>`
      <div class="patient-card" onclick="App.openPatient(${p.id})">
        <div class="patient-card-avatar" style="background:${colorFor(p.firstName)}">${p.firstName[0]}${p.lastName[0]}</div>
        <div class="patient-card-name">${p.firstName} ${p.lastName}</div>
        <div class="patient-card-id">#${String(p.id).padStart(4,'0')}</div>
        <div class="patient-card-meta">
          <span><i class="fa-solid fa-cake-candles"></i>${Utils.age(p.dob)} ans · ${p.gender||'—'}</span>
          <span><i class="fa-solid fa-phone"></i>${p.phone||'—'}</span>
          ${p.allergies&&p.allergies!=='Aucune'?`<span style="color:var(--danger)"><i class="fa-solid fa-triangle-exclamation"></i>Allergie: ${p.allergies}</span>`:''}
        </div>
        <div class="patient-card-footer">
          <span style="font-size:.75rem;color:var(--text-muted)"><i class="fa-solid fa-droplet"></i> ${p.bloodType||'?'}</span>
          <div class="patient-card-actions" onclick="event.stopPropagation()">
            <button class="icon-btn view" onclick="App.openPatient(${p.id})" title="Voir"><i class="fa-solid fa-eye"></i></button>
            <button class="icon-btn edit" onclick="Patients.edit(${p.id})" title="Modifier"><i class="fa-solid fa-pen"></i></button>
            <button class="icon-btn del"  onclick="Patients.delete(${p.id})" title="Supprimer"><i class="fa-solid fa-trash"></i></button>
          </div>
        </div>
      </div>`).join('') : '<div class="empty-state-sm"><i class="fa-solid fa-user-slash"></i> Aucun patient trouvé</div>';
  },
  _renderTable(list) {
    document.getElementById('patients-table-body').innerHTML=list.length ? list.map(p=>`
      <tr>
        <td><div style="display:flex;align-items:center;gap:.6rem"><div style="width:32px;height:32px;border-radius:50%;background:${colorFor(p.firstName)};color:#fff;display:flex;align-items:center;justify-content:center;font-size:.75rem;font-weight:700">${p.firstName[0]}${p.lastName[0]}</div><div><strong>${p.firstName} ${p.lastName}</strong><br><small style="color:var(--text-muted)">#${String(p.id).padStart(4,'0')}</small></div></div></td>
        <td>${Utils.formatDate(p.dob)}<br><small style="color:var(--text-muted)">${Utils.age(p.dob)} ans</small></td>
        <td>${p.gender||'—'}</td><td>${p.phone||'—'}</td>
        <td><span class="blood-badge">${p.bloodType||'?'}</span></td>
        <td>${Utils.formatDate(p.lastVisit)}</td>
        <td><div class="table-actions"><button class="icon-btn view" onclick="App.openPatient(${p.id})"><i class="fa-solid fa-eye"></i></button><button class="icon-btn edit" onclick="Patients.edit(${p.id})"><i class="fa-solid fa-pen"></i></button><button class="icon-btn del" onclick="Patients.delete(${p.id})"><i class="fa-solid fa-trash"></i></button></div></td>
      </tr>`).join('') : '<tr><td colspan="7" style="text-align:center;padding:2rem;color:var(--text-muted)">Aucun patient trouvé</td></tr>';
  },
  filter() {
    const q=document.getElementById('patient-search').value.toLowerCase();
    const g=document.getElementById('patient-filter-gender').value;
    const b=document.getElementById('patient-filter-blood').value;
    const list=DB.patients().filter(p=>{
      const n=(p.firstName+' '+p.lastName).toLowerCase();
      return (!q||n.includes(q)||(p.phone||'').includes(q)||(p.email||'').toLowerCase().includes(q))&&(!g||p.gender===g)&&(!b||p.bloodType===b);
    });
    this._renderCards(list); this._renderTable(list);
    document.getElementById('patients-empty').classList.toggle('hidden',list.length>0);
  },
  setView(v) {
    this.view=v;
    document.getElementById('patients-grid').classList.toggle('hidden',v!=='grid');
    document.getElementById('patients-table-wrap').classList.toggle('hidden',v!=='list');
    document.getElementById('patients-grid-btn').classList.toggle('active',v==='grid');
    document.getElementById('patients-list-btn').classList.toggle('active',v==='list');
  },
  _clearForm() {
    ['p-first-name','p-last-name','p-dob','p-phone','p-email','p-address','p-occupation',
     'p-referred','p-allergies','p-medications','p-conditions','p-dental-history','p-notes',
     'p-emg-name','p-emg-relation','p-emg-phone','p-emg-email','p-last-visit'].forEach(id=>{
      const el=document.getElementById(id); if(el) el.value='';
    });
    ['p-gender','p-blood','p-smoker'].forEach(id=>{ const el=document.getElementById(id); if(el) el.value=''; });
    document.getElementById('p-since').value=Utils.today();
    document.getElementById('patient-edit-id').value='';
    document.querySelectorAll('#modal-add-patient .modal-tab').forEach((b,i)=>b.classList.toggle('active',i===0));
    document.querySelectorAll('#modal-add-patient .modal-tab-content').forEach((c,i)=>c.classList.toggle('active',i===0));
  },
  edit(id) {
    const p=DB.patients().find(x=>x.id==id);
    if (!p) return;
    this._clearForm();
    document.getElementById('modal-patient-title').innerHTML='<i class="fa-solid fa-pen"></i> Modifier le patient';
    document.getElementById('patient-edit-id').value=p.id;
    const s=(eid,v)=>{ const e=document.getElementById(eid); if(e) e.value=v||''; };
    s('p-first-name',p.firstName); s('p-last-name',p.lastName); s('p-dob',p.dob);
    s('p-phone',p.phone); s('p-email',p.email); s('p-address',p.address);
    s('p-occupation',p.occupation); s('p-referred',p.referredBy);
    s('p-allergies',p.allergies); s('p-medications',p.medications);
    s('p-conditions',p.conditions); s('p-dental-history',p.dentalHistory);
    s('p-notes',p.notes); s('p-since',p.patientSince); s('p-last-visit',p.lastVisit);
    s('p-emg-name',p.emergencyName); s('p-emg-relation',p.emergencyRelation);
    s('p-emg-phone',p.emergencyPhone); s('p-emg-email',p.emergencyEmail);
    document.getElementById('p-gender').value=p.gender||'';
    document.getElementById('p-blood').value=p.bloodType||'';
    document.getElementById('p-smoker').value=p.smoker||'';
    App.openModal('modal-add-patient');
  },
  editCurrent() { if (App.currentPatientId) this.edit(App.currentPatientId); },
  save() {
    const fn=document.getElementById('p-first-name').value.trim();
    const ln=document.getElementById('p-last-name').value.trim();
    const dob=document.getElementById('p-dob').value;
    const ph=document.getElementById('p-phone').value.trim();
    if (!fn||!ln||!dob||!ph) { App.toast('Veuillez remplir les champs obligatoires (prénom, nom, naissance, téléphone)','error'); return; }
    const editId=document.getElementById('patient-edit-id').value;
    const patients=DB.patients();
    const data={firstName:fn,lastName:ln,dob,gender:document.getElementById('p-gender').value,phone:ph,email:document.getElementById('p-email').value.trim(),address:document.getElementById('p-address').value.trim(),bloodType:document.getElementById('p-blood').value,occupation:document.getElementById('p-occupation').value.trim(),referredBy:document.getElementById('p-referred').value.trim(),patientSince:document.getElementById('p-since').value||Utils.today(),allergies:document.getElementById('p-allergies').value.trim(),medications:document.getElementById('p-medications').value.trim(),conditions:document.getElementById('p-conditions').value.trim(),dentalHistory:document.getElementById('p-dental-history').value.trim(),smoker:document.getElementById('p-smoker').value,lastVisit:document.getElementById('p-last-visit').value||'',notes:document.getElementById('p-notes').value.trim(),emergencyName:document.getElementById('p-emg-name').value.trim(),emergencyRelation:document.getElementById('p-emg-relation').value.trim(),emergencyPhone:document.getElementById('p-emg-phone').value.trim(),emergencyEmail:document.getElementById('p-emg-email').value.trim()};
    if (editId) {
      const i=patients.findIndex(x=>x.id==editId);
      patients[i]={...patients[i],...data};
      DB.savePatients(patients);
      DB.logActivity('patient',`Dossier modifié : ${fn} ${ln}`);
      App.toast('Patient modifié avec succès');
    } else {
      const id=DB.nextId('patients');
      patients.push({id,...data,createdAt:new Date().toISOString()});
      DB.savePatients(patients);
      DB.logActivity('patient',`Nouveau patient enregistré : ${fn} ${ln}`);
      App.toast('Patient ajouté avec succès');
    }
    App.closeModal('modal-add-patient');
    this.render(); App.updateBadges();
  },
  delete(id) {
    const p=DB.patients().find(x=>x.id==id);
    if (!p) return;
    App.confirmDelete(`Supprimer le patient "${p.firstName} ${p.lastName}" ?`,()=>{
      DB.savePatients(DB.patients().filter(x=>x.id!=id));
      DB.logActivity('patient',`Patient supprimé : ${p.firstName} ${p.lastName}`);
      App.toast('Patient supprimé','warning');
      this.render(); App.updateBadges();
    });
  },
  renderDetail(id) {
    const p=DB.patients().find(x=>x.id==id); if (!p) return;
    const c=colorFor(p.firstName);
    document.getElementById('detail-avatar').textContent=p.firstName[0]+p.lastName[0];
    document.getElementById('detail-avatar').style.background=c;
    document.getElementById('detail-name').textContent=p.firstName+' '+p.lastName;
    document.getElementById('detail-id-badge').textContent='#'+String(p.id).padStart(4,'0');
    const set=(eid,v)=>{ const e=document.getElementById(eid); if(e) e.textContent=v||'—'; };
    set('detail-gender',p.gender); set('detail-phone',p.phone); set('detail-email',p.email);
    set('detail-address',p.address);
    document.getElementById('detail-dob').textContent=(Utils.formatDate(p.dob)||'—')+(p.dob?` (${Utils.age(p.dob)} ans)`:'');
    document.getElementById('detail-blood').textContent=p.bloodType||'Inconnu';
    set('detail-emergency-name',p.emergencyName); set('detail-emergency-phone',p.emergencyPhone); set('detail-emergency-relation',p.emergencyRelation);
    set('detail-allergies',p.allergies); set('detail-medications',p.medications); set('detail-conditions',p.conditions); set('detail-dental-notes',p.dentalHistory);

    const appts=DB.appointments().filter(a=>a.patientId==id).sort((a,b)=>b.date.localeCompare(a.date));
    document.getElementById('detail-appt-count').textContent=`${appts.length} rendez-vous`;
    document.getElementById('detail-appointments-list').innerHTML=appts.length?`<div class="table-wrap"><table class="data-table"><thead><tr><th>Date</th><th>Heure</th><th>Soin</th><th>Dentiste</th><th>Statut</th></tr></thead><tbody>${appts.map(a=>`<tr><td>${Utils.formatDate(a.date)}</td><td>${a.time}</td><td>${a.service}</td><td>${Utils.dentistName(a.dentistId)}</td><td>${Utils.statusBadge(a.status)}</td></tr>`).join('')}</tbody></table></div>`:'<div class="empty-state-sm"><i class="fa-solid fa-calendar-xmark"></i> Aucun rendez-vous</div>';

    const treats=DB.treatments().filter(t=>t.patientId==id).sort((a,b)=>b.date.localeCompare(a.date));
    document.getElementById('detail-treat-count').textContent=`${treats.length} soin${treats.length!==1?'s':''}`;
    document.getElementById('detail-treatments-list').innerHTML=treats.length?`<div class="table-wrap"><table class="data-table"><thead><tr><th>Date</th><th>Acte</th><th>Dents</th><th>Dentiste</th><th>Coût</th><th>Statut</th></tr></thead><tbody>${treats.map(t=>`<tr><td>${Utils.formatDate(t.date)}</td><td>${t.procedure}</td><td>${(t.teeth||[]).join(', ')||'—'}</td><td>${Utils.dentistName(t.dentistId)}</td><td>${Utils.currency(t.cost)}</td><td>${Utils.statusBadge(t.status)}</td></tr>`).join('')}</tbody></table></div>`:'<div class="empty-state-sm"><i class="fa-solid fa-kit-medical"></i> Aucun soin enregistré</div>';

    const pays=DB.payments().filter(pay=>pay.patientId==id).sort((a,b)=>b.date.localeCompare(a.date));
    const totalPaid=pays.reduce((s,pay)=>s+parseFloat(pay.paidAmount||0),0);
    document.getElementById('detail-pay-count').textContent=Utils.currency(totalPaid)+' versé';
    document.getElementById('detail-payments-list').innerHTML=pays.length?`<div class="table-wrap"><table class="data-table"><thead><tr><th>Facture</th><th>Date</th><th>Total</th><th>Versé</th><th>Mode</th><th>Statut</th><th></th></tr></thead><tbody>${pays.map(pay=>{const total=pay.items.reduce((s,i)=>s+parseFloat(i.amount||0),0)*(1-(pay.discount||0)/100);return`<tr><td>${pay.invoiceNumber}</td><td>${Utils.formatDate(pay.date)}</td><td>${Utils.currency(total)}</td><td>${Utils.currency(pay.paidAmount)}</td><td>${pay.method}</td><td>${Utils.statusBadge(pay.status)}</td><td><button class="icon-btn view" onclick="Payments.printInvoice(${pay.id})"><i class="fa-solid fa-eye"></i></button></td></tr>`;}).join('')}</tbody></table></div>`:'<div class="empty-state-sm"><i class="fa-solid fa-file-invoice-dollar"></i> Aucune facture</div>';

    document.getElementById('detail-files-list').innerHTML=`
      <div class="file-card"><i class="fa-solid fa-x-ray"></i><p>Radio panoramique</p><small>10/11/2024</small></div>
      <div class="file-card"><i class="fa-solid fa-file-pdf"></i><p>Plan de traitement</p><small>10/11/2024</small></div>`;
  },
  prefillAppointment() {
    if (App.currentPatientId) { const s=document.getElementById('appt-patient-id'); if(s) s.value=App.currentPatientId; }
    App.openModal('modal-add-appointment');
  },
  addFile() { App.toast('Téléversement de fichier — bientôt disponible','info'); }
};

/* ══════════════════════════════════════════
   RENDEZ-VOUS
══════════════════════════════════════════ */
const SERVICES_FR = [
  'Bilan & Détartrage','Détartrage & Polissage','Obturation composite','Obturation amalgame',
  'Traitement canalaire','Extraction dentaire','Extraction chirurgicale','Extraction dent de sagesse',
  'Préparation de couronne','Pose de couronne','Pose de bridge','Implant dentaire',
  'Blanchiment dentaire','Consultation orthodontique','Pose de gouttières Invisalign',
  'Ajustement d\'appareil','Pose de prothèse','Prothèse partielle',
  'Traitement des gencives','Application de scellement','Radiographie',
  'Pose de plaquettes (facettes)','Gouttière de protection nocturne','Traitement d\'urgence'
];

const Appointments = {
  populateFilters() {
    const ps=document.getElementById('appt-patient-id');
    if (ps) ps.innerHTML='<option value="">— Sélectionner un patient —</option>'+DB.patients().map(p=>`<option value="${p.id}">${p.firstName} ${p.lastName}</option>`).join('');
    const dentists=DB.staff().filter(s=>['Dentiste','Orthodontiste','Chirurgien oral','Parodontiste','Endodontiste','Pédodontiste','Hygiéniste dentaire'].includes(s.role));
    const dOpts='<option value="">— Sélectionner —</option>'+dentists.map(d=>`<option value="${d.id}">Dr ${d.firstName} ${d.lastName} (${d.role})</option>`).join('');
    const ds=document.getElementById('appt-dentist-id'); if(ds) ds.innerHTML=dOpts;
    const df=document.getElementById('appt-filter-dentist'); if(df) df.innerHTML='<option value="">Tous les dentistes</option>'+dentists.map(d=>`<option value="${d.id}">Dr ${d.firstName} ${d.lastName}</option>`).join('');
    const ss=document.getElementById('appt-service'); if(ss) ss.innerHTML='<option value="">— Sélectionner —</option>'+SERVICES_FR.map(s=>`<option>${s}</option>`).join('');
  },
  render() { this._renderTable(DB.appointments().sort((a,b)=>(b.date+b.time).localeCompare(a.date+a.time))); this._renderStatusBar(DB.appointments()); },
  filter() {
    const q=document.getElementById('appt-search').value.toLowerCase();
    const dt=document.getElementById('appt-filter-date').value;
    const st=document.getElementById('appt-filter-status').value;
    const dn=document.getElementById('appt-filter-dentist').value;
    const list=DB.appointments().filter(a=>{
      const n=Utils.patientName(a.patientId).toLowerCase();
      return (!q||n.includes(q)||a.service.toLowerCase().includes(q))&&(!dt||a.date===dt)&&(!st||a.status===st)&&(!dn||a.dentistId==dn);
    }).sort((a,b)=>(b.date+b.time).localeCompare(a.date+a.time));
    this._renderTable(list);
  },
  filterToday() { document.getElementById('appt-filter-date').value=Utils.today(); this.filter(); },
  _renderStatusBar(appts) {
    const counts={};
    appts.forEach(a=>{ counts[a.status]=(counts[a.status]||0)+1; });
    const col={Planifié:'#94a3b8',Confirmé:'#10b981','En cours':'#f59e0b',Terminé:'#059669',Annulé:'#ef4444',Absent:'#9ca3af'};
    document.getElementById('appt-status-bar').innerHTML=Object.entries(counts).map(([s,c])=>`
      <div class="appt-status-pill" onclick="document.getElementById('appt-filter-status').value='${s}';Appointments.filter()">
        <div class="pill-dot" style="background:${col[s]||'#94a3b8'}"></div>${s}: <strong>${c}</strong>
      </div>`).join('');
  },
  _renderTable(list) {
    const tb=document.getElementById('appointments-table-body');
    document.getElementById('appt-empty').classList.toggle('hidden',list.length>0);
    if (!list.length) { tb.innerHTML=''; return; }
    tb.innerHTML=list.map(a=>`
      <tr>
        <td><div style="display:flex;align-items:center;gap:.6rem"><div style="width:30px;height:30px;border-radius:50%;background:${colorFor(Utils.patientName(a.patientId))};color:#fff;display:flex;align-items:center;justify-content:center;font-size:.7rem;font-weight:700">${Utils.patientName(a.patientId).split(' ').map(w=>w[0]).join('')}</div><span style="cursor:pointer;font-weight:500" onclick="App.openPatient(${a.patientId})">${Utils.patientName(a.patientId)}</span></div></td>
        <td><strong>${Utils.formatDate(a.date)}</strong><br><small style="color:var(--text-muted)">${a.time}</small></td>
        <td style="font-size:.8rem">${Utils.dentistName(a.dentistId)}</td>
        <td>${a.service}</td><td>${a.duration} min</td>
        <td>${Utils.statusBadge(a.status)}</td>
        <td><div class="table-actions">
          <button class="icon-btn edit" onclick="Appointments.edit(${a.id})" title="Modifier"><i class="fa-solid fa-pen"></i></button>
          <select style="font-size:.75rem;padding:.2rem .4rem;border:1px solid var(--border);border-radius:4px;cursor:pointer;max-width:110px" onchange="Appointments.changeStatus(${a.id},this.value)">
            <option value="" disabled selected>Statut</option>
            ${['Planifié','Confirmé','En cours','Terminé','Annulé','Absent'].map(s=>`<option ${a.status===s?'selected':''}>${s}</option>`).join('')}
          </select>
          <button class="icon-btn del" onclick="Appointments.delete(${a.id})" title="Supprimer"><i class="fa-solid fa-trash"></i></button>
        </div></td>
      </tr>`).join('');
  },
  edit(id) {
    const a=DB.appointments().find(x=>x.id==id); if(!a) return;
    document.getElementById('modal-appt-title').innerHTML='<i class="fa-solid fa-pen"></i> Modifier le rendez-vous';
    document.getElementById('appt-edit-id').value=a.id;
    document.getElementById('appt-patient-id').value=a.patientId;
    document.getElementById('appt-dentist-id').value=a.dentistId;
    document.getElementById('appt-service').value=a.service;
    document.getElementById('appt-date').value=a.date;
    document.getElementById('appt-time').value=a.time;
    document.getElementById('appt-duration').value=a.duration;
    document.getElementById('appt-status').value=a.status;
    document.getElementById('appt-reminder').value=a.reminder||'none';
    document.getElementById('appt-notes').value=a.notes||'';
    App.openModal('modal-add-appointment');
  },
  changeStatus(id,status) {
    if (!status) return;
    const appts=DB.appointments();
    const i=appts.findIndex(x=>x.id==id); if(i<0) return;
    appts[i].status=status;
    DB.saveAppointments(appts);
    DB.logActivity('appt',`RDV de ${Utils.patientName(appts[i].patientId)} : statut → ${status}`);
    App.toast(`Statut mis à jour : ${status}`);
    this.render(); App.updateBadges();
  },
  save() {
    const pid=parseInt(document.getElementById('appt-patient-id').value);
    const did=parseInt(document.getElementById('appt-dentist-id').value);
    const svc=document.getElementById('appt-service').value;
    const dt=document.getElementById('appt-date').value;
    const tm=document.getElementById('appt-time').value;
    if (!pid||!did||!svc||!dt||!tm) { App.toast('Veuillez remplir tous les champs obligatoires','error'); return; }
    const editId=document.getElementById('appt-edit-id').value;
    const appts=DB.appointments();
    const data={patientId:pid,dentistId:did,service:svc,date:dt,time:tm,duration:parseInt(document.getElementById('appt-duration').value)||30,status:document.getElementById('appt-status').value,reminder:document.getElementById('appt-reminder').value,notes:document.getElementById('appt-notes').value.trim()};
    if (editId) {
      const i=appts.findIndex(x=>x.id==editId); appts[i]={...appts[i],...data};
      DB.saveAppointments(appts); DB.logActivity('appt',`RDV modifié pour ${Utils.patientName(pid)}`);
      App.toast('Rendez-vous modifié');
    } else {
      const id=DB.nextId('appointments');
      appts.push({id,...data,createdAt:new Date().toISOString()});
      DB.saveAppointments(appts);
      DB.logActivity('appt',`Nouveau RDV pour ${Utils.patientName(pid)} le ${Utils.formatDate(dt)}`);
      App.toast('Rendez-vous enregistré');
    }
    App.closeModal('modal-add-appointment'); this.render(); App.updateBadges();
  },
  delete(id) {
    const a=DB.appointments().find(x=>x.id==id); if(!a) return;
    App.confirmDelete(`Supprimer le rendez-vous de "${Utils.patientName(a.patientId)}" du ${Utils.formatDate(a.date)} ?`,()=>{
      DB.saveAppointments(DB.appointments().filter(x=>x.id!=id));
      DB.logActivity('appt',`RDV supprimé pour ${Utils.patientName(a.patientId)}`);
      App.toast('Rendez-vous supprimé','warning');
      this.render(); App.updateBadges();
    });
  }
};

/* ══════════════════════════════════════════
   TRAITEMENTS
══════════════════════════════════════════ */
const PROCEDURES_FR = [
  'Détartrage & Polissage','Obturation composite','Obturation amalgame','Traitement canalaire',
  'Pulpotomie','Extraction dentaire','Extraction chirurgicale','Extraction dent de sagesse',
  'Préparation de couronne','Pose de couronne','Pose de bridge','Implant dentaire',
  'Greffe osseuse','Blanchiment dentaire','Pose de facettes','Application de scellement',
  'Ajustement orthodontique','Pose de gouttières Invisalign','Prothèse complète','Prothèse partielle',
  'Gouttière de protection nocturne','Traitement des gencives (Gingivectomie)','Frénectomie',
  'Biopsie','Radiographie','Traitement d\'urgence'
];

const Treatments = {
  selectedTeeth:[],
  populateFilters() {
    const ps=document.getElementById('treat-patient-id');
    if(ps) ps.innerHTML='<option value="">— Sélectionner un patient —</option>'+DB.patients().map(p=>`<option value="${p.id}">${p.firstName} ${p.lastName}</option>`).join('');
    const dentists=DB.staff().filter(s=>['Dentiste','Orthodontiste','Chirurgien oral','Parodontiste','Endodontiste','Pédodontiste','Hygiéniste dentaire'].includes(s.role));
    const dOpts='<option value="">— Sélectionner —</option>'+dentists.map(d=>`<option value="${d.id}">Dr ${d.firstName} ${d.lastName}</option>`).join('');
    const ds=document.getElementById('treat-dentist-id'); if(ds) ds.innerHTML=dOpts;
    const df=document.getElementById('treat-filter-dentist'); if(df) df.innerHTML='<option value="">Tous les dentistes</option>'+dentists.map(d=>`<option value="${d.id}">Dr ${d.firstName} ${d.lastName}</option>`).join('');
    const pr=document.getElementById('treat-procedure'); if(pr) pr.innerHTML='<option value="">— Sélectionner l\'acte —</option>'+PROCEDURES_FR.map(p=>`<option>${p}</option>`).join('');
    const prf=document.getElementById('treat-filter-proc'); if(prf) prf.innerHTML='<option value="">Tous les actes</option>'+PROCEDURES_FR.map(p=>`<option>${p}</option>`).join('');
    this._buildMiniChart();
  },
  _buildMiniChart() {
    const upper=[18,17,16,15,14,13,12,11,21,22,23,24,25,26,27,28];
    const lower=[48,47,46,45,44,43,42,41,31,32,33,34,35,36,37,38];
    const el=document.getElementById('mini-tooth-chart'); if(!el) return;
    el.innerHTML=`<div class="mini-teeth-row">${upper.map(n=>`<div class="mini-tooth" data-tooth="${n}" onclick="Treatments.toggleTooth('${n}')">${n}</div>`).join('')}</div><div class="mini-teeth-row">${lower.map(n=>`<div class="mini-tooth" data-tooth="${n}" onclick="Treatments.toggleTooth('${n}')">${n}</div>`).join('')}</div>`;
    this.selectedTeeth=[];
  },
  toggleTooth(n) {
    const i=this.selectedTeeth.indexOf(String(n));
    if(i>=0) this.selectedTeeth.splice(i,1); else this.selectedTeeth.push(String(n));
    document.querySelectorAll('.mini-tooth').forEach(el=>el.classList.toggle('selected',this.selectedTeeth.includes(el.dataset.tooth)));
    document.getElementById('treat-teeth').value=this.selectedTeeth.join(',');
  },
  render() { this._renderTable(DB.treatments().sort((a,b)=>b.date.localeCompare(a.date))); },
  filter() {
    const q=document.getElementById('treat-search').value.toLowerCase();
    const pr=document.getElementById('treat-filter-proc').value;
    const dn=document.getElementById('treat-filter-dentist').value;
    const dt=document.getElementById('treat-filter-date').value;
    const list=DB.treatments().filter(t=>{
      const n=Utils.patientName(t.patientId).toLowerCase();
      return (!q||n.includes(q)||t.procedure.toLowerCase().includes(q))&&(!pr||t.procedure===pr)&&(!dn||t.dentistId==dn)&&(!dt||t.date===dt);
    }).sort((a,b)=>b.date.localeCompare(a.date));
    this._renderTable(list);
  },
  _renderTable(list) {
    const tb=document.getElementById('treatments-table-body');
    document.getElementById('treat-empty').classList.toggle('hidden',list.length>0);
    if (!list.length) { tb.innerHTML=''; return; }
    tb.innerHTML=list.map(t=>`
      <tr>
        <td><span style="cursor:pointer;font-weight:500" onclick="App.openPatient(${t.patientId})">${Utils.patientName(t.patientId)}</span></td>
        <td>${Utils.formatDate(t.date)}</td>
        <td><strong>${t.procedure}</strong></td>
        <td style="font-size:.8rem">${(t.teeth||[]).join(', ')||'—'}</td>
        <td style="font-size:.8rem">${Utils.dentistName(t.dentistId)}</td>
        <td style="font-weight:600;color:var(--success)">${Utils.currency(t.cost)}</td>
        <td style="font-size:.78rem;max-width:180px;color:var(--text-secondary)">${t.notes||'—'}</td>
        <td><div class="table-actions"><button class="icon-btn edit" onclick="Treatments.edit(${t.id})"><i class="fa-solid fa-pen"></i></button><button class="icon-btn del" onclick="Treatments.delete(${t.id})"><i class="fa-solid fa-trash"></i></button></div></td>
      </tr>`).join('');
  },
  edit(id) {
    const t=DB.treatments().find(x=>x.id==id); if(!t) return;
    document.getElementById('modal-treat-title').innerHTML='<i class="fa-solid fa-pen"></i> Modifier le soin';
    document.getElementById('treat-edit-id').value=t.id;
    document.getElementById('treat-patient-id').value=t.patientId;
    document.getElementById('treat-dentist-id').value=t.dentistId;
    document.getElementById('treat-date').value=t.date;
    document.getElementById('treat-procedure').value=t.procedure;
    document.getElementById('treat-cost').value=t.cost;
    document.getElementById('treat-status').value=t.status;
    document.getElementById('treat-notes').value=t.notes||'';
    document.getElementById('treat-followup').value=t.followup||'';
    this.selectedTeeth=[...(t.teeth||[])];
    document.querySelectorAll('.mini-tooth').forEach(el=>el.classList.toggle('selected',this.selectedTeeth.includes(el.dataset.tooth)));
    App.openModal('modal-add-treatment');
  },
  prefillForPatient() {
    if (App.currentPatientId) { const s=document.getElementById('treat-patient-id'); if(s) s.value=App.currentPatientId; }
    App.openModal('modal-add-treatment');
  },
  save() {
    const pid=parseInt(document.getElementById('treat-patient-id').value);
    const did=parseInt(document.getElementById('treat-dentist-id').value);
    const proc=document.getElementById('treat-procedure').value;
    const dt=document.getElementById('treat-date').value;
    if (!pid||!did||!proc||!dt) { App.toast('Veuillez remplir tous les champs obligatoires','error'); return; }
    const editId=document.getElementById('treat-edit-id').value;
    const treats=DB.treatments();
    const data={patientId:pid,dentistId:did,procedure:proc,date:dt,teeth:this.selectedTeeth.slice(),cost:parseFloat(document.getElementById('treat-cost').value)||0,status:document.getElementById('treat-status').value,notes:document.getElementById('treat-notes').value.trim(),followup:document.getElementById('treat-followup').value.trim()};
    if (editId) {
      const i=treats.findIndex(x=>x.id==editId); treats[i]={...treats[i],...data};
      DB.saveTreatments(treats); DB.logActivity('treatment',`Soin modifié pour ${Utils.patientName(pid)}`);
      App.toast('Soin modifié');
    } else {
      const id=DB.nextId('treatments');
      treats.push({id,...data,createdAt:new Date().toISOString()});
      DB.saveTreatments(treats);
      DB.logActivity('treatment',`${proc} effectué sur ${Utils.patientName(pid)}`);
      App.toast('Soin enregistré');
    }
    App.closeModal('modal-add-treatment'); this.render();
  },
  delete(id) {
    const t=DB.treatments().find(x=>x.id==id); if(!t) return;
    App.confirmDelete(`Supprimer le soin "${t.procedure}" pour ${Utils.patientName(t.patientId)} ?`,()=>{
      DB.saveTreatments(DB.treatments().filter(x=>x.id!=id));
      App.toast('Soin supprimé','warning'); this.render();
    });
  }
};

/* ══════════════════════════════════════════
   SCHÉMA DENTAIRE
══════════════════════════════════════════ */
const DentalChart = {
  init() {
    const sel=document.getElementById('chart-patient-select');
    sel.innerHTML='<option value="">— Sélectionner un patient —</option>'+DB.patients().map(p=>`<option value="${p.id}">${p.firstName} ${p.lastName}</option>`).join('');
    this._buildChart(); this.load();
  },
  _buildChart() {
    const upper=[18,17,16,15,14,13,12,11,21,22,23,24,25,26,27,28];
    const lower=[48,47,46,45,44,43,42,41,31,32,33,34,35,36,37,38];
    const mk=(nums,cid)=>{ document.getElementById(cid).innerHTML=nums.map(n=>`<div class="tooth" data-tooth="${n}" onclick="DentalChart.selectTooth(${n})"><span class="tooth-number">${n}</span><span class="tooth-icon">🦷</span></div>`).join(''); };
    mk(upper,'teeth-upper'); mk(lower,'teeth-lower');
  },
  load() {
    const pid=document.getElementById('chart-patient-select').value;
    if (!pid) { document.querySelectorAll('.tooth').forEach(el=>{el.className='tooth';}); return; }
    const procMap={'Obturation composite':'filled','Obturation amalgame':'filled','Traitement canalaire':'root-canal','Pulpotomie':'root-canal','Extraction dentaire':'extracted','Extraction chirurgicale':'extracted','Extraction dent de sagesse':'extracted','Pose de couronne':'crown','Préparation de couronne':'crown','Implant dentaire':'implant'};
    const toothStatus={};
    DB.treatments().filter(t=>t.patientId==pid).forEach(t=>{ const s=procMap[t.procedure]; if(s)(t.teeth||[]).forEach(n=>{ toothStatus[n]=s; }); });
    document.querySelectorAll('.tooth').forEach(el=>{ el.className='tooth'; const s=toothStatus[el.dataset.tooth]; el.classList.add(s||'healthy'); });
  },
  selectTooth(n) {
    document.querySelectorAll('.tooth').forEach(el=>el.classList.remove('selected'));
    document.querySelector(`.tooth[data-tooth="${n}"]`)?.classList.add('selected');
    const pid=document.getElementById('chart-patient-select').value;
    const treats=pid?DB.treatments().filter(t=>t.patientId==pid&&(t.teeth||[]).includes(String(n))):[];
    const jaw=n>=11&&n<=28?'Supérieure':'Inférieure';
    const quad=n>=11&&n<=18?'Supérieure droite':n>=21&&n<=28?'Supérieure gauche':n>=31&&n<=38?'Inférieure gauche':'Inférieure droite';
    document.getElementById('tooth-detail-panel').innerHTML=`
      <div style="margin-bottom:1rem"><h3 style="font-size:1.15rem">Dent n°${n}</h3><p style="color:var(--text-muted);font-size:.85rem">Mâchoire ${jaw} · ${quad}</p></div>
      ${treats.length?`<div style="display:flex;flex-direction:column;gap:.5rem">${treats.map(t=>`<div style="padding:.75rem;background:var(--bg);border-radius:8px;border:1px solid var(--border)"><strong style="font-size:.875rem">${t.procedure}</strong><div style="font-size:.78rem;color:var(--text-muted);margin-top:.2rem">${Utils.formatDate(t.date)} · ${Utils.dentistName(t.dentistId)}</div>${t.notes?`<div style="font-size:.8rem;margin-top:.35rem;color:var(--text-secondary)">${t.notes}</div>`:''}</div>`).join('')}</div>`:'<div class="empty-state-sm"><i class="fa-solid fa-circle-check" style="color:var(--success)"></i> Aucun soin enregistré</div>'}
      <button class="btn-sm-primary" style="margin-top:1rem" onclick="App.navigate('treatments');setTimeout(()=>{Treatments.selectedTeeth=['${n}'];document.querySelectorAll('.mini-tooth').forEach(el=>el.classList.toggle('selected',el.dataset.tooth==='${n}'));App.openModal('modal-add-treatment');},120)"><i class="fa-solid fa-plus"></i> Saisir un soin sur #${n}</button>`;
  }
};

/* ══════════════════════════════════════════
   PAIEMENTS
══════════════════════════════════════════ */
const Payments = {
  render() {
    const pays=DB.payments();
    const ps=document.getElementById('pay-patient-id');
    if(ps) ps.innerHTML='<option value="">— Sélectionner un patient —</option>'+DB.patients().map(p=>`<option value="${p.id}">${p.firstName} ${p.lastName}</option>`).join('');
    const paid=pays.filter(p=>p.status==='Payé').reduce((s,p)=>s+parseFloat(p.paidAmount||0),0);
    const pend=pays.filter(p=>['En attente','Partiel','En retard'].includes(p.status));
    const pendTotal=pend.reduce((s,p)=>{ const t=p.items.reduce((st,i)=>st+parseFloat(i.amount||0),0)*(1-(p.discount||0)/100); return s+(t-parseFloat(p.paidAmount||0)); },0);
    const ms=new Date(); ms.setDate(1); const msStr=ms.toISOString().split('T')[0];
    const month=pays.filter(p=>p.date>=msStr).reduce((s,p)=>s+parseFloat(p.paidAmount||0),0);
    document.getElementById('pay-stat-paid').textContent   = Utils.currency(paid);
    document.getElementById('pay-stat-pending').textContent= Utils.currency(pendTotal);
    document.getElementById('pay-stat-count').textContent  = pays.length;
    document.getElementById('pay-stat-month').textContent  = Utils.currency(month);
    this._renderTable(pays.sort((a,b)=>b.date.localeCompare(a.date)));
  },
  filter() {
    const q=document.getElementById('pay-search').value.toLowerCase();
    const st=document.getElementById('pay-filter-status').value;
    const m=document.getElementById('pay-filter-method').value;
    const list=DB.payments().filter(p=>{
      const n=Utils.patientName(p.patientId).toLowerCase();
      return (!q||n.includes(q)||(p.invoiceNumber||'').toLowerCase().includes(q))&&(!st||p.status===st)&&(!m||p.method===m);
    }).sort((a,b)=>b.date.localeCompare(a.date));
    this._renderTable(list);
  },
  _renderTable(list) {
    const tb=document.getElementById('payments-table-body');
    document.getElementById('pay-empty').classList.toggle('hidden',list.length>0);
    if (!list.length) { tb.innerHTML=''; return; }
    tb.innerHTML=list.map(p=>{
      const sub=p.items.reduce((s,i)=>s+parseFloat(i.amount||0),0);
      const tot=sub*(1-(p.discount||0)/100);
      return `<tr>
        <td style="font-weight:600;color:var(--primary)">${p.invoiceNumber||'—'}</td>
        <td><span style="cursor:pointer;font-weight:500" onclick="App.openPatient(${p.patientId})">${Utils.patientName(p.patientId)}</span></td>
        <td>${Utils.formatDate(p.date)}</td>
        <td style="font-size:.8rem;max-width:160px">${p.items.map(i=>i.description).join(', ')}</td>
        <td style="font-weight:600">${Utils.currency(tot)}</td>
        <td style="color:var(--success);font-weight:600">${Utils.currency(p.paidAmount)}</td>
        <td style="font-size:.8rem">${p.method}</td>
        <td>${Utils.statusBadge(p.status)}</td>
        <td><div class="table-actions"><button class="icon-btn view" onclick="Payments.printInvoice(${p.id})" title="Voir"><i class="fa-solid fa-eye"></i></button><button class="icon-btn edit" onclick="Payments.edit(${p.id})" title="Modifier"><i class="fa-solid fa-pen"></i></button><button class="icon-btn del" onclick="Payments.delete(${p.id})" title="Supprimer"><i class="fa-solid fa-trash"></i></button></div></td>
      </tr>`;
    }).join('');
  },
  addItem(desc='',amount='') {
    const c=document.getElementById('pay-items-container');
    const row=document.createElement('div'); row.className='pay-item-row';
    row.innerHTML=`<input type="text" placeholder="Description (ex: Détartrage)" value="${desc}" oninput="Payments.updateTotals()"/><input type="number" class="amount-input" placeholder="0.00" value="${amount}" min="0" step="0.01" oninput="Payments.updateTotals()"/><button type="button" onclick="this.parentElement.remove();Payments.updateTotals()"><i class="fa-solid fa-xmark"></i></button>`;
    c.appendChild(row); this.updateTotals();
  },
  updateTotals() {
    let sub=0;
    document.querySelectorAll('.pay-item-row').forEach(r=>{ sub+=parseFloat(r.querySelectorAll('input')[1].value)||0; });
    const disc=parseFloat(document.getElementById('inv-discount')?.value)||0;
    const tot=sub*(1-disc/100);
    const paid=parseFloat(document.getElementById('pay-paid-amount')?.value)||0;
    const bal=tot-paid;
    const f=n=>n.toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2})+' €';
    const s=(id,v)=>{ const e=document.getElementById(id); if(e) e.textContent=f(v); };
    s('inv-subtotal',sub); s('inv-total',tot); s('inv-paid-display',paid); s('inv-balance',bal<0?0:bal);
  },
  _openAdd() {
    document.getElementById('modal-pay-title').innerHTML='<i class="fa-solid fa-file-invoice-dollar"></i> Nouvelle facture';
    document.getElementById('pay-edit-id').value='';
    document.getElementById('pay-date').value=Utils.today();
    document.getElementById('pay-due-date').value='';
    document.getElementById('pay-method').value='Espèces';
    document.getElementById('pay-status').value='En attente';
    document.getElementById('pay-patient-id').value='';
    document.getElementById('pay-notes').value='';
    document.getElementById('pay-paid-amount').value='';
    document.getElementById('inv-discount').value='0';
    document.getElementById('pay-items-container').innerHTML='';
    this.addItem(); this.updateTotals();
  },
  edit(id) {
    const p=DB.payments().find(x=>x.id==id); if(!p) return;
    this._openAdd();
    document.getElementById('modal-pay-title').innerHTML='<i class="fa-solid fa-pen"></i> Modifier la facture';
    document.getElementById('pay-edit-id').value=p.id;
    document.getElementById('pay-patient-id').value=p.patientId;
    document.getElementById('pay-date').value=p.date;
    document.getElementById('pay-due-date').value=p.dueDate||'';
    document.getElementById('pay-method').value=p.method;
    document.getElementById('pay-status').value=p.status;
    document.getElementById('pay-notes').value=p.notes||'';
    document.getElementById('pay-paid-amount').value=p.paidAmount||'';
    document.getElementById('inv-discount').value=p.discount||0;
    document.getElementById('pay-items-container').innerHTML='';
    (p.items||[]).forEach(item=>this.addItem(item.description,item.amount));
    this.updateTotals();
    App.openModal('modal-add-payment');
  },
  prefillForPatient() {
    this._openAdd();
    if (App.currentPatientId) { const s=document.getElementById('pay-patient-id'); if(s) s.value=App.currentPatientId; }
    App.openModal('modal-add-payment');
  },
  save() {
    const pid=parseInt(document.getElementById('pay-patient-id').value);
    const dt=document.getElementById('pay-date').value;
    if (!pid||!dt) { App.toast('Veuillez sélectionner le patient et la date','error'); return; }
    const rows=document.querySelectorAll('.pay-item-row');
    const items=[];
    rows.forEach(r=>{ const desc=r.querySelectorAll('input')[0].value.trim(); const amt=parseFloat(r.querySelectorAll('input')[1].value)||0; if(desc) items.push({description:desc,amount:amt}); });
    if (!items.length) { App.toast('Ajoutez au moins une ligne','error'); return; }
    const editId=document.getElementById('pay-edit-id').value;
    const pays=DB.payments();
    const data={patientId:pid,date:dt,dueDate:document.getElementById('pay-due-date').value,method:document.getElementById('pay-method').value,status:document.getElementById('pay-status').value,paidAmount:parseFloat(document.getElementById('pay-paid-amount').value)||0,discount:parseFloat(document.getElementById('inv-discount').value)||0,notes:document.getElementById('pay-notes').value.trim(),items};
    if (editId) {
      const i=pays.findIndex(x=>x.id==editId); pays[i]={...pays[i],...data};
      DB.savePayments(pays); App.toast('Facture modifiée');
    } else {
      const id=DB.nextId('payments');
      const inv='FAC-'+String(id).padStart(3,'0');
      pays.push({id,invoiceNumber:inv,...data,createdAt:new Date().toISOString()});
      DB.savePayments(pays);
      DB.logActivity('payment',`Facture ${inv} créée pour ${Utils.patientName(pid)}`);
      App.toast('Facture créée');
    }
    App.closeModal('modal-add-payment'); this.render(); App.updateBadges();
  },
  saveAndPrint() { this.save(); const pays=DB.payments(); this.printInvoice(pays[pays.length-1]?.id); },
  printInvoice(id) {
    const p=DB.payments().find(x=>x.id==id); if(!p) return;
    const sub=p.items.reduce((s,i)=>s+parseFloat(i.amount||0),0);
    const tot=sub*(1-(p.discount||0)/100);
    const bal=tot-parseFloat(p.paidAmount||0);
    const s=DB.settings();
    const cn=s.clinicName||'Dental Clinic'; const cp=s.clinicPhone||'+213 555 123 456'; const ca=s.clinicAddr||'12 Rue des Acacias, Alger';
    const f=n=>n.toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2})+' €';
    document.getElementById('invoice-print-content').innerHTML=`
      <div class="invoice-print-header"><div><div class="invoice-print-title">FACTURE</div><div style="color:var(--text-muted);font-size:.875rem">${p.invoiceNumber||'—'}</div></div><div style="text-align:right"><strong style="font-size:1.1rem">${cn}</strong><br><span style="color:var(--text-muted);font-size:.85rem">${ca}</span><br><span style="color:var(--text-muted);font-size:.85rem">${cp}</span></div></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:2rem;margin-bottom:1.5rem">
        <div><div style="font-size:.75rem;font-weight:700;text-transform:uppercase;color:var(--text-muted);margin-bottom:.35rem">Facturer à</div><strong>${Utils.patientName(p.patientId)}</strong></div>
        <div style="text-align:right"><div><span style="color:var(--text-muted);font-size:.85rem">Date :</span> <strong>${Utils.formatDate(p.date)}</strong></div>${p.dueDate?`<div><span style="color:var(--text-muted);font-size:.85rem">Échéance :</span> <strong>${Utils.formatDate(p.dueDate)}</strong></div>`:''}<div><span style="color:var(--text-muted);font-size:.85rem">Mode :</span> <strong>${p.method}</strong></div><div style="margin-top:.35rem">${Utils.statusBadge(p.status)}</div></div>
      </div>
      <table class="invoice-print-table"><thead><tr><th>N°</th><th>Description</th><th style="text-align:right">Montant</th></tr></thead><tbody>${p.items.map((item,i)=>`<tr><td>${i+1}</td><td>${item.description}</td><td style="text-align:right">${f(parseFloat(item.amount||0))}</td></tr>`).join('')}</tbody></table>
      <div class="invoice-totals-print">
        <div class="total-row"><span>Sous-total</span><span>${f(sub)}</span></div>
        ${p.discount?`<div class="total-row"><span>Remise (${p.discount}%)</span><span>-${f(sub*p.discount/100)}</span></div>`:''}
        <div class="total-row total-grand"><span>Total</span><span>${f(tot)}</span></div>
        <div class="total-row"><span>Montant versé</span><span style="color:var(--success)">${f(parseFloat(p.paidAmount||0))}</span></div>
        <div class="total-row balance"><span><strong>Solde restant</strong></span><span style="color:var(--danger)">${f(bal<0?0:bal)}</span></div>
      </div>
      ${p.notes?`<div style="margin-top:1.5rem;padding-top:1rem;border-top:1px solid var(--border);font-size:.85rem;color:var(--text-secondary)"><strong>Notes :</strong> ${p.notes}</div>`:''}
      <div style="margin-top:2rem;text-align:center;font-size:.78rem;color:var(--text-muted);border-top:1px solid var(--border);padding-top:1rem">Merci de votre confiance. Pour toute question concernant cette facture, veuillez nous contacter.</div>`;
    App.openModal('modal-invoice-print');
  },
  delete(id) {
    const p=DB.payments().find(x=>x.id==id); if(!p) return;
    App.confirmDelete(`Supprimer la facture ${p.invoiceNumber} pour ${Utils.patientName(p.patientId)} ?`,()=>{
      DB.savePayments(DB.payments().filter(x=>x.id!=id));
      App.toast('Facture supprimée','warning'); this.render(); App.updateBadges();
    });
  }
};

/* ══════════════════════════════════════════
   RAPPORTS
══════════════════════════════════════════ */
const Reports = {
  charts:{},
  render() {
    const period=document.getElementById('report-period').value;
    const now=new Date(); let start='';
    if (period==='this-month')  start=new Date(now.getFullYear(),now.getMonth(),1).toISOString().split('T')[0];
    if (period==='last-month')  start=new Date(now.getFullYear(),now.getMonth()-1,1).toISOString().split('T')[0];
    if (period==='this-year')   start=`${now.getFullYear()}-01-01`;
    const fd=d=>!start||d>=start;
    const patients  =DB.patients().filter(p=>fd(p.createdAt?.split('T')[0]||p.patientSince||''));
    const appts     =DB.appointments().filter(a=>fd(a.date));
    const treats    =DB.treatments().filter(t=>fd(t.date));
    const pays      =DB.payments().filter(p=>fd(p.date));
    const rev       =pays.reduce((s,p)=>s+parseFloat(p.paidAmount||0),0);
    document.getElementById('rep-new-patients').textContent =patients.length;
    document.getElementById('rep-total-appts').textContent  =appts.length;
    document.getElementById('rep-total-treatments').textContent=treats.length;
    document.getElementById('rep-revenue').textContent      =Utils.currency(rev);
    this._revChart(DB.payments()); this._apptChart(appts); this._procChart(treats); this._topProc(treats);
  },
  refresh() { this.render(); },
  _revChart(pays) {
    const months=[],revs=[];
    for(let i=11;i>=0;i--){const d=new Date();d.setMonth(d.getMonth()-i);const k=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;months.push(d.toLocaleDateString('fr-FR',{month:'short',year:'2-digit'}));revs.push(pays.filter(p=>p.date&&p.date.startsWith(k)).reduce((s,p)=>s+parseFloat(p.paidAmount||0),0));}
    const ctx=document.getElementById('rep-revenue-chart')?.getContext('2d'); if(!ctx) return;
    if(this.charts.rev) this.charts.rev.destroy();
    this.charts.rev=new Chart(ctx,{type:'line',data:{labels:months,datasets:[{label:'Revenu',data:revs,borderColor:'#3d6d78',backgroundColor:'rgba(61,109,120,.1)',tension:.4,fill:true,pointBackgroundColor:'#3d6d78',pointRadius:4}]},options:{responsive:true,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,ticks:{callback:v=>v+' €'},grid:{color:'rgba(0,0,0,.04)'}},x:{grid:{display:false}}}}});
  },
  _apptChart(appts) {
    const statuses=['Planifié','Confirmé','En cours','Terminé','Annulé','Absent'];
    const counts=statuses.map(s=>appts.filter(a=>a.status===s).length);
    const colors=['#8fb3ba','#3d6d78','#e7a982','#2f5a46','#c25b4e','#b8c7c5'];
    const ctx=document.getElementById('rep-appt-chart')?.getContext('2d'); if(!ctx) return;
    if(this.charts.appt) this.charts.appt.destroy();
    this.charts.appt=new Chart(ctx,{type:'bar',data:{labels:statuses,datasets:[{data:counts,backgroundColor:colors,borderRadius:6}]},options:{responsive:true,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,grid:{color:'rgba(0,0,0,.04)'}},x:{grid:{display:false}}}}});
  },
  _procChart(treats) {
    const counts={};
    treats.forEach(t=>{ counts[t.procedure]=(counts[t.procedure]||0)+1; });
    const sorted=Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,8);
    const labels=sorted.map(x=>x[0]),vals=sorted.map(x=>x[1]);
    const pal=['#3d6d78','#2f5a46','#e7a982','#1f2e2f','#8fb3ba','#7fa58c','#c4805a','#b8c7c5'];
    const ctx=document.getElementById('rep-proc-chart')?.getContext('2d');
    const leg=document.getElementById('rep-proc-legend');
    if(!ctx) return;
    if(this.charts.proc) this.charts.proc.destroy();
    if(!labels.length){ if(leg) leg.innerHTML='<div class="empty-state-sm">Pas de données</div>'; return; }
    this.charts.proc=new Chart(ctx,{type:'doughnut',data:{labels,datasets:[{data:vals,backgroundColor:pal.slice(0,labels.length),borderWidth:2,borderColor:'#fff'}]},options:{responsive:true,cutout:'60%',plugins:{legend:{display:false}}}});
    if(leg) leg.innerHTML=labels.map((l,i)=>`<div class="chart-legend-item"><div class="chart-legend-dot" style="background:${pal[i]}"></div><span class="chart-legend-label">${l}</span><span class="chart-legend-value">${vals[i]}</span></div>`).join('');
  },
  _topProc(treats) {
    const rev={};
    treats.forEach(t=>{ rev[t.procedure]=(rev[t.procedure]||0)+parseFloat(t.cost||0); });
    const sorted=Object.entries(rev).sort((a,b)=>b[1]-a[1]).slice(0,6);
    const max=sorted[0]?.[1]||1;
    document.getElementById('rep-top-procedures').innerHTML=sorted.length?sorted.map(([n,r],i)=>`
      <div class="top-proc-row"><div class="top-proc-rank">${i+1}</div><div style="flex:1;min-width:0"><div class="top-proc-name">${n}</div><div class="top-proc-bar" style="width:${Math.round(r/max*100)}%"></div></div><div class="top-proc-revenue">${Utils.currency(r)}</div></div>`).join(''):'<div class="empty-state-sm"><i class="fa-solid fa-chart-bar"></i> Aucun soin enregistré</div>';
  }
};

/* ══════════════════════════════════════════
   PERSONNEL
══════════════════════════════════════════ */
const Staff = {
  render() {
    const list=DB.staff();
    const grid=document.getElementById('staff-grid');
    if (!list.length) { grid.innerHTML='<div class="empty-state"><i class="fa-solid fa-user-doctor"></i><h3>Aucun membre du personnel</h3></div>'; return; }
    grid.innerHTML=list.map(s=>`
      <div class="staff-card">
        <div class="staff-avatar" style="background:${colorFor(s.firstName)}">${s.firstName[0]}${s.lastName[0]}</div>
        <div class="staff-name">${s.firstName} ${s.lastName}</div>
        <div class="staff-role">${s.role}</div>
        <div class="staff-info">${s.exp} ans d'expérience</div>
        <div class="staff-info">${s.phone||'—'}</div>
        <div class="staff-info" style="font-size:.78rem">${s.email||'—'}</div>
        ${s.license?`<div class="staff-info">Licence : ${s.license}</div>`:''}
        ${s.notes?`<div class="staff-info" style="font-style:italic;color:var(--text-muted)">${s.notes}</div>`:''}
        <div class="staff-card-actions"><button class="icon-btn edit" onclick="Staff.edit(${s.id})"><i class="fa-solid fa-pen"></i></button><button class="icon-btn del" onclick="Staff.delete(${s.id})"><i class="fa-solid fa-trash"></i></button></div>
      </div>`).join('');
  },
  edit(id) {
    const s=DB.staff().find(x=>x.id==id); if(!s) return;
    document.getElementById('modal-staff-title').innerHTML='<i class="fa-solid fa-pen"></i> Modifier le membre';
    document.getElementById('staff-edit-id').value=s.id;
    document.getElementById('staff-first').value=s.firstName;
    document.getElementById('staff-last').value=s.lastName;
    document.getElementById('staff-role').value=s.role;
    document.getElementById('staff-phone').value=s.phone||'';
    document.getElementById('staff-email').value=s.email||'';
    document.getElementById('staff-license').value=s.license||'';
    document.getElementById('staff-exp').value=s.exp||0;
    document.getElementById('staff-notes').value=s.notes||'';
    App.openModal('modal-add-staff');
  },
  save() {
    const fn=document.getElementById('staff-first').value.trim();
    const ln=document.getElementById('staff-last').value.trim();
    if (!fn||!ln) { App.toast('Veuillez saisir le prénom et le nom','error'); return; }
    const editId=document.getElementById('staff-edit-id').value;
    const staff=DB.staff();
    const data={firstName:fn,lastName:ln,role:document.getElementById('staff-role').value,phone:document.getElementById('staff-phone').value.trim(),email:document.getElementById('staff-email').value.trim(),license:document.getElementById('staff-license').value.trim(),exp:parseInt(document.getElementById('staff-exp').value)||0,notes:document.getElementById('staff-notes').value.trim()};
    if (editId) { const i=staff.findIndex(x=>x.id==editId); staff[i]={...staff[i],...data}; DB.saveStaff(staff); App.toast('Personnel modifié'); }
    else { staff.push({id:DB.nextId('staff'),...data}); DB.saveStaff(staff); App.toast('Personnel ajouté'); }
    App.closeModal('modal-add-staff'); this.render();
  },
  delete(id) {
    const s=DB.staff().find(x=>x.id==id); if(!s) return;
    App.confirmDelete(`Retirer ${s.firstName} ${s.lastName} du personnel ?`,()=>{
      DB.saveStaff(DB.staff().filter(x=>x.id!=id)); App.toast('Membre retiré','warning'); this.render();
    });
  }
};

/* ══════════════════════════════════════════
   PARAMÈTRES
══════════════════════════════════════════ */
const HORAIRES_DEFAULT=[
  {day:'Lundi',    open:true, from:'08:00',to:'18:00'},
  {day:'Mardi',    open:true, from:'08:00',to:'18:00'},
  {day:'Mercredi', open:true, from:'08:00',to:'18:00'},
  {day:'Jeudi',    open:true, from:'08:00',to:'18:00'},
  {day:'Vendredi', open:true, from:'08:00',to:'17:00'},
  {day:'Samedi',   open:true, from:'09:00',to:'14:00'},
  {day:'Dimanche', open:false,from:'',    to:''},
];
const SERVICES_DEFAULT=[
  {name:'Bilan & Détartrage',price:120},{name:'Obturation composite',price:1800},
  {name:'Obturation amalgame',price:1500},{name:'Traitement canalaire',price:9500},
  {name:'Extraction dentaire',price:2000},{name:'Pose de couronne',price:12000},
  {name:'Implant dentaire',price:35000},{name:'Blanchiment dentaire',price:4000},
  {name:'Consultation orthodontique',price:2000},{name:'Détartrage & Polissage',price:1200},
];

const Settings = {
  wh:null, svc:null,
  render() {
    const s=DB.settings();
    const sv=(id,v)=>{ const e=document.getElementById(id); if(e&&v) e.value=v; };
    sv('setting-clinic-name',s.clinicName); sv('setting-clinic-phone',s.clinicPhone);
    sv('setting-clinic-email',s.clinicEmail); sv('setting-clinic-address',s.clinicAddr);
    sv('setting-clinic-city',s.clinicCity); sv('setting-clinic-website',s.clinicWebsite);
    this.wh  = s.workingHours || HORAIRES_DEFAULT;
    this.svc = s.services     || SERVICES_DEFAULT;
    this._renderWH(); this._renderSvc();
  },
  _renderWH() {
    document.getElementById('working-hours-table').innerHTML='<div class="working-hours-grid">'+
      this.wh.map((h,i)=>`<div class="wh-row"><div class="wh-day">${h.day}</div><div><input type="checkbox" ${h.open?'checked':''} id="wh-open-${i}" onchange="Settings.wh[${i}].open=this.checked;document.getElementById('wh-times-${i}').style.display=this.checked?'flex':'none'"> <label for="wh-open-${i}">Ouvert</label></div><div class="wh-times" id="wh-times-${i}" style="${h.open?'':'display:none'}"><input type="time" value="${h.from||''}" onchange="Settings.wh[${i}].from=this.value"/> à <input type="time" value="${h.to||''}" onchange="Settings.wh[${i}].to=this.value"/></div></div>`).join('')+
      '</div>';
  },
  _renderSvc() {
    document.getElementById('services-list').innerHTML=this.svc.map((s,i)=>`
      <div class="service-row"><input type="text" value="${s.name}" onchange="Settings.svc[${i}].name=this.value"/><span style="color:var(--text-muted);font-size:.875rem">€</span><input type="number" class="price-input" value="${s.price}" min="0" step="1" onchange="Settings.svc[${i}].price=parseFloat(this.value)||0"/><button onclick="Settings.removeSvc(${i})"><i class="fa-solid fa-xmark"></i></button></div>`).join('');
  },
  addService() { this.svc.push({name:'Nouveau service',price:0}); this._renderSvc(); },
  removeSvc(i) { this.svc.splice(i,1); this._renderSvc(); },
  save() {
    DB.saveSettings({
      clinicName:   document.getElementById('setting-clinic-name').value,
      clinicPhone:  document.getElementById('setting-clinic-phone').value,
      clinicEmail:  document.getElementById('setting-clinic-email').value,
      clinicAddr:   document.getElementById('setting-clinic-address').value,
      clinicCity:   document.getElementById('setting-clinic-city').value,
      clinicWebsite:document.getElementById('setting-clinic-website').value,
      workingHours: this.wh, services: this.svc,
    });
    App.toast('Paramètres enregistrés');
  }
};

/* ── Démarrage ── */
document.addEventListener('DOMContentLoaded', () => App.init());
