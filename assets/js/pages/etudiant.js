// /assets/js/pages/etudiant.js

import { dataService } from '../services/data-service.js';
import { functionService } from '../services/function-service.js';
import { displayMessage, setButtonLoading, generateUniqueId, formatDate, openModal, closeModal, fillForm, getFormData, validateForm } from '../utils/helpers.js';
import { ROLES, TABLES, REPORT_STATUS, ID_PREFIXES, DOCUMENT_TYPES, STORAGE_BUCKETS } from '../utils/constants.js';

let currentUser = null;
let userPermissions = [];
let currentReport = null; // Le rapport de l'étudiant actuellement chargé

// --- ÉLÉMENTS DU DOM SPÉCIFIQUES À L'ÉTUDIANT ---
const etudiantUI = {
    // Dashboard
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

    // Rapport
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

    // Profil
    profilePictureDisplay: document.getElementById('profile-picture-display'),
    profilePictureInput: document.getElementById('profile-picture-input'),
    uploadPhotoBtn: document.getElementById('upload-photo-btn'),
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
};

// --- INITIALISATION DE LA PAGE ÉTUDIANT ---
export async function initPage(user, permissions) {
    currentUser = user;
    userPermissions = permissions;

    // Vérifier les permissions spécifiques à l'étudiant
    if (!hasPermission('TRAIT_ETUDIANT_DASHBOARD_ACCEDER') && !hasPermission('TRAIT_ETUDIANT_PROFIL_GERER') && !hasPermission('TRAIT_ETUDIANT_RAPPORT_SUIVRE')) {
        window.location.href = '/'; // Rediriger vers la page de connexion si pas étudiant
        return;
    }

    const currentPath = window.location.pathname;
    if (currentPath.includes('dashboard.html')) {
        await loadEtudiantDashboard();
    } else if (currentPath.includes('rapport.html')) {
        await loadRapportPage();
    } else if (currentPath.includes('profil.html')) {
        await loadProfilPage();
    }
}

function hasPermission(permissionCode) {
    return userPermissions.includes(permissionCode);
}

// --- DASHBOARD ÉTUDIANT ---
async function loadEtudiantDashboard() {
    // Vérifier l'éligibilité à la soumission (simulé, devrait être une fonction Edge)
    const isEligible = await checkStudentEligibility(currentUser.id);
    if (!isEligible.eligible) {
        etudiantUI.eligibilityBanner.classList.remove('hidden');
        etudiantUI.eligibilityMessage.textContent = isEligible.message;
    } else {
        etudiantUI.eligibilityBanner.classList.add('hidden');
    }

    // Charger le rapport de l'étudiant
    const { data: report, error: reportError } = await dataService.getRecords(TABLES.RAPPORT_ETUDIANT, {
        numero_carte_etudiant: currentUser.id,
        // On pourrait filtrer par année académique active ici si la DB le permet
    }, 'date_derniere_modif DESC', 1); // Récupérer le plus récent

    if (reportError) {
        displayMessage(document.getElementById('global-flash-messages'), 'error', 'Erreur de chargement du rapport.');
        console.error("Error loading student report:", reportError);
        return;
    }

    currentReport = report[0] || null;

    if (currentReport) {
        etudiantUI.reportTitleDisplay.textContent = currentReport.libelle_rapport_etudiant;
        etudiantUI.reportStatusDisplay.textContent = currentReport.id_statut_rapport;
        etudiantUI.reportLastModifiedDisplay.textContent = formatDate(currentReport.date_derniere_modif);

        etudiantUI.startEditReportBtn.classList.remove('hidden');
        etudiantUI.viewReportBtn.classList.remove('hidden');

        // Gérer les boutons d'action selon le statut du rapport
        if (currentReport.id_statut_rapport === REPORT_STATUS.BROUILLON || currentReport.id_statut_rapport === REPORT_STATUS.CORRECT) {
            etudiantUI.startEditReportBtn.textContent = 'Modifier le rapport';
        } else {
            etudiantUI.startEditReportBtn.textContent = 'Voir le rapport (lecture seule)';
            etudiantUI.startEditReportBtn.disabled = true; // Désactiver l'édition si non brouillon/correction
        }
        etudiantUI.startEditReportBtn.onclick = () => window.location.href = `/pages/etudiant/rapport.html?id=${currentReport.id_rapport_etudiant}`;
        etudiantUI.viewReportBtn.onclick = () => window.location.href = `/pages/etudiant/rapport.html?id=${currentReport.id_rapport_etudiant}`; // Peut-être une vue lecture seule dédiée

    } else {
        etudiantUI.reportTitleDisplay.textContent = 'Aucun rapport en cours.';
        etudiantUI.reportStatusDisplay.textContent = 'N/A';
        etudiantUI.reportLastModifiedDisplay.textContent = 'N/A';
        etudiantUI.startEditReportBtn.classList.remove('hidden');
        etudiantUI.startEditReportBtn.textContent = 'Commencer un nouveau rapport';
        etudiantUI.startEditReportBtn.onclick = () => window.location.href = '/pages/etudiant/rapport.html';
        etudiantUI.viewReportBtn.classList.add('hidden');
    }

    await loadWorkflowStepper(currentReport?.id_rapport_etudiant);
    await loadPersonalNotifications();
    setupDashboardEventListeners();
}

