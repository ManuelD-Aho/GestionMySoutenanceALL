// /assets/js/pages/etudiant.js

import { dataService, functionService } from '../services/simulation-service.js';
import { authService } from '../services/auth-service.js';
import { displayMessage, setButtonLoading, generateUniqueId, formatDate, openModal, closeModal, fillForm, getFormData, validateForm } from '../utils/helpers.js';
import { ROLES, TABLES, REPORT_STATUS, ID_PREFIXES } from '../utils/constants.js';

let currentUser = null;
let userPermissions = [];
let currentReport = null;

const etudiantUI = {
    eligibilityBanner: document.getElementById('eligibility-banner'),
    eligibilityMessage: document.getElementById('eligibility-message'),
    reportTitleDisplay: document.getElementById('report-title'),
    reportStatusDisplay: document.getElementById('report-status'),
    reportLastModifiedDisplay: document.getElementById('report-last-modified'),
    startEditReportBtn: document.getElementById('start-edit-report-btn'),
    viewReportBtn: document.getElementById('view-report-btn'),
    workflowStepper: document.getElementById('workflow-stepper'),
    personalNotificationsList: document.getElementById('personal-notifications-list'),
    viewAllNotificationsBtn: document.getElementById('view-all-notifications-btn'),
    myDocumentsLink: document.getElementById('my-documents-link'),
    myReclamationsLink: document.getElementById('my-reclamations-link'),
    resourcesHelpLink: document.getElementById('resources-help-link'),
    modelSelectionSection: document.getElementById('model-selection-section'),
    modelListContainer: document.getElementById('model-list-container'),
    selectModelForm: document.getElementById('select-model-form'),
    createFromModelBtn: document.getElementById('create-from-model-btn'),
    createBlankReportBtn: document.getElementById('create-blank-report-btn'),
    reportEditorSection: document.getElementById('report-editor-section'),
    reportForm: document.getElementById('report-form'),
    reportIdHidden: document.getElementById('report-id-hidden'),
    reportTitleInput: document.getElementById('report-title-input'),
    reportThemeInput: document.getElementById('report-theme-input'),
    reportPagesInput: document.getElementById('report-pages-input'),
    reportResumeEditor: document.getElementById('report-resume-editor'),
    reportSectionsContainer: document.getElementById('report-sections-container'),
    correctionNoteSection: document.getElementById('correction-note-section'),
    correctionNoteInput: document.getElementById('correction-note'),
    saveDraftBtn: document.getElementById('save-draft-btn'),
    submitReportBtn: document.getElementById('submit-report-btn'),
    submitCorrectionsBtn: document.getElementById('submit-corrections-btn'),
    modelCardTemplate: document.getElementById('model-card-template'),
    reportSectionTemplate: document.getElementById('report-section-template'),
    profilePictureDisplay: document.getElementById('profile-picture-display'),
    profilePictureInput: document.getElementById('profile-picture-input'),
    uploadPhotoBtn: document.getElementById('upload-photo-btn'),
    profilePictureForm: document.getElementById('profile-picture-form'),
    personalInfoForm: document.getElementById('personal-info-form'),
    changePasswordForm: document.getElementById('change-password-form'),
    currentPasswordInput: document.getElementById('current-password'),
    newPasswordInput: document.getElementById('new-password'),
    confirmNewPasswordInput: document.getElementById('confirm-new-password'),
    twoFaStatusDisplay: document.getElementById('2fa-status-display'),
    twoFaActionsSection: document.getElementById('2fa-actions'),
    enable2FaBtn: document.getElementById('enable-2fa-btn'),
    disable2FaBtn: document.getElementById('disable-2fa-btn'),
    twoFaSetupModal: document.getElementById('2fa-setup-modal'),
    qrCodeDisplay: document.getElementById('qr-code-display'),
    secretKeyDisplay: document.getElementById('secret-key-display'),
    twoFaVerifyForm: document.getElementById('2fa-verify-form'),
    twoFaCodeInput: document.getElementById('2fa-code-input'),
    feedbackContainer: document.getElementById('global-flash-messages'),
};

