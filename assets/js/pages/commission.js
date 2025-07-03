// /assets/js/pages/commission.js (Suite)

import { dataService } from '../services/data-service.js';
import { functionService } from '../services/function-service.js';
import { displayMessage, setButtonLoading, generateUniqueId, formatDate, openModal, closeModal, fillForm, getFormData, validateForm } from '../utils/helpers.js';
import { ROLES, TABLES, REPORT_STATUS, ID_PREFIXES, DOCUMENT_TYPES } from '../utils/constants.js';

let currentUser = null;
let userPermissions = [];
let currentSessionId = null; // Pour la gestion de la session en cours

// --- ÉLÉMENTS DU DOM SPÉCIFIQUES À LA COMMISSION ---
const commissionUI = {
    // Dashboard
    reportsToVoteList: document.getElementById('reports-to-vote-list'),
    pvsToApproveList: document.getElementById('pvs-to-approve-list'),
    myPastSessionsList: document.getElementById('my-past-sessions-list'),
    viewAllReportsBtn: document.getElementById('view-all-reports-btn'),
    viewAllPvsBtn: document.getElementById('view-all-pvs-btn'),
    viewMyHistoryBtn: document.getElementById('view-my-history-btn'),
    reportToVoteTemplate: document.getElementById('report-to-vote-template'),
    pvToApproveTemplate: document.getElementById('pv-to-approve-template'),

    // Sessions
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

    // Vote Modal
    voteModal: document.getElementById('vote-modal'),
    voteModalTitle: document.getElementById('vote-modal-title'),
    voteReportTitle: document.getElementById('vote-report-title'),
    voteStudentName: document.getElementById('vote-student-name'),
    voteForm: document.getElementById('vote-form'),
    voteReportIdHidden: document.getElementById('vote-report-id-hidden'),
    voteSessionIdHidden: document.getElementById('vote-session-id-hidden'),
    voteDecisionSelect: document.getElementById('vote-decision'),
    voteCommentInput: document.getElementById('vote-comment'),

    // PV Editor Modal
    pvEditorModal: document.getElementById('pv-editor-modal'),
    pvEditorTitle: document.getElementById('pv-editor-title'),
    pvEditorForm: document.getElementById('pv-editor-form'),
    pvIdHidden: document.getElementById('pv-id-hidden'),
    pvLibelleInput: document.getElementById('pv-libelle'),
    pvContentEditor: document.getElementById('pv-content'),
    submitPvForApprovalBtn: document.getElementById('submit-pv-for-approval-btn'),
};

// --- INITIALISATION DE LA PAGE COMMISSION ---
export async function initPage(user, permissions) {
    currentUser = user;
    userPermissions = permissions;

    if (!hasPermission('TRAIT_COMMISSION_DASHBOARD_ACCEDER')) {
        displayMessage(document.getElementById('global-flash-messages'), 'error', 'Accès refusé à ce module.');
        window.location.href = '/pages/etudiant/dashboard.html'; // Rediriger vers un dashboard par défaut
        return;
    }

    const currentPath = window.location.pathname;
    if (currentPath.includes('dashboard.html')) {
        await loadCommissionDashboard();
    } else if (currentPath.includes('session.html')) {
        await loadSessionManagement();
    }
}

function hasPermission(permissionCode) {
    return userPermissions.includes(permissionCode);
}

// --- DASHBOARD COMMISSION ---
async function loadCommissionDashboard() {
    await loadReportsToVote();
    await loadPvsToApprove();
    await loadMyPastSessions();
    setupDashboardEventListeners();
}