async function checkStudentEligibility(studentId) {
    // Cette logique devrait être une fonction Edge pour des raisons de sécurité et de complexité
    // Elle vérifierait : inscription active, paiement à jour, stage validé, pas de pénalités non réglées.
    // Pour la simulation frontend:
    const { data: inscriptions, error: inscrError } = await dataService.getRecords(TABLES.INSCRIRE, { numero_carte_etudiant: studentId });
    const { data: stages, error: stageError } = await dataService.getRecords(TABLES.FAIRE_STAGE, { numero_carte_etudiant: studentId });
    const { data: penalties, error: penError } = await dataService.getRecords(TABLES.PENALITE, { numero_carte_etudiant: studentId, id_statut_penalite: 'PEN_DUE' });

    if (inscrError || stageError || penError) {
        return { eligible: false, message: 'Erreur de vérification d\'éligibilité.' };
    }

    const hasActiveInscription = inscriptions.some(i => i.id_statut_paiement === 'PAIE_OK');
    const hasValidatedStage = stages.some(s => s.est_valide === true);
    const hasNoPendingPenalties = penalties.length === 0;

    if (!hasActiveInscription) return { eligible: false, message: 'Votre inscription n\'est pas à jour ou non payée.' };
    if (!hasValidatedStage) return { eligible: false, message: 'Votre stage n\'a pas été enregistré ou validé par la scolarité.' };
    if (!hasNoPendingPenalties) return { eligible: false, message: 'Vous avez des pénalités de retard non régularisées.' };

    return { eligible: true, message: 'Vous êtes éligible à la soumission de rapport.' };
}

async function loadWorkflowStepper(reportId) {
    const { data: statusRefs, error } = await dataService.getRecords(TABLES.STATUT_RAPPORT_REF, {}, 'etape_workflow ASC');
    if (error) {
        console.error("Error loading workflow steps:", error);
        return;
    }

    let currentReportStatus = null;
    if (reportId) {
        const { data: report, error: reportFetchError } = await dataService.getRecordById(TABLES.RAPPORT_ETUDIANT, reportId);
        if (!reportFetchError) {
            currentReportStatus = report.id_statut_rapport;
        }
    }

    etudiantUI.workflowStepper.innerHTML = '';
    let completed = true;
    statusRefs.forEach(status => {
        if (status.etape_workflow === null) return; // Ignorer les statuts non liés au workflow visuel

        const li = document.createElement('li');
        li.className = 'stepper-item';
        if (reportId) {
            if (completed) {
                li.classList.add('completed');
            }
            if (status.id_statut_rapport === currentReportStatus) {
                li.classList.add('current');
                completed = false; // Les étapes suivantes ne sont pas complétées
            }
        }
        li.innerHTML = `
            <div class="stepper-icon"><i class="fas ${li.classList.contains('completed') ? 'fa-check-circle' : 'fa-circle'}"></i></div>
            <div class="stepper-content">
                <span class="stepper-label">${status.libelle_statut_rapport}</span>
                ${li.classList.contains('completed') ? `<span class="stepper-date">${formatDate(new Date())}</span>` : ''}
            </div>
        `;
        etudiantUI.workflowStepper.appendChild(li);
    });
}

