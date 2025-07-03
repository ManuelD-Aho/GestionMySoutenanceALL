// /assets/js/pages/admin.js

import { dataService } from '../services/data-service.js';
import { authService } from '../services/auth-service.js';
import { functionService } from '../services/function-service.js';
import { displayMessage, setButtonLoading, generateUniqueId, formatDate, openModal, closeModal, fillForm, getFormData, validateForm } from '../utils/helpers.js';
import { ROLES, TABLES, USER_TYPES, ID_PREFIXES, REPORT_STATUS, DOCUMENT_TYPES } from '../utils/constants.js';

let currentUser = null;
let userPermissions = [];
let currentReferentialTable = null; // Pour la gestion des référentiels

// --- ÉLÉMENTS DU DOM SPÉCIFIQUES À ADMIN ---
const adminUI = {
    // Dashboard
    stats: {
        totalUsers: document.getElementById('stat-total-users'),
        activeUsers: document.getElementById('stat-active-users'),
        blockedUsers: document.getElementById('stat-blocked-users'),
        submittedReports: document.getElementById('stat-submitted-reports'),
        inCommissionReports: document.getElementById('stat-in-commission-reports'),
        validatedReports: document.getElementById('stat-validated-reports'),
        pendingTasks: document.getElementById('stat-pending-tasks'),
        failedTasks: document.getElementById('stat-failed-tasks'),
        openReclamations: document.getElementById('stat-open-reclamations'),
        inProgressReclamations: document.getElementById('stat-in-progress-reclamations'),
    },
    charts: {
        reportsStatusChartCtx: document.getElementById('reportsStatusChart')?.getContext('2d'),
        recentActivityChartCtx: document.getElementById('recentActivityChart')?.getContext('2d'),
    },
    systemAlertsList: document.getElementById('system-alerts-list'),

    // Utilisateurs
    userListBody: document.getElementById('user-list-body'),
    searchUsersInput: document.getElementById('search-users'),
    filterRoleSelect: document.getElementById('filter-role'),
    filterStatusSelect: document.getElementById('filter-status'),
    addUserBtn: document.getElementById('add-user-btn'),
    userModal: document.getElementById('user-modal'),
    userModalTitle: document.getElementById('user-modal-title'),
    userForm: document.getElementById('user-form'),
    userModalCancelBtn: document.getElementById('user-modal-cancel'),
    userModalSubmitBtn: document.getElementById('user-modal-submit'),
    userRowTemplate: document.getElementById('user-row-template'),

    // Configuration
    configTabs: document.querySelectorAll('.tabs-container .tab'),
    configTabContents: document.querySelectorAll('.tabs-container .tab-content'),
    generalParamsForm: document.getElementById('general-params-form'),
    academicYearsList: document.getElementById('academic-years-list'),
    addAcademicYearForm: document.getElementById('add-academic-year-form'),
    academicYearModal: document.getElementById('academic-year-modal'),
    editAcademicYearForm: document.getElementById('edit-academic-year-form'),
    selectReferential: document.getElementById('select-referential'),
    referentialDetailsPanel: document.getElementById('referential-details-panel'),
    referentialEntryModal: document.getElementById('referential-entry-modal'),
    referentialEntryModalTitle: document.getElementById('referential-entry-modal-title'),
    referentialEntryForm: document.getElementById('referential-entry-form'),
    dynamicReferentialFields: document.getElementById('dynamic-referential-fields'),
    referentialEntryRowTemplate: document.getElementById('referential-entry-row-template'),
    documentModelsList: document.getElementById('document-models-list'),
    addDocumentModelBtn: document.getElementById('add-document-model-btn'),
    importDocumentModelBtn: document.getElementById('import-document-model-btn'),
    documentModelModal: document.getElementById('document-model-modal'),
    documentModelForm: document.getElementById('doc-model-form'),
    importDocModelModal: document.getElementById('import-doc-model-modal'),
    importDocModelForm: document.getElementById('import-doc-model-form'),
    notificationTemplatesList: document.getElementById('notification-templates-list'),
    notificationRulesList: document.getElementById('notification-rules-list'),
    notificationTemplateModal: document.getElementById('notification-template-modal'),
    notificationTemplateForm: document.getElementById('notif-template-form'),
    notificationRuleModal: document.getElementById('notification-rule-modal'),
    notificationRuleForm: document.getElementById('notif-rule-form'),
    menuTree: document.getElementById('menu-tree'),
    saveMenuOrderBtn: document.getElementById('save-menu-order-btn'),
    menuItemTemplate: document.getElementById('menu-item-template'),
};

// --- INITIALISATION DE LA PAGE ADMIN ---
export async function initPage(user, permissions) {
    currentUser = user;
    userPermissions = permissions;

    // Vérifier les permissions spécifiques à l'admin
    if (!hasPermission('TRAIT_ADMIN_DASHBOARD_ACCEDER') && !hasPermission('TRAIT_ADMIN_GERER_UTILISATEURS_LISTER') && !hasPermission('TRAIT_ADMIN_CONFIG_ACCEDER')) {
        window.location.href = '/pages/etudiant/dashboard.html'; // Rediriger vers un dashboard par défaut si pas admin
        return;
    }

    const currentPath = window.location.pathname;
    if (currentPath.includes('dashboard.html')) {
        await loadAdminDashboard();
    } else if (currentPath.includes('utilisateurs.html')) {
        await loadUserManagement();
    } else if (currentPath.includes('configuration.html')) {
        await loadConfigurationPage();
    }
    // ... autres pages admin
}