async function loadReportsToVote() {
    // Récupérer les rapports en attente de vote pour l'utilisateur connecté
    // Ceci devrait être une fonction Edge pour filtrer par affectation et statut
    const { data: reports, error } = await dataService.getRecords(TABLES.RAPPORT_ETUDIANT, {
        id_statut_rapport: REPORT_STATUS.EN_COMMISSION,
        // Simuler l'affectation à l'utilisateur pour le test
        // En vrai, on aurait une jointure avec la table 'affecter'
    });

    if (error) {
        console.error("Error loading reports to vote:", error);
        return;
    }

    commissionUI.reportsToVoteList.innerHTML = '';
    if (reports.length === 0) {
        commissionUI.reportsToVoteList.innerHTML = '<li>Aucun rapport en attente de votre vote.</li>';
        return;
    }

    for (const report of reports) {
        const row = commissionUI.reportToVoteTemplate.content.cloneNode(true);
        const student = await dataService.getRecordById(TABLES.ETUDIANT, report.numero_carte_etudiant); // Récupérer le nom de l'étudiant
        row.querySelector('.item-title').textContent = report.libelle_rapport_etudiant;
        row.querySelector('.student-name').textContent = student ? `${student.prenom} ${student.nom}` : 'N/A';
        const voteBtn = row.querySelector('.vote-report-btn');
        voteBtn.dataset.reportId = report.id_rapport_etudiant;
        // Simuler l'ID de session (en vrai, le rapport serait lié à une session)
        voteBtn.dataset.sessionId = 'SESS-2024-0001'; // Exemple
        commissionUI.reportsToVoteList.appendChild(row);
    }
}

async function loadPvsToApprove() {
    // Récupérer les PVs en attente d'approbation pour l'utilisateur connecté
    // Ceci devrait être une fonction Edge pour filtrer par statut et membres de la session
    const { data: pvs, error } = await dataService.getRecords(TABLES.COMPTE_RENDU, {
        id_statut_pv: 'PV_ATTENTE_APPROBATION',
        // Exclure le rédacteur lui-même si la règle l'impose
        // id_redacteur: { operator: 'neq', value: currentUser.id }
    });

    if (error) {
        console.error("Error loading PVs to approve:", error);
        return;
    }

    commissionUI.pvsToApproveList.innerHTML = '';
    if (pvs.length === 0) {
        commissionUI.pvsToApproveList.innerHTML = '<li>Aucun PV en attente de votre approbation.</li>';
        return;
    }

    for (const pv of pvs) {
        const row = commissionUI.pvToApproveTemplate.content.cloneNode(true);
        const redacteur = await dataService.getRecordById(TABLES.UTILISATEUR, pv.id_redacteur);
        row.querySelector('.item-title').textContent = pv.libelle_compte_rendu;
        row.querySelector('.redacteur-name').textContent = redacteur ? redacteur.login_utilisateur : 'N/A';
        const approveBtn = row.querySelector('.approve-pv-btn');
        approveBtn.dataset.pvId = pv.id_compte_rendu;
        commissionUI.pvsToApproveList.appendChild(row);
    }
}

