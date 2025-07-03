// /assets/js/pages/personnel.js (Finalisation)

import { dataService } from '../services/data-service.js';
import { functionService } from '../services/function-service.js';
import { displayMessage, setButtonLoading, generateUniqueId, formatDate, openModal, closeModal, fillForm, getFormData, validateForm, capitalizeFirstLetter } from '../utils/helpers.js';
import { ROLES, TABLES, REPORT_STATUS, ID_PREFIXES, DOCUMENT_TYPES, USER_TYPES, STORAGE_BUCKETS } from '../utils/constants.js';

let currentUser = null;
let userPermissions = [];
let currentStudentId = null; // Pour la modale de détails étudiant
let currentReportId = null; // Pour la modale de conformité
let currentReclamationId = null; // Pour la modale de réponse réclamation

// --- ÉLÉMENTS DU DOM SPÉCIFIQUES AU PERSONNEL ---
const personnelUI = {
    // Dashboard
    conformityReportsCard: document.getElementById('conformity-reports-card'),
    statPendingConformityReports: document.getElementById('stat-pending-conformity-reports'),
    pendingConformityReportsList: document.getElementById('pending-conformity-reports-list'),
    studentsToActivateCard: document.getElementById('students-to-activate-card'),
    statStudentsToActivate: document.getElementById('stat-students-to-activate'),
    studentsToActivateList: document.getElementById('students-to-activate-list'),
    openReclamationsCard: document.getElementById('open-reclamations-card'),
    statOpenReclamations: document.getElementById('stat-open-reclamations'),
    openReclamationsList: document.getElementById('open-reclamations-list'),
    stagesToValidateCard: document.getElementById('stages-to-validate-card'),
    statStagesToValidate: document.getElementById('stat-stages-to-validate'),
    stagesToValidateList: document.getElementById('stages-to-validate-list'),
    pendingConformityReportTemplate: document.getElementById('pending-conformity-report-template'),
    studentToActivateTemplate: document.getElementById('student-to-activate-template'),
    openReclamationTemplate: document.getElementById('open-reclamation-template'),
    stageToValidateTemplate: document.getElementById('stage-to-validate-template'),

    // Gestion des Dossiers Étudiants
    tabs: document.querySelectorAll('.tabs-container .tab'),
    tabContents: document.querySelectorAll('.tabs-container .tab-content'),
    studentsListBody: document.getElementById('students-list-body'),
    searchStudentsInput: document.getElementById('search-students'),
    filterStudentLevel: document.getElementById('filter-student-level'),
    filterStudentPayment: document.getElementById('filter-student-payment'),
    exportStudentsPdfBtn: document.getElementById('export-students-pdf-btn'),
    exportStudentsCsvBtn: document.getElementById('export-students-csv-btn'),
    studentRowTemplate: document.getElementById('student-row-template'),

    // Modale de Détails Étudiant
    studentDetailsModal: document.getElementById('student-details-modal'),
    studentDetailsName: document.getElementById('student-details-name'),
    studentDetailsTabs: document.querySelectorAll('.student-details-tabs .tab'),
    studentDetailContents: document.querySelectorAll('.detail-tab-content'),
    detailMatricule: document.getElementById('detail-matricule'),
    detailEmail: document.getElementById('detail-email'),
    detailDob: document.getElementById('detail-dob'),
    detailInscriptionsList: document.getElementById('detail-inscriptions-list'),
    detailNotesList: document.getElementById('detail-notes-list'),
    detailStagesList: document.getElementById('detail-stages-list'),
    detailPenaltiesList: document.getElementById('detail-penalties-list'),
    detailReclamationsList: document.getElementById('detail-reclamations-list'),
    detailReportsList: document.getElementById('detail-reports-list'),
    detailInscriptionRowTemplate: document.getElementById('detail-inscription-row-template'),
    detailNoteRowTemplate: document.getElementById('detail-note-row-template'),
    detailStageRowTemplate: document.getElementById('detail-stage-row-template'),
    detailPenaltyRowTemplate: document.getElementById('detail-penalty-row-template'),
    detailReclamationRowTemplate: document.getElementById('detail-reclamation-row-template'),
    detailReportRowTemplate: document.getElementById('detail-report-row-template'),

    // Modale de Vérification Conformité
    conformityCheckModal: document.getElementById('conformity-check-modal'),
    conformityReportTitle: document.getElementById('conformity-report-title'),
    conformityStudentName: document.getElementById('conformity-student-name'),
    conformityCurrentStatus: document.getElementById('conformity-current-status'),
    conformityReportContent: document.getElementById('conformity-report-content'),
    conformityChecklistForm: document.getElementById('conformity-checklist-form'),
    conformityReportIdHidden: document.getElementById('conformity-report-id-hidden'),
    checklistItemsContainer: document.getElementById('checklist-items-container'),
    conformityGeneralComment: document.getElementById('conformity-general-comment'),
    conformityChecklistItemTemplate: document.getElementById('conformity-checklist-item-template'),

    // Modale d'Activation Compte Étudiant
    activateStudentAccountModal: document.getElementById('activate-student-account-modal'),
    activateStudentName: document.getElementById('activate-student-name'),
    activateStudentAccountForm: document.getElementById('activate-student-account-form'),
    activateStudentIdHidden: document.getElementById('activate-student-id-hidden'),

    // Modale de Réponse Réclamation
    reclamationResponseModal: document.getElementById('reclamation-response-modal'),
    reclamationSubjectDisplay: document.getElementById('reclamation-subject-display'),
    reclamationStudentDisplay: document.getElementById('reclamation-student-display'),
    reclamationDescriptionDisplay: document.getElementById('reclamation-description-display'),
    reclamationResponseForm: document.getElementById('reclamation-response-form'),
    reclamationIdHidden: document.getElementById('reclamation-id-hidden'),
    reclamationResponseText: document.getElementById('reclamation-response-text'),
};

