// /assets/js/main.js

import { authService } from './services/auth-service.js';
import { dataService } from './services/simulation-service.js';
import { displayMessage } from './utils/helpers.js';
import { ROLES, TABLES, PATHS } from './utils/constants.js';

// --- ÉLÉMENTS DU DOM GLOBAUX ---
const globalUI = {
    flashMessageContainer: document.getElementById('global-flash-messages'),
    sidebarMenu: document.getElementById('sidebar-menu'),
    logoutBtn: document.getElementById('logout-btn'),
    userLoginDisplay: document.getElementById('user-login-display'),
    userRoleDisplay: document.getElementById('user-role-display'),
    userAvatarDisplay: document.getElementById('user-avatar-display'),
    sidebarToggleBtn: document.getElementById('sidebar-toggle-btn'),
    mainContentArea: document.getElementById('main-content-area'),
};

// --- ÉTAT GLOBAL ---
let currentUser = null;
let userPermissions = [];
let userRole = null;

// --- FONCTIONS D'INITIALISATION GLOBALE ---
async function initGlobalApp() {
    await checkAuthAndLoadUser();
    if (currentUser) {
        await loadUserPermissions();
        await buildSidebarMenu();
        setupGlobalEventListeners();
        await loadPageContent();
    } else {
        if (window.location.pathname !== PATHS.LOGIN && !window.location.pathname.endsWith('index.html')) {
            window.location.href = '/index.html';
        }
    }
}

async function checkAuthAndLoadUser() {
    const user = await authService.getUser();
    if (user) {
        currentUser = user;
        userRole = user.profile.id_groupe_utilisateur;
        updateUserProfileUI();
    }
}

async function loadUserPermissions() {
    if (!currentUser || !userRole) return;

    const { data: rattachements, error: rattacherError } = await dataService.getRecords(TABLES.RATTACHER, {
        id_groupe_utilisateur: userRole
    });

    if (rattacherError) {
        console.error("Erreur lors du chargement des permissions:", rattacherError);
        displayMessage(globalUI.flashMessageContainer, 'error', 'Erreur de chargement des permissions.');
        return;
    }

    // Le fichier de simulation ne contient pas la table 'rattacher', nous allons donc simuler les permissions.
    // Pour une démo complète, il faudrait ajouter cette table au service de simulation.
    // En attendant, on donne toutes les permissions pour que le menu s'affiche.
    const { data: allTreatments } = await dataService.getRecords(TABLES.TRAITEMENT);
    userPermissions = allTreatments.map(t => t.id_traitement);

    // Filtrage plus réaliste si la table rattacher était remplie
    // userPermissions = rattachements.map(r => r.id_traitement);
    // if (userRole === ROLES.ADMIN_SYS) {
    //     const { data: allTreatments } = await dataService.getRecords(TABLES.TRAITEMENT);
    //     userPermissions = allTreatments.map(t => t.id_traitement);
    // }
}

function hasPermission(permissionCode) {
    // Pour la démo, on autorise tout car les permissions ne sont pas finement simulées.
    return userPermissions.includes(permissionCode) || userRole === ROLES.ADMIN_SYS;
}

function updateUserProfileUI() {
    if (currentUser && currentUser.profile) {
        globalUI.userLoginDisplay.textContent = currentUser.profile.login_utilisateur;
        globalUI.userRoleDisplay.textContent = currentUser.profile.id_groupe_utilisateur;
        if (currentUser.profile.photo_profil) {
            globalUI.userAvatarDisplay.src = currentUser.profile.photo_profil;
        } else {
            // Utilisons une image placeholder par défaut
            globalUI.userAvatarDisplay.src = `https://i.pravatar.cc/40?u=${currentUser.id}`;
        }
    }
}

async function buildSidebarMenu() {
    if (!globalUI.sidebarMenu) return;

    const { data: menuTreatments, error } = await dataService.getRecords(TABLES.TRAITEMENT, {}, 'ordre_affichage ASC');

    if (error) {
        console.error("Erreur lors du chargement des éléments de menu:", error);
        return;
    }

    const menuItems = {};
    const rootItems = [];

    menuTreatments.forEach(item => {
        menuItems[item.id_traitement] = { ...item, children: [] };
    });

    for (const id in menuItems) {
        const item = menuItems[id];
        if (item.id_parent_traitement && menuItems[item.id_parent_traitement]) {
            menuItems[item.id_parent_traitement].children.push(item);
        } else {
            rootItems.push(item);
        }
    }

    globalUI.sidebarMenu.innerHTML = '';

    const createMenuItem = (item) => {
        if (!hasPermission(item.id_traitement)) return '';

        if (item.children.length > 0) {
            const childrenHtml = item.children.map(createMenuItem).join('');
            if (!childrenHtml) return ''; // Ne pas afficher le parent si aucun enfant n'est visible
            return `
                <li>
                    <details>
                        <summary class="nav-section-title">
                            <i class="${item.icone_class || 'fas fa-folder'} nav-icon"></i>
                            <span>${item.libelle_traitement}</span>
                        </summary>
                        <ul class="nav-list">
                            ${childrenHtml}
                        </ul>
                    </details>
                </li>
            `;
        } else if (item.url_associee) {
            return `
                <li class="nav-item">
                    <a href="${item.url_associee}" class="nav-link" data-permission="${item.id_traitement}">
                        <i class="${item.icone_class || 'fas fa-circle-notch'} nav-icon"></i>
                        <span>${item.libelle_traitement}</span>
                    </a>
                </li>
            `;
        }
        return '';
    };

    rootItems.forEach(item => {
        globalUI.sidebarMenu.innerHTML += createMenuItem(item);
    });

    highlightActiveMenuItem();
}


function highlightActiveMenuItem() {
    const currentPath = window.location.pathname;
    globalUI.sidebarMenu.querySelectorAll('.nav-link').forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
            let parentDetails = link.closest('details');
            while (parentDetails) {
                parentDetails.open = true;
                parentDetails = parentDetails.parentElement.closest('details');
            }
        } else {
            link.classList.remove('active');
        }
    });
}

function setupGlobalEventListeners() {
    globalUI.logoutBtn?.addEventListener('click', async (e) => {
        e.preventDefault();
        await authService.signOut();
        window.location.href = '/index.html';
    });

    globalUI.sidebarToggleBtn?.addEventListener('click', () => {
        document.body.classList.toggle('sidebar-collapsed');
    });
}

async function loadPageContent() {
    const path = window.location.pathname;
    let pageScriptPath = null;

    if (path.startsWith('/pages/admin/')) {
        pageScriptPath = '../pages/admin.js';
    } else if (path.startsWith('/pages/etudiant/')) {
        pageScriptPath = '../pages/etudiant.js';
    } else if (path.startsWith('/pages/commission/')) {
        pageScriptPath = '../pages/commission.js';
    } else if (path.startsWith('/pages/personnel/')) {
        pageScriptPath = '../pages/personnel.js';
    }

    if (pageScriptPath) {
        try {
            const pageModule = await import(pageScriptPath);
            if (typeof pageModule.initPage === 'function') {
                pageModule.initPage(currentUser, userPermissions);
            }
        } catch (error) {
            console.error("Erreur lors du chargement du script de page:", error);
            displayMessage(globalUI.flashMessageContainer, 'error', 'Impossible de charger le contenu de la page.');
        }
    }
}

initGlobalApp();