export async function initPage(user, permissions) {
    currentUser = user;
    userPermissions = permissions;

    const currentPath = window.location.pathname;
    if (currentPath.includes('dashboard.html')) {
        await loadEtudiantDashboard();
    } else if (currentPath.includes('rapport.html')) {
        await loadRapportPage();
    } else if (currentPath.includes('profil.html')) {
        await loadProfilPage();
    }
}

async function loadEtudiantDashboard() {
    const { data: reports } = await dataService.getRecords(TABLES.RAPPORT_ETUDIANT, {
        numero_carte_etudiant: currentUser.id,
    }, 'date_derniere_modif DESC', 1);
    currentReport = reports[0] || null;

    if (currentReport) {
        etudiantUI.reportTitleDisplay.textContent = currentReport.libelle_rapport_etudiant;
        etudiantUI.reportStatusDisplay.textContent = currentReport.id_statut_rapport;
        etudiantUI.reportLastModifiedDisplay.textContent = formatDate(currentReport.date_derniere_modif);
        etudiantUI.startEditReportBtn.classList.remove('hidden');
        etudiantUI.viewReportBtn.classList.remove('hidden');
        etudiantUI.startEditReportBtn.onclick = () => window.location.href = `/pages/etudiant/rapport.html?id=${currentReport.id_rapport_etudiant}`;
        etudiantUI.viewReportBtn.onclick = () => window.location.href = `/pages/etudiant/rapport.html?id=${currentReport.id_rapport_etudiant}`;
    } else {
        etudiantUI.reportTitleDisplay.textContent = 'Aucun rapport en cours.';
        etudiantUI.reportStatusDisplay.textContent = 'N/A';
        etudiantUI.reportLastModifiedDisplay.textContent = 'N/A';
        etudiantUI.startEditReportBtn.classList.remove('hidden');
        etudiantUI.startEditReportBtn.textContent = 'Commencer un nouveau rapport';
        etudiantUI.startEditReportBtn.onclick = () => window.location.href = '/pages/etudiant/rapport.html';
        etudiantUI.viewReportBtn.classList.add('hidden');
    }
    await loadWorkflowStepper(currentReport?.id_statut_rapport);
}

async function loadWorkflowStepper(currentStatusId) {
    const { data: statusRefs } = await dataService.getRecords(TABLES.STATUT_RAPPORT_REF, {}, 'etape_workflow ASC');
    etudiantUI.workflowStepper.innerHTML = '';
    let completed = true;
    statusRefs.filter(s => s.etape_workflow).forEach(status => {
        const li = document.createElement('li');
        li.className = 'stepper-item';
        if (completed) li.classList.add('completed');
        if (status.id_statut_rapport === currentStatusId) {
            li.classList.add('current');
            completed = false;
        }
        li.innerHTML = `<div class="stepper-icon"><i class="fas fa-check-circle"></i></div><div class="stepper-content"><span class="stepper-label">${status.libelle_statut_rapport}</span></div>`;
        etudiantUI.workflowStepper.appendChild(li);
    });
}

async function loadRapportPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const reportId = urlParams.get('id');

    if (reportId) {
        const { data: report } = await dataService.getRecordById(TABLES.RAPPORT_ETUDIANT, reportId);
        currentReport = report;
        await displayReportEditor(report);
    } else {
        await displayModelSelection();
    }
    setupRapportEventListeners();
}

