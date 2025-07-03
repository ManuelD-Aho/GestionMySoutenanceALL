// /assets/js/auth.js

// Importez vos services si vous les avez déjà créés.
// Pour cet exemple, nous allons simuler les appels.
// import { authService } from './services/auth-service.js';
// import { functionService } from './services/function-service.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- ÉLÉMENTS DU DOM ---
    const welcomePortal = document.getElementById('welcome-portal');
    const enterLoginBtn = document.getElementById('enter-login-btn');
    const authContainer = document.getElementById('auth-container');
    const formWrapper = document.getElementById('form-wrapper');
    const forms = {
        login: document.getElementById('login-form'),
        forgotPassword: document.getElementById('forgot-password-form'),
    };
    const links = {
        forgotPassword: document.getElementById('forgot-password-link'),
        backToLogin: document.getElementById('back-to-login-link'),
    };
    const passwordToggles = document.querySelectorAll('[data-toggle-password]');
    const carouselContainer = document.getElementById('auth-carousel');
    const carouselTextContainer = document.getElementById('carousel-text-container');

    let currentForm = 'login';
    let carouselInterval;

    // --- DONNÉES POUR LE CARROUSEL ---
    const carouselItems = [
        {
            title: "Fluidifiez votre parcours.",
            text: "De la soumission de votre rapport à la validation finale, tout est centralisé pour votre réussite."
        },
        {
            title: "Une collaboration simplifiée.",
            text: "Interagissez facilement avec votre directeur de mémoire et les membres de la commission."
        },
        {
            title: "Suivi en temps réel.",
            text: "Visualisez l'avancement de votre validation à chaque étape, en toute transparence."
        }
    ];

    // --- FONCTIONS D'INITIALISATION ---
    function init() {
        setupEventListeners();
        startCarousel();
        // Simule une vérification d'authentification au chargement
        // Dans un vrai projet, vous appelleriez authService.getCurrentUser()
        const isLoggedIn = false; // Mettre à true pour tester la redirection
        if (isLoggedIn) {
            window.location.href = '/pages/etudiant/dashboard.html'; // ou autre dashboard
        }
    }

    // --- GESTION DES ÉVÉNEMENTS ---
    function setupEventListeners() {
        // Entrée sur le portail
        enterLoginBtn.addEventListener('click', showAuthContainer);

        // Liens de navigation entre formulaires
        links.forgotPassword.addEventListener('click', (e) => {
            e.preventDefault();
            switchForm('forgotPassword', 'right');
        });
        links.backToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            switchForm('login', 'left');
        });

        // Soumission des formulaires
        Object.values(forms).forEach(form => {
            if (form) {
                form.addEventListener('submit', handleFormSubmit);
            }
        });

        // Toggle pour afficher/masquer le mot de passe
        passwordToggles.forEach(toggle => {
            toggle.addEventListener('click', togglePasswordVisibility);
        });
    }

    // --- LOGIQUE D'ANIMATION ET D'INTERFACE ---
    function showAuthContainer() {
        welcomePortal.classList.add('hidden');
        authContainer.classList.add('visible');
    }

    function switchForm(targetFormKey, direction) {
        const currentFormEl = forms[currentForm];
        const targetFormEl = forms[targetFormKey];

        if (!currentFormEl || !targetFormEl) return;

        const exitClass = direction === 'right' ? 'form-exit-to-left' : 'form-exit-to-right';
        const enterClass = direction === 'right' ? 'form-enter-from-right' : 'form-enter-from-left';

        // 1. Appliquer la classe d'entrée (hors écran) au nouveau formulaire
        targetFormEl.classList.remove('form-inactive', 'form-exit-to-left', 'form-exit-to-right');
        targetFormEl.classList.add(enterClass);

        // 2. Appliquer la classe de sortie à l'ancien formulaire
        currentFormEl.classList.remove('form-active');
        currentFormEl.classList.add(exitClass);

        // 3. Forcer un reflow pour que le navigateur prenne en compte l'état initial
        void targetFormEl.offsetWidth;

        // 4. Animer le nouveau formulaire pour qu'il entre à l'écran
        targetFormEl.classList.remove('form-enter-from-right', 'form-enter-from-left');
        targetFormEl.classList.add('form-active');

        currentForm = targetFormKey;
    }

    function togglePasswordVisibility(e) {
        const button = e.currentTarget;
        const inputId = button.dataset.togglePassword;
        const input = document.getElementById(inputId);
        const icon = button.querySelector('i');

        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
        icon.classList.toggle('toggled');
    }

    function setButtonLoading(button, isLoading) {
        const spinner = button.querySelector('.loading-spinner');
        const text = button.querySelector('.btn-text');
        if (isLoading) {
            button.disabled = true;
            spinner.classList.remove('hidden');
            text.classList.add('hidden');
        } else {
            button.disabled = false;
            spinner.classList.add('hidden');
            text.classList.remove('hidden');
        }
    }

    function displayMessage(type, message) {
        const feedbackContainer = document.getElementById('form-feedback');
        const alertType = type === 'error' ? 'alert-error' : 'alert-success';
        const iconClass = type === 'error' ? 'fa-times-circle' : 'fa-check-circle';

        const alertDiv = document.createElement('div');
        alertDiv.className = `alert ${alertType} shadow-lg`;
        alertDiv.innerHTML = `
            <div>
                <i class="fas ${iconClass} text-xl"></i>
                <span>${message}</span>
            </div>
        `;
        feedbackContainer.innerHTML = ''; // Vider les anciens messages
        feedbackContainer.appendChild(alertDiv);

        setTimeout(() => {
            alertDiv.style.transition = 'opacity 0.5s ease';
            alertDiv.style.opacity = '0';
            setTimeout(() => alertDiv.remove(), 500);
        }, 5000); // Le message disparaît après 5 secondes
    }

    // --- LOGIQUE MÉTIER (Appels simulés à Supabase) ---
    async function handleFormSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const button = form.querySelector('button[type="submit"]');
        setButtonLoading(button, true);

        // Simulation d'un appel API
        await new Promise(resolve => setTimeout(resolve, 1500));

        switch (form.id) {
            case 'login-form':
                // Remplacez par : const { error } = await authService.signIn(...)
                const loginSuccess = Math.random() > 0.5; // Simule succès/échec
                if (loginSuccess) {
                    displayMessage('success', 'Connexion réussie ! Redirection...');
                    setTimeout(() => window.location.href = '/pages/etudiant/dashboard.html', 1000);
                } else {
                    displayMessage('error', 'Identifiants incorrects. Veuillez réessayer.');
                    setButtonLoading(button, false);
                }
                break;
            case 'forgot-password-form':
                // Remplacez par : const { error } = await functionService.sendEmailWithZoho(...)
                displayMessage('success', 'Si votre email existe, un lien de réinitialisation a été envoyé.');
                setButtonLoading(button, false);
                // On ne change pas de formulaire pour ne pas révéler si l'email existe
                break;
        }
    }

    // --- LOGIQUE DU CARROUSEL ---
    function startCarousel() {
        let currentIndex = 0;
        const images = carouselContainer.querySelectorAll('.carousel-image');

        function showNextItem() {
            // Animer le texte sortant
            const currentText = carouselTextContainer.querySelector('.carousel-text-item');
            if (currentText) {
                currentText.style.opacity = 0;
                currentText.style.transform = 'translateY(20px)';
            }

            // Changer l'image
            images[currentIndex].classList.remove('active');
            currentIndex = (currentIndex + 1) % images.length;
            images[currentIndex].classList.add('active');

            // Animer le nouveau texte entrant
            setTimeout(() => {
                const newItem = carouselItems[currentIndex];
                carouselTextContainer.innerHTML = `
                    <div class="carousel-text-item absolute inset-0 flex flex-col justify-center" style="opacity: 0; transform: translateY(-20px); transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);">
                        <h2 class="text-4xl font-bold font-montserrat mb-4">${newItem.title}</h2>
                        <p class="text-lg opacity-90">${newItem.text}</p>
                    </div>
                `;
                setTimeout(() => {
                    const newText = carouselTextContainer.querySelector('.carousel-text-item');
                    if (newText) {
                        newText.style.opacity = 1;
                        newText.style.transform = 'translateY(0)';
                    }
                }, 50);
            }, 800); // Délai pour laisser l'ancien texte disparaître
        }

        showNextItem(); // Afficher le premier item immédiatement
        carouselInterval = setInterval(showNextItem, 7000); // Changer toutes les 7 secondes
    }

    // --- DÉMARRAGE DE L'APPLICATION ---
    init();
});