// --- INITIALISATION DE LA PAGE PERSONNEL ---
export async function initPage(user, permissions) {
    currentUser = user;
    userPermissions = permissions;

    if (!hasPermission('TRAIT_PERS_ADMIN_DASHBOARD_ACCEDER')) {
        displayMessage(document.getElementById('global-flash-messages'), 'error', 'Accès refusé à ce module.');
        window.location.href = '/pages/etudiant/dashboard.html'; // Rediriger si pas personnel admin
        return;
    }

    const currentPath = window.location.pathname;
    if (currentPath.includes('dashboard.html')) {
        await loadPersonnelDashboard();
    } else if (currentPath.includes('gestion-dossiers.html')) {
        await loadGestionDossiersPage();
    }
}

function hasPermission(permissionCode) {
    return userPermissions.includes(permissionCode);
}

// --- DASHBOARD PERSONNEL ---
async function loadPersonnelDashboard() {
    // Afficher/cacher les cartes selon le rôle
    const isRS = currentUser.profile.id_groupe_utilisateur === ROLES.RS;
    const isAgentConformite = currentUser.profile.id_groupe_utilisateur === ROLES.AGENT_CONFORMITE;

    personnelUI.conformityReportsCard.classList.toggle('hidden', !isAgentConformite);
    personnelUI.studentsToActivateCard.classList.toggle('hidden', !isRS);
    personnelUI.openReclamationsCard.classList.toggle('hidden', !isRS);
    personnelUI.stagesToValidateCard.classList.toggle('hidden', !isRS);

    if (isAgentConformite) {
        await loadPendingConformityReports();
    }
    if (isRS) {
        await loadStudentsToActivate();
        await loadOpenReclamations();
        await loadStagesToValidate();
    }
    setupPersonnelDashboardEventListeners();
}

async function loadPendingConformityReports() {
    const { data: reports, error } = await dataService.getRecords(TABLES.RAPPORT_ETUDIANT, { id_statut_rapport: REPORT_STATUS.SOUMIS });
    if (error) { console.error("Error loading conformity reports:", error); return; }

    personnelUI.statPendingConformityReports.textContent = reports.length;
    personnelUI.pendingConformityReportsList.innerHTML = '';
    if (reports.length === 0) {
        personnelUI.pendingConformityReportsList.innerHTML = '<li>Aucun rapport en attente de vérification.</li>';
        return;
    }
    for (const report of reports) {
        const student = await dataService.getRecordById(TABLES.ETUDIANT, report.numero_carte_etudiant);
        const row = personnelUI.pendingConformityReportTemplate.content.cloneNode(true);
        row.querySelector('.item-title').textContent = report.libelle_rapport_etudiant;
        row.querySelector('.student-name').textContent = student ? `${student.prenom} ${student.nom}` : 'N/A';
        row.querySelector('.view-conformity-btn').dataset.reportId = report.id_rapport_etudiant;
        personnelUI.pendingConformityReportsList.appendChild(row);
    }
}

async function loadStudentsToActivate() {
    // Récupérer les entités étudiant sans compte utilisateur
    const { data: students, error } = await dataService.getRecords(TABLES.ETUDIANT, { numero_utilisateur: null });
    if (error) { console.error("Error loading students to activate:", error); return; }

    personnelUI.statStudentsToActivate.textContent = students.length;
    personnelUI.studentsToActivateList.innerHTML = '';
    if (students.length === 0) {
        personnelUI.studentsToActivateList.innerHTML = '<li>Aucun étudiant en attente d\'activation.</li>';
        return;
    }
    for (const student of students) {
        const row = personnelUI.studentToActivateTemplate.content.cloneNode(true);
        row.querySelector('.item-title').textContent = `${student.prenom} ${student.nom}`;
        row.querySelector('.student-email').textContent = student.email_contact_secondaire || 'N/A'; // Ou email principal si disponible
        row.querySelector('.activate-student-btn').dataset.studentId = student.numero_carte_etudiant;
        personnelUI.studentsToActivateList.appendChild(row);
    }
}

async function loadOpenReclamations() {
    const { data: reclamations, error } = await dataService.getRecords(TABLES.RECLAMATION, { id_statut_reclamation: 'RECLA_OUVERTE' });
    if (error) { console.error("Error loading open reclamations:", error); return; }

    personnelUI.statOpenReclamations.textContent = reclamations.length;
    personnelUI.openReclamationsList.innerHTML = '';
    if (reclamations.length === 0) {
        personnelUI.openReclamationsList.innerHTML = '<li>Aucune réclamation ouverte.</li>';
        return;
    }
    for (const rec of reclamations) {
        const student = await dataService.getRecordById(TABLES.ETUDIANT, rec.numero_carte_etudiant);
        const row = personnelUI.openReclamationTemplate.content.cloneNode(true);
        row.querySelector('.item-title').textContent = rec.sujet_reclamation;
        row.querySelector('.student-name').textContent = student ? `${student.prenom} ${student.nom}` : 'N/A';
        row.querySelector('.view-reclamation-btn').dataset.reclamationId = rec.id_reclamation;
        personnelUI.openReclamationsList.appendChild(row);
    }
}

