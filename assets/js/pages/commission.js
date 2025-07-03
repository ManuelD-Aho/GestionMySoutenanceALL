// /assets/js/pages/commission.js

import { dataService, functionService } from '../services/simulation-service.js';
import { displayMessage, setButtonLoading, generateUniqueId, formatDate, openModal, closeModal, fillForm, getFormData, validateForm } from '../utils/helpers.js';
import { ROLES, TABLES, REPORT_STATUS, ID_PREFIXES } from '../utils/constants.js';

let currentUser = null;
let userPermissions = [];
let currentSessionId = null;

const commissionUI = {
    reportsToVoteList: document.getElementById('reports-to-vote-list'),
    pvsToApproveList: document.getElementById('pvs-to-approve-list'),
    myPastSessionsList: document.getElementById('my-past-sessions-list'),
    viewAllReportsBtn: document.getElementById('view-all-reports-btn'),
    viewAllPvsBtn: document.getElementById('view-all-pvs-btn'),
    viewMyHistoryBtn: document.getElementById('view-my-history-btn'),
    reportToVoteTemplate: document.getElementById('report-to-vote-template'),
    pvToApproveTemplate: document.getElementById('pv-to-approve-template'),
    sessionTabs: document.querySelectorAll('.tabs-container .tab'),
    sessionTabContents: document.querySelectorAll('.tabs-container .tab-content'),
    sessionsListBody: document.getElementById('sessions-list-body'),
    createSessionForm: document.getElementById('create-session-form'),
    sessionRowTemplate: document.getElementById('session-row-template'),
    sessionDetailsModal: document.getElementById('session-details-modal'),
    sessionDetailsTitle: document.getElementById('session-details-title'),
    modalSessionId: document.getElementById('modal-session-id'),
    modalSessionName: document.getElementById('modal-session-name'),
    modalSessionPresident: document.getElementById('modal-session-president'),
    modalSessionStatus: document.getElementById('modal-session-status'),
    modalSessionMode: document.getElementById('modal-session-mode'),
    modalSessionVoters: document.getElementById('modal-session-voters'),
    modalSessionReportsList: document.getElementById('modal-session-reports-list'),
    modalSessionMembersList: document.getElementById('modal-session-members-list'),
    modalSessionReportTemplate: document.getElementById('modal-session-report-template'),
    modalEditSessionBtn: document.getElementById('modal-edit-session-btn'),
    modalStartSessionBtn: document.getElementById('modal-start-session-btn'),
    modalSuspendSessionBtn: document.getElementById('modal-suspend-session-btn'),
    modalResumeSessionBtn: document.getElementById('modal-resume-session-btn'),
    modalCloseSessionBtn: document.getElementById('modal-close-session-btn'),
    modalDeleteSessionBtn: document.getElementById('modal-delete-session-btn'),
    modalInitPvBtn: document.getElementById('modal-init-pv-btn'),
    voteModal: document.getElementById('vote-modal'),
    voteModalTitle: document.getElementById('vote-modal-title'),
    voteReportTitle: document.getElementById('vote-report-title'),
    voteStudentName: document.getElementById('vote-student-name'),
    voteForm: document.getElementById('vote-form'),
    voteReportIdHidden: document.getElementById('vote-report-id-hidden'),
    voteSessionIdHidden: document.getElementById('vote-session-id-hidden'),
    voteDecisionSelect: document.getElementById('vote-decision'),
    voteCommentInput: document.getElementById('vote-comment'),
    pvEditorModal: document.getElementById('pv-editor-modal'),
    pvEditorTitle: document.getElementById('pv-editor-title'),
    pvEditorForm: document.getElementById('pv-editor-form'),
    pvIdHidden: document.getElementById('pv-id-hidden'),
    pvLibelleInput: document.getElementById('pv-libelle'),
    pvContentEditor: document.getElementById('pv-content'),
    submitPvForApprovalBtn: document.getElementById('submit-pv-for-approval-btn'),
    feedbackContainer: document.getElementById('global-flash-messages'),
};

export async function initPage(user, permissions) {
    currentUser = user;
    userPermissions = permissions;

    const currentPath = window.location.pathname;
    if (currentPath.includes('dashboard.html')) {
        await loadCommissionDashboard();
    } else if (currentPath.includes('session.html')) {
        await loadSessionManagement();
    }
}

async function loadCommissionDashboard() {
    await loadReportsToVote();
    await loadPvsToApprove();
    await loadMyPastSessions();
    setupDashboardEventListeners();
}

