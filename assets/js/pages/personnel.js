// /assets/js/pages/personnel.js

import { dataService, functionService } from '../services/simulation-service.js';
import { displayMessage, setButtonLoading, generateUniqueId, formatDate, openModal, closeModal, fillForm, getFormData, validateForm } from '../utils/helpers.js';
import { ROLES, TABLES, REPORT_STATUS } from '../utils/constants.js';

let currentUser = null;
let userPermissions = [];

const personnelUI = {
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
    tabs: document.querySelectorAll('.tabs-container .tab'),
    tabContents: document.querySelectorAll('.tabs-container .tab-content'),
    studentsListBody: document.getElementById('students-list-body'),
    searchStudentsInput: document.getElementById('search-students'),
    filterStudentLevel: document.getElementById('filter-student-level'),
    filterStudentPayment: document.getElementById('filter-student-payment'),
    exportStudentsPdfBtn: document.getElementById('export-students-pdf-btn'),
    exportStudentsCsvBtn: document.getElementById('export-students-csv-btn'),
    studentRowTemplate: document.getElementById('student-row-template'),
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
    conformityQueueBody: document.getElementById('conformity-queue-body'),
    activateStudentAccountModal: document.getElementById('activate-student-account-modal'),
    activateStudentName: document.getElementById('activate-student-name'),
    activateStudentAccountForm: document.getElementById('activate-student-account-form'),
    activateStudentIdHidden: document.getElementById('activate-student-id-hidden'),
    reclamationResponseModal: document.getElementById('reclamation-response-modal'),
    reclamationSubjectDisplay: document.getElementById('reclamation-subject-display'),
    reclamationStudentDisplay: document.getElementById('reclamation-student-display'),
    reclamationDescriptionDisplay: document.getElementById('reclamation-description-display'),
    reclamationResponseForm: document.getElementById('reclamation-response-form'),
    reclamationIdHidden: document.getElementById('reclamation-id-hidden'),
    reclamationResponseText: document.getElementById('reclamation-response-text'),
    feedbackContainer: document.getElementById('global-flash-messages'),
};

export async function initPage(user, permissions) {
    currentUser = user;
    userPermissions = permissions;

    const currentPath = window.location.pathname;
    if (currentPath.includes('dashboard.html')) {
        await loadPersonnelDashboard();
    } else if (currentPath.includes('gestion-dossiers.html')) {
        await loadGestionDossiersPage();
    }
}

async function loadPersonnelDashboard() {
    const isRS = currentUser.profile.id_groupe_utilisateur === ROLES.RS;
    const isAgentConformite = currentUser.profile.id_groupe_utilisateur === ROLES.AGENT_CONFORMITE;

    personnelUI.conformityReportsCard.classList.toggle('hidden', !isAgentConformite);
    personnelUI.studentsToActivateCard.classList.toggle('hidden', !isRS);
    personnelUI.openReclamationsCard.classList.toggle('hidden', !isRS);
    personnelUI.stagesToValidateCard.classList.toggle('hidden', !isRS);

    if (isAgentConformite) await loadPendingConformityReports();
    if (isRS) {
        await loadStudentsToActivate();
        await loadOpenReclamations();
        await loadStagesToValidate();
    }
    setupPersonnelDashboardEventListeners();
}

async function loadPendingConformityReports() {
    const { data: reports } = await dataService.getRecords(TABLES.RAPPORT_ETUDIANT, { id_statut_rapport: REPORT_STATUS.SOUMIS });
    personnelUI.statPendingConformityReports.textContent = reports.length;
    personnelUI.pendingConformityReportsList.innerHTML = '';
    if (reports.length === 0) {
        personnelUI.pendingConformityReportsList.innerHTML = '<li>Aucun rapport à vérifier.</li>';
        return;
    }
    for (const report of reports) {
        const { data: student } = await dataService.getRecordById(TABLES.ETUDIANT, report.numero_carte_etudiant);
        const row = personnelUI.pendingConformityReportTemplate.content.cloneNode(true);
        row.querySelector('.item-title').textContent = report.libelle_rapport_etudiant;
        row.querySelector('.student-name').textContent = student ? `${student.prenom} ${student.nom}` : 'N/A';
        row.querySelector('.view-conformity-btn').dataset.reportId = report.id_rapport_etudiant;
        personnelUI.pendingConformityReportsList.appendChild(row);
    }
}

