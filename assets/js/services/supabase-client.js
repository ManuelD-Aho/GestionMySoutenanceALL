// /assets/js/services/supabase-client.js

import { createClient } from '@supabase/supabase-js';

// Récupérez ces informations dans votre tableau de bord Supabase :
// Settings > API
const supabaseUrl = 'VOTRE_URL_PROJET_SUPABASE';
const supabaseAnonKey = 'VOTRE_CLE_ANON_SUPABASE';

// Créez et exportez le client Supabase.
// Cette instance unique sera importée dans tous les autres services (auth, data, etc.).
export const supabase = createClient(supabaseUrl, supabaseAnonKey);// Configuration Supabase
