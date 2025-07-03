import { dataService, functionService } from '../services/simulation-service.js';
import { displayMessage, setButtonLoading, generateUniqueId, formatDate, openModal, closeModal, fillForm, getFormData, validateForm, capitalizeFirstLetter } from '../utils/helpers.js';
import { ROLES, TABLES, USER_TYPES, ID_PREFIXES } from '../utils/constants.js';

let currentUser = null;
let userPermissions = [];
let currentReferentialTable = null;

const adminUI = {
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
    configTabs: document.querySelectorAll('.tabs-container .tab'),
    configTabContents: document.querySelectorAll('.tabs-container .tab-content'),
    generalParamsForm: document.getElementById('general-params-form'),
    academicYearsList: document.getElementById('academic-years-list'),
    addAcademicYearForm: document.getElementById('add-academic-year-form'),
    academicYearModal: document.getElementById('academic-year-modal'),
    editAcademicYearForm: document.getElementById('edit-academic-year-form'),
    academicYearRowTemplate: document.getElementById('academic-year-row-template'),
    selectReferential: document.getElementById('select-referential'),
    referentialDetailsPanel: document.getElementById('referential-details-panel'),
    documentModelsList: document.getElementById('document-models-list'),
    addDocumentModelBtn: document.getElementById('add-document-model-btn'),
    importDocumentModelBtn: document.getElementById('import-document-model-btn'),
    documentModelModal: document.getElementById('document-model-modal'),
    documentModelForm: document.getElementById('doc-model-form'),
    documentModelRowTemplate: document.getElementById('document-model-row-template'),
    importDocModelModal: document.getElementById('import-doc-model-modal'),
    importDocModelForm: document.getElementById('import-doc-model-form'),
    notificationTemplatesList: document.getElementById('notification-templates-list'),
    notificationRulesList: document.getElementById('notification-rules-list'),
    notificationTemplateModal: document.getElementById('notification-template-modal'),
    notificationTemplateForm: document.getElementById('notif-template-form'),
    notificationTemplateRowTemplate: document.getElementById('notification-template-row-template'),
    notificationRuleModal: document.getElementById('notification-rule-modal'),
    notificationRuleForm: document.getElementById('notif-rule-form'),
    notificationRuleRowTemplate: document.getElementById('notification-rule-row-template'),
    menuTree: document.getElementById('menu-tree'),
    saveMenuOrderBtn: document.getElementById('save-menu-order-btn'),
    menuItemTemplate: document.getElementById('menu-item-template'),
    feedbackContainer: document.getElementById('global-flash-messages'),
};

export async function initPage(user, permissions) {
    currentUser = user;
    userPermissions = permissions;

    const currentPath = window.location.pathname;
    if (currentPath.includes('dashboard.html')) {
        await loadAdminDashboard();
    } else if (currentPath.includes('utilisateurs.html')) {
        await loadUserManagement();
    } else if (currentPath.includes('configuration.html')) {
        await loadConfigurationPage();
    }
}