async function loadStudentsToActivate() {
    const { data: students } = await dataService.getRecords(TABLES.ETUDIANT, { numero_utilisateur: null });
    personnelUI.statStudentsToActivate.textContent = students.length;
    personnelUI.studentsToActivateList.innerHTML = '';
    if (students.length === 0) {
        personnelUI.studentsToActivateList.innerHTML = '<li>Aucun étudiant à activer.</li>';
        return;
    }
    for (const student of students) {
        const row = personnelUI.studentToActivateTemplate.content.cloneNode(true);
        row.querySelector('.item-title').textContent = `${student.prenom} ${student.nom}`;
        row.querySelector('.student-email').textContent = student.email_contact_secondaire || 'N/A';
        row.querySelector('.activate-student-btn').dataset.studentId = student.numero_carte_etudiant;
        personnelUI.studentsToActivateList.appendChild(row);
    }
}

async function loadOpenReclamations() {
    const { data: reclamations } = await dataService.getRecords(TABLES.RECLAMATION, { id_statut_reclamation: 'RECLA_OUVERTE' });
    personnelUI.statOpenReclamations.textContent = reclamations.length;
    personnelUI.openReclamationsList.innerHTML = '';
    if (reclamations.length === 0) {
        personnelUI.openReclamationsList.innerHTML = '<li>Aucune réclamation ouverte.</li>';
        return;
    }
    for (const rec of reclamations) {
        const { data: student } = await dataService.getRecordById(TABLES.ETUDIANT, rec.numero_carte_etudiant);
        const row = personnelUI.openReclamationTemplate.content.cloneNode(true);
        row.querySelector('.item-title').textContent = rec.sujet_reclamation;
        row.querySelector('.student-name').textContent = student ? `${student.prenom} ${student.nom}` : 'N/A';
        row.querySelector('.view-reclamation-btn').dataset.reclamationId = rec.id_reclamation;
        personnelUI.openReclamationsList.appendChild(row);
    }
}

