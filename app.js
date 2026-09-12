/**
 * PsicoGest - Lógica de Aplicación (Versión 100% Local / Offline)
 * Sistema de Gestión de Pacientes, Objetivos y Sesiones Clínicas
 */

// ==========================================
// 1. ESTADO GLOBAL Y PERSISTENCIA LOCAL
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

// Cargar datos desde localStorage
function loadStateFromStorage() {
  try {
    const rawData = localStorage.getItem(STORAGE_KEY);
    if (rawData) {
      const parsed = JSON.parse(rawData);
      if (Array.isArray(parsed)) {
        appState.patients = parsed.map(p => ({
          ...p,
          status: p.status || 'activo',
          objectives: p.objectives || [],
          sessions: p.sessions || []
        }));
      }
    } else {
      // Datos iniciales de demostración
      loadInitialSampleData();
    }
  } catch (error) {
    console.error('Error al cargar datos locales:', error);
    appState.patients = [];
  }

  // Cargar modo privacidad
  const privacyStored = localStorage.getItem(PRIVACY_KEY);
  appState.isPrivacyMode = privacyStored === 'true';
  applyPrivacyMode();
}

// Guardar datos en localStorage
function saveStateToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appState.patients));
    updateStatsCounters();
  } catch (error) {
    console.error('Error al guardar datos:', error);
    showToast('Error al guardar datos en el almacenamiento local', 'error');
  }
}

// ==========================================
// 2. DATOS DE DEMOSTRACIÓN
// ==========================================

function loadInitialSampleData() {
  appState.patients = [
    {
      id: 'pat-1',
      name: 'María Fernández',
      center: 'Descubriendo',
      phone: '+51 984 123 456',
      status: 'activo',
      createdAt: '2026-08-10T10:00:00.000Z',
      motivo: 'Episodios de ansiedad generalizada y ataques de pánico en situaciones laborales. Dificultad para conciliar el sueño y somatización gastrointestinal.',
      objectives: [
        { id: 'obj-1-1', text: 'Identificar y registrar pensamientos distorsionados en registro diario', completed: true },
        { id: 'obj-1-2', text: 'Entrenamiento y aplicación de respiración diafragmática ante crisis', completed: true },
        { id: 'obj-1-3', text: 'Reestructuración cognitiva de creencias de sobre-exigencia', completed: false },
        { id: 'obj-1-4', text: 'Exposición gradual a situaciones sociales temidas en el trabajo', completed: false }
      ],
      sessions: [
        {
          id: 'ses-1-1',
          date: '2026-08-12T15:30',
          sessionNumber: 'Sesión #1 - Evaluación Inicial',
          notes: 'Entrevista clínica inicial. Se exploran detonantes de ansiedad, historia familiar y estilo de afrontamiento. Se establece contrato terapéutico y encuadre.',
          tasks: 'Completar autoregistro de ansiedad cuando la intensidad supere 6/10.',
          nextPlan: 'Revisar registro y entrenar respiración diafragmática.'
        },
        {
          id: 'ses-1-2',
          date: '2026-08-19T15:30',
          sessionNumber: 'Sesión #2 - Psicoeducación y Respiración',
          notes: 'Revisión del registro: 3 episodios de taquicardia. Se realiza psicoeducación sobre el circuito de la ansiedad (amígdala vs córtex). Práctica guiada de respiración.',
          tasks: 'Practicar respiración diafragmática 5 minutos en la mañana y 5 minutos antes de dormir.',
          nextPlan: 'Iniciar reestructuración cognitiva de pensamientos automáticos.'
        },
        {
          id: 'ses-1-3',
          date: '2026-08-26T16:00',
          sessionNumber: 'Sesión #3 - Pensamientos Automáticos',
          notes: 'Paciente refiere mejoría en conciliación del sueño con la técnica de respiración. Trabajamos el pensamiento "Voy a fallar en la presentación" utilizando técnica de debate socrático.',
          tasks: 'Completar columna de "Pensamiento Alternativo" en 2 situaciones durante la semana.',
          nextPlan: 'Consolidar técnicas cognitivas y evaluar jerarquía de exposición.'
        }
      ]
    },
    {
      id: 'pat-2',
      name: 'Carlos Mendoza',
      center: 'Psicovive',
      phone: '+51 976 543 210',
      status: 'activo',
      createdAt: '2026-08-15T11:00:00.000Z',
      motivo: 'Duelo no elaborado por ruptura sentimental de 6 meses. Síntomas de apatía, aislamiento social y pérdida de interés en actividades recreativas.',
      objectives: [
        { id: 'obj-2-1', text: 'Validación emocional y procesamiento de fases del duelo', completed: true },
        { id: 'obj-2-2', text: 'Activación conductual: programar 2 actividades placenteras semanales', completed: false },
        { id: 'obj-2-3', text: 'Redefinición del proyecto de vida y valores personales', completed: false }
      ],
      sessions: [
        {
          id: 'ses-2-1',
          date: '2026-08-18T17:00',
          sessionNumber: 'Sesión #1 - Admisión',
          notes: 'Apertura de ficha. Expresa profunda tristeza y sensación de vacío. Se valida su sentir y se explica el proceso natural del duelo.',
          tasks: 'Escribir carta de desahogo (sin enviar) enfocada en emociones reprimidas.',
          nextPlan: 'Lectura de carta en sesión y cuadro de activación conductual.'
        }
      ]
    },
    {
      id: 'pat-3',
      name: 'Lucía Benavides',
      center: 'Particulares',
      phone: '+51 991 882 773',
      status: 'activo',
      createdAt: '2026-08-20T09:30:00.000Z',
      motivo: 'Entrenamiento en asertividad y habilidades de comunicación. Dificultad para poner límites a familiares y compañeros de trabajo.',
      objectives: [
        { id: 'obj-3-1', text: 'Diferenciar estilos de comunicación (pasivo, agresivo, asertivo)', completed: true },
        { id: 'obj-3-2', text: 'Práctica de técnica del disco rayado y banco de niebla en rol-play', completed: false },
        { id: 'obj-3-3', text: 'Aplicación real de "Decir NO" en contexto laboral', completed: false }
      ],
      sessions: [
        {
          id: 'ses-3-1',
          date: '2026-08-22T10:00',
          sessionNumber: 'Sesión #1 - Encuadre y Estilos',
          notes: 'Identificación de situaciones donde siente culpa al decir "no". Role-playing de situación con jefatura directa.',
          tasks: 'Registrar 3 momentos en la semana donde deseó negarse y qué decisión tomó.',
          nextPlan: 'Técnicas de comunicación asertiva asertivas estructuradas (DEEC).'
        }
      ]
    }
  ];
  saveStateToStorage();
}

