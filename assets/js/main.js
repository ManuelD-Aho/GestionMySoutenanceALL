// /assets/js/main.js

import { supabase } from './services/supabase-client.js';
import { authService } from './services/auth-service.js';
import { dataService } from './services/data-service.js';
import { displayMessage, setButtonLoading } from './utils/helpers.js';
import { ROLES, TABLES, PATHS } from './utils/constants.js';

// --- ÉLÉMENTS DU DOM GLOBAUX ---
const globalUI = {
    flashMessageContainer: document.getElementById('global-flash-messages'),
    sidebarMenu: document.getElementById('sidebar-menu'),
    logoutBtn: document.getElementById('logout-btn'),
    userProfileLink: document.getElementById('user-profile-link'),
    userLoginDisplay: document.getElementById('user-login-display'),
    userRoleDisplay: document.getElementById('user-role-display'),
    userAvatarDisplay: document.getElementById('user-avatar-display'),
    sidebarToggleBtn: document.getElementById('sidebar-toggle-btn'),
    mainContentArea: document.getElementById('main-content-area'), // Conteneur pour le contenu de la page
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
        buildSidebarMenu();
        setupGlobalEventListeners();
        loadPageContent(); // Charge le contenu de la page actuelle
    } else {
        // Si pas connecté, rediriger vers la page de connexion (déjà géré par auth.js)
        // ou afficher un message d'erreur si on est sur une page protégée
        if (window.location.pathname !== PATHS.LOGIN) {
            window.location.href = PATHS.LOGIN;
        }
    }
}

async function checkAuthAndLoadUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        currentUser = user;
        // Récupérer les données complètes de l'utilisateur depuis notre table 'utilisateur'
        const { data, error } = await dataService.getRecordById(TABLES.UTILISATEUR, currentUser.id);
        if (error) {
            console.error("Erreur lors du chargement des données utilisateur:", error);
            displayMessage(globalUI.flashMessageContainer, 'error', 'Erreur de chargement du profil.');
            await authService.signOut(); // Déconnecter si le profil DB est introuvable
            currentUser = null;
            return;
        }
        currentUser.profile = data; // Stocker les données du profil DB
        userRole = data.id_groupe_utilisateur;
        updateUserProfileUI();
    }
}

async function loadUserPermissions() {
    if (!currentUser || !userRole) return;

    // Récupérer les permissions du groupe de l'utilisateur
    const { data: rattachements, error: rattacherError } = await dataService.getRecords(TABLES.RATTACHER, {
        id_groupe_utilisateur: userRole
    });

    if (rattacherError) {
        console.error("Erreur lors du chargement des permissions:", rattacherError);
        displayMessage(globalUI.flashMessageContainer, 'error', 'Erreur de chargement des permissions.');
        return;
    }

    userPermissions = rattachements.map(r => r.id_traitement);

    // Pour les admins, ajouter toutes les permissions (vue absolue)
    if (userRole === ROLES.ADMIN_SYS) {
        const { data: allTreatments, error: treatmentsError } = await dataService.getRecords(TABLES.TRAITEMENT);
        if (!treatmentsError) {
            userPermissions = allTreatments.map(t => t.id_traitement);
        }
    }
}

function hasPermission(permissionCode) {
    return userPermissions.includes(permissionCode);
}

function updateUserProfileUI() {
    if (currentUser && currentUser.profile) {
        globalUI.userLoginDisplay.textContent = currentUser.profile.login_utilisateur;
        globalUI.userRoleDisplay.textContent = currentUser.profile.id_groupe_utilisateur; // Ou libellé plus convivial
        // Gérer l'avatar
        if (currentUser.profile.photo_profil) {
            globalUI.userAvatarDisplay.src = currentUser.profile.photo_profil; // URL depuis Supabase Storage
        } else {
            globalUI.userAvatarDisplay.src = '/assets/images/default-avatar.png';
        }
    }
}

