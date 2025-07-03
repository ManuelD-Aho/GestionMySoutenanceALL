// /assets/js/utils/helpers.js

import { ID_PREFIXES } from './constants.js';

export function displayMessage(container, type, message, duration = 5000) {
    if (!container) return;
    const alertDiv = document.createElement('div');
    alertDiv.className = `feedback-alert ${type}`;
    const iconClass = {
        'success': 'fa-check-circle',
        'error': 'fa-times-circle',
        'warning': 'fa-exclamation-triangle',
        'info': 'fa-info-circle'
    }[type] || 'fa-info-circle';

    alertDiv.innerHTML = `<i class="fas ${iconClass}"></i><p>${message}</p>`;
    container.innerHTML = '';
    container.appendChild(alertDiv);

    setTimeout(() => {
        alertDiv.style.opacity = '0';
        setTimeout(() => alertDiv.remove(), 500);
    }, duration);
}

export function setButtonLoading(button, isLoading) {
    if (!button) return;
    const spinner = button.querySelector('.loading-spinner');
    const text = button.querySelector('.btn-text');

    button.disabled = isLoading;
    if (isLoading) {
        button.classList.add('loading');
        if (spinner) spinner.style.display = 'inline-block';
        if (text) text.style.display = 'none';
    } else {
        button.classList.remove('loading');
        if (spinner) spinner.style.display = 'none';
        if (text) text.style.display = 'inline-block';
    }
}

export function generateUniqueId(prefixKey) {
    const prefix = ID_PREFIXES[prefixKey] || prefixKey;
    const year = new Date().getFullYear();
    const sequence = Date.now() % 100000;
    return `${prefix}-${year}-${String(sequence).padStart(5, '0')}`;
}

export function formatDate(dateInput) {
    if (!dateInput) return 'N/A';
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return 'Date invalide';
    return date.toLocaleDateString('fr-FR', {
        year: 'numeric', month: '2-digit', day: '2-digit'
    });
}

export function capitalizeFirstLetter(string) {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export function validateForm(form) {
    let isValid = true;
    form.querySelectorAll('[required]').forEach(input => {
        if (!input.value.trim()) {
            input.style.borderColor = 'red';
            isValid = false;
        } else {
            input.style.borderColor = '';
        }
    });
    return isValid;
}

export function getFormData(form) {
    const formData = new FormData(form);
    const data = {};
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }
    return data;
}

export function fillForm(form, data) {
    if (!data) return;
    for (const key in data) {
        const input = form.querySelector(`[name="${key}"]`);
        if (input) {
            if (input.type === 'checkbox') {
                input.checked = !!data[key];
            } else if (input.type === 'date' && data[key]) {
                input.value = new Date(data[key]).toISOString().split('T')[0];
            } else {
                input.value = data[key] ?? '';
            }
        }
    }
}

export function openModal(modalElement) {
    if (modalElement && typeof modalElement.showModal === 'function') {
        modalElement.showModal();
    }
}

export function closeModal(modalElement) {
    if (modalElement && typeof modalElement.close === 'function') {
        modalElement.close();
    }
}