// ==========================================
// 3. INICIALIZACIÓN DE LA APLICACIÓN
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  loadStateFromStorage();
  initEventListeners();
  renderPatientList();
  updateStatsCounters();

  // Seleccionar primer paciente activo por defecto si existe en desktop
  if (appState.patients.length > 0) {
    const firstActive = appState.patients.find(p => p.status === 'activo') || appState.patients[0];
    if (window.innerWidth >= 768 && firstActive) {
      selectPatient(firstActive.id);
    }
  }

  // Actualizar iconos de Lucide
  if (window.lucide) {
    lucide.createIcons();
  }
});

// ==========================================
// 4. EVENT LISTENERS
// ==========================================

function initEventListeners() {
  // --- Modo Privacidad ---
  const btnPrivacy = document.getElementById('btnPrivacyToggle');
  if (btnPrivacy) {
    btnPrivacy.addEventListener('click', togglePrivacyMode);
  }

  // --- Modal Copias de Seguridad ---
  const btnBackup = document.getElementById('btnBackupModal');
  const btnCloseBackup = document.getElementById('btnCloseBackupModal');
  const backupModal = document.getElementById('backupModal');

  if (btnBackup) btnBackup.addEventListener('click', () => backupModal.classList.remove('hidden'));
  if (btnCloseBackup) btnCloseBackup.addEventListener('click', () => backupModal.classList.add('hidden'));

  // Exportar / Importar
  const btnExport = document.getElementById('btnExportJSON');
  if (btnExport) btnExport.addEventListener('click', exportBackupJSON);

  const btnTriggerImport = document.getElementById('btnTriggerImport');
  const importFileInput = document.getElementById('importFileInput');
  if (btnTriggerImport && importFileInput) {
    btnTriggerImport.addEventListener('click', () => importFileInput.click());
    importFileInput.addEventListener('change', handleImportJSON);
  }

  const btnLoadSample = document.getElementById('btnLoadSampleData');
  if (btnLoadSample) {
    btnLoadSample.addEventListener('click', () => {
      if (confirm('¿Deseas restaurar los datos de ejemplo? Esto agregará los pacientes de prueba.')) {
        loadInitialSampleData();
        renderPatientList();
        if (appState.patients.length > 0) selectPatient(appState.patients[0].id);
        backupModal.classList.add('hidden');
        showToast('Datos de ejemplo cargados con éxito', 'success');
      }
    });
  }

  const btnClearAll = document.getElementById('btnClearAllData');
  if (btnClearAll) {
    btnClearAll.addEventListener('click', () => {
      if (confirm('¿ATENCIÓN: Estás seguro de borrar todos los pacientes y sesiones? Se recomienda descargar un respaldo antes.')) {
        appState.patients = [];
        appState.selectedPatientId = null;
        saveStateToStorage();
        renderPatientList();
        renderPatientDetail();
        backupModal.classList.add('hidden');
        showToast('Todos los datos han sido borrados', 'info');
      }
    });
  }

  // --- Búsqueda de Pacientes ---
  const searchInput = document.getElementById('searchInput');
  const btnClearSearch = document.getElementById('btnClearSearch');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      appState.searchQuery = e.target.value.toLowerCase().trim();
      if (btnClearSearch) {
        btnClearSearch.classList.toggle('hidden', appState.searchQuery === '');
      }
      renderPatientList();
    });
  }
  if (btnClearSearch) {
    btnClearSearch.addEventListener('click', () => {
      searchInput.value = '';
      appState.searchQuery = '';
      btnClearSearch.classList.add('hidden');
      renderPatientList();
    });
  }

  // --- Filtros de Centro ---
  const centerBtns = document.querySelectorAll('.filter-center-btn');
  centerBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      centerBtns.forEach(b => {
        b.classList.remove('active');
        b.classList.remove('bg-teal-700', 'text-white');
      });
      btn.classList.add('active');
      appState.filterCenter = btn.dataset.center;
      renderPatientList();
    });
  });

  // --- Filtros de Estado (Activos / Inactivos / Todos) ---
  const statusBtns = document.querySelectorAll('.filter-status-btn');
  statusBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      statusBtns.forEach(b => {
        b.classList.remove('active', 'text-teal-800', 'bg-teal-100/80', 'border-teal-200');
        b.classList.add('text-slate-600');
      });
      btn.classList.add('active', 'text-teal-800', 'bg-teal-100/80', 'border-teal-200');
      btn.classList.remove('text-slate-600');
      appState.filterStatus = btn.dataset.status;
      renderPatientList();
    });
  });

  // --- Modal Paciente (Crear / Editar) ---
  const btnOpenNewPatient = document.getElementById('btnOpenNewPatientModal');
  const btnEmptyNewPatient = document.getElementById('btnEmptyNewPatient');
  const btnClosePatient = document.getElementById('btnClosePatientModal');
  const btnCancelPatient = document.getElementById('btnCancelPatientModal');
  const patientModal = document.getElementById('patientModal');
  const formPatient = document.getElementById('formPatient');
  const btnAddObjRow = document.getElementById('btnAddObjectiveRow');
  const btnDeletePatient = document.getElementById('btnDeletePatient');
  const patientStatusToggle = document.getElementById('patientStatusToggle');

  if (btnOpenNewPatient) btnOpenNewPatient.addEventListener('click', () => openPatientModal(false));
  if (btnEmptyNewPatient) btnEmptyNewPatient.addEventListener('click', () => openPatientModal(false));
  if (btnClosePatient) btnClosePatient.addEventListener('click', closePatientModal);
  if (btnCancelPatient) btnCancelPatient.addEventListener('click', closePatientModal);

  // Toggle de Estado en Modal
  if (patientStatusToggle) {
    patientStatusToggle.addEventListener('change', (e) => {
      const label = document.getElementById('patientStatusLabel');
      if (label) {
        if (e.target.checked) {
          label.textContent = 'Activo';
          label.className = 'text-xs font-bold text-emerald-600';
        } else {
          label.textContent = 'Inactivo';
          label.className = 'text-xs font-bold text-slate-500';
        }
      }
    });
  }

  // Agregar fila de objetivo en modal
  if (btnAddObjRow) {
    btnAddObjRow.addEventListener('click', () => addObjectiveRowToModal(''));
  }

  // Guardar Paciente (Submit)
  if (formPatient) {
    formPatient.addEventListener('submit', handleSavePatient);
  }

  // Eliminar Paciente
  if (btnDeletePatient) {
    btnDeletePatient.addEventListener('click', handleDeletePatient);
  }

  // Botón Editar Paciente en Cabecera de Ficha
  const btnTabEditPatient = document.getElementById('btnTabEditPatient');
  if (btnTabEditPatient) {
    btnTabEditPatient.addEventListener('click', () => openPatientModal(true));
  }

  // Botón Editar Metas en Resumen
  const btnQuickAddObjective = document.getElementById('btnQuickAddObjective');
  if (btnQuickAddObjective) {
    btnQuickAddObjective.addEventListener('click', () => openPatientModal(true));
  }

  // --- Pestañas de Navegación de Ficha ---
  const tabBtns = document.querySelectorAll('.patient-tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.dataset.tab;
      switchTab(tabId);
    });
  });

  // Botones de Nueva Sesión Rápida
  const btnQuickNewSession = document.getElementById('btnQuickNewSession');
  const btnTabNewSession = document.getElementById('btnTabNewSession');
  const btnEmptyNewSession = document.getElementById('btnEmptyNewSession');

  const goToNewSessionTab = () => {
    if (!appState.selectedPatientId && appState.patients.length > 0) {
      selectPatient(appState.patients[0].id);
    }
    switchTab('tab-new-session');
    resetSessionForm();
  };

  if (btnQuickNewSession) btnQuickNewSession.addEventListener('click', goToNewSessionTab);
  if (btnTabNewSession) btnTabNewSession.addEventListener('click', goToNewSessionTab);
  if (btnEmptyNewSession) btnEmptyNewSession.addEventListener('click', goToNewSessionTab);

  // --- Formulario de Sesión ---
  const formSession = document.getElementById('formSession');
  const btnSetNowDate = document.getElementById('btnSetNowDate');
  const btnResetSessionForm = document.getElementById('btnResetSessionForm');
  const btnCancelEditSession = document.getElementById('btnCancelEditSession');
  const sessionPatientSelect = document.getElementById('sessionPatientSelect');

  if (btnSetNowDate) {
    btnSetNowDate.addEventListener('click', () => {
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      document.getElementById('sessionDateInput').value = now.toISOString().slice(0, 16);
    });
  }

  if (sessionPatientSelect) {
    sessionPatientSelect.addEventListener('change', (e) => {
      const patientId = e.target.value;
      if (patientId && patientId !== appState.selectedPatientId) {
        selectPatient(patientId);
      }
      updateFormObjectivesReminder(patientId);
    });
  }

  if (formSession) {
    formSession.addEventListener('submit', handleSaveSession);
  }

  if (btnResetSessionForm) {
    btnResetSessionForm.addEventListener('click', resetSessionForm);
  }

  if (btnCancelEditSession) {
    btnCancelEditSession.addEventListener('click', resetSessionForm);
  }

  // --- Buscador en Historial de Sesiones ---
  const sessionSearchInput = document.getElementById('sessionSearchInput');
  if (sessionSearchInput) {
    sessionSearchInput.addEventListener('input', (e) => {
      renderSessionHistory(e.target.value.toLowerCase().trim());
    });
  }

  // --- Botón de Imprimir Ficha ---
  const btnPrint = document.getElementById('btnPrintPatientReport');
  if (btnPrint) {
    btnPrint.addEventListener('click', () => window.print());
  }

  // --- Botón Volver Móvil (de Ficha a Lista) ---
  const btnBackToList = document.getElementById('btnBackToPatientList');
  if (btnBackToList) {
    btnBackToList.addEventListener('click', () => {
      const sidebar = document.getElementById('patientSidebar');
      const mainContent = document.getElementById('mainContent');
      if (sidebar) sidebar.classList.remove('hidden');
      if (mainContent) mainContent.classList.add('hidden');
    });
  }

  // Manejador de resize de ventana
  window.addEventListener('resize', () => {
    const sidebar = document.getElementById('patientSidebar');
    const mainContent = document.getElementById('mainContent');
    if (window.innerWidth >= 768) {
      if (sidebar) sidebar.classList.remove('hidden');
      if (mainContent) mainContent.classList.remove('hidden');
    }
  });
}