async function loadStagesToValidate() {
    const { data: stages, error } = await dataService.getRecords(TABLES.FAIRE_STAGE, { est_valide: false });
    if (error) { console.error("Error loading stages to validate:", error); return; }

    personnelUI.statStagesToValidate.textContent = stages.length;
    personnelUI.stagesToValidateList.innerHTML = '';
    if (stages.length === 0) {
        personnelUI.stagesToValidateList.innerHTML = '<li>Aucun stage en attente de validation.</li>';
        return;
    }
    for (const stage of stages) {
        const student = await dataService.getRecordById(TABLES.ETUDIANT, stage.numero_carte_etudiant);
        const row = personnelUI.stageToValidateTemplate.content.cloneNode(true);
        row.querySelector('.item-title').textContent = stage.sujet_stage;
        row.querySelector('.student-name').textContent = student ? `${student.prenom} ${student.nom}` : 'N/A';
        row.querySelector('.validate-stage-btn').dataset.stageId = stage.id_entreprise; // Ou un ID unique pour le stage
        row.querySelector('.validate-stage-btn').dataset.studentId = stage.numero_carte_etudiant;
        personnelUI.stagesToValidateList.appendChild(row);
    }
}

function setupPersonnelDashboardEventListeners() {
    personnelUI.pendingConformityReportsList.addEventListener('click', (e) => {
        const btn = e.target.closest('.view-conformity-btn');
        if (btn) openConformityCheckModal(btn.dataset.reportId);
    });
    personnelUI.studentsToActivateList.addEventListener('click', (e) => {
        const btn = e.target.closest('.activate-student-btn');
        if (btn) openActivateStudentAccountModal(btn.dataset.studentId);
    });
    personnelUI.openReclamationsList.addEventListener('click', (e) => {
        const btn = e.target.closest('.view-reclamation-btn');
        if (btn) openReclamationResponseModal(btn.dataset.reclamationId);
    });
    personnelUI.stagesToValidateList.addEventListener('click', (e) => {
        const btn = e.target.closest('.validate-stage-btn');
        if (btn) handleValidateStage(btn.dataset.studentId, btn.dataset.stageId);
    });
}

// --- GESTION DES DOSSIERS ÉTUDIANTS ---
async function loadGestionDossiersPage() {
    // Vérifier les permissions spécifiques (RS ou Agent Conformité)
    const isRS = currentUser.profile.id_groupe_utilisateur === ROLES.RS;
    const isAgentConformite = currentUser.profile.id_groupe_utilisateur === ROLES.AGENT_CONFORMITE;

    // Cacher les onglets non pertinents pour l'agent de conformité
    if (isAgentConformite && !isRS) {
        personnelUI.tabs.forEach(tab => {
            if (!['students-list', 'conformity'].includes(tab.dataset.tab)) {
                tab.style.display = 'none';
            }
        });
    }

    setupTabs();
    await populateStudentFilters();
    await fetchAndDisplayStudents();
    setupGestionDossiersEventListeners();

    // Gérer l'onglet actif via l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    if (tab) {
        const targetTab = document.querySelector(`.tabs-container .tab[data-tab="${tab}"]`);
        if (targetTab) targetTab.click();
    }
}

function setupTabs() {
    personnelUI.tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            personnelUI.tabs.forEach(t => t.classList.remove('tab-active'));
            personnelUI.tabContents.forEach(tc => tc.classList.remove('active'));
            tab.classList.add('tab-active');
            document.getElementById(`tab-content-${tab.dataset.tab}`).classList.add('active');
        });
    });
}

async function populateStudentFilters() {
    const { data: levels, error: levelError } = await dataService.getRecords(TABLES.NIVEAU_ETUDE);
    const { data: paymentStatuses, error: paymentError } = await dataService.getRecords(TABLES.STATUT_PAIEMENT_REF);

    if (!levelError) {
        levels.forEach(l => {
            const opt = document.createElement('option'); opt.value = l.id_niveau_etude; opt.textContent = l.libelle_niveau_etude; personnelUI.filterStudentLevel.appendChild(opt);
        });
    }
    if (!paymentError) {
        paymentStatuses.forEach(ps => {
            const opt = document.createElement('option'); opt.value = ps.id_statut_paiement; opt.textContent = ps.libelle_statut_paiement; personnelUI.filterStudentPayment.appendChild(opt);
        });
    }
}