// --- DASHBOARD ADMIN ---
async function loadAdminDashboard() {
    if (!hasPermission('TRAIT_ADMIN_DASHBOARD_ACCEDER')) {
        displayMessage(document.getElementById('global-flash-messages'), 'error', 'Accès refusé à ce tableau de bord.');
        window.location.href = '/pages/etudiant/dashboard.html'; // Ou une page d'erreur 403
        return;
    }

    // Simuler la récupération des statistiques
    const stats = {
        users: { total: 1000, actif: 800, bloque: 20, inactif: 180 },
        reports: { soumis: 50, en_commission: 15, valid: 300, non_conf: 5 },
        queue: { pending: 10, failed: 2 },
        reclamations: { ouverte: 5, en_cours: 3 },
        activity: { 'SUCCES_LOGIN': 150, 'SOUMISSION_RAPPORT': 20, 'APPROBATION_PV': 10 }
    };

    adminUI.stats.totalUsers.textContent = stats.users.total;
    adminUI.stats.activeUsers.textContent = stats.users.actif;
    adminUI.stats.blockedUsers.textContent = stats.users.bloque;
    adminUI.stats.submittedReports.textContent = stats.reports.soumis;
    adminUI.stats.inCommissionReports.textContent = stats.reports.en_commission;
    adminUI.stats.validatedReports.textContent = stats.reports.valid;
    adminUI.stats.pendingTasks.textContent = stats.queue.pending;
    adminUI.stats.failedTasks.textContent = stats.queue.failed;
    adminUI.stats.openReclamations.textContent = stats.reclamations.ouverte;
    adminUI.stats.inProgressReclamations.textContent = stats.reclamations.en_cours;

    // Graphiques (exemple avec Chart.js)
    if (adminUI.charts.reportsStatusChartCtx) {
        new Chart(adminUI.charts.reportsStatusChartCtx, {
            type: 'pie',
            data: {
                labels: ['Soumis', 'En Commission', 'Validés', 'Non Conformes'],
                datasets: [{
                    data: [stats.reports.soumis, stats.reports.en_commission, stats.reports.valid, stats.reports.non_conf],
                    backgroundColor: ['#FFC857', '#1A5E63', '#27ae60', '#e74c3c'],
                }]
            }
        });
    }
    if (adminUI.charts.recentActivityChartCtx) {
        new Chart(adminUI.charts.recentActivityChartCtx, {
            type: 'bar',
            data: {
                labels: Object.keys(stats.activity),
                datasets: [{
                    label: 'Nombre d\'actions',
                    data: Object.values(stats.activity),
                    backgroundColor: '#3498db',
                }]
            }
        });
    }

    // Alertes système
    if (stats.queue.failed > 0) {
        adminUI.systemAlertsList.innerHTML = `
            <div class="alert alert-error">
                <i class="fas fa-exclamation-circle"></i>
                <span>Attention: ${stats.queue.failed} tâches asynchrones ont échoué. Vérifiez la supervision.</span>
            </div>
        `;
    }
}

// --- GESTION DES UTILISATEURS ---
async function loadUserManagement() {
    if (!hasPermission('TRAIT_ADMIN_GERER_UTILISATEURS_LISTER')) {
        displayMessage(document.getElementById('global-flash-messages'), 'error', 'Accès refusé à la gestion des utilisateurs.');
        window.location.href = '/pages/etudiant/dashboard.html';
        return;
    }

    await populateUserFilters();
    await fetchAndDisplayUsers();
    setupUserManagementEventListeners();
}

async function populateUserFilters() {
    const { data: roles, error: rolesError } = await dataService.getRecords(TABLES.GROUPE_UTILISATEUR);
    if (!rolesError) {
        roles.forEach(role => {
            const option = document.createElement('option');
            option.value = role.id_groupe_utilisateur;
            option.textContent = role.libelle_groupe_utilisateur;
            adminUI.filterRoleSelect.appendChild(option);
        });
    }
}

async function fetchAndDisplayUsers(filters = {}) {
    adminUI.userListBody.innerHTML = '<tr><td colspan="7" class="text-center">Chargement...</td></tr>';
    const { data: users, error } = await dataService.getRecords(TABLES.UTILISATEUR); // Simplifié, devrait joindre les profils métier
    if (error) {
        displayMessage(adminUI.userListBody.parentElement, 'error', 'Erreur lors du chargement des utilisateurs.');
        adminUI.userListBody.innerHTML = '<tr><td colspan="7" class="text-center">Erreur de chargement.</td></tr>';
        console.error("Error fetching users:", error);
        return;
    }

    adminUI.userListBody.innerHTML = '';
    if (users.length === 0) {
        adminUI.userListBody.innerHTML = '<tr><td colspan="7" class="text-center">Aucun utilisateur trouvé.</td></tr>';
        return;
    }

    for (const user of users) {
        const row = adminUI.userRowTemplate.content.cloneNode(true);
        // Simuler la récupération du nom/prénom complet (en vrai, via jointure ou fonction Edge)
        const profile = await getUserProfile(user.numero_utilisateur, user.id_type_utilisateur);

        row.querySelector('.user-full-name').textContent = `${profile?.prenom || ''} ${profile?.nom || ''}`;
        row.querySelector('.user-email').textContent = user.email_principal;
        row.querySelector('.user-login').textContent = user.login_utilisateur;
        row.querySelector('.user-role-label').textContent = user.id_groupe_utilisateur; // Afficher le libellé du rôle
        row.querySelector('.user-status').textContent = user.statut_compte;
        row.querySelector('.user-last-login').textContent = user.derniere_connexion ? formatDate(user.derniere_connexion) : 'N/A';

        const actionsCell = row.querySelector('.user-actions');
        actionsCell.querySelector('.edit-user-btn').dataset.userId = user.numero_utilisateur;
        actionsCell.querySelector('.delete-user-btn').dataset.userId = user.numero_utilisateur;
        actionsCell.querySelector('.impersonate-user-btn').dataset.userId = user.numero_utilisateur;

        // Gérer la visibilité des boutons d'action selon les permissions
        if (!hasPermission('TRAIT_ADMIN_GERER_UTILISATEURS_MODIFIER')) {
            actionsCell.querySelector('.edit-user-btn').style.display = 'none';
        }
        if (!hasPermission('TRAIT_ADMIN_GERER_UTILISATEURS_DELETE')) {
            actionsCell.querySelector('.delete-user-btn').style.display = 'none';
        }
        if (!hasPermission('TRAIT_ADMIN_IMPERSONATE_USER')) {
            actionsCell.querySelector('.impersonate-user-btn').style.display = 'none';
        }

        adminUI.userListBody.appendChild(row);
    }
}

async function getUserProfile(userId, userType) {
    let tableName;
    switch (userType) {
        case USER_TYPES.ETUD: tableName = TABLES.ETUDIANT; break;
        case USER_TYPES.ENS: tableName = TABLES.ENSEIGNANT; break;
        case USER_TYPES.PERS_ADMIN: tableName = TABLES.PERSONNEL_ADMINISTRATIF; break;
        default: return { nom: 'N/A', prenom: 'N/A' };
    }
    const { data, error } = await dataService.getRecordById(tableName, userId);
    if (error) {
        console.error(`Error fetching profile for ${userId} (${userType}):`, error);
        return null;
    }
    return data;
}

