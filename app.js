/**
 * PsicoGest - Lógica de Aplicación
 * Sistema de Gestión de Pacientes, Objetivos y Sesiones Clínicas
 */

// ==========================================
// 1. ESTADO GLOBAL Y PERSISTENCIA
// ==========================================

const STORAGE_KEY = 'psicogest_patients_v1';
const PRIVACY_KEY = 'psicogest_privacy_v1';

let appState = {
  patients: [],
  selectedPatientId: null,
  filterCenter: 'all',
  filterStatus: 'activos', // 'activos' | 'inactivos' | 'todos'
  searchQuery: '',
  activeTab: 'tab-overview',
  isPrivacyMode: false,
};

// Datos de ejemplo para primera carga
const SAMPLE_PATIENTS = [
  {
    id: 'pat_demo_1',
    name: 'Carlos Mendoza Silva',
    center: 'Descubriendo',
    status: 'activo',
    phone: '+51 984 123 456',
    motivo: 'Paciente acude por sintomatología ansiosa vinculada a sobrecarga laboral y dificultades para establecer límites asertivos.',
    createdAt: '2026-07-10T10:00:00.000Z',
    objectives: [
      { id: 'obj_1', text: 'Identificar distorsiones cognitivas asociadas a la catastrofización laboral', status: 'alcanzado' },
      { id: 'obj_2', text: 'Entrenar técnicas de respiración diafragmática y desactivación fisiológica', status: 'alcanzado' },
      { id: 'obj_3', text: 'Practicar habilidades de comunicación asertiva con superiores', status: 'en_progreso' },
      { id: 'obj_4', text: 'Establecer rutina de autocuidado y pausas activas', status: 'pendiente' }
    ],
    sessions: [
      {
        id: 'ses_1',
        date: '2026-08-05T16:00',
        number: 'Sesión #1 - Evaluación',
        notes: 'Entrevista inicial y encuadre terapéutico. Se exploraron detonantes de ansiedad en entorno laboral. Buena disposición al trabajo reflexivo.',
        tasks: 'Completar autoregistro de pensamientos automáticos en situaciones de estrés laboral durante 5 días.',
        nextPlan: 'Revisión del autoregistro y psicoeducación sobre el modelo cognitivo de la ansiedad.',
        createdAt: '2026-08-05T17:00:00.000Z'
      },
      {
        id: 'ses_2',
        date: '2026-08-12T16:00',
        number: 'Sesión #2 - Psicoeducación',
        notes: 'Se analizó el autoregistro. El paciente identifica tendencia al perfeccionismo e hiperresponsabilidad. Se enseñó respiración diafragmática 4-4-6.',
        tasks: 'Practicar respiración diafragmática 5 minutos al despertar y 5 minutos antes de dormir.',
        nextPlan: 'Iniciar juego de roles (role-playing) para puesta de límites.',
        createdAt: '2026-08-12T17:00:00.000Z'
      },
      {
        id: 'ses_3',
        date: '2026-08-19T16:00',
        number: 'Sesión #3 - Asertividad',
        notes: 'El paciente reporta menor tensión física durante la semana. Se realizó ensayo conductual para decir "no" a peticiones laborales extraordinarias no remuneradas.',
        tasks: 'Aplicar la técnica del disco rayado si se presenta una sobrecarga injustificada esta semana. Anotar sensaciones.',
        nextPlan: 'Evaluar respuesta del entorno y trabajar creencias nucleares de autoexigencia.',
        createdAt: '2026-08-19T17:00:00.000Z'
      }
    ]
  },
  {
    id: 'pat_demo_2',
    name: 'Valeria Quispe Paredes',
    center: 'Psicovive',
    status: 'activo',
    phone: '+51 971 889 201',
    motivo: 'Duelo reciente por ruptura de relación de 5 años y desmotivación en proyectos personales.',
    createdAt: '2026-07-25T11:30:00.000Z',
    objectives: [
      { id: 'obj_201', text: 'Validación y expresión emocional del proceso de duelo', status: 'alcanzado' },
      { id: 'obj_202', text: 'Reestructuración de proyectos y valores personales independientes', status: 'en_progreso' },
      { id: 'obj_203', text: 'Retomar red de apoyo social', status: 'pendiente' }
    ],
    sessions: [
      {
        id: 'ses_201',
        date: '2026-08-14T11:00',
        number: 'Sesión #1 - Apertura',
        notes: 'Espacio de desahogo y contención emocional. Presenta llanto frecuente pero receptiva al acompañamiento. Se normalizan etapas del duelo.',
        tasks: 'Escribir carta no enviada expresando lo que quedó pendiente por decir.',
        nextPlan: 'Trabajar el cierre simbólico y el autocuidado compasivo.',
        createdAt: '2026-08-14T12:00:00.000Z'
      }
    ]
  },
  {
    id: 'pat_demo_3',
    name: 'Luciana Morales Rivas',
    center: 'Particulares',
    status: 'activo',
    phone: '+51 993 456 789',
    motivo: 'Regulación emocional y dificultades para tolerar la frustración académica.',
    createdAt: '2026-08-01T09:00:00.000Z',
    objectives: [
      { id: 'obj_301', text: 'Identificar señales corporales tempranas de enojo y frustración', status: 'en_progreso' },
      { id: 'obj_302', text: 'Implementar pausas de enfriamiento emocional (Stop técnico)', status: 'pendiente' }
    ],
    sessions: [
      {
        id: 'ses_301',
        date: '2026-08-18T10:00',
        number: 'Sesión #1 - Encuadre',
        notes: 'Se establecieron las reglas del espacio terapéutico y se inició el termómetro emocional para cuantificar niveles de malestar.',
        tasks: 'Monitorear niveles del 1 al 10 ante dificultades en la universidad.',
        nextPlan: 'Entrenamiento en técnicas de grounding 5-4-3-2-1.',
        createdAt: '2026-08-18T11:00:00.000Z'
      }
    ]
  }
];

// ==========================================
// 2. FUNCIONES AUXILIARES Y FORMATO
// ==========================================

function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
}

function getNowDateTimeLocal() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  const localISOTime = (new Date(now - offset)).toISOString().slice(0, 16);
  return localISOTime;
}

function formatDisplayDate(dateStr) {
  if (!dateStr) return 'Sin fecha';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('es-ES', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return dateStr;
  }
}