async function displayReportEditor(report) {
    etudiantUI.modelSelectionSection.classList.add('hidden');
    etudiantUI.reportEditorSection.classList.remove('hidden');
    fillForm(etudiantUI.reportForm, report);

    tinymce.init({
        selector: '#report-resume-editor',
        height: 200,
        setup: editor => { editor.on('init', () => editor.setContent(report.resume || '')); }
    });

    const { data: sections } = await dataService.getRecords(TABLES.SECTION_RAPPORT, { id_rapport_etudiant: report.id_rapport_etudiant }, 'ordre ASC');
    etudiantUI.reportSectionsContainer.innerHTML = '';
    sections.forEach(section => {
        const sectionEl = etudiantUI.reportSectionTemplate.content.cloneNode(true);
        sectionEl.querySelector('.section-title').textContent = section.titre_section;
        const textarea = sectionEl.querySelector('textarea');
        textarea.id = `section-${section.titre_section.replace(/\s/g, '-')}`;
        etudiantUI.reportSectionsContainer.appendChild(sectionEl);
        tinymce.init({
            selector: `#${textarea.id}`,
            height: 300,
            setup: editor => { editor.on('init', () => editor.setContent(section.contenu_section || '')); }
        });
    });
}

async function displayModelSelection() {
    etudiantUI.modelSelectionSection.classList.remove('hidden');
    etudiantUI.reportEditorSection.classList.add('hidden');
    const { data: models } = await dataService.getRecords(TABLES.RAPPORT_MODELE, { statut: 'Publié' });
    etudiantUI.modelListContainer.innerHTML = '';
    models.forEach(model => {
        const card = etudiantUI.modelCardTemplate.content.cloneNode(true);
        card.querySelector('.model-card').dataset.id = model.id_modele;
        card.querySelector('.model-card-title').textContent = model.nom_modele;
        card.querySelector('.model-card-description').textContent = model.description;
        card.querySelector('.model-card-version').textContent = `Version: ${model.version}`;
        card.querySelector('.select-model-btn').dataset.id = model.id_modele;
        etudiantUI.modelListContainer.appendChild(card);
    });
}

function setupRapportEventListeners() {
    etudiantUI.modelListContainer?.addEventListener('click', (e) => {
        if (e.target.classList.contains('select-model-btn')) {
            handleModelSelectionSubmit(e.target.dataset.id);
        }
    });
    etudiantUI.createBlankReportBtn?.addEventListener('click', handleCreateBlankReport);
    etudiantUI.reportForm?.addEventListener('submit', handleSubmitReport);
    etudiantUI.saveDraftBtn?.addEventListener('click', handleSaveDraft);
}

async function handleModelSelectionSubmit(modelId) {
    setButtonLoading(etudiantUI.createFromModelBtn, true);
    const { success, reportId } = await functionService.createReportFromModel(currentUser.id, modelId);
    if (success) {
        window.location.href = `/pages/etudiant/rapport.html?id=${reportId}`;
    } else {
        displayMessage(etudiantUI.feedbackContainer, 'error', 'Erreur de création du rapport.');
    }
    setButtonLoading(etudiantUI.createFromModelBtn, false);
}

async function handleCreateBlankReport() {
    setButtonLoading(etudiantUI.createBlankReportBtn, true);
    const { success, reportId } = await functionService.createBlankReport(currentUser.id);
    if (success) {
        window.location.href = `/pages/etudiant/rapport.html?id=${reportId}`;
    } else {
        displayMessage(etudiantUI.feedbackContainer, 'error', 'Erreur de création du rapport.');
    }
    setButtonLoading(etudiantUI.createBlankReportBtn, false);
}

async function handleSaveDraft() {
    setButtonLoading(etudiantUI.saveDraftBtn, true);
    const reportId = etudiantUI.reportIdHidden.value;
    const metadonnees = getFormData(etudiantUI.reportForm);
    metadonnees.resume = tinymce.get('report-resume-editor').getContent();

    const sections = {};
    etudiantUI.reportSectionsContainer.querySelectorAll('.report-section-item').forEach(item => {
        const title = item.querySelector('.section-title').textContent;
        const editorId = item.querySelector('textarea').id;
        sections[title] = tinymce.get(editorId).getContent();
    });

    const { success } = await functionService.saveReportDraft(reportId, currentUser.id, metadonnees, sections);
    if (success) {
        displayMessage(etudiantUI.feedbackContainer, 'success', 'Brouillon sauvegardé.');
    } else {
        displayMessage(etudiantUI.feedbackContainer, 'error', 'Erreur de sauvegarde.');
    }
    setButtonLoading(etudiantUI.saveDraftBtn, false);
}

