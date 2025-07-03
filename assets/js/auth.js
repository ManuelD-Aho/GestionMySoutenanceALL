// /assets/js/auth.js

import { authService } from './services/auth-service.js';
import { displayMessage, setButtonLoading } from './utils/helpers.js';
import { PATHS, ROLES } from './utils/constants.js';

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
    };

    const carouselContent = [
        { title: "Fluidifiez votre parcours.", text: "De la soumission à la validation, tout est centralisé." },
        { title: "Collaboration simplifiée.", text: "Interagissez avec votre directeur et les membres de la commission." },
        { title: "Suivi en temps réel.", text: "Visualisez l'avancement de votre validation à chaque étape." }
    ];

    // --- FONCTIONS D'INITIALISATION ---
    async function init() {
        const user = await authService.getUser();
        if (user) {
            redirectToDashboard(user.profile.id_groupe_utilisateur);
            return;
        }

        ui.welcomePortal.classList.remove('hidden');
        setupEventListeners();
        startCarousel();
    }

    // --- GESTION DES ÉVÉNEMENTS ---
    function setupEventListeners() {
        ui.enterLoginBtn.addEventListener('click', showAuthContainer);
        ui.links.forgotPassword.addEventListener('click', (e) => { e.preventDefault(); switchForm('forgotPassword', 'left'); });
        ui.links.backToLogin.addEventListener('click', (e) => { e.preventDefault(); switchForm('login', 'right'); });

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
        ui.authContainer.classList.remove('hidden');
        setTimeout(() => ui.authContainer.classList.add('visible'), 50);
    }

    function switchForm(targetFormKey, direction = 'left') {
        if (state.currentForm === targetFormKey) return;

        const currentFormEl = ui.forms[state.currentForm];
        const targetFormEl = ui.forms[targetFormKey];

        if (!currentFormEl || !targetFormEl) {
            console.error(`Formulaire ${state.currentForm} ou ${targetFormKey} non trouvé.`);
            return;
        }

        const exitClass = direction === 'left' ? 'form-exit-to-left' : 'form-exit-to-right';
        const enterClass = direction === 'left' ? 'form-enter-from-right' : 'form-enter-from-left';

        // Set fixed height to prevent collapse
        ui.formWrapper.style.height = `${currentFormEl.offsetHeight}px`;

        // Animate out
        currentFormEl.classList.remove('form-active');
        currentFormEl.classList.add(exitClass);

        setTimeout(() => {
            currentFormEl.style.display = 'none';
            currentFormEl.classList.remove(exitClass);

            // Prepare to animate in
            targetFormEl.style.display = 'block';
            targetFormEl.classList.add(enterClass);

            // Set height for the new form
            ui.formWrapper.style.height = `${targetFormEl.offsetHeight}px`;

            // Force reflow before adding active class
            void targetFormEl.offsetWidth;

            // Animate in
            targetFormEl.classList.remove(enterClass);
            targetFormEl.classList.add('form-active');

            state.currentForm = targetFormKey;

            // Reset height to auto after animation
            setTimeout(() => {
                ui.formWrapper.style.height = 'auto';
            }, 500);
        }, 400);
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

    // --- LOGIQUE MÉTIER (Appels au service de simulation) ---
    async function handleFormSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const button = form.querySelector('button[type="submit"]');
        setButtonLoading(button, true);

        let email, password;
        let result;

        switch (form.id) {
            case 'login-form':
                email = ui.inputs.loginEmail.value;
                password = ui.inputs.loginPassword.value;
                result = await authService.signIn(email, password);

                if (result.error) {
                    displayMessage(ui.feedbackContainer, 'error', result.error.message);
                } else {
                    displayMessage(ui.feedbackContainer, 'success', 'Connexion réussie ! Redirection...');
                    setTimeout(() => redirectToDashboard(result.user.profile.id_groupe_utilisateur), 1000);
                }
                break;

            case 'forgot-password-form':
                email = ui.inputs.forgotEmail.value;
                result = await authService.sendPasswordReset(email);
                if (result.error) {
                    displayMessage(ui.feedbackContainer, 'error', result.error.message);
                } else {
                    displayMessage(ui.feedbackContainer, 'success', result.message);
                }
                break;

            // Les autres formulaires (2FA, reset) sont simplifiés pour cette démo
            // car ils nécessiteraient une logique de token plus complexe.
        }
        setButtonLoading(button, false);
    }

    function redirectToDashboard(role) {
        let path = PATHS.ETUDIANT_DASHBOARD; // Default
        switch (role) {
            case ROLES.ADMIN_SYS:
                path = PATHS.ADMIN_DASHBOARD;
                break;
            case ROLES.ETUDIANT:
                path = PATHS.ETUDIANT_DASHBOARD;
                break;
            case ROLES.COMMISSION:
            case ROLES.ENSEIGNANT:
                path = PATHS.COMMISSION_DASHBOARD;
                break;
            case ROLES.PERS_ADMIN:
            case ROLES.RS:
            case ROLES.AGENT_CONFORMITE:
                path = PATHS.PERSONNEL_DASHBOARD;
                break;
        }
        window.location.href = path;
    }

    // --- LOGIQUE DU CARROUSEL ---
    function startCarousel() {
        const images = Array.from(ui.carousel.querySelectorAll('.carousel-image'));

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

        showNextItem(); // Initial call
        state.carouselInterval = setInterval(showNextItem, 8000);
    }

    // --- DÉMARRAGE ---
    init();
});