async function fetchAndDisplayStudents(filters = {}) {
    personnelUI.studentsListBody.innerHTML = '<tr><td colspan="7" class="text-center">Chargement...</td></tr>';
    // Requête complexe pour joindre utilisateur, etudiant, inscrire (pour niveau et paiement)
    // Idéalement, cette requête serait une fonction Edge pour des raisons de performance et de sécurité RLS.
    const { data: students, error } = await dataService.getRecords(TABLES.ETUDIANT); // Simplifié

    if (error) {
        displayMessage(document.getElementById('global-flash-messages'), 'error', 'Erreur de chargement des étudiants.');
        return;
    }

    personnelUI.studentsListBody.innerHTML = '';
    if (students.length === 0) {
        personnelUI.studentsListBody.innerHTML = '<tr><td colspan="7" class="text-center">Aucun étudiant trouvé.</td></tr>';
        return;
    }

    for (const student of students) {
        const userAccount = await dataService.getRecordById(TABLES.UTILISATEUR, student.numero_utilisateur);
        const inscription = await dataService.getRecords(TABLES.INSCRIRE, { numero_carte_etudiant: student.numero_carte_etudiant }, 'date_inscription DESC', 1);

        const row = personnelUI.studentRowTemplate.content.cloneNode(true);
        row.querySelector('.student-matricule').textContent = student.numero_carte_etudiant;
        row.querySelector('.student-full-name').textContent = `${student.prenom} ${student.nom}`;
        row.querySelector('.student-email').textContent = userAccount?.email_principal || 'N/A';
        row.querySelector('.student-level').textContent = inscription[0]?.id_niveau_etude || 'N/A';
        row.querySelector('.student-payment-status').textContent = inscription[0]?.id_statut_paiement || 'N/A';
        row.querySelector('.student-account-status').textContent = userAccount?.statut_compte || 'N/A';

        const actionsCell = row.querySelector('.student-actions');
        actionsCell.querySelector('.view-student-details-btn').dataset.studentId = student.numero_carte_etudiant;
        actionsCell.querySelector('.impersonate-student-btn').dataset.studentId = student.numero_carte_etudiant;

        personnelUI.studentsListBody.appendChild(row);
    }
}

function setupGestionDossiersEventListeners() {
    personnelUI.searchStudentsInput.addEventListener('input', () => applyStudentFilters());
    personnelUI.filterStudentLevel.addEventListener('change', () => applyStudentFilters());
    personnelUI.filterStudentPayment.addEventListener('change', () => applyStudentFilters());
    personnelUI.studentsListBody.addEventListener('click', handleStudentListActions);
    personnelUI.exportStudentsPdfBtn.addEventListener('click', () => handleExportStudents('pdf'));
    personnelUI.exportStudentsCsvBtn.addEventListener('click', () => handleExportStudents('csv'));

    // Modale de détails étudiant
    personnelUI.studentDetailsTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            personnelUI.studentDetailsTabs.forEach(t => t.classList.remove('tab-active'));
            personnelUI.studentDetailContents.forEach(tc => tc.classList.remove('active'));
            e.currentTarget.classList.add('tab-active');
            document.getElementById(`student-detail-content-${e.currentTarget.dataset.detailTab}`).classList.add('active');
            // Recharger les données spécifiques à l'onglet si nécessaire
        });
    });

    // Conformity tab actions
    personnelUI.conformityQueueBody.addEventListener('click', (e) => {
        const btn = e.target.closest('.view-conformity-btn');
        if (btn) openConformityCheckModal(btn.dataset.reportId);
    });
    personnelUI.conformityChecklistForm.addEventListener('submit', handleConformityCheckSubmit);

    // Access tab actions
    personnelUI.accessManagementBody.addEventListener('click', (e) => {
        const btn = e.target.closest('.activate-student-btn');
        if (btn) openActivateStudentAccountModal(btn.dataset.studentId);
    });
    personnelUI.activateStudentAccountForm.addEventListener('submit', handleActivateStudentAccountSubmit);

    // Réclamations tab actions
    personnelUI.reclamationsContent.addEventListener('click', (e) => {
        const btn = e.target.closest('.view-reclamation-btn');
        if (btn) openReclamationResponseModal(btn.dataset.reclamationId);
    });
    personnelUI.reclamationResponseForm.addEventListener('submit', handleReclamationResponseSubmit);
}

function applyStudentFilters() {
    const filters = {};
    if (personnelUI.searchStudentsInput.value) filters.search = personnelUI.searchStudentsInput.value;
    if (personnelUI.filterStudentLevel.value) filters.id_niveau_etude = personnelUI.filterStudentLevel.value;
    if (personnelUI.filterStudentPayment.value) filters.id_statut_paiement = personnelUI.filterStudentPayment.value;
    fetchAndDisplayStudents(filters);
}

async function handleStudentListActions(e) {
    const target = e.target.closest('button');
    if (!target) return;
    const studentId = target.dataset.studentId;

    if (target.classList.contains('view-student-details-btn')) {
        await openStudentDetailsModal(studentId);
    } else if (target.classList.contains('impersonate-student-btn')) {
        confirmAction('Impersonnaliser Étudiant', `Voulez-vous vous connecter en tant que ${studentId} ?`, async () => {
            // Fonction Edge pour l'impersonation
            displayMessage(document.getElementById('global-flash-messages'), 'info', `Impersonnalisation de ${studentId} (simulée).`);
            // window.location.href = `/pages/etudiant/dashboard.html?impersonate=${studentId}`;
        });
    }
}

