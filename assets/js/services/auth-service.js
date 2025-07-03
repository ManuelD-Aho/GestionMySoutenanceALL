// /assets/js/services/auth-service.js

import { supabase } from './supabase-client.js';
import { functionService } from './function-service.js'; // Pour appeler les fonctions Edge
import { TABLES, EDGE_FUNCTIONS } from '../utils/constants.js'; // Pour accéder aux noms de tables

/**
 * Tente de connecter un utilisateur avec son email et son mot de passe.
 * @param {string} email - L'email de l'utilisateur.
 * @param {string} password - Le mot de passe de l'utilisateur.
 * @returns {Promise<{data: object|null, error: object|null}>} - Un objet contenant les données de session en cas de succès, ou une erreur.
 */
async function signIn(email, password) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        return { data, error };
    } catch (error) {
        console.error("Erreur inattendue lors de la connexion:", error);
        return { data: null, error: { message: "Une erreur inattendue est survenue." } };
    }
}

/**
 * Déconnecte l'utilisateur.
 * @returns {Promise<{error: object|null}>}
 */
async function signOut() {
    try {
        const { error } = await supabase.auth.signOut();
        return { error };
    } catch (error) {
        console.error("Erreur inattendue lors de la déconnexion:", error);
        return { error: { message: "Une erreur inattendue est survenue." } };
    }
}

/**
 * Envoie un lien de réinitialisation de mot de passe.
 * @param {string} email - L'email de l'utilisateur.
 * @returns {Promise<{success: boolean, message: string}>}
 */
async function sendPasswordReset(email) {
    // On appelle la fonction Edge pour gérer l'envoi de l'email via Zoho
    return await functionService.sendPasswordResetEmail(email);
}

/**
 * Met à jour le mot de passe de l'utilisateur.
 * @param {string} newPassword - Le nouveau mot de passe.
 * @returns {Promise<{error: object|null}>}
 */
async function updatePassword(newPassword) {
    try {
        // Supabase Auth gère la vérification de l'utilisateur connecté via le token JWT.
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        return { error };
    } catch (error) {
        console.error("Erreur inattendue lors de la mise à jour du mot de passe:", error);
        return { error: { message: "Une erreur inattendue est survenue." } };
    }
}

/**
 * Active l'authentification à deux facteurs (2FA) pour l'utilisateur.
 * @param {string} totpCode - Le code TOTP fourni par l'utilisateur.
 * @returns {Promise<{error: object|null}>}
 */
async function enable2Fa(totpCode) {
    const user = await supabase.auth.getUser();
    if (!user.data.user) return { error: { message: "Utilisateur non connecté." } };

    const { valid, message } = await functionService.verify2FaCode(user.data.user.id, totpCode);

    if (!valid) {
        return { error: { message: message || "Code 2FA invalide." } };
    }

    // Si le code est valide, mettez à jour le statut 2FA dans votre table 'utilisateur'
    // (Le secret a déjà été stocké par generate2FaSecret)
    const { error: dbError } = await supabase
        .from(TABLES.UTILISATEUR)
        .update({ preferences_2fa_active: true })
        .eq('numero_utilisateur', user.data.user.id);

    return { error: dbError };
}

/**
 * Désactive l'authentification à deux facteurs (2FA) pour l'utilisateur.
 * @param {string} password - Le mot de passe actuel de l'utilisateur pour confirmation.
 * @returns {Promise<{error: object|null}>}
 */
async function disable2Fa(password) {
    const user = await supabase.auth.getUser();
    if (!user.data.user) return { error: { message: "Utilisateur non connecté." } };

    // Pour désactiver la 2FA, il est crucial de vérifier le mot de passe actuel.
    // Supabase Auth ne permet pas de vérifier le mot de passe actuel sans un signIn.
    // La meilleure approche est de re-signer l'utilisateur avec son email et mot de passe.
    const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.data.user.email,
        password: password,
    });

    if (signInError) {
        return { error: { message: "Mot de passe actuel incorrect." } };
    }

    // Si le mot de passe est correct, désactiver la 2FA dans la table 'utilisateur'
    const { error: dbError } = await supabase
        .from(TABLES.UTILISATEUR)
        .update({ preferences_2fa_active: false, secret_2fa: null }) // Supprimer le secret aussi
        .eq('numero_utilisateur', user.data.user.id);

    return { error: dbError };
}

/**
 * Gère la réinitialisation du mot de passe via un token (après un lien de réinitialisation).
 * @param {string} newPassword - Le nouveau mot de passe.
 * @param {string} token - Le token de réinitialisation reçu dans l'URL.
 * @returns {Promise<{error: object|null}>}
 */
async function resetPassword(newPassword, token) {
    try {
        const { error } = await supabase.auth.verifyOtp({
            email: '', // L'email n'est pas nécessaire ici si le token est complet
            token: token,
            type: 'password_reset',
        });

        if (error) {
            return { error: { message: "Token invalide ou expiré." } };
        }

        // Si le token est valide, on peut mettre à jour le mot de passe
        const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
        return { error: updateError };

    } catch (error) {
        console.error("Erreur inattendue lors de la réinitialisation du mot de passe:", error);
        return { error: { message: "Une erreur inattendue est survenue." } };
    }
}

/**
 * Valide l'email d'un utilisateur via un token.
 * @param {string} token - Le token de validation d'email.
 * @returns {Promise<{success: boolean, message: string}>}
 */
async function validateEmailToken(token) {
    // Cette fonction appelle la fonction Edge pour valider le token dans la DB
    return await functionService.validateEmailToken(token);
}

/**
 * Inscrit un nouvel utilisateur via Supabase Auth.
 * @param {string} email - L'email de l'utilisateur.
 * @param {string} password - Le mot de passe de l'utilisateur.
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
async function signUp(email, password) {
    try {
        const { data, error } = await supabase.auth.signUp({ email, password });
        return { data, error };
    } catch (error) {
        console.error("Erreur inattendue lors de l'inscription:", error);
        return { data: null, error: { message: "Une erreur inattendue est survenue." } };
    }
}


export const authService = {
    signIn,
    signOut,
    sendPasswordReset,
    updatePassword,
    enable2Fa,
    disable2Fa,
    resetPassword,
    validateEmailToken,
    signUp, // Ajout à l'export
};