async function loadStagesToValidate() {
    const { data: stages } = await dataService.getRecords(TABLES.FAIRE_STAGE, { est_valide: false });
    personnelUI.statStagesToValidate.textContent = stages.length;
    personnelUI.stagesToValidateList.innerHTML = '';
    if (stages.length === 0) {
        personnelUI.stagesToValidateList.innerHTML = '<li>Aucun stage à valider.</li>';
        return;
    }
    for (const stage of stages) {
        const { data: student } = await dataService.getRecordById(TABLES.ETUDIANT, stage.numero_carte_etudiant);
        const row = personnelUI.stageToValidateTemplate.content.cloneNode(true);
        row.querySelector('.item-title').textContent = stage.sujet_stage;
        row.querySelector('.student-name').textContent = student ? `${student.prenom} ${student.nom}` : 'N/A';
        row.querySelector('.validate-stage-btn').dataset.stageId = stage.id_entreprise;
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

async function loadGestionDossiersPage() {
    setupTabs();
    await fetchAndDisplayStudents();
    setupGestionDossiersEventListeners();
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

async function fetchAndDisplayStudents(filters = {}) {
    const { users } = await functionService.getUsersWithProfiles({ ...filters, id_type_utilisateur: 'TYPE_ETUD' });
    personnelUI.studentsListBody.innerHTML = '';
    if (users.length === 0) {
        personnelUI.studentsListBody.innerHTML = '<tr><td colspan="7" class="text-center">Aucun étudiant trouvé.</td></tr>';
        return;
    }
    for (const student of users) {
        const row = personnelUI.studentRowTemplate.content.cloneNode(true);
        row.querySelector('.student-matricule').textContent = student.profile.numero_carte_etudiant;
        row.querySelector('.student-full-name').textContent = `${student.profile.prenom} ${student.profile.nom}`;
        row.querySelector('.student-email').textContent = student.email_principal;
        row.querySelector('.student-level').textContent = student.profile.inscription?.id_niveau_etude || 'N/A';
        row.querySelector('.student-payment-status').textContent = student.profile.inscription?.id_statut_paiement || 'N/A';
        row.querySelector('.student-account-status').textContent = student.statut_compte;
        row.querySelector('.view-student-details-btn').dataset.studentId = student.numero_utilisateur;
        personnelUI.studentsListBody.appendChild(row);
    }
}

function setupGestionDossiersEventListeners() {
    personnelUI.searchStudentsInput.addEventListener('input', () => applyStudentFilters());
    personnelUI.studentsListBody.addEventListener('click', handleStudentListActions);
    personnelUI.conformityChecklistForm.addEventListener('submit', handleConformityCheckSubmit);
    personnelUI.activateStudentAccountForm.addEventListener('submit', handleActivateStudentAccountSubmit);
    personnelUI.reclamationResponseForm.addEventListener('submit', handleReclamationResponseSubmit);
}

function applyStudentFilters() {
    const filters = { search: personnelUI.searchStudentsInput.value };
    fetchAndDisplayStudents(filters);
}

async function handleStudentListActions(e) {
    const studentId = e.target.closest('button')?.dataset.studentId;
    if (!studentId) return;
    if (e.target.closest('.view-student-details-btn')) {
        await openStudentDetailsModal(studentId);
    }
}

async function openStudentDetailsModal(studentId) {
    const { users } = await functionService.getUsersWithProfiles({ numero_utilisateur: studentId });
    const student = users[0];
    personnelUI.studentDetailsName.textContent = `${student.profile.prenom} ${student.profile.nom}`;
    personnelUI.detailMatricule.textContent = student.profile.numero_carte_etudiant;
    personnelUI.detailEmail.textContent = student.email_principal;
    personnelUI.detailDob.textContent = formatDate(student.profile.date_naissance);
    openModal(personnelUI.studentDetailsModal);
}

async function openConformityCheckModal(reportId) {
    const { data: report } = await dataService.getRecordById(TABLES.RAPPORT_ETUDIANT, reportId);
    const { data: student } = await dataService.getRecordById(TABLES.ETUDIANT, report.numero_carte_etudiant);
    const { data: checklistItems } = await dataService.getRecords(TABLES.CRITERE_CONFORMITE_REF, { est_actif: true });

    personnelUI.conformityReportTitle.textContent = report.libelle_rapport_etudiant;
    personnelUI.conformityStudentName.textContent = student ? `${student.prenom} ${student.nom}` : 'N/A';
    personnelUI.conformityCurrentStatus.textContent = report.id_statut_rapport;
    personnelUI.conformityReportIdHidden.value = reportId;
    personnelUI.conformityReportContent.innerHTML = report.resume;
    personnelUI.checklistItemsContainer.innerHTML = '';
    checklistItems.forEach(item => {
        const row = personnelUI.conformityChecklistItemTemplate.content.cloneNode(true);
        row.querySelector('.checklist-label').textContent = item.libelle_critere;
        row.querySelector('.checklist-checkbox').id = `checklist-${item.id_critere}`;
        row.querySelector('.checklist-checkbox').name = `checklist[${item.id_critere}][status]`;
        row.querySelector('.checklist-comment').name = `checklist[${item.id_critere}][comment]`;
        personnelUI.checklistItemsContainer.appendChild(row);
    });
    openModal(personnelUI.conformityCheckModal);
}

async function handleConformityCheckSubmit(e) {
    e.preventDefault();
    setButtonLoading(e.submitter, true);
    const reportId = personnelUI.conformityReportIdHidden.value;
    const decision = e.submitter.value === 'conforme';
    const { success, message } = await functionService.processConformityCheck(reportId, currentUser.id, decision, [], '');
    if (success) {
        displayMessage(personnelUI.feedbackContainer, 'success', 'Vérification enregistrée.');
        closeModal(personnelUI.conformityCheckModal);
        loadPendingConformityReports();
    } else {
        displayMessage(personnelUI.feedbackContainer, 'error', `Erreur: ${message}`);
    }
    setButtonLoading(e.submitter, false);
}

async function openActivateStudentAccountModal(studentId) {
    const { data: student } = await dataService.getRecordById(TABLES.ETUDIANT, studentId);
    personnelUI.activateStudentName.textContent = `${student.prenom} ${student.nom}`;
    personnelUI.activateStudentIdHidden.value = studentId;
    openModal(personnelUI.activateStudentAccountModal);
}

async function handleActivateStudentAccountSubmit(e) {
    e.preventDefault();
    setButtonLoading(e.submitter, true);
    const formData = getFormData(personnelUI.activateStudentAccountForm);
    const { success, message } = await functionService.activateStudentAccount(formData.numero_etudiant, formData.login_utilisateur, formData.email_principal, formData.mot_de_passe);
    if (success) {
        displayMessage(personnelUI.feedbackContainer, 'success', 'Compte activé.');
        closeModal(personnelUI.activateStudentAccountModal);
        loadStudentsToActivate();
    } else {
        displayMessage(personnelUI.feedbackContainer, 'error', `Erreur: ${message}`);
    }
    setButtonLoading(e.submitter, false);
}

async function openReclamationResponseModal(reclamationId) {
    const { data: reclamation } = await dataService.getRecordById(TABLES.RECLAMATION, reclamationId);
    const { data: student } = await dataService.getRecordById(TABLES.ETUDIANT, reclamation.numero_carte_etudiant);
    personnelUI.reclamationSubjectDisplay.textContent = reclamation.sujet_reclamation;
    personnelUI.reclamationStudentDisplay.textContent = student ? `${student.prenom} ${student.nom}` : 'N/A';
    personnelUI.reclamationDescriptionDisplay.textContent = reclamation.description_reclamation;
    personnelUI.reclamationIdHidden.value = reclamationId;
    openModal(personnelUI.reclamationResponseModal);
}

async function handleReclamationResponseSubmit(e) {
    e.preventDefault();
    setButtonLoading(e.submitter, true);
    const reclamationId = personnelUI.reclamationIdHidden.value;
    const responseText = personnelUI.reclamationResponseText.value;
    const action = e.submitter.value;
    const { success, message } = action === 'respond'
        ? await functionService.respondToReclamation(reclamationId, responseText, currentUser.id)
        : await functionService.closeReclamation(reclamationId, responseText, currentUser.id);
    if (success) {
        displayMessage(personnelUI.feedbackContainer, 'success', 'Réclamation traitée.');
        closeModal(personnelUI.reclamationResponseModal);
        loadOpenReclamations();
    } else {
        displayMessage(personnelUI.feedbackContainer, 'error', `Erreur: ${message}`);
    }
    setButtonLoading(e.submitter, false);
}

async function handleValidateStage(studentId, stageId) {
    confirmAction('Valider Stage', `Valider le stage de l'étudiant ${studentId} ?`, async () => {
        const { success, message } = await functionService.validateStage(studentId, stageId, currentUser.id);
        if (success) {
            displayMessage(personnelUI.feedbackContainer, 'success', 'Stage validé.');
            loadStagesToValidate();
        } else {
            displayMessage(personnelUI.feedbackContainer, 'error', `Erreur: ${message}`);
        }
    });
}

function confirmAction(title, message, onConfirm) {
    const modal = document.createElement('dialog');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-box">
            <h3 class="font-bold text-lg">${title}</h3>
            <p class="py-4">${message}</p>
            <div class="modal-action">
                <button class="btn" id="confirm-cancel">Annuler</button>
                <button class="btn btn-primary" id="confirm-ok">Confirmer</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    openModal(modal);

    modal.querySelector('#confirm-ok').addEventListener('click', () => {
        onConfirm();
        closeModal(modal);
        modal.remove();
    });
    modal.querySelector('#confirm-cancel').addEventListener('click', () => {
        closeModal(modal);
        modal.remove();
    });
}