async function openStudentDetailsModal(studentId) {
    currentStudentId = studentId;
    const { data: student, error: studentError } = await dataService.getRecordById(TABLES.ETUDIANT, studentId);
    const { data: userAccount, error: userError } = await dataService.getRecordById(TABLES.UTILISATEUR, studentId); // Assuming user ID is student ID

    if (studentError || userError || !student || !userAccount) {
        displayMessage(document.getElementById('global-flash-messages'), 'error', 'Dossier étudiant non trouvé.');
        return;
    }

    personnelUI.studentDetailsName.textContent = `${student.prenom} ${student.nom}`;
    personnelUI.detailMatricule.textContent = student.numero_carte_etudiant;
    personnelUI.detailEmail.textContent = userAccount.email_principal;
    personnelUI.detailDob.textContent = student.date_naissance ? formatDate(student.date_naissance) : 'N/A';

    // Load data for each tab
    await loadStudentInscriptions(studentId);
    await loadStudentNotes(studentId);
    await loadStudentStages(studentId);
    await loadStudentPenalties(studentId);
    await loadStudentReclamations(studentId);
    await loadStudentReports(studentId);

    openModal(personnelUI.studentDetailsModal);
}

async function loadStudentInscriptions(studentId) {
    const { data: inscriptions, error } = await dataService.getRecords(TABLES.INSCRIRE, { numero_carte_etudiant: studentId }, 'date_inscription DESC');
    personnelUI.detailInscriptionsList.innerHTML = '';
    if (!error && inscriptions.length > 0) {
        inscriptions.forEach(insc => {
            const row = personnelUI.detailInscriptionRowTemplate.content.cloneNode(true);
            row.querySelector('.inscription-year').textContent = insc.id_annee_academique;
            row.querySelector('.inscription-level').textContent = insc.id_niveau_etude;
            row.querySelector('.inscription-amount').textContent = `${insc.montant_inscription} €`;
            row.querySelector('.inscription-payment-status').textContent = insc.id_statut_paiement;
            row.querySelector('.edit-inscription-btn').dataset.id = insc.id_annee_academique; // PK composite
            row.querySelector('.edit-inscription-btn').dataset.level = insc.id_niveau_etude;
            personnelUI.detailInscriptionsList.appendChild(row);
        });
    } else {
        personnelUI.detailInscriptionsList.innerHTML = '<tr><td colspan="5" class="text-center">Aucune inscription.</td></tr>';
    }
}

async function loadStudentNotes(studentId) {
    const { data: notes, error } = await dataService.getRecords(TABLES.EVALUER, { numero_carte_etudiant: studentId }, 'id_annee_academique DESC');
    personnelUI.detailNotesList.innerHTML = '';
    if (!error && notes.length > 0) {
        for (const note of notes) {
            const ecue = await dataService.getRecordById(TABLES.ECUE, note.id_ecue);
            const ue = ecue ? await dataService.getRecordById(TABLES.UE, ecue.id_ue) : null;
            const row = personnelUI.detailNoteRowTemplate.content.cloneNode(true);
            row.querySelector('.note-ue').textContent = ue?.libelle_ue || 'N/A';
            row.querySelector('.note-ecue').textContent = ecue?.libelle_ecue || 'N/A';
            row.querySelector('.note-value').textContent = note.note;
            row.querySelector('.note-year').textContent = note.id_annee_academique;
            row.querySelector('.edit-note-btn').dataset.ecueId = note.id_ecue;
            row.querySelector('.edit-note-btn').dataset.yearId = note.id_annee_academique;
            personnelUI.detailNotesList.appendChild(row);
        }
    } else {
        personnelUI.detailNotesList.innerHTML = '<tr><td colspan="5" class="text-center">Aucune note.</td></tr>';
    }
}

async function loadStudentStages(studentId) {
    const { data: stages, error } = await dataService.getRecords(TABLES.FAIRE_STAGE, { numero_carte_etudiant: studentId }, 'date_debut_stage DESC');
    personnelUI.detailStagesList.innerHTML = '';
    if (!error && stages.length > 0) {
        for (const stage of stages) {
            const company = await dataService.getRecordById(TABLES.ENTREPRISE, stage.id_entreprise);
            const row = personnelUI.detailStageRowTemplate.content.cloneNode(true);
            row.querySelector('.stage-company').textContent = company?.libelle_entreprise || 'N/A';
            row.querySelector('.stage-subject').textContent = stage.sujet_stage;
            row.querySelector('.stage-start-date').textContent = formatDate(stage.date_debut_stage);
            row.querySelector('.stage-end-date').textContent = stage.date_fin_stage ? formatDate(stage.date_fin_stage) : 'En cours';
            row.querySelector('.stage-validated').textContent = stage.est_valide ? 'Oui' : 'Non';
            row.querySelector('.edit-stage-btn').dataset.companyId = stage.id_entreprise;
            row.querySelector('.edit-stage-btn').dataset.studentId = studentId;
            row.querySelector('.validate-stage-btn').dataset.companyId = stage.id_entreprise;
            row.querySelector('.validate-stage-btn').dataset.studentId = studentId;
            row.querySelector('.validate-stage-btn').classList.toggle('hidden', stage.est_valide); // Hide if already validated
            personnelUI.detailStagesList.appendChild(row);
        }
    } else {
        personnelUI.detailStagesList.innerHTML = '<tr><td colspan="6" class="text-center">Aucun stage.</td></tr>';
    }
}

