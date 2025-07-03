// supabase/functions/impersonate-user/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.4';

serve(async (req) => {
    try {
        const { targetUserId } = await req.json();

        // 1. Vérifier que l'appelant est un administrateur (via le token JWT)
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return new Response(JSON.stringify({ error: 'Authorization header missing.' }), {
                headers: { 'Content-Type': 'application/json' },
                status: 401,
            });
        }
        const adminToken = authHeader.split(' ')[1];

        const supabaseAdminClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', // Clé service_role pour vérifier les rôles et générer des tokens
            { auth: { persistSession: false } }
        );

        // Vérifier le rôle de l'administrateur appelant
        const { data: { user: adminUser }, error: adminAuthError } = await supabaseAdminClient.auth.getUser(adminToken);
        if (adminAuthError || !adminUser) {
            console.error('Admin auth error:', adminAuthError);
            return new Response(JSON.stringify({ error: 'Unauthorized: Admin token invalid.' }), {
                headers: { 'Content-Type': 'application/json' },
                status: 403,
            });
        }

        // Récupérer le profil de l'admin pour vérifier son groupe (RLS sur 'utilisateur' doit être configuré)
        const { data: adminProfile, error: adminProfileError } = await supabaseAdminClient
            .from('utilisateur')
            .select('id_groupe_utilisateur')
            .eq('numero_utilisateur', adminUser.id)
            .single();

        if (adminProfileError || adminProfile.id_groupe_utilisateur !== 'GRP_ADMIN_SYS') {
            console.error('Admin profile error or not GRP_ADMIN_SYS:', adminProfileError);
            return new Response(JSON.stringify({ error: 'Forbidden: Caller is not a system administrator.' }), {
                headers: { 'Content-Type': 'application/json' },
                status: 403,
            });
        }

        // 2. Récupérer l'email de l'utilisateur cible pour générer le lien magique
        const { data: targetUserProfile, error: targetProfileError } = await supabaseAdminClient
            .from('utilisateur')
            .select('email_principal')
            .eq('numero_utilisateur', targetUserId)
            .single();

        if (targetProfileError || !targetUserProfile || !targetUserProfile.email_principal) {
            console.error('Target user profile not found:', targetProfileError);
            return new Response(JSON.stringify({ error: 'Target user not found.' }), {
                headers: { 'Content-Type': 'application/json' },
                status: 404,
            });
        }

        // 3. Générer un lien magique pour l'utilisateur cible
        // Supabase Auth ne fournit pas directement un moyen de générer un token d'accès pour un autre utilisateur
        // sans passer par un flux d'authentification complet (email/password ou magic link).
        // La solution la plus propre pour l'impersonation est de générer un magic link
        // et de le "consommer" côté client pour obtenir une session.
        const { data: { session: targetSession }, error: sessionError } = await supabaseAdminClient.auth.admin.generateLink({
            type: 'magiclink',
            email: targetUserProfile.email_principal,
            redirectTo: `${Deno.env.get('APP_URL')}/index.html?impersonate_token=`, // Rediriger vers une URL spécifique pour consommer le token
        });

        if (sessionError || !targetSession) {
            console.error('Error generating magic link for target user:', sessionError);
            return new Response(JSON.stringify({ error: 'Failed to generate impersonation link.' }), {
                headers: { 'Content-Type': 'application/json' },
                status: 500,
            });
        }

        // Le `generateLink` renvoie un lien magique. Le frontend devra extraire le token de ce lien
        // et l'utiliser avec `supabase.auth.signInWithIdToken` ou `setSession`.
        // Pour simplifier, nous allons juste renvoyer le lien complet et le frontend le gérera.
        const impersonationLink = targetSession.action_link; // C'est le lien complet du magic link

        return new Response(JSON.stringify({ impersonationLink: impersonationLink, message: 'Impersonation link generated.' }), {
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