async function loadMyPastSessions() {
    // Récupérer les sessions où l'utilisateur a participé ou voté
    // Ceci devrait être une fonction Edge pour des requêtes complexes
    const { data: sessions, error } = await dataService.getRecords(TABLES.SESSION_VALIDATION, {
        // Simuler la participation
        // id_president_session: currentUser.id
    }, 'date_creation DESC', 5);

    if (error) {
        console.error("Error loading past sessions:", error);
        return;
    }

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

// --- GESTION DES SESSIONS ---
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
    const { data: sessions, error } = await dataService.getRecords(TABLES.SESSION_VALIDATION, {}, 'date_creation DESC');
    if (error) {
        displayMessage(document.getElementById('global-flash-messages'), 'error', 'Erreur de chargement des sessions.');
        return;
    }

    commissionUI.sessionsListBody.innerHTML = '';
    if (sessions.length === 0) {
        commissionUI.sessionsListBody.innerHTML = '<tr><td colspan="7" class="text-center">Aucune session trouvée.</td></tr>';
        return;
    }

    for (const session of sessions) {
        const row = commissionUI.sessionRowTemplate.content.cloneNode(true);
        const president = await dataService.getRecordById(TABLES.ENSEIGNANT, session.id_president_session); // Récupérer le nom du président
        row.querySelector('.session-name').textContent = session.nom_session;
        row.querySelector('.session-president').textContent = president ? `${president.prenom} ${president.nom}` : 'N/A';
        row.querySelector('.session-start-date').textContent = formatDate(session.date_debut_session);
        row.querySelector('.session-end-date').textContent = formatDate(session.date_fin_prevue);
        row.querySelector('.session-status').textContent = session.statut_session;
        row.querySelector('.session-mode').textContent = session.mode_session;

        const actionsCell = row.querySelector('.session-actions');
        actionsCell.querySelectorAll('button').forEach(btn => btn.dataset.id = session.id_session);

        // Gérer la visibilité/état des boutons selon le statut de la session et les permissions
        if (!hasPermission('TRAIT_COMMISSION_SESSION_GERER')) {
            actionsCell.querySelectorAll('button').forEach(btn => btn.disabled = true);
        } else {
            // Cacher/afficher les boutons selon le statut de la session
            actionsCell.querySelector('.start-session-btn').classList.toggle('hidden', session.statut_session !== 'planifiee');
            actionsCell.querySelector('.suspend-session-btn').classList.toggle('hidden', session.statut_session !== 'en_cours');
            actionsCell.querySelector('.resume-session-btn').classList.toggle('hidden', session.statut_session !== 'suspendue');
            actionsCell.querySelector('.close-session-btn').classList.toggle('hidden', session.statut_session !== 'en_cours' && session.statut_session !== 'suspendue');
            actionsCell.querySelector('.compose-session-btn').classList.toggle('hidden', session.statut_session !== 'planifiee');
            actionsCell.querySelector('.delete-session-btn').classList.toggle('hidden', session.statut_session !== 'planifiee'); // Peut-être aussi pour 'cloturee' si on veut archiver
            actionsCell.querySelector('.view-session-btn').classList.remove('hidden'); // Toujours visible
        }
        commissionUI.sessionsListBody.appendChild(row);
    }
}

function setupSessionManagementEventListeners() {
    commissionUI.createSessionForm.addEventListener('submit', handleCreateSessionSubmit);
    commissionUI.sessionsListBody.addEventListener('click', handleSessionActions);
    commissionUI.modalEditSessionBtn.addEventListener('click', () => displayMessage(document.getElementById('global-flash-messages'), 'info', 'Fonctionnalité "Modifier Session" à implémenter.'));
    commissionUI.modalStartSessionBtn.addEventListener('click', () => handleSessionStatusChange(currentSessionId, 'en_cours', 'Démarrer Session'));
    commissionUI.modalSuspendSessionBtn.addEventListener('click', () => handleSessionStatusChange(currentSessionId, 'suspendue', 'Suspendre Session'));
    commissionUI.modalResumeSessionBtn.addEventListener('click', () => handleSessionStatusChange(currentSessionId, 'en_cours', 'Reprendre Session'));
    commissionUI.modalCloseSessionBtn.addEventListener('click', () => handleSessionStatusChange(currentSessionId, 'cloturee', 'Clôturer Session'));
    commissionUI.modalDeleteSessionBtn.addEventListener('click', () => handleSessionStatusChange(currentSessionId, 'delete', 'Supprimer Session'));
    commissionUI.modalInitPvBtn.addEventListener('click', () => handleInitPv(currentSessionId));
    commissionUI.voteForm.addEventListener('submit', handleVoteSubmit);
    commissionUI.pvEditorForm.addEventListener('submit', handlePvEditorSubmit);
    commissionUI.submitPvForApprovalBtn.addEventListener('click', handleSubmitPvForApproval);

    // Initialiser TinyMCE pour le PV Editor
    tinymce.init({
        selector: '#pv-content',
        plugins: 'advlist autolink lists link image charmap print preview anchor',
        toolbar_mode: 'floating',
        height: 400,
        setup: function(editor) {
            editor.on('init', () => {
                // Initial content if any
            });
        }
    });
}