async function loadStudentPenalties(studentId) {
    const { data: penalties, error } = await dataService.getRecords(TABLES.PENALITE, { numero_carte_etudiant: studentId }, 'date_creation DESC');
    personnelUI.detailPenaltiesList.innerHTML = '';
    if (!error && penalties.length > 0) {
        for (const penalty of penalties) {
            const status = await dataService.getRecordById(TABLES.STATUT_PENALITE_REF, penalty.id_statut_penalite);
            const row = personnelUI.detailPenaltyRowTemplate.content.cloneNode(true);
            row.querySelector('.penalty-type').textContent = penalty.type_penalite;
            row.querySelector('.penalty-amount').textContent = `${penalty.montant_du} €`;
            row.querySelector('.penalty-motif').textContent = penalty.motif;
            row.querySelector('.penalty-status').textContent = status?.libelle_statut_penalite || 'N/A';
            row.querySelector('.regularize-penalty-btn').dataset.id = penalty.id_penalite;
            row.querySelector('.regularize-penalty-btn').classList.toggle('hidden', penalty.id_statut_penalite !== 'PEN_DUE');
            personnelUI.detailPenaltiesList.appendChild(row);
        }
    } else {
        personnelUI.detailPenaltiesList.innerHTML = '<tr><td colspan="5" class="text-center">Aucune pénalité.</td></tr>';
    }
}

async function loadStudentReclamations(studentId) {
    const { data: reclamations, error } = await dataService.getRecords(TABLES.RECLAMATION, { numero_carte_etudiant: studentId }, 'date_soumission DESC');
    personnelUI.detailReclamationsList.innerHTML = '';
    if (!error && reclamations.length > 0) {
        for (const rec of reclamations) {
            const status = await dataService.getRecordById(TABLES.STATUT_RECLAMATION_REF, rec.id_statut_reclamation);
            const row = personnelUI.detailReclamationRowTemplate.content.cloneNode(true);
            row.querySelector('.reclamation-subject').textContent = rec.sujet_reclamation;
            row.querySelector('.reclamation-status').textContent = status?.libelle_statut_reclamation || 'N/A';
            row.querySelector('.reclamation-date').textContent = formatDate(rec.date_soumission);
            row.querySelector('.view-reclamation-btn').dataset.id = rec.id_reclamation;
            personnelUI.detailReclamationsList.appendChild(row);
        }
    } else {
        personnelUI.detailReclamationsList.innerHTML = '<tr><td colspan="4" class="text-center">Aucune réclamation.</td></tr>';
    }
}

async function loadStudentReports(studentId) {
    const { data: reports, error } = await dataService.getRecords(TABLES.RAPPORT_ETUDIANT, { numero_carte_etudiant: studentId }, 'date_soumission DESC');
    personnelUI.detailReportsList.innerHTML = '';
    if (!error && reports.length > 0) {
        for (const report of reports) {
            const status = await dataService.getRecordById(TABLES.STATUT_RAPPORT_REF, report.id_statut_rapport);
            const row = personnelUI.detailReportRowTemplate.content.cloneNode(true);
            row.querySelector('.report-title').textContent = report.libelle_rapport_etudiant;
            row.querySelector('.report-status').textContent = status?.libelle_statut_rapport || 'N/A';
            row.querySelector('.report-submission-date').textContent = formatDate(report.date_soumission);
            row.querySelector('.view-report-btn').dataset.id = report.id_rapport_etudiant;
            row.querySelector('.force-status-btn').dataset.id = report.id_rapport_etudiant;
            personnelUI.detailReportsList.appendChild(row);
        }
    } else {
        personnelUI.detailReportsList.innerHTML = '<tr><td colspan="4" class="text-center">Aucun rapport.</td></tr>';
    }
}

async function handleExportStudents(format) {
    setButtonLoading(format === 'pdf' ? personnelUI.exportStudentsPdfBtn : personnelUI.exportStudentsCsvBtn, true);
    // Récupérer les données filtrées (si des filtres sont appliqués)
    const filters = {}; // Appliquer les filtres de la page si nécessaire
    const { data: students, error } = await dataService.getRecords(TABLES.ETUDIANT); // Simplifié

    if (error) {
        displayMessage(document.getElementById('global-flash-messages'), 'error', `Erreur d'export: ${error.message}`);
        setButtonLoading(format === 'pdf' ? personnelUI.exportStudentsPdfBtn : personnelUI.exportStudentsCsvBtn, false);
        return;
    }

    // Appeler la fonction Edge pour générer le document
    const { success, url, message } = await functionService.generatePdf(
        `students_list_${format}`,
        { students: students, format: format }
    ); // Fonction Edge à créer

    if (!success) {
        displayMessage(document.getElementById('global-flash-messages'), 'error', `Erreur d'export: ${message}`);
    } else {
        displayMessage(document.getElementById('global-flash-messages'), 'success', 'Export généré. Téléchargement en cours...');
        window.open(url, '_blank'); // Ouvrir l'URL de téléchargement dans un nouvel onglet
    }
    setButtonLoading(format === 'pdf' ? personnelUI.exportStudentsPdfBtn : personnelUI.exportStudentsCsvBtn, false);
}