async function loadPersonalNotifications() {
    const { data: notifications, error } = await dataService.getRecords(TABLES.RECEVOIR, {
        numero_utilisateur: currentUser.id,
        lue: false
    }, 'date_reception DESC', 5); // Charger les 5 dernières non lues

    if (error) {
        console.error("Error loading notifications:", error);
        return;
    }

    etudiantUI.personalNotificationsList.innerHTML = '';
    if (notifications.length === 0) {
        etudiantUI.personalNotificationsList.innerHTML = '<li>Aucune notification récente.</li>';
        return;
    }

    notifications.forEach(notif => {
        const li = document.createElement('li');
        li.className = 'notification-item';
        // Récupérer le libellé du template de notification
        const template = dataService.getRecordById(TABLES.NOTIFICATION, notif.id_notification); // Ceci devrait être pré-chargé ou joint
        const message = template?.libelle_notification || notif.id_notification; // Fallback
        li.innerHTML = `
            <i class="fas fa-info-circle notification-icon"></i>
            <span>${message}</span>
            <span class="notification-date">${formatDate(notif.date_reception)}</span>
        `;
        etudiantUI.personalNotificationsList.appendChild(li);
    });
}

function setupDashboardEventListeners() {
    // Liens rapides
    etudiantUI.myDocumentsLink.addEventListener('click', (e) => { e.preventDefault(); displayMessage(document.getElementById('global-flash-messages'), 'info', 'Fonctionnalité "Mes Documents" à implémenter.'); });
    etudiantUI.myReclamationsLink.addEventListener('click', (e) => { e.preventDefault(); displayMessage(document.getElementById('global-flash-messages'), 'info', 'Fonctionnalité "Mes Réclamations" à implémenter.'); });
    etudiantUI.resourcesHelpLink.addEventListener('click', (e) => { e.preventDefault(); displayMessage(document.getElementById('global-flash-messages'), 'info', 'Fonctionnalité "Ressources & Aide" à implémenter.'); });
    etudiantUI.viewAllNotificationsBtn.addEventListener('click', (e) => { e.preventDefault(); displayMessage(document.getElementById('global-flash-messages'), 'info', 'Fonctionnalité "Toutes les notifications" à implémenter.'); });
}