function getCenterBadgeClass(center) {
  switch (center) {
    case 'Descubriendo':
      return 'badge-descubriendo';
    case 'Psicovive':
      return 'badge-psicovive';
    case 'Particulares':
      return 'badge-particulares';
    default:
      return 'bg-slate-100 text-slate-700 border border-slate-200';
  }
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  
  let bgClass = 'bg-slate-800 text-white';
  let iconName = 'check-circle';
  if (type === 'error') {
    bgClass = 'bg-red-600 text-white';
    iconName = 'alert-triangle';
  } else if (type === 'info') {
    bgClass = 'bg-teal-700 text-white';
    iconName = 'info';
  }

  toast.className = `flex items-center space-x-2 px-4 py-3 rounded-xl shadow-lg text-xs font-medium ${bgClass} transition-all duration-200 transform translate-y-2 opacity-0 pointer-events-auto`;
  toast.innerHTML = `
    <i data-lucide="${iconName}" class="w-4 h-4 flex-shrink-0"></i>
    <span>${escapeHtml(message)}</span>
  `;
  
  container.appendChild(toast);
  lucide.createIcons({ root: toast });

  setTimeout(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  }, 10);

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 200);
  }, 3500);
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.innerText = text;
  return div.innerHTML;
}

// ==========================================
// 3. CARGA Y GUARDADO DE DATOS
// ==========================================

function loadData() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      appState.patients = JSON.parse(stored);
      // Asegurar que todos los pacientes tengan campo status
      appState.patients.forEach(p => {
        if (!p.status) p.status = 'activo';
      });
    } catch (e) {
      console.error('Error al cargar datos de localStorage', e);
      appState.patients = SAMPLE_PATIENTS;
    }
  } else {
    // Carga inicial con datos de ejemplo
    appState.patients = SAMPLE_PATIENTS;
    saveData();
  }

  const storedPrivacy = localStorage.getItem(PRIVACY_KEY);
  if (storedPrivacy === 'true') {
    appState.isPrivacyMode = true;
    document.body.classList.add('privacy-active');
    updatePrivacyButtonUI();
  }

  // Si hay pacientes, seleccionar el primer paciente activo por defecto
  if (appState.patients.length > 0) {
    const firstActive = appState.patients.find(p => p.status !== 'inactivo') || appState.patients[0];
    appState.selectedPatientId = firstActive.id;
  }
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appState.patients));
  renderStats();
}

// ==========================================
// 4. RENDERIZADO DE LA INTERFAZ
// ==========================================

function renderAll() {
  renderStats();
  renderPatientList();
  renderPatientDetail();
  lucide.createIcons();
}

function renderStats() {
  const activePatients = appState.patients.filter(p => p.status !== 'inactivo');
  const inactiveCount = appState.patients.length - activePatients.length;

  const countDescubriendo = activePatients.filter(p => p.center === 'Descubriendo').length;
  const countPsicovive = activePatients.filter(p => p.center === 'Psicovive').length;
  const countParticulares = activePatients.filter(p => p.center === 'Particulares').length;

  document.getElementById('statDescubriendo').textContent = countDescubriendo;
  document.getElementById('statPsicovive').textContent = countPsicovive;
  document.getElementById('statParticulares').textContent = countParticulares;
  
  // Badge de total en el sidebar
  const totalDisplay = appState.filterStatus === 'activos' 
    ? activePatients.length 
    : appState.filterStatus === 'inactivos' 
      ? inactiveCount 
      : appState.patients.length;
  document.getElementById('patientCountBadge').textContent = totalDisplay;

  // Contador de estado activos / inactivos
  const statsSpan = document.getElementById('activeInactiveStats');
  if (statsSpan) {
    statsSpan.textContent = `${activePatients.length} act. / ${inactiveCount} inac.`;
  }
}

function renderPatientList() {
  const container = document.getElementById('patientListContainer');
  container.innerHTML = '';

  let filtered = appState.patients;

  // Filtrar por estado (Activos / Inactivos / Todos)
  if (appState.filterStatus === 'activos') {
    filtered = filtered.filter(p => p.status !== 'inactivo');
  } else if (appState.filterStatus === 'inactivos') {
    filtered = filtered.filter(p => p.status === 'inactivo');
  }

  // Filtrar por centro
  if (appState.filterCenter !== 'all') {
    filtered = filtered.filter(p => p.center === appState.filterCenter);
  }

  // Filtrar por búsqueda
  if (appState.searchQuery.trim() !== '') {
    const q = appState.searchQuery.toLowerCase();
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.center.toLowerCase().includes(q) ||
      (p.motivo && p.motivo.toLowerCase().includes(q))
    );
  }

  if (filtered.length === 0) {
    const emptyMsg = appState.filterStatus === 'inactivos' 
      ? 'No hay pacientes inactivos.' 
      : 'No se encontraron pacientes.';
    container.innerHTML = `
      <div class="p-6 text-center text-slate-400 text-xs">
        <i data-lucide="search-x" class="w-8 h-8 mx-auto mb-2 opacity-50"></i>
        <p>${emptyMsg}</p>
      </div>
    `;
    lucide.createIcons({ root: container });
    return;
  }

  filtered.forEach(patient => {
    const isSelected = patient.id === appState.selectedPatientId;
    const isInactive = patient.status === 'inactivo';
    const sessionCount = patient.sessions ? patient.sessions.length : 0;
    const centerClass = getCenterBadgeClass(patient.center);

    // Obtener iniciales
    const initials = patient.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || '--';

    const card = document.createElement('div');
    card.className = `patient-card p-3 rounded-xl cursor-pointer border transition flex items-center justify-between ${
      isInactive ? 'is-inactive bg-slate-50/60' : ''
    } ${
      isSelected ? 'selected shadow-sm' : 'border-transparent hover:bg-slate-50'
    }`;
    card.onclick = () => selectPatient(patient.id);

    card.innerHTML = `
      <div class="flex items-center space-x-3 min-w-0">
        <div class="w-9 h-9 rounded-xl ${isSelected ? 'bg-teal-600 text-white' : isInactive ? 'bg-slate-200 text-slate-500' : 'bg-slate-100 text-slate-600'} font-bold text-xs flex items-center justify-center flex-shrink-0">
          ${initials}
        </div>
        <div class="min-w-0">
          <div class="flex items-center space-x-1.5">
            <h4 class="font-semibold text-xs text-slate-900 truncate privacy-target ${isInactive ? 'text-slate-500' : ''}">${escapeHtml(patient.name)}</h4>
            ${isInactive ? '<span class="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-200 text-slate-600">Inactivo</span>' : ''}
          </div>
          <div class="flex items-center space-x-1.5 mt-0.5">
            <span class="text-[10px] font-medium px-1.5 py-0.2 rounded-md ${centerClass}">
              ${escapeHtml(patient.center)}
            </span>
            <span class="text-[10px] text-slate-400">• ${sessionCount} ses.</span>
          </div>
        </div>
      </div>
      <i data-lucide="chevron-right" class="w-4 h-4 text-slate-300 flex-shrink-0"></i>
    `;

    container.appendChild(card);
  });

  lucide.createIcons({ root: container });
}