function setupUserManagementEventListeners() {
    adminUI.searchUsersInput.addEventListener('input', () => applyUserFilters());
    adminUI.filterRoleSelect.addEventListener('change', () => applyUserFilters());
    adminUI.filterStatusSelect.addEventListener('change', () => applyUserFilters());

    adminUI.addUserBtn.addEventListener('click', () => openUserModal('create'));

    adminUI.userListBody.addEventListener('click', (e) => {
        const target = e.target.closest('button');
        if (!target) return;

        const userId = target.dataset.userId;

        if (target.classList.contains('edit-user-btn')) {
            openUserModal('edit', userId);
        } else if (target.classList.contains('delete-user-btn')) {
            confirmAction('Supprimer Utilisateur', `Êtes-vous sûr de vouloir supprimer l'utilisateur ${userId} ? Cette action est irréversible.`, async () => {
                // En réalité, la suppression d'entités liées devrait être gérée par une fonction Edge
                // pour vérifier les dépendances et supprimer en cascade si autorisé.
                const { error } = await dataService.deleteRecord(TABLES.UTILISATEUR, userId);
                if (error) {
                    displayMessage(adminUI.feedbackContainer, 'error', `Erreur lors de la suppression: ${error.message}`);
                } else {
                    displayMessage(adminUI.feedbackContainer, 'success', `Utilisateur ${userId} supprimé.`);
                    fetchAndDisplayUsers();
                }
            });
        } else if (target.classList.contains('impersonate-user-btn')) {
            confirmAction('Impersonnaliser Utilisateur', `Voulez-vous vraiment vous connecter en tant que ${userId} ?`, async () => {
                // L'impersonation est une opération sensible, elle devrait être gérée par une fonction Edge
                // qui génère un token de session pour l'utilisateur cible avec les privilèges admin.
                // Pour l'exemple, nous allons simuler une redirection.
                displayMessage(adminUI.feedbackContainer, 'info', `Impersonnalisation de ${userId} (simulée).`);
                // window.location.href = `/pages/etudiant/dashboard.html?impersonate=${userId}`; // Exemple de redirection
            });
        }
    });

    adminUI.userForm.addEventListener('submit', handleUserFormSubmit);
    adminUI.userModalCancelBtn.addEventListener('click', () => closeModal(adminUI.userModal));
}

function applyUserFilters() {
    const filters = {};
    if (adminUI.searchUsersInput.value) filters.search = adminUI.searchUsersInput.value;
    if (adminUI.filterRoleSelect.value) filters.id_groupe_utilisateur = adminUI.filterRoleSelect.value;
    if (adminUI.filterStatusSelect.value) filters.statut_compte = adminUI.filterStatusSelect.value;
    fetchAndDisplayUsers(filters);
}

async function openUserModal(mode, userId = null) {
    adminUI.userForm.reset();
    adminUI.userForm.querySelector('#form-password').required = (mode === 'create');
    adminUI.userForm.querySelector('#user-id-hidden').value = '';
    adminUI.userModalTitle.textContent = mode === 'create' ? 'Ajouter un nouvel utilisateur' : 'Modifier utilisateur';
    setButtonLoading(adminUI.userModalSubmitBtn, false);

    // Charger les options des selects
    const { data: roles, error: rolesError } = await dataService.getRecords(TABLES.GROUPE_UTILISATEUR);
    const { data: types, error: typesError } = await dataService.getRecords(TABLES.TYPE_UTILISATEUR);
    const { data: accessLevels, error: accessLevelsError } = await dataService.getRecords(TABLES.NIVEAU_ACCES_DONNE);

    if (rolesError || typesError || accessLevelsError) {
        displayMessage(adminUI.feedbackContainer, 'error', 'Erreur de chargement des options de formulaire.');
        return;
    }

    adminUI.filterRoleSelect.innerHTML = '<option value="">-- Choisir --</option>';
    roles.forEach(r => {
        const opt = document.createElement('option'); opt.value = r.id_groupe_utilisateur; opt.textContent = r.libelle_groupe_utilisateur; adminUI.filterRoleSelect.appendChild(opt);
    });
    adminUI.userForm.querySelector('#form-role').innerHTML = adminUI.filterRoleSelect.innerHTML;

    adminUI.userForm.querySelector('#form-type').innerHTML = '<option value="">-- Choisir --</option>';
    types.forEach(t => {
        const opt = document.createElement('option'); opt.value = t.id_type_utilisateur; opt.textContent = t.libelle_type_utilisateur; adminUI.userForm.querySelector('#form-type').appendChild(opt);
    });

    adminUI.userForm.querySelector('#form-access-level').innerHTML = '<option value="">-- Choisir --</option>';
    accessLevels.forEach(al => {
        const opt = document.createElement('option'); opt.value = al.id_niveau_acces_donne; opt.textContent = al.libelle_niveau_acces_donne; adminUI.userForm.querySelector('#form-access-level').appendChild(opt);
    });

    if (mode === 'edit' && userId) {
        const { data: user, error } = await dataService.getRecordById(TABLES.UTILISATEUR, userId);
        if (error) {
            displayMessage(adminUI.feedbackContainer, 'error', 'Utilisateur non trouvé pour modification.');
            return;
        }
        // Remplir le formulaire avec les données de l'utilisateur
        fillForm(adminUI.userForm, user);
        adminUI.userForm.querySelector('#user-id-hidden').value = userId;
        // Cacher le champ mot de passe si c'est une modification et qu'il n'est pas requis
        adminUI.userForm.querySelector('#form-password').required = false;
    }

    openModal(adminUI.userModal);
}

