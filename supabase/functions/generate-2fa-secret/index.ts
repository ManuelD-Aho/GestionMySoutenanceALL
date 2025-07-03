// supabase/functions/generate-2fa-secret/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.4';
import { OTPAuth } from 'https://esm.sh/otpauth@9.0.0'; // Bibliothèque pour 2FA

serve(async (req) => {
    try {
        const { userId, email } = await req.json(); // L'email est utile pour le QR code

        if (!userId || !email) {
            return new Response(JSON.stringify({ error: 'User ID and email are required' }), {
                headers: { 'Content-Type': 'application/json' },
                status: 400,
            });
        }

        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', // Utiliser la clé service_role pour écrire le secret
            { auth: { persistSession: false } }
        );

        // 1. Générer un secret TOTP
        const secret = OTPAuth.generateSecret(); // Génère un secret base32

        // 2. Créer une instance TOTP pour générer l'URL du QR code
        const totp = new OTPAuth.TOTP({
            issuer: 'GestionMySoutenance', // Nom de votre application
            label: email, // L'email de l'utilisateur comme label
            secret: secret,
        });

        const qrCodeUrl = totp.toString(); // Génère l'URL otpauth://...

        // 3. Stocker le secret dans la table 'utilisateur'
        const { error: dbUpdateError } = await supabaseClient
            .from('utilisateur')
            .update({ secret_2fa: secret })
            .eq('numero_utilisateur', userId);

        if (dbUpdateError) {
            console.error('DB update error for 2FA secret:', dbUpdateError);
            return new Response(JSON.stringify({ error: 'Failed to store 2FA secret.' }), {
                headers: { 'Content-Type': 'application/json' },
                status: 500,
            });
        }

        return new Response(JSON.stringify({ secret: secret, qrCodeUrl: qrCodeUrl }), {
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