function setMobileView(view) {
  const sidebar = document.getElementById('patientSidebar');
  const main = document.getElementById('mainContent');
  if (!sidebar || !main) return;

  if (window.innerWidth < 768) {
    if (view === 'list') {
      sidebar.classList.remove('hidden');
      sidebar.classList.add('flex');
      main.classList.remove('flex');
      main.classList.add('hidden');
    } else {
      sidebar.classList.remove('flex');
      sidebar.classList.add('hidden');
      main.classList.remove('hidden');
      main.classList.add('flex');
    }
  } else {
    sidebar.classList.remove('hidden');
    sidebar.classList.add('flex');
    main.classList.remove('hidden');
    main.classList.add('flex');
  }
  lucide.createIcons();
}

function selectPatient(patientId) {
  appState.selectedPatientId = patientId;
  renderPatientList();
  renderPatientDetail();
  setMobileView('detail');
}

function renderPatientDetail() {
  const emptyView = document.getElementById('emptyStateView');
  const detailView = document.getElementById('patientDetailView');

  if (!appState.selectedPatientId) {
    emptyView.classList.remove('hidden');
    detailView.classList.add('hidden');
    return;
  }

  const patient = appState.patients.find(p => p.id === appState.selectedPatientId);
  if (!patient) {
    appState.selectedPatientId = null;
    emptyView.classList.remove('hidden');
    detailView.classList.add('hidden');
    return;
  }

  emptyView.classList.add('hidden');
  detailView.classList.remove('hidden');

  const isInactive = patient.status === 'inactivo';

  // Actualizar Header
  const initials = patient.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || '--';
  document.getElementById('patientAvatar').textContent = initials;
  document.getElementById('patientNameHeader').textContent = patient.name;
  
  // Badge de Estado (Activo / Inactivo)
  const statusBadge = document.getElementById('patientStatusBadge');
  if (statusBadge) {
    statusBadge.textContent = isInactive ? 'Inactivo' : 'Activo';
    statusBadge.className = `text-xs font-semibold px-2.5 py-0.5 rounded-full ${isInactive ? 'badge-status-inactivo' : 'badge-status-activo'}`;
  }

  const badgeCenter = document.getElementById('patientCenterBadge');
  badgeCenter.textContent = patient.center;
  badgeCenter.className = `text-xs font-semibold px-2.5 py-0.5 rounded-full ${getCenterBadgeClass(patient.center)}`;

  const sessions = patient.sessions || [];
  document.getElementById('patientSessionCountBadge').textContent = `${sessions.length} ${sessions.length === 1 ? 'sesión' : 'sesiones'}`;
  document.getElementById('historyBadgeCount').textContent = sessions.length;
  document.getElementById('patientMotivoHeader').textContent = patient.motivo || 'Motivo de consulta no especificado';

  // Ficha General
  document.getElementById('cardDetailCenter').textContent = patient.center;
  document.getElementById('cardDetailPhone').textContent = patient.phone || 'No especificado';
  document.getElementById('cardDetailFirstDate').textContent = formatDisplayDate(patient.createdAt || sessions[0]?.date);
  document.getElementById('cardDetailMotivo').textContent = patient.motivo || 'Sin notas iniciales registradas.';

  // Renderizar pestañas
  renderObjectives(patient);
  renderLastSessionSummary(patient);
  renderHistoryTimeline(patient);
  populatePatientSelectOptions(patient.id);

  lucide.createIcons();
}

// ==========================================
// 5. VISUALIZADOR DE OBJETIVOS
// ==========================================

function renderObjectives(patient) {
  const container = document.getElementById('objectivesListContainer');
  const objectives = patient.objectives || [];
  container.innerHTML = '';

  const total = objectives.length;
  const completed = objectives.filter(o => o.status === 'alcanzado').length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  document.getElementById('objectivesProgressPercent').textContent = `${percent}% (${completed}/${total} completados)`;
  document.getElementById('objectivesProgressBar').style.width = `${percent}%`;

  if (total === 0) {
    container.innerHTML = `
      <div class="p-4 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
        <p>No se han definido objetivos terapéuticos aún.</p>
        <button onclick="openPatientModal(true)" class="mt-2 text-teal-600 font-semibold hover:underline">
          + Definir Objetivos
        </button>
      </div>
    `;
    return;
  }

  objectives.forEach(obj => {
    const item = document.createElement('div');
    let statusBadge = '';
    let statusClass = '';

    if (obj.status === 'alcanzado') {
      statusBadge = '<span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">Alcanzado</span>';
      statusClass = 'border-emerald-200 bg-emerald-50/30';
    } else if (obj.status === 'en_progreso') {
      statusBadge = '<span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">En Progreso</span>';
      statusClass = 'border-teal-200 bg-teal-50/20';
    } else {
      statusBadge = '<span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">Pendiente</span>';
      statusClass = 'border-slate-200 bg-white';
    }

    item.className = `p-3 rounded-xl border ${statusClass} flex items-center justify-between gap-3 text-xs transition`;
    item.innerHTML = `
      <div class="flex items-start space-x-2.5 min-w-0">
        <button onclick="toggleObjectiveStatus('${patient.id}', '${obj.id}')" title="Clic para cambiar estado" class="mt-0.5 text-slate-400 hover:text-teal-600 flex-shrink-0">
          <i data-lucide="${obj.status === 'alcanzado' ? 'check-circle-2' : obj.status === 'en_progreso' ? 'clock' : 'circle'}" class="w-4 h-4 ${obj.status === 'alcanzado' ? 'text-emerald-600' : obj.status === 'en_progreso' ? 'text-teal-600' : 'text-slate-300'}"></i>
        </button>
        <span class="text-slate-800 font-medium ${obj.status === 'alcanzado' ? 'line-through text-slate-400' : ''}">${escapeHtml(obj.text)}</span>
      </div>
      <div class="flex items-center space-x-2 flex-shrink-0">
        <button onclick="toggleObjectiveStatus('${patient.id}', '${obj.id}')" title="Cambiar estado" class="cursor-pointer">
          ${statusBadge}
        </button>
      </div>
    `;
    container.appendChild(item);
  });

  // Actualizar también la lista en el formulario de sesión
  updateFormObjectivesReminder(patient);
}