// --- GESTION DE LA CONFORMITÉ ---
async function openConformityCheckModal(reportId) {
    currentReportId = reportId;
    const { data: report, error: reportError } = await dataService.getRecordById(TABLES.RAPPORT_ETUDIANT, reportId);
    if (reportError || !report) {
        displayMessage(document.getElementById('global-flash-messages'), 'error', 'Rapport non trouvé.');
        return;
    }
    const student = await dataService.getRecordById(TABLES.ETUDIANT, report.numero_carte_etudiant);
    const sections = await dataService.getRecords(TABLES.SECTION_RAPPORT, { id_rapport_etudiant: reportId }, 'ordre ASC');
    const checklistItems = await dataService.getRecords(TABLES.CRITERE_CONFORMITE_REF, { est_actif: true });
    const existingConformityDetails = await dataService.getRecords(TABLES.CONFORMITE_RAPPORT_DETAILS, { id_rapport_etudiant: reportId });

    personnelUI.conformityReportTitle.textContent = report.libelle_rapport_etudiant;
    personnelUI.conformityStudentName.textContent = student ? `${student.prenom} ${student.nom}` : 'N/A';
    personnelUI.conformityCurrentStatus.textContent = report.id_statut_rapport;
    personnelUI.conformityReportIdHidden.value = reportId;

    // Afficher le contenu du rapport
    personnelUI.conformityReportContent.innerHTML = `
        <h2>${report.libelle_rapport_etudiant}</h2>
        <h3>Thème: ${report.theme}</h3>
        <h4>Résumé:</h4><div>${report.resume || 'Pas de résumé.'}</div>
    `;
    sections.forEach(sec => {
        personnelUI.conformityReportContent.innerHTML += `<h4>${sec.titre_section}:</h4><div>${sec.contenu_section || 'Pas de contenu.'}</div>`;
    });

    // Remplir la checklist
    personnelUI.checklistItemsContainer.innerHTML = '';
    checklistItems.forEach(item => {
        const checklistRow = personnelUI.conformityChecklistItemTemplate.content.cloneNode(true);
        const checkbox = checklistRow.querySelector('.checklist-checkbox');
        const label = checklistRow.querySelector('.checklist-label');
        const comment = checklistRow.querySelector('.checklist-comment');

        checkbox.id = `checklist-${item.id_critere}`;
        checkbox.name = `checklist[${item.id_critere}][status]`;
        label.htmlFor = checkbox.id;
        label.textContent = item.libelle_critere;
        comment.name = `checklist[${item.id_critere}][comment]`;

        const existingDetail = existingConformityDetails.data?.find(d => d.id_critere === item.id_critere);
        if (existingDetail) {
            checkbox.checked = existingDetail.statut_validation === 'Conforme';
            comment.value = existingDetail.commentaire || '';
        }

        personnelUI.checklistItemsContainer.appendChild(checklistRow);
    });

    openModal(personnelUI.conformityCheckModal);
}

async function handleConformityCheckSubmit(e) {
    e.preventDefault();
    const submitter = e.submitter;
    setButtonLoading(submitter, true);

    const reportId = personnelUI.conformityReportIdHidden.value;
    const generalComment = personnelUI.conformityGeneralComment.value;
    const decisionConformite = submitter.value; // 'conforme' ou 'non-conforme'

    if (!generalComment.trim()) {
        displayMessage(personnelUI.conformityCheckModal.querySelector('.modal-box'), 'error', 'Un commentaire général est obligatoire.');
        setButtonLoading(submitter, false);
        return;
    }

    const checklistData = [];
    personnelUI.checklistItemsContainer.querySelectorAll('.checklist-item').forEach(item => {
        const checkbox = item.querySelector('.checklist-checkbox');
        const comment = item.querySelector('.checklist-comment');
        checklistData.push({
            id_critere: checkbox.id.replace('checklist-', ''),
            statut_validation: checkbox.checked ? 'Conforme' : 'Non Conforme', // Simplifié
            commentaire: comment.value,
        });
    });

    // Appeler une fonction Edge pour traiter la vérification de conformité
    const { success, message } = await functionService.processConformityCheck(
        reportId,
        currentUser.id,
        decisionConformite === 'conforme',
        checklistData,
        generalComment
    ); // Fonction Edge à créer

    if (!success) {
        displayMessage(personnelUI.conformityCheckModal.querySelector('.modal-box'), 'error', `Erreur: ${message}`);
    } else {
        displayMessage(document.getElementById('global-flash-messages'), 'success', 'Vérification de conformité enregistrée.');
        closeModal(personnelUI.conformityCheckModal);
        loadPendingConformityReports(); // Recharger la liste du dashboard
        fetchAndDisplayStudents(); // Recharger la liste générale des étudiants
    }
    setButtonLoading(submitter, false);
}

// --- GESTION DES ACCÈS ÉTUDIANTS ---
async function openActivateStudentAccountModal(studentId) {
    currentStudentId = studentId;
    const { data: student, error } = await dataService.getRecordById(TABLES.ETUDIANT, studentId);
    if (error || !student) {
        displayMessage(document.getElementById('global-flash-messages'), 'error', 'Étudiant non trouvé.');
        return;
    }

    personnelUI.activateStudentName.textContent = `${student.prenom} ${student.nom}`;
    personnelUI.activateStudentIdHidden.value = studentId;
    personnelUI.activateStudentAccountForm.querySelector('#activate-email').value = student.email_contact_secondaire || student.email_principal; // Utiliser l'email principal si pas de secondaire
    personnelUI.activateStudentAccountForm.querySelector('#activate-login').value = `${student.nom.toLowerCase()}.${student.prenom.toLowerCase().charAt(0)}`; // Suggestion de login

    openModal(personnelUI.activateStudentAccountModal);
}