async function handleUserFormSubmit(e) {
    e.preventDefault();
    if (!validateForm(adminUI.userForm)) {
        displayMessage(adminUI.feedbackContainer, 'error', 'Veuillez remplir tous les champs requis.');
        return;
    }

    setButtonLoading(adminUI.userModalSubmitBtn, true);
    const formData = getFormData(adminUI.userForm);
    const userId = formData.numero_utilisateur;
    let result;

    // Séparer les données du profil métier des données du compte utilisateur
    const userData = {
        login_utilisateur: formData.login_utilisateur,
        email_principal: formData.email_principal,
        id_groupe_utilisateur: formData.id_groupe_utilisateur,
        id_type_utilisateur: formData.id_type_utilisateur,
        id_niveau_acces_donne: formData.id_niveau_acces_donne,
        statut_compte: formData.statut_compte,
    };
    if (formData.mot_de_passe) {
        userData.mot_de_passe = formData.mot_de_passe; // Supabase Auth hash automatiquement
    }

    const profileData = {
        nom: formData.nom,
        prenom: formData.prenom,
        // ... autres champs de profil spécifiques (date_naissance, telephone, etc.)
    };

    if (userId) { // Modification
        // Mettre à jour l'utilisateur dans Supabase Auth (si email/password changent)
        if (userData.email_principal !== currentUser.email || userData.mot_de_passe) {
            const { error: authError } = await authService.updateUser(userData.email_principal, userData.mot_de_passe);
            if (authError) {
                displayMessage(adminUI.feedbackContainer, 'error', `Erreur Auth Supabase: ${authError.message}`);
                setButtonLoading(adminUI.userModalSubmitBtn, false);
                return;
            }
        }
        // Mettre à jour le record dans la table 'utilisateur'
        result = await dataService.updateRecord(TABLES.UTILISATEUR, userId, userData);
        // Mettre à jour le record dans la table de profil métier (etudiant, enseignant, personnel_administratif)
        const profileTable = getProfileTableName(formData.id_type_utilisateur);
        if (profileTable) {
            await dataService.updateRecord(profileTable, userId, profileData);
        }
    } else { // Création
        // Créer l'utilisateur dans Supabase Auth
        const { data: authData, error: authError } = await authService.signUp(userData.email_principal, userData.mot_de_passe);
        if (authError) {
            displayMessage(adminUI.feedbackContainer, 'error', `Erreur Auth Supabase: ${authError.message}`);
            setButtonLoading(adminUI.userModalSubmitBtn, false);
            return;
        }
        // L'ID de l'utilisateur Supabase Auth est l'ID principal pour nos tables
        const newUserId = authData.user.id;
        userData.numero_utilisateur = newUserId; // Lier l'ID Supabase Auth à notre PK
        userData.email_valide = authData.user.email_confirmed_at ? true : false; // Dépend de la config Supabase
        userData.statut_compte = 'en_attente_validation'; // Ou 'actif' si auto-confirmé

        // Créer le record dans la table 'utilisateur'
        result = await dataService.createRecord(TABLES.UTILISATEUR, userData);
        // Créer le record dans la table de profil métier
        const profileTable = getProfileTableName(formData.id_type_utilisateur);
        if (profileTable) {
            profileData[getProfilePrimaryKey(profileTable)] = newUserId; // Assigner la PK
            profileData.numero_utilisateur = newUserId; // Lier au compte utilisateur
            await dataService.createRecord(profileTable, profileData);
        }
    }

    if (result.error) {
        displayMessage(adminUI.feedbackContainer, 'error', `Erreur: ${result.error.message}`);
    } else {
        displayMessage(adminUI.feedbackContainer, 'success', `Utilisateur ${userId ? 'mis à jour' : 'créé'} avec succès.`);
        closeModal(adminUI.userModal);
        fetchAndDisplayUsers();
    }
    setButtonLoading(adminUI.userModalSubmitBtn, false);
}

function getProfileTableName(userType) {
    switch (userType) {
        case USER_TYPES.ETUD: return TABLES.ETUDIANT;
        case USER_TYPES.ENS: return TABLES.ENSEIGNANT;
        case USER_TYPES.PERS_ADMIN: return TABLES.PERSONNEL_ADMINISTRATIF;
        default: return null;
    }
}

function getProfilePrimaryKey(profileTable) {
    switch (profileTable) {
        case TABLES.ETUDIANT: return 'numero_carte_etudiant';
        case TABLES.ENSEIGNANT: return 'numero_enseignant';
        case TABLES.PERSONNEL_ADMINISTRATIF: return 'numero_personnel_administratif';
        default: return null;
    }
}

// --- GESTION DE LA CONFIGURATION ---
async function loadConfigurationPage() {
    if (!hasPermission('TRAIT_ADMIN_CONFIG_ACCEDER')) {
        displayMessage(document.getElementById('global-flash-messages'), 'error', 'Accès refusé à la configuration.');
        window.location.href = '/pages/etudiant/dashboard.html';
        return;
    }

    setupConfigTabs();
    await loadGeneralParameters();
    await loadAcademicYears();
    await populateReferentialSelect();
    await loadDocumentModels();
    await loadNotificationSettings();
    await loadMenuOrder();
    setupConfigurationEventListeners();
}

function setupConfigTabs() {
    adminUI.configTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            adminUI.configTabs.forEach(t => t.classList.remove('tab-active'));
            adminUI.configTabContents.forEach(tc => tc.classList.remove('active'));
            tab.classList.add('tab-active');
            document.getElementById(`tab-content-${tab.dataset.tab}`).classList.add('active');
        });
    });
}

async function loadGeneralParameters() {
    const { data: params, error } = await dataService.getRecords(TABLES.PARAMETRES_SYSTEME);
    if (error) {
        displayMessage(adminUI.feedbackContainer, 'error', 'Erreur de chargement des paramètres généraux.');
        return;
    }
    params.forEach(p => {
        const input = adminUI.generalParamsForm.querySelector(`[name="${p.cle}"]`);
        if (input) {
            if (input.type === 'checkbox') {
                input.checked = p.valeur === '1';
            } else {
                input.value = p.valeur;
            }
        }
    });
}

async function loadAcademicYears() {
    const { data: years, error } = await dataService.getRecords(TABLES.ANNEE_ACADEMIQUE, {}, 'date_debut DESC');
    if (error) {
        displayMessage(adminUI.feedbackContainer, 'error', 'Erreur de chargement des années académiques.');
        return;
    }
    adminUI.academicYearsList.innerHTML = '';
    years.forEach(year => {
        const row = adminUI.academicYearTemplate.content.cloneNode(true);
        row.querySelector('.year-libelle').textContent = year.libelle_annee_academique;
        row.querySelector('.year-start-date').textContent = formatDate(year.date_debut);
        row.querySelector('.year-end-date').textContent = formatDate(year.date_fin);
        row.querySelector('.year-active').textContent = year.est_active ? 'Oui' : 'Non';
        row.querySelector('.edit-year-btn').dataset.id = year.id_annee_academique;
        row.querySelector('.delete-year-btn').dataset.id = year.id_annee_academique;
        row.querySelector('.set-active-year-btn').dataset.id = year.id_annee_academique;
        adminUI.academicYearsList.appendChild(row);
    });
}

async function populateReferentialSelect() {
    const referentials = {
        'action': 'Actions', 'annee_academique': 'Années Académiques', 'critere_conformite_ref': 'Critères Conformité',
        'decision_passage_ref': 'Décisions Passage', 'decision_validation_pv_ref': 'Décisions Validation PV',
        'decision_vote_ref': 'Décisions Vote', 'ecue': 'ECUEs', 'entreprise': 'Entreprises',
        'fonction': 'Fonctions', 'grade': 'Grades', 'groupe_utilisateur': 'Groupes Utilisateurs',
        'niveau_acces_donne': 'Niveaux Accès Données', 'niveau_etude': 'Niveaux Étude',
        'notification': 'Modèles Notification', 'parametres_systeme': 'Paramètres Système',
        'rapport_modele': 'Modèles Rapport', 'rapport_modele_assignation': 'Assignation Modèles Rapport',
        'rapport_modele_section': 'Sections Modèles Rapport', 'rattacher': 'Matrice Permissions',
        'specialite': 'Spécialités', 'statut_conformite_ref': 'Statuts Conformité', 'statut_jury': 'Statuts Jury',
        'statut_paiement_ref': 'Statuts Paiement', 'statut_penalite_ref': 'Statuts Pénalité',
        'statut_pv_ref': 'Statuts PV', 'statut_rapport_ref': 'Statuts Rapport',
        'statut_reclamation_ref': 'Statuts Réclamation', 'traitement': 'Traitements',
        'type_document_ref': 'Types Document', 'type_utilisateur': 'Types Utilisateur', 'ue': 'UEs'
    };
    for (const key in referentials) {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = referentials[key];
        adminUI.selectReferential.appendChild(option);
    }
}

