/* ═══════════════════════════════════════════
   Dental Clinic par CICTNA RDC — Application principale (FR)
   ═══════════════════════════════════════════ */
'use strict';

/* ── Palette de couleurs pour les avatars ── */
const COLORS = ['#3d6d78','#2f5a46','#c4805a','#1f2e2f','#5a8f9b','#5f8a6c','#a0674a','#46636a'];
const colorFor = str => COLORS[(str||'').split('').reduce((a,c)=>a+c.charCodeAt(0),0) % COLORS.length];

/* ── Comptes de démonstration (volontairement publics : l'indice les affiche) ── */
const USERS = {
  dentiste:   { password:'sourire', name:'Dr Sarah Mitchell', label:'Dentiste',   initials:'SM', greet:'Docteur',
                welcome:'Bienvenue Docteur ! Votre fauteuil vous attend (il a l\'air impatient).' },
  assistante: { password:'molaire', name:'Inès Haddad',       label:'Assistante', initials:'IH', greet:'Inès',
                welcome:'Bonjour Inès ! Les rapports et réglages sont réservés au dentiste — tout le reste est à vous.' },
};

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
const SEED_VERSION = '3';
function clearDemoData() {
  Object.keys(localStorage).filter(k=>k.startsWith('dc_')).forEach(k=>localStorage.removeItem(k));
}
function seedData() {
  if (localStorage.getItem('dc_seed_version')!==SEED_VERSION) clearDemoData();
  if (DB.get('seeded').length) return;
  localStorage.setItem('dc_seed_version', SEED_VERSION);

  DB.set('staff',[
    {id:1,firstName:'Sarah',   lastName:'Mitchell',  role:'Dentiste',             phone:'+213 555 010 001',email:'s.mitchell@dental-clinic.example',license:'CD-10023',exp:12,notes:'Dentisterie cosmétique et Invisalign.'},
    {id:2,firstName:'Karim',   lastName:'Boukhalfa', role:'Orthodontiste',         phone:'+213 555 010 002',email:'k.boukhalfa@dental-clinic.example',license:'CD-10045',exp:8, notes:'Appareils, gouttières et corrections d\'occlusion.'},
    {id:3,firstName:'Aïcha',   lastName:'Bensalem',  role:'Chirurgien oral',       phone:'+213 555 010 003',email:'a.bensalem@dental-clinic.example', license:'CD-10067',exp:15,notes:'Implants, extractions, greffes osseuses.'},
    {id:4,firstName:'Yacine',  lastName:'Mahieddine', role:'Endodontiste',         phone:'+213 555 010 004',email:'y.mahieddine@dental-clinic.example',license:'CD-10089',exp:6, notes:'Spécialiste en traitement canalaire.'},
    {id:5,firstName:'Leila',   lastName:'Cherif',    role:'Hygiéniste dentaire',   phone:'+213 555 010 005',email:'l.cherif@dental-clinic.example',   license:'HD-2034', exp:5, notes:'Détartrage, prophylaxie et éducation du patient.'},
    {id:6,firstName:'Inès',    lastName:'Haddad',    role:'Assistante dentaire',   phone:'+213 555 010 006',email:'i.haddad@dental-clinic.example',   license:'',        exp:4, notes:'Accueil, agenda, stérilisation et préparation du fauteuil.'},
  ]);
  localStorage.setItem('dc_id_staff','6');

  DB.set('patients',[
    {id:1,firstName:'Amina',   lastName:'Boudjemaa', dob:'1985-03-22',gender:'Féminin',   phone:'+213 555 301 001',email:'amina.b@email.dz',   address:'45 Rue Didouche, Alger',        bloodType:'A+', occupation:'Enseignante', referredBy:'Dr. Benamar',patientSince:'2020-01-15',allergies:'Pénicilline',          medications:'Aucun',          conditions:'Anxiété légère',                     dentalHistory:'Deux obturations en 2019',          smoker:'Non',lastVisit:'2024-11-10',notes:'Préfère les rendez-vous le matin.',emergencyName:'Omar Boudjemaa',   emergencyPhone:'+213 555 901 001',emergencyRelation:'Époux',   emergencyEmail:'',createdAt:'2020-01-15T09:00:00Z'},
    {id:2,firstName:'Sofiane', lastName:'Meziani',   dob:'1978-07-14',gender:'Masculin',  phone:'+213 555 301 002',email:'s.meziani@email.dz',  address:'12 Bd Krim Belkacem, Oran',     bloodType:'O+', occupation:'Ingénieur',   referredBy:'',           patientSince:'2021-03-10',allergies:'Latex',               medications:'Lisinopril 10mg',conditions:'Hypertension, Diabète type 2',        dentalHistory:'Traitement canalaire sur la 14 en 2020',  smoker:'Non',lastVisit:'2024-12-01',notes:'Vérifier la tension avant les soins.', emergencyName:'Nadia Meziani',    emergencyPhone:'+213 555 901 002',emergencyRelation:'Épouse',  emergencyEmail:'',createdAt:'2021-03-10T10:00:00Z'},
    {id:3,firstName:'Yasmine', lastName:'Khelifa',   dob:'1995-11-30',gender:'Féminin',   phone:'+213 555 301 003',email:'yasmine.k@email.dz',  address:'88 Cité Universitaire, Constantine',bloodType:'B+',occupation:'Infirmière',referredBy:'Amina Boudjemaa',patientSince:'2022-06-20',allergies:'Aucune',           medications:'Aucun',          conditions:'Aucune',                             dentalHistory:'Appareil orthodontique adolescence',smoker:'Non',lastVisit:'2025-01-15',notes:'Très bonne compliance.',                emergencyName:'Hamid Khelifa',    emergencyPhone:'+213 555 901 003',emergencyRelation:'Père',    emergencyEmail:'',createdAt:'2022-06-20T11:00:00Z'},
    {id:4,firstName:'Noureddine',lastName:'Sahraoui',dob:'1962-04-08',gender:'Masculin',  phone:'+213 555 301 004',email:'n.sahraoui@email.dz', address:'33 Rue des Frères Abbas, Annaba',bloodType:'AB+',occupation:'Retraité',  referredBy:'',           patientSince:'2019-09-05',allergies:'Aspirine, Sulfamides', medications:'Warfarine, Metformine, Atorvastatine',conditions:'Cardiopathie, Diabète, Hypertension',dentalHistory:'Plusieurs extractions, prothèse partielle haute',smoker:'Oui',lastVisit:'2024-10-20',notes:'Warfarine — vérifier l\'INR avant extraction.',emergencyName:'Houria Sahraoui',emergencyPhone:'+213 555 901 004',emergencyRelation:'Épouse',  emergencyEmail:'',createdAt:'2019-09-05T08:00:00Z'},
    {id:5,firstName:'Rania',   lastName:'Belhocine', dob:'2001-08-19',gender:'Féminin',   phone:'+213 555 301 005',email:'rania.b@email.dz',    address:'71 Cité Djamel, Skikda',        bloodType:'O-', occupation:'Étudiante',  referredBy:'Yasmine Khelifa',patientSince:'2023-02-14',allergies:'Aucune',           medications:'Aucun',          conditions:'Aucune',                             dentalHistory:'Aucun antécédent dentaire',          smoker:'Non',lastVisit:'2025-02-28',notes:'Première patiente, légère anxiété dentaire.',emergencyName:'Samira Belhocine',emergencyPhone:'+213 555 901 005',emergencyRelation:'Mère',    emergencyEmail:'',createdAt:'2023-02-14T14:00:00Z'},
    {id:6,firstName:'Tarek',   lastName:'Guettafi',  dob:'1970-12-03',gender:'Masculin',  phone:'+213 555 301 006',email:'t.guettafi@email.dz',  address:'19 Rue Mokhtar Khalef, Batna',  bloodType:'A-', occupation:'Comptable',  referredBy:'',           patientSince:'2020-11-22',allergies:'Codéine',             medications:'Aucun',          conditions:'Aucune',                             dentalHistory:'Couronne sur la 46 en 2021',           smoker:'Non',lastVisit:'2025-01-08',notes:'',emergencyName:'Sabrina Guettafi',emergencyPhone:'+213 555 901 006',emergencyRelation:'Épouse',  emergencyEmail:'',createdAt:'2020-11-22T13:00:00Z'},
  ]);
  localStorage.setItem('dc_id_patients','6');

  const today     = new Date();
  const fmt       = d => d.toISOString().split('T')[0];
  const td        = fmt(today);
  const tomorrow  = fmt(new Date(today.getTime()+86400000));
  const yesterday = fmt(new Date(today.getTime()-86400000));

  DB.set('appointments',[
    {id:1,patientId:1,dentistId:1,date:td,       time:'09:00',duration:30, service:'Bilan & Détartrage',           status:'Confirmé',  notes:'Bilan annuel',                         reminder:'1day',  createdAt:new Date().toISOString()},
    {id:2,patientId:2,dentistId:4,date:td,       time:'10:30',duration:60, service:'Traitement canalaire',          status:'En cours',  notes:'Dent 36, 2ème séance',                reminder:'none',  createdAt:new Date().toISOString()},
    {id:3,patientId:3,dentistId:1,date:td,       time:'14:00',duration:45, service:'Obturation composite',          status:'Planifié',  notes:'Carie sur 12',                        reminder:'2hours',createdAt:new Date().toISOString()},
    {id:4,patientId:4,dentistId:3,date:td,       time:'15:30',duration:90, service:'Extraction dentaire',           status:'Planifié',  notes:'Extraction 16 — vérifier Warfarine',  reminder:'1day',  createdAt:new Date().toISOString()},
    {id:5,patientId:5,dentistId:5,date:tomorrow, time:'09:30',duration:30, service:'Bilan & Détartrage',            status:'Planifié',  notes:'Première séance de détartrage',         reminder:'1day',  createdAt:new Date().toISOString()},
    {id:6,patientId:6,dentistId:1,date:tomorrow, time:'11:00',duration:45, service:'Pose de couronne',               status:'Confirmé',  notes:'Couronne définitive sur 46',           reminder:'2hours',createdAt:new Date().toISOString()},
    {id:7,patientId:1,dentistId:2,date:yesterday,time:'10:00',duration:60, service:'Consultation orthodontique',    status:'Terminé',   notes:'Discussion Invisalign',                 reminder:'none',  createdAt:new Date().toISOString()},
    {id:8,patientId:2,dentistId:4,date:yesterday,time:'14:30',duration:60, service:'Traitement canalaire',          status:'Terminé',   notes:'1ère séance',                           reminder:'none',  createdAt:new Date().toISOString()},
  ]);
  localStorage.setItem('dc_id_appointments','8');

  DB.set('treatments',[
    {id:1,patientId:1,dentistId:5,date:yesterday,    teeth:['11','12','21','22','31','41'],procedure:'Détartrage & Polissage',  description:'Prophylaxie complète, tartre léger',                   notes:'Bonne hygiène bucco-dentaire.',               followup:'Brossage 2x/jour, fil dentaire 1x/jour.',       cost:120, status:'Terminé',  createdAt:new Date().toISOString()},
    {id:2,patientId:2,dentistId:4,date:yesterday,    teeth:['36'],           procedure:'Traitement canalaire',    description:'Préparation biomécanique et obturation de la 36',     notes:'3 canaux. Patient bien toléré.',               followup:'Ibuprofène 400mg si douleur. Retour dans 2 sem.', cost:9500,status:'En cours', createdAt:new Date().toISOString()},
    {id:3,patientId:3,dentistId:1,date:fmt(new Date(today.getTime()-7*86400000)),  teeth:['12'],procedure:'Obturation composite',  description:'Restauration composite classe II',                     notes:'Carie MO, teinte A2.',                         followup:'Éviter les aliments durs pendant 24h.',          cost:1800,status:'Terminé',  createdAt:new Date().toISOString()},
    {id:4,patientId:6,dentistId:1,date:fmt(new Date(today.getTime()-14*86400000)), teeth:['46'],procedure:'Préparation de couronne',description:'Préparation couronne céramique intégrale, temporaire posée',notes:'Préparation sous digue. Temporaire collée.',followup:'Éviter les aliments collants. Retour dans 2 sem.',cost:7500,status:'Terminé',  createdAt:new Date().toISOString()},
    {id:5,patientId:4,dentistId:3,date:fmt(new Date(today.getTime()-30*86400000)), teeth:['14','15'],procedure:'Extraction chirurgicale',description:'Extraction chirurgicale 14 et 15',               notes:'INR 2,1 — dans les limites. Hémostase obtenue.',followup:'Compresse 30 min. Alimentation molle 3 j. Amoxicilline 500mg x7.',cost:4200,status:'Terminé',createdAt:new Date().toISOString()},
  ]);
  localStorage.setItem('dc_id_treatments','5');

  DB.set('payments',[
    {id:1,patientId:1,date:yesterday,   dueDate:'',method:'Espèces',        status:'Payé',       paidAmount:120,  discount:0,notes:'',invoiceNumber:'FAC-001',items:[{description:'Détartrage & Polissage',amount:120}],  createdAt:new Date().toISOString()},
    {id:2,patientId:2,date:yesterday,   dueDate:fmt(new Date(today.getTime()+14*86400000)),method:'Assurance',status:'Partiel',paidAmount:5000,discount:0,notes:'Dossier assurance soumis.',invoiceNumber:'FAC-002',items:[{description:'Traitement canalaire - Séance 1',amount:9500}],createdAt:new Date().toISOString()},
    {id:3,patientId:3,date:fmt(new Date(today.getTime()-7*86400000)), dueDate:'',method:'Espèces', status:'Payé',paidAmount:1800,discount:0,notes:'',invoiceNumber:'FAC-003',items:[{description:'Obturation composite 12',amount:1800}],createdAt:new Date().toISOString()},
    {id:4,patientId:6,date:fmt(new Date(today.getTime()-14*86400000)),dueDate:td,method:'Carte de débit',status:'Partiel',paidAmount:4000,discount:5,notes:'Solde dû à la pose de couronne.',invoiceNumber:'FAC-004',items:[{description:'Préparation couronne',amount:7500},{description:'Couronne provisoire',amount:800}],createdAt:new Date().toISOString()},
    {id:5,patientId:4,date:fmt(new Date(today.getTime()-30*86400000)),dueDate:'',method:'Espèces',status:'Payé',paidAmount:4200,discount:0,notes:'',invoiceNumber:'FAC-005',items:[{description:'Extraction chirurgicale 14',amount:2100},{description:'Extraction chirurgicale 15',amount:2100}],createdAt:new Date().toISOString()},
  ]);
  localStorage.setItem('dc_id_payments','5');
  localStorage.setItem('dc_id_invoices','5');

  // États dentaires saisis manuellement (en plus de ceux déduits des soins)
  localStorage.setItem('dc_chart', JSON.stringify({
    1:{ '26':{state:'caries',note:'Carie occlusale débutante, à surveiller.'}, '37':{state:'filled',note:'Ancienne obturation (2019).'} },
    2:{ '47':{state:'filled',note:''} },
    4:{ '24':{state:'extracted',note:'Remplacée par prothèse partielle.'}, '25':{state:'extracted',note:''}, '36':{state:'crown',note:''} },
    6:{ '17':{state:'filled',note:''}, '27':{state:'caries',note:'Proposer obturation au prochain RDV.'} },
  }));

  const ago = m => new Date(Date.now()-m*60000).toISOString();
  DB.set('activity',[
    {type:'appt',     text:'RDV de Sofiane Meziani : statut → En cours', time:ago(12)},
    {type:'payment',  text:'Facture FAC-004 : acompte de 4 000,00 € reçu', time:ago(95)},
    {type:'treatment',text:'Détartrage & Polissage effectué sur Amina Boudjemaa', time:ago(60*20)},
    {type:'patient',  text:'Nouvelle patiente enregistrée : Rania Belhocine', time:ago(60*26)},
    {type:'appt',     text:'Nouveau RDV pour Tarek Guettafi demain à 11:00', time:ago(60*30)},
  ]);

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
    this._bindNotifications();
    document.addEventListener('keydown',e=>{
      if (e.key!=='Escape') return;
      document.querySelectorAll('.modal').forEach(m=>m.style.display='none');
      document.getElementById('modal-overlay').classList.add('hidden');
      document.getElementById('notif-panel').classList.add('hidden');
      document.getElementById('hint-bubble').classList.add('hidden');
    });
    document.getElementById('topbar-date').textContent =
      new Date().toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
    this.applyClinicName();
    // Session conservée pendant l'onglet (rechargement de page)
    let saved=null; try { saved=sessionStorage.getItem('dc_session'); } catch {}
    if (saved && USERS[saved]) this._login(saved);
  },

  role: null,

  _bindLogin() {
    const userInp=document.getElementById('login-user');
    const passInp=document.getElementById('login-pass');
    const err=document.getElementById('login-error');
    const setRole=r=>{
      document.querySelectorAll('.role-btn').forEach(b=>b.classList.toggle('active',b.dataset.role===r));
      userInp.placeholder=r;
    };
    document.querySelectorAll('.role-btn').forEach(btn=>btn.addEventListener('click',()=>{
      setRole(btn.dataset.role);
      if (!userInp.value || USERS[userInp.value.trim().toLowerCase()]) userInp.value=btn.dataset.role;
      passInp.focus();
    }));
    userInp.addEventListener('input',()=>{ const u=userInp.value.trim().toLowerCase(); if (USERS[u]) setRole(u); });
    document.getElementById('hint-btn').addEventListener('click',e=>{
      e.stopPropagation();
      document.getElementById('hint-bubble').classList.toggle('hidden');
    });
    document.querySelectorAll('.hint-fill').forEach(b=>b.addEventListener('click',()=>{
      userInp.value=b.dataset.u; passInp.value=b.dataset.p; setRole(b.dataset.r);
      document.getElementById('hint-bubble').classList.add('hidden');
      err.classList.add('hidden');
    }));
    document.getElementById('login-form').addEventListener('submit',e=>{
      e.preventDefault();
      const u=userInp.value.trim().toLowerCase();
      const p=passInp.value;
      const card=document.querySelector('.login-card');
      if (!USERS[u] || USERS[u].password!==p) {
        const jokes=[
          'Identifiants incorrects. Même la fraise du dentiste ne passerait pas.',
          'Raté ! Essayez l\'ampoule à côté du mot de passe 💡',
          'Accès refusé. Ouvrez grand… vos yeux, et relisez l\'indice.',
        ];
        err.textContent=!USERS[u]?'Seuls « dentiste » et « assistante » ont les clés du cabinet.':jokes[Math.floor(Math.random()*jokes.length)];
        err.classList.remove('hidden');
        card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake');
        return;
      }
      err.classList.add('hidden');
      passInp.value='';
      this._login(u);
    });
    document.getElementById('logout-btn').addEventListener('click',()=>this.logout());
  },

  _login(username) {
    const user=USERS[username]; if (!user) return;
    this.role=username;
    try { sessionStorage.setItem('dc_session',username); } catch {}
    document.body.classList.toggle('role-assistante', username==='assistante');
    document.getElementById('login-screen').style.display='none';
    document.getElementById('app').classList.remove('hidden');
    document.getElementById('sidebar-user-name').textContent = user.name;
    document.getElementById('sidebar-user-role').textContent = user.label;
    document.getElementById('sidebar-avatar').textContent = user.initials;
    document.getElementById('greeting-name').textContent = user.greet;
    const h = new Date().getHours();
    document.getElementById('greeting-time').textContent = h<12?'Bonjour':h<18?'Bon après-midi':'Bonsoir';
    this.navigate('dashboard');
    this.updateBadges();
    if (!this._welcomed) { this._welcomed=true; setTimeout(()=>this.toast(user.welcome,'info'),400); }
  },

  logout() {
    try { sessionStorage.removeItem('dc_session'); } catch {}
    this.role=null; this._welcomed=false;
    document.body.classList.remove('role-assistante');
    document.querySelectorAll('.modal').forEach(m=>m.style.display='none');
    document.getElementById('modal-overlay').classList.add('hidden');
    document.getElementById('notif-panel').classList.add('hidden');
    document.getElementById('login-screen').style.display='';
    document.getElementById('app').classList.add('hidden');
    document.getElementById('login-pass').value='';
  },

  can(page) { return this.role!=='assistante' || !['reports','staff','settings'].includes(page); },

  applyClinicName() {
    const n=DB.settings().clinicName||'Dental Clinic';
    const el=document.querySelector('.logo-title'); if (el) el.textContent=n;
  },

  _notifRead: false,
  _bindNotifications() {
    const btn=document.getElementById('notif-btn');
    const panel=document.getElementById('notif-panel');
    btn.addEventListener('click',e=>{
      e.stopPropagation();
      const opening=panel.classList.contains('hidden');
      if (opening) this._renderNotifications();
      panel.classList.toggle('hidden');
      if (opening) { this._notifRead=true; document.getElementById('notif-dot').classList.remove('visible'); }
    });
    panel.addEventListener('click',e=>e.stopPropagation());
    document.addEventListener('click',e=>{
      panel.classList.add('hidden');
      if (!e.target.closest('#hint-bubble') && !e.target.closest('#hint-btn')) document.getElementById('hint-bubble').classList.add('hidden');
    });
  },
  _renderNotifications() {
    const today=Utils.today();
    const tomorrow=new Date(Date.now()+86400000).toISOString().split('T')[0];
    const appts=DB.appointments();
    const nToday=appts.filter(a=>a.date===today&&!['Annulé','Absent','Terminé'].includes(a.status)).length;
    const nTomorrow=appts.filter(a=>a.date===tomorrow&&!['Annulé','Absent'].includes(a.status)).length;
    const unpaid=DB.payments().filter(p=>['En attente','Partiel','En retard'].includes(p.status)).length;
    const funny=[
      {icon:'fa-face-grin-squint-tears',title:'Vous nous avez eus ! 😄',text:'Ce point rouge ne voulait rien dire. Il voulait juste un peu d\'attention.'},
      {icon:'fa-tooth',title:'Une dent de sagesse a demandé une augmentation',text:'Elle estime être la plus sage du cabinet. Dossier transmis au service RH.'},
      {icon:'fa-mug-hot',title:'Le café de la salle de pause est vide',text:'Statut : urgence absolue. Priorité supérieure à une rage de dents.'},
      {icon:'fa-hand-sparkles',title:'Rappel : le fil dentaire existe',text:'92 % de vos patients jurent l\'utiliser. Les 8 % restants sont honnêtes.'},
    ];
    const pick=[funny[0], funny.slice(1)[Math.floor(Math.random()*(funny.length-1))]];
    document.getElementById('notif-panel').innerHTML=`
      <div class="notif-head"><strong>Notifications</strong><span class="text-muted">${this._notifRead?'Tout est lu':'Nouveau'}</span></div>
      ${pick.map(n=>`<div class="notif-item fun"><i class="fa-solid ${n.icon}"></i><div><strong>${n.title}</strong><p>${n.text}</p></div></div>`).join('')}
      <div class="notif-item" onclick="App.navigate('appointments');Appointments.filterToday();document.getElementById('notif-panel').classList.add('hidden')"><i class="fa-solid fa-calendar-check"></i><div><strong>${nToday} rendez-vous à venir aujourd'hui</strong><p>Voir le planning du jour</p></div></div>
      <div class="notif-item" onclick="Appointments.remindTomorrow();document.getElementById('notif-panel').classList.add('hidden')"><i class="fa-brands fa-whatsapp"></i><div><strong>${nTomorrow} patient${nTomorrow>1?'s':''} à rappeler pour demain</strong><p>Envoyer les rappels en un clic</p></div></div>
      <div class="notif-item" onclick="App.navigate('payments');document.getElementById('notif-panel').classList.add('hidden')"><i class="fa-solid fa-file-invoice-dollar"></i><div><strong>${unpaid} facture${unpaid>1?'s':''} non soldée${unpaid>1?'s':''}</strong><p>Voir les paiements</p></div></div>`;
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
      this.showDetailTab(btn.dataset.tab);
    });
  },

  showDetailTab(id) {
    document.querySelectorAll('.patient-detail-main .tab').forEach(b=>b.classList.toggle('active',b.dataset.tab===id));
    document.querySelectorAll('.patient-detail-main .tab-content').forEach(c=>c.classList.toggle('active',c.id===id));
  },

  navigate(page) {
    if (!this.can(page)) { this.toast('Section réservée au dentiste. Bien essayé 😉','warning'); return; }
    this.currentPage = page;
    window.scrollTo(0,0);
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
  },

  openModal(id) {
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
    document.getElementById('notif-dot').classList.toggle('visible', !this._notifRead);
  },

  openPatient(id, tab) {
    this.currentPatientId = id;
    this.navigate('patient-detail');
    Patients.renderDetail(id);
    this.showDetailTab(tab||'detail-chart');
  },

  refreshCurrent() {
    const p=this.currentPage;
    if (p==='patient-detail' && this.currentPatientId) Patients.renderDetail(this.currentPatientId);
    else if (p==='appointments') { Appointments._renderStatusBar(DB.appointments()); Appointments.filter(); }
    else if (p==='treatments') Treatments.filter();
    else if (p==='payments') { Payments.render(); Payments.filter(); }
    else if (p==='patients') Patients.filter();
    else if (p==='dashboard') Dashboard.render();
    else if (p==='staff') Staff.render();
    this.updateBadges();
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
      <div class="schedule-item" onclick="App.openPatient(${a.patientId},'detail-appointments')" title="Ouvrir le dossier">
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

  period: 6,
  setPeriod(n, btn) {
    this.period=n;
    document.querySelectorAll('.chart-period-tabs .tab-btn').forEach(b=>b.classList.toggle('active',b===btn));
    this._renderRevenueChart(DB.payments());
  },
  _renderRevenueChart(payments) {
    const months=[],revs=[];
    for (let i=this.period-1;i>=0;i--) {
      const d=new Date(); d.setDate(1); d.setMonth(d.getMonth()-i);
      const k=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      months.push(d.toLocaleDateString('fr-FR',this.period>6?{month:'short',year:'2-digit'}:{month:'short'}));
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
  openNew() {
    this._clearForm();
    document.getElementById('modal-patient-title').innerHTML='<i class="fa-solid fa-user-plus"></i> Ajouter un patient';
    App.openModal('modal-add-patient');
  },
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
      App.closeModal('modal-add-patient');
      App.refreshCurrent();
    } else {
      const id=DB.nextId('patients');
      patients.push({id,...data,createdAt:new Date().toISOString()});
      DB.savePatients(patients);
      DB.logActivity('patient',`Nouveau patient enregistré : ${fn} ${ln}`);
      App.toast('Patient ajouté — son dossier est ouvert');
      App.closeModal('modal-add-patient');
      App.openPatient(id);
    }
    App.updateBadges();
  },
  delete(id) {
    const p=DB.patients().find(x=>x.id==id);
    if (!p) return;
    App.confirmDelete(`Supprimer le patient "${p.firstName} ${p.lastName}" ainsi que ses rendez-vous, soins, factures et fichiers ?`,()=>{
      DB.savePatients(DB.patients().filter(x=>x.id!=id));
      DB.saveAppointments(DB.appointments().filter(x=>x.patientId!=id));
      DB.saveTreatments(DB.treatments().filter(x=>x.patientId!=id));
      DB.savePayments(DB.payments().filter(x=>x.patientId!=id));
      const ch=DentalChart.all(); delete ch[id]; DentalChart.saveAll(ch);
      Files.removeForPatient(id);
      DB.logActivity('patient',`Patient supprimé : ${p.firstName} ${p.lastName}`);
      App.toast('Patient supprimé','warning');
      if (App.currentPage==='patient-detail') App.navigate('patients'); else this.render();
      App.updateBadges();
    });
  },
  deleteCurrent() { if (App.currentPatientId) this.delete(App.currentPatientId); },
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
    document.getElementById('detail-appointments-list').innerHTML=appts.length?`<div class="table-wrap"><table class="data-table"><thead><tr><th>Date</th><th>Heure</th><th>Soin</th><th>Dentiste</th><th>Statut</th></tr></thead><tbody>${appts.map(a=>`<tr class="row-link" onclick="Appointments.edit(${a.id})" title="Modifier"><td>${Utils.formatDate(a.date)}</td><td>${a.time}</td><td>${a.service}</td><td>${Utils.dentistName(a.dentistId)}</td><td>${Utils.statusBadge(a.status)}</td></tr>`).join('')}</tbody></table></div>`:'<div class="empty-state-sm"><i class="fa-solid fa-calendar-xmark"></i> Aucun rendez-vous</div>';

    const treats=DB.treatments().filter(t=>t.patientId==id).sort((a,b)=>b.date.localeCompare(a.date));
    document.getElementById('detail-treat-count').textContent=`${treats.length} soin${treats.length!==1?'s':''}`;
    document.getElementById('detail-treatments-list').innerHTML=treats.length?`<div class="table-wrap"><table class="data-table"><thead><tr><th>Date</th><th>Acte</th><th>Dents</th><th>Dentiste</th><th>Coût</th><th>Statut</th></tr></thead><tbody>${treats.map(t=>`<tr class="row-link" onclick="Treatments.edit(${t.id})" title="Modifier"><td>${Utils.formatDate(t.date)}</td><td>${t.procedure}</td><td>${(t.teeth||[]).join(', ')||'—'}</td><td>${Utils.dentistName(t.dentistId)}</td><td>${Utils.currency(t.cost)}</td><td>${Utils.statusBadge(t.status)}</td></tr>`).join('')}</tbody></table></div>`:'<div class="empty-state-sm"><i class="fa-solid fa-kit-medical"></i> Aucun soin enregistré</div>';

    const pays=DB.payments().filter(pay=>pay.patientId==id).sort((a,b)=>b.date.localeCompare(a.date));
    const totalPaid=pays.reduce((s,pay)=>s+parseFloat(pay.paidAmount||0),0);
    document.getElementById('detail-pay-count').textContent=Utils.currency(totalPaid)+' versé';
    document.getElementById('detail-payments-list').innerHTML=pays.length?`<div class="table-wrap"><table class="data-table"><thead><tr><th>Facture</th><th>Date</th><th>Total</th><th>Versé</th><th>Mode</th><th>Statut</th><th></th></tr></thead><tbody>${pays.map(pay=>{const total=pay.items.reduce((s,i)=>s+parseFloat(i.amount||0),0)*(1-(pay.discount||0)/100);return`<tr><td>${pay.invoiceNumber}</td><td>${Utils.formatDate(pay.date)}</td><td>${Utils.currency(total)}</td><td>${Utils.currency(pay.paidAmount)}</td><td>${pay.method}</td><td>${Utils.statusBadge(pay.status)}</td><td><div class="table-actions"><button class="icon-btn view" onclick="Payments.printInvoice(${pay.id})" title="Voir"><i class="fa-solid fa-eye"></i></button><button class="icon-btn edit" onclick="Payments.edit(${pay.id})" title="Modifier"><i class="fa-solid fa-pen"></i></button></div></td></tr>`;}).join('')}</tbody></table></div>`:'<div class="empty-state-sm"><i class="fa-solid fa-file-invoice-dollar"></i> Aucune facture</div>';

    DentalChart.render(id);
    Files.render(id);
  }
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
    const svcNames=[...new Set([...(DB.settings().services||[]).map(s=>s.name),...SERVICES_FR])];
    const ss=document.getElementById('appt-service'); if(ss) ss.innerHTML='<option value="">— Sélectionner —</option>'+svcNames.map(s=>`<option>${s}</option>`).join('');
  },
  openNew(prefill={}) {
    this.populateFilters();
    document.getElementById('modal-appt-title').innerHTML='<i class="fa-solid fa-calendar-plus"></i> Nouveau rendez-vous';
    document.getElementById('appt-edit-id').value='';
    const next=new Date(); next.setMinutes(0,0,0); next.setHours(Math.min(Math.max(next.getHours()+1,8),17));
    const v={patientId:'',dentistId:'',service:'',date:Utils.today(),time:next.toTimeString().slice(0,5),duration:30,status:'Planifié',reminder:'1day',notes:'',...prefill};
    if (!v.dentistId && App.role==='dentiste') v.dentistId=1;
    this._fill(v);
    App.openModal('modal-add-appointment');
  },
  _fill(a) {
    document.getElementById('appt-patient-id').value=a.patientId||'';
    document.getElementById('appt-dentist-id').value=a.dentistId||'';
    document.getElementById('appt-service').value=a.service||'';
    document.getElementById('appt-date').value=a.date||'';
    document.getElementById('appt-time').value=a.time||'';
    document.getElementById('appt-duration').value=a.duration||30;
    document.getElementById('appt-status').value=a.status||'Planifié';
    document.getElementById('appt-reminder').value=a.reminder||'none';
    document.getElementById('appt-notes').value=a.notes||'';
  },
  remind(id) {
    const a=DB.appointments().find(x=>x.id==id); if(!a) return;
    const p=DB.patients().find(x=>x.id==a.patientId);
    const appts=DB.appointments(); const i=appts.findIndex(x=>x.id==id);
    appts[i].reminderSent=new Date().toISOString(); DB.saveAppointments(appts);
    DB.logActivity('appt',`Rappel WhatsApp envoyé à ${Utils.patientName(a.patientId)}`);
    App.toast(`Rappel envoyé à ${p?p.firstName:'le patient'} : « RDV le ${Utils.formatDate(a.date)} à ${a.time} » (simulation)`,'success');
    App.refreshCurrent();
  },
  remindTomorrow() {
    const tomorrow=new Date(Date.now()+86400000).toISOString().split('T')[0];
    const appts=DB.appointments();
    const list=appts.filter(a=>a.date===tomorrow&&!['Annulé','Absent'].includes(a.status));
    if (!list.length) { App.toast('Personne à rappeler pour demain. Journée tranquille ☕','info'); return; }
    const now=new Date().toISOString();
    list.forEach(a=>{ a.reminderSent=now; });
    DB.saveAppointments(appts);
    DB.logActivity('appt',`${list.length} rappel${list.length>1?'s':''} WhatsApp envoyé${list.length>1?'s':''} pour demain`);
    App.toast(`${list.length} rappel${list.length>1?'s':''} WhatsApp envoyé${list.length>1?'s':''} : ${list.map(a=>Utils.patientName(a.patientId).split(' ')[0]).join(', ')} (simulation)`);
    App.refreshCurrent();
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
          <button class="icon-btn remind${a.reminderSent?' sent':''}" onclick="Appointments.remind(${a.id})" title="${a.reminderSent?'Rappel déjà envoyé — renvoyer':'Envoyer un rappel WhatsApp'}"><i class="fa-brands fa-whatsapp"></i></button>
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
    this.populateFilters();
    document.getElementById('modal-appt-title').innerHTML='<i class="fa-solid fa-pen"></i> Modifier le rendez-vous';
    document.getElementById('appt-edit-id').value=a.id;
    this._fill(a);
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
    App.refreshCurrent();
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
    App.closeModal('modal-add-appointment'); App.refreshCurrent();
  },
  delete(id) {
    const a=DB.appointments().find(x=>x.id==id); if(!a) return;
    App.confirmDelete(`Supprimer le rendez-vous de "${Utils.patientName(a.patientId)}" du ${Utils.formatDate(a.date)} ?`,()=>{
      DB.saveAppointments(DB.appointments().filter(x=>x.id!=id));
      DB.logActivity('appt',`RDV supprimé pour ${Utils.patientName(a.patientId)}`);
      App.toast('Rendez-vous supprimé','warning');
      App.refreshCurrent();
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
    const procs=[...new Set([...PROCEDURES_FR,...(DB.settings().services||[]).map(s=>s.name)])];
    const pr=document.getElementById('treat-procedure'); if(pr) pr.innerHTML='<option value="">— Sélectionner l\'acte —</option>'+procs.map(p=>`<option>${p}</option>`).join('');
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
    this.populateFilters();
    document.getElementById('modal-treat-title').innerHTML='<i class="fa-solid fa-pen"></i> Modifier le soin';
    document.getElementById('treat-edit-id').value=t.id;
    this._fill(t);
    App.openModal('modal-add-treatment');
  },
  openNew(prefill={}) {
    this.populateFilters();
    document.getElementById('modal-treat-title').innerHTML='<i class="fa-solid fa-syringe"></i> Saisir un soin';
    document.getElementById('treat-edit-id').value='';
    const v={patientId:'',dentistId:App.role==='dentiste'?1:'',date:Utils.today(),procedure:'',cost:'',status:'Terminé',notes:'',followup:'',teeth:[],...prefill};
    this._fill(v);
    App.openModal('modal-add-treatment');
  },
  _fill(t) {
    document.getElementById('treat-patient-id').value=t.patientId||'';
    document.getElementById('treat-dentist-id').value=t.dentistId||'';
    document.getElementById('treat-date').value=t.date||'';
    document.getElementById('treat-procedure').value=t.procedure||'';
    document.getElementById('treat-cost').value=t.cost??'';
    document.getElementById('treat-status').value=t.status||'Terminé';
    document.getElementById('treat-notes').value=t.notes||'';
    document.getElementById('treat-followup').value=t.followup||'';
    this.selectedTeeth=[...(t.teeth||[])].map(String);
    document.querySelectorAll('.mini-tooth').forEach(el=>el.classList.toggle('selected',this.selectedTeeth.includes(el.dataset.tooth)));
    document.getElementById('treat-teeth').value=this.selectedTeeth.join(',');
  },
  suggestCost() {
    const proc=document.getElementById('treat-procedure').value;
    const svc=(DB.settings().services||SERVICES_DEFAULT).find(s=>s.name===proc);
    const cost=document.getElementById('treat-cost');
    if (svc && !cost.value) cost.value=svc.price;
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
    App.closeModal('modal-add-treatment'); App.refreshCurrent();
  },
  delete(id) {
    const t=DB.treatments().find(x=>x.id==id); if(!t) return;
    App.confirmDelete(`Supprimer le soin "${t.procedure}" pour ${Utils.patientName(t.patientId)} ?`,()=>{
      App.closeModal('modal-add-treatment');
      DB.saveTreatments(DB.treatments().filter(x=>x.id!=id));
      DB.logActivity('treatment',`Soin supprimé : ${t.procedure} (${Utils.patientName(t.patientId)})`);
      App.toast('Soin supprimé','warning'); App.refreshCurrent();
    });
  }
};

/* ══════════════════════════════════════════
   SCHÉMA DENTAIRE
══════════════════════════════════════════ */
const TOOTH_STATES = {
  healthy:    'Saine',
  caries:     'Carie',
  filled:     'Obturée',
  'root-canal':'Dévitalisée',
  crown:      'Couronne',
  implant:    'Implant',
  extracted:  'Extraite',
};
const TOOTH_NAMES = {1:'Incisive centrale',2:'Incisive latérale',3:'Canine',4:'1re prémolaire',5:'2e prémolaire',6:'1re molaire',7:'2e molaire',8:'Dent de sagesse'};
const PROC_TO_STATE = {
  'Obturation composite':'filled','Obturation amalgame':'filled','Traitement canalaire':'root-canal','Pulpotomie':'root-canal',
  'Extraction dentaire':'extracted','Extraction chirurgicale':'extracted','Extraction dent de sagesse':'extracted',
  'Pose de couronne':'crown','Préparation de couronne':'crown','Pose de bridge':'crown','Implant dentaire':'implant'
};

const DentalChart = {
  pid: null,
  all()        { try { return JSON.parse(localStorage.getItem('dc_chart'))||{}; } catch { return {}; } },
  saveAll(d)   { localStorage.setItem('dc_chart', JSON.stringify(d)); },
  manual(pid)  { return this.all()[pid]||{}; },

  /* État de chaque dent : saisie manuelle prioritaire, sinon déduit des soins (le plus récent l'emporte) */
  states(pid) {
    const st={};
    DB.treatments().filter(t=>t.patientId==pid).sort((a,b)=>a.date.localeCompare(b.date)).forEach(t=>{
      const s=PROC_TO_STATE[t.procedure]; if (s) (t.teeth||[]).forEach(n=>{ st[n]=s; });
    });
    Object.entries(this.manual(pid)).forEach(([n,v])=>{ if (v.state) st[n]=v.state; });
    return st;
  },

  render(pid) {
    this.pid=pid;
    const upper=[18,17,16,15,14,13,12,11,21,22,23,24,25,26,27,28];
    const lower=[48,47,46,45,44,43,42,41,31,32,33,34,35,36,37,38];
    const st=this.states(pid);
    const mk=nums=>nums.map(n=>`<button type="button" class="tooth ${st[n]||'healthy'}" data-tooth="${n}" onclick="DentalChart.selectTooth(${n})" title="Dent ${n} · ${TOOTH_STATES[st[n]||'healthy']}"><span class="tooth-number">${n}</span><span class="tooth-icon">${st[n]==='extracted'?'✕':'🦷'}</span></button>`).join('');
    document.getElementById('teeth-upper').innerHTML=mk(upper);
    document.getElementById('teeth-lower').innerHTML=mk(lower);
    // Résumé dans le panneau tant qu'aucune dent n'est choisie
    const counts={}; Object.values(st).forEach(s=>{ counts[s]=(counts[s]||0)+1; });
    const healthy=32-Object.values(st).filter(s=>s!=='healthy').length;
    document.getElementById('tooth-detail-panel').innerHTML=`
      <div class="tooth-summary">
        <div><strong class="mono">${healthy}</strong><span>saines</span></div>
        ${['caries','filled','root-canal','crown','implant','extracted'].map(s=>`<div class="ts-${s}"><strong class="mono">${counts[s]||0}</strong><span>${TOOTH_STATES[s].toLowerCase()}</span></div>`).join('')}
      </div>
      <p class="text-muted" style="font-size:.82rem;margin-top:.75rem"><i class="fa-solid fa-arrow-pointer"></i> Sélectionnez une dent pour la modifier.</p>`;
  },

  selectTooth(n) {
    const pid=this.pid; if (!pid) return;
    document.querySelectorAll('.tooth').forEach(el=>el.classList.toggle('selected',el.dataset.tooth==String(n)));
    const st=this.states(pid)[n]||'healthy';
    const man=this.manual(pid)[n]||{};
    const treats=DB.treatments().filter(t=>t.patientId==pid&&(t.teeth||[]).includes(String(n))).sort((a,b)=>b.date.localeCompare(a.date));
    const quad=n<20?'Maxillaire droit':n<30?'Maxillaire gauche':n<40?'Mandibule gauche':'Mandibule droite';
    document.getElementById('tooth-detail-panel').innerHTML=`
      <div class="tooth-head">
        <div><h3>Dent ${n}</h3><p class="text-muted">${TOOTH_NAMES[n%10]} · ${quad}</p></div>
        <span class="tooth-legend ${st}">${TOOTH_STATES[st]}</span>
      </div>
      <label class="tooth-label">État de la dent</label>
      <div class="tooth-state-picker">
        ${Object.entries(TOOTH_STATES).map(([k,l])=>`<button type="button" class="tooth-legend ${k} ${k===st?'active':''}" onclick="DentalChart.setState(${n},'${k}')">${l}</button>`).join('')}
      </div>
      <label class="tooth-label" for="tooth-note">Note</label>
      <textarea id="tooth-note" rows="2" placeholder="Ex : sensibilité au froid, à surveiller…">${man.note||''}</textarea>
      <div class="tooth-actions">
        <button class="btn-secondary" onclick="DentalChart.saveNote(${n})"><i class="fa-solid fa-save"></i> Enregistrer la note</button>
        <button class="btn-sm-primary" onclick="Treatments.openNew({patientId:${pid},teeth:['${n}']})"><i class="fa-solid fa-plus"></i> Saisir un soin</button>
      </div>
      <label class="tooth-label">Historique des soins</label>
      ${treats.length?`<div class="tooth-history">${treats.map(t=>`<div class="tooth-history-item" onclick="Treatments.edit(${t.id})"><strong>${t.procedure}</strong><small>${Utils.formatDate(t.date)} · ${Utils.dentistName(t.dentistId)}</small>${t.notes?`<p>${t.notes}</p>`:''}</div>`).join('')}</div>`:'<div class="empty-state-sm"><i class="fa-solid fa-circle-check" style="color:var(--success)"></i> Aucun soin enregistré sur cette dent</div>'}`;
    if (window.innerWidth<1100) document.getElementById('tooth-detail-panel').scrollIntoView({behavior:'smooth',block:'nearest'});
  },

  setState(n, state) {
    const all=this.all(); all[this.pid]=all[this.pid]||{};
    all[this.pid][n]={...(all[this.pid][n]||{}), state};
    this.saveAll(all);
    DB.logActivity('treatment',`Dent ${n} de ${Utils.patientName(this.pid)} : ${TOOTH_STATES[state]}`);
    this.render(this.pid); this.selectTooth(n);
    App.toast(`Dent ${n} : ${TOOTH_STATES[state]}`);
  },

  saveNote(n) {
    const all=this.all(); all[this.pid]=all[this.pid]||{};
    all[this.pid][n]={...(all[this.pid][n]||{}), note:document.getElementById('tooth-note').value.trim()};
    this.saveAll(all);
    App.toast(`Note enregistrée pour la dent ${n}`);
  }
};

/* ══════════════════════════════════════════
   FICHIERS & RADIOS (stockés dans le navigateur)
══════════════════════════════════════════ */
const Files = {
  MAX: 1.5*1024*1024,
  all()       { try { return JSON.parse(localStorage.getItem('dc_files'))||[]; } catch { return []; } },
  saveAll(d)  { localStorage.setItem('dc_files', JSON.stringify(d)); },
  removeForPatient(pid) { this.saveAll(this.all().filter(f=>f.patientId!=pid)); },

  render(pid) {
    const list=this.all().filter(f=>f.patientId==pid).sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
    document.getElementById('detail-file-count').textContent=`${list.length} fichier${list.length>1?'s':''}`;
    document.getElementById('detail-files-list').innerHTML=list.length?list.map(f=>`
      <div class="file-card" onclick="Files.view(${f.id})" title="${f.name}">
        ${f.type.startsWith('image/')?`<div class="file-thumb" style="background-image:url('${f.data}')"></div>`:'<i class="fa-solid fa-file-pdf"></i>'}
        <p>${f.name}</p><small>${Utils.formatDate(f.createdAt.split('T')[0])}</small>
      </div>`).join(''):`<div class="empty-state-sm files-empty"><i class="fa-solid fa-x-ray"></i> Aucun fichier. Ajoutez une radio, une photo ou un PDF (max 1,5 Mo, stocké uniquement dans ce navigateur).</div>`;
  },

  upload(fileList) {
    const pid=App.currentPatientId; if (!pid||!fileList.length) return;
    [...fileList].forEach(file=>{
      if (file.size>this.MAX) { App.toast(`« ${file.name} » dépasse 1,5 Mo — trop lourd pour la démo`,'error'); return; }
      const r=new FileReader();
      r.onload=()=>{
        const all=this.all();
        const id=DB.nextId('files');
        all.push({id,patientId:pid,name:file.name,type:file.type||'application/octet-stream',data:r.result,createdAt:new Date().toISOString()});
        try { this.saveAll(all); }
        catch { App.toast('Stockage du navigateur plein. Supprimez quelques fichiers.','error'); return; }
        DB.logActivity('patient',`Fichier « ${file.name} » ajouté au dossier de ${Utils.patientName(pid)}`);
        App.toast(`« ${file.name} » ajouté`);
        this.render(pid);
      };
      r.readAsDataURL(file);
    });
  },

  view(id) {
    const f=this.all().find(x=>x.id==id); if (!f) return;
    document.getElementById('file-view-title').innerHTML=`<i class="fa-solid ${f.type.startsWith('image/')?'fa-image':'fa-file-pdf'}"></i> ${f.name}`;
    document.getElementById('file-view-content').innerHTML=f.type.startsWith('image/')
      ? `<img src="${f.data}" alt="${f.name}"/>`
      : f.type==='application/pdf' ? `<iframe src="${f.data}" title="${f.name}"></iframe>` : '<p class="text-muted">Aperçu indisponible pour ce type de fichier.</p>';
    const dl=document.getElementById('file-view-download'); dl.href=f.data; dl.download=f.name;
    document.getElementById('file-view-delete').onclick=()=>{
      App.confirmDelete(`Supprimer le fichier « ${f.name} » ?`,()=>{
        this.saveAll(this.all().filter(x=>x.id!=id));
        App.toast('Fichier supprimé','warning');
        this.render(f.patientId);
      });
    };
    App.openModal('modal-file-view');
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
    row.innerHTML=`<input type="text" list="svc-datalist" placeholder="Description (ex: Détartrage)" value="${desc}" oninput="Payments.fillPrice(this)"/><input type="number" class="amount-input" placeholder="0.00" value="${amount}" min="0" step="0.01" oninput="Payments.updateTotals()"/><button type="button" onclick="this.parentElement.remove();Payments.updateTotals()"><i class="fa-solid fa-xmark"></i></button>`;
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
  fillPrice(inp) {
    const svc=(DB.settings().services||SERVICES_DEFAULT).find(s=>s.name===inp.value);
    const amt=inp.parentElement.querySelector('.amount-input');
    if (svc && !amt.value) amt.value=svc.price;
    this.updateTotals();
  },
  _total(p) { return p.items.reduce((s,i)=>s+parseFloat(i.amount||0),0)*(1-(p.discount||0)/100); },
  _openAdd() {
    const ps=document.getElementById('pay-patient-id');
    ps.innerHTML='<option value="">— Sélectionner un patient —</option>'+DB.patients().map(p=>`<option value="${p.id}">${p.firstName} ${p.lastName}</option>`).join('');
    let dl=document.getElementById('svc-datalist');
    if (!dl) { dl=document.createElement('datalist'); dl.id='svc-datalist'; document.body.appendChild(dl); }
    dl.innerHTML=(DB.settings().services||SERVICES_DEFAULT).map(s=>`<option value="${s.name}">${Utils.currency(s.price)}</option>`).join('');
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
  openNew(prefill={}) {
    this._openAdd();
    if (prefill.patientId) document.getElementById('pay-patient-id').value=prefill.patientId;
    App.openModal('modal-add-payment');
  },
  save() {
    const pid=parseInt(document.getElementById('pay-patient-id').value);
    const dt=document.getElementById('pay-date').value;
    if (!pid||!dt) { App.toast('Veuillez sélectionner le patient et la date','error'); return null; }
    const rows=document.querySelectorAll('.pay-item-row');
    const items=[];
    rows.forEach(r=>{ const desc=r.querySelectorAll('input')[0].value.trim(); const amt=parseFloat(r.querySelectorAll('input')[1].value)||0; if(desc) items.push({description:desc,amount:amt}); });
    if (!items.length) { App.toast('Ajoutez au moins une ligne','error'); return null; }
    const editId=document.getElementById('pay-edit-id').value;
    const pays=DB.payments();
    const data={patientId:pid,date:dt,dueDate:document.getElementById('pay-due-date').value,method:document.getElementById('pay-method').value,status:document.getElementById('pay-status').value,paidAmount:parseFloat(document.getElementById('pay-paid-amount').value)||0,discount:parseFloat(document.getElementById('inv-discount').value)||0,notes:document.getElementById('pay-notes').value.trim(),items};
    // Statut cohérent avec le montant versé
    const total=this._total(data);
    if (total>0 && data.paidAmount>=total-0.005) data.status='Payé';
    else if (data.paidAmount>0 && data.status!=='En retard') data.status='Partiel';
    else if (data.paidAmount===0 && data.status==='Payé') data.status='En attente';
    let savedId;
    if (editId) {
      const i=pays.findIndex(x=>x.id==editId); pays[i]={...pays[i],...data};
      DB.savePayments(pays); App.toast('Facture modifiée'); savedId=pays[i].id;
      DB.logActivity('payment',`Facture ${pays[i].invoiceNumber} modifiée (${data.status})`);
    } else {
      const id=DB.nextId('payments');
      const inv='FAC-'+String(id).padStart(3,'0');
      pays.push({id,invoiceNumber:inv,...data,createdAt:new Date().toISOString()});
      DB.savePayments(pays);
      DB.logActivity('payment',`Facture ${inv} créée pour ${Utils.patientName(pid)}`);
      App.toast('Facture créée'); savedId=id;
    }
    App.closeModal('modal-add-payment'); App.refreshCurrent();
    return savedId;
  },
  saveAndPrint() { const id=this.save(); if (id) this.printInvoice(id); },
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
      App.toast('Facture supprimée','warning'); App.refreshCurrent();
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
    for(let i=11;i>=0;i--){const d=new Date();d.setDate(1);d.setMonth(d.getMonth()-i);const k=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;months.push(d.toLocaleDateString('fr-FR',{month:'short',year:'2-digit'}));revs.push(pays.filter(p=>p.date&&p.date.startsWith(k)).reduce((s,p)=>s+parseFloat(p.paidAmount||0),0));}
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
  openNew() {
    document.getElementById('modal-staff-title').innerHTML='<i class="fa-solid fa-user-doctor"></i> Ajouter un membre du personnel';
    document.getElementById('staff-edit-id').value='';
    ['staff-first','staff-last','staff-phone','staff-email','staff-license','staff-exp','staff-notes'].forEach(i=>document.getElementById(i).value='');
    document.getElementById('staff-role').value='Dentiste';
    App.openModal('modal-add-staff');
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
    if (s.id===1) { App.toast('On ne licencie pas la dentiste titulaire. C\'est elle qui signe les chèques 😅','warning'); return; }
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
    const sv=(id,v)=>{ const e=document.getElementById(id); if(e) e.value=v||e.defaultValue; };
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
    App.applyClinicName();
    App.toast('Paramètres enregistrés');
  },
  resetDemo() {
    App.confirmDelete('Réinitialiser la démo ? Toutes vos modifications seront effacées et les données d\'exemple restaurées.',()=>{
      clearDemoData(); seedData();
      App._notifRead=false;
      App.applyClinicName();
      App.toast('Démo réinitialisée. Comme si de rien n\'était 🪄');
      App.navigate('dashboard');
    });
  }
};

/* ── Démarrage ── */
document.addEventListener('DOMContentLoaded', () => App.init());