async function buildSidebarMenu() {
    if (!globalUI.sidebarMenu) return;

    // Récupérer tous les traitements qui sont des éléments de menu (MENU_*)
    const { data: menuTreatments, error } = await dataService.getRecords(TABLES.TRAITEMENT, {
        id_traitement: { operator: 'like', value: 'MENU_%' } // Filtre pour les éléments de menu
    }, 'ordre_affichage ASC');

    if (error) {
        console.error("Erreur lors du chargement des éléments de menu:", error);
        return;
    }

    const menuItems = {};
    const rootItems = [];

    // Construire une map pour un accès facile et une hiérarchie
    menuTreatments.forEach(item => {
        menuItems[item.id_traitement] = { ...item, children: [] };
    });

    // Associer les enfants à leurs parents et identifier les racines
    for (const id in menuItems) {
        const item = menuItems[id];
        // Vérifier si l'utilisateur a la permission pour cet élément de menu ou l'un de ses enfants
        const isPermitted = hasPermission(item.id_traitement) || item.children.some(child => hasPermission(child.id_traitement));

        if (item.id_parent_traitement && menuItems[item.id_parent_traitement]) {
            if (isPermitted) { // N'ajouter l'enfant que si l'utilisateur a la permission
                menuItems[item.id_parent_traitement].children.push(item);
            }
        } else {
            if (isPermitted) { // N'ajouter la racine que si l'utilisateur a la permission
                rootItems.push(item);
            }
        }
    }

    // Trier les enfants par ordre_affichage
    for (const id in menuItems) {
        menuItems[id].children.sort((a, b) => a.ordre_affichage - b.ordre_affichage);
    }

    // Trier les racines par ordre_affichage
    rootItems.sort((a, b) => a.ordre_affichage - b.ordre_affichage);

    globalUI.sidebarMenu.innerHTML = ''; // Vider le menu existant

    rootItems.forEach(item => {
        if (item.children.length > 0) {
            // Élément avec sous-menu
            const details = document.createElement('details');
            details.className = 'nav-section'; // Utiliser une classe pour le style
            details.innerHTML = `
                <summary class="nav-section-title">${item.libelle_traitement}</summary>
                <ul class="nav-list">
                    ${item.children.map(child => `
                        <li class="nav-item">
                            <a href="${child.url_associee || '#'}" class="nav-link" data-permission="${child.id_traitement}">
                                <i class="${child.icone_class || 'fas fa-circle'} nav-icon"></i>
                                <span>${child.libelle_traitement}</span>
                            </a>
                        </li>
                    `).join('')}
                </ul>
            `;
            globalUI.sidebarMenu.appendChild(details);
        } else if (item.url_associee && hasPermission(item.id_traitement)) {
            // Élément de menu simple (sans enfants, avec URL)
            const li = document.createElement('li');
            li.className = 'nav-item';
            li.innerHTML = `
                <a href="${item.url_associee}" class="nav-link" data-permission="${item.id_traitement}">
                    <i class="${item.icone_class || 'fas fa-circle'} nav-icon"></i>
                    <span>${item.libelle_traitement}</span>
                </a>
            `;
            globalUI.sidebarMenu.appendChild(li);
        }
    });

    highlightActiveMenuItem();
}

function highlightActiveMenuItem() {
    const currentPath = window.location.pathname;
    globalUI.sidebarMenu.querySelectorAll('.nav-link').forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
            // Ouvrir les détails parents si c'est un sous-menu
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
        const { error } = await authService.signOut();
        if (error) {
            displayMessage(globalUI.flashMessageContainer, 'error', 'Erreur lors de la déconnexion.');
        } else {
            window.location.href = PATHS.LOGIN; // Rediriger vers la page de connexion
        }
    });

    // Gérer le toggle de la sidebar pour les petits écrans
    globalUI.sidebarToggleBtn?.addEventListener('click', () => {
        document.body.classList.toggle('sidebar-collapsed');
    });
}

// --- CHARGEMENT DU CONTENU DE LA PAGE SPÉCIFIQUE ---
async function loadPageContent() {
    const path = window.location.pathname;
    let pageScriptPath = null;

    // Déterminer le script JS à charger en fonction de l'URL
    if (path.startsWith('/pages/admin/')) {
        pageScriptPath = './pages/admin.js';
    } else if (path.startsWith('/pages/etudiant/')) {
        pageScriptPath = './pages/etudiant.js';
    } else if (path.startsWith('/pages/commission/')) {
        pageScriptPath = './pages/commission.js';
    } else if (path.startsWith('/pages/personnel/')) {
        pageScriptPath = './pages/personnel.js';
    }

    if (pageScriptPath) {
        try {
            const { initPage } = await import(pageScriptPath);
            if (typeof initPage === 'function') {
                initPage(currentUser, userPermissions); // Passer les données utilisateur et permissions
            }
        } catch (error) {
            console.error("Erreur lors du chargement du script de page:", error);
            displayMessage(globalUI.flashMessageContainer, 'error', 'Impossible de charger le contenu de la page.');
        }
    } else {
        console.warn("Aucun script de page spécifique trouvé pour l'URL:", path);
    }
}

// --- DÉMARRAGE DE L'APPLICATION GLOBALE ---
initGlobalApp();