async function handleSubmitReport(e) {
    e.preventDefault();
    setButtonLoading(e.submitter, true);
    const reportId = etudiantUI.reportIdHidden.value;
    const metadonnees = getFormData(etudiantUI.reportForm);
    metadonnees.resume = tinymce.get('report-resume-editor').getContent();

    const sections = {};
    etudiantUI.reportSectionsContainer.querySelectorAll('.report-section-item').forEach(item => {
        const title = item.querySelector('.section-title').textContent;
        const editorId = item.querySelector('textarea').id;
        sections[title] = tinymce.get(editorId).getContent();
    });

    const { success } = await functionService.submitReport(reportId, currentUser.id, metadonnees, sections);
    if (success) {
        displayMessage(etudiantUI.feedbackContainer, 'success', 'Rapport soumis !');
        setTimeout(() => window.location.href = '/pages/etudiant/dashboard.html', 1500);
    } else {
        displayMessage(etudiantUI.feedbackContainer, 'error', 'Erreur de soumission.');
    }
    setButtonLoading(e.submitter, false);
}

async function loadProfilPage() {
    await loadProfileData();
    setupProfilEventListeners();
}

async function loadProfileData() {
    const { data: user } = await dataService.getRecordById(TABLES.UTILISATEUR, currentUser.id);
    const { data: etudiantProfile } = await dataService.getRecordById(TABLES.ETUDIANT, currentUser.id);

    document.getElementById('display-nom').textContent = etudiantProfile.nom;
    document.getElementById('display-prenom').textContent = etudiantProfile.prenom;
    fillForm(etudiantUI.personalInfoForm, etudiantProfile);
    etudiantUI.profilePictureDisplay.src = user.photo_profil || `https://i.pravatar.cc/150?u=${currentUser.id}`;
}

function setupProfilEventListeners() {
    etudiantUI.personalInfoForm.addEventListener('submit', handlePersonalInfoSubmit);
    etudiantUI.changePasswordForm.addEventListener('submit', handleChangePasswordSubmit);
}

async function handlePersonalInfoSubmit(e) {
    e.preventDefault();
    setButtonLoading(e.submitter, true);
    const formData = getFormData(etudiantUI.personalInfoForm);
    const { error } = await dataService.updateRecord(TABLES.ETUDIANT, currentUser.id, formData);
    if (error) {
        displayMessage(etudiantUI.feedbackContainer, 'error', `Erreur: ${error.message}`);
    } else {
        displayMessage(etudiantUI.feedbackContainer, 'success', 'Informations sauvegardées.');
    }
    setButtonLoading(e.submitter, false);
}

async function handleChangePasswordSubmit(e) {
    e.preventDefault();
    setButtonLoading(e.submitter, true);
    const newPassword = etudiantUI.newPasswordInput.value;
    const confirmPassword = etudiantUI.confirmNewPasswordInput.value;
    if (newPassword !== confirmPassword) {
        displayMessage(etudiantUI.feedbackContainer, 'error', 'Les mots de passe ne correspondent pas.');
        setButtonLoading(e.submitter, false);
        return;
    }
    const { error } = await authService.updatePassword(newPassword);
    if (error) {
        displayMessage(etudiantUI.feedbackContainer, 'error', `Erreur: ${error.message}`);
    } else {
        displayMessage(etudiantUI.feedbackContainer, 'success', 'Mot de passe changé.');
        etudiantUI.changePasswordForm.reset();
    }
    setButtonLoading(e.submitter, false);
}