// --- GESTION DU RAPPORT ---
async function loadRapportPage() {
    if (!hasPermission('TRAIT_ETUDIANT_RAPPORT_SOUMETTRE') && !hasPermission('TRAIT_ETUDIANT_RAPPORT_SUIVRE')) {
        displayMessage(document.getElementById('global-flash-messages'), 'error', 'Accès refusé à la gestion des rapports.');
        window.location.href = '/pages/etudiant/dashboard.html';
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const reportId = urlParams.get('id');

    if (reportId) {
        const { data: report, error } = await dataService.getRecordById(TABLES.RAPPORT_ETUDIANT, reportId);
        if (error || !report || report.numero_carte_etudiant !== currentUser.id) {
            displayMessage(document.getElementById('global-flash-messages'), 'error', 'Rapport non trouvé ou accès non autorisé.');
            window.location.href = '/pages/etudiant/dashboard.html';
            return;
        }
        currentReport = report;
        await displayReportEditor(report);
    } else {
        // Pas de rapport ID dans l'URL, proposer de créer
        await displayModelSelection();
    }
    setupRapportEventListeners();
}

async function displayModelSelection() {
    etudiantUI.modelSelectionSection.classList.remove('hidden');
    etudiantUI.reportEditorSection.classList.add('hidden');

    const { data: models, error } = await dataService.getRecords(TABLES.RAPPORT_MODELE, { statut: 'Publié' });
    if (error) {
        displayMessage(etudiantUI.modelSelectionSection, 'error', 'Erreur de chargement des modèles.');
        return;
    }

    etudiantUI.modelListContainer.innerHTML = '';
    models.forEach(model => {
        const card = etudiantUI.modelCardTemplate.content.cloneNode(true);
        card.querySelector('.model-card').dataset.id = model.id_modele;
        card.querySelector('.model-card-title').textContent = model.nom_modele;
        card.querySelector('.model-card-description').textContent = model.description;
        card.querySelector('.model-card-version').textContent = `Version: ${model.version}`;
        etudiantUI.modelListContainer.appendChild(card);
    });
}

async function displayReportEditor(report) {
    etudiantUI.modelSelectionSection.classList.add('hidden');
    etudiantUI.reportEditorSection.classList.remove('hidden');

    etudiantUI.reportIdHidden.value = report.id_rapport_etudiant;
    etudiantUI.reportTitleInput.value = report.libelle_rapport_etudiant;
    etudiantUI.reportThemeInput.value = report.theme;
    etudiantUI.reportPagesInput.value = report.nombre_pages;

    // Initialiser TinyMCE pour le résumé
    tinymce.init({
        selector: '#report-resume-editor',
        plugins: 'advlist autolink lists link image charmap print preview anchor',
        toolbar_mode: 'floating',
        height: 200,
        readonly: report.id_statut_rapport !== REPORT_STATUS.BROUILLON && report.id_statut_rapport !== REPORT_STATUS.CORRECT,
        setup: function(editor) {
            editor.on('init', () => {
                editor.setContent(report.resume || '');
            });
        }
    });

    // Charger les sections dynamiquement
    const { data: sections, error: sectionsError } = await dataService.getRecords(TABLES.SECTION_RAPPORT, { id_rapport_etudiant: report.id_rapport_etudiant }, 'ordre ASC');
    if (sectionsError) {
        displayMessage(etudiantUI.reportEditorSection, 'error', 'Erreur de chargement des sections du rapport.');
        return;
    }

    etudiantUI.reportSectionsContainer.innerHTML = '';
    sections.forEach(section => {
        const sectionItem = etudiantUI.reportSectionTemplate.content.cloneNode(true);
        sectionItem.querySelector('.section-title').textContent = section.titre_section;
        const textarea = sectionItem.querySelector('textarea');
        textarea.id = `section-${section.titre_section.replace(/\s/g, '-')}`;
        textarea.name = `sections[${section.titre_section}]`;
        etudiantUI.reportSectionsContainer.appendChild(sectionItem);

        // Initialiser TinyMCE pour chaque section
        tinymce.init({
            selector: `#${textarea.id}`,
            plugins: 'advlist autolink lists link image charmap print preview anchor',
            toolbar_mode: 'floating',
            height: 300,
            readonly: report.id_statut_rapport !== REPORT_STATUS.BROUILLON && report.id_statut_rapport !== REPORT_STATUS.CORRECT,
            setup: function(editor) {
                editor.on('init', () => {
                    editor.setContent(section.contenu_section || '');
                });
            }
        });
    });

    // Gérer la visibilité des boutons de soumission et du champ de note de correction
    const isEditable = report.id_statut_rapport === REPORT_STATUS.BROUILLON || report.id_statut_rapport === REPORT_STATUS.CORRECT;
    etudiantUI.saveDraftBtn.classList.toggle('hidden', !isEditable);
    etudiantUI.submitReportBtn.classList.toggle('hidden', report.id_statut_rapport !== REPORT_STATUS.BROUILLON);
    etudiantUI.submitCorrectionsBtn.classList.toggle('hidden', report.id_statut_rapport !== REPORT_STATUS.CORRECT);
    etudiantUI.correctionNoteSection.classList.toggle('hidden', report.id_statut_rapport !== REPORT_STATUS.CORRECT);
}

function setupRapportEventListeners() {
    etudiantUI.selectModelForm.addEventListener('submit', handleModelSelectionSubmit);
    etudiantUI.createBlankReportBtn.addEventListener('click', handleCreateBlankReport);
    etudiantUI.reportForm.addEventListener('submit', handleSubmitReport);
    etudiantUI.saveDraftBtn.addEventListener('click', handleSaveDraft);
}

async function handleModelSelectionSubmit(e) {
    e.preventDefault();
    setButtonLoading(etudiantUI.createFromModelBtn, true);
    const selectedModelId = e.submitter.closest('.model-card')?.dataset.id || e.target.querySelector('input[type="radio"]:checked')?.value;

    if (!selectedModelId) {
        displayMessage(etudiantUI.modelSelectionSection, 'error', 'Veuillez sélectionner un modèle.');
        setButtonLoading(etudiantUI.createFromModelBtn, false);
        return;
    }

    // Créer le rapport à partir du modèle (via une fonction Edge pour la complexité)
    const { success, message, reportId } = await functionService.createReportFromModel(currentUser.id, selectedModelId); // Fonction Edge à créer
    if (!success) {
        displayMessage(etudiantUI.modelSelectionSection, 'error', `Erreur: ${message}`);
    } else {
        displayMessage(etudiantUI.modelSelectionSection, 'success', 'Rapport créé avec succès !');
        window.location.href = `/pages/etudiant/rapport.html?id=${reportId}`;
    }
    setButtonLoading(etudiantUI.createFromModelBtn, false);
}

async function handleCreateBlankReport() {
    setButtonLoading(etudiantUI.createBlankReportBtn, true);
    const { success, message, reportId } = await functionService.createBlankReport(currentUser.id); // Fonction Edge à créer
    if (!success) {
        displayMessage(etudiantUI.modelSelectionSection, 'error', `Erreur: ${message}`);
    } else {
        displayMessage(etudiantUI.modelSelectionSection, 'success', 'Rapport vierge créé !');
        window.location.href = `/pages/etudiant/rapport.html?id=${reportId}`;
    }
    setButtonLoading(etudiantUI.createBlankReportBtn, false);
}

async function handleSaveDraft() {
    setButtonLoading(etudiantUI.saveDraftBtn, true);
    const reportId = etudiantUI.reportIdHidden.value;
    const metadonnees = {
        libelle_rapport_etudiant: etudiantUI.reportTitleInput.value,
        theme: etudiantUI.reportThemeInput.value,
        nombre_pages: parseInt(etudiantUI.reportPagesInput.value) || 0,
        resume: tinymce.get('report-resume-editor').getContent(),
        date_derniere_modif: new Date().toISOString(),
    };

    const sections = {};
    etudiantUI.reportSectionsContainer.querySelectorAll('.report-section-item').forEach(item => {
        const title = item.querySelector('.section-title').textContent;
        const editorId = item.querySelector('textarea').id;
        sections[title] = tinymce.get(editorId).getContent();
    });

    // Sauvegarder le brouillon (via fonction Edge pour la complexité)
    const { success, message } = await functionService.saveReportDraft(reportId, currentUser.id, metadonnees, sections); // Fonction Edge à créer

    if (!success) {
        displayMessage(etudiantUI.reportEditorSection, 'error', `Erreur de sauvegarde: ${message}`);
    } else {
        displayMessage(etudiantUI.reportEditorSection, 'success', 'Brouillon sauvegardé avec succès !');
    }
    setButtonLoading(etudiantUI.saveDraftBtn, false);
}

async function handleSubmitReport(e) {
    e.preventDefault();
    const submitter = e.submitter; // Le bouton qui a déclenché la soumission
    setButtonLoading(submitter, true);

    const reportId = etudiantUI.reportIdHidden.value;
    const isCorrectionSubmission = submitter.id === 'submit-corrections-btn';
    const noteExplicative = isCorrectionSubmission ? etudiantUI.correctionNoteInput.value : '';

    if (isCorrectionSubmission && !noteExplicative.trim()) {
        displayMessage(etudiantUI.reportEditorSection, 'error', 'Une note explicative est obligatoire pour soumettre les corrections.');
        setButtonLoading(submitter, false);
        return;
    }

    const metadonnees = {
        libelle_rapport_etudiant: etudiantUI.reportTitleInput.value,
        theme: etudiantUI.reportThemeInput.value,
        nombre_pages: parseInt(etudiantUI.reportPagesInput.value) || 0,
        resume: tinymce.get('report-resume-editor').getContent(),
        date_soumission: new Date().toISOString(), // Mettre à jour la date de soumission
        date_derniere_modif: new Date().toISOString(),
    };

    const sections = {};
    etudiantUI.reportSectionsContainer.querySelectorAll('.report-section-item').forEach(item => {
        const title = item.querySelector('.section-title').textContent;
        const editorId = item.querySelector('textarea').id;
        sections[title] = tinymce.get(editorId).getContent();
    });

    let result;
    if (isCorrectionSubmission) {
        result = await functionService.submitReportCorrections(reportId, currentUser.id, metadonnees, sections, noteExplicative); // Fonction Edge
    } else {
        result = await functionService.submitReport(reportId, currentUser.id, metadonnees, sections); // Fonction Edge
    }

    if (!result.success) {
        displayMessage(etudiantUI.reportEditorSection, 'error', `Erreur de soumission: ${result.message}`);
    } else {
        displayMessage(document.getElementById('global-flash-messages'), 'success', 'Rapport soumis avec succès !');
        window.location.href = '/pages/etudiant/dashboard.html'; // Rediriger après soumission
    }
    setButtonLoading(submitter, false);
}

// --- GESTION DU PROFIL ---
async function loadProfilPage() {
    if (!hasPermission('TRAIT_ETUDIANT_PROFIL_GERER')) {
        displayMessage(document.getElementById('global-flash-messages'), 'error', 'Accès refusé à la gestion du profil.');
        window.location.href = '/pages/etudiant/dashboard.html';
        return;
    }

    await loadProfileData();
    setupProfilEventListeners();
}

async function loadProfileData() {
    const { data: user, error: userError } = await dataService.getRecordById(TABLES.UTILISATEUR, currentUser.id);
    const { data: etudiantProfile, error: etudiantError } = await dataService.getRecordById(TABLES.ETUDIANT, currentUser.id);

    if (userError || etudiantError) {
        displayMessage(document.getElementById('global-flash-messages'), 'error', 'Erreur de chargement des données de profil.');
        console.error("Error loading profile data:", userError, etudiantError);
        return;
    }

    // Afficher les données non éditables
    document.getElementById('display-nom').textContent = etudiantProfile.nom;
    document.getElementById('display-prenom').textContent = etudiantProfile.prenom;
    document.getElementById('detail-matricule').textContent = etudiantProfile.numero_carte_etudiant; // Si cette ID est utilisée
    document.getElementById('detail-email').textContent = user.email_principal;
    document.getElementById('detail-dob').textContent = etudiantProfile.date_naissance ? formatDate(etudiantProfile.date_naissance) : 'N/A';

    // Remplir le formulaire d'informations personnelles
    fillForm(etudiantUI.personalInfoForm, etudiantProfile);

    // Afficher la photo de profil
    if (user.photo_profil) {
        etudiantUI.profilePictureDisplay.src = supabase.storage.from(STORAGE_BUCKETS.PROFILE_PICTURES).getPublicUrl(user.photo_profil).data.publicUrl;
    } else {
        etudiantUI.profilePictureDisplay.src = '/assets/images/default-avatar.png';
    }

    // Afficher le statut 2FA
    if (user.preferences_2fa_active) {
        etudiantUI.twoFaStatusDisplay.textContent = 'Activé';
        etudiantUI.twoFaStatusDisplay.classList.add('status-badge-success');
        etudiantUI.enable2FaBtn.classList.add('hidden');
        etudiantUI.disable2FaBtn.classList.remove('hidden');
    } else {
        etudiantUI.twoFaStatusDisplay.textContent = 'Désactivé';
        etudiantUI.twoFaStatusDisplay.classList.add('status-badge-danger');
        etudiantUI.enable2FaBtn.classList.remove('hidden');
        etudiantUI.disable2FaBtn.classList.add('hidden');
    }
}

function setupProfilEventListeners() {
    etudiantUI.profilePictureInput.addEventListener('change', () => {
        if (etudiantUI.profilePictureInput.files.length > 0) {
            etudiantUI.uploadPhotoBtn.classList.remove('hidden');
        } else {
            etudiantUI.uploadPhotoBtn.classList.add('hidden');
        }
    });
    etudiantUI.profilePictureForm.addEventListener('submit', handleProfilePictureUpload);
    etudiantUI.personalInfoForm.addEventListener('submit', handlePersonalInfoSubmit);
    etudiantUI.changePasswordForm.addEventListener('submit', handleChangePasswordSubmit);
    etudiantUI.enable2FaBtn.addEventListener('click', handleEnable2Fa);
    etudiantUI.disable2FaBtn.addEventListener('click', handleDisable2Fa);
    etudiantUI.twoFaVerifyForm.addEventListener('submit', handle2FaVerifySubmit);
}

async function handleProfilePictureUpload(e) {
    e.preventDefault();
    setButtonLoading(etudiantUI.uploadPhotoBtn, true);

    const file = etudiantUI.profilePictureInput.files[0];
    if (!file) {
        displayMessage(document.getElementById('global-flash-messages'), 'error', 'Veuillez sélectionner une image.');
        setButtonLoading(etudiantUI.uploadPhotoBtn, false);
        return;
    }

    const filePath = `${currentUser.id}/profile_picture_${Date.now()}.${file.name.split('.').pop()}`;
    const { data, error } = await supabase.storage.from(STORAGE_BUCKETS.PROFILE_PICTURES).upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
    });

    if (error) {
        displayMessage(document.getElementById('global-flash-messages'), 'error', `Erreur d'upload: ${error.message}`);
    } else {
        // Mettre à jour le chemin dans la table utilisateur
        const { error: updateError } = await dataService.updateRecord(TABLES.UTILISATEUR, currentUser.id, { photo_profil: data.path });
        if (updateError) {
            displayMessage(document.getElementById('global-flash-messages'), 'error', `Erreur de mise à jour DB: ${updateError.message}`);
        } else {
            displayMessage(document.getElementById('global-flash-messages'), 'success', 'Photo de profil mise à jour.');
            etudiantUI.profilePictureDisplay.src = supabase.storage.from(STORAGE_BUCKETS.PROFILE_PICTURES).getPublicUrl(data.path).data.publicUrl;
            etudiantUI.uploadPhotoBtn.classList.add('hidden');
        }
    }
    setButtonLoading(etudiantUI.uploadPhotoBtn, false);
}

