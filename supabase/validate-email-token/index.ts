// supabase/functions/validate-email-token/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.4';

serve(async (req) => {
    try {
        const { token } = await req.json();

        if (!token) {
            return new Response(JSON.stringify({ error: 'Token is required' }), {
                headers: { 'Content-Type': 'application/json' },
                status: 400,
            });
        }

        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', // Clé service_role pour modifier la table 'utilisateur'
            { auth: { persistSession: false } }
        );

        // 1. Chercher l'utilisateur par le token
        const { data: userData, error: fetchError } = await supabaseClient
            .from('utilisateur')
            .select('numero_utilisateur, email_valide, date_expiration_token_reset')
            .eq('token_validation_email', token)
            .single();

        if (fetchError || !userData) {
            console.error('Error fetching user by token:', fetchError);
            return new Response(JSON.stringify({ success: false, message: 'Invalid or expired token.' }), {
                headers: { 'Content-Type': 'application/json' },
                status: 400,
            });
        }

        // 2. Vérifier si l'email est déjà validé
        if (userData.email_valide) {
            return new Response(JSON.stringify({ success: false, message: 'Email is already validated.' }), {
                headers: { 'Content-Type': 'application/json' },
                status: 409, // Conflict
            });
        }

        // 3. Vérifier l'expiration du token
        const expirationDate = new Date(userData.date_expiration_token_reset);
        if (new Date() > expirationDate) {
            // Nettoyer le token expiré pour éviter les réutilisations
            await supabaseClient
                .from('utilisateur')
                .update({ token_validation_email: null, date_expiration_token_reset: null })
                .eq('numero_utilisateur', userData.numero_utilisateur);
            return new Response(JSON.stringify({ success: false, message: 'Token has expired. Please request a new validation link.' }), {
                headers: { 'Content-Type': 'application/json' },
                status: 410, // Gone
            });
        }

        // 4. Valider l'email et nettoyer le token
        const { error: updateError } = await supabaseClient
            .from('utilisateur')
            .update({
                email_valide: true,
                token_validation_email: null,
                date_expiration_token_reset: null,
            })
            .eq('numero_utilisateur', userData.numero_utilisateur);

        if (updateError) {
            console.error('Error updating user email_valide status:', updateError);
            return new Response(JSON.stringify({ success: false, message: 'Failed to validate email.' }), {
                headers: { 'Content-Type': 'application/json' },
                status: 500,
            });
        }

        return new Response(JSON.stringify({ success: true, message: 'Email validated successfully!' }), {
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