async function loadReportsToVote() {
    const { data: reports } = await dataService.getRecords(TABLES.RAPPORT_ETUDIANT, {
        id_statut_rapport: REPORT_STATUS.EN_COMMISSION,
    });
    commissionUI.reportsToVoteList.innerHTML = '';
    if (reports.length === 0) {
        commissionUI.reportsToVoteList.innerHTML = '<li>Aucun rapport en attente de votre vote.</li>';
        return;
    }
    for (const report of reports) {
        const { data: student } = await dataService.getRecordById(TABLES.ETUDIANT, report.numero_carte_etudiant);
        const row = commissionUI.reportToVoteTemplate.content.cloneNode(true);
        row.querySelector('.item-title').textContent = report.libelle_rapport_etudiant;
        row.querySelector('.student-name').textContent = student ? `${student.prenom} ${student.nom}` : 'N/A';
        const voteBtn = row.querySelector('.vote-report-btn');
        voteBtn.dataset.reportId = report.id_rapport_etudiant;
        voteBtn.dataset.sessionId = 'SESS-2024-0001'; // Simulé
        commissionUI.reportsToVoteList.appendChild(row);
    }
}

async function loadPvsToApprove() {
    const { data: pvs } = await dataService.getRecords(TABLES.COMPTE_RENDU, {
        id_statut_pv: 'PV_ATTENTE_APPROBATION',
    });
    commissionUI.pvsToApproveList.innerHTML = '';
    if (pvs.length === 0) {
        commissionUI.pvsToApproveList.innerHTML = '<li>Aucun PV en attente de votre approbation.</li>';
        return;
    }
    for (const pv of pvs) {
        const { data: redacteur } = await dataService.getRecordById(TABLES.UTILISATEUR, pv.id_redacteur);
        const row = commissionUI.pvToApproveTemplate.content.cloneNode(true);
        row.querySelector('.item-title').textContent = pv.libelle_compte_rendu;
        row.querySelector('.redacteur-name').textContent = redacteur ? redacteur.login_utilisateur : 'N/A';
        row.querySelector('.approve-pv-btn').dataset.pvId = pv.id_compte_rendu;
        commissionUI.pvsToApproveList.appendChild(row);
    }
}

async function loadMyPastSessions() {
    const { data: sessions } = await dataService.getRecords(TABLES.SESSION_VALIDATION, {}, 'date_creation DESC', 5);
    commissionUI.myPastSessionsList.innerHTML = '';
    if (sessions.length === 0) {
        commissionUI.myPastSessionsList.innerHTML = '<li>Aucune activité récente.</li>';
        return;
    }
    sessions.forEach(session => {
        const li = document.createElement('li');
        li.textContent = `${session.nom_session} (${session.statut_session})`;
        commissionUI.myPastSessionsList.appendChild(li);
    });
}

function setupDashboardEventListeners() {
    commissionUI.reportsToVoteList.addEventListener('click', (e) => {
        const btn = e.target.closest('.vote-report-btn');
        if (btn) openVoteModal(btn.dataset.reportId, btn.dataset.sessionId);
    });
    commissionUI.pvsToApproveList.addEventListener('click', (e) => {
        const btn = e.target.closest('.approve-pv-btn');
        if (btn) handleApprovePv(btn.dataset.pvId);
    });
}

async function loadSessionManagement() {
    setupSessionTabs();
    await fetchAndDisplaySessions();
    setupSessionManagementEventListeners();
}

function setupSessionTabs() {
    commissionUI.sessionTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            commissionUI.sessionTabs.forEach(t => t.classList.remove('tab-active'));
            commissionUI.sessionTabContents.forEach(tc => tc.classList.remove('active'));
            tab.classList.add('tab-active');
            document.getElementById(`tab-content-${tab.dataset.tab}`).classList.add('active');
        });
    });
}

async function fetchAndDisplaySessions() {
    const { data: sessions } = await dataService.getRecords(TABLES.SESSION_VALIDATION, {}, 'date_creation DESC');
    commissionUI.sessionsListBody.innerHTML = '';
    if (sessions.length === 0) {
        commissionUI.sessionsListBody.innerHTML = '<tr><td colspan="7" class="text-center">Aucune session trouvée.</td></tr>';
        return;
    }
    for (const session of sessions) {
        const { data: president } = await dataService.getRecordById(TABLES.ENSEIGNANT, session.id_president_session);
        const row = commissionUI.sessionRowTemplate.content.cloneNode(true);
        row.querySelector('.session-name').textContent = session.nom_session;
        row.querySelector('.session-president').textContent = president ? `${president.prenom} ${president.nom}` : 'N/A';
        row.querySelector('.session-start-date').textContent = formatDate(session.date_debut_session);
        row.querySelector('.session-end-date').textContent = formatDate(session.date_fin_prevue);
        row.querySelector('.session-status').textContent = session.statut_session;
        row.querySelector('.session-mode').textContent = session.mode_session;
        row.querySelector('.view-session-btn').dataset.id = session.id_session;
        row.querySelector('.delete-session-btn').dataset.id = session.id_session;
        commissionUI.sessionsListBody.appendChild(row);
    }
}