function toggleObjectiveStatus(patientId, objectiveId) {
  const patient = appState.patients.find(p => p.id === patientId);
  if (!patient || !patient.objectives) return;

  const obj = patient.objectives.find(o => o.id === objectiveId);
  if (!obj) return;

  // Ciclo de estados: pendiente -> en_progreso -> alcanzado -> pendiente
  if (obj.status === 'pendiente') {
    obj.status = 'en_progreso';
  } else if (obj.status === 'en_progreso') {
    obj.status = 'alcanzado';
  } else {
    obj.status = 'pendiente';
  }

  saveData();
  renderObjectives(patient);
  showToast(`Estado de objetivo actualizado a: ${obj.status.replace('_', ' ')}`);
}

function updateFormObjectivesReminder(patient) {
  const reminderList = document.getElementById('formObjectivesList');
  reminderList.innerHTML = '';

  const activeObjectives = (patient.objectives || []).filter(o => o.status !== 'alcanzado');

  if (activeObjectives.length === 0) {
    reminderList.innerHTML = '<li class="text-slate-500 italic">No hay objetivos pendientes (o todos han sido alcanzados).</li>';
    return;
  }

  activeObjectives.forEach(obj => {
    const li = document.createElement('li');
    li.textContent = `${obj.text} (${obj.status === 'en_progreso' ? 'En progreso' : 'Pendiente'})`;
    reminderList.appendChild(li);
  });
}

// ==========================================
// 6. RESUMEN DE ÚLTIMA SESIÓN Y TAREAS
// ==========================================

function renderLastSessionSummary(patient) {
  const sessions = patient.sessions || [];
  const tasksBox = document.getElementById('lastSessionTasksBox');
  const planBox = document.getElementById('lastSessionNextPlanBox');

  if (sessions.length === 0) {
    tasksBox.innerHTML = '<p class="text-slate-400 italic">No hay sesiones anteriores registradas.</p>';
    planBox.innerHTML = '<p class="text-slate-400 italic">No hay plan previo registrado.</p>';
    return;
  }

  // Ordenar por fecha descendente
  const sortedSessions = [...sessions].sort((a, b) => new Date(b.date) - new Date(a.date));
  const latest = sortedSessions[0];

  if (latest.tasks && latest.tasks.trim() !== '') {
    tasksBox.innerHTML = `
      <div class="space-y-1">
        <span class="text-[10px] font-semibold text-amber-800 uppercase tracking-wider block">De la ${escapeHtml(latest.number || 'última sesión')} (${formatDisplayDate(latest.date)}):</span>
        <p class="text-slate-800 whitespace-pre-line leading-relaxed">${escapeHtml(latest.tasks)}</p>
      </div>
    `;
  } else {
    tasksBox.innerHTML = '<p class="text-slate-400 italic">No se anotaron tareas en la última sesión.</p>';
  }

  if (latest.nextPlan && latest.nextPlan.trim() !== '') {
    planBox.innerHTML = `
      <div class="space-y-1">
        <span class="text-[10px] font-semibold text-indigo-800 uppercase tracking-wider block">Propuesto en ${escapeHtml(latest.number || 'última sesión')}:</span>
        <p class="text-slate-800 whitespace-pre-line leading-relaxed">${escapeHtml(latest.nextPlan)}</p>
      </div>
    `;
  } else {
    planBox.innerHTML = '<p class="text-slate-400 italic">No se anotó plan específico para la siguiente sesión.</p>';
  }
}

// ==========================================
// 7. HISTORIAL DE SESIONES
// ==========================================