async function loadAdminDashboard() {
    const { stats } = await functionService.getAdminDashboardStats();

    if (adminUI.stats.totalUsers) {
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
    }

    if (adminUI.charts.reportsStatusChartCtx) {
        new Chart(adminUI.charts.reportsStatusChartCtx, {
            type: 'pie',
            data: {
                labels: ['Soumis', 'En Commission', 'Validés', 'Non Conformes', 'Brouillon', 'En Correction'],
                datasets: [{
                    data: [stats.reports.soumis, stats.reports.en_commission, stats.reports.valid, stats.reports.non_conf, stats.reports.brouillon, stats.reports.en_correction],
                    backgroundColor: ['#FFC857', '#1A5E63', '#27ae60', '#e74c3c', '#3498db', '#f39c12'],
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

    if (adminUI.systemAlertsList && stats.queue.failed > 0) {
        adminUI.systemAlertsList.innerHTML = `
            <div class="alert alert-error">
                <i class="fas fa-exclamation-circle"></i>
                <span>Attention: ${stats.queue.failed} tâches asynchrones ont échoué. Vérifiez la supervision.</span>
            </div>
        `;
    }
}

async function loadUserManagement() {
    await populateUserFilters();
    await fetchAndDisplayUsers();
    setupUserManagementEventListeners();
}

async function populateUserFilters() {
    const { data: roles, error } = await dataService.getRecords(TABLES.GROUPE_UTILISATEUR);
    if (!error) {
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
    const { users, error } = await functionService.getUsersWithProfiles(filters);

    if (error) {
        adminUI.userListBody.innerHTML = `<tr><td colspan="7" class="text-center text-error">Erreur: ${error.message}</td></tr>`;
        return;
    }

    adminUI.userListBody.innerHTML = '';
    if (users.length === 0) {
        adminUI.userListBody.innerHTML = '<tr><td colspan="7" class="text-center">Aucun utilisateur trouvé.</td></tr>';
        return;
    }

    users.forEach(user => {
        const row = adminUI.userRowTemplate.content.cloneNode(true);
        row.querySelector('.user-full-name').textContent = `${user.profile?.prenom || ''} ${user.profile?.nom || ''}`;
        row.querySelector('.user-email').textContent = user.email_principal;
        row.querySelector('.user-login').textContent = user.login_utilisateur;
        row.querySelector('.user-role-label').textContent = user.id_groupe_utilisateur;
        row.querySelector('.user-status').textContent = user.statut_compte;
        row.querySelector('.user-last-login').textContent = user.derniere_connexion ? formatDate(user.derniere_connexion) : 'N/A';

        const actionsCell = row.querySelector('.user-actions');
        actionsCell.querySelector('.edit-user-btn').dataset.userId = user.numero_utilisateur;
        actionsCell.querySelector('.delete-user-btn').dataset.userId = user.numero_utilisateur;
        actionsCell.querySelector('.impersonate-user-btn').dataset.userId = user.numero_utilisateur;
        adminUI.userListBody.appendChild(row);
    });
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
                const { success, message } = await functionService.deleteUserAndProfile(userId);
                if (!success) {
                    displayMessage(adminUI.feedbackContainer, 'error', `Erreur: ${message}`);
                } else {
                    displayMessage(adminUI.feedbackContainer, 'success', `Utilisateur ${userId} supprimé.`);
                    fetchAndDisplayUsers();
                }
            });
        } else if (target.classList.contains('impersonate-user-btn')) {
            confirmAction('Impersonnaliser Utilisateur', `Voulez-vous vraiment vous connecter en tant que ${userId} ?`, async () => {
                displayMessage(adminUI.feedbackContainer, 'info', `Impersonnalisation de ${userId} (simulation). Redirection...`);
                await authService.impersonate(userId);
                window.location.href = '/pages/etudiant/dashboard.html';
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

    const { data: roles } = await dataService.getRecords(TABLES.GROUPE_UTILISATEUR);
    const { data: types } = await dataService.getRecords(TABLES.TYPE_UTILISATEUR);
    const { data: accessLevels } = await dataService.getRecords(TABLES.NIVEAU_ACCES_DONNE);

    const roleSelect = adminUI.userForm.querySelector('#form-role');
    roleSelect.innerHTML = '<option value="">-- Choisir --</option>' + roles.map(r => `<option value="${r.id_groupe_utilisateur}">${r.libelle_groupe_utilisateur}</option>`).join('');

    const typeSelect = adminUI.userForm.querySelector('#form-type');
    typeSelect.innerHTML = '<option value="">-- Choisir --</option>' + types.map(t => `<option value="${t.id_type_utilisateur}">${t.libelle_type_utilisateur}</option>`).join('');

    const accessLevelSelect = adminUI.userForm.querySelector('#form-access-level');
    accessLevelSelect.innerHTML = '<option value="">-- Choisir --</option>' + accessLevels.map(al => `<option value="${al.id_niveau_acces_donne}">${al.libelle_niveau_acces_donne}</option>`).join('');

    if (mode === 'edit' && userId) {
        const { users } = await functionService.getUsersWithProfiles({ numero_utilisateur: userId });
        if (!users || users.length === 0) {
            displayMessage(adminUI.feedbackContainer, 'error', 'Utilisateur non trouvé.');
            return;
        }
        const user = users[0];
        const userData = { ...user, ...user.profile };
        fillForm(adminUI.userForm, userData);
        adminUI.userForm.querySelector('#user-id-hidden').value = userId;
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

    if (userId) {
        result = await functionService.updateUserAndProfile(userId, formData);
    } else {
        result = await functionService.createUserAndProfile(formData);
    }

    if (!result.success) {
        displayMessage(adminUI.feedbackContainer, 'error', `Erreur: ${result.message}`);
    } else {
        displayMessage(adminUI.feedbackContainer, 'success', `Utilisateur ${userId ? 'mis à jour' : 'créé'} avec succès.`);
        closeModal(adminUI.userModal);
        fetchAndDisplayUsers();
    }
    setButtonLoading(adminUI.userModalSubmitBtn, false);
}

async function loadConfigurationPage() {
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
    const { data: params } = await dataService.getRecords(TABLES.PARAMETRES_SYSTEME);
    params.forEach(p => {
        const input = adminUI.generalParamsForm.querySelector(`[name="${p.cle}"]`);
        if (input) {
            if (input.type === 'checkbox') input.checked = p.valeur === '1';
            else input.value = p.valeur;
        }
    });
}

async function loadAcademicYears() {
    const { data: years } = await dataService.getRecords(TABLES.ANNEE_ACADEMIQUE, {}, 'date_debut DESC');
    adminUI.academicYearsList.innerHTML = '';
    years.forEach(year => {
        const row = adminUI.academicYearRowTemplate.content.cloneNode(true);
        row.querySelector('.year-libelle').textContent = year.libelle_annee_academique;
        row.querySelector('.year-start-date').textContent = formatDate(year.date_debut);
        row.querySelector('.year-end-date').textContent = formatDate(year.date_fin);
        row.querySelector('.year-active').innerHTML = year.est_active ? '<span class="badge-success">Oui</span>' : 'Non';
        row.querySelector('.edit-year-btn').dataset.id = year.id_annee_academique;
        row.querySelector('.delete-year-btn').dataset.id = year.id_annee_academique;
        row.querySelector('.set-active-year-btn').dataset.id = year.id_annee_academique;
        row.querySelector('.set-active-year-btn').style.display = year.est_active ? 'none' : 'inline-block';
        adminUI.academicYearsList.appendChild(row);
    });
}

async function populateReferentialSelect() {
    const referentials = Object.keys(TABLES).filter(k => k.endsWith('_REF') || ['GROUPE_UTILISATEUR', 'TYPE_UTILISATEUR', 'NIVEAU_ACCES_DONNE'].includes(k));
    adminUI.selectReferential.innerHTML = '<option value="">-- Choisir --</option>' + referentials.map(r => `<option value="${TABLES[r]}">${r}</option>`).join('');
}

async function loadReferentialDetails(tableName) {
    currentReferentialTable = tableName;
    const { data: entries, error } = await dataService.getRecords(tableName);
    if (error) {
        adminUI.referentialDetailsPanel.innerHTML = `<p class="text-center text-error">Erreur de chargement.</p>`;
        return;
    }

    let fields = entries.length > 0 ? Object.keys(entries[0]) : [];
    if (fields.length === 0) {
        adminUI.referentialDetailsPanel.innerHTML = `<p class="text-center text-secondary">Ce référentiel est vide. Ajoutez une entrée.</p>`;
        return;
    }

    let tableHtml = `
        <h3 class="subsection-title mt-6">Entrées Existantes</h3>
        <div class="table-container">
            <table class="data-table">
                <thead><tr>${fields.map(f => `<th>${f}</th>`).join('')}<th>Actions</th></tr></thead>
                <tbody>
                    ${entries.map(entry => `
                        <tr>
                            ${fields.map(field => `<td>${entry[field]}</td>`).join('')}
                            <td>
                                <button class="btn btn-sm btn-danger delete-ref-entry-btn" data-id="${entry[fields[0]]}"><i class="fas fa-trash"></i></button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>`;
    adminUI.referentialDetailsPanel.innerHTML = tableHtml;
}

async function loadDocumentModels() {
    const { data: models } = await dataService.getRecords(TABLES.RAPPORT_MODELE);
    adminUI.documentModelsList.innerHTML = '';
    models.forEach(model => {
        const row = adminUI.documentModelRowTemplate.content.cloneNode(true);
        row.querySelector('.model-name').textContent = model.nom_modele;
        row.querySelector('.model-version').textContent = model.version;
        row.querySelector('.model-status').textContent = model.statut;
        row.querySelector('.edit-model-btn').dataset.id = model.id_modele;
        row.querySelector('.delete-model-btn').dataset.id = model.id_modele;
        adminUI.documentModelsList.appendChild(row);
    });
}

async function loadNotificationSettings() {
    const { data: templates } = await dataService.getRecords(TABLES.NOTIFICATION);
    const { data: rules } = await dataService.getRecords(TABLES.MATRICE_NOTIFICATION_REGLES);

    adminUI.notificationTemplatesList.innerHTML = '';
    templates.forEach(t => {
        const row = adminUI.notificationTemplateRowTemplate.content.cloneNode(true);
        row.querySelector('.template-id').textContent = t.id_notification;
        row.querySelector('.template-libelle').textContent = t.libelle_notification;
        row.querySelector('.edit-template-btn').dataset.id = t.id_notification;
        adminUI.notificationTemplatesList.appendChild(row);
    });

    adminUI.notificationRulesList.innerHTML = '';
    rules.forEach(r => {
        const row = adminUI.notificationRuleRowTemplate.content.cloneNode(true);
        row.querySelector('.rule-event').textContent = r.id_action_declencheur;
        row.querySelector('.rule-group').textContent = r.id_groupe_destinataire;
        row.querySelector('.rule-channel').textContent = r.canal_notification;
        row.querySelector('.rule-active').innerHTML = r.est_active ? '<span class="badge-success">Oui</span>' : 'Non';
        row.querySelector('.edit-rule-btn').dataset.id = r.id_regle;
        adminUI.notificationRulesList.appendChild(row);
    });
}

async function loadMenuOrder() {
    // La logique de drag-and-drop est complexe et omise pour cette simulation.
    // On affiche simplement la liste.
    const { data: menuItems } = await dataService.getRecords(TABLES.TRAITEMENT, {}, 'ordre_affichage ASC');
    adminUI.menuTree.innerHTML = menuItems.map(item => `
        <li class="menu-item" style="padding-left: ${item.id_parent_traitement ? '20px' : '0'};">
            <div class="menu-item-content">
                <i class="menu-item-icon ${item.icone_class || 'fas fa-circle-notch'}"></i>
                <span class="menu-item-label">${item.libelle_traitement}</span>
                <span class="menu-item-order">(${item.ordre_affichage})</span>
            </div>
        </li>
    `).join('');
}

function setupConfigurationEventListeners() {
    adminUI.generalParamsForm?.addEventListener('submit', handleGeneralParamsSubmit);
    adminUI.addAcademicYearForm?.addEventListener('submit', handleAddAcademicYearSubmit);
    adminUI.academicYearsList?.addEventListener('click', handleAcademicYearActions);
    adminUI.editAcademicYearForm?.addEventListener('submit', handleEditAcademicYearSubmit);
    adminUI.selectReferential?.addEventListener('change', (e) => loadReferentialDetails(e.target.value));
}

async function handleGeneralParamsSubmit(e) {
    e.preventDefault();
    setButtonLoading(e.submitter, true);
    const formData = getFormData(adminUI.generalParamsForm);
    for (const key in formData) {
        await dataService.updateRecord(TABLES.PARAMETRES_SYSTEME, key, { valeur: formData[key] });
    }
    displayMessage(adminUI.feedbackContainer, 'success', 'Paramètres sauvegardés.');
    setButtonLoading(e.submitter, false);
}

async function handleAddAcademicYearSubmit(e) {
    e.preventDefault();
    setButtonLoading(e.submitter, true);
    const formData = getFormData(adminUI.addAcademicYearForm);
    formData.id_annee_academique = `ANNEE-${formData.libelle_annee_academique.replace(/[^0-9]/g, '-')}`;
    formData.est_active = formData.est_active === 'on';

    if (formData.est_active) {
        await dataService.updateRecords(TABLES.ANNEE_ACADEMIQUE, { est_active: false }, { est_active: true });
    }

    const { error } = await dataService.createRecord(TABLES.ANNEE_ACADEMIQUE, formData);
    if (error) {
        displayMessage(adminUI.feedbackContainer, 'error', `Erreur: ${error.message}`);
    } else {
        displayMessage(adminUI.feedbackContainer, 'success', 'Année ajoutée.');
        adminUI.addAcademicYearForm.reset();
        loadAcademicYears();
    }
    setButtonLoading(e.submitter, false);
}

async function handleAcademicYearActions(e) {
    const id = e.target.closest('button')?.dataset.id;
    if (!id) return;

    if (e.target.closest('.edit-year-btn')) {
        const { data: year } = await dataService.getRecordById(TABLES.ANNEE_ACADEMIQUE, id);
        fillForm(adminUI.editAcademicYearForm, year);
        openModal(adminUI.academicYearModal);
    } else if (e.target.closest('.delete-year-btn')) {
        confirmAction('Supprimer Année', `Supprimer l'année ${id} ?`, async () => {
            await dataService.deleteRecord(TABLES.ANNEE_ACADEMIQUE, id);
            displayMessage(adminUI.feedbackContainer, 'success', 'Année supprimée.');
            loadAcademicYears();
        });
    } else if (e.target.closest('.set-active-year-btn')) {
        await dataService.updateRecords(TABLES.ANNEE_ACADEMIQUE, { est_active: false }, { est_active: true });
        await dataService.updateRecord(TABLES.ANNEE_ACADEMIQUE, id, { est_active: true });
        displayMessage(adminUI.feedbackContainer, 'success', `${id} est maintenant l'année active.`);
        loadAcademicYears();
    }
}

async function handleEditAcademicYearSubmit(e) {
    e.preventDefault();
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
        displayMessage(adminUI.feedbackContainer, 'success', 'Année mise à jour.');
        closeModal(adminUI.academicYearModal);
        loadAcademicYears();
    }
    setButtonLoading(e.submitter, false);
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