function setupSessionManagementEventListeners() {
    commissionUI.createSessionForm.addEventListener('submit', handleCreateSessionSubmit);
    commissionUI.sessionsListBody.addEventListener('click', handleSessionActions);
    commissionUI.voteForm.addEventListener('submit', handleVoteSubmit);
}

async function handleCreateSessionSubmit(e) {
    e.preventDefault();
    setButtonLoading(e.submitter, true);
    const formData = getFormData(commissionUI.createSessionForm);
    formData.id_session = generateUniqueId('SESSION_VALIDATION');
    formData.id_president_session = currentUser.id;
    formData.statut_session = 'planifiee';
    formData.date_creation = new Date().toISOString();

    const { error } = await dataService.createRecord(TABLES.SESSION_VALIDATION, formData);
    if (error) {
        displayMessage(commissionUI.feedbackContainer, 'error', `Erreur: ${error.message}`);
    } else {
        displayMessage(commissionUI.feedbackContainer, 'success', 'Session créée.');
        commissionUI.createSessionForm.reset();
        fetchAndDisplaySessions();
    }
    setButtonLoading(e.submitter, false);
}

async function handleSessionActions(e) {
    const id = e.target.closest('button')?.dataset.id;
    if (!id) return;

    if (e.target.closest('.view-session-btn')) {
        await openSessionDetailsModal(id);
    } else if (e.target.closest('.delete-session-btn')) {
        confirmAction('Supprimer Session', `Supprimer la session ${id} ?`, async () => {
            await dataService.deleteRecord(TABLES.SESSION_VALIDATION, id);
            displayMessage(commissionUI.feedbackContainer, 'success', 'Session supprimée.');
            fetchAndDisplaySessions();
        });
    }
}

async function openSessionDetailsModal(sessionId) {
    currentSessionId = sessionId;
    const { data: session } = await dataService.getRecordById(TABLES.SESSION_VALIDATION, sessionId);
    const { data: president } = await dataService.getRecordById(TABLES.ENSEIGNANT, session.id_president_session);

    commissionUI.sessionDetailsTitle.textContent = `Détails: ${session.nom_session}`;
    commissionUI.modalSessionId.textContent = session.id_session;
    commissionUI.modalSessionName.textContent = session.nom_session;
    commissionUI.modalSessionPresident.textContent = president ? `${president.prenom} ${president.nom}` : 'N/A';
    commissionUI.modalSessionStatus.textContent = session.statut_session;
    commissionUI.modalSessionMode.textContent = session.mode_session;
    commissionUI.modalSessionVoters.textContent = session.nombre_votants_requis;

    openModal(commissionUI.sessionDetailsModal);
}

async function openVoteModal(reportId, sessionId) {
    const { data: report } = await dataService.getRecordById(TABLES.RAPPORT_ETUDIANT, reportId);
    const { data: student } = await dataService.getRecordById(TABLES.ETUDIANT, report.numero_carte_etudiant);
    const { data: decisions } = await dataService.getRecords(TABLES.DECISION_VOTE_REF);

    commissionUI.voteReportIdHidden.value = reportId;
    commissionUI.voteSessionIdHidden.value = sessionId;
    commissionUI.voteReportTitle.textContent = report.libelle_rapport_etudiant;
    commissionUI.voteStudentName.textContent = student ? `${student.prenom} ${student.nom}` : 'N/A';
    commissionUI.voteDecisionSelect.innerHTML = '<option value="">-- Choisir --</option>' + decisions.map(d => `<option value="${d.id_decision_vote}">${d.libelle_decision_vote}</option>`).join('');

    openModal(commissionUI.voteModal);
}

async function handleVoteSubmit(e) {
    e.preventDefault();
    setButtonLoading(e.submitter, true);
    const formData = getFormData(commissionUI.voteForm);

    const { success, message } = await functionService.submitVote(
        formData.id_rapport_etudiant,
        formData.id_session,
        currentUser.id,
        formData.id_decision_vote,
        formData.commentaire_vote
    );

    if (!success) {
        displayMessage(commissionUI.voteModal.querySelector('.modal-box'), 'error', `Erreur: ${message}`);
    } else {
        displayMessage(commissionUI.feedbackContainer, 'success', 'Vote enregistré.');
        closeModal(commissionUI.voteModal);
        loadReportsToVote();
    }
    setButtonLoading(e.submitter, false);
}

async function handleApprovePv(pvId) {
    confirmAction('Approuver PV', `Approuver le PV ${pvId} ?`, async () => {
        const { success, message } = await functionService.approvePv(pvId, currentUser.id);
        if (!success) {
            displayMessage(commissionUI.feedbackContainer, 'error', `Erreur: ${message}`);
        } else {
            displayMessage(commissionUI.feedbackContainer, 'success', 'PV approuvé.');
            loadPvsToApprove();
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