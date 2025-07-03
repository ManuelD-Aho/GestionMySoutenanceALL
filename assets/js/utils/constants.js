// --- Supabase Table Names ---
export const TABLES = {
    UTILISATEUR: 'utilisateur',
    GROUPE_UTILISATEUR: 'groupe_utilisateur',
    TRAITEMENT: 'traitement',
    RATTACHER: 'rattacher',
    ETUDIANT: 'etudiant',
    ENSEIGNANT: 'enseignant',
    PERSONNEL_ADMINISTRATIF: 'personnel_administratif',
    ANNEE_ACADEMIQUE: 'annee_academique',
    INSCRIRE: 'inscrire',
    FAIRE_STAGE: 'faire_stage',
    PENALITE: 'penalite',
    EVALUER: 'evaluer',
    UE: 'ue',
    ECUE: 'ecue',
    RAPPORT_ETUDIANT: 'rapport_etudiant',
    SECTION_RAPPORT: 'section_rapport',
    RAPPORT_MODELE: 'rapport_modele',
    RAPPORT_MODELE_SECTION: 'rapport_modele_section',
    SESSION_VALIDATION: 'session_validation',
    VOTE_COMMISSION: 'vote_commission',
    COMPTE_RENDU: 'compte_rendu',
    RECLAMATION: 'reclamation',
    NOTIFICATION: 'notification',
    RECEVOIR: 'recevoir',
    PARAMETRES_SYSTEME: 'parametres_systeme',
    QUEUE_JOBS: 'queue_jobs',
    ACTION: 'action',
    CRITERE_CONFORMITE_REF: 'critere_conformite_ref',
    CONFORMITE_RAPPORT_DETAILS: 'conformite_rapport_details',
    TYPE_DOCUMENT_REF: 'type_document_ref',
    DOCUMENT_GENERE: 'document_genere',
    SESSIONS: 'sessions', // Pour la gestion des sessions DB
    // ... ajoutez toutes les tables de votre schéma
};

// --- User Roles (id_groupe_utilisateur) ---
export const ROLES = {
    ADMIN_SYS: 'GRP_ADMIN_SYS',
    ETUDIANT: 'GRP_ETUDIANT',
    ENSEIGNANT: 'GRP_ENSEIGNANT',
    COMMISSION: 'GRP_COMMISSION',
    PERS_ADMIN: 'GRP_PERS_ADMIN',
    RS: 'GRP_RS',
    AGENT_CONFORMITE: 'GRP_AGENT_CONFORMITE',
};

// --- User Types (id_type_utilisateur) ---
export const USER_TYPES = {
    ADMIN: 'TYPE_ADMIN',
    ETUD: 'TYPE_ETUD',
    ENS: 'TYPE_ENS',
    PERS_ADMIN: 'TYPE_PERS_ADMIN',
};

// --- Report Statuses (id_statut_rapport) ---
export const REPORT_STATUS = {
    BROUILLON: 'RAP_BROUILLON',
    SOUMIS: 'RAP_SOUMIS',
    NON_CONF: 'RAP_NON_CONF',
    CONF: 'RAP_CONF',
    EN_COMMISSION: 'RAP_EN_COMMISSION',
    CORRECT: 'RAP_CORRECT',
    REFUSE: 'RAP_REFUSE',
    VALID: 'RAP_VALID',
    ARCHIVE: 'RAP_ARCHIVE',
};

// --- Notification Templates (id_notification) ---
export const NOTIFICATION_TEMPLATES = {
    RESET_PASSWORD: 'RESET_PASSWORD',
    VALIDATE_EMAIL: 'VALIDATE_EMAIL',
    ADMIN_PASSWORD_RESET: 'ADMIN_PASSWORD_RESET',
    COMPTE_VALIDE: 'COMPTE_VALIDE',
    NOUVEAU_RAPPORT_A_VERIFIER: 'NOUVEAU_RAPPORT_A_VERIFIER',
    RAPPORT_CONFORME_A_EVALUER: 'RAPPORT_CONFORME_A_EVALUER',
    CORRECTIONS_REQUISES: 'CORRECTIONS_REQUISES',
    RAPPORT_CORRIGE_ET_VALIDE: 'RAPPORT_CORRIGE_ET_VALIDE',
    RAPPORT_REFUSE: 'RAPPORT_REFUSE',
    RAPPORT_SOUMIS_SUCCES: 'RAPPORT_SOUMIS_SUCCES',
    RAPPORT_VALID: 'RAPPORT_VALID',
    RECLAMATION_REPONDU: 'RECLAMATION_REPONDU',
    NOUVELLE_RECLAMATION: 'NOUVELLE_RECLAMATION',
    // ... ajoutez tous les templates de notification
};

// --- Document Types (id_type_document) ---
export const DOCUMENT_TYPES = {
    ATTESTATION: 'DOC_ATTESTATION',
    BULLETIN: 'DOC_BULLETIN',
    PV: 'DOC_PV',
    RAPPORT: 'DOC_RAPPORT',
    RECU: 'DOC_RECU',
    EXPORT: 'DOC_EXPORT',
};

// --- Supabase Storage Buckets ---
export const STORAGE_BUCKETS = {
    PROFILE_PICTURES: 'profile_pictures',
    REPORT_IMAGES: 'report_images',
    GENERATED_DOCUMENTS: 'generated_documents',
};

// --- Edge Function Names ---
export const EDGE_FUNCTIONS = {
    SEND_ZOHO_EMAIL: 'send-zoho-email',
    GENERATE_PDF_DOCUMENT: 'generate-pdf-document',
    // ... autres fonctions Edge
};

// --- ID Prefixes for generateUniqueId ---
export const ID_PREFIXES = {
    ETUDIANT: 'ETU',
    ENSEIGNANT: 'ENS',
    PERSONNEL_ADMIN: 'ADM',
    ADMIN_SYS: 'SYS',
    RAPPORT: 'RAP',
    PV: 'PV',
    RECLAMATION: 'RECLA',
    NOTIFICATION_RECEPTION: 'RECEP',
    DOCUMENT_GENERE: 'DOC',
    SESSION_VALIDATION: 'SESS',
    VOTE: 'VOTE',
    CONFORMITE_DETAIL: 'CRD',
    DELEGATION: 'DEL',
    MESSAGE: 'MSG',
    CONVERSATION: 'CONV',
    HISTORIQUE_MDP: 'HMP',
    PISTE: 'PISTE',
    // ... autres préfixes
};

// --- Paths for redirection ---
export const PATHS = {
    LOGIN: '/',
    ETUDIANT_DASHBOARD: '/pages/etudiant/dashboard.html',
    ADMIN_DASHBOARD: '/pages/admin/dashboard.html',
    COMMISSION_DASHBOARD: '/pages/commission/dashboard.html',
    PERSONNEL_DASHBOARD: '/pages/personnel/dashboard.html',
    // ... autres chemins
};