function renderHistoryTimeline(patient) {
  const container = document.getElementById('sessionHistoryTimeline');
  container.innerHTML = '';

  const sessions = patient.sessions || [];
  const query = (document.getElementById('sessionSearchInput')?.value || '').toLowerCase();

  let filteredSessions = [...sessions].sort((a, b) => new Date(b.date) - new Date(a.date));

  if (query.trim() !== '') {
    filteredSessions = filteredSessions.filter(s => 
      (s.number && s.number.toLowerCase().includes(query)) ||
      (s.notes && s.notes.toLowerCase().includes(query)) ||
      (s.tasks && s.tasks.toLowerCase().includes(query)) ||
      (s.nextPlan && s.nextPlan.toLowerCase().includes(query))
    );
  }

  if (filteredSessions.length === 0) {
    container.innerHTML = `
      <div class="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 text-xs shadow-sm">
        <i data-lucide="calendar-x" class="w-8 h-8 mx-auto mb-2 opacity-50"></i>
        <p>${query ? 'No se encontraron sesiones con ese texto.' : 'No hay sesiones registradas para este paciente todavía.'}</p>
        <button onclick="switchTab('tab-new-session')" class="mt-3 inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition">
          <i data-lucide="plus-circle" class="w-3.5 h-3.5 mr-1"></i>
          Registrar Primera Sesión
        </button>
      </div>
    `;
    lucide.createIcons({ root: container });
    return;
  }

  filteredSessions.forEach((session, index) => {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 hover:border-teal-200 transition';

    card.innerHTML = `
      <!-- Encabezado de Sesión -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
        <div class="flex items-center space-x-2">
          <span class="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 font-bold text-xs flex items-center justify-center border border-teal-100">
            ${filteredSessions.length - index}
          </span>
          <div>
            <h4 class="font-bold text-slate-900 text-sm">${escapeHtml(session.number || 'Sesión Clínica')}</h4>
            <span class="text-[11px] text-slate-500 flex items-center mt-0.5">
              <i data-lucide="clock" class="w-3 h-3 mr-1 text-slate-400"></i>
              ${formatDisplayDate(session.date)}
            </span>
          </div>
        </div>

        <div class="flex items-center space-x-2 no-print self-end sm:self-center">
          <button onclick="editSession('${patient.id}', '${session.id}')" class="text-xs text-slate-600 hover:text-teal-700 font-medium px-2.5 py-1 rounded-lg hover:bg-slate-100 border border-slate-200 transition flex items-center">
            <i data-lucide="pencil" class="w-3 h-3 mr-1"></i>
            Editar
          </button>
          <button onclick="deleteSession('${patient.id}', '${session.id}')" class="text-xs text-red-600 hover:text-red-700 font-medium px-2 py-1 rounded-lg hover:bg-red-50 transition flex items-center" title="Eliminar sesión">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      </div>

      <!-- Notas y Evolución -->
      <div class="text-xs text-slate-700 space-y-1">
        <span class="font-semibold text-slate-900 block text-[11px] uppercase tracking-wider text-slate-400">Desarrollo de la Sesión:</span>
        <p class="whitespace-pre-line leading-relaxed bg-slate-50/70 p-3 rounded-xl border border-slate-100">${escapeHtml(session.notes)}</p>
      </div>

      <!-- Tareas y Plan -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div class="bg-amber-50/50 p-3 rounded-xl border border-amber-100">
          <span class="font-bold text-amber-800 flex items-center mb-1 text-[11px]">
            <i data-lucide="check-square" class="w-3.5 h-3.5 mr-1"></i>
            Tareas Dejadas:
          </span>
          <p class="text-slate-700 whitespace-pre-line">${session.tasks ? escapeHtml(session.tasks) : '<span class="text-slate-400 italic">Ninguna</span>'}</p>
        </div>

        <div class="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
          <span class="font-bold text-indigo-800 flex items-center mb-1 text-[11px]">
            <i data-lucide="compass" class="w-3.5 h-3.5 mr-1"></i>
            Plan Próxima Sesión:
          </span>
          <p class="text-slate-700 whitespace-pre-line">${session.nextPlan ? escapeHtml(session.nextPlan) : '<span class="text-slate-400 italic">Ninguno</span>'}</p>
        </div>
      </div>
    `;

    container.appendChild(card);
  });

  lucide.createIcons({ root: container });
}

// ==========================================
// 8. FORMULARIO DE NUEVA / EDICIÓN DE SESIÓN
// ==========================================

function populatePatientSelectOptions(selectedId) {
  const select = document.getElementById('sessionPatientSelect');
  select.innerHTML = '';

  // Ordenar: activos primero
  const sorted = [...appState.patients].sort((a, b) => {
    if (a.status === 'inactivo' && b.status !== 'inactivo') return 1;
    if (a.status !== 'inactivo' && b.status === 'inactivo') return -1;
    return a.name.localeCompare(b.name);
  });

  sorted.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.id;
    const inactiveTag = p.status === 'inactivo' ? ' [Inactivo]' : '';
    opt.textContent = `${p.name} (${p.center})${inactiveTag}`;
    if (p.id === selectedId) opt.selected = true;
    select.appendChild(opt);
  });
}

function resetSessionForm() {
  document.getElementById('formSession').reset();
  document.getElementById('editingSessionId').value = '';
  document.getElementById('sessionDateInput').value = getNowDateTimeLocal();
  document.getElementById('sessionFormTitle').textContent = 'Registrar Nueva Sesión Clínica';
  document.getElementById('btnSaveSessionText').textContent = 'Guardar Sesión';
  document.getElementById('btnCancelEditSession').classList.add('hidden');

  // Sugerir número de sesión
  const patient = appState.patients.find(p => p.id === appState.selectedPatientId);
  if (patient) {
    const nextNum = (patient.sessions ? patient.sessions.length : 0) + 1;
    document.getElementById('sessionNumberInput').value = `Sesión #${nextNum}`;
    updateFormObjectivesReminder(patient);
  }
}

function editSession(patientId, sessionId) {
  const patient = appState.patients.find(p => p.id === patientId);
  if (!patient || !patient.sessions) return;

  const session = patient.sessions.find(s => s.id === sessionId);
  if (!session) return;

  switchTab('tab-new-session');

  document.getElementById('editingSessionId').value = session.id;
  document.getElementById('sessionPatientSelect').value = patient.id;
  document.getElementById('sessionDateInput').value = session.date || getNowDateTimeLocal();
  document.getElementById('sessionNumberInput').value = session.number || '';
  document.getElementById('sessionNotesInput').value = session.notes || '';
  document.getElementById('sessionTasksInput').value = session.tasks || '';
  document.getElementById('sessionNextPlanInput').value = session.nextPlan || '';

  document.getElementById('sessionFormTitle').textContent = 'Modificar Sesión Clínica';
  document.getElementById('btnSaveSessionText').textContent = 'Actualizar Sesión';
  document.getElementById('btnCancelEditSession').classList.remove('hidden');

  updateFormObjectivesReminder(patient);
}

function deleteSession(patientId, sessionId) {
  if (!confirm('¿Estás seguro de eliminar esta sesión del historial?')) return;

  const patient = appState.patients.find(p => p.id === patientId);
  if (!patient || !patient.sessions) return;

  patient.sessions = patient.sessions.filter(s => s.id !== sessionId);
  saveData();
  renderPatientDetail();
  showToast('Sesión eliminada correctamente');
}

