// /assets/js/auth.js

import { supabase } from './services/supabase-client.js';
import { authService } from './services/auth-service.js';
import { functionService } from './services/function-service.js';
import { displayMessage, setButtonLoading } from './utils/helpers.js';
import { PATHS } from './utils/constants.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- SÉLECTION DES ÉLÉMENTS DU DOM ---
    const ui = {
        welcomePortal: document.getElementById('welcome-portal'),
        enterLoginBtn: document.getElementById('enter-login-btn'),
        authContainer: document.getElementById('auth-container'),
        formWrapper: document.getElementById('form-wrapper'),
        forms: {
            login: document.getElementById('login-form'),
            forgotPassword: document.getElementById('forgot-password-form'),
            twoFa: document.getElementById('2fa-form'),
            resetPassword: document.getElementById('reset-password-form'),
        },
        inputs: {
            loginEmail: document.getElementById('login-email'),
            loginPassword: document.getElementById('login-password'),
            forgotEmail: document.getElementById('forgot-email'),
            twoFaCode: document.getElementById('2fa-code'),
            resetPasswordToken: document.getElementById('reset-password-token'),
            newPassword: document.getElementById('new-password'),
            confirmNewPassword: document.getElementById('confirm-new-password'),
        },
        links: {
            forgotPassword: document.getElementById('forgot-password-link'),
            backToLogin: document.getElementById('back-to-login-link'),
        },
        passwordToggles: document.querySelectorAll('[data-toggle-password]'),
        carousel: document.getElementById('auth-carousel'),
        carouselTextContainer: document.getElementById('carousel-text-container'),
        feedbackContainer: document.getElementById('form-feedback'),
    };

    // --- ÉTAT DE L'APPLICATION ---
    let state = {
        currentForm: 'login',
        carouselInterval: null,
        carouselIndex: 0,
        pending2FaUserId: null, // Utilisateur en attente de 2FA
    };

    const carouselContent = [
        { title: "Fluidifiez votre parcours.", text: "De la soumission à la validation, tout est centralisé." },
        { title: "Collaboration simplifiée.", text: "Interagissez avec votre directeur et les membres de la commission." },
        { title: "Suivi en temps réel.", text: "Visualisez l'avancement de votre validation à chaque étape." }
    ];

    // --- FONCTIONS D'INITIALISATION ---
    async function init() {
        // Vérifier si l'utilisateur est déjà connecté
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            // Rediriger vers le dashboard approprié (main.js gérera la redirection spécifique au rôle)
            window.location.href = PATHS.ETUDIANT_DASHBOARD; // Exemple de redirection par défaut
            return;
        }

        // Gérer les formulaires via l'URL (pour les liens de réinitialisation/validation)
        const urlParams = new URLSearchParams(window.location.search);
        const formParam = urlParams.get('form');
        const tokenParam = urlParams.get('token');
        const impersonateTokenParam = urlParams.get('impersonate_token'); // Pour l'impersonation

        if (formParam === 'reset_password' && tokenParam) {
            ui.inputs.resetPasswordToken.value = tokenParam;
            switchForm('resetPassword');
        } else if (formParam === 'validate_email' && tokenParam) {
            await handleEmailValidation(tokenParam);
        } else if (impersonateTokenParam) {
            await handleImpersonationLogin(impersonateTokenParam);
        } else {
            // Par défaut, afficher le portail d'accueil
            ui.welcomePortal.classList.remove('hidden');
        }

        setupEventListeners();
        startCarousel();
    }

    // --- GESTION DES ÉVÉNEMENTS ---
    function setupEventListeners() {
        ui.enterLoginBtn.addEventListener('click', showAuthContainer);
        ui.links.forgotPassword.addEventListener('click', (e) => { e.preventDefault(); switchForm('forgotPassword'); });
        ui.links.backToLogin.addEventListener('click', (e) => { e.preventDefault(); switchForm('login'); });

        Object.values(ui.forms).forEach(form => {
            if (form) {
                form.addEventListener('submit', handleFormSubmit);
            }
        });
        ui.passwordToggles.forEach(toggle => toggle.addEventListener('click', togglePasswordVisibility));
    }

    // --- LOGIQUE D'ANIMATION ET D'INTERFACE ---
    function showAuthContainer() {
        ui.welcomePortal.classList.add('hidden');
        ui.authContainer.classList.add('visible');
    }

    function switchForm(targetFormKey) {
        if (state.currentForm === targetFormKey) return;

        const currentFormEl = ui.forms[state.currentForm];
        const targetFormEl = ui.forms[targetFormKey];

        if (!currentFormEl || !targetFormEl) {
            console.error(`Formulaire ${state.currentForm} ou ${targetFormKey} non trouvé.`);
            return;
        }

        ui.formWrapper.style.height = `${currentFormEl.offsetHeight}px`;

        currentFormEl.classList.remove('form-active');
        currentFormEl.classList.add('form-exit-to-left');

        setTimeout(() => {
            currentFormEl.style.display = 'none';
            currentFormEl.classList.remove('form-exit-to-left');

            targetFormEl.style.display = 'block';
            targetFormEl.classList.add('form-enter-from-right');

            ui.formWrapper.style.height = `${targetFormEl.offsetHeight}px`;
            void targetFormEl.offsetWidth;

            targetFormEl.classList.remove('form-enter-from-right');
            targetFormEl.classList.add('form-active');

            state.currentForm = targetFormKey;

            setTimeout(() => {
                ui.formWrapper.style.height = 'auto';
            }, 600);
        }, 500);
    }

    function togglePasswordVisibility(e) {
        const button = e.currentTarget;
        const inputId = button.dataset.togglePassword;
        const input = document.getElementById(inputId);
        const icon = button.querySelector('i');

        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.replace('fa-eye', 'fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.replace('fa-eye-slash', 'fa-eye');
        }
    }

    function setButtonLoading(button, isLoading) {
        const spinner = button.querySelector('.loading-spinner');
        const text = button.querySelector('.btn-text');
        if (!spinner || !text) return;

        button.disabled = isLoading;
        if (isLoading) {
            button.classList.add('loading');
            spinner.style.display = 'inline-block';
            text.style.display = 'none';
        } else {
            button.classList.remove('loading');
            spinner.style.display = 'none';
            text.style.display = 'inline-block';
        }
    }

    function displayMessage(type, message) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `feedback-alert ${type}`;
        const iconClass = {
            'error': 'fa-times-circle',
            'success': 'fa-check-circle',
            'info': 'fa-info-circle',
            'warning': 'fa-exclamation-triangle'
        }[type] || 'fa-info-circle';

        alertDiv.innerHTML = `<i class="fas ${iconClass}"></i><p>${message}</p>`;

        ui.feedbackContainer.innerHTML = '';
        ui.feedbackContainer.appendChild(alertDiv);

        setTimeout(() => {
            alertDiv.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            alertDiv.style.opacity = '0';
            alertDiv.style.transform = 'translateY(-10px)';
            setTimeout(() => alertDiv.remove(), 500);
        }, 5000);
    }

    // --- LOGIQUE MÉTIER (Appels réels à Supabase) ---
    async function handleFormSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const button = form.querySelector('button[type="submit"]');
        setButtonLoading(button, true);

        let email, password, totpCode, newPassword, confirmPassword, token;
        let result;

        switch (form.id) {
            case 'login-form':
                email = ui.inputs.loginEmail.value;
                password = ui.inputs.loginPassword.value;
                result = await authService.signIn(email, password);

                if (result.error) {
                    // Gérer les erreurs spécifiques de Supabase Auth
                    if (result.error.message.includes('Email not confirmed')) {
                        displayMessage('warning', 'Votre email n\'est pas confirmé. Veuillez vérifier votre boîte de réception.');
                    } else if (result.error.message.includes('Invalid login credentials')) {
                        displayMessage('error', 'Identifiants incorrects.');
                    } else if (result.error.message.includes('User not found')) {
                        displayMessage('error', 'Utilisateur non trouvé.');
                    } else {
                        displayMessage('error', result.error.message);
                    }
                } else if (result.data.user && result.data.user.app_metadata.mfa_enabled) {
                    // Si 2FA est activée pour l'utilisateur, passer au formulaire 2FA
                    state.pending2FaUserId = result.data.user.id; // Stocker l'ID pour la vérification 2FA
                    switchForm('twoFa');
                    displayMessage('info', 'Vérification à deux facteurs requise.');
                } else {
                    displayMessage('success', 'Connexion réussie ! Redirection...');
                    // Redirection gérée par main.js après la connexion
                    setTimeout(() => window.location.href = PATHS.ETUDIANT_DASHBOARD, 1000);
                }
                break;

            case 'forgot-password-form':
                email = ui.inputs.forgotEmail.value;
                result = await authService.sendPasswordReset(email);
                if (!result.success) {
                    displayMessage('error', result.message);
                } else {
                    displayMessage('success', result.message);
                }
                break;

            case '2fa-form':
                totpCode = ui.inputs.twoFaCode.value;
                if (!state.pending2FaUserId) {
                    displayMessage('error', 'Session 2FA expirée. Veuillez vous reconnecter.');
                    switchForm('login');
                    break;
                }
                result = await functionService.verify2FaCode(state.pending2FaUserId, totpCode);
                if (!result.valid) {
                    displayMessage('error', result.message);
                } else {
                    // Si le code 2FA est valide, on peut maintenant définir la session Supabase
                    // Supabase Auth ne fournit pas directement un moyen de "confirmer" la 2FA après signInWithPassword
                    // sans un flux spécifique. La meilleure approche est de laisser l'utilisateur se reconnecter
                    // après avoir activé la 2FA, ou d'utiliser un flux de "challenge" si Supabase le supporte.
                    // Pour cet exemple, si le code est valide, on considère l'utilisateur connecté.
                    displayMessage('success', 'Vérification 2FA réussie ! Redirection...');
                    setTimeout(() => window.location.href = PATHS.ETUDIANT_DASHBOARD, 1000);
                }
                break;

            case 'reset-password-form':
                newPassword = ui.inputs.newPassword.value;
                confirmPassword = ui.inputs.confirmNewPassword.value;
                token = ui.inputs.resetPasswordToken.value;

                if (newPassword !== confirmPassword) {
                    displayMessage('error', 'Les mots de passe ne correspondent pas.');
                    break;
                }
                // Validation de robustesse du mot de passe (à ajouter dans helpers.js)
                // if (!validatePasswordStrength(newPassword)) { displayMessage('error', 'Mot de passe trop faible.'); break; }

                result = await authService.resetPassword(newPassword, token);
                if (result.error) {
                    displayMessage('error', result.error.message);
                } else {
                    displayMessage('success', 'Mot de passe réinitialisé ! Vous pouvez maintenant vous connecter.');
                    switchForm('login');
                }
                break;
        }
        setButtonLoading(button, false);
    }

    async function handleEmailValidation(token) {
        displayMessage('info', 'Validation de votre adresse email en cours...');
        const { success, message } = await functionService.validateEmailToken(token);
        if (success) {
            displayMessage('success', message);
        } else {
            displayMessage('error', message);
        }
        // Nettoyer l'URL après la validation
        window.history.replaceState({}, document.title, window.location.pathname);
        // Afficher le formulaire de connexion
        showAuthContainer();
        switchForm('login');
    }

    async function handleImpersonationLogin(impersonateToken) {
        displayMessage('info', 'Connexion en mode impersonation...');
        try {
            // Utiliser le token d'impersonation pour se connecter en tant qu'utilisateur cible
            const { data, error } = await supabase.auth.signInWithIdToken({
                provider: 'email', // Ou le fournisseur approprié si le token est un ID token
                token: impersonateToken,
            });

            if (error) {
                displayMessage('error', `Échec de l'impersonation: ${error.message}`);
            } else {
                displayMessage('success', 'Impersonation réussie ! Redirection...');
                // Rediriger vers le dashboard approprié (main.js gérera la redirection spécifique au rôle)
                setTimeout(() => window.location.href = PATHS.ETUDIANT_DASHBOARD, 1000);
            }
        } catch (error) {
            displayMessage('error', `Erreur inattendue lors de l'impersonation: ${error.message}`);
        } finally {
            // Nettoyer l'URL après l'impersonation
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }

    // --- LOGIQUE DU CARROUSEL ---
    function startCarousel() {
        const images = ui.carousel.querySelectorAll('.carousel-image');

        function showNextItem() {
            const currentTextEl = ui.carouselTextContainer.querySelector('.carousel-text-item');
            if (currentTextEl) {
                currentTextEl.style.opacity = 0;
                currentTextEl.style.transform = 'translateY(20px)';
            }

            images[state.carouselIndex].classList.remove('active');
            state.carouselIndex = (state.carouselIndex + 1) % images.length;
            images[state.carouselIndex].classList.add('active');

            setTimeout(() => {
                const newItem = carouselContent[state.carouselIndex];
                ui.carouselTextContainer.innerHTML = `
                    <div class="carousel-text-item" style="opacity: 0; transform: translateY(-20px); transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);">
                        <h2>${newItem.title}</h2>
                        <p>${newItem.text}</p>
                    </div>`;
                setTimeout(() => {
                    const newTextEl = ui.carouselTextContainer.querySelector('.carousel-text-item');
                    if (newTextEl) {
                        newTextEl.style.opacity = 1;
                        newTextEl.style.transform = 'translateY(0)';
                    }
                }, 50);
            }, 800);
        }

        showNextItem();
        state.carouselInterval = setInterval(showNextItem, 8000);
    }

    // --- DÉMARRAGE ---
    init();
});