async function handlePersonalInfoSubmit(e) {
    e.preventDefault();
    setButtonLoading(e.submitter, true);
    const formData = getFormData(etudiantUI.personalInfoForm);

    // Mettre à jour les champs spécifiques à l'entité 'etudiant'
    const { error } = await dataService.updateRecord(TABLES.ETUDIANT, currentUser.id, formData);

    if (error) {
        displayMessage(document.getElementById('global-flash-messages'), 'error', `Erreur de mise à jour: ${error.message}`);
    } else {
        displayMessage(document.getElementById('global-flash-messages'), 'success', 'Informations personnelles sauvegardées.');
    }
    setButtonLoading(e.submitter, false);
}

async function handleChangePasswordSubmit(e) {
    e.preventDefault();
    setButtonLoading(e.submitter, true);
    const currentPassword = etudiantUI.currentPasswordInput.value;
    const newPassword = etudiantUI.newPasswordInput.value;
    const confirmNewPassword = etudiantUI.confirmNewPasswordInput.value;

    if (newPassword !== confirmNewPassword) {
        displayMessage(document.getElementById('global-flash-messages'), 'error', 'Les nouveaux mots de passe ne correspondent pas.');
        setButtonLoading(e.submitter, false);
        return;
    }

    // La validation de robustesse du mot de passe devrait être faite ici aussi
    // (min length, maj, min, chiffre)

    const { error } = await authService.updatePassword(newPassword, currentPassword);

    if (error) {
        displayMessage(document.getElementById('global-flash-messages'), 'error', `Erreur: ${error.message}`);
    } else {
        displayMessage(document.getElementById('global-flash-messages'), 'success', 'Mot de passe changé avec succès.');
        etudiantUI.changePasswordForm.reset();
    }
    setButtonLoading(e.submitter, false);
}