async function handleCreateSessionSubmit(e) {
    e.preventDefault();
    if (!validateForm(commissionUI.createSessionForm)) {
        displayMessage(document.getElementById('global-flash-messages'), 'error', 'Veuillez remplir tous les champs requis.');
        return;
    }
    setButtonLoading(e.submitter, true);
    const formData = getFormData(commissionUI.createSessionForm);
    formData.id_session = generateUniqueId(ID_PREFIXES.SESSION_VALIDATION);
    formData.id_president_session = currentUser.id; // Le président est l'utilisateur connecté

    const { error } = await dataService.createRecord(TABLES.SESSION_VALIDATION, formData);
    if (error) {
        displayMessage(document.getElementById('global-flash-messages'), 'error', `Erreur: ${error.message}`);
    } else {
        displayMessage(document.getElementById('global-flash-messages'), 'success', 'Session créée avec succès.');
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
    } else if (e.target.closest('.compose-session-btn')) {
        displayMessage(document.getElementById('global-flash-messages'), 'info', `Composer la session ${id} (à implémenter).`);
    } else if (e.target.closest('.start-session-btn')) {
        handleSessionStatusChange(id, 'en_cours', 'Démarrer Session');
    } else if (e.target.closest('.suspend-session-btn')) {
        handleSessionStatusChange(id, 'suspendue', 'Suspendre Session');
    } else if (e.target.closest('.resume-session-btn')) {
        handleSessionStatusChange(id, 'en_cours', 'Reprendre Session');
    } else if (e.target.closest('.close-session-btn')) {
        handleSessionStatusChange(id, 'cloturee', 'Clôturer Session');
    } else if (e.target.closest('.delete-session-btn')) {
        handleSessionStatusChange(id, 'delete', 'Supprimer Session');
    }
}

async function handleSessionStatusChange(sessionId, newStatus, actionLabel) {
    confirmAction(actionLabel, `Voulez-vous ${actionLabel.toLowerCase()} la session ${sessionId} ?`, async () => {
        let error;
        if (newStatus === 'delete') {
            ({ error } = await dataService.deleteRecord(TABLES.SESSION_VALIDATION, sessionId));
        } else {
            ({ error } = await dataService.updateRecord(TABLES.SESSION_VALIDATION, sessionId, { statut_session: newStatus }));
        }

        if (error) {
            displayMessage(document.getElementById('global-flash-messages'), 'error', `Erreur: ${error.message}`);
        } else {
            displayMessage(document.getElementById('global-flash-messages'), 'success', `Session ${sessionId} ${newStatus === 'delete' ? 'supprimée' : 'mise à jour'}.`);
            fetchAndDisplaySessions();
            closeModal(commissionUI.sessionDetailsModal); // Fermer la modale si ouverte
        }
    });
}