// ==========================================
// 5. RENDERIZADO DE LISTA DE PACIENTES
// ==========================================

function renderPatientList() {
  const container = document.getElementById('patientListContainer');
  const countBadge = document.getElementById('patientCountBadge');
  if (!container) return;

  // Filtrar pacientes
  let filtered = appState.patients.filter(p => {
    // Filtro por Centro
    const matchCenter = appState.filterCenter === 'all' || p.center === appState.filterCenter;

    // Filtro por Estado (Activo / Inactivo)
    const patientStatus = p.status || 'activo';
    const matchStatus = 
      appState.filterStatus === 'todos' || 
      (appState.filterStatus === 'activos' && patientStatus === 'activo') ||
      (appState.filterStatus === 'inactivos' && patientStatus === 'inactivo');

    // Filtro por Búsqueda
    const matchQuery = 
      !appState.searchQuery ||
      p.name.toLowerCase().includes(appState.searchQuery) ||
      (p.motivo && p.motivo.toLowerCase().includes(appState.searchQuery)) ||
      (p.center && p.center.toLowerCase().includes(appState.searchQuery));

    return matchCenter && matchStatus && matchQuery;
  });

  if (countBadge) {
    countBadge.textContent = filtered.length;
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="p-6 text-center text-slate-400">
        <i data-lucide="user-x" class="w-8 h-8 mx-auto mb-2 opacity-50"></i>
        <p class="text-xs font-medium">No se encontraron pacientes</p>
        <p class="text-[11px] text-slate-400 mt-1">Prueba cambiando los filtros o registra uno nuevo.</p>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  container.innerHTML = filtered.map(patient => {
    const isSelected = patient.id === appState.selectedPatientId;
    const sessionCount = (patient.sessions || []).length;
    const isInactive = (patient.status || 'activo') === 'inactivo';
    
    // Obtener iniciales
    const initials = getInitials(patient.name);

    // Color del centro
    let centerBadgeClass = 'badge-particulares';
    if (patient.center === 'Descubriendo') centerBadgeClass = 'badge-descubriendo';
    if (patient.center === 'Psicovive') centerBadgeClass = 'badge-psicovive';

    // Última sesión
    let lastSessionText = 'Sin sesiones registradas';
    if (sessionCount > 0) {
      const lastSession = patient.sessions[patient.sessions.length - 1];
      const dateObj = new Date(lastSession.date);
      lastSessionText = `Última: ${formatShortDate(dateObj)}`;
    }

    return `
      <div 
        onclick="selectPatient('${patient.id}')"
        class="patient-card group p-3 rounded-xl cursor-pointer border ${isSelected ? 'selected border-teal-500 bg-teal-50/70 shadow-sm' : 'border-transparent hover:bg-slate-100/80'} ${isInactive ? 'is-inactive' : ''}"
      >
        <div class="flex items-center space-x-3">
          
          <div class="w-10 h-10 rounded-xl bg-gradient-to-tr ${isSelected ? 'from-teal-600 to-emerald-500 text-white' : 'from-slate-200 to-slate-300 text-slate-700'} flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-sm">
            ${initials}
          </div>

          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between">
              <h4 class="text-xs font-bold text-slate-900 truncate privacy-target ${isInactive ? 'line-through text-slate-500' : ''}">
                ${escapeHtml(patient.name)}
              </h4>
              <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full ${centerBadgeClass} flex-shrink-0 ml-1">
                ${escapeHtml(patient.center)}
              </span>
            </div>

            <div class="flex items-center justify-between mt-1 text-[11px] text-slate-500">
              <span class="truncate">${lastSessionText}</span>
              <span class="font-semibold text-slate-600 flex items-center ml-2 flex-shrink-0">
                <i data-lucide="file-text" class="w-3 h-3 mr-0.5 text-slate-400"></i>
                ${sessionCount}
              </span>
            </div>
            
            ${isInactive ? '<span class="inline-block text-[10px] text-slate-500 font-medium bg-slate-200/80 px-1.5 py-0.2 rounded mt-1">Inactivo</span>' : ''}
          </div>

        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) lucide.createIcons();
}

// ==========================================
// 6. SELECCIÓN Y DETALLE DEL PACIENTE
// ==========================================

function selectPatient(patientId) {
  appState.selectedPatientId = patientId;
  renderPatientList();
  renderPatientDetail();

  // En móviles: ocultar sidebar y mostrar mainContent
  if (window.innerWidth < 768) {
    const sidebar = document.getElementById('patientSidebar');
    const mainContent = document.getElementById('mainContent');
    if (sidebar) sidebar.classList.add('hidden');
    if (mainContent) mainContent.classList.remove('hidden');
  }
}

function renderPatientDetail() {
  const emptyState = document.getElementById('emptyStateView');
  const detailView = document.getElementById('patientDetailView');

  if (!appState.selectedPatientId) {
    if (emptyState) emptyState.classList.remove('hidden');
    if (detailView) detailView.classList.add('hidden');
    return;
  }

  const patient = appState.patients.find(p => p.id === appState.selectedPatientId);
  if (!patient) {
    if (emptyState) emptyState.classList.remove('hidden');
    if (detailView) detailView.classList.add('hidden');
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');
  if (detailView) detailView.classList.remove('hidden');

  // Cabecera
  const avatar = document.getElementById('patientAvatar');
  const nameHeader = document.getElementById('patientNameHeader');
  const centerBadge = document.getElementById('patientCenterBadge');
  const statusBadge = document.getElementById('patientStatusBadge');
  const sessionCountBadge = document.getElementById('patientSessionCountBadge');
  const motivoHeader = document.getElementById('patientMotivoHeader');

  if (avatar) avatar.textContent = getInitials(patient.name);
  if (nameHeader) nameHeader.textContent = patient.name;
  
  if (centerBadge) {
    centerBadge.textContent = patient.center;
    centerBadge.className = `text-[11px] sm:text-xs font-semibold px-2 sm:px-2.5 py-0.5 rounded-full ${
      patient.center === 'Descubriendo' ? 'badge-descubriendo' :
      patient.center === 'Psicovive' ? 'badge-psicovive' : 'badge-particulares'
    }`;
  }

  if (statusBadge) {
    const isActive = (patient.status || 'activo') === 'activo';
    statusBadge.textContent = isActive ? 'Activo' : 'Inactivo';
    statusBadge.className = `text-[11px] sm:text-xs font-semibold px-2 sm:px-2.5 py-0.5 rounded-full ${
      isActive ? 'badge-status-activo' : 'badge-status-inactivo'
    }`;
  }

  const sessionCount = (patient.sessions || []).length;
  if (sessionCountBadge) {
    sessionCountBadge.textContent = `${sessionCount} ${sessionCount === 1 ? 'sesión' : 'sesiones'}`;
  }

  if (motivoHeader) {
    motivoHeader.textContent = patient.motivo || 'Motivo de consulta no especificado';
  }

  // Ficha General
  const cardCenter = document.getElementById('cardDetailCenter');
  const cardPhone = document.getElementById('cardDetailPhone');
  const cardFirstDate = document.getElementById('cardDetailFirstDate');
  const cardMotivo = document.getElementById('cardDetailMotivo');

  if (cardCenter) cardCenter.textContent = patient.center;
  if (cardPhone) cardPhone.textContent = patient.phone || 'No especificado';
  if (cardFirstDate) {
    const created = patient.createdAt ? new Date(patient.createdAt) : new Date();
    cardFirstDate.textContent = formatFullDate(created);
  }
  if (cardMotivo) cardMotivo.textContent = patient.motivo || 'Sin notas iniciales registradas.';

  // Renderizar Objetivos
  renderObjectivesTab(patient);

  // Renderizar Tareas y Plan de la última sesión
  renderLastSessionOverview(patient);

  // Renderizar Historial de Sesiones
  renderSessionHistory();

  // Actualizar selector de pacientes en formulario de nueva sesión
  updateSessionPatientSelect();

  if (window.lucide) lucide.createIcons();
}

// Render de Objetivos Terapéuticos en el Resumen
function renderObjectivesTab(patient) {
  const container = document.getElementById('objectivesListContainer');
  const progressBar = document.getElementById('objectivesProgressBar');
  const progressPercent = document.getElementById('objectivesProgressPercent');
  if (!container) return;

  const objectives = patient.objectives || [];
  if (objectives.length === 0) {
    container.innerHTML = `
      <div class="text-center py-4 text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
        <i data-lucide="target" class="w-6 h-6 mx-auto mb-1 opacity-50"></i>
        <p class="text-xs">No hay objetivos definidos aún.</p>
        <button onclick="openPatientModal(true)" class="text-xs text-teal-600 font-semibold hover:underline mt-1">
          + Agregar objetivos terapéuticos
        </button>
      </div>
    `;
    if (progressBar) progressBar.style.width = '0%';
    if (progressPercent) progressPercent.textContent = '0%';
    return;
  }

  const completedCount = objectives.filter(o => o.completed).length;
  const percent = Math.round((completedCount / objectives.length) * 100);

  if (progressBar) progressBar.style.width = `${percent}%`;
  if (progressPercent) progressPercent.textContent = `${percent}% (${completedCount}/${objectives.length})`;

  container.innerHTML = objectives.map((obj, idx) => `
    <div class="flex items-start justify-between p-3 rounded-xl border ${obj.completed ? 'bg-emerald-50/50 border-emerald-100' : 'bg-slate-50/70 border-slate-100'} transition hover:shadow-xs">
      <div class="flex items-start space-x-2.5 flex-1 pr-2">
        <input 
          type="checkbox" 
          id="obj_toggle_${obj.id}" 
          ${obj.completed ? 'checked' : ''} 
          onchange="toggleObjectiveStatus('${patient.id}', '${obj.id}')"
          class="mt-0.5 rounded text-teal-600 focus:ring-teal-500 cursor-pointer h-4 w-4"
        />
        <label for="obj_toggle_${obj.id}" class="text-xs cursor-pointer ${obj.completed ? 'line-through text-slate-400 font-normal' : 'text-slate-700 font-medium'} leading-relaxed">
          ${escapeHtml(obj.text)}
        </label>
      </div>
      <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full ${obj.completed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'} flex-shrink-0">
        ${obj.completed ? 'Logrado' : 'En proceso'}
      </span>
    </div>
  `).join('');
}

// Alternar estado de objetivo directamente desde la vista
window.toggleObjectiveStatus = function(patientId, objectiveId) {
  const patient = appState.patients.find(p => p.id === patientId);
  if (!patient || !patient.objectives) return;

  const obj = patient.objectives.find(o => o.id === objectiveId);
  if (obj) {
    obj.completed = !obj.completed;
    saveStateToStorage();
    renderObjectivesTab(patient);
    showToast(obj.completed ? '¡Objetivo marcado como logrado!' : 'Objetivo reactivado', 'success');
  }
};

// Resumen de la última sesión (Tareas y Plan)
function renderLastSessionOverview(patient) {
  const tasksBox = document.getElementById('lastSessionTasksBox');
  const planBox = document.getElementById('lastSessionNextPlanBox');

  const sessions = patient.sessions || [];
  if (sessions.length === 0) {
    if (tasksBox) tasksBox.innerHTML = '<p class="text-slate-400 italic">No hay tareas pendientes de sesiones anteriores.</p>';
    if (planBox) planBox.innerHTML = '<p class="text-slate-400 italic">Sin plan previo registrado.</p>';
    return;
  }

  const lastSession = sessions[sessions.length - 1];

  if (tasksBox) {
    if (lastSession.tasks && lastSession.tasks.trim() !== '') {
      tasksBox.innerHTML = `
        <p class="whitespace-pre-line text-slate-800 font-medium leading-relaxed">${escapeHtml(lastSession.tasks)}</p>
        <span class="block text-[10px] text-amber-700/80 mt-2 font-semibold">Asignado en: ${escapeHtml(lastSession.sessionNumber || 'Última Sesión')} (${formatShortDate(new Date(lastSession.date))})</span>
      `;
    } else {
      tasksBox.innerHTML = '<p class="text-slate-400 italic">No se asignaron tareas en la última sesión.</p>';
    }
  }

  if (planBox) {
    if (lastSession.nextPlan && lastSession.nextPlan.trim() !== '') {
      planBox.innerHTML = `
        <p class="whitespace-pre-line text-slate-800 font-medium leading-relaxed">${escapeHtml(lastSession.nextPlan)}</p>
        <span class="block text-[10px] text-indigo-700/80 mt-2 font-semibold">Anotado en: ${escapeHtml(lastSession.sessionNumber || 'Última Sesión')} (${formatShortDate(new Date(lastSession.date))})</span>
      `;
    } else {
      planBox.innerHTML = '<p class="text-slate-400 italic">No se anotaron recomendaciones para esta sesión.</p>';
    }
  }
}

// ==========================================
// 7. HISTORIAL CRONOLÓGICO DE SESIONES
// ==========================================

function renderSessionHistory(searchFilter = '') {
  const timeline = document.getElementById('sessionHistoryTimeline');
  const badgeCount = document.getElementById('historyBadgeCount');
  if (!timeline) return;

  const patient = appState.patients.find(p => p.id === appState.selectedPatientId);
  if (!patient) return;

  let sessions = [...(patient.sessions || [])];
  // Ordenar cronológicamente descendente (más reciente primero)
  sessions.sort((a, b) => new Date(b.date) - new Date(a.date));

  if (badgeCount) badgeCount.textContent = sessions.length;

  if (searchFilter) {
    sessions = sessions.filter(s => 
      (s.sessionNumber && s.sessionNumber.toLowerCase().includes(searchFilter)) ||
      (s.notes && s.notes.toLowerCase().includes(searchFilter)) ||
      (s.tasks && s.tasks.toLowerCase().includes(searchFilter)) ||
      (s.nextPlan && s.nextPlan.toLowerCase().includes(searchFilter))
    );
  }

  if (sessions.length === 0) {
    timeline.innerHTML = `
      <div class="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400">
        <i data-lucide="calendar-x" class="w-8 h-8 mx-auto mb-2 opacity-50"></i>
        <p class="text-xs font-semibold">No se encontraron sesiones registradas</p>
        <p class="text-[11px] text-slate-400 mt-1">Registra una nueva sesión desde la pestaña correspondiente.</p>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  timeline.innerHTML = sessions.map(session => {
    const sessionDate = new Date(session.date);

    return `
      <div class="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-3 relative group">
        
        <!-- Header de la Sesión -->
        <div class="flex items-start justify-between border-b border-slate-100 pb-3">
          <div class="flex items-center space-x-2.5">
            <div class="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xs">
              <i data-lucide="clipboard-check" class="w-4 h-4"></i>
            </div>
            <div>
              <h4 class="text-xs sm:text-sm font-bold text-slate-900">${escapeHtml(session.sessionNumber || 'Sesión Clínica')}</h4>
              <span class="text-[11px] text-slate-500 flex items-center mt-0.5">
                <i data-lucide="clock" class="w-3 h-3 mr-1 text-slate-400"></i>
                ${formatFullDate(sessionDate)}
              </span>
            </div>
          </div>

          <!-- Botones de Acción de Sesión -->
          <div class="flex items-center space-x-1.5 no-print">
            <button 
              onclick="editSession('${session.id}')" 
              class="text-xs font-medium text-slate-600 hover:text-teal-700 bg-slate-100 hover:bg-teal-50 px-2.5 py-1 rounded-lg border border-slate-200 transition flex items-center"
              title="Editar esta sesión"
            >
              <i data-lucide="pencil" class="w-3 h-3 mr-1"></i>
              <span>Editar</span>
            </button>
            <button 
              onclick="deleteSession('${session.id}')" 
              class="text-xs font-medium text-red-500 hover:text-red-700 bg-slate-100 hover:bg-red-50 px-2.5 py-1 rounded-lg border border-slate-200 transition flex items-center"
              title="Eliminar sesión"
            >
              <i data-lucide="trash-2" class="w-3 h-3"></i>
            </button>
          </div>
        </div>

        <!-- Notas Principales -->
        <div class="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/60 p-3.5 rounded-xl border border-slate-100">
          <span class="block text-[11px] font-bold text-slate-800 mb-1">Evolución y Desarrollo Clínico:</span>
          ${escapeHtml(session.notes || 'Sin notas registradas.')}
        </div>

        <!-- Tareas y Próximo Plan en Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          
          <!-- Tareas -->
          <div class="p-3 bg-amber-50/40 rounded-xl border border-amber-100 text-xs">
            <span class="font-bold text-amber-900 flex items-center mb-1 text-[11px]">
              <i data-lucide="check-square" class="w-3.5 h-3.5 mr-1 text-amber-600"></i>
              Tareas Asignadas:
            </span>
            <p class="text-slate-700 whitespace-pre-line">${escapeHtml(session.tasks || 'Ninguna tarea asignada.')}</p>
          </div>

          <!-- Plan Siguiente Sesión -->
          <div class="p-3 bg-indigo-50/40 rounded-xl border border-indigo-100 text-xs">
            <span class="font-bold text-indigo-900 flex items-center mb-1 text-[11px]">
              <i data-lucide="compass" class="w-3.5 h-3.5 mr-1 text-indigo-600"></i>
              Plan Próxima Sesión:
            </span>
            <p class="text-slate-700 whitespace-pre-line">${escapeHtml(session.nextPlan || 'Sin planificación previa.')}</p>
          </div>

        </div>

      </div>
    `;
  }).join('');

  if (window.lucide) lucide.createIcons();
}

// ==========================================
// 8. FORMULARIO DE NUEVA / EDITAR SESIÓN
// ==========================================

function updateSessionPatientSelect() {
  const select = document.getElementById('sessionPatientSelect');
  if (!select) return;

  const currentVal = appState.selectedPatientId;
  select.innerHTML = appState.patients.map(p => `
    <option value="${p.id}" ${p.id === currentVal ? 'selected' : ''}>
      ${escapeHtml(p.name)} (${escapeHtml(p.center)}) ${(p.status === 'inactivo' ? '- [Inactivo]' : '')}
    </option>
  `).join('');

  updateFormObjectivesReminder(currentVal);
}

function updateFormObjectivesReminder(patientId) {
  const reminderContainer = document.getElementById('formObjectivesReminder');
  const listContainer = document.getElementById('formObjectivesList');
  if (!reminderContainer || !listContainer) return;

  const patient = appState.patients.find(p => p.id === patientId);
  if (!patient || !patient.objectives || patient.objectives.length === 0) {
    reminderContainer.classList.add('hidden');
    return;
  }

  reminderContainer.classList.remove('hidden');
  const activeObjs = patient.objectives.filter(o => !o.completed);
  
  if (activeObjs.length === 0) {
    listContainer.innerHTML = '<li class="italic text-teal-700">Todos los objetivos iniciales han sido marcados como logrados.</li>';
  } else {
    listContainer.innerHTML = activeObjs.map(o => `
      <li>${escapeHtml(o.text)}</li>
    `).join('');
  }
}

function handleSaveSession(e) {
  e.preventDefault();

  const patientId = document.getElementById('sessionPatientSelect').value;
  const editingId = document.getElementById('editingSessionId').value;
  const dateVal = document.getElementById('sessionDateInput').value;
  const numberVal = document.getElementById('sessionNumberInput').value.trim();
  const notesVal = document.getElementById('sessionNotesInput').value.trim();
  const tasksVal = document.getElementById('sessionTasksInput').value.trim();
  const nextPlanVal = document.getElementById('sessionNextPlanInput').value.trim();

  if (!patientId || !dateVal || !notesVal) {
    showToast('Por favor completa la fecha y las notas de la sesión.', 'error');
    return;
  }

  const patient = appState.patients.find(p => p.id === patientId);
  if (!patient) {
    showToast('Paciente no encontrado.', 'error');
    return;
  }

  if (!patient.sessions) patient.sessions = [];

  if (editingId) {
    // Editar sesión existente
    const sesIndex = patient.sessions.findIndex(s => s.id === editingId);
    if (sesIndex !== -1) {
      patient.sessions[sesIndex] = {
        ...patient.sessions[sesIndex],
        date: dateVal,
        sessionNumber: numberVal || `Sesión #${sesIndex + 1}`,
        notes: notesVal,
        tasks: tasksVal,
        nextPlan: nextPlanVal
      };
      showToast('Sesión clínica actualizada con éxito', 'success');
    }
  } else {
    // Nueva sesión
    const newSession = {
      id: 'ses-' + Date.now(),
      date: dateVal,
      sessionNumber: numberVal || `Sesión #${patient.sessions.length + 1}`,
      notes: notesVal,
      tasks: tasksVal,
      nextPlan: nextPlanVal
    };
    patient.sessions.push(newSession);
    showToast('¡Nueva sesión guardada con éxito!', 'success');
  }

  saveStateToStorage();
  resetSessionForm();
  selectPatient(patientId);
  switchTab('tab-history');
}

window.editSession = function(sessionId) {
  const patient = appState.patients.find(p => p.id === appState.selectedPatientId);
  if (!patient || !patient.sessions) return;

  const session = patient.sessions.find(s => s.id === sessionId);
  if (!session) return;

  // Cargar en formulario
  document.getElementById('editingSessionId').value = session.id;
  document.getElementById('sessionPatientSelect').value = patient.id;
  document.getElementById('sessionDateInput').value = session.date;
  document.getElementById('sessionNumberInput').value = session.sessionNumber || '';
  document.getElementById('sessionNotesInput').value = session.notes || '';
  document.getElementById('sessionTasksInput').value = session.tasks || '';
  document.getElementById('sessionNextPlanInput').value = session.nextPlan || '';

  // Actualizar UI del formulario
  document.getElementById('sessionFormTitle').textContent = `Editar ${session.sessionNumber || 'Sesión'}`;
  document.getElementById('btnSaveSessionText').textContent = 'Guardar Cambios de Sesión';
  document.getElementById('btnCancelEditSession').classList.remove('hidden');

  switchTab('tab-new-session');
};

window.deleteSession = function(sessionId) {
  const patient = appState.patients.find(p => p.id === appState.selectedPatientId);
  if (!patient || !patient.sessions) return;

  if (confirm('¿Estás seguro de eliminar el registro de esta sesión?')) {
    patient.sessions = patient.sessions.filter(s => s.id !== sessionId);
    saveStateToStorage();
    renderPatientDetail();
    showToast('Sesión eliminada', 'info');
  }
};

function resetSessionForm() {
  document.getElementById('editingSessionId').value = '';
  document.getElementById('formSession').reset();

  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  document.getElementById('sessionDateInput').value = now.toISOString().slice(0, 16);

  document.getElementById('sessionFormTitle').textContent = 'Registrar Nueva Sesión Clínica';
  document.getElementById('btnSaveSessionText').textContent = 'Guardar Sesión';
  document.getElementById('btnCancelEditSession').classList.add('hidden');

  if (appState.selectedPatientId) {
    document.getElementById('sessionPatientSelect').value = appState.selectedPatientId;
    updateFormObjectivesReminder(appState.selectedPatientId);
  }
}

// ==========================================
// 9. MODAL PACIENTE (CREAR / EDITAR)
// ==========================================

window.openPatientModal = function(isEdit = false) {
  const modal = document.getElementById('patientModal');
  const title = document.getElementById('modalPatientTitle');
  const deleteBtn = document.getElementById('btnDeletePatient');
  const statusToggle = document.getElementById('patientStatusToggle');
  const statusLabel = document.getElementById('patientStatusLabel');
  const container = document.getElementById('modalObjectivesContainer');

  if (!modal) return;

  // Limpiar contenedor de objetivos
  container.innerHTML = '';

  if (isEdit && appState.selectedPatientId) {
    const patient = appState.patients.find(p => p.id === appState.selectedPatientId);
    if (!patient) return;

    title.textContent = 'Editar Ficha del Paciente';
    document.getElementById('editingPatientId').value = patient.id;
    document.getElementById('patientNameInput').value = patient.name;
    document.getElementById('patientPhoneInput').value = patient.phone || '';
    document.getElementById('patientMotivoInput').value = patient.motivo || '';

    // Estado
    const isActive = (patient.status || 'activo') === 'activo';
    statusToggle.checked = isActive;
    statusLabel.textContent = isActive ? 'Activo' : 'Inactivo';
    statusLabel.className = isActive ? 'text-xs font-bold text-emerald-600' : 'text-xs font-bold text-slate-500';

    // Centro Radio
    const radios = document.querySelectorAll('input[name="patientCenter"]');
    radios.forEach(r => {
      r.checked = r.value === patient.center;
    });

    // Cargar objetivos
    if (patient.objectives && patient.objectives.length > 0) {
      patient.objectives.forEach(obj => addObjectiveRowToModal(obj.text, obj.completed, obj.id));
    } else {
      addObjectiveRowToModal('');
    }

    deleteBtn.classList.remove('hidden');
  } else {
    // Modo Nuevo Paciente
    title.textContent = 'Registrar Nuevo Paciente';
    document.getElementById('editingPatientId').value = '';
    document.getElementById('formPatient').reset();

    statusToggle.checked = true;
    statusLabel.textContent = 'Activo';
    statusLabel.className = 'text-xs font-bold text-emerald-600';

    // Por defecto Descubriendo
    const defaultRadio = document.querySelector('input[name="patientCenter"][value="Descubriendo"]');
    if (defaultRadio) defaultRadio.checked = true;

    // Agregar 2 filas vacías de objetivos
    addObjectiveRowToModal('');
    addObjectiveRowToModal('');

    deleteBtn.classList.add('hidden');
  }

  modal.classList.remove('hidden');
  if (window.lucide) lucide.createIcons();
};

function closePatientModal() {
  const modal = document.getElementById('patientModal');
  if (modal) modal.classList.add('hidden');
}

function addObjectiveRowToModal(text = '', completed = false, id = '') {
  const container = document.getElementById('modalObjectivesContainer');
  if (!container) return;

  const rowId = id || 'obj-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
  const div = document.createElement('div');
  div.className = 'flex items-center space-x-2 objective-input-row';
  div.dataset.objId = rowId;
  div.dataset.completed = completed ? 'true' : 'false';

  div.innerHTML = `
    <i data-lucide="check-circle" class="w-4 h-4 text-teal-600 flex-shrink-0"></i>
    <input 
      type="text" 
      value="${escapeHtml(text)}" 
      placeholder="Ej: Reducir conductas de evitación..." 
      class="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition objective-text-input"
    />
    <button type="button" onclick="this.parentElement.remove()" class="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition">
      <i data-lucide="x" class="w-4 h-4"></i>
    </button>
  `;

  container.appendChild(div);
  if (window.lucide) lucide.createIcons();
}

function handleSavePatient(e) {
  e.preventDefault();

  const editingId = document.getElementById('editingPatientId').value;
  const nameVal = document.getElementById('patientNameInput').value.trim();
  const phoneVal = document.getElementById('patientPhoneInput').value.trim();
  const motivoVal = document.getElementById('patientMotivoInput').value.trim();
  const statusToggle = document.getElementById('patientStatusToggle').checked;
  const statusVal = statusToggle ? 'activo' : 'inactivo';

  const centerRadio = document.querySelector('input[name="patientCenter"]:checked');
  const centerVal = centerRadio ? centerRadio.value : 'Descubriendo';

  if (!nameVal) {
    showToast('El nombre del paciente es obligatorio.', 'error');
    return;
  }

  // Recolectar objetivos
  const objRows = document.querySelectorAll('.objective-input-row');
  const objectives = [];
  objRows.forEach(row => {
    const input = row.querySelector('.objective-text-input');
    const text = input ? input.value.trim() : '';
    if (text) {
      objectives.push({
        id: row.dataset.objId || 'obj-' + Date.now(),
        text: text,
        completed: row.dataset.completed === 'true'
      });
    }
  });

  if (editingId) {
    // Editar Paciente
    const patientIndex = appState.patients.findIndex(p => p.id === editingId);
    if (patientIndex !== -1) {
      appState.patients[patientIndex] = {
        ...appState.patients[patientIndex],
        name: nameVal,
        center: centerVal,
        phone: phoneVal,
        status: statusVal,
        motivo: motivoVal,
        objectives: objectives
      };
      showToast('Ficha de paciente actualizada', 'success');
      selectPatient(editingId);
    }
  } else {
    // Crear Nuevo Paciente
    const newPatient = {
      id: 'pat-' + Date.now(),
      name: nameVal,
      center: centerVal,
      phone: phoneVal,
      status: statusVal,
      createdAt: new Date().toISOString(),
      motivo: motivoVal,
      objectives: objectives,
      sessions: []
    };
    appState.patients.unshift(newPatient);
    showToast('¡Paciente registrado con éxito!', 'success');
    selectPatient(newPatient.id);
  }

  saveStateToStorage();
  closePatientModal();
  renderPatientList();
}

function handleDeletePatient() {
  const editingId = document.getElementById('editingPatientId').value;
  if (!editingId) return;

  const patient = appState.patients.find(p => p.id === editingId);
  if (!patient) return;

  if (confirm(`¿Estás seguro de eliminar definitivamente a "${patient.name}" y todo su historial de sesiones?`)) {
    appState.patients = appState.patients.filter(p => p.id !== editingId);
    if (appState.selectedPatientId === editingId) {
      appState.selectedPatientId = appState.patients.length > 0 ? appState.patients[0].id : null;
    }
    saveStateToStorage();
    closePatientModal();
    renderPatientList();
    renderPatientDetail();
    showToast('Paciente eliminado', 'info');
  }
}

// ==========================================
// 10. CAMBIO DE PESTAÑAS (Ficha de Paciente)
// ==========================================

function switchTab(tabId) {
  appState.activeTab = tabId;

  // Actualizar botones de pestaña
  const tabBtns = document.querySelectorAll('.patient-tab-btn');
  tabBtns.forEach(btn => {
    if (btn.dataset.tab === tabId) {
      btn.classList.add('active', 'border-teal-600', 'text-teal-700');
      btn.classList.remove('border-transparent', 'text-slate-500');
    } else {
      btn.classList.remove('active', 'border-teal-600', 'text-teal-700');
      btn.classList.add('border-transparent', 'text-slate-500');
    }
  });

  // Mostrar contenido correspondiente
  const tabContents = document.querySelectorAll('.tab-content');
  tabContents.forEach(content => {
    if (content.id === tabId) {
      content.classList.remove('hidden');
    } else {
      content.classList.add('hidden');
    }
  });

  // Si se cambia a la pestaña de nueva sesión y está vacía la fecha, poner ahora
  if (tabId === 'tab-new-session') {
    const dateInput = document.getElementById('sessionDateInput');
    if (!dateInput.value) {
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      dateInput.value = now.toISOString().slice(0, 16);
    }
    if (appState.selectedPatientId) {
      document.getElementById('sessionPatientSelect').value = appState.selectedPatientId;
      updateFormObjectivesReminder(appState.selectedPatientId);
    }
  }

  if (window.lucide) lucide.createIcons();
}

// ==========================================
// 11. MODO PRIVACIDAD
// ==========================================

function togglePrivacyMode() {
  appState.isPrivacyMode = !appState.isPrivacyMode;
  localStorage.setItem(PRIVACY_KEY, appState.isPrivacyMode ? 'true' : 'false');
  applyPrivacyMode();
  showToast(appState.isPrivacyMode ? 'Modo Privacidad activado' : 'Modo Privacidad desactivado', 'info');
}

function applyPrivacyMode() {
  const icon = document.getElementById('privacyIcon');
  const text = document.getElementById('privacyText');

  if (appState.isPrivacyMode) {
    document.body.classList.add('privacy-active');
    if (icon) icon.setAttribute('data-lucide', 'eye-off');
    if (text) text.textContent = 'Privacidad (ON)';
  } else {
    document.body.classList.remove('privacy-active');
    if (icon) icon.setAttribute('data-lucide', 'eye');
    if (text) text.textContent = 'Privacidad';
  }

  if (window.lucide) lucide.createIcons();
}

// ==========================================
// 12. EXPORTAR / IMPORTAR BACKUP JSON
// ==========================================

function exportBackupJSON() {
  const dataToExport = {
    app: 'PsicoGest',
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    totalPatients: appState.patients.length,
    patients: appState.patients
  };

  const jsonStr = JSON.stringify(dataToExport, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const todayStr = new Date().toISOString().split('T')[0];
  const a = document.createElement('a');
  a.href = url;
  a.download = `psicogest_respaldo_${todayStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast('Copia de seguridad descargada con éxito', 'success');
}

function handleImportJSON(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const parsed = JSON.parse(event.target.result);
      let importedPatients = [];

      if (Array.isArray(parsed)) {
        importedPatients = parsed;
      } else if (parsed.patients && Array.isArray(parsed.patients)) {
        importedPatients = parsed.patients;
      } else {
        throw new Error('Formato de archivo inválido');
      }

      appState.patients = importedPatients.map(p => ({
        ...p,
        status: p.status || 'activo',
        objectives: p.objectives || [],
        sessions: p.sessions || []
      }));

      saveStateToStorage();
      renderPatientList();
      if (appState.patients.length > 0) {
        selectPatient(appState.patients[0].id);
      } else {
        renderPatientDetail();
      }

      document.getElementById('backupModal').classList.add('hidden');
      showToast(`¡Respaldo restaurado con éxito! (${appState.patients.length} pacientes)`, 'success');
    } catch (err) {
      console.error('Error al importar:', err);
      showToast('Error: El archivo JSON no es una copia válida de PsicoGest.', 'error');
    }
  };
  reader.readAsText(file);
}

// ==========================================
// 13. ESTADÍSTICAS Y CONTADORES
// ==========================================

function updateStatsCounters() {
  const statDesc = document.getElementById('statDescubriendo');
  const statPsico = document.getElementById('statPsicovive');
  const statPart = document.getElementById('statParticulares');
  const activeInactiveStats = document.getElementById('activeInactiveStats');

  const countDesc = appState.patients.filter(p => p.center === 'Descubriendo').length;
  const countPsico = appState.patients.filter(p => p.center === 'Psicovive').length;
  const countPart = appState.patients.filter(p => p.center === 'Particulares').length;

  const activeCount = appState.patients.filter(p => (p.status || 'activo') === 'activo').length;
  const inactiveCount = appState.patients.filter(p => (p.status || 'activo') === 'inactivo').length;

  if (statDesc) statDesc.textContent = countDesc;
  if (statPsico) statPsico.textContent = countPsico;
  if (statPart) statPart.textContent = countPart;

  if (activeInactiveStats) {
    activeInactiveStats.textContent = `${activeCount} activos / ${inactiveCount} inactivos`;
  }
}

// ==========================================
// 14. UTILIDADES (TOAST, FECHAS, FORMATOS)
// ==========================================

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  const bgClass = 
    type === 'success' ? 'bg-emerald-800 text-white border-emerald-600' :
    type === 'error' ? 'bg-rose-800 text-white border-rose-600' :
    'bg-slate-900 text-white border-slate-700';

  const iconName = 
    type === 'success' ? 'check-circle-2' :
    type === 'error' ? 'alert-circle' : 'info';

  toast.className = `pointer-events-auto flex items-center space-x-2.5 px-4 py-3 rounded-xl border shadow-xl text-xs font-medium ${bgClass} transform transition-all duration-300 translate-y-2 opacity-0`;
  toast.innerHTML = `
    <i data-lucide="${iconName}" class="w-4 h-4 flex-shrink-0"></i>
    <span>${escapeHtml(message)}</span>
  `;

  container.appendChild(toast);
  if (window.lucide) lucide.createIcons();

  // Animación de entrada
  setTimeout(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  }, 10);

  // Animación de salida
  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function getInitials(name) {
  if (!name) return '--';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function formatShortDate(d) {
  if (isNaN(d.getTime())) return '--';
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
}

function formatFullDate(d) {
  if (isNaN(d.getTime())) return '--';
  return d.toLocaleDateString('es-ES', { 
    weekday: 'short', 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