async function loadReferentialDetails(tableName) {
    currentReferentialTable = tableName;
    const { data: entries, error } = await dataService.getRecords(tableName);
    if (error) {
        displayMessage(adminUI.feedbackContainer, 'error', `Erreur de chargement du référentiel ${tableName}.`);
        adminUI.referentialDetailsPanel.innerHTML = `<p class="text-center text-error">Erreur de chargement.</p>`;
        return;
    }

    // Déterminer les champs dynamiquement (simplifié, en vrai, on aurait une map de schémas)
    let fields = [];
    if (entries.length > 0) {
        fields = Object.keys(entries[0]).filter(key => !key.startsWith('id_') || key === 'id_critere' || key === 'id_action' || key === 'id_groupe_utilisateur'); // Exclure les FKs sauf si elles sont la PK
    } else {
        // Fallback pour les tables vides, on doit connaître les champs
        if (tableName === TABLES.CRITERE_CONFORMITE_REF) fields = ['id_critere', 'libelle_critere', 'description', 'est_actif'];
        else if (tableName === TABLES.GROUPE_UTILISATEUR) fields = ['id_groupe_utilisateur', 'libelle_groupe_utilisateur'];
        // ... autres cas
    }

    let formHtml = `
        <h3 class="subsection-title">Ajouter/Modifier Entrée</h3>
        <form id="add-edit-referential-entry-form" class="form-grid">
            <input type="hidden" id="referential-entry-id-hidden" name="id">
            <input type="hidden" name="table_name" value="${tableName}">
    `;
    let tableHtml = `
        <h3 class="subsection-title mt-6">Entrées Existantes</h3>
        <div class="table-container">
            <table class="data-table">
                <thead><tr>
    `;

    fields.forEach(field => {
        formHtml += `
            <div class="form-group">
                <label for="form-ref-${field}">${capitalizeFirstLetter(field.replace(/_/g, ' '))}</label>
                <input type="${field.includes('date') ? 'date' : (field.includes('active') ? 'checkbox' : 'text')}" id="form-ref-${field}" name="${field}" ${field.startsWith('id_') ? 'readonly' : ''} ${field.includes('libelle') || field.includes('nom') ? 'required' : ''}>
            </div>
        `;
        tableHtml += `<th>${capitalizeFirstLetter(field.replace(/_/g, ' '))}</th>`;
    });

    formHtml += `
            <div class="form-action-buttons">
                <button type="submit" class="btn btn-primary">
                    <span class="btn-text">Enregistrer</span>
                    <span class="loading-spinner"></span>
                </button>
            </div>
        </form>
    `;
    tableHtml += `
                    <th>Actions</th>
                </tr></thead>
                <tbody id="referential-entries-list">
    `;

    entries.forEach(entry => {
        tableHtml += `<tr>`;
        fields.forEach(field => {
            let displayValue = entry[field];
            if (typeof displayValue === 'boolean') displayValue = displayValue ? 'Oui' : 'Non';
            tableHtml += `<td>${displayValue}</td>`;
        });
        tableHtml += `
            <td>
                <button class="btn btn-sm btn-secondary edit-ref-entry-btn" data-id="${entry[fields[0]]}" title="Modifier"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-danger delete-ref-entry-btn" data-id="${entry[fields[0]]}" title="Supprimer"><i class="fas fa-trash"></i></button>
            </td>
        </tr>`;
    });
    tableHtml += `</tbody></table></div>`;

    adminUI.referentialDetailsPanel.innerHTML = formHtml + tableHtml;
    adminUI.referentialDetailsPanel.querySelector('#add-edit-referential-entry-form').addEventListener('submit', handleReferentialEntrySubmit);
    adminUI.referentialDetailsPanel.querySelectorAll('.edit-ref-entry-btn').forEach(btn => btn.addEventListener('click', (e) => openReferentialEntryModal('edit', e.currentTarget.dataset.id)));
    adminUI.referentialDetailsPanel.querySelectorAll('.delete-ref-entry-btn').forEach(btn => btn.addEventListener('click', (e) => deleteReferentialEntry(e.currentTarget.dataset.id)));
}

async function loadDocumentModels() {
    const { data: models, error } = await dataService.getRecords(TABLES.RAPPORT_MODELE);
    if (error) {
        displayMessage(adminUI.feedbackContainer, 'error', 'Erreur de chargement des modèles de documents.');
        return;
    }
    adminUI.documentModelsList.innerHTML = '';
    models.forEach(model => {
        const row = adminUI.documentModelTemplate.content.cloneNode(true);
        row.querySelector('.model-name').textContent = model.nom_modele;
        row.querySelector('.model-version').textContent = model.version;
        row.querySelector('.model-status').textContent = model.statut;
        row.querySelector('.edit-model-btn').dataset.id = model.id_modele;
        row.querySelector('.delete-model-btn').dataset.id = model.id_modele;
        adminUI.documentModelsList.appendChild(row);
    });
}

async function loadNotificationSettings() {
    const { data: templates, error: templatesError } = await dataService.getRecords(TABLES.NOTIFICATION);
    const { data: rules, error: rulesError } = await dataService.getRecords(TABLES.MATRICE_NOTIFICATION_REGLES); // Joindre avec action et groupe_utilisateur si possible via Edge Function

    if (templatesError || rulesError) {
        displayMessage(adminUI.feedbackContainer, 'error', 'Erreur de chargement des paramètres de notification.');
        return;
    }

    adminUI.notificationTemplatesList.innerHTML = '';
    templates.forEach(t => {
        const row = adminUI.notificationTemplateTemplate.content.cloneNode(true);
        row.querySelector('.template-id').textContent = t.id_notification;
        row.querySelector('.template-libelle').textContent = t.libelle_notification;
        row.querySelector('.edit-template-btn').dataset.id = t.id_notification;
        adminUI.notificationTemplatesList.appendChild(row);
    });

    adminUI.notificationRulesList.innerHTML = '';
    rules.forEach(r => {
        const row = adminUI.notificationRuleTemplate.content.cloneNode(true);
        // Ces libellés devraient venir d'une jointure dans une fonction Edge
        row.querySelector('.rule-event').textContent = r.id_action_declencheur;
        row.querySelector('.rule-group').textContent = r.id_groupe_destinataire;
        row.querySelector('.rule-channel').textContent = r.canal_notification;
        row.querySelector('.rule-active').textContent = r.est_active ? 'Oui' : 'Non';
        row.querySelector('.edit-rule-btn').dataset.id = r.id_regle;
        adminUI.notificationRulesList.appendChild(row);
    });
}

