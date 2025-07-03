// supabase/functions/verify-2fa-code/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.4';
import { OTPAuth } from 'https://esm.sh/otpauth@9.0.0'; // Bibliothèque pour 2FA

serve(async (req) => {
    try {
        const { userId, totpCode } = await req.json();

        if (!userId || !totpCode) {
            return new Response(JSON.stringify({ error: 'User ID and TOTP code are required' }), {
                headers: { 'Content-Type': 'application/json' },
                status: 400,
            });
        }

        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', // Utiliser la clé service_role pour lire le secret
            { auth: { persistSession: false } }
        );

        // 1. Récupérer le secret 2FA de l'utilisateur
        const { data: userData, error: dbError } = await supabaseClient
            .from('utilisateur')
            .select('secret_2fa')
            .eq('numero_utilisateur', userId)
            .single();

        if (dbError || !userData || !userData.secret_2fa) {
            console.error('DB error fetching 2FA secret:', dbError);
            return new Response(JSON.stringify({ valid: false, message: '2FA secret not found for user.' }), {
                headers: { 'Content-Type': 'application/json' },
                status: 404,
            });
        }

        const secret = userData.secret_2fa;

        // 2. Vérifier le code TOTP
        const totp = new OTPAuth.TOTP({ secret: secret });
        const delta = totp.validate({ token: totpCode }); // delta est null si invalide, ou un nombre si valide

        if (delta === null) {
            return new Response(JSON.stringify({ valid: false, message: 'Invalid TOTP code.' }), {
                headers: { 'Content-Type': 'application/json' },
                status: 401,
            });
        }

        return new Response(JSON.stringify({ valid: true, message: 'TOTP code is valid.' }), {
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