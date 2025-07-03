// /assets/js/utils/constants.js

export const TABLES = {
    ACTION: 'action',
    ANNEE_ACADEMIQUE: 'annee_academique',
    COMPTE_RENDU: 'compte_rendu',
    CRITERE_CONFORMITE_REF: 'critere_conformite_ref',
    DECISION_PASSAGE_REF: 'decision_passage_ref',
    DECISION_VALIDATION_PV_REF: 'decision_validation_pv_ref',
    DECISION_VOTE_REF: 'decision_vote_ref',
    ENSEIGNANT: 'enseignant',
    ENTREPRISE: 'entreprise',
    ETUDIANT: 'etudiant',
    FAIRE_STAGE: 'faire_stage',
    FONCTION: 'fonction',
    GRADE: 'grade',
    GROUPE_UTILISATEUR: 'groupe_utilisateur',
    INSCRIRE: 'inscrire',
    MATRICE_NOTIFICATION_REGLES: 'matrice_notification_regles',
    NIVEAU_ACCES_DONNE: 'niveau_acces_donne',
    NIVEAU_ETUDE: 'niveau_etude',
    NOTIFICATION: 'notification',
    PARAMETRES_SYSTEME: 'parametres_systeme',
    PENALITE: 'penalite',
    PERSONNEL_ADMINISTRATIF: 'personnel_administratif',
    RAPPORT_ETUDIANT: 'rapport_etudiant',
    RAPPORT_MODELE: 'rapport_modele',
    RAPPORT_MODELE_SECTION: 'rapport_modele_section',
    RATTACHER: 'rattacher',
    RECLAMATION: 'reclamation',
    SECTION_RAPPORT: 'section_rapport',
    SESSION_VALIDATION: 'session_validation',
    STATUT_PAIEMENT_REF: 'statut_paiement_ref',
    STATUT_PENALITE_REF: 'statut_penalite_ref',
    STATUT_PV_REF: 'statut_pv_ref',
    STATUT_RAPPORT_REF: 'statut_rapport_ref',
    STATUT_RECLAMATION_REF: 'statut_reclamation_ref',
    TRAITEMENT: 'traitement',
    TYPE_DOCUMENT_REF: 'type_document_ref',
    TYPE_UTILISATEUR: 'type_utilisateur',
    UE: 'ue',
    UTILISATEUR: 'utilisateur',
    VOTE_COMMISSION: 'vote_commission',
};

export const ROLES = {
    ADMIN_SYS: 'GRP_ADMIN_SYS',
    ETUDIANT: 'GRP_ETUDIANT',
    ENSEIGNANT: 'GRP_ENSEIGNANT',
    COMMISSION: 'GRP_COMMISSION',
    PERS_ADMIN: 'GRP_PERS_ADMIN',
    RS: 'GRP_RS',
    AGENT_CONFORMITE: 'GRP_AGENT_CONFORMITE',
};

export const USER_TYPES = {
    ADMIN: 'TYPE_ADMIN',
    ETUD: 'TYPE_ETUD',
    ENS: 'TYPE_ENS',
    PERS_ADMIN: 'TYPE_PERS_ADMIN',
};

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

export const ID_PREFIXES = {
    ETUDIANT: 'ETU',
    ENSEIGNANT: 'ENS',
    PERSONNEL_ADMIN: 'ADM',
    ADMIN_SYS: 'SYS',
    RAPPORT: 'RAP',
    SESSION_VALIDATION: 'SESS',
    VOTE: 'VOTE',
};

export const PATHS = {
    LOGIN: '/index.html',
    ETUDIANT_DASHBOARD: '/pages/etudiant/dashboard.html',
    ADMIN_DASHBOARD: '/pages/admin/dashboard.html',
    COMMISSION_DASHBOARD: '/pages/commission/dashboard.html',
    PERSONNEL_DASHBOARD: '/pages/personnel/dashboard.html',
};