// Guardar sesión (Nueva o Editada)
document.getElementById('formSession').addEventListener('submit', (e) => {
  e.preventDefault();

  const patientId = document.getElementById('sessionPatientSelect').value;
  const editingSessionId = document.getElementById('editingSessionId').value;
  const dateVal = document.getElementById('sessionDateInput').value;
  const numberVal = document.getElementById('sessionNumberInput').value.trim();
  const notesVal = document.getElementById('sessionNotesInput').value.trim();
  const tasksVal = document.getElementById('sessionTasksInput').value.trim();
  const nextPlanVal = document.getElementById('sessionNextPlanInput').value.trim();

  const patient = appState.patients.find(p => p.id === patientId);
  if (!patient) {
    showToast('Por favor selecciona un paciente válido.', 'error');
    return;
  }

  if (!patient.sessions) patient.sessions = [];

  if (editingSessionId) {
    // Editar existente
    const sesIndex = patient.sessions.findIndex(s => s.id === editingSessionId);
    if (sesIndex !== -1) {
      patient.sessions[sesIndex] = {
        ...patient.sessions[sesIndex],
        date: dateVal,
        number: numberVal || `Sesión #${patient.sessions.length}`,
        notes: notesVal,
        tasks: tasksVal,
        nextPlan: nextPlanVal,
        updatedAt: new Date().toISOString()
      };
      showToast('Sesión actualizada exitosamente');
    }
  } else {
    // Crear nueva sesión
    const newSession = {
      id: generateId('ses'),
      date: dateVal,
      number: numberVal || `Sesión #${patient.sessions.length + 1}`,
      notes: notesVal,
      tasks: tasksVal,
      nextPlan: nextPlanVal,
      createdAt: new Date().toISOString()
    };
    patient.sessions.push(newSession);
    showToast('Nueva sesión guardada con éxito');
  }

  saveData();
  resetSessionForm();
  appState.selectedPatientId = patientId;
  switchTab('tab-overview');
  renderAll();
});

// ==========================================
// 9. MODAL DE PACIENTE (CREAR / EDITAR)
// ==========================================

function openPatientModal(isEdit = false) {
  const modal = document.getElementById('patientModal');
  const title = document.getElementById('modalPatientTitle');
  const form = document.getElementById('formPatient');
  const deleteBtn = document.getElementById('btnDeletePatient');
  const objContainer = document.getElementById('modalObjectivesContainer');
  const statusToggle = document.getElementById('patientStatusToggle');
  const statusLabel = document.getElementById('patientStatusLabel');

  form.reset();
  objContainer.innerHTML = '';

  if (isEdit && appState.selectedPatientId) {
    const patient = appState.patients.find(p => p.id === appState.selectedPatientId);
    if (!patient) return;

    title.textContent = 'Editar Información del Paciente';
    document.getElementById('editingPatientId').value = patient.id;
    document.getElementById('patientNameInput').value = patient.name;
    document.getElementById('patientPhoneInput').value = patient.phone || '';
    document.getElementById('patientMotivoInput').value = patient.motivo || '';
    
    // Estado activo / inactivo
    const isInactive = patient.status === 'inactivo';
    if (statusToggle) statusToggle.checked = !isInactive;
    if (statusLabel) {
      statusLabel.textContent = isInactive ? 'Inactivo' : 'Activo';
      statusLabel.className = `text-xs font-bold ${isInactive ? 'text-slate-400' : 'text-emerald-600'}`;
    }

    // Seleccionar radio de centro
    const centerRadio = document.querySelector(`input[name="patientCenter"][value="${patient.center}"]`);
    if (centerRadio) centerRadio.checked = true;

    // Cargar objetivos en el modal
    if (patient.objectives && patient.objectives.length > 0) {
      patient.objectives.forEach(obj => addObjectiveRow(obj.text, obj.status, obj.id));
    } else {
      addObjectiveRow('', 'pendiente');
    }

    deleteBtn.classList.remove('hidden');
  } else {
    title.textContent = 'Registrar Nuevo Paciente';
    document.getElementById('editingPatientId').value = '';
    deleteBtn.classList.add('hidden');
    
    if (statusToggle) statusToggle.checked = true;
    if (statusLabel) {
      statusLabel.textContent = 'Activo';
      statusLabel.className = 'text-xs font-bold text-emerald-600';
    }

    // Por defecto seleccionar primer centro
    document.querySelector('input[name="patientCenter"][value="Descubriendo"]').checked = true;

    // Agregar 2 filas de objetivos vacías para guiar
    addObjectiveRow('', 'pendiente');
    addObjectiveRow('', 'pendiente');
  }

  modal.classList.remove('hidden');
  lucide.createIcons({ root: modal });
}

function closePatientModal() {
  document.getElementById('patientModal').classList.add('hidden');
}

function addObjectiveRow(text = '', status = 'pendiente', id = null) {
  const container = document.getElementById('modalObjectivesContainer');
  const rowId = id || generateId('obj');
  const row = document.createElement('div');
  row.className = 'flex items-center space-x-2 objective-input-row';
  row.dataset.id = rowId;

  row.innerHTML = `
    <select class="obj-status-select text-[11px] bg-slate-50 border border-slate-200 rounded-lg px-2 py-2 focus:outline-none focus:ring-1 focus:ring-teal-500">
      <option value="pendiente" ${status === 'pendiente' ? 'selected' : ''}>Pendiente</option>
      <option value="en_progreso" ${status === 'en_progreso' ? 'selected' : ''}>En progreso</option>
      <option value="alcanzado" ${status === 'alcanzado' ? 'selected' : ''}>Alcanzado</option>
    </select>
    <input 
      type="text" 
      class="obj-text-input flex-1 text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-teal-500" 
      placeholder="Escribe un objetivo terapéutico..."
      value="${escapeHtml(text)}"
    />
    <button type="button" onclick="this.parentElement.remove()" class="text-slate-400 hover:text-red-500 p-1.5 transition">
      <i data-lucide="trash" class="w-3.5 h-3.5"></i>
    </button>
  `;

  container.appendChild(row);
  lucide.createIcons({ root: row });
}

