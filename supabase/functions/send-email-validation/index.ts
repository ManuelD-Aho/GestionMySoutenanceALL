// supabase/functions/send-email-validation/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.4';
import { sendEmail } from '../_shared/email-service.ts'; // Votre service Zoho

serve(async (req) => {
    try {
        const { userId, email } = await req.json();

        if (!userId || !email) {
            return new Response(JSON.stringify({ error: 'User ID and email are required' }), {
                headers: { 'Content-Type': 'application/json' },
                status: 400,
            });
        }

        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', // Utiliser la clé service_role pour les opérations DB sensibles
            { auth: { persistSession: false } }
        );

        // 1. Générer un token de validation d'email (UUID pour la robustesse)
        const validationToken = crypto.randomUUID();
        const expirationDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 heures

        // 2. Stocker le token dans la table 'utilisateur'
        const { error: dbUpdateError } = await supabaseClient
            .from('utilisateur')
            .update({
                token_validation_email: validationToken,
                date_expiration_token_reset: expirationDate, // Réutiliser cette colonne pour l'expiration du token de validation
            })
            .eq('numero_utilisateur', userId);

        if (dbUpdateError) {
            console.error('DB update error for email validation token:', dbUpdateError);
            return new Response(JSON.stringify({ error: 'Failed to generate validation token.' }), {
                headers: { 'Content-Type': 'application/json' },
                status: 500,
            });
        }

        // 3. Construire le lien de validation
        const validationLink = `${Deno.env.get('APP_URL')}/index.html?form=validate_email&token=${validationToken}`;

        // 4. Envoyer l'e-mail via Zoho
        const emailSubject = 'Validez votre adresse email pour GestionMySoutenance';
        const emailBody = `
      <p>Bonjour,</p>
      <p>Veuillez cliquer sur le lien suivant pour valider votre adresse email :</p>
      <p><a href="${validationLink}">${validationLink}</a></p>
      <p>Ce lien expirera dans 24 heures.</p>
      <p>Merci,<br>L'équipe GestionMySoutenance</p>
    `;

        const { success, message } = await sendEmail(email, emailSubject, emailBody);

        if (!success) {
            console.error('Zoho Email send error:', message);
            return new Response(JSON.stringify({ error: 'Failed to send validation email.' }), {
                headers: { 'Content-Type': 'application/json' },
                status: 500,
            });
        }

        return new Response(JSON.stringify({ message: 'Validation email sent successfully.' }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error) {
        console.error('Edge Function error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { 'Content-Type': 'application/json' },
            status: 500,
        });
    }
});