async function handleEnable2Fa() {
    setButtonLoading(etudiantUI.enable2FaBtn, true);
    // Appeler une fonction Edge pour générer le secret 2FA et le QR code
    const { data, error } = await functionService.generate2FaSecret(currentUser.id); // Fonction Edge à créer
    if (error) {
        displayMessage(document.getElementById('global-flash-messages'), 'error', `Erreur 2FA: ${error.message}`);
    } else {
        etudiantUI.qrCodeDisplay.src = data.qrCodeUrl;
        etudiantUI.secretKeyDisplay.textContent = data.secret;
        openModal(etudiantUI.twoFaSetupModal);
    }
    setButtonLoading(etudiantUI.enable2FaBtn, false);
}

async function handle2FaVerifySubmit(e) {
    e.preventDefault();
    setButtonLoading(e.submitter, true);
    const totpCode = etudiantUI.twoFaCodeInput.value;

    const { error } = await authService.verify2Fa(totpCode); // Fonction dans auth-service.js

    if (error) {
        displayMessage(document.getElementById('global-flash-messages'), 'error', `Code 2FA incorrect: ${error.message}`);
    } else {
        displayMessage(document.getElementById('global-flash-messages'), 'success', '2FA activée avec succès !');
        closeModal(etudiantUI.twoFaSetupModal);
        loadProfileData(); // Recharger le statut 2FA
    }
    setButtonLoading(e.submitter, false);
}

async function handleDisable2Fa() {
    setButtonLoading(etudiantUI.disable2FaBtn, true);
    // Demander le mot de passe actuel pour désactiver la 2FA
    const password = prompt("Veuillez entrer votre mot de passe actuel pour désactiver la 2FA:");
    if (!password) {
        setButtonLoading(etudiantUI.disable2FaBtn, false);
        return;
    }

    const { error } = await authService.disable2Fa(password); // Fonction dans auth-service.js

    if (error) {
        displayMessage(document.getElementById('global-flash-messages'), 'error', `Erreur: ${error.message}`);
    } else {
        displayMessage(document.getElementById('global-flash-messages'), 'success', '2FA désactivée.');
        loadProfileData(); // Recharger le statut 2FA
    }
    setButtonLoading(etudiantUI.disable2FaBtn, false);
}