async function loadMenuOrder() {
    const { data: menuItems, error } = await dataService.getRecords(TABLES.TRAITEMENT, {}, 'ordre_affichage ASC');
    if (error) {
        displayMessage(adminUI.feedbackContainer, 'error', 'Erreur de chargement de l\'ordre des menus.');
        return;
    }

    const buildTree = (items, parentId = null) => {
        const children = items.filter(item => item.id_parent_traitement === parentId);
        children.sort((a, b) => a.ordre_affichage - b.ordre_affichage);
        return children.map(item => ({
            id: item.id_traitement,
            label: item.libelle_traitement,
            icon: item.icone_class,
            order: item.ordre_affichage,
            children: buildTree(items, item.id_traitement)
        }));
    };

    const menuTreeData = buildTree(menuItems);
    renderMenuTree(menuTreeData, adminUI.menuTree);
}

function renderMenuTree(items, parentElement) {
    parentElement.innerHTML = '';
    items.forEach(item => {
        const li = adminUI.menuItemTemplate.content.cloneNode(true);
        const itemContent = li.querySelector('.menu-item-content');
        itemContent.dataset.id = item.id;
        itemContent.querySelector('.menu-item-icon').className = `menu-item-icon ${item.icon || 'fas fa-circle'}`;
        itemContent.querySelector('.menu-item-label').textContent = item.label;
        itemContent.querySelector('.menu-item-order').textContent = `(${item.order})`;

        const childrenList = li.querySelector('.menu-item-children');
        if (item.children.length > 0) {
            renderMenuTree(item.children, childrenList);
        } else {
            childrenList.remove(); // Remove empty ul
        }
        parentElement.appendChild(li);
    });
}


function setupConfigurationEventListeners() {
    adminUI.generalParamsForm.addEventListener('submit', handleGeneralParamsSubmit);
    adminUI.addAcademicYearForm.addEventListener('submit', handleAddAcademicYearSubmit);
    adminUI.academicYearsList.addEventListener('click', handleAcademicYearActions);
    adminUI.editAcademicYearForm.addEventListener('submit', handleEditAcademicYearSubmit);
    adminUI.selectReferential.addEventListener('change', (e) => loadReferentialDetails(e.target.value));
    adminUI.referentialEntryForm.addEventListener('submit', handleReferentialEntrySubmit);
    adminUI.documentModelsList.addEventListener('click', handleDocumentModelActions);
    adminUI.addDocumentModelBtn.addEventListener('click', () => openModal(adminUI.documentModelModal));
    adminUI.documentModelForm.addEventListener('submit', handleDocumentModelSubmit);
    adminUI.importDocumentModelBtn.addEventListener('click', () => openModal(adminUI.importDocModelModal));
    adminUI.importDocModelForm.addEventListener('submit', handleImportDocModelSubmit);
    adminUI.notificationTemplatesList.addEventListener('click', handleNotificationTemplateActions);
    adminUI.notificationTemplateForm.addEventListener('submit', handleNotificationTemplateSubmit);
    adminUI.notificationRulesList.addEventListener('click', handleNotificationRuleActions);
    adminUI.notificationRuleForm.addEventListener('submit', handleNotificationRuleSubmit);
    adminUI.saveMenuOrderBtn.addEventListener('click', handleSaveMenuOrder);
}

async function handleGeneralParamsSubmit(e) {
    e.preventDefault();
    if (!validateForm(adminUI.generalParamsForm)) {
        displayMessage(adminUI.feedbackContainer, 'error', 'Veuillez remplir tous les champs requis.');
        return;
    }
    setButtonLoading(e.submitter, true);
    const formData = getFormData(adminUI.generalParamsForm);
    const paramsToUpdate = Object.keys(formData).map(key => ({ cle: key, valeur: formData[key] }));

    // Supabase ne supporte pas l'upsert direct sur plusieurs lignes sans fonction Edge
    // Pour chaque paramètre, on fait un update ou un insert (si la clé n'existe pas)
    let successCount = 0;
    for (const param of paramsToUpdate) {
        const { data, error } = await dataService.updateRecord(TABLES.PARAMETRES_SYSTEME, param.cle, { valeur: param.valeur });
        if (error) {
            // Si l'update échoue (ex: clé non trouvée), on tente un insert
            if (error.code === 'PGRST200' || error.message.includes('not found')) { // Exemple de code d'erreur pour "not found"
                const { error: insertError } = await dataService.createRecord(TABLES.PARAMETRES_SYSTEME, { cle: param.cle, valeur: param.valeur, description: 'Paramètre ajouté via UI', type: 'string' });
                if (!insertError) successCount++;
            } else {
                console.error(`Erreur mise à jour paramètre ${param.cle}:`, error);
            }
        } else {
            successCount++;
        }
    }

    if (successCount === paramsToUpdate.length) {
        displayMessage(adminUI.feedbackContainer, 'success', 'Paramètres généraux mis à jour avec succès.');
    } else {
        displayMessage(adminUI.feedbackContainer, 'error', 'Certains paramètres n\'ont pas pu être mis à jour.');
    }
    setButtonLoading(e.submitter, false);
}

async function handleAddAcademicYearSubmit(e) {
    e.preventDefault();
    if (!validateForm(adminUI.addAcademicYearForm)) {
        displayMessage(adminUI.feedbackContainer, 'error', 'Veuillez remplir tous les champs requis.');
        return;
    }
    setButtonLoading(e.submitter, true);
    const formData = getFormData(adminUI.addAcademicYearForm);
    formData.id_annee_academique = `ANNEE-${formData.libelle_annee_academique.replace(/[^0-9]/g, '-')}`;
    formData.est_active = formData.est_active === 'on';

    // Si l'année est active, désactiver les autres d'abord (via Edge Function ou transaction)
    if (formData.est_active) {
        await dataService.updateRecords(TABLES.ANNEE_ACADEMIQUE, { est_active: false }, { est_active: true });
    }

    const { error } = await dataService.createRecord(TABLES.ANNEE_ACADEMIQUE, formData);
    if (error) {
        displayMessage(adminUI.feedbackContainer, 'error', `Erreur: ${error.message}`);
    } else {
        displayMessage(adminUI.feedbackContainer, 'success', 'Année académique ajoutée.');
        adminUI.addAcademicYearForm.reset();
        loadAcademicYears();
    }
    setButtonLoading(e.submitter, false);
}