async function handleActivateStudentAccountSubmit(e) {
    e.preventDefault();
    if (!validateForm(personnelUI.activateStudentAccountForm)) {
        displayMessage(personnelUI.activateStudentAccountModal.querySelector('.modal-box'), 'error', 'Veuillez remplir tous les champs requis.');
        return;
    }
    setButtonLoading(e.submitter, true);
    const formData = getFormData(personnelUI.activateStudentAccountForm);
    const studentId = formData.numero_etudiant;

    // Appeler une fonction Edge pour activer le compte (création Auth Supabase, liaison DB, envoi email)
    const { success, message } = await functionService.activateStudentAccount(
        studentId,
        formData.login_utilisateur,
        formData.email_principal,
        formData.mot_de_passe
    ); // Fonction Edge à créer

    if (!success) {
        displayMessage(personnelUI.activateStudentAccountModal.querySelector('.modal-box'), 'error', `Erreur: ${message}`);
    } else {
        displayMessage(document.getElementById('global-flash-messages'), 'success', 'Compte étudiant activé avec succès.');
        closeModal(personnelUI.activateStudentAccountModal);
        loadStudentsToActivate(); // Recharger la liste du dashboard
        fetchAndDisplayStudents(); // Recharger la liste générale
    }
    setButtonLoading(e.submitter, false);
}

// --- GESTION DES RÉCLAMATIONS ---
async function openReclamationResponseModal(reclamationId) {
    currentReclamationId = reclamationId;
    const { data: reclamation, error } = await dataService.getRecordById(TABLES.RECLAMATION, reclamationId);
    if (error || !reclamation) {
        displayMessage(document.getElementById('global-flash-messages'), 'error', 'Réclamation non trouvée.');
        return;
    }
    const student = await dataService.getRecordById(TABLES.ETUDIANT, reclamation.numero_carte_etudiant);

    personnelUI.reclamationSubjectDisplay.textContent = reclamation.sujet_reclamation;
    personnelUI.reclamationStudentDisplay.textContent = student ? `${student.prenom} ${student.nom}` : 'N/A';
    personnelUI.reclamationDescriptionDisplay.textContent = reclamation.description_reclamation;
    personnelUI.reclamationIdHidden.value = reclamationId;
    personnelUI.reclamationResponseText.value = reclamation.reponse_reclamation || '';

    openModal(personnelUI.reclamationResponseModal);
}

async function handleReclamationResponseSubmit(e) {
    e.preventDefault();
    const submitter = e.submitter;
    setButtonLoading(submitter, true);

    const reclamationId = personnelUI.reclamationIdHidden.value;
    const responseText = personnelUI.reclamationResponseText.value;
    const action = submitter.value; // 'respond' ou 'close'

    if (!responseText.trim()) {
        displayMessage(personnelUI.reclamationResponseModal.querySelector('.modal-box'), 'error', 'La réponse ne peut pas être vide.');
        setButtonLoading(submitter, false);
        return;
    }

    let result;
    if (action === 'respond') {
        result = await functionService.respondToReclamation(reclamationId, responseText, currentUser.id); // Fonction Edge
    } else if (action === 'close') {
        result = await functionService.closeReclamation(reclamationId, responseText, currentUser.id); // Fonction Edge
    }

    if (!result.success) {
        displayMessage(personnelUI.reclamationResponseModal.querySelector('.modal-box'), 'error', `Erreur: ${result.message}`);
    } else {
        displayMessage(document.getElementById('global-flash-messages'), 'success', `Réclamation ${action === 'close' ? 'clôturée' : 'répondue'} avec succès.`);
        closeModal(personnelUI.reclamationResponseModal);
        loadOpenReclamations(); // Recharger la liste du dashboard
        loadStudentReclamations(currentStudentId); // Recharger la liste dans la modale étudiant si ouverte
    }
    setButtonLoading(submitter, false);
}

// --- GESTION DES STAGES ---
async function handleValidateStage(studentId, companyId) {
    confirmAction('Valider Stage', `Voulez-vous valider le stage de l'étudiant ${studentId} chez ${companyId} ?`, async () => {
        // Valider le stage via une fonction Edge
        const { success, message } = await functionService.validateStage(studentId, companyId, currentUser.id); // Fonction Edge
        if (!success) {
            displayMessage(document.getElementById('global-flash-messages'), 'error', `Erreur: ${message}`);
        } else {
            displayMessage(document.getElementById('global-flash-messages'), 'success', 'Stage validé avec succès.');
            loadStagesToValidate(); // Recharger la liste du dashboard
            loadStudentStages(studentId); // Recharger la liste dans la modale étudiant si ouverte
        }
    });
}

// --- UTILS COMMUNES (pour les modales de confirmation) ---
function confirmAction(title, message, onConfirm) {
    const modal = document.getElementById('confirm-modal');
    document.getElementById('confirm-modal-title').textContent = title;
    document.getElementById('confirm-modal-message').textContent = message;

    const confirmBtn = document.getElementById('confirm-modal-confirm');
    const cancelBtn = document.getElementById('confirm-modal-cancel');

    const handleConfirm = async () => {
        setButtonLoading(confirmBtn, true);
        await onConfirm();
        setButtonLoading(confirmBtn, false);
        closeModal(modal);
        confirmBtn.removeEventListener('click', handleConfirm);
        cancelBtn.removeEventListener('click', handleCancel);
    };

    const handleCancel = () => {
        closeModal(modal);
        confirmBtn.removeEventListener('click', handleConfirm);
        cancelBtn.removeEventListener('click', handleCancel);
    };

    confirmBtn.addEventListener('click', handleConfirm);
    cancelBtn.addEventListener('click', handleCancel);

    openModal(modal);
}