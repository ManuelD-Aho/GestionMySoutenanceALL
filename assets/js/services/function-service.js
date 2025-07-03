// /assets/js/services/function-service.js

import { supabase } from './supabase-client.js';
import { EDGE_FUNCTIONS } from '../utils/constants.js';

/**
 * Appelle la fonction Edge 'send-password-reset-email'.
 * @param {string} email - L'adresse e-mail du destinataire.
 * @returns {Promise<{success: boolean, message: string}>}
 */
async function sendPasswordResetEmail(email) {
    try {
        const { data, error } = await supabase.functions.invoke(EDGE_FUNCTIONS.SEND_PASSWORD_RESET_EMAIL, {
            body: { email },
        });

        if (error) {
            throw error;
        }
        return { success: true, message: data.message || 'If the email exists, a password reset link has been sent.' };
    } catch (error) {
        console.error("Erreur lors de l'appel de la fonction d'envoi de réinitialisation de mot de passe:", error);
        return { success: false, message: error.message || "Échec de l'envoi du lien de réinitialisation." };
    }
}

/**
 * Appelle la fonction Edge 'send-email-validation'.
 * @param {string} userId - L'ID de l'utilisateur.
 * @param {string} email - L'adresse e-mail du destinataire.
 * @returns {Promise<{success: boolean, message: string}>}
 */
async function sendEmailValidation(userId, email) {
    try {
        const { data, error } = await supabase.functions.invoke(EDGE_FUNCTIONS.SEND_EMAIL_VALIDATION, {
            body: { userId, email },
        });

        if (error) {
            throw error;
        }
        return { success: true, message: data.message || 'Validation email sent successfully.' };
    } catch (error) {
        console.error("Erreur lors de l'appel de la fonction d'envoi de validation d'e-mail:", error);
        return { success: false, message: error.message || "Échec de l'envoi de l'e-mail de validation." };
    }
}

/**
 * Appelle la fonction Edge 'validate-email-token'.
 * @param {string} token - Le token de validation d'email.
 * @returns {Promise<{success: boolean, message: string}>}
 */
async function validateEmailToken(token) {
    try {
        const { data, error } = await supabase.functions.invoke(EDGE_FUNCTIONS.VALIDATE_EMAIL_TOKEN, {
            body: { token },
        });

        if (error) {
            throw error;
        }
        return { success: data.success, message: data.message };
    } catch (error) {
        console.error("Erreur lors de l'appel de la fonction de validation d'e-mail:", error);
        return { success: false, message: error.message || "Échec de la validation de l'e-mail." };
    }
}

/**
 * Appelle la fonction Edge 'generate-2fa-secret'.
 * @param {string} userId - L'ID de l'utilisateur.
 * @param {string} email - L'email de l'utilisateur (pour le label du QR code).
 * @returns {Promise<{success: boolean, secret?: string, qrCodeUrl?: string, message: string}>}
 */
async function generate2FaSecret(userId, email) {
    try {
        const { data, error } = await supabase.functions.invoke(EDGE_FUNCTIONS.GENERATE_2FA_SECRET, {
            body: { userId, email },
        });

        if (error) {
            throw error;
        }
        return { success: true, secret: data.secret, qrCodeUrl: data.qrCodeUrl, message: '2FA secret generated.' };
    } catch (error) {
        console.error("Erreur lors de l'appel de la fonction de génération de secret 2FA:", error);
        return { success: false, message: error.message || "Échec de la génération du secret 2FA." };
    }
}

/**
 * Appelle la fonction Edge 'verify-2fa-code'.
 * @param {string} userId - L'ID de l'utilisateur.
 * @param {string} totpCode - Le code TOTP à vérifier.
 * @returns {Promise<{valid: boolean, message: string}>}
 */
async function verify2FaCode(userId, totpCode) {
    try {
        const { data, error } = await supabase.functions.invoke(EDGE_FUNCTIONS.VERIFY_2FA_CODE, {
            body: { userId, totpCode },
        });

        if (error) {
            throw error;
        }
        return { valid: data.valid, message: data.message };
    } catch (error) {
        console.error("Erreur lors de l'appel de la fonction de vérification 2FA:", error);
        return { valid: false, message: error.message || "Échec de la vérification 2FA." };
    }
}

/**
 * Appelle la fonction Edge 'impersonate-user'.
 * @param {string} targetUserId - L'ID de l'utilisateur à impersonnaliser.
 * @returns {Promise<{success: boolean, impersonationLink?: string, message: string}>}
 */
async function impersonateUser(targetUserId) {
    try {
        // Le token de l'admin est automatiquement envoyé par le SDK Supabase si l'utilisateur est connecté.
        const { data, error } = await supabase.functions.invoke(EDGE_FUNCTIONS.IMPERSONATE_USER, {
            body: { targetUserId },
        });

        if (error) {
            throw error;
        }
        return { success: true, impersonationLink: data.impersonationLink, message: data.message || 'Impersonation successful.' };
    } catch (error) {
        console.error("Erreur lors de l'appel de la fonction d'impersonation:", error);
        return { success: false, message: error.message || "Échec de l'impersonation." };
    }
}

// On exporte les fonctions pour les rendre utilisables dans le reste de l'application.
export const functionService = {
    sendPasswordResetEmail,
    sendEmailValidation,
    validateEmailToken,
    generate2FaSecret,
    verify2FaCode,
    impersonateUser,
    // ... autres fonctions Edge (génération PDF, etc.)
};