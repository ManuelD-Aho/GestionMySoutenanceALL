// supabase/functions/_shared/email-service.ts

// Assurez-vous que ZOHO_MAIL_API_KEY et ZOHO_MAIL_FROM_ADDRESS sont définis dans les secrets de votre projet Supabase
const ZOHO_MAIL_API_KEY = Deno.env.get('ZOHO_MAIL_API_KEY');
const ZOHO_MAIL_FROM_ADDRESS = Deno.env.get('ZOHO_MAIL_FROM_ADDRESS') || 'no-reply@yourdomain.com';
const ZOHO_MAIL_FROM_NAME = Deno.env.get('ZOHO_MAIL_FROM_NAME') || 'GestionMySoutenance';
const ZOHO_MAIL_ACCOUNT_ID = Deno.env.get('ZOHO_MAIL_ACCOUNT_ID'); // Votre ID de compte Zoho Mail

/**
 * Envoie un e-mail via l'API Zoho Mail.
 * @param {string} to - Adresse e-mail du destinataire.
 * @param {string} subject - Sujet de l'e-mail.
 * @param {string} htmlBody - Corps de l'e-mail au format HTML.
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function sendEmail(to: string, subject: string, htmlBody: string): Promise<{ success: boolean; message: string }> {
    if (!ZOHO_MAIL_API_KEY || !ZOHO_MAIL_ACCOUNT_ID) {
        console.error('Zoho Mail API keys or Account ID are not set in Supabase secrets.');
        return { success: false, message: 'Email service not configured on server.' };
    }

    // L'URL de l'API Zoho Mail dépend de votre configuration.
    // Pour l'envoi de messages, c'est souvent /api/accounts/{accountId}/messages
    const zohoApiUrl = `https://mail.zoho.com/api/accounts/${ZOHO_MAIL_ACCOUNT_ID}/messages`;

    const requestBody = {
        fromAddress: ZOHO_MAIL_FROM_ADDRESS,
        toAddress: to,
        subject: subject,
        content: htmlBody,
        isHtml: true, // Important pour envoyer du HTML
        // Autres options comme 'ccAddress', 'bccAddress', 'attachments' peuvent être ajoutées
    };

    try {
        const response = await fetch(zohoApiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Zoho-oauthtoken ${ZOHO_MAIL_API_KEY}`, // Ou `Zoho-authtoken` ou `Bearer` selon le type de token Zoho
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        const responseData = await response.json();

        if (!response.ok) {
            console.error('Zoho Mail API error:', response.status, responseData);
            return { success: false, message: `Zoho Mail API error: ${responseData.errorMessage || response.statusText}` };
        }

        // Vérifiez la structure de la réponse Zoho pour confirmer le succès
        // La réponse de Zoho peut varier, adaptez cette condition si nécessaire.
        if (responseData.status === 'success' || responseData.data?.status === 'success') {
            return { success: true, message: 'Email sent successfully via Zoho.' };
        } else {
            console.error('Zoho Mail API response indicates failure:', responseData);
            return { success: false, message: responseData.errorMessage || 'Failed to send email via Zoho.' };
        }

    } catch (error) {
        console.error('Error sending email via Zoho Mail:', error);
        return { success: false, message: `Network or unexpected error: ${error.message}` };
    }
}