// Guardar Paciente desde Modal
document.getElementById('formPatient').addEventListener('submit', (e) => {
  e.preventDefault();

  const editingId = document.getElementById('editingPatientId').value;
  const nameVal = document.getElementById('patientNameInput').value.trim();
  const phoneVal = document.getElementById('patientPhoneInput').value.trim();
  const motivoVal = document.getElementById('patientMotivoInput').value.trim();
  const centerRadio = document.querySelector('input[name="patientCenter"]:checked');
  const centerVal = centerRadio ? centerRadio.value : 'Particulares';
  const statusToggle = document.getElementById('patientStatusToggle');
  const statusVal = (statusToggle && !statusToggle.checked) ? 'inactivo' : 'activo';

  // Recolectar objetivos
  const objRows = document.querySelectorAll('.objective-input-row');
  const objectives = [];
  objRows.forEach(row => {
    const textInput = row.querySelector('.obj-text-input').value.trim();
    const statusSelect = row.querySelector('.obj-status-select').value;
    if (textInput !== '') {
      objectives.push({
        id: row.dataset.id || generateId('obj'),
        text: textInput,
        status: statusSelect
      });
    }
  });

  if (editingId) {
    // Editar
    const patient = appState.patients.find(p => p.id === editingId);
    if (patient) {
      patient.name = nameVal;
      patient.center = centerVal;
      patient.status = statusVal;
      patient.phone = phoneVal;
      patient.motivo = motivoVal;
      patient.objectives = objectives;
      showToast(statusVal === 'inactivo' ? 'Paciente marcado como Inactivo' : 'Paciente actualizado correctamente');
      
      // Si el paciente se puso inactivo y estamos filtrando solo activos
      if (statusVal === 'inactivo' && appState.filterStatus === 'activos') {
        const nextActive = appState.patients.find(p => p.id !== editingId && p.status !== 'inactivo');
        appState.selectedPatientId = nextActive ? nextActive.id : null;
      }
    }
  } else {
    // Nuevo
    const newPatient = {
      id: generateId('pat'),
      name: nameVal,
      center: centerVal,
      status: statusVal,
      phone: phoneVal,
      motivo: motivoVal,
      createdAt: new Date().toISOString(),
      objectives: objectives,
      sessions: []
    };
    appState.patients.unshift(newPatient);
    appState.selectedPatientId = newPatient.id;
    showToast('Nuevo paciente registrado');
  }

  saveData();
  closePatientModal();
  renderAll();
});

// Eliminar paciente
document.getElementById('btnDeletePatient').addEventListener('click', () => {
  const editingId = document.getElementById('editingPatientId').value;
  if (!editingId) return;

  const patient = appState.patients.find(p => p.id === editingId);
  if (!patient) return;

  if (confirm(`¿Estás seguro de eliminar permanentemente a ${patient.name} y todas sus sesiones? Esta acción no se puede deshacer.`)) {
    appState.patients = appState.patients.filter(p => p.id !== editingId);
    appState.selectedPatientId = appState.patients.length > 0 ? appState.patients[0].id : null;
    saveData();
    closePatientModal();
    renderAll();
    showToast('Paciente eliminado');
  }
});

// ==========================================
// 10. GESTIÓN DE PESTAÑAS Y NAVEGACIÓN
// ==========================================

function switchTab(tabId) {
  appState.activeTab = tabId;

  // Actualizar botones de pestaña
  document.querySelectorAll('.patient-tab-btn').forEach(btn => {
    if (btn.dataset.tab === tabId) {
      btn.classList.add('active', 'border-teal-600', 'text-teal-700');
      btn.classList.remove('border-transparent', 'text-slate-500');
    } else {
      btn.classList.remove('active', 'border-teal-600', 'text-teal-700');
      btn.classList.add('border-transparent', 'text-slate-500');
    }
  });

  // Mostrar contenedor correspondiente
  document.querySelectorAll('.tab-content').forEach(content => {
    if (content.id === tabId) {
      content.classList.remove('hidden');
    } else {
      content.classList.add('hidden');
    }
  });

  // Si cambiamos a nueva sesión, asegurar fecha actual si está vacía
  if (tabId === 'tab-new-session') {
    if (!document.getElementById('sessionDateInput').value) {
      document.getElementById('sessionDateInput').value = getNowDateTimeLocal();
    }
    const patient = appState.patients.find(p => p.id === appState.selectedPatientId);
    if (patient) {
      populatePatientSelectOptions(patient.id);
      updateFormObjectivesReminder(patient);
    }
  }
}

// ==========================================
// 11. COPIAS DE SEGURIDAD (EXPORTAR / IMPORTAR)
// ==========================================

