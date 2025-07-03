// /assets/js/services/function-service.js

// On importe notre client Supabase unique et déjà configuré.
import { supabase } from './supabase-client.js';

/**
 * Appelle la fonction Edge 'send-email' pour envoyer un e-mail via Zoho.
 * @param {string} to - L'adresse e-mail du destinataire.
 * @param {string} subject - Le sujet de l'e-mail.
 * @param {string} htmlBody - Le corps de l'e-mail au format HTML.
 * @returns {Promise<{success: boolean, message: string}>} - Un objet indiquant le succès ou l'échec.
 */
async function sendEmailWithZoho(to, subject, htmlBody) {
    try {
        // 'send-zoho-email' est le nom que vous donnerez à votre fonction Edge dans Supabase.
        const { data, error } = await supabase.functions.invoke('send-zoho-email', {
            body: { to, subject, htmlBody },
        });

        if (error) {
            throw error; // L'erreur sera attrapée par le bloc catch.
        }

        console.log('Réponse de la fonction Edge (email):', data);
        return { success: true, message: data.message || 'E-mail envoyé avec succès.' };

    } catch (error) {
        console.error("Erreur lors de l'appel de la fonction d'envoi d'e-mail:", error);
        return { success: false, message: error.message || "Échec de l'envoi de l'e-mail." };
    }
}

/**
 * Appelle la fonction Edge 'generate-pdf' pour créer un document et obtenir une URL de téléchargement.
 * @param {string} documentType - Le type de document à générer (ex: 'attestation_scolarite').
 * @param {object} documentData - Les données nécessaires pour remplir le document (ex: { studentId: '...' }).
 * @returns {Promise<{success: boolean, url?: string, message: string}>} - Un objet avec l'URL du PDF ou un message d'erreur.
 */
async function generatePdf(documentType, documentData) {
    try {
        // 'generate-pdf-document' est le nom de votre fonction Edge pour les PDF.
        const { data, error } = await supabase.functions.invoke('generate-pdf-document', {
            body: { documentType, documentData },
        });

        if (error) {
            throw error;
        }

        // La fonction Edge doit retourner une URL de téléchargement signée.
        if (data && data.downloadUrl) {
            return { success: true, url: data.downloadUrl, message: 'Document généré avec succès.' };
        } else {
            throw new Error("La fonction n'a pas retourné d'URL de téléchargement valide.");
        }

    } catch (error) {
        console.error('Erreur lors de la génération du PDF:', error);
        return { success: false, message: error.message || 'Échec de la génération du document.' };
    }
}

// On exporte les fonctions pour les rendre utilisables dans le reste de l'application.
export const functionService = {
    sendEmailWithZoho,
    generatePdf,
};