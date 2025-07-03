import { ID_PREFIXES } from './constants.js';

/**
 * Affiche un message d'alerte dans un conteneur spécifié.
 * @param {HTMLElement} container - Le conteneur HTML où afficher l'alerte.
 * @param {string} type - Le type de message ('success', 'error', 'warning', 'info').
 * @param {string} message - Le texte du message.
 * @param {number} [duration=5000] - Durée d'affichage en ms.
 */
export function displayMessage(container, type, message, duration = 5000) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `feedback-alert ${type}`;
    const iconClass = {
        'success': 'fa-check-circle',
        'error': 'fa-times-circle',
        'warning': 'fa-exclamation-triangle',
        'info': 'fa-info-circle'
    }[type] || 'fa-info-circle';

    alertDiv.innerHTML = `<i class="fas ${iconClass}"></i><p>${message}</p>`;

    container.innerHTML = ''; // Vider les messages précédents
    container.appendChild(alertDiv);

    // Animation de disparition
    setTimeout(() => {
        alertDiv.style.opacity = '0';
        alertDiv.style.transform = 'translateY(-10px)';
        setTimeout(() => alertDiv.remove(), 500); // Supprimer après la transition
    }, duration);
}

/**
 * Gère l'état de chargement d'un bouton (spinner, texte, désactivation).
 * @param {HTMLButtonElement} button - Le bouton HTML.
 * @param {boolean} isLoading - True pour activer l'état de chargement, false pour le désactiver.
 */
export function setButtonLoading(button, isLoading) {
    const spinner = button.querySelector('.loading-spinner');
    const text = button.querySelector('.btn-text');
    if (!spinner || !text) return; // S'assurer que les éléments existent

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

/**
 * Génère un identifiant unique basé sur un préfixe, l'année courante et une séquence.
 * Dans une architecture Supabase, la séquence serait gérée par une fonction Edge ou un trigger DB.
 * Pour l'instant, nous simulons une séquence simple côté client.
 * @param {string} prefixKey - La clé du préfixe dans ID_PREFIXES (ex: 'ETUDIANT').
 * @returns {string} L'identifiant généré (ex: 'ETU-2024-0001').
 */
export function generateUniqueId(prefixKey) {
    const prefix = ID_PREFIXES[prefixKey];
    if (!prefix) {
        console.error(`Préfixe inconnu pour la génération d'ID: ${prefixKey}`);
        return `ERR-${Date.now()}`;
    }
    const year = new Date().getFullYear();
    // Ceci est une SIMULATION. En production, vous feriez un appel à une fonction Edge
    // qui incrémenterait une séquence dans la DB de manière atomique.
    // Pour le test frontend, on peut utiliser un timestamp ou un compteur local simple.
    const sequence = Math.floor(Math.random() * 10000); // Simulation simple
    return `${prefix}-${year}-${String(sequence).padStart(4, '0')}`;
}

/**
 * Formate une date en chaîne de caractères lisible.
 * @param {string|Date} dateInput - La date à formater.
 * @returns {string} La date formatée (ex: "15/03/2024").
 */
export function formatDate(dateInput) {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return ''; // Invalid date
    return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

/**
 * Capitalise la première lettre d'une chaîne.
 * @param {string} string - La chaîne à modifier.
 * @returns {string} La chaîne avec la première lettre en majuscule.
 */
export function capitalizeFirstLetter(string) {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Valide un formulaire côté client.
 * @param {HTMLFormElement} form - Le formulaire à valider.
 * @returns {boolean} True si le formulaire est valide, false sinon.
 */
export function validateForm(form) {
    let isValid = true;
    form.querySelectorAll('[required]').forEach(input => {
        if (!input.value.trim()) {
            input.classList.add('input-error'); // Ajoutez une classe d'erreur CSS
            isValid = false;
        } else {
            input.classList.remove('input-error');
        }
    });
    // Ajoutez d'autres logiques de validation (email, minLength, etc.)
    return isValid;
}

/**
 * Récupère les données d'un formulaire sous forme d'objet.
 * @param {HTMLFormElement} form - Le formulaire.
 * @returns {object} Les données du formulaire.
 */
export function getFormData(form) {
    const formData = new FormData(form);
    const data = {};
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }
    return data;
}

/**
 * Remplit un formulaire avec des données.
 * @param {HTMLFormElement} form - Le formulaire à remplir.
 * @param {object} data - Les données à utiliser.
 */
export function fillForm(form, data) {
    for (const key in data) {
        const input = form.querySelector(`[name="${key}"]`);
        if (input) {
            if (input.type === 'checkbox' || input.type === 'radio') {
                input.checked = data[key];
            } else {
                input.value = data[key];
            }
        }
    }
}

/**
 * Ouvre une modale DaisyUI.
 * @param {HTMLDialogElement} modalElement - L'élément <dialog>.
 */
export function openModal(modalElement) {
    if (modalElement && typeof modalElement.showModal === 'function') {
        modalElement.showModal();
    }
}

/**
 * Ferme une modale DaisyUI.
 * @param {HTMLDialogElement} modalElement - L'élément <dialog>.
 */
export function closeModal(modalElement) {
    if (modalElement && typeof modalElement.close === 'function') {
        modalElement.close();
    }
}