async function handleAcademicYearActions(e) {
    const id = e.target.closest('button')?.dataset.id;
    if (!id) return;

    if (e.target.closest('.edit-year-btn')) {
        const { data: year, error } = await dataService.getRecordById(TABLES.ANNEE_ACADEMIQUE, id);
        if (error) { displayMessage(adminUI.feedbackContainer, 'error', 'Année non trouvée.'); return; }
        fillForm(adminUI.editAcademicYearForm, year);
        openModal(adminUI.academicYearModal);
    } else if (e.target.closest('.delete-year-btn')) {
        confirmAction('Supprimer Année Académique', `Êtes-vous sûr de vouloir supprimer l'année ${id} ?`, async () => {
            // Vérifier les dépendances via une fonction Edge
            const { error } = await dataService.deleteRecord(TABLES.ANNEE_ACADEMIQUE, id);
            if (error) { displayMessage(adminUI.feedbackContainer, 'error', `Erreur: ${error.message}`); }
            else { displayMessage(adminUI.feedbackContainer, 'success', 'Année supprimée.'); loadAcademicYears(); }
        });
    } else if (e.target.closest('.set-active-year-btn')) {
        confirmAction('Définir Année Active', `Définir ${id} comme année académique active ?`, async () => {
            // Désactiver les autres puis activer celle-ci via une fonction Edge ou transaction
            const { error } = await dataService.updateRecords(TABLES.ANNEE_ACADEMIQUE, { est_active: false }, { est_active: true });
            if (error) { displayMessage(adminUI.feedbackContainer, 'error', `Erreur: ${error.message}`); return; }
            const { error: activateError } = await dataService.updateRecord(TABLES.ANNEE_ACADEMIQUE, id, { est_active: true });
            if (activateError) { displayMessage(adminUI.feedbackContainer, 'error', `Erreur: ${activateError.message}`); }
            else { displayMessage(adminUI.feedbackContainer, 'success', `${id} est maintenant active.`); loadAcademicYears(); }
        });
    }
}

async function handleEditAcademicYearSubmit(e) {
    e.preventDefault();
    if (!validateForm(adminUI.editAcademicYearForm)) {
        displayMessage(adminUI.feedbackContainer, 'error', 'Veuillez remplir tous les champs requis.');
        return;
    }
    setButtonLoading(e.submitter, true);
    const formData = getFormData(adminUI.editAcademicYearForm);
    const id = formData.id_annee_academique;
    formData.est_active = formData.est_active === 'on';

    if (formData.est_active) {
        await dataService.updateRecords(TABLES.ANNEE_ACADEMIQUE, { est_active: false }, { est_active: true });
    }

    const { error } = await dataService.updateRecord(TABLES.ANNEE_ACADEMIQUE, id, formData);
    if (error) {
        displayMessage(adminUI.feedbackContainer, 'error', `Erreur: ${error.message}`);
    } else {
        displayMessage(adminUI.feedbackContainer, 'success', 'Année académique mise à jour.');
        closeModal(adminUI.academicYearModal);
        loadAcademicYears();
    }
    setButtonLoading(e.submitter, false);
}

async function handleReferentialEntrySubmit(e) {
    e.preventDefault();
    if (!validateForm(adminUI.referentialEntryForm)) {
        displayMessage(adminUI.feedbackContainer, 'error', 'Veuillez remplir tous les champs requis.');
        return;
    }
    setButtonLoading(e.submitter, true);
    const formData = getFormData(adminUI.referentialEntryForm);
    const tableName = formData.table_name;
    const id = formData.id;
    delete formData.table_name;
    delete formData.id;

    let result;
    if (id) { // Modification
        result = await dataService.updateRecord(tableName, id, formData);
    } else { // Création
        // Générer l'ID pour les référentiels (simplifié, devrait être géré par une fonction Edge)
        const pkField = getReferentialPrimaryKeyField(tableName);
        if (pkField && !formData[pkField]) {
            formData[pkField] = generateUniqueId(tableName.toUpperCase().replace(/_REF|_UTILISATEUR|_ACCES|_MODELE|_RAPPORT|_CONFORMITE|_VALIDATION|_PASSAGE|_VOTE|_JURY|_PAIEMENT|_PENALITE|_PV|_RECLAMATION|_DOCUMENT/g, '').replace(/_/, ''));
        }
        result = await dataService.createRecord(tableName, formData);
    }

    if (result.error) {
        displayMessage(adminUI.feedbackContainer, 'error', `Erreur: ${result.error.message}`);
    } else {
        displayMessage(adminUI.feedbackContainer, 'success', `Entrée ${id ? 'mise à jour' : 'ajoutée'}.`);
        closeModal(adminUI.referentialEntryModal);
        loadReferentialDetails(tableName); // Recharger le référentiel
    }
    setButtonLoading(e.submitter, false);
}

function getReferentialPrimaryKeyField(tableName) {
    // Cette fonction devrait être plus robuste, idéalement via une map de schémas
    if (tableName.includes('_ref') || tableName.includes('_utilisateur') || tableName.includes('_acces') || tableName.includes('_modele') || tableName.includes('_rapport') || tableName.includes('_conformite') || tableName.includes('_validation') || tableName.includes('_passage') || tableName.includes('_vote') || tableName.includes('_jury') || tableName.includes('_paiement') || tableName.includes('_penalite') || tableName.includes('_pv') || tableName.includes('_reclamation') || tableName.includes('_document')) {
        return `id_${tableName.replace(/_ref|_utilisateur|_acces|_modele|_rapport|_conformite|_validation|_passage|_vote|_jury|_paiement|_penalite|_pv|_reclamation|_document/g, '')}`;
    }
    return `id_${tableName}`; // Fallback
}

async function deleteReferentialEntry(id) {
    confirmAction('Supprimer Entrée', `Êtes-vous sûr de vouloir supprimer cette entrée (${id}) ?`, async () => {
        const { error } = await dataService.deleteRecord(currentReferentialTable, id);
        if (error) { displayMessage(adminUI.feedbackContainer, 'error', `Erreur: ${error.message}`); }
        else { displayMessage(adminUI.feedbackContainer, 'success', 'Entrée supprimée.'); loadReferentialDetails(currentReferentialTable); }
    });
}