function exportBackupJSON() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appState.patients, null, 2));
  const downloadAnchor = document.createElement('a');
  const dateStamp = new Date().toISOString().split('T')[0];
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `PsicoGest_Respaldo_${dateStamp}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  showToast('Respaldo descargado exitosamente');
}

function importBackupJSON(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const importedData = JSON.parse(e.target.result);
      if (Array.isArray(importedData)) {
        appState.patients = importedData;
        appState.selectedPatientId = appState.patients.length > 0 ? appState.patients[0].id : null;
        saveData();
        renderAll();
        document.getElementById('backupModal').classList.add('hidden');
        showToast('Copia de seguridad restaurada correctamente');
      } else {
        showToast('El archivo no tiene el formato válido de PsicoGest.', 'error');
      }
    } catch (err) {
      showToast('Error al leer el archivo JSON.', 'error');
    }
  };
  reader.readAsText(file);
}

// ==========================================
// 12. MODO PRIVACIDAD
// ==========================================

function togglePrivacyMode() {
  appState.isPrivacyMode = !appState.isPrivacyMode;
  document.body.classList.toggle('privacy-active', appState.isPrivacyMode);
  localStorage.setItem(PRIVACY_KEY, appState.isPrivacyMode);
  updatePrivacyButtonUI();
  showToast(appState.isPrivacyMode ? 'Modo Privacidad Activado' : 'Modo Privacidad Desactivado', 'info');
}

function updatePrivacyButtonUI() {
  const icon = document.getElementById('privacyIcon');
  const text = document.getElementById('privacyText');
  const btn = document.getElementById('btnPrivacyToggle');

  if (appState.isPrivacyMode) {
    icon.setAttribute('data-lucide', 'eye-off');
    btn.classList.add('bg-amber-100', 'text-amber-800');
    text.textContent = 'Oculto';
  } else {
    icon.setAttribute('data-lucide', 'eye');
    btn.classList.remove('bg-amber-100', 'text-amber-800');
    text.textContent = 'Privacidad';
  }
  lucide.createIcons({ root: btn });
}

// ==========================================
// 13. INICIALIZACIÓN DE EVENTOS
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  loadData();

  // Filtros de Centro
  document.querySelectorAll('.filter-center-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-center-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      appState.filterCenter = btn.dataset.center;
      renderPatientList();
    });
  });

  // Filtros de Estado (Activos / Inactivos / Todos)
  document.querySelectorAll('.filter-status-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-status-btn').forEach(b => {
        b.classList.remove('active', 'bg-teal-100/80', 'text-teal-800', 'border-teal-200');
        b.classList.add('text-slate-600');
      });
      btn.classList.add('active', 'bg-teal-100/80', 'text-teal-800', 'border-teal-200');
      btn.classList.remove('text-slate-600');
      appState.filterStatus = btn.dataset.status;
      renderStats();
      renderPatientList();
    });
  });

  // Cambio en interruptor deslizador de estado en el modal
  document.getElementById('patientStatusToggle')?.addEventListener('change', (e) => {
    const label = document.getElementById('patientStatusLabel');
    if (label) {
      if (e.target.checked) {
        label.textContent = 'Activo';
        label.className = 'text-xs font-bold text-emerald-600';
      } else {
        label.textContent = 'Inactivo';
        label.className = 'text-xs font-bold text-slate-400';
      }
    }
  });

  // Búsqueda en tiempo real
  const searchInput = document.getElementById('searchInput');
  const btnClearSearch = document.getElementById('btnClearSearch');

  searchInput.addEventListener('input', (e) => {
    appState.searchQuery = e.target.value;
    btnClearSearch.classList.toggle('hidden', !appState.searchQuery);
    renderPatientList();
  });

  btnClearSearch.addEventListener('click', () => {
    searchInput.value = '';
    appState.searchQuery = '';
    btnClearSearch.classList.add('hidden');
    renderPatientList();
  });

  // Búsqueda en Historial de Sesiones
  document.getElementById('sessionSearchInput')?.addEventListener('input', () => {
    const patient = appState.patients.find(p => p.id === appState.selectedPatientId);
    if (patient) renderHistoryTimeline(patient);
  });

  // Pestañas
  document.querySelectorAll('.patient-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // Botones de Modales
  document.getElementById('btnOpenNewPatientModal').addEventListener('click', () => openPatientModal(false));
  document.getElementById('btnEmptyNewPatient').addEventListener('click', () => openPatientModal(false));
  document.getElementById('btnTabEditPatient').addEventListener('click', () => openPatientModal(true));
  document.getElementById('btnClosePatientModal').addEventListener('click', closePatientModal);
  document.getElementById('btnCancelPatientModal').addEventListener('click', closePatientModal);
  document.getElementById('btnAddObjectiveRow').addEventListener('click', () => addObjectiveRow('', 'pendiente'));

  document.getElementById('btnQuickAddObjective').addEventListener('click', () => openPatientModal(true));

  // Nueva Sesión
  document.getElementById('btnQuickNewSession').addEventListener('click', () => {
    if (appState.patients.length === 0) {
      openPatientModal(false);
    } else {
      resetSessionForm();
      switchTab('tab-new-session');
    }
  });

  document.getElementById('btnTabNewSession').addEventListener('click', () => {
    resetSessionForm();
    switchTab('tab-new-session');
  });

  document.getElementById('btnEmptyNewSession').addEventListener('click', () => {
    if (appState.patients.length === 0) {
      openPatientModal(false);
    } else {
      resetSessionForm();
      switchTab('tab-new-session');
    }
  });

  document.getElementById('btnCancelEditSession').addEventListener('click', resetSessionForm);
  document.getElementById('btnResetSessionForm').addEventListener('click', resetSessionForm);

  document.getElementById('btnSetNowDate').addEventListener('click', () => {
    document.getElementById('sessionDateInput').value = getNowDateTimeLocal();
    showToast('Fecha actualizada al momento actual');
  });

  // Cambio de paciente en el formulario de sesión
  document.getElementById('sessionPatientSelect').addEventListener('change', (e) => {
    const patientId = e.target.value;
    const patient = appState.patients.find(p => p.id === patientId);
    if (patient) {
      updateFormObjectivesReminder(patient);
    }
  });

  // Modo Privacidad
  document.getElementById('btnPrivacyToggle').addEventListener('click', togglePrivacyMode);

  // Copias de Seguridad
  document.getElementById('btnBackupModal').addEventListener('click', () => {
    document.getElementById('backupModal').classList.remove('hidden');
    lucide.createIcons({ root: document.getElementById('backupModal') });
  });
  document.getElementById('btnCloseBackupModal').addEventListener('click', () => {
    document.getElementById('backupModal').classList.add('hidden');
  });
  document.getElementById('btnExportJSON').addEventListener('click', exportBackupJSON);
  document.getElementById('btnTriggerImport').addEventListener('click', () => {
    document.getElementById('importFileInput').click();
  });
  document.getElementById('importFileInput').addEventListener('change', importBackupJSON);

  document.getElementById('btnLoadSampleData').addEventListener('click', () => {
    if (confirm('¿Deseas restaurar los datos de ejemplo?')) {
      appState.patients = SAMPLE_PATIENTS;
      appState.selectedPatientId = appState.patients[0].id;
      saveData();
      renderAll();
      document.getElementById('backupModal').classList.add('hidden');
      showToast('Datos de ejemplo cargados');
    }
  });

  document.getElementById('btnClearAllData').addEventListener('click', () => {
    if (confirm('¿Deseas borrar TODOS los pacientes y sesiones? Esta acción es irreversible.')) {
      appState.patients = [];
      appState.selectedPatientId = null;
      saveData();
      renderAll();
      document.getElementById('backupModal').classList.add('hidden');
      showToast('Todos los datos fueron eliminados');
    }
  });

  // Impresión / PDF
  document.getElementById('btnPrintPatientReport').addEventListener('click', () => {
    window.print();
  });

  // Botón Volver a Lista de Pacientes (Móvil)
  document.getElementById('btnBackToPatientList')?.addEventListener('click', () => {
    setMobileView('list');
  });

  // Ajuste al cambiar tamaño de pantalla
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 768) {
      document.getElementById('patientSidebar')?.classList.remove('hidden');
      document.getElementById('patientSidebar')?.classList.add('flex');
      document.getElementById('mainContent')?.classList.remove('hidden');
      document.getElementById('mainContent')?.classList.add('flex');
    }
  });

  // Render inicial
  renderAll();
  resetSessionForm();

  // En pantallas móviles, iniciar en la lista de pacientes
  if (window.innerWidth < 768) {
    setMobileView('list');
  }
});
