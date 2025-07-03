// supabase/functions/send-password-reset-email/index.ts

// @ts-ignore
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.4';
import { sendEmail } from '../_shared/email-service.ts'; // Votre service Zoho

serve(async (req) => {
    try {
        const { email } = await req.json();

        if (!email) {
            return new Response(JSON.stringify({ error: 'Email is required' }), {
                headers: { 'Content-Type': 'application/json' },
                status: 400,
            });
        }

        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', // Utiliser la clé service_role pour les opérations DB sensibles
            { auth: { persistSession: false } }
        );

        // 1. Générer un token de réinitialisation et un lien
        const { data: { properties }, error: generateLinkError } = await supabaseClient.auth.admin.generateLink({
            type: 'password_reset',
            email: email,
            redirectTo: `${Deno.env.get('APP_URL')}/index.html?form=reset_password`,
        });

        if (generateLinkError) {
            console.error('Supabase Auth generateLink error:', generateLinkError);
            // Ne pas révéler si l'email existe ou non pour des raisons de sécurité
            return new Response(JSON.stringify({ message: 'If the email exists, a password reset link has been sent.' }), {
                headers: { 'Content-Type': 'application/json' },
                status: 200,
            });
        }

        // Le lien de réinitialisation est dans properties.action_link
        const resetLink = properties?.action_link;
        if (!resetLink) {
            return new Response(JSON.stringify({ error: 'Failed to generate reset link.' }), {
                headers: { 'Content-Type': 'application/json' },
                status: 500,
            });
        }

        // 2. Envoyer l'e-mail via Zoho
        const emailSubject = 'Réinitialisation de votre mot de passe pour GestionMySoutenance';
        const emailBody = `
      <p>Bonjour,</p>
      <p>Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le lien suivant :</p>
      <p><a href="${resetLink}">${resetLink}</a></p>
      <p>Ce lien expirera dans une heure.</p>
      <p>Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet e-mail.</p>
      <p>Merci,<br>L'équipe GestionMySoutenance</p>
    `;

        const { success, message: zohoMessage } = await sendEmail(email, emailSubject, emailBody);

        if (!success) {
            console.error('Zoho Email send error:', zohoMessage);
            return new Response(JSON.stringify({ error: 'Failed to send reset email via Zoho.' }), {
                headers: { 'Content-Type': 'application/json' },
                status: 500,
            });
        }

        return new Response(JSON.stringify({ message: 'If the email exists, a password reset link has been sent.' }), {
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