async function handleDocumentModelActions(e) {
    const id = e.target.closest('button')?.dataset.id;
    if (!id) return;

    if (e.target.closest('.edit-model-btn')) {
        const { data: model, error } = await dataService.getRecordById(TABLES.RAPPORT_MODELE, id);
        if (error) { displayMessage(adminUI.feedbackContainer, 'error', 'Modèle non trouvé.'); return; }
        fillForm(adminUI.documentModelForm, model);
        openModal(adminUI.documentModelModal);
    } else if (e.target.closest('.delete-model-btn')) {
        confirmAction('Supprimer Modèle', `Êtes-vous sûr de vouloir supprimer le modèle ${id} ?`, async () => {
            const { error } = await dataService.deleteRecord(TABLES.RAPPORT_MODELE, id);
            if (error) { displayMessage(adminUI.feedbackContainer, 'error', `Erreur: ${error.message}`); }
            else { displayMessage(adminUI.feedbackContainer, 'success', 'Modèle supprimé.'); loadDocumentModels(); }
        });
    }
}

async function handleDocumentModelSubmit(e) {
    e.preventDefault();
    if (!validateForm(adminUI.documentModelForm)) {
        displayMessage(adminUI.feedbackContainer, 'error', 'Veuillez remplir tous les champs requis.');
        return;
    }
    setButtonLoading(e.submitter, true);
    const formData = getFormData(adminUI.documentModelForm);
    const id = formData.id_modele;

    let result;
    if (id) { // Modification
        result = await dataService.updateRecord(TABLES.RAPPORT_MODELE, id, formData);
    } else { // Création
        formData.id_modele = generateUniqueId(ID_PREFIXES.RAPPORT_MODELE);
        formData.version = '1.0';
        formData.statut = 'Brouillon'; // Ou 'Publié' par défaut
        result = await dataService.createRecord(TABLES.RAPPORT_MODELE, formData);
    }

    if (result.error) {
        displayMessage(adminUI.feedbackContainer, 'error', `Erreur: ${result.error.message}`);
    } else {
        displayMessage(adminUI.feedbackContainer, 'success', `Modèle ${id ? 'mis à jour' : 'créé'}.`);
        closeModal(adminUI.documentModelModal);
        loadDocumentModels();
    }
    setButtonLoading(e.submitter, false);
}

async function handleImportDocModelSubmit(e) {
    e.preventDefault();
    const fileInput = adminUI.importDocModelForm.querySelector('#word-file');
    if (!fileInput.files.length) {
        displayMessage(adminUI.feedbackContainer, 'error', 'Veuillez sélectionner un fichier .docx.');
        return;
    }
    setButtonLoading(e.submitter, true);

    const file = fileInput.files[0];
    // Pour importer un Word, vous aurez besoin d'une fonction Edge qui utilise une lib Node.js
    // comme 'mammoth' pour convertir .docx en HTML, puis insère le HTML dans la DB.
    const { success, message } = await functionService.importWordDocument(file); // Fonction Edge à créer

    if (!success) {
        displayMessage(adminUI.feedbackContainer, 'error', `Erreur d'import: ${message}`);
    } else {
        displayMessage(adminUI.feedbackContainer, 'success', 'Modèle Word importé et converti en HTML.');
        closeModal(adminUI.importDocModelModal);
        loadDocumentModels();
    }
    setButtonLoading(e.submitter, false);
}

async function handleNotificationTemplateActions(e) {
    const id = e.target.closest('button')?.dataset.id;
    if (!id) return;

    if (e.target.closest('.edit-template-btn')) {
        const { data: template, error } = await dataService.getRecordById(TABLES.NOTIFICATION, id);
        if (error) { displayMessage(adminUI.feedbackContainer, 'error', 'Modèle de notification non trouvé.'); return; }
        fillForm(adminUI.notificationTemplateForm, template);
        openModal(adminUI.notificationTemplateModal);
    }
}

async function handleNotificationTemplateSubmit(e) {
    e.preventDefault();
    if (!validateForm(adminUI.notificationTemplateForm)) {
        displayMessage(adminUI.feedbackContainer, 'error', 'Veuillez remplir tous les champs requis.');
        return;
    }
    setButtonLoading(e.submitter, true);
    const formData = getFormData(adminUI.notificationTemplateForm);
    const id = formData.id_notification;

    const { error } = await dataService.updateRecord(TABLES.NOTIFICATION, id, formData);
    if (error) {
        displayMessage(adminUI.feedbackContainer, 'error', `Erreur: ${error.message}`);
    } else {
        displayMessage(adminUI.feedbackContainer, 'success', 'Modèle de notification mis à jour.');
        closeModal(adminUI.notificationTemplateModal);
        loadNotificationSettings();
    }
    setButtonLoading(e.submitter, false);
}

async function handleNotificationRuleActions(e) {
    const id = e.target.closest('button')?.dataset.id;
    if (!id) return;

    if (e.target.closest('.edit-rule-btn')) {
        const { data: rule, error } = await dataService.getRecordById(TABLES.MATRICE_NOTIFICATION_REGLES, id);
        if (error) { displayMessage(adminUI.feedbackContainer, 'error', 'Règle de notification non trouvée.'); return; }
        fillForm(adminUI.notificationRuleForm, rule);
        adminUI.notificationRuleForm.querySelector('#notif-rule-event-display').textContent = rule.id_action_declencheur;
        adminUI.notificationRuleForm.querySelector('#notif-rule-group-display').textContent = rule.id_groupe_destinataire;
        openModal(adminUI.notificationRuleModal);
    }
}

async function handleNotificationRuleSubmit(e) {
    e.preventDefault();
    if (!validateForm(adminUI.notificationRuleForm)) {
        displayMessage(adminUI.feedbackContainer, 'error', 'Veuillez remplir tous les champs requis.');
        return;
    }
    setButtonLoading(e.submitter, true);
    const formData = getFormData(adminUI.notificationRuleForm);
    const id = formData.id_regle;
    formData.est_active = formData.est_active === 'on';

    const { error } = await dataService.updateRecord(TABLES.MATRICE_NOTIFICATION_REGLES, id, formData);
    if (error) {
        displayMessage(adminUI.feedbackContainer, 'error', `Erreur: ${error.message}`);
    } else {
        displayMessage(adminUI.feedbackContainer, 'success', 'Règle de diffusion mise à jour.');
        closeModal(adminUI.notificationRuleModal);
        loadNotificationSettings();
    }
    setButtonLoading(e.submitter, false);
}

async function handleSaveMenuOrder() {
    setButtonLoading(adminUI.saveMenuOrderBtn, true);
    const menuOrder = [];
    // Logique pour récupérer l'ordre et la hiérarchie du menu (drag-and-drop)
    // Ceci nécessiterait une bibliothèque de drag-and-drop et une logique complexe
    // Pour l'exemple, nous allons juste simuler la sauvegarde.
    displayMessage(adminUI.feedbackContainer, 'success', 'Ordre des menus sauvegardé (simulation).');
    setButtonLoading(adminUI.saveMenuOrderBtn, false);
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