async function openSessionDetailsModal(sessionId) {
    currentSessionId = sessionId;
    const { data: session, error } = await dataService.getRecordById(TABLES.SESSION_VALIDATION, sessionId);
    if (error || !session) {
        displayMessage(document.getElementById('global-flash-messages'), 'error', 'Session non trouvée.');
        return;
    }

    const president = await dataService.getRecordById(TABLES.ENSEIGNANT, session.id_president_session);
    const presidentName = president ? `${president.prenom} ${president.nom}` : 'N/A';

    commissionUI.sessionDetailsTitle.textContent = `Détails de la Session: ${session.nom_session}`;
    commissionUI.modalSessionId.textContent = session.id_session;
    commissionUI.modalSessionName.textContent = session.nom_session;
    commissionUI.modalSessionPresident.textContent = presidentName;
    commissionUI.modalSessionStatus.textContent = session.statut_session;
    commissionUI.modalSessionMode.textContent = session.mode_session;
    commissionUI.modalSessionVoters.textContent = session.nombre_votants_requis;

    // Charger les rapports assignés à cette session
    const { data: sessionReports, error: reportsError } = await dataService.getRecords(TABLES.SESSION_RAPPORT, { id_session: sessionId });
    commissionUI.modalSessionReportsList.innerHTML = '';
    if (!reportsError && sessionReports.length > 0) {
        for (const sr of sessionReports) {
            const report = await dataService.getRecordById(TABLES.RAPPORT_ETUDIANT, sr.id_rapport_etudiant);
            const student = report ? await dataService.getRecordById(TABLES.ETUDIANT, report.numero_carte_etudiant) : null;
            const row = commissionUI.modalSessionReportTemplate.content.cloneNode(true);
            row.querySelector('.report-title').textContent = report ? report.libelle_rapport_etudiant : 'Rapport Inconnu';
            row.querySelector('.student-name').textContent = student ? `${student.prenom} ${student.nom}` : 'N/A';
            row.querySelector('.report-status').textContent = report ? report.id_statut_rapport : 'N/A';
            // Set data-ids for action buttons
            row.querySelector('.view-report-details-btn').dataset.reportId = sr.id_rapport_etudiant;
            row.querySelector('.assign-rapporteur-btn').dataset.reportId = sr.id_rapport_etudiant;
            row.querySelector('.remove-report-btn').dataset.reportId = sr.id_rapport_etudiant;
            commissionUI.modalSessionReportsList.appendChild(row);
        }
    } else {
        commissionUI.modalSessionReportsList.innerHTML = '<tr><td colspan="4" class="text-center">Aucun rapport assigné.</td></tr>';
    }

    // Charger les membres de la commission (simulé, devrait être une jointure complexe)
    const { data: members, error: membersError } = await dataService.getRecords(TABLES.ENSEIGNANT, {
        // Simuler les membres de la commission
        id_groupe_utilisateur: ROLES.COMMISSION // Ceci n'est pas dans la table ENSEIGNANT, mais dans UTILISATEUR
    });
    commissionUI.modalSessionMembersList.innerHTML = '';
    if (!membersError && members.length > 0) {
        members.forEach(member => {
            const li = document.createElement('li');
            li.textContent = `${member.prenom} ${member.nom}`;
            commissionUI.modalSessionMembersList.appendChild(li);
        });
    } else {
        commissionUI.modalSessionMembersList.innerHTML = '<li>Aucun membre trouvé.</li>';
    }

    // Mettre à jour la visibilité des boutons d'action de la modale
    const isPresident = session.id_president_session === currentUser.id;
    const isEditableSession = session.statut_session === 'planifiee';
    const isActiveSession = session.statut_session === 'en_cours' || session.statut_session === 'suspendue';

    commissionUI.modalEditSessionBtn.classList.toggle('hidden', !isPresident || !isEditableSession);
    commissionUI.modalStartSessionBtn.classList.toggle('hidden', !isPresident || session.statut_session !== 'planifiee');
    commissionUI.modalSuspendSessionBtn.classList.toggle('hidden', !isPresident || session.statut_session !== 'en_cours');
    commissionUI.modalResumeSessionBtn.classList.toggle('hidden', !isPresident || session.statut_session !== 'suspendue');
    commissionUI.modalCloseSessionBtn.classList.toggle('hidden', !isPresident || (session.statut_session !== 'en_cours' && session.statut_session !== 'suspendue'));
    commissionUI.modalDeleteSessionBtn.classList.toggle('hidden', !isPresident || session.statut_session !== 'planifiee');
    commissionUI.modalInitPvBtn.classList.toggle('hidden', !isPresident || session.statut_session !== 'cloturee'); // PV initié après clôture

    openModal(commissionUI.sessionDetailsModal);
}

// --- GESTION DU VOTE ---
async function openVoteModal(reportId, sessionId) {
    const { data: report, error: reportError } = await dataService.getRecordById(TABLES.RAPPORT_ETUDIANT, reportId);
    if (reportError || !report) {
        displayMessage(document.getElementById('global-flash-messages'), 'error', 'Rapport non trouvé.');
        return;
    }
    const student = await dataService.getRecordById(TABLES.ETUDIANT, report.numero_carte_etudiant);

    commissionUI.voteReportIdHidden.value = reportId;
    commissionUI.voteSessionIdHidden.value = sessionId;
    commissionUI.voteReportTitle.textContent = report.libelle_rapport_etudiant;
    commissionUI.voteStudentName.textContent = student ? `${student.prenom} ${student.nom}` : 'N/A';

    // Charger les options de décision de vote
    const { data: decisions, error: decisionsError } = await dataService.getRecords(TABLES.DECISION_VOTE_REF);
    if (!decisionsError) {
        commissionUI.voteDecisionSelect.innerHTML = '<option value="">-- Choisir --</option>';
        decisions.forEach(d => {
            const opt = document.createElement('option');
            opt.value = d.id_decision_vote;
            opt.textContent = d.libelle_decision_vote;
            commissionUI.voteDecisionSelect.appendChild(opt);
        });
    }

    // Pré-remplir si un vote existe déjà pour ce rapport et cet utilisateur dans le tour actuel
    // Ceci nécessiterait une fonction Edge pour récupérer le tour actuel et le vote de l'utilisateur
    const { data: existingVote, error: voteError } = await dataService.getRecords(TABLES.VOTE_COMMISSION, {
        id_rapport_etudiant: reportId,
        numero_enseignant: currentUser.id,
        // tour_vote: currentTour (nécessite de connaître le tour actuel)
    }, 'date_vote DESC', 1);

    if (!voteError && existingVote.length > 0) {
        commissionUI.voteDecisionSelect.value = existingVote[0].id_decision_vote;
        commissionUI.voteCommentInput.value = existingVote[0].commentaire_vote || '';
    } else {
        commissionUI.voteForm.reset();
    }

    openModal(commissionUI.voteModal);
}

async function handleVoteSubmit(e) {
    e.preventDefault();
    if (!validateForm(commissionUI.voteForm)) {
        displayMessage(commissionUI.voteModal.querySelector('.modal-box'), 'error', 'Veuillez remplir tous les champs requis.');
        return;
    }
    setButtonLoading(e.submitter, true);
    const formData = getFormData(commissionUI.voteForm);

    // Vérifier si un commentaire est requis
    if (formData.id_decision_vote !== 'VOTE_APPROUVE' && !formData.commentaire_vote.trim()) {
        displayMessage(commissionUI.voteModal.querySelector('.modal-box'), 'error', 'Un commentaire est obligatoire pour cette décision.');
        setButtonLoading(e.submitter, false);
        return;
    }

    // Enregistrer le vote via une fonction Edge (pour la logique de tour de vote, quorum, etc.)
    const { success, message } = await functionService.submitVote(
        formData.id_rapport_etudiant,
        formData.id_session,
        currentUser.id,
        formData.id_decision_vote,
        formData.commentaire_vote
    ); // Fonction Edge à créer

    if (!success) {
        displayMessage(commissionUI.voteModal.querySelector('.modal-box'), 'error', `Erreur: ${message}`);
    } else {
        displayMessage(document.getElementById('global-flash-messages'), 'success', 'Vote enregistré avec succès.');
        closeModal(commissionUI.voteModal);
        loadReportsToVote(); // Recharger la liste des rapports à voter
    }
    setButtonLoading(e.submitter, false);
}

// --- GESTION DES PV ---
async function handleInitPv(sessionId) {
    // Vérifier si un PV existe déjà pour cette session
    const { data: existingPv, error: pvError } = await dataService.getRecords(TABLES.COMPTE_RENDU, {
        id_rapport_etudiant: null, // PV de session
        libelle_compte_rendu: { operator: 'like', value: `%${sessionId}%` } // Chercher par nom de session
    });

    let pvId;
    if (!pvError && existingPv.length > 0) {
        pvId = existingPv[0].id_compte_rendu;
        displayMessage(document.getElementById('global-flash-messages'), 'info', 'Un PV existe déjà pour cette session. Ouverture de l\'éditeur.');
    } else {
        // Créer un nouveau PV via une fonction Edge
        const { success, message, pvId: newPvId } = await functionService.initiatePv(sessionId, currentUser.id); // Fonction Edge à créer
        if (!success) {
            displayMessage(document.getElementById('global-flash-messages'), 'error', `Erreur d'initialisation du PV: ${message}`);
            return;
        }
        pvId = newPvId;
        displayMessage(document.getElementById('global-flash-messages'), 'success', 'PV initié avec succès.');
    }
    await openPvEditorModal(pvId);
}

async function openPvEditorModal(pvId) {
    const { data: pv, error } = await dataService.getRecordById(TABLES.COMPTE_RENDU, pvId);
    if (error || !pv) {
        displayMessage(document.getElementById('global-flash-messages'), 'error', 'PV non trouvé.');
        return;
    }

    commissionUI.pvIdHidden.value = pv.id_compte_rendu;
    commissionUI.pvLibelleInput.value = pv.libelle_compte_rendu;

    // Initialiser TinyMCE pour le contenu du PV
    tinymce.get('pv-content')?.remove(); // S'assurer qu'il n'y a pas d'ancienne instance
    tinymce.init({
        selector: '#pv-content',
        plugins: 'advlist autolink lists link image charmap print preview anchor',
        toolbar_mode: 'floating',
        height: 400,
        setup: function(editor) {
            editor.on('init', () => {
                editor.setContent(pv.contenu || '');
            });
        }
    });

    // Gérer la visibilité du bouton "Soumettre pour Approbation"
    // Seulement si l'utilisateur est le rédacteur et que le statut est brouillon
    const isRedacteur = pv.id_redacteur === currentUser.id;
    const isDraft = pv.id_statut_pv === 'PV_BROUILLON';
    commissionUI.submitPvForApprovalBtn.classList.toggle('hidden', !isRedacteur || !isDraft);

    openModal(commissionUI.pvEditorModal);
}

async function handlePvEditorSubmit(e) {
    e.preventDefault();
    setButtonLoading(e.submitter, true);
    const formData = getFormData(commissionUI.pvEditorForm);
    const pvId = formData.id_compte_rendu;
    const pvContent = tinymce.get('pv-content').getContent();

    const { error } = await dataService.updateRecord(TABLES.COMPTE_RENDU, pvId, {
        libelle_compte_rendu: formData.libelle_compte_rendu,
        contenu: pvContent,
        // date_derniere_modif: new Date().toISOString() // Ajouter une colonne si nécessaire
    });

    if (error) {
        displayMessage(commissionUI.pvEditorModal.querySelector('.modal-box'), 'error', `Erreur de sauvegarde: ${error.message}`);
    } else {
        displayMessage(document.getElementById('global-flash-messages'), 'success', 'PV sauvegardé.');
        // Ne pas fermer la modale, l'utilisateur peut continuer à éditer
    }
    setButtonLoading(e.submitter, false);
}

async function handleSubmitPvForApproval() {
    setButtonLoading(commissionUI.submitPvForApprovalBtn, true);
    const pvId = commissionUI.pvIdHidden.value;

    // Soumettre le PV pour approbation via une fonction Edge
    const { success, message } = await functionService.submitPvForApproval(pvId, currentUser.id); // Fonction Edge à créer

    if (!success) {
        displayMessage(commissionUI.pvEditorModal.querySelector('.modal-box'), 'error', `Erreur de soumission: ${message}`);
    } else {
        displayMessage(document.getElementById('global-flash-messages'), 'success', 'PV soumis pour approbation.');
        closeModal(commissionUI.pvEditorModal);
        loadPvsToApprove(); // Recharger la liste des PVs à approuver
    }
    setButtonLoading(commissionUI.submitPvForApprovalBtn, false);
}

async function handleApprovePv(pvId) {
    confirmAction('Approuver PV', `Voulez-vous approuver le PV ${pvId} ?`, async () => {
        // Approuver le PV via une fonction Edge
        const { success, message } = await functionService.approvePv(pvId, currentUser.id); // Fonction Edge à créer
        if (!success) {
            displayMessage(document.getElementById('global-flash-messages'), 'error', `Erreur d'approbation: ${message}`);
        } else {
            displayMessage(document.getElementById('global-flash-messages'), 'success', 'PV approuvé avec succès.');
            loadPvsToApprove(); // Recharger la liste
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