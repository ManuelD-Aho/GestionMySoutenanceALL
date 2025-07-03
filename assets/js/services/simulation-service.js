// /assets/js/services/simulation-service.js

import { TABLES, ID_PREFIXES, REPORT_STATUS } from '../utils/constants.js';
import { generateUniqueId } from '../utils/helpers.js'; // Utilise la fonction generateUniqueId du helper

const DB_KEY = 'simulated_database_v1'; // Clé pour localStorage

// Structure initiale de la base de données simulée
// Contient des données statiques pour les tables de référence
// et des exemples pour les tables dynamiques.
let db = {
    // Tables de référence (statiques)
    [TABLES.ACTION]: [
        { id_action: 'ACCES_ASSET_ECHEC', libelle_action: 'Accès Asset Échec', categorie_action: 'Sécurité' },
        { id_action: 'ACCES_ASSET_SUCCES', libelle_action: 'Accès Asset Succès', categorie_action: 'Sécurité' },
        { id_action: 'ACCES_DASHBOARD_REFUSE', libelle_action: 'Accès Dashboard Refusé', categorie_action: 'Sécurité' },
        { id_action: 'ACCES_DASHBOARD_REUSSI', libelle_action: 'Accès Dashboard Réussi', categorie_action: 'Sécurité' },
        { id_action: 'ACCES_REFUSE', libelle_action: 'Accès Refusé', categorie_action: 'Sécurité' },
        { id_action: 'ACTIVATION_2FA', libelle_action: 'Activation 2FA', categorie_action: 'Sécurité' },
        { id_action: 'ACTIVATION_COMPTE', libelle_action: 'Activation Compte', categorie_action: 'Gestion Utilisateur' },
        { id_action: 'ADMIN_PASSWORD_RESET', libelle_action: 'Réinitialisation MDP par Admin', categorie_action: 'Sécurité' },
        { id_action: 'APPROBATION_PV', libelle_action: 'Approbation PV', categorie_action: 'Workflow' },
        { id_action: 'ARCHIVAGE_CONVERSATIONS', libelle_action: 'Archivage Conversations', categorie_action: 'Communication' },
        { id_action: 'CHANGEMENT_ANNEE_ACTIVE', libelle_action: 'Changement Année Active', categorie_action: 'Configuration' },
        { id_action: 'CHANGEMENT_MDP', libelle_action: 'Changement Mot de Passe', categorie_action: 'Sécurité' },
        { id_action: 'CHANGEMENT_STATUT_COMPTE', libelle_action: 'Changement Statut Compte', categorie_action: 'Gestion Utilisateur' },
        { id_action: 'CHANGEMENT_STATUT_RAPPORT', libelle_action: 'Changement Statut Rapport', categorie_action: 'Workflow' },
        { id_action: 'CREATE_ADMIN_USER', libelle_action: 'Création Utilisateur Admin', categorie_action: 'Gestion Utilisateur' },
        { id_action: 'CREATE_ANNEE_ACADEMIQUE', libelle_action: 'Création Année Académique', categorie_action: 'Configuration' },
        { id_action: 'CREATE_DOC_TEMPLATE', libelle_action: 'Création Modèle Document', categorie_action: 'Documents' },
        { id_action: 'CREATE_ENTITE', libelle_action: 'Création Entité', categorie_action: 'Gestion Utilisateur' },
        { id_action: 'CREATE_REFERENTIEL', libelle_action: 'Création Référentiel', categorie_action: 'Configuration' },
        { id_action: 'CREATION_DELEGATION', libelle_action: 'Création Délégation', categorie_action: 'Gestion Utilisateur' },
        { id_action: 'DELETE_DOC_TEMPLATE', libelle_action: 'Suppression Modèle Document', categorie_action: 'Documents' },
        { id_action: 'DELETE_FICHIER', libelle_action: 'Suppression Fichier', categorie_action: 'Documents' },
        { id_action: 'DELETE_REFERENTIEL', libelle_action: 'Suppression Référentiel', categorie_action: 'Configuration' },
        { id_action: 'DELETE_USER_HARD', libelle_action: 'Suppression Définitive Utilisateur', categorie_action: 'Gestion Utilisateur' },
        { id_action: 'DESACTIVATION_2FA', libelle_action: 'Désactivation 2FA', categorie_action: 'Sécurité' },
        { id_action: 'ECHEC_ACTIVATION_2FA', libelle_action: 'Échec Activation 2FA', categorie_action: 'Sécurité' },
        { id_action: 'ECHEC_GENERATION_ID_UNIQUE', libelle_action: 'Échec Génération ID Unique', categorie_action: 'Système' },
        { id_action: 'ECHEC_LOGIN', libelle_action: 'Échec Connexion', categorie_action: 'Sécurité' },
        { id_action: 'ENREGISTREMENT_DECISION_PASSAGE', libelle_action: 'Enregistrement Décision Passage', categorie_action: 'Parcours Académique' },
        { id_action: 'ENVOI_EMAIL_ECHEC', libelle_action: 'Envoi Email Échec', categorie_action: 'Communication' },
        { id_action: 'ENVOI_EMAIL_SUCCES', libelle_action: 'Envoi Email Succès', categorie_action: 'Communication' },
        { id_action: 'FORCER_CHANGEMENT_STATUT_RAPPORT', libelle_action: 'Forcer Changement Statut Rapport', categorie_action: 'Workflow' },
        { id_action: 'FORCER_VALIDATION_PV', libelle_action: 'Forcer Validation PV', categorie_action: 'Workflow' },
        { id_action: 'GENERATION_2FA_SECRET', libelle_action: 'Génération Secret 2FA', categorie_action: 'Sécurité' },
        { id_action: 'GENERATION_DOCUMENT', libelle_action: 'Génération Document', categorie_action: 'Documents' },
        { id_action: 'GENERATION_ID_UNIQUE', libelle_action: 'Génération ID Unique', categorie_action: 'Système' },
        { id_action: 'IMPERSONATION_START', libelle_action: 'Début Impersonation', categorie_action: 'Sécurité' },
        { id_action: 'IMPERSONATION_STOP', libelle_action: 'Fin Impersonation', categorie_action: 'Sécurité' },
        { id_action: 'IMPORT_ETUDIANTS', libelle_action: 'Import Étudiants', categorie_action: 'Gestion Utilisateur' },
        { id_action: 'LOGOUT', libelle_action: 'Déconnexion', categorie_action: 'Sécurité' },
        { id_action: 'MISE_AJOUR_PARAMETRES', libelle_action: 'Mise à Jour Paramètres', categorie_action: 'Configuration' },
        { id_action: 'NOUVEAU_TOUR_VOTE', libelle_action: 'Nouveau Tour de Vote', categorie_action: 'Workflow' },
        { id_action: 'RECUSATION_MEMBRE_COMMISSION', libelle_action: 'Récusation Membre Commission', categorie_action: 'Workflow' },
        { id_action: 'RESEND_VALIDATION_EMAIL', libelle_action: 'Renvoyer Email Validation', categorie_action: 'Gestion Utilisateur' },
        { id_action: 'REVOCATION_DELEGATION', libelle_action: 'Révocation Délégation', categorie_action: 'Gestion Utilisateur' },
        { id_action: 'SOUMISSION_CORRECTIONS', libelle_action: 'Soumission Corrections Rapport', categorie_action: 'Workflow' },
        { id_action: 'SOUMISSION_RAPPORT', libelle_action: 'Soumission Rapport', categorie_action: 'Workflow' },
        { id_action: 'SUCCES_LOGIN', libelle_action: 'Connexion Réussie', categorie_action: 'Sécurité' },
        { id_action: 'SYNCHRONISATION_RBAC', libelle_action: 'Synchronisation RBAC', categorie_action: 'Sécurité' },
        { id_action: 'TRANSITION_ROLE', libelle_action: 'Transition Rôle', categorie_action: 'Gestion Utilisateur' },
        { id_action: 'UPDATE_DOC_TEMPLATE', libelle_action: 'Mise à Jour Modèle Document', categorie_action: 'Documents' },
        { id_action: 'UPDATE_MENU_STRUCTURE', libelle_action: 'Mise à Jour Structure Menu', categorie_action: 'Configuration' },
        { id_action: 'UPDATE_REFERENTIEL', libelle_action: 'Mise à Jour Référentiel', categorie_action: 'Configuration' },
        { id_action: 'UPLOAD_FICHIER', libelle_action: 'Upload Fichier', categorie_action: 'Documents' },
        { id_action: 'UPLOAD_PROFILE_PICTURE', libelle_action: 'Upload Photo Profil', categorie_action: 'Gestion Utilisateur' },
        { id_action: 'VALIDATION_EMAIL_SUCCES', libelle_action: 'Validation Email Succès', categorie_action: 'Sécurité' },
        { id_action: 'VALIDATION_STAGE', libelle_action: 'Validation Stage', categorie_action: 'Parcours Académique' }
    ],
    [TABLES.ANNEE_ACADEMIQUE]: [
        { id_annee_academique: 'ANNEE-2023-2024', libelle_annee_academique: '2023-2024', date_debut: '2023-09-01', date_fin: '2024-08-31', est_active: false },
        { id_annee_academique: 'ANNEE-2024-2025', libelle_annee_academique: '2024-2025', date_debut: '2024-09-01', date_fin: '2025-08-31', est_active: true },
        { id_annee_academique: 'ANNEE-2025-2026', libelle_annee_academique: '2025-2026', date_debut: '2025-09-01', date_fin: '2026-08-31', est_active: false }
    ],
    [TABLES.CRITERE_CONFORMITE_REF]: [
        { id_critere: 'ANNEXES_REF', libelle_critere: 'Annexes référencées', description: 'Les annexes sont-elles correctement référencées dans le corps du texte ?', est_actif: true },
        { id_critere: 'BIBLIO_FORMAT', libelle_critere: 'Bibliographie formatée', description: 'La bibliographie respecte-t-elle la norme APA 7ème édition ?', est_actif: true },
        { id_critere: 'FORMAT_GLOBAL', libelle_critere: 'Formatage global', description: 'Le rapport respecte-t-il les marges, la police et l\'interligne définis ?', est_actif: true },
        { id_critere: 'INTRO_CONCLU', libelle_critere: 'Introduction et Conclusion', description: 'Le rapport contient-il une introduction et une conclusion claires ?', est_actif: true },
        { id_critere: 'LANGUE_CORRECTE', libelle_critere: 'Langue et orthographe', description: 'Le rapport est-il rédigé dans une langue correcte et sans fautes d\'orthographe majeures ?', est_actif: true },
        { id_critere: 'PAGE_GARDE', libelle_critere: 'Respect de la page de garde', description: 'La page de garde contient-elle le logo, le titre, le nom de l\'étudiant, le nom du tuteur et l\'année académique ?', est_actif: true },
        { id_critere: 'PAGINATION', libelle_critere: 'Pagination correcte', description: 'Le document est-il correctement paginé, en commençant après la page de garde ?', est_actif: true },
        { id_critere: 'PRESENCE_RESUME', libelle_critere: 'Présence du résumé', description: 'Un résumé (abstract) en français et en anglais est-il présent au début du document ?', est_actif: true },
        { id_critere: 'TABLE_MATIERES', libelle_critere: 'Table des matières', description: 'La table des matières est-elle présente et à jour ?', est_actif: true },
        { id_critere: 'VALIDITE_STAGE', libelle_critere: 'Validité du stage associé', description: 'Le stage associé au rapport a-t-il été administrativement validé par la scolarité ?', est_actif: true }
    ],
    [TABLES.DECISION_PASSAGE_REF]: [
        { id_decision_passage: 'DEC_ADMIS', libelle_decision_passage: 'Admis' },
        { id_decision_passage: 'DEC_AJOURNE', libelle_decision_passage: 'Ajourné' },
        { id_decision_passage: 'DEC_EXCLU', libelle_decision_passage: 'Exclu' },
        { id_decision_passage: 'DEC_REDOUBLANT', libelle_decision_passage: 'Redoublant' }
    ],
    [TABLES.DECISION_VALIDATION_PV_REF]: [
        { id_decision_validation_pv: 'PV_APPROUVE', libelle_decision_validation_pv: 'Approuvé' },
        { id_decision_validation_pv: 'PV_MODIF_DEMANDEE', libelle_decision_validation_pv: 'Modification Demandée' },
        { id_decision_validation_pv: 'PV_REJETE', libelle_decision_validation_pv: 'Rejeté' }
    ],
    [TABLES.DECISION_VOTE_REF]: [
        { id_decision_vote: 'VOTE_ABSTENTION', libelle_decision_vote: 'Abstention' },
        { id_decision_vote: 'VOTE_APPROUVE', libelle_decision_vote: 'Approuvé' },
        { id_decision_vote: 'VOTE_APPROUVE_RESERVE', libelle_decision_vote: 'Approuvé sous réserve' },
        { id_decision_vote: 'VOTE_REFUSE', libelle_decision_vote: 'Refusé' }
    ],
    [TABLES.ENTREPRISE]: [
        { id_entreprise: 'ENT-001', libelle_entreprise: 'Tech Solutions Inc.', secteur_activite: 'Informatique', adresse_entreprise: '123 Silicon Valley, CA', contact_nom: 'Alice Smith', contact_email: 'alice.smith@techsol.com', contact_telephone: '111-222-3333' },
        { id_entreprise: 'ENT-002', libelle_entreprise: 'Global Finance Corp.', secteur_activite: 'Finance', adresse_entreprise: '45 Wall Street, NY', contact_nom: 'Bob Johnson', contact_email: 'bob.johnson@globalfin.com', contact_telephone: '444-555-6666' },
        { id_entreprise: 'ENT-003', libelle_entreprise: 'Innovate Pharma', secteur_activite: 'Pharmaceutique', adresse_entreprise: '789 Bio Park, MA', contact_nom: 'Carol White', contact_email: 'carol.white@innovate.com', contact_telephone: '777-888-9999' },
        { id_entreprise: 'ENT-004', libelle_entreprise: 'Green Energy Co.', secteur_activite: 'Énergies Renouvelables', adresse_entreprise: '10 Eco Lane, TX', contact_nom: 'David Green', contact_email: 'david.green@greenenergy.com', contact_telephone: '123-456-7890' },
        { id_entreprise: 'ENT-005', libelle_entreprise: 'Creative Marketing Agency', secteur_activite: 'Marketing', adresse_entreprise: '20 Ad Street, CA', contact_nom: 'Eve Black', contact_email: 'eve.black@creativemkt.com', contact_telephone: '987-654-3210' },
        { id_entreprise: 'ENT-006', libelle_entreprise: 'Future Robotics Ltd.', secteur_activite: 'Robotique', adresse_entreprise: '30 AI Drive, WA', contact_nom: 'Frank Blue', contact_email: 'frank.blue@futurerobotics.com', contact_telephone: '555-123-4567' },
        { id_entreprise: 'ENT-007', libelle_entreprise: 'HealthCare Innovations', secteur_activite: 'Santé', adresse_entreprise: '40 Med Avenue, FL', contact_nom: 'Grace Red', contact_email: 'grace.red@healthcare.com', contact_telephone: '321-654-9870' },
        { id_entreprise: 'ENT-008', libelle_entreprise: 'EduTech Solutions', secteur_activite: 'Éducation', adresse_entreprise: '50 Learning Road, IL', contact_nom: 'Henry Yellow', contact_email: 'henry.yellow@edutech.com', contact_telephone: '654-321-0987' },
        { id_entreprise: 'ENT-009', libelle_entreprise: 'Logistics Masters', secteur_activite: 'Logistique', adresse_entreprise: '60 Supply Chain, GA', contact_nom: 'Ivy Purple', contact_email: 'ivy.purple@logistics.com', contact_telephone: '789-012-3456' },
        { id_entreprise: 'ENT-010', libelle_entreprise: 'CyberSecure Systems', secteur_activite: 'Cybersécurité', adresse_entreprise: '70 Secure Blvd, VA', contact_nom: 'Jack Orange', contact_email: 'jack.orange@cybersecure.com', contact_telephone: '012-345-6789' }
    ],
    [TABLES.FONCTION]: [
        { id_fonction: 'FCT_AGENT_CONF', libelle_fonction: 'Agent de Conformité' },
        { id_fonction: 'FCT_DIR_DEPT', libelle_fonction: 'Directeur de Département' },
        { id_fonction: 'FCT_DIR_ETUDES', libelle_fonction: 'Directeur des Études' },
        { id_fonction: 'FCT_ENSEIGNANT', libelle_fonction: 'Enseignant Chercheur' },
        { id_fonction: 'FCT_PRES_COMM', libelle_fonction: 'Président de Commission' },
        { id_fonction: 'FCT_RESP_SCO', libelle_fonction: 'Responsable Scolarité' },
        { id_fonction: 'FCT_RESP_STAGE', libelle_fonction: 'Responsable des Stages' },
        { id_fonction: 'FCT_SECRETAIRE', libelle_fonction: 'Secrétaire Administratif' }
    ],
    [TABLES.GRADE]: [
        { id_grade: 'GRD_ASS', libelle_grade: 'Assistant', abreviation_grade: 'ASS' },
        { id_grade: 'GRD_DOC', libelle_grade: 'Doctorant', abreviation_grade: 'DOC' },
        { id_grade: 'GRD_MCF', libelle_grade: 'Maître de Conférences', abreviation_grade: 'MCF' },
        { id_grade: 'GRD_PR', libelle_grade: 'Professeur des Universités', abreviation_grade: 'PR' }
    ],
    [TABLES.GROUPE_UTILISATEUR]: [
        { id_groupe_utilisateur: 'GRP_ADMIN_SYS', libelle_groupe_utilisateur: 'Administrateur Système' },
        { id_groupe_utilisateur: 'GRP_AGENT_CONFORMITE', libelle_groupe_utilisateur: 'Agent de Conformité' },
        { id_groupe_utilisateur: 'GRP_ENSEIGNANT', libelle_groupe_utilisateur: 'Enseignant (Rôle de base)' },
        { id_groupe_utilisateur: 'GRP_ETUDIANT', libelle_groupe_utilisateur: 'Étudiant' },
        { id_groupe_utilisateur: 'GRP_COMMISSION', libelle_groupe_utilisateur: 'Membre de Commission' },
        { id_groupe_utilisateur: 'GRP_PERS_ADMIN', libelle_groupe_utilisateur: 'Personnel Administratif (Rôle de base)' },
        { id_groupe_utilisateur: 'GRP_RS', libelle_groupe_utilisateur: 'Responsable Scolarité' }
    ],
    [TABLES.MATRICE_NOTIFICATION_REGLES]: [
        { id_regle: 'REGLE_ADMIN_COMPTE_BLOQUE', id_action_declencheur: 'COMPTE_BLOQUE', id_groupe_destinataire: 'GRP_ADMIN_SYS', canal_notification: 'Interne', est_active: true },
        { id_regle: 'REGLE_ADMIN_ERREUR_SYSTEME', id_action_declencheur: 'ECHEC_GENERATION_ID_UNIQUE', id_groupe_destinataire: 'GRP_ADMIN_SYS', canal_notification: 'Tous', est_active: true },
        { id_regle: 'REGLE_ADMIN_IMPORT_ETUDIANTS', id_action_declencheur: 'IMPORT_ETUDIANTS', id_groupe_destinataire: 'GRP_ADMIN_SYS', canal_notification: 'Tous', est_active: true },
        { id_regle: 'REGLE_ADMIN_LOGIN_ECHEC', id_action_declencheur: 'ECHEC_LOGIN', id_groupe_destinataire: 'GRP_ADMIN_SYS', canal_notification: 'Interne', est_active: true },
        { id_regle: 'REGLE_ADMIN_UPDATE_MENU', id_action_declencheur: 'UPDATE_MENU_STRUCTURE', id_groupe_destinataire: 'GRP_ADMIN_SYS', canal_notification: 'Interne', est_active: true },
        { id_regle: 'REGLE_AGENT_NOUVEAU_RAPPORT', id_action_declencheur: 'NOUVEAU_RAPPORT_A_VERIFIER', id_groupe_destinataire: 'GRP_AGENT_CONFORMITE', canal_notification: 'Tous', est_active: true },
        { id_regle: 'REGLE_COMM_NOUVEAU_TOUR_VOTE', id_action_declencheur: 'NOUVEAU_TOUR_VOTE', id_groupe_destinataire: 'GRP_COMMISSION', canal_notification: 'Interne', est_active: true },
        { id_regle: 'REGLE_COMM_RAPPORT_CONFORME', id_action_declencheur: 'RAPPORT_CONFORME_A_EVALUER', id_groupe_destinataire: 'GRP_COMMISSION', canal_notification: 'Tous', est_active: true },
        { id_regle: 'REGLE_COMM_RECUSATION_MEMBRE', id_action_declencheur: 'RECUSATION_MEMBRE_COMMISSION', id_groupe_destinataire: 'GRP_COMMISSION', canal_notification: 'Interne', est_active: true },
        { id_regle: 'REGLE_ENS_NOUVELLE_DELEGATION', id_action_declencheur: 'NOUVELLE_DELEGATION', id_groupe_destinataire: 'GRP_ENSEIGNANT', canal_notification: 'Interne', est_active: true },
        { id_regle: 'REGLE_ETUD_COMPTE_VALIDE', id_action_declencheur: 'COMPTE_VALIDE', id_groupe_destinataire: 'GRP_ETUDIANT', canal_notification: 'Tous', est_active: true },
        { id_regle: 'REGLE_ETUD_CORRECTIONS_REQUISES', id_action_declencheur: 'CORRECTIONS_REQUISES', id_groupe_destinataire: 'GRP_ETUDIANT', canal_notification: 'Tous', est_active: true },
        { id_regle: 'REGLE_ETUD_PAIEMENT_ATTENTE', id_action_declencheur: 'PAIEMENT_INSCRIPTION_ATTENTE', id_groupe_destinataire: 'GRP_ETUDIANT', canal_notification: 'Tous', est_active: true },
        { id_regle: 'REGLE_ETUD_PV_APPROUVE', id_action_declencheur: 'PV_APPROUVE_DIFFUSE', id_groupe_destinataire: 'GRP_ETUDIANT', canal_notification: 'Tous', est_active: true },
        { id_regle: 'REGLE_ETUD_RAPPORT_REFUSE', id_action_declencheur: 'RAPPORT_REFUSE', id_groupe_destinataire: 'GRP_ETUDIANT', canal_notification: 'Tous', est_active: true },
        { id_regle: 'REGLE_ETUD_RAPPORT_SOUMIS', id_action_declencheur: 'RAPPORT_SOUMIS_SUCCES', id_groupe_destinataire: 'GRP_ETUDIANT', canal_notification: 'Tous', est_active: true },
        { id_regle: 'REGLE_ETUD_RAPPORT_VALIDE', id_action_declencheur: 'RAPPORT_VALID', id_groupe_destinataire: 'GRP_ETUDIANT', canal_notification: 'Tous', est_active: true },
        { id_regle: 'REGLE_ETUD_RECLAMATION_REPONDU', id_action_declencheur: 'RECLAMATION_REPONDU', id_groupe_destinataire: 'GRP_ETUDIANT', canal_notification: 'Tous', est_active: true },
        { id_regle: 'REGLE_ETUD_STATUT_RAPPORT_FORCE', id_action_declencheur: 'STATUT_RAPPORT_FORCE', id_groupe_destinataire: 'GRP_ETUDIANT', canal_notification: 'Tous', est_active: true },
        { id_regle: 'REGLE_ETUD_STATUT_RAPPORT_MAJ', id_action_declencheur: 'STATUT_RAPPORT_MAJ', id_groupe_destinataire: 'GRP_ETUDIANT', canal_notification: 'Interne', est_active: true },
        { id_regle: 'REGLE_RS_COMPTE_ACTIVE', id_action_declencheur: 'ACTIVATION_COMPTE', id_groupe_destinataire: 'GRP_RS', canal_notification: 'Interne', est_active: true },
        { id_regle: 'REGLE_RS_NOUVEAU_STAGE_VALIDE', id_action_declencheur: 'NOUVEAU_STAGE_VALIDE', id_groupe_destinataire: 'GRP_RS', canal_notification: 'Interne', est_active: true },
        { id_regle: 'REGLE_RS_NOUVELLE_RECLAMATION', id_action_declencheur: 'NOUVELLE_RECLAMATION', id_groupe_destinataire: 'GRP_RS', canal_notification: 'Tous', est_active: true }
    ],
    [TABLES.NIVEAU_ACCES_DONNE]: [
        { id_niveau_acces_donne: 'ACCES_PERSONNEL', libelle_niveau_acces_donne: 'Accès aux Données Personnelles Uniquement' },
        { id_niveau_acces_donne: 'ACCES_DEPARTEMENT', libelle_niveau_acces_donne: 'Accès Niveau Département' },
        { id_niveau_acces_donne: 'ACCES_TOTAL', libelle_niveau_acces_donne: 'Accès Total (Admin)' }
    ],
    [TABLES.NIVEAU_ETUDE]: [
        { id_niveau_etude: 'DOCTORAT', libelle_niveau_etude: 'Doctorat' },
        { id_niveau_etude: 'L1', libelle_niveau_etude: 'Licence 1' },
        { id_niveau_etude: 'L2', libelle_niveau_etude: 'Licence 2' },
        { id_niveau_etude: 'L3', libelle_niveau_etude: 'Licence 3' },
        { id_niveau_etude: 'M1', libelle_niveau_etude: 'Master 1' },
        { id_niveau_etude: 'M2', libelle_niveau_etude: 'Master 2' }
    ],
    [TABLES.NOTIFICATION]: [
        { id_notification: 'ACCES_REFUSE', libelle_notification: 'Accès Refusé', contenu: 'Votre tentative d\'accès à une ressource protégée a été refusée.' },
        { id_notification: 'ADMIN_PASSWORD_RESET', libelle_notification: 'Mot de passe réinitialisé par l\'administrateur', contenu: 'Votre mot de passe a été réinitialisé par un administrateur. Votre nouveau mot de passe est : {{nouveau_mdp}}. Veuillez le changer dès votre première connexion.' },
        { id_notification: 'COMPTE_BLOQUE', libelle_notification: 'Compte Bloqué', contenu: 'Votre compte a été temporairement bloqué suite à trop de tentatives de connexion infructueuses. Veuillez réessayer plus tard.' },
        { id_notification: 'COMPTE_INACTIF', libelle_notification: 'Compte Inactif', contenu: 'Votre compte est actuellement inactif. Veuillez contacter l\'administration.' },
        { id_notification: 'COMPTE_VALIDE', libelle_notification: 'Compte Validé', contenu: 'Votre compte a été validé avec succès. Vous pouvez maintenant vous connecter.' },
        { id_notification: 'CORRECTIONS_REQUISES', libelle_notification: 'Corrections Requises pour votre Rapport', contenu: 'Votre rapport a été évalué et nécessite des corrections. Veuillez consulter les commentaires dans votre espace personnel.' },
        { id_notification: 'NOUVEAU_RAPPORT_A_VERIFIER', libelle_notification: 'Nouveau Rapport à Vérifier', contenu: 'Un nouveau rapport a été soumis et est en attente de votre vérification de conformité.' },
        { id_notification: 'NOUVEAU_STAGE_VALIDE', libelle_notification: 'Nouveau Stage Validé', contenu: 'Votre enregistrement de stage a été validé par le service de scolarité.' },
        { id_notification: 'NOUVEAU_TOUR_VOTE', libelle_notification: 'Nouveau Tour de Vote Commission', contenu: 'Un nouveau tour de vote a été lancé pour le rapport {{id_rapport}} dans la session {{id_session}}. Veuillez soumettre votre vote.' },
        { id_notification: 'NOUVELLE_DELEGATION', libelle_notification: 'Nouvelle Délégation de Droits', contenu: 'Vous avez reçu une nouvelle délégation de droits. Veuillez consulter votre profil pour plus de détails.' },
        { id_notification: 'NOUVELLE_RECLAMATION', libelle_notification: 'Nouvelle Réclamation Reçue', contenu: 'Une nouvelle réclamation a été soumise par un étudiant et nécessite votre attention.' },
        { id_notification: 'PAIEMENT_INSCRIPTION_ATTENTE', libelle_notification: 'Paiement d\'Inscription en Attente', contenu: 'Votre paiement d\'inscription pour l\'année académique {{annee_academique}} est en attente. Veuillez régulariser votre situation.' },
        { id_notification: 'PV_APPROUVE_DIFFUSE', libelle_notification: 'PV Approuvé et Diffusé', contenu: 'Le procès-verbal de validation de votre rapport a été approuvé et est disponible dans votre espace personnel.' },
        { id_notification: 'RAPPORT_CONFORME_A_EVALUER', libelle_notification: 'Rapport Conforme à Évaluer', contenu: 'Un rapport a été jugé conforme et est prêt pour l\'évaluation par la commission.' },
        { id_notification: 'RAPPORT_CORRIGE_ET_VALIDE', libelle_notification: 'Rapport Corrigé et Validé', contenu: 'Votre rapport a été corrigé et est maintenant définitivement validé.' },
        { id_notification: 'RAPPORT_REFUSE', libelle_notification: 'Rapport Refusé', contenu: 'Votre rapport a été refusé par la commission. Veuillez consulter les motifs détaillés.' },
        { id_notification: 'RAPPORT_SOUMIS_SUCCES', libelle_notification: 'Rapport Soumis avec Succès', contenu: 'Votre rapport a été soumis avec succès et est en cours de traitement.' },
        { id_notification: 'RAPPORT_VALID', libelle_notification: 'Rapport Validé', contenu: 'Votre rapport a été validé avec succès.' },
        { id_notification: 'RECLAMATION_REPONDU', libelle_notification: 'Réclamation Traitée', contenu: 'Votre réclamation concernant "{{sujet_reclamation}}" a été traitée. Veuillez consulter la réponse dans votre espace personnel.' },
        { id_notification: 'RESET_PASSWORD', libelle_notification: 'Réinitialisation de votre mot de passe', contenu: 'Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur ce lien : {{reset_link}}' },
        { id_notification: 'STATUT_RAPPORT_FORCE', libelle_notification: 'Statut de Rapport Modifié Manuellement', contenu: 'Le statut de votre rapport (ID: {{id_rapport}}) a été modifié manuellement par l\'administration. Nouveau statut: {{nouveau_statut}}. Justification: {{justification}}' },
        { id_notification: 'STATUT_RAPPORT_MAJ', libelle_notification: 'Statut de votre Rapport Mis à Jour', contenu: 'Le statut de votre rapport a été mis à jour. Nouveau statut : {{nouveau_statut}}.' },
        { id_notification: 'VALIDATE_EMAIL', libelle_notification: 'Validez votre adresse email', contenu: 'Veuillez cliquer sur le lien suivant pour valider votre adresse email : {{validation_link}}' }
    ],
    [TABLES.PARAMETRES_SYSTEME]: [
        { cle: 'LOCKOUT_TIME_MINUTES', valeur: '30', description: 'Durée en minutes du blocage de compte après trop de tentatives.', type: 'integer' },
        { cle: 'MAX_LOGIN_ATTEMPTS', valeur: '5', description: 'Nombre maximum de tentatives de connexion avant blocage du compte.', type: 'integer' },
        { cle: 'PASSWORD_MIN_LENGTH', valeur: '8', description: 'Longueur minimale requise pour les mots de passe.', type: 'integer' },
        { cle: 'SMTP_FROM_EMAIL', valeur: 'no-reply@gestionsoutenance.com', description: 'Adresse email de l\'expéditeur par défaut.', type: 'string' },
        { cle: 'SMTP_FROM_NAME', valeur: 'GestionMySoutenance', description: 'Nom de l\'expéditeur par défaut.', type: 'string' },
        { cle: 'SMTP_HOST', valeur: 'smtp.example.com', description: 'Hôte du serveur SMTP pour l\'envoi d\'emails.', type: 'string' },
        { cle: 'SMTP_PASS', valeur: 'password', description: 'Mot de passe pour l\'authentification SMTP.', type: 'string' },
        { cle: 'SMTP_PORT', valeur: '587', description: 'Port du serveur SMTP.', type: 'integer' },
        { cle: 'SMTP_SECURE', valeur: 'tls', description: 'Type de chiffrement SMTP (tls, ssl, ou vide).', type: 'string' },
        { cle: 'SMTP_USER', valeur: 'user@example.com', description: 'Nom d\'utilisateur pour l\'authentification SMTP.', type: 'string' },
        { cle: 'UPLOADS_PATH_BASE', valeur: '/var/www/html/Public/uploads/', description: 'Chemin de base pour tous les uploads de fichiers.', type: 'string' },
        { cle: 'UPLOADS_PATH_DOCUMENTS_GENERES', valeur: 'documents_generes/', description: 'Sous-chemin pour les documents PDF générés.', type: 'string' },
        { cle: 'UPLOADS_PATH_PROFILE_PICTURES', valeur: 'profile_pictures/', description: 'Sous-chemin pour les photos de profil.', type: 'string' },
        { cle: 'UPLOADS_PATH_RAPPORT_IMAGES', valeur: 'rapport_images/', description: 'Sous-chemin pour les images insérées dans les rapports.', type: 'string' }
    ],
    [TABLES.RAPPORT_MODELE]: [
        { id_modele: 'TPL-2025-0001', nom_modele: 'Modèle Standard MIAGE', description: 'Modèle de rapport de stage standard pour les étudiants MIAGE.', version: '1.0', statut: 'Publié' },
        { id_modele: 'TPL-2025-0002', nom_modele: 'Modèle Scientifique (IA/Data)', description: 'Modèle avec sections spécifiques pour les projets de recherche en IA et Data Science.', version: '1.0', statut: 'Publié' },
        { id_modele: 'TPL-2025-0003', nom_modele: 'Modèle Court (L3)', description: 'Modèle simplifié pour les rapports de stage de Licence 3.', version: '1.0', statut: 'Publié' },
        { id_modele: 'TPL-2025-0004', nom_modele: 'Modèle Cybersécurité', description: 'Modèle axé sur l\'analyse de vulnérabilités et les recommandations de sécurité.', version: '1.0', statut: 'Publié' }
    ],
    [TABLES.RAPPORT_MODELE_SECTION]: [
        { id_section_modele: 'RMS-0001', id_modele: 'TPL-2025-0001', titre_section: 'Introduction', contenu_par_defaut: 'Présentation du contexte de l\'entreprise et des objectifs du stage.', ordre: 1 },
        { id_section_modele: 'RMS-0002', id_modele: 'TPL-2025-0001', titre_section: 'Contexte de l\'Entreprise', contenu_par_defaut: 'Description détaillée de l\'entreprise d\'accueil, son secteur, sa structure.', ordre: 2 },
        { id_section_modele: 'RMS-0003', id_modele: 'TPL-2025-0001', titre_section: 'Problématique et Objectifs', contenu_par_defaut: 'Définition de la problématique abordée et des objectifs du projet/mission.', ordre: 3 },
        { id_section_modele: 'RMS-0004', id_modele: 'TPL-2025-0001', titre_section: 'Analyse et Conception', contenu_par_defaut: 'Description des phases d\'analyse et de conception (méthodes, outils, diagrammes).', ordre: 4 },
        { id_section_modele: 'RMS-0005', id_modele: 'TPL-2025-0001', titre_section: 'Réalisation et Implémentation', contenu_par_defaut: 'Détail des étapes de développement, technologies utilisées, défis rencontrés.', ordre: 5 },
        { id_section_modele: 'RMS-0006', id_modele: 'TPL-2025-0001', titre_section: 'Tests et Validation', contenu_par_defaut: 'Description des tests effectués et des résultats obtenus.', ordre: 6 },
        { id_section_modele: 'RMS-0007', id_modele: 'TPL-2025-0001', titre_section: 'Conclusion et Perspectives', contenu_par_defaut: 'Bilan du stage, apports personnels, et pistes d\'amélioration/futur.', ordre: 7 },
        { id_section_modele: 'RMS-0008', id_modele: 'TPL-2025-0001', titre_section: 'Bibliographie', contenu_par_defaut: 'Liste des références bibliographiques utilisées.', ordre: 8 },
        { id_section_modele: 'RMS-0009', id_modele: 'TPL-2025-0001', titre_section: 'Annexes', contenu_par_defaut: 'Documents complémentaires (code source, captures d\'écran, etc.).', ordre: 9 },
        { id_section_modele: 'RMS-0010', id_modele: 'TPL-2025-0002', titre_section: 'Abstract', contenu_par_defaut: 'Résumé du projet de recherche en anglais.', ordre: 1 },
        { id_section_modele: 'RMS-0011', id_modele: 'TPL-2025-0002', titre_section: 'État de l\'Art', contenu_par_defaut: 'Revue des travaux existants et des technologies pertinentes.', ordre: 2 },
        { id_section_modele: 'RMS-0012', id_modele: 'TPL-2025-0002', titre_section: 'Méthodologie de Recherche', contenu_par_defaut: 'Description des approches, algorithmes et modèles utilisés.', ordre: 3 },
        { id_section_modele: 'RMS-0013', id_modele: 'TPL-2025-0002', titre_section: 'Collecte et Préparation des Données', contenu_par_defaut: 'Détail des sources de données, nettoyage, transformation.', ordre: 4 },
        { id_section_modele: 'RMS-0014', id_modele: 'TPL-2025-0002', titre_section: 'Expérimentation et Résultats', contenu_par_defaut: 'Protocole expérimental, analyse des résultats, métriques.', ordre: 5 },
        { id_section_modele: 'RMS-0015', id_modele: 'TPL-2025-0002', titre_section: 'Discussion et Interprétation', contenu_par_defaut: 'Interprétation des résultats, limites, implications.', ordre: 6 },
        { id_section_modele: 'RMS-0016', id_modele: 'TPL-2025-0002', titre_section: 'Conclusion et Travaux Futurs', contenu_par_defaut: 'Synthèse des contributions et pistes pour la recherche future.', ordre: 7 },
        { id_section_modele: 'RMS-0017', id_modele: 'TPL-2025-0002', titre_section: 'Références', contenu_par_defaut: 'Liste des publications scientifiques citées.', ordre: 8 },
        { id_section_modele: 'RMS-0018', id_modele: 'TPL-2025-0003', titre_section: 'Présentation du Stage', contenu_par_defaut: 'Contexte du stage et objectifs principaux.', ordre: 1 },
        { id_section_modele: 'RMS-0019', id_modele: 'TPL-2025-0003', titre_section: 'Activités Réalisées', contenu_par_defaut: 'Description des tâches et missions effectuées.', ordre: 2 },
        { id_section_modele: 'RMS-0020', id_modele: 'TPL-2025-0003', titre_section: 'Apports Personnels', contenu_par_defaut: 'Ce que le stage a apporté en termes de compétences et d\'expérience.', ordre: 3 },
        { id_section_modele: 'RMS-0021', id_modele: 'TPL-2025-0003', titre_section: 'Conclusion', contenu_par_defaut: 'Bilan rapide du stage.', ordre: 4 },
        { id_section_modele: 'RMS-0022', id_modele: 'TPL-2025-0004', titre_section: 'Introduction à la Cybersécurité', contenu_par_defaut: 'Contexte et enjeux de la cybersécurité dans l\'entreprise.', ordre: 1 },
        { id_section_modele: 'RMS-0023', id_modele: 'TPL-2025-0004', titre_section: 'Analyse des Risques et Vulnérabilités', contenu_par_defaut: 'Méthodologie d\'identification et d\'évaluation des risques.', ordre: 2 },
        { id_section_modele: 'RMS-0024', id_modele: 'TPL-2025-0004', titre_section: 'Tests d\'Intrusion (Pentesting)', contenu_par_defaut: 'Description des tests réalisés, outils et techniques.', ordre: 3 },
        { id_section_modele: 'RMS-0025', id_modele: 'TPL-2025-0004', titre_section: 'Résultats et Recommandations', contenu_par_defaut: 'Présentation des failles découvertes et des mesures correctives proposées.', ordre: 4 },
        { id_section_modele: 'RMS-0026', id_modele: 'TPL-2025-0004', titre_section: 'Plan d\'Action et Suivi', contenu_par_defaut: 'Mise en œuvre des recommandations et perspectives.', ordre: 5 },
        { id_section_modele: 'RMS-0027', id_modele: 'TPL-2025-0004', titre_section: 'Conclusion', contenu_par_defaut: 'Synthèse des travaux et apprentissages.', ordre: 6 }
    ],
    [TABLES.RAPPORT_MODELE_ASSIGNATION]: [
        { id_modele: 'TPL-2025-0003', id_niveau_etude: 'L3' },
        { id_modele: 'TPL-2025-0001', id_niveau_etude: 'M2' },
        { id_modele: 'TPL-2025-0002', id_niveau_etude: 'M2' },
        { id_modele: 'TPL-2025-0004', id_niveau_etude: 'M2' }
    ],
    [TABLES.SPECIALITE]: [
        { id_specialite: 'CYBERSEC', libelle_specialite: 'Cybersécurité et Réseaux', numero_enseignant_specialite: null },
        { id_specialite: 'E_SANTE', libelle_specialite: 'Informatique pour la Santé', numero_enseignant_specialite: null },
        { id_specialite: 'FIN_TECH', libelle_specialite: 'Finance et Technologies (FinTech)', numero_enseignant_specialite: null },
        { id_specialite: 'GENIE_LOG', libelle_specialite: 'Génie Logiciel', numero_enseignant_specialite: null },
        { id_specialite: 'IA_DATA', libelle_specialite: 'Intelligence Artificielle et Science des Données', numero_enseignant_specialite: null },
        { id_specialite: 'INFO_SCIENCES', libelle_specialite: 'Informatique et Sciences du Numérique', numero_enseignant_specialite: null },
        { id_specialite: 'MIAGE', libelle_specialite: 'Méthodes Informatiques Appliquées à la Gestion des Entreprises', numero_enseignant_specialite: null },
        { id_specialite: 'RESEAUX_TEL', libelle_specialite: 'Réseaux et Télécommunications', numero_enseignant_specialite: null }
    ],
    [TABLES.STATUT_CONFORMITE_REF]: [
        { id_statut_conformite: 'CONF_NA', libelle_statut_conformite: 'Non Applicable' },
        { id_statut_conformite: 'CONF_NOK', libelle_statut_conformite: 'Non Conforme' },
        { id_statut_conformite: 'CONF_OK', libelle_statut_conformite: 'Conforme' }
    ],
    [TABLES.STATUT_JURY]: [
        { id_statut_jury: 'JURY_DIRECTEUR', libelle_statut_jury: 'Directeur de Mémoire' },
        { id_statut_jury: 'JURY_MEMBRE', libelle_statut_jury: 'Membre du Jury' },
        { id_statut_jury: 'JURY_PRESIDENT', libelle_statut_jury: 'Président du Jury' },
        { id_statut_jury: 'JURY_RAPPORTEUR', libelle_statut_jury: 'Rapporteur' }
    ],
    [TABLES.STATUT_PAIEMENT_REF]: [
        { id_statut_paiement: 'PAIE_ATTENTE', libelle_statut_paiement: 'En attente de paiement' },
        { id_statut_paiement: 'PAIE_OK', libelle_statut_paiement: 'Payé' },
        { id_statut_paiement: 'PAIE_PARTIEL', libelle_statut_paiement: 'Paiement partiel' },
        { id_statut_paiement: 'PAIE_RETARD', libelle_statut_paiement: 'En retard de paiement' }
    ],
    [TABLES.STATUT_PENALITE_REF]: [
        { id_statut_penalite: 'PEN_ANNULEE', libelle_statut_penalite: 'Annulée' },
        { id_statut_penalite: 'PEN_DUE', libelle_statut_penalite: 'Due' },
        { id_statut_penalite: 'PEN_REGLEE', libelle_statut_penalite: 'Réglée' }
    ],
    [TABLES.STATUT_PV_REF]: [
        { id_statut_pv: 'PV_ATTENTE_APPROBATION', libelle_statut_pv: 'En attente d\'approbation' },
        { id_statut_pv: 'PV_BROUILLON', libelle_statut_pv: 'Brouillon' },
        { id_statut_pv: 'PV_REJETE', libelle_statut_pv: 'Rejeté' },
        { id_statut_pv: 'PV_VALIDE', libelle_statut_pv: 'Validé' }
    ],
    [TABLES.STATUT_RAPPORT_REF]: [
        { id_statut_rapport: 'RAP_ARCHIVE', libelle_statut_rapport: 'Archivé', etape_workflow: 9 },
        { id_statut_rapport: 'RAP_BROUILLON', libelle_statut_rapport: 'Brouillon', etape_workflow: 1 },
        { id_statut_rapport: 'RAP_CONF', libelle_statut_rapport: 'Conforme', etape_workflow: 4 },
        { id_statut_rapport: 'RAP_CORRECT', libelle_statut_rapport: 'En Correction', etape_workflow: 6 },
        { id_statut_rapport: 'RAP_EN_COMMISSION', libelle_statut_rapport: 'En Commission', etape_workflow: 5 },
        { id_statut_rapport: 'RAP_NON_CONF', libelle_statut_rapport: 'Non Conforme', etape_workflow: 3 },
        { id_statut_rapport: 'RAP_REFUSE', libelle_statut_rapport: 'Refusé', etape_workflow: 7 },
        { id_statut_rapport: 'RAP_SOUMIS', libelle_statut_rapport: 'Soumis', etape_workflow: 2 },
        { id_statut_rapport: 'RAP_VALID', libelle_statut_rapport: 'Validé', etape_workflow: 8 }
    ],
    [TABLES.STATUT_RECLAMATION_REF]: [
        { id_statut_reclamation: 'RECLA_CLOTUREE', libelle_statut_reclamation: 'Clôturée' },
        { id_statut_reclamation: 'RECLA_EN_COURS', libelle_statut_reclamation: 'En cours de traitement' },
        { id_statut_reclamation: 'RECLA_OUVERTE', libelle_statut_reclamation: 'Ouverte' },
        { id_statut_reclamation: 'RECLA_RESOLUE', libelle_statut_reclamation: 'Résolue' }
    ],
    [TABLES.TRAITEMENT]: [
        { id_traitement: 'MENU_ADMINISTRATION', libelle_traitement: 'Administration', id_parent_traitement: null, icone_class: 'fas fa-cogs', url_associee: null, ordre_affichage: 40 },
        { id_traitement: 'MENU_GESTION_COMPTES', libelle_traitement: 'Gestion des Comptes', id_parent_traitement: 'MENU_ADMINISTRATION', icone_class: 'fas fa-users', url_associee: null, ordre_affichage: 41 },
        { id_traitement: 'TRAIT_ADMIN_GERER_UTILISATEURS_LISTER', libelle_traitement: 'Lister Utilisateurs', id_parent_traitement: 'MENU_GESTION_COMPTES', icone_class: 'fas fa-list', url_associee: '/pages/admin/utilisateurs.html', ordre_affichage: 410 },
        { id_traitement: 'TRAIT_ADMIN_GERER_UTILISATEURS_CREER', libelle_traitement: 'Créer Utilisateur', id_parent_traitement: 'MENU_GESTION_COMPTES', icone_class: 'fas fa-user-plus', url_associee: '/pages/admin/utilisateurs.html?action=create', ordre_affichage: 411 },
        { id_traitement: 'TRAIT_ADMIN_CONFIG_ACCEDER', libelle_traitement: 'Configuration Système', id_parent_traitement: 'MENU_ADMINISTRATION', icone_class: 'fas fa-sliders-h', url_associee: '/pages/admin/configuration.html', ordre_affichage: 42 },
        { id_traitement: 'TRAIT_ADMIN_CONFIG_ANNEES_GERER', libelle_traitement: 'Gérer Années Académiques', id_parent_traitement: 'TRAIT_ADMIN_CONFIG_ACCEDER', icone_class: null, url_associee: null, ordre_affichage: 421 },
        { id_traitement: 'TRAIT_ADMIN_CONFIG_MENUS_GERER', libelle_traitement: 'Gérer Ordre Menus', id_parent_traitement: 'TRAIT_ADMIN_CONFIG_ACCEDER', icone_class: null, url_associee: null, ordre_affichage: 422 },
        { id_traitement: 'TRAIT_ADMIN_CONFIG_MODELES_DOC_GERER', libelle_traitement: 'Gérer Modèles Documents', id_parent_traitement: 'TRAIT_ADMIN_CONFIG_ACCEDER', icone_class: null, url_associee: null, ordre_affichage: 423 },
        { id_traitement: 'TRAIT_ADMIN_CONFIG_NOTIFS_GERER', libelle_traitement: 'Gérer Notifications', id_parent_traitement: 'TRAIT_ADMIN_CONFIG_ACCEDER', icone_class: null, url_associee: null, ordre_affichage: 424 },
        { id_traitement: 'TRAIT_ADMIN_CONFIG_PARAMETRES_GERER', libelle_traitement: 'Gérer Paramètres Système', id_parent_traitement: 'TRAIT_ADMIN_CONFIG_ACCEDER', icone_class: null, url_associee: null, ordre_affichage: 425 },
        { id_traitement: 'TRAIT_ADMIN_CONFIG_REFERENTIELS_GERER', libelle_traitement: 'Gérer Référentiels', id_parent_traitement: 'TRAIT_ADMIN_CONFIG_ACCEDER', icone_class: null, url_associee: null, ordre_affichage: 426 },
        { id_traitement: 'TRAIT_ADMIN_SUPERVISION_AUDIT_VIEW', libelle_traitement: 'Supervision & Audit', id_parent_traitement: 'MENU_ADMINISTRATION', icone_class: 'fas fa-eye', url_associee: '/pages/admin/supervision.html', ordre_affichage: 43 },
        { id_traitement: 'TRAIT_ADMIN_SUPERVISION_AUDIT_PURGE', libelle_traitement: 'Purger Journaux Audit', id_parent_traitement: 'TRAIT_ADMIN_SUPERVISION_AUDIT_VIEW', icone_class: null, url_associee: null, ordre_affichage: 431 },
        { id_traitement: 'TRAIT_ADMIN_SUPERVISION_TACHES_GERER', libelle_traitement: 'Gérer Tâches Asynchrones', id_parent_traitement: 'TRAIT_ADMIN_SUPERVISION_AUDIT_VIEW', icone_class: null, url_associee: null, ordre_affichage: 432 },
        { id_traitement: 'MENU_COMMISSION', libelle_traitement: 'Commission', id_parent_traitement: null, icone_class: 'fas fa-gavel', url_associee: null, ordre_affichage: 30 },
        { id_traitement: 'TRAIT_COMMISSION_VALIDATION_RAPPORT_VOTER', libelle_traitement: 'Voter Rapport', id_parent_traitement: 'MENU_COMMISSION', icone_class: 'fas fa-check-circle', url_associee: null, ordre_affichage: 31 },
        { id_traitement: 'TRAIT_COMMISSION_SESSION_CREER', libelle_traitement: 'Créer Session', id_parent_traitement: 'MENU_COMMISSION', icone_class: 'fas fa-plus-circle', url_associee: '/pages/commission/session.html?action=create', ordre_affichage: 32 },
        { id_traitement: 'TRAIT_COMMISSION_SESSION_GERER', libelle_traitement: 'Gérer Sessions', id_parent_traitement: 'MENU_COMMISSION', icone_class: 'fas fa-cogs', url_associee: '/pages/commission/session.html', ordre_affichage: 33 },
        { id_traitement: 'MENU_DASHBOARDS', libelle_traitement: 'Tableaux de Bord', id_parent_traitement: null, icone_class: 'fas fa-tachometer-alt', url_associee: null, ordre_affichage: 10 },
        { id_traitement: 'TRAIT_ADMIN_DASHBOARD_ACCEDER', libelle_traitement: 'Dashboard Admin', id_parent_traitement: 'MENU_DASHBOARDS', icone_class: 'fas fa-chart-line', url_associee: '/pages/admin/dashboard.html', ordre_affichage: 11 },
        { id_traitement: 'TRAIT_ETUDIANT_DASHBOARD_ACCEDER', libelle_traitement: 'Dashboard Étudiant', id_parent_traitement: 'MENU_DASHBOARDS', icone_class: 'fas fa-user-graduate', url_associee: '/pages/etudiant/dashboard.html', ordre_affichage: 12 },
        { id_traitement: 'TRAIT_COMMISSION_DASHBOARD_ACCEDER', libelle_traitement: 'Dashboard Commission', id_parent_traitement: 'MENU_DASHBOARDS', icone_class: 'fas fa-clipboard-list', url_associee: '/pages/commission/dashboard.html', ordre_affichage: 13 },
        { id_traitement: 'TRAIT_PERS_ADMIN_DASHBOARD_ACCEDER', libelle_traitement: 'Dashboard Personnel', id_parent_traitement: 'MENU_DASHBOARDS', icone_class: 'fas fa-user-tie', url_associee: '/pages/personnel/dashboard.html', ordre_affichage: 14 },
        { id_traitement: 'MENU_ETUDIANT', libelle_traitement: 'Espace Étudiant', id_parent_traitement: null, icone_class: 'fas fa-user-graduate', url_associee: null, ordre_affichage: 20 },
        { id_traitement: 'TRAIT_ETUDIANT_PROFIL_GERER', libelle_traitement: 'Gérer Profil Étudiant', id_parent_traitement: 'MENU_ETUDIANT', icone_class: 'fas fa-user-circle', url_associee: '/pages/etudiant/profil.html', ordre_affichage: 200 },
        { id_traitement: 'MENU_RAPPORT_ETUDIANT', libelle_traitement: 'Rapports Étudiant', id_parent_traitement: 'MENU_ETUDIANT', icone_class: 'fas fa-file-alt', url_associee: null, ordre_affichage: 21 },
        { id_traitement: 'TRAIT_ETUDIANT_RAPPORT_SOUMETTRE', libelle_traitement: 'Soumettre Rapport', id_parent_traitement: 'MENU_RAPPORT_ETUDIANT', icone_class: 'fas fa-upload', url_associee: '/pages/etudiant/rapport.html', ordre_affichage: 211 },
        { id_traitement: 'TRAIT_ETUDIANT_RAPPORT_SUIVRE', libelle_traitement: 'Suivre Rapport', id_parent_traitement: 'MENU_RAPPORT_ETUDIANT', icone_class: 'fas fa-eye', url_associee: '/pages/etudiant/rapport.html?action=view', ordre_affichage: 212 },
        { id_traitement: 'MENU_PERSONNEL', libelle_traitement: 'Espace Personnel', id_parent_traitement: null, icone_class: 'fas fa-user-tie', url_associee: null, ordre_affichage: 35 },
        { id_traitement: 'TRAIT_PERS_ADMIN_CONFORMITE_LISTER', libelle_traitement: 'Rapports Conformité', id_parent_traitement: 'MENU_PERSONNEL', icone_class: 'fas fa-clipboard-check', url_associee: '/pages/personnel/gestion-dossiers.html?tab=conformity', ordre_affichage: 36 },
        { id_traitement: 'TRAIT_PERS_ADMIN_CONFORMITE_VERIFIER', libelle_traitement: 'Vérifier Conformité', id_parent_traitement: 'TRAIT_PERS_ADMIN_CONFORMITE_LISTER', icone_class: null, url_associee: null, ordre_affichage: 361 },
        { id_traitement: 'TRAIT_PERS_ADMIN_SCOLARITE_ACCEDER', libelle_traitement: 'Scolarité', id_parent_traitement: 'MENU_PERSONNEL', icone_class: 'fas fa-graduation-cap', url_associee: '/pages/personnel/gestion-dossiers.html', ordre_affichage: 37 },
        { id_traitement: 'TRAIT_PERS_ADMIN_SCOLARITE_ETUDIANT_GERER', libelle_traitement: 'Gérer Dossier Étudiant', id_parent_traitement: 'TRAIT_PERS_ADMIN_SCOLARITE_ACCEDER', icone_class: null, url_associee: null, ordre_affichage: 371 },
        { id_traitement: 'TRAIT_PERS_ADMIN_SCOLARITE_PENALITE_GERER', libelle_traitement: 'Gérer Pénalités', id_parent_traitement: 'TRAIT_PERS_ADMIN_SCOLARITE_ACCEDER', icone_class: null, url_associee: null, ordre_affichage: 372 },
        { id_traitement: 'TRAIT_PERS_ADMIN_RECLAMATIONS_GERER', libelle_traitement: 'Gérer Réclamations', id_parent_traitement: 'MENU_PERSONNEL', icone_class: 'fas fa-question-circle', url_associee: '/pages/personnel/gestion-dossiers.html?tab=reclamations', ordre_affichage: 38 },
        { id_traitement: 'TRAIT_ADMIN_ACCES_FICHIERS_PROTEGES', libelle_traitement: 'Accéder Fichiers Protégés', id_parent_traitement: null, icone_class: null, url_associee: null, ordre_affichage: 0 },
        { id_traitement: 'TRAIT_ADMIN_IMPERSONATE_USER', libelle_traitement: 'Impersonnaliser Utilisateur', id_parent_traitement: null, icone_class: null, url_associee: null, ordre_affichage: 0 },
        { id_traitement: 'TRAIT_ADMIN_GERER_UTILISATEURS_MODIFIER', libelle_traitement: 'Modifier Utilisateur', id_parent_traitement: null, icone_class: null, url_associee: null, ordre_affichage: 0 },
        { id_traitement: 'TRAIT_ADMIN_GERER_UTILISATEURS_DELETE', libelle_traitement: 'Supprimer Utilisateur', id_parent_traitement: null, icone_class: null, url_associee: null, ordre_affichage: 0 },
        { id_traitement: 'TRAIT_VIEW_ALL_PROFILE_PICTURES', libelle_traitement: 'Voir toutes les photos de profil', id_parent_traitement: null, icone_class: null, url_associee: null, ordre_affichage: 0 },
        { id_traitement: 'TRAIT_PERS_ADMIN_ACCES_DOCUMENTS_ETUDIANTS', libelle_traitement: 'Accéder Documents Étudiants', id_parent_traitement: null, icone_class: null, url_associee: null, ordre_affichage: 0 }
    ],
    [TABLES.TYPE_DOCUMENT_REF]: [
        { id_type_document: 'DOC_ATTESTATION', libelle_type_document: 'Attestation de Scolarité', requis_ou_non: false },
        { id_type_document: 'DOC_BULLETIN', libelle_type_document: 'Bulletin de Notes', requis_ou_non: false },
        { id_type_document: 'DOC_EXPORT', libelle_type_document: 'Export de Données', requis_ou_non: false },
        { id_type_document: 'DOC_PV', libelle_type_document: 'Procès-Verbal de Soutenance', requis_ou_non: false },
        { id_type_document: 'DOC_RAPPORT', libelle_type_document: 'Rapport de Soutenance', requis_ou_non: true },
        { id_type_document: 'DOC_RECU', libelle_type_document: 'Reçu de Paiement', requis_ou_non: false }
    ],
    [TABLES.TYPE_UTILISATEUR]: [
        { id_type_utilisateur: 'TYPE_ADMIN', libelle_type_utilisateur: 'Administrateur Système' },
        { id_type_utilisateur: 'TYPE_ENS', libelle_type_utilisateur: 'Enseignant' },
        { id_type_utilisateur: 'TYPE_ETUD', libelle_type_utilisateur: 'Étudiant' },
        { id_type_utilisateur: 'TYPE_PERS_ADMIN', libelle_type_utilisateur: 'Personnel Administratif' }
    ],
    [TABLES.UE]: [
        { id_ue: 'UE_ALGO', libelle_ue: 'Algorithmique et Structures de Données', credits_ue: 6 },
        { id_ue: 'UE_BDD', libelle_ue: 'Bases de Données Avancées', credits_ue: 5 },
        { id_ue: 'UE_CLOUD', libelle_ue: 'Cloud Computing et DevOps', credits_ue: 5 },
        { id_ue: 'UE_CYBER', libelle_ue: 'Cybersécurité des Systèmes', credits_ue: 5 },
        { id_ue: 'UE_DEV_WEB', libelle_ue: 'Développement Web Avancé', credits_ue: 6 },
        { id_ue: 'UE_IA', libelle_ue: 'Intelligence Artificielle et Machine Learning', credits_ue: 6 },
        { id_ue: 'UE_MANAGEMENT', libelle_ue: 'Management de Projet Informatique', credits_ue: 4 },
        { id_ue: 'UE_MOBILE', libelle_ue: 'Développement Mobile', credits_ue: 4 },
        { id_ue: 'UE_RESEAUX', libelle_ue: 'Réseaux et Sécurité', credits_ue: 5 },
        { id_ue: 'UE_STAT_DATA', libelle_ue: 'Statistiques et Analyse de Données', credits_ue: 4 }
    ],
    // Données dynamiques (exemples)
    [TABLES.UTILISATEUR]: [
        { numero_utilisateur: 'SYS-2024-0001', login_utilisateur: 'aho.si', email_principal: 'ahopaul18@gmail.com', mot_de_passe: '$2y$10$Yz7cffYIpq574/BIed87R.UV85F.GG9VNF0JOX4bTcs/kTBOxeOQC', date_creation: '2024-07-01T21:55:27Z', derniere_connexion: '2024-07-01T21:55:27Z', token_reset_mdp: null, date_expiration_token_reset: null, token_validation_email: null, email_valide: true, tentatives_connexion_echouees: 0, compte_bloque_jusqua: null, preferences_2fa_active: false, secret_2fa: null, photo_profil: null, statut_compte: 'actif', id_niveau_acces_donne: 'ACCES_TOTAL', id_groupe_utilisateur: 'GRP_ADMIN_SYS', id_type_utilisateur: 'TYPE_ADMIN' },
        { numero_utilisateur: 'ADM-2024-0001', login_utilisateur: 'alain.terieur', email_principal: 'alain.terieur@mysoutenance.com', mot_de_passe: '$2y$10$Yz7cffYIpq574/BIed87R.UV85F.GG9VNF0JOX4bTcs/kTBOxeOQC', date_creation: '2024-07-01T22:00:00Z', derniere_connexion: '2024-07-01T22:00:00Z', token_reset_mdp: null, date_expiration_token_reset: null, token_validation_email: null, email_valide: true, tentatives_connexion_echouees: 0, compte_bloque_jusqua: null, preferences_2fa_active: false, secret_2fa: null, photo_profil: null, statut_compte: 'actif', id_niveau_acces_donne: 'ACCES_DEPARTEMENT', id_groupe_utilisateur: 'GRP_RS', id_type_utilisateur: 'TYPE_PERS_ADMIN' },
        { numero_utilisateur: 'ADM-2024-0002', login_utilisateur: 'alex.terieur', email_principal: 'alex.terieur@mysoutenance.com', mot_de_passe: '$2y$10$Yz7cffYIpq574/BIed87R.UV85F.GG9VNF0JOX4bTcs/kTBOxeOQC', date_creation: '2024-07-01T22:01:00Z', derniere_connexion: '2024-07-01T22:01:00Z', token_reset_mdp: null, date_expiration_token_reset: null, token_validation_email: null, email_valide: true, tentatives_connexion_echouees: 0, compte_bloque_jusqua: null, preferences_2fa_active: false, secret_2fa: null, photo_profil: null, statut_compte: 'actif', id_niveau_acces_donne: 'ACCES_DEPARTEMENT', id_groupe_utilisateur: 'GRP_AGENT_CONFORMITE', id_type_utilisateur: 'TYPE_PERS_ADMIN' },
        { numero_utilisateur: 'ENS-2024-0001', login_utilisateur: 'jean.dupont', email_principal: 'jean.dupont@mysoutenance.com', mot_de_passe: '$2y$10$Yz7cffYIpq574/BIed87R.UV85F.GG9VNF0JOX4bTcs/kTBOxeOQC', date_creation: '2024-07-01T22:02:00Z', derniere_connexion: '2024-07-01T22:02:00Z', token_reset_mdp: null, date_expiration_token_reset: null, token_validation_email: null, email_valide: true, tentatives_connexion_echouees: 0, compte_bloque_jusqua: null, preferences_2fa_active: false, secret_2fa: null, photo_profil: null, statut_compte: 'actif', id_niveau_acces_donne: 'ACCES_DEPARTEMENT', id_groupe_utilisateur: 'GRP_ENSEIGNANT', id_type_utilisateur: 'TYPE_ENS' },
        { numero_utilisateur: 'ENS-2024-0002', login_utilisateur: 'marie.curie', email_principal: 'marie.curie@mysoutenance.com', mot_de_passe: '$2y$10$Yz7cffYIpq574/BIed87R.UV85F.GG9VNF0JOX4bTcs/kTBOxeOQC', date_creation: '2024-07-01T22:03:00Z', derniere_connexion: '2024-07-01T22:03:00Z', token_reset_mdp: null, date_expiration_token_reset: null, token_validation_email: null, email_valide: true, tentatives_connexion_echouees: 0, compte_bloque_jusqua: null, preferences_2fa_active: false, secret_2fa: null, photo_profil: null, statut_compte: 'actif', id_niveau_acces_donne: 'ACCES_DEPARTEMENT', id_groupe_utilisateur: 'GRP_COMMISSION', id_type_utilisateur: 'TYPE_ENS' },
        { numero_utilisateur: 'ENS-2024-0003', login_utilisateur: 'pierre.lavoisier', email_principal: 'pierre.lavoisier@mysoutenance.com', mot_de_passe: '$2y$10$Yz7cffYIpq574/BIed87R.UV85F.GG9VNF0JOX4bTcs/kTBOxeOQC', date_creation: '2024-07-01T22:04:00Z', derniere_connexion: '2024-07-01T22:04:00Z', token_reset_mdp: null, date_expiration_token_reset: null, token_validation_email: null, email_valide: true, tentatives_connexion_echouees: 0, compte_bloque_jusqua: null, preferences_2fa_active: false, secret_2fa: null, photo_profil: null, statut_compte: 'actif', id_niveau_acces_donne: 'ACCES_DEPARTEMENT', id_groupe_utilisateur: 'GRP_ENSEIGNANT', id_type_utilisateur: 'TYPE_ENS' },
        { numero_utilisateur: 'ENS-2024-0004', login_utilisateur: 'sophie.germain', email_principal: 'sophie.germain@mysoutenance.com', mot_de_passe: '$2y$10$Yz7cffYIpq574/BIed87R.UV85F.GG9VNF0JOX4bTcs/kTBOxeOQC', date_creation: '2024-07-01T22:05:00Z', derniere_connexion: '2024-07-01T22:05:00Z', token_reset_mdp: null, date_expiration_token_reset: null, token_validation_email: null, email_valide: true, tentatives_connexion_echouees: 0, compte_bloque_jusqua: null, preferences_2fa_active: false, secret_2fa: null, photo_profil: null, statut_compte: 'actif', id_niveau_acces_donne: 'ACCES_DEPARTEMENT', id_groupe_utilisateur: 'GRP_COMMISSION', id_type_utilisateur: 'TYPE_ENS' },
        { numero_utilisateur: 'ETU-2003-0001', login_utilisateur: 'brou.ambroise', email_principal: 'brou.ambroise@mysoutenance.com', mot_de_passe: '$2y$10$Yz7cffYIpq574/BIed87R.UV85F.GG9VNF0JOX4bTcs/kTBOxeOQC', date_creation: '2003-09-01T10:00:00Z', derniere_connexion: '2003-09-01T10:00:00Z', token_reset_mdp: null, date_expiration_token_reset: null, token_validation_email: null, email_valide: true, tentatives_connexion_echouees: 0, compte_bloque_jusqua: null, preferences_2fa_active: false, secret_2fa: null, photo_profil: null, statut_compte: 'actif', id_niveau_acces_donne: 'ACCES_PERSONNEL', id_groupe_utilisateur: 'GRP_ETUDIANT', id_type_utilisateur: 'TYPE_ETUD' },
        { numero_utilisateur: 'ETU-2003-0002', login_utilisateur: 'coulibaly.ismael', email_principal: 'coulibaly.ismael@mysoutenance.com', mot_de_passe: '$2y$10$Yz7cffYIpq574/BIed87R.UV85F.GG9VNF0JOX4bTcs/kTBOxeOQC', date_creation: '2003-09-01T10:00:00Z', derniere_connexion: '2003-09-01T10:00:00Z', token_reset_mdp: null, date_expiration_token_reset: null, token_validation_email: null, email_valide: true, tentatives_connexion_echouees: 0, compte_bloque_jusqua: null, preferences_2fa_active: false, secret_2fa: null, photo_profil: null, statut_compte: 'actif', id_niveau_acces_donne: 'ACCES_PERSONNEL', id_groupe_utilisateur: 'GRP_ETUDIANT', id_type_utilisateur: 'TYPE_ETUD' },
        { numero_utilisateur: 'ETU-2003-0003', login_utilisateur: 'diomande.patrick', email_principal: 'diomande.patrick@mysoutenance.com', mot_de_passe: '$2y$10$Yz7cffYIpq574/BIed87R.UV85F.GG9VNF0JOX4bTcs/kTBOxeOQC', date_creation: '2003-09-01T10:00:00Z', derniere_connexion: '2003-09-01T10:00:00Z', token_reset_mdp: null, date_expiration_token_reset: null, token_validation_email: null, email_valide: true, tentatives_connexion_echouees: 0, compte_bloque_jusqua: null, preferences_2fa_active: false, secret_2fa: null, photo_profil: null, statut_compte: 'actif', id_niveau_acces_donne: 'ACCES_PERSONNEL', id_groupe_utilisateur: 'GRP_ETUDIANT', id_type_utilisateur: 'TYPE_ETUD' },
        { numero_utilisateur: 'ETU-2003-0004', login_utilisateur: 'ekponou.georges', email_principal: 'ekponou.georges@mysoutenance.com', mot_de_passe: '$2y$10$Yz7cffYIpq574/BIed87R.UV85F.GG9VNF0JOX4bTcs/kTBOxeOQC', date_creation: '2003-09-01T10:00:00Z', derniere_connexion: '2003-09-01T10:00:00Z', token_reset_mdp: null, date_expiration_token_reset: null, token_validation_email: null, email_valide: true, tentatives_connexion_echouees: 0, compte_bloque_jusqua: null, preferences_2fa_active: false, secret_2fa: null, photo_profil: null, statut_compte: 'actif', id_niveau_acces_donne: 'ACCES_PERSONNEL', id_groupe_utilisateur: 'GRP_ETUDIANT', id_type_utilisateur: 'TYPE_ETUD' },
        { numero_utilisateur: 'ETU-2003-0005', login_utilisateur: 'gnaman.arthur', email_principal: 'gnaman.arthur@mysoutenance.com', mot_de_passe: '$2y$10$Yz7cffYIpq574/BIed87R.UV85F.GG9VNF0JOX4bTcs/kTBOxeOQC', date_creation: '2003-09-01T10:00:00Z', derniere_connexion: '2003-09-01T10:00:00Z', token_reset_mdp: null, date_expiration_token_reset: null, token_validation_email: null, email_valide: true, tentatives_connexion_echouees: 0, compte_bloque_jusqua: null, preferences_2fa_active: false, secret_2fa: null, photo_profil: null, statut_compte: 'actif', id_niveau_acces_donne: 'ACCES_PERSONNEL', id_groupe_utilisateur: 'GRP_ETUDIANT', id_type_utilisateur: 'TYPE_ETUD' },
        { numero_utilisateur: 'ETU-2003-0006', login_utilisateur: 'guiegui.arnaud', email_principal: 'guiegui.arnaud@mysoutenance.com', mot_de_passe: '$2y$10$Yz7cffYIpq574/BIed87R.UV85F.GG9VNF0JOX4bTcs/kTBOxeOQC', date_creation: '2003-09-01T10:00:00Z', derniere_connexion: '2003-09-01T10:00:00Z', token_reset_mdp: null, date_expiration_token_reset: null, token_validation_email: null, email_valide: true, tentatives_connexion_echouees: 0, compte_bloque_jusqua: null, preferences_2fa_active: false, secret_2fa: null, photo_profil: null, statut_compte: 'actif', id_niveau_acces_donne: 'ACCES_PERSONNEL', id_groupe_utilisateur: 'GRP_ETUDIANT', id_type_utilisateur: 'TYPE_ETUD' },
        { numero_utilisateur: 'ETU-2003-0007', login_utilisateur: 'kacou.yvesroland', email_principal: 'kacou.yvesroland@mysoutenance.com', mot_de_passe: '$2y$10$Yz7cffYIpq574/BIed87R.UV85F.GG9VNF0JOX4bTcs/kTBOxeOQC', date_creation: '2003-09-01T10:00:00Z', derniere_connexion: '2003-09-01T10:00:00Z', token_reset_mdp: null, date_expiration_token_reset: null, token_validation_email: null, email_valide: true, tentatives_connexion_echouees: 0, compte_bloque_jusqua: null, preferences_2fa_active: false, secret_2fa: null, photo_profil: null, statut_compte: 'actif', id_niveau_acces_donne: 'ACCES_PERSONNEL', id_groupe_utilisateur: 'GRP_ETUDIANT', id_type_utilisateur: 'TYPE_ETUD' },
        { numero_utilisateur: 'ETU-2003-0008', login_utilisateur: 'kadio.elodie', email_principal: 'kadio.elodie@mysoutenance.com', mot_de_passe: '$2y$10$Yz7cffYIpq574/BIed87R.UV85F.GG9VNF0JOX4bTcs/kTBOxeOQC', date_creation: '2003-09-01T10:00:00Z', derniere_connexion: '2003-09-01T10:00:00Z', token_reset_mdp: null, date_expiration_token_reset: null, token_validation_email: null, email_valide: true, tentatives_connexion_echouees: 0, compte_bloque_jusqua: null, preferences_2fa_active: false, secret_2fa: null, photo_profil: null, statut_compte: 'actif', id_niveau_acces_donne: 'ACCES_PERSONNEL', id_groupe_utilisateur: 'GRP_ETUDIANT', id_type_utilisateur: 'TYPE_ETUD' }
    ],
    [TABLES.ETUDIANT]: [
        { numero_carte_etudiant: 'ETU-2003-0001', nom: 'Brou', prenom: 'Kouamé Wa Ambroise', date_naissance: '1983-07-20', lieu_naissance: 'Paris', pays_naissance: 'France', nationalite: 'Française', sexe: 'Masculin', adresse_postale: '42 Rue de la Paix', ville: 'Nantes', code_postal: '44000', telephone: '0612345678', email_contact_secondaire: 'secondary.brou.ambroise@example.com', numero_utilisateur: 'ETU-2003-0001', contact_urgence_nom: 'Mme Brou', contact_urgence_telephone: '0687654321', contact_urgence_relation: 'Parent' },
        { numero_carte_etudiant: 'ETU-2003-0002', nom: 'Coulibaly', prenom: 'Pécory Ismaèl', date_naissance: '1982-03-10', lieu_naissance: 'Abidjan', pays_naissance: 'Côte d\'Ivoire', nationalite: 'Ivoirienne', sexe: 'Masculin', adresse_postale: '15 Avenue de la Liberté', ville: 'Abidjan', code_postal: '00225', telephone: '0712345678', email_contact_secondaire: 'secondary.coulibaly.ismael@example.com', numero_utilisateur: 'ETU-2003-0002', contact_urgence_nom: 'Mme Coulibaly', contact_urgence_telephone: '0787654321', contact_urgence_relation: 'Parent' },
        { numero_carte_etudiant: 'ETU-2003-0003', nom: 'Diomandé', prenom: 'Gondo Patrick', date_naissance: '1984-11-05', lieu_naissance: 'Dakar', pays_naissance: 'Sénégal', nationalite: 'Sénégalaise', sexe: 'Masculin', adresse_postale: '20 Rue de l\'Espoir', ville: 'Dakar', code_postal: '00221', telephone: '0812345678', email_contact_secondaire: 'secondary.diomande.patrick@example.com', numero_utilisateur: 'ETU-2003-0003', contact_urgence_nom: 'Mme Diomandé', contact_urgence_telephone: '0887654321', contact_urgence_relation: 'Parent' },
        { numero_carte_etudiant: 'ETU-2003-0004', nom: 'Ekponou', prenom: 'Georges', date_naissance: '1981-08-25', lieu_naissance: 'Yaoundé', pays_naissance: 'Cameroun', nationalite: 'Camerounaise', sexe: 'Masculin', adresse_postale: '30 Rue de la Joie', ville: 'Yaoundé', code_postal: '00237', telephone: '0912345678', email_contact_secondaire: 'secondary.ekponou.georges@example.com', numero_utilisateur: 'ETU-2003-0004', contact_urgence_nom: 'Mme Ekponou', contact_urgence_telephone: '0987654321', contact_urgence_relation: 'Parent' },
        { numero_carte_etudiant: 'ETU-2003-0005', nom: 'Gnaman', prenom: 'Arthur Berenger', date_naissance: '1985-02-18', lieu_naissance: 'Casablanca', pays_naissance: 'Maroc', nationalite: 'Marocaine', sexe: 'Masculin', adresse_postale: '40 Boulevard du Soleil', ville: 'Casablanca', code_postal: '00212', telephone: '0612345678', email_contact_secondaire: 'secondary.gnaman.arthur@example.com', numero_utilisateur: 'ETU-2003-0005', contact_urgence_nom: 'Mme Gnaman', contact_urgence_telephone: '0687654321', contact_urgence_relation: 'Parent' },
        { numero_carte_etudiant: 'ETU-2003-0006', nom: 'Guiégui', prenom: 'Arnaud Kévin Boris', date_naissance: '1983-09-12', lieu_naissance: 'Bruxelles', pays_naissance: 'Belgique', nationalite: 'Belge', sexe: 'Masculin', adresse_postale: '50 Rue de la Joie', ville: 'Bruxelles', code_postal: '1000', telephone: '0212345678', email_contact_secondaire: 'secondary.guiegui.arnaud@example.com', numero_utilisateur: 'ETU-2003-0006', contact_urgence_nom: 'Mme Guiégui', contact_urgence_telephone: '0287654321', contact_urgence_relation: 'Parent' },
        { numero_carte_etudiant: 'ETU-2003-0007', nom: 'Kacou', prenom: 'Allou Yves-Roland', date_naissance: '1984-04-22', lieu_naissance: 'Montréal', pays_naissance: 'Canada', nationalite: 'Canadienne', sexe: 'Masculin', adresse_postale: '60 Rue de la Découverte', ville: 'Montréal', code_postal: 'H1A 0A0', telephone: '5141234567', email_contact_secondaire: 'secondary.kacou.yvesroland@example.com', numero_utilisateur: 'ETU-2003-0007', contact_urgence_nom: 'Mme Kacou', contact_urgence_telephone: '5148765432', contact_urgence_relation: 'Parent' },
        { numero_carte_etudiant: 'ETU-2003-0008', nom: 'Kadio', prenom: 'Paule Elodie', date_naissance: '1982-06-01', lieu_naissance: 'Genève', pays_naissance: 'Suisse', nationalite: 'Suisse', sexe: 'Féminin', adresse_postale: '70 Chemin des Fleurs', ville: 'Genève', code_postal: '1200', telephone: '0221234567', email_contact_secondaire: 'secondary.kadio.elodie@example.com', numero_utilisateur: 'ETU-2003-0008', contact_urgence_nom: 'Mme Kadio', contact_urgence_telephone: '0228765432', contact_urgence_relation: 'Parent' }
    ],
    [TABLES.ENSEIGNANT]: [
        { numero_enseignant: 'ENS-2024-0001', nom: 'Dupont', prenom: 'Jean', telephone_professionnel: '0100000001', email_professionnel: 'jean.dupont@mysoutenance.com', numero_utilisateur: 'ENS-2024-0001', date_naissance: '1975-01-01', lieu_naissance: 'Nantes', pays_naissance: 'France', nationalite: 'Française', sexe: 'Masculin', adresse_postale: '1 Rue des Sciences', ville: 'Nantes', code_postal: '44000', telephone_personnel: '0600000001', email_personnel_secondaire: 'jean.perso@example.com' },
        { numero_enseignant: 'ENS-2024-0002', nom: 'Curie', prenom: 'Marie', telephone_professionnel: '0100000002', email_professionnel: 'marie.curie@mysoutenance.com', numero_utilisateur: 'ENS-2024-0002', date_naissance: '1968-03-10', lieu_naissance: 'Varsovie', pays_naissance: 'Pologne', nationalite: 'Polonaise', sexe: 'Féminin', adresse_postale: '2 Avenue de la Recherche', ville: 'Paris', code_postal: '75005', telephone_personnel: '0600000002', email_personnel_secondaire: 'marie.perso@example.com' },
        { numero_enseignant: 'ENS-2024-0003', nom: 'Lavoisier', prenom: 'Pierre', telephone_professionnel: '0100000003', email_professionnel: 'pierre.lavoisier@mysoutenance.com', numero_utilisateur: 'ENS-2024-0003', date_naissance: '1972-07-20', lieu_naissance: 'Lille', pays_naissance: 'France', nationalite: 'Française', sexe: 'Masculin', adresse_postale: '3 Boulevard de la Chimie', ville: 'Lille', code_postal: '59000', telephone_personnel: '0600000003', email_personnel_secondaire: 'pierre.perso@example.com' },
        { numero_enseignant: 'ENS-2024-0004', nom: 'Germain', prenom: 'Sophie', telephone_professionnel: '0100000004', email_professionnel: 'sophie.germain@mysoutenance.com', numero_utilisateur: 'ENS-2024-0004', date_naissance: '1980-09-05', lieu_naissance: 'Bordeaux', pays_naissance: 'France', nationalite: 'Française', sexe: 'Féminin', adresse_postale: '4 Place des Maths', ville: 'Bordeaux', code_postal: '33000', telephone_personnel: '0600000004', email_personnel_secondaire: 'sophie.perso@example.com' }
    ],
    [TABLES.PERSONNEL_ADMINISTRATIF]: [
        { numero_personnel_administratif: 'ADM-2024-0001', nom: 'Terieur', prenom: 'Alain', telephone_professionnel: '0123456789', email_professionnel: 'alain.terieur@mysoutenance.com', date_affectation_service: '2020-09-01', responsabilites_cles: 'Responsable Scolarité, gestion des inscriptions et stages', numero_utilisateur: 'ADM-2024-0001', date_naissance: '1980-05-15', lieu_naissance: 'Paris', pays_naissance: 'France', nationalite: 'Française', sexe: 'Masculin', adresse_postale: '10 Rue de la Scolarité', ville: 'Paris', code_postal: '75001', telephone_personnel: '0600000000', email_personnel_secondaire: 'alain.perso@example.com' },
        { numero_personnel_administratif: 'ADM-2024-0002', nom: 'Terieur', prenom: 'Alex', telephone_professionnel: '0123456790', email_professionnel: 'alex.terieur@mysoutenance.com', date_affectation_service: '2021-03-01', responsabilites_cles: 'Agent de Contrôle de Conformité des rapports', numero_utilisateur: 'ADM-2024-0002', date_naissance: '1985-11-20', lieu_naissance: 'Lyon', pays_naissance: 'France', nationalite: 'Française', sexe: 'Masculin', adresse_postale: '20 Avenue de la Conformité', ville: 'Lyon', code_postal: '69000', telephone_personnel: '0611111111', email_personnel_secondaire: 'alex.perso@example.com' }
    ],
    [TABLES.RAPPORT_ETUDIANT]: [
        { id_rapport_etudiant: 'RAP-2024-0001', libelle_rapport_etudiant: 'Rapport de Stage sur l\'IA', theme: 'Intelligence Artificielle', resume: '<p>Ceci est un résumé du rapport sur l\'IA.</p>', numero_attestation_stage: 'ATT-001', numero_carte_etudiant: 'ETU-2003-0001', nombre_pages: 50, id_statut_rapport: 'RAP_SOUMIS', date_soumission: '2024-06-15T10:00:00Z', date_derniere_modif: '2024-06-15T10:00:00Z' },
        { id_rapport_etudiant: 'RAP-2024-0002', libelle_rapport_etudiant: 'Analyse de Données Financières', theme: 'Finance', resume: '<p>Analyse des marchés financiers.</p>', numero_attestation_stage: 'ATT-002', numero_carte_etudiant: 'ETU-2003-0002', nombre_pages: 45, id_statut_rapport: 'RAP_EN_COMMISSION', date_soumission: '2024-06-10T11:00:00Z', date_derniere_modif: '2024-06-10T11:00:00Z' },
        { id_rapport_etudiant: 'RAP-2024-0003', libelle_rapport_etudiant: 'Sécurité des Réseaux d\'Entreprise', theme: 'Cybersécurité', resume: '<p>Étude des vulnérabilités.</p>', numero_attestation_stage: 'ATT-003', numero_carte_etudiant: 'ETU-2003-0003', nombre_pages: 60, id_statut_rapport: 'RAP_VALID', date_soumission: '2024-05-20T14:00:00Z', date_derniere_modif: '2024-05-25T10:00:00Z' },
        { id_rapport_etudiant: 'RAP-2024-0004', libelle_rapport_etudiant: 'Développement Mobile Cross-Platform', theme: 'Développement Mobile', resume: '<p>Comparaison Flutter vs React Native.</p>', numero_attestation_stage: 'ATT-004', numero_carte_etudiant: 'ETU-2003-0004', nombre_pages: 55, id_statut_rapport: 'RAP_NON_CONF', date_soumission: '2024-06-01T09:00:00Z', date_derniere_modif: '2024-06-05T16:00:00Z' },
        { id_rapport_etudiant: 'RAP-2024-0005', libelle_rapport_etudiant: 'Optimisation de Bases de Données NoSQL', theme: 'Bases de Données', resume: '<p>Étude de cas MongoDB.</p>', numero_attestation_stage: 'ATT-005', numero_carte_etudiant: 'ETU-2003-0005', nombre_pages: 48, id_statut_rapport: 'RAP_BROUILLON', date_soumission: null, date_derniere_modif: '2024-07-01T18:00:00Z' }
    ],
    [TABLES.SECTION_RAPPORT]: [
        { id_rapport_etudiant: 'RAP-2024-0001', titre_section: 'Introduction', contenu_section: '<p>Contenu de l\'introduction du rapport 1.</p>', ordre: 1 },
        { id_rapport_etudiant: 'RAP-2024-0001', titre_section: 'Méthodologie', contenu_section: '<p>Détail de la méthodologie utilisée.</p>', ordre: 2 },
        { id_rapport_etudiant: 'RAP-2024-0001', titre_section: 'Conclusion', contenu_section: '<p>Conclusion du rapport 1.</p>', ordre: 3 },
        { id_rapport_etudiant: 'RAP-2024-0005', titre_section: 'Introduction', contenu_section: '<p>Introduction du brouillon.</p>', ordre: 1 }
    ],
    [TABLES.INSCRIRE]: [
        { numero_carte_etudiant: 'ETU-2003-0001', id_niveau_etude: 'L3', id_annee_academique: 'ANNEE-2003-2004', montant_inscription: 1500.00, date_inscription: '2003-09-15T10:00:00Z', id_statut_paiement: 'PAIE_OK', date_paiement: '2003-09-10T10:00:00Z', numero_recu_paiement: 'REC-2003-ETU-2003-0001', id_decision_passage: null },
        { numero_carte_etudiant: 'ETU-2003-0001', id_niveau_etude: 'M1', id_annee_academique: 'ANNEE-2004-2005', montant_inscription: 2000.00, date_inscription: '2004-09-15T10:00:00Z', id_statut_paiement: 'PAIE_OK', date_paiement: '2004-09-10T10:00:00Z', numero_recu_paiement: 'REC-2004-ETU-2003-0001-M1', id_decision_passage: null },
        { numero_carte_etudiant: 'ETU-2003-0001', id_niveau_etude: 'M2', id_annee_academique: 'ANNEE-2005-2006', montant_inscription: 2500.00, date_inscription: '2005-09-15T10:00:00Z', id_statut_paiement: 'PAIE_ATTENTE', date_paiement: null, numero_recu_paiement: null, id_decision_passage: null },
        { numero_carte_etudiant: 'ETU-2003-0002', id_niveau_etude: 'L3', id_annee_academique: 'ANNEE-2003-2004', montant_inscription: 1500.00, date_inscription: '2003-09-15T10:00:00Z', id_statut_paiement: 'PAIE_OK', date_paiement: '2003-09-10T10:00:00Z', numero_recu_paiement: 'REC-2003-ETU-2003-0002', id_decision_passage: null }
    ],
    [TABLES.FAIRE_STAGE]: [
        { id_entreprise: 'ENT-001', numero_carte_etudiant: 'ETU-2003-0001', date_debut_stage: '2024-03-01', date_fin_stage: '2024-08-31', sujet_stage: 'Développement d\'un agent conversationnel IA', nom_tuteur_entreprise: 'Dr. Smith', est_valide: true },
        { id_entreprise: 'ENT-002', numero_carte_etudiant: 'ETU-2003-0002', date_debut_stage: '2024-04-01', date_fin_stage: '2024-09-30', sujet_stage: 'Analyse de données pour la prévision boursière', nom_tuteur_entreprise: 'Mme Johnson', est_valide: false }
    ],
    [TABLES.PENALITE]: [
        { id_penalite: 'PEN-2024-0001', numero_carte_etudiant: 'ETU-2003-0001', id_annee_academique: 'ANNEE-2024-2025', type_penalite: 'Financière', montant_du: 100.00, motif: 'Retard soumission rapport', id_statut_penalite: 'PEN_DUE', date_creation: '2024-07-01T10:00:00Z', date_regularisation: null, numero_personnel_traitant: null }
    ],
    [TABLES.RECLAMATION]: [
        { id_reclamation: 'RECLA-2024-0001', numero_carte_etudiant: 'ETU-2003-0001', categorie_reclamation: 'Inscription', sujet_reclamation: 'Problème de statut d\'inscription', description_reclamation: 'Mon statut est "en attente" alors que j\'ai payé.', date_soumission: '2024-07-05T14:00:00Z', id_statut_reclamation: 'RECLA_OUVERTE', reponse_reclamation: null, date_reponse: null, numero_personnel_traitant: null }
    ],
    [TABLES.SESSION_VALIDATION]: [
        { id_session: 'SESS-2024-0001', nom_session: 'Session Juin M2 IA', date_debut_session: '2024-06-20T09:00:00Z', date_fin_prevue: '2024-06-20T17:00:00Z', date_creation: '2024-06-01T10:00:00Z', id_president_session: 'ENS-2024-0002', mode_session: 'presentiel', statut_session: 'en_cours', nombre_votants_requis: 3 },
        { id_session: 'SESS-2024-0002', nom_session: 'Session Juillet L3', date_debut_session: '2024-07-10T09:00:00Z', date_fin_prevue: '2024-07-10T12:00:00Z', date_creation: '2024-06-15T11:00:00Z', id_president_session: 'ENS-2024-0001', mode_session: 'en_ligne', statut_session: 'planifiee', nombre_votants_requis: 2 }
    ],
    [TABLES.SESSION_RAPPORT]: [
        { id_session: 'SESS-2024-0001', id_rapport_etudiant: 'RAP-2024-0002' },
        { id_session: 'SESS-2024-0001', id_rapport_etudiant: 'RAP-2024-0003' }
    ],
    [TABLES.VOTE_COMMISSION]: [
        { id_vote: 'VOTE-2024-0001', id_session: 'SESS-2024-0001', id_rapport_etudiant: 'RAP-2024-0002', numero_enseignant: 'ENS-2024-0002', id_decision_vote: 'VOTE_APPROUVE', commentaire_vote: null, date_vote: '2024-06-20T10:30:00Z', tour_vote: 1 }
    ],
    [TABLES.COMPTE_RENDU]: [
        { id_compte_rendu: 'PV-2024-0001', id_rapport_etudiant: null, type_pv: 'Session', libelle_compte_rendu: 'PV de la session SESS-2024-0001', date_creation_pv: '2024-06-20T18:00:00Z', id_statut_pv: 'PV_BROUILLON', id_redacteur: 'ENS-2024-0002', date_limite_approbation: null, contenu: '<p>Contenu du PV de la session SESS-2024-0001.</p>' }
    ],
    [TABLES.AFFECTER]: [
        { numero_enseignant: 'ENS-2024-0002', id_rapport_etudiant: 'RAP-2024-0002', id_statut_jury: 'JURY_MEMBRE', directeur_memoire: false, date_affectation: '2024-06-05T10:00:00Z' },
        { numero_enseignant: 'ENS-2024-0001', id_rapport_etudiant: 'RAP-2024-0002', id_statut_jury: 'JURY_RAPPORTEUR', directeur_memoire: false, date_affectation: '2024-06-05T10:00:00Z' }
    ],
    [TABLES.EVALUER]: [
        { numero_carte_etudiant: 'ETU-2003-0001', id_ecue: 'ECUE_ALGO_AVANCE', id_annee_academique: 'ANNEE-2004-2005', date_evaluation: '2005-06-01T10:00:00Z', note: 15.50 }
    ],
    [TABLES.DOCUMENT_GENERE]: [
        { id_document_genere: 'DOC-2024-0001', id_type_document: 'DOC_RAPPORT', chemin_fichier: 'rapports/RAP-2024-0003.pdf', date_generation: '2024-05-25T10:00:00Z', version: 1, id_entite_concernee: 'RAP-2024-0003', type_entite_concernee: 'RapportEtudiant', numero_utilisateur_concerne: 'ETU-2003-0003', est_archive: false }
    ],
    [TABLES.DELEGATION]: [],
    [TABLES.ENREGISTRER]: [],
    [TABLES.HISTORIQUE_MOT_DE_PASSE]: [],
    [TABLES.LECTURE_MESSAGE]: [],
    [TABLES.MESSAGE_CHAT]: [],
    [TABLES.OCCUPER]: [],
    [TABLES.PARTICIPANT_CONVERSATION]: [],
    [TABLES.PISTER]: [],
    [TABLES.PV_SESSION_RAPPORT]: [],
    [TABLES.QUEUE_JOBS]: [],
    [TABLES.RECEPTOIR]: [],
    [TABLES.SESSIONS]: [],
    [TABLES.SEQUENCES]: [
        { nom_sequence: 'ADM', annee: 2024, valeur_actuelle: 2 }, { nom_sequence: 'CONV', annee: 2024, valeur_actuelle: 0 },
        { nom_sequence: 'CRD', annee: 2024, valeur_actuelle: 0 }, { nom_sequence: 'DEL', annee: 2024, valeur_actuelle: 0 },
        { nom_sequence: 'DOC', annee: 2024, valeur_actuelle: 1 }, { nom_sequence: 'ENS', annee: 2024, valeur_actuelle: 4 },
        { nom_sequence: 'ETU', annee: 2024, valeur_actuelle: 8 }, { nom_sequence: 'LOG', annee: 2024, valeur_actuelle: 0 },
        { nom_sequence: 'MSG', annee: 2024, valeur_actuelle: 0 }, { nom_sequence: 'PEN', annee: 2024, valeur_actuelle: 1 },
        { nom_sequence: 'PISTE', annee: 2024, valeur_actuelle: 0 }, { nom_sequence: 'PV', annee: 2024, valeur_actuelle: 1 },
        { nom_sequence: 'RAP', annee: 2024, valeur_actuelle: 5 }, { nom_sequence: 'RECEP', annee: 2024, valeur_actuelle: 0 },
        { nom_sequence: 'RECLA', annee: 2024, valeur_actuelle: 1 }, { nom_sequence: 'SESS', annee: 2024, valeur_actuelle: 2 },
        { nom_sequence: 'SYS', annee: 2024, valeur_actuelle: 1 }, { nom_sequence: 'TPL', annee: 2024, valeur_actuelle: 4 },
        { nom_sequence: 'VOTE', annee: 2024, valeur_actuelle: 1 }
    ]
};

// Charge la base de données depuis localStorage ou initialise avec les données par défaut
function loadDB() {
    const storedDB = localStorage.getItem(DB_KEY);
    if (storedDB) {
        // Tenter de parser, si échec, réinitialiser
        try {
            db = JSON.parse(storedDB);
            // Assurer que toutes les tables sont présentes même si vides
            for (const table of Object.values(TABLES)) {
                if (!db[table]) {
                    db[table] = [];
                }
            }
        } catch (e) {
            console.error("Failed to parse stored DB, resetting:", e);
            db = initialDBState;
        }
    } else {
        db = initialDBState;
    }
    saveDB(); // Sauvegarder pour s'assurer que la structure est persistée
}

// Sauvegarde la base de données dans localStorage
function saveDB() {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
}

// Réinitialise la base de données simulée
export function resetSimulationDB() {
    db = initialDBState;
    saveDB();
    console.log("Simulated database reset.");
}

// --- LOGIQUE CRUD GÉNÉRIQUE ---

/**
 * Récupère des enregistrements d'une table.
 * @param {string} tableName - Nom de la table.
 * @param {object} [filters={}] - Filtres à appliquer.
 * @param {string} [orderBy=null] - Colonne pour le tri.
 * @param {number} [limit=null] - Limite de résultats.
 * @param {number} [offset=null] - Décalage.
 * @returns {Promise<{data: Array<object>, error: object|null}>}
 */
export async function getRecords(tableName, filters = {}, orderBy = null, limit = null, offset = null) {
    await new Promise(resolve => setTimeout(resolve, 100)); // Simule un délai réseau
    if (!db[tableName]) {
        return { data: null, error: { message: `Table '${tableName}' not found in simulated DB.` } };
    }

    let records = [...db[tableName]]; // Copie pour ne pas modifier l'original

    // Appliquer les filtres
    for (const key in filters) {
        const filterValue = filters[key];
        if (typeof filterValue === 'object' && filterValue.operator) {
            // Gérer les opérateurs complexes (like, neq, gt, lt, in)
            records = records.filter(record => {
                const recordValue = record[key];
                switch (filterValue.operator) {
                    case 'like': return recordValue?.includes(filterValue.value);
                    case 'neq': return recordValue !== filterValue.value;
                    case 'gt': return recordValue > filterValue.value;
                    case 'lt': return recordValue < filterValue.value;
                    case 'in': return filterValue.value.includes(recordValue);
                    default: return true;
                }
            });
        } else {
            records = records.filter(record => record[key] === filterValue);
        }
    }

    // Appliquer le tri
    if (orderBy) {
        const [column, direction = 'ASC'] = orderBy.split(' ');
        records.sort((a, b) => {
            if (a[column] < b[column]) return direction === 'ASC' ? -1 : 1;
            if (a[column] > b[column]) return direction === 'ASC' ? 1 : -1;
            return 0;
        });
    }

    // Appliquer offset et limit
    if (offset) records = records.slice(offset);
    if (limit) records = records.slice(0, limit);

    return { data: records, error: null };
}

/**
 * Récupère un enregistrement par son ID.
 * @param {string} tableName - Nom de la table.
 * @param {string} id - ID de l'enregistrement.
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function getRecordById(tableName, id) {
    await new Promise(resolve => setTimeout(resolve, 50)); // Simule un délai réseau
    if (!db[tableName]) {
        return { data: null, error: { message: `Table '${tableName}' not found.` } };
    }
    const primaryKey = getPrimaryKeyColumn(tableName);
    const record = db[tableName].find(r => r[primaryKey] === id);
    return record ? { data: record, error: null } : { data: null, error: { message: 'Record not found.' } };
}

/**
 * Crée un nouvel enregistrement.
 * @param {string} tableName - Nom de la table.
 * @param {object} data - Données de l'enregistrement.
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function createRecord(tableName, data) {
    await new Promise(resolve => setTimeout(resolve, 100)); // Simule un délai réseau
    if (!db[tableName]) {
        return { data: null, error: { message: `Table '${tableName}' not found.` } };
    }

    const primaryKey = getPrimaryKeyColumn(tableName);
    if (!data[primaryKey]) {
        // Simuler la génération d'ID si non fourni (pour les tables où l'app génère l'ID)
        if (Object.values(ID_PREFIXES).includes(primaryKey.split('-')[0])) { // Si la PK ressemble à un ID généré
            data[primaryKey] = generateUniqueId(primaryKey.split('-')[0]);
        } else {
            data[primaryKey] = generateUniqueId(tableName.toUpperCase().replace(/_REF|_UTILISATEUR|_ACCES|_MODELE|_RAPPORT|_CONFORMITE|_VALIDATION|_PASSAGE|_VOTE|_JURY|_PAIEMENT|_PENALITE|_PV|_RECLAMATION|_DOCUMENT/g, '').replace(/_/, ''));
        }
    }

    // Vérifier les doublons pour la PK
    if (db[tableName].some(r => r[primaryKey] === data[primaryKey])) {
        return { data: null, error: { message: `Duplicate key error for ${primaryKey}: ${data[primaryKey]}` } };
    }

    // Vérifier les contraintes d'unicité (ex: email_principal, login_utilisateur)
    if (tableName === TABLES.UTILISATEUR) {
        if (db[tableName].some(u => u.email_principal === data.email_principal && u[primaryKey] !== data[primaryKey])) {
            return { data: null, error: { message: `Duplicate email: ${data.email_principal}` } };
        }
        if (db[tableName].some(u => u.login_utilisateur === data.login_utilisateur && u[primaryKey] !== data[primaryKey])) {
            return { data: null, error: { message: `Duplicate login: ${data.login_utilisateur}` } };
        }
    }
    // Ajoutez d'autres vérifications d'unicité pour d'autres tables si nécessaire

    db[tableName].push(data);
    saveDB();
    return { data: data, error: null };
}

/**
 * Met à jour un enregistrement.
 * @param {string} tableName - Nom de la table.
 * @param {string} id - ID de l'enregistrement à mettre à jour.
 * @param {object} data - Données à mettre à jour.
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function updateRecord(tableName, id, data) {
    await new Promise(resolve => setTimeout(resolve, 100)); // Simule un délai réseau
    if (!db[tableName]) {
        return { data: null, error: { message: `Table '${tableName}' not found.` } };
    }
    const primaryKey = getPrimaryKeyColumn(tableName);
    const index = db[tableName].findIndex(r => r[primaryKey] === id);

    if (index === -1) {
        return { data: null, error: { message: 'Record not found for update.' } };
    }

    // Vérifier les contraintes d'unicité lors de la mise à jour
    if (tableName === TABLES.UTILISATEUR) {
        if (data.email_principal && db[tableName].some(u => u.email_principal === data.email_principal && u[primaryKey] !== id)) {
            return { data: null, error: { message: `Duplicate email: ${data.email_principal}` } };
        }
        if (data.login_utilisateur && db[tableName].some(u => u.login_utilisateur === data.login_utilisateur && u[primaryKey] !== id)) {
            return { data: null, error: { message: `Duplicate login: ${data.login_utilisateur}` } };
        }
    }
    // Ajoutez d'autres vérifications d'unicité pour d'autres tables si nécessaire

    db[tableName][index] = { ...db[tableName][index], ...data };
    saveDB();
    return { data: db[tableName][index], error: null };
}

/**
 * Met à jour plusieurs enregistrements basés sur des filtres.
 * @param {string} tableName - Nom de la table.
 * @param {object} data - Données à mettre à jour.
 * @param {object} filters - Filtres pour sélectionner les enregistrements.
 * @returns {Promise<{data: Array<object>, error: object|null}>}
 */
export async function updateRecords(tableName, data, filters) {
    await new Promise(resolve => setTimeout(resolve, 100)); // Simule un délai réseau
    if (!db[tableName]) {
        return { data: null, error: { message: `Table '${tableName}' not found.` } };
    }

    let updatedCount = 0;
    db[tableName] = db[tableName].map(record => {
        let matchesFilters = true;
        for (const key in filters) {
            if (record[key] !== filters[key]) {
                matchesFilters = false;
                break;
            }
        }
        if (matchesFilters) {
            updatedCount++;
            return { ...record, ...data };
        }
        return record;
    });
    saveDB();
    return { data: { count: updatedCount }, error: null };
}

/**
 * Supprime un enregistrement.
 * @param {string} tableName - Nom de la table.
 * @param {string} id - ID de l'enregistrement à supprimer.
 * @returns {Promise<{success: boolean, error: object|null}>}
 */
export async function deleteRecord(tableName, id) {
    await new Promise(resolve => setTimeout(resolve, 100)); // Simule un délai réseau
    if (!db[tableName]) {
        return { success: false, error: { message: `Table '${tableName}' not found.` } };
    }
    const primaryKey = getPrimaryKeyColumn(tableName);
    const initialLength = db[tableName].length;
    db[tableName] = db[tableName].filter(r => r[primaryKey] !== id);

    if (db[tableName].length === initialLength) {
        return { success: false, error: { message: 'Record not found for deletion.' } };
    }
    saveDB();
    return { success: true, error: null };
}

// --- FONCTIONS UTILITAIRES INTERNES ---

// Définir les clés primaires pour chaque table
function getPrimaryKeyColumn(tableName) {
    switch (tableName) {
        case TABLES.UTILISATEUR: return 'numero_utilisateur';
        case TABLES.ETUDIANT: return 'numero_carte_etudiant';
        case TABLES.ENSEIGNANT: return 'numero_enseignant';
        case TABLES.PERSONNEL_ADMINISTRATIF: return 'numero_personnel_administratif';
        case TABLES.ANNEE_ACADEMIQUE: return 'id_annee_academique';
        case TABLES.RAPPORT_MODELE: return 'id_modele';
        case TABLES.NOTIFICATION: return 'id_notification';
        case TABLES.PARAMETRES_SYSTEME: return 'cle';
        case TABLES.TRAITEMENT: return 'id_traitement';
        case TABLES.GROUPE_UTILISATEUR: return 'id_groupe_utilisateur';
        case TABLES.TYPE_UTILISATEUR: return 'id_type_utilisateur';
        case TABLES.NIVEAU_ACCES_DONNE: return 'id_niveau_acces_donne';
        case TABLES.CRITERE_CONFORMITE_REF: return 'id_critere';
        case TABLES.DECISION_PASSAGE_REF: return 'id_decision_passage';
        case TABLES.DECISION_VALIDATION_PV_REF: return 'id_decision_validation_pv';
        case TABLES.DECISION_VOTE_REF: return 'id_decision_vote';
        case TABLES.ECUE: return 'id_ecue';
        case TABLES.ENTREPRISE: return 'id_entreprise';
        case TABLES.FONCTION: return 'id_fonction';
        case TABLES.GRADE: return 'id_grade';
        case TABLES.MATRICE_NOTIFICATION_REGLES: return 'id_regle';
        case TABLES.NIVEAU_ETUDE: return 'id_niveau_etude';
        case TABLES.STATUT_CONFORMITE_REF: return 'id_statut_conformite';
        case TABLES.STATUT_JURY: return 'id_statut_jury';
        case TABLES.STATUT_PAIEMENT_REF: return 'id_statut_paiement';
        case TABLES.STATUT_PENALITE_REF: return 'id_statut_penalite';
        case TABLES.STATUT_PV_REF: return 'id_statut_pv';
        case TABLES.STATUT_RAPPORT_REF: return 'id_statut_rapport';
        case TABLES.STATUT_RECLAMATION_REF: return 'id_statut_reclamation';
        case TABLES.TYPE_DOCUMENT_REF: return 'id_type_document';
        case TABLES.UE: return 'id_ue';
        case TABLES.RAPPORT_ETUDIANT: return 'id_rapport_etudiant';
        case TABLES.COMPTE_RENDU: return 'id_compte_rendu';
        case TABLES.RECLAMATION: return 'id_reclamation';
        case TABLES.SESSION_VALIDATION: return 'id_session';
        case TABLES.VOTE_COMMISSION: return 'id_vote';
        case TABLES.CONFORMITE_RAPPORT_DETAILS: return 'id_conformite_detail';
        case TABLES.DOCUMENT_GENERE: return 'id_document_genere';
        case TABLES.DELEGATION: return 'id_delegation';
        case TABLES.MESSAGE_CHAT: return 'id_message_chat';
        case TABLES.CONVERSATION: return 'id_conversation';
        case TABLES.HISTORIQUE_MOT_DE_PASSE: return 'id_historique_mdp';
        case TABLES.PISTER: return 'id_piste';
        case TABLES.QUEUE_JOBS: return 'id';
        // Tables avec PK composites
        case TABLES.ACQUERIR: return ['id_grade', 'numero_enseignant'];
        case TABLES.AFFECTER: return ['numero_enseignant', 'id_rapport_etudiant', 'id_statut_jury'];
        case TABLES.ATTRIBUER: return ['numero_enseignant', 'id_specialite'];
        case TABLES.EVALUER: return ['numero_carte_etudiant', 'id_ecue', 'id_annee_academique'];
        case TABLES.FAIRE_STAGE: return ['id_entreprise', 'numero_carte_etudiant'];
        case TABLES.INSCRIRE: return ['numero_carte_etudiant', 'id_niveau_etude', 'id_annee_academique'];
        case TABLES.LECTURE_MESSAGE: return ['id_message_chat', 'numero_utilisateur'];
        case TABLES.OCCUPER: return ['id_fonction', 'numero_enseignant'];
        case TABLES.PARTICIPANT_CONVERSATION: return ['id_conversation', 'numero_utilisateur'];
        case TABLES.PV_SESSION_RAPPORT: return ['id_compte_rendu', 'id_rapport_etudiant'];
        case TABLES.RAPPORT_MODELE_ASSIGNATION: return ['id_modele', 'id_niveau_etude'];
        case TABLES.SECTION_RAPPORT: return ['id_rapport_etudiant', 'titre_section'];
        case TABLES.SESSIONS: return 'session_id'; // Supabase Auth gère cette table
        case TABLES.SESSION_RAPPORT: return ['id_session', 'id_rapport_etudiant'];
        case TABLES.VALIDATION_PV: return ['id_compte_rendu', 'numero_enseignant'];
        default:
            console.warn(`Primary key not defined for table: ${tableName}. Defaulting to 'id'.`);
            return 'id';
    }
}

// Charger la DB au démarrage du script
loadDB();


async function getAdminDashboardStats() {
    const { data: users } = await dataService.getRecords(TABLES.UTILISATEUR);
    const { data: reports } = await dataService.getRecords(TABLES.RAPPORT_ETUDIANT);
    const { data: reclamations } = await dataService.getRecords(TABLES.RECLAMATION);

    const stats = {
        users: {
            total: users.length,
            actif: users.filter(u => u.statut_compte === 'actif').length,
            bloque: users.filter(u => u.statut_compte === 'bloque').length,
        },
        reports: {
            soumis: reports.filter(r => r.id_statut_rapport === REPORT_STATUS.SOUMIS).length,
            en_commission: reports.filter(r => r.id_statut_rapport === REPORT_STATUS.EN_COMMISSION).length,
            valid: reports.filter(r => r.id_statut_rapport === REPORT_STATUS.VALID).length,
            non_conf: reports.filter(r => r.id_statut_rapport === REPORT_STATUS.NON_CONF).length,
            brouillon: reports.filter(r => r.id_statut_rapport === REPORT_STATUS.BROUILLON).length,
            en_correction: reports.filter(r => r.id_statut_rapport === REPORT_STATUS.CORRECT).length,
        },
        queue: { pending: 10, failed: 2 }, // Simulé
        reclamations: {
            ouverte: reclamations.filter(r => r.id_statut_reclamation === 'RECLA_OUVERTE').length,
            en_cours: reclamations.filter(r => r.id_statut_reclamation === 'RECLA_EN_COURS').length,
        },
        activity: { 'SUCCES_LOGIN': 150, 'SOUMISSION_RAPPORT': 20, 'APPROBATION_PV': 10 } // Simulé
    };
    return { success: true, stats };
}

async function getUsersWithProfiles(filters = {}) {
    let { data: users, error } = await dataService.getRecords(TABLES.UTILISATEUR, filters);
    if (error) return { users: [], error };

    for (let user of users) {
        let profileTable;
        switch (user.id_type_utilisateur) {
            case USER_TYPES.ETUD: profileTable = TABLES.ETUDIANT; break;
            case USER_TYPES.ENS: profileTable = TABLES.ENSEIGNANT; break;
            case USER_TYPES.PERS_ADMIN: profileTable = TABLES.PERSONNEL_ADMINISTRATIF; break;
            default: user.profile = {}; continue;
        }
        const { data: profile } = await dataService.getRecordById(profileTable, user.numero_utilisateur);
        user.profile = profile || {};

        if (user.id_type_utilisateur === USER_TYPES.ETUD) {
            const { data: inscriptions } = await dataService.getRecords(TABLES.INSCRIRE, { numero_carte_etudiant: user.numero_utilisateur }, 'date_inscription DESC', 1);
            user.profile.inscription = inscriptions[0] || null;
        }
    }
    return { users, error: null };
}

async function createUserAndProfile(formData) {
    const userType = formData.id_type_utilisateur;
    const prefix = Object.keys(ID_PREFIXES).find(key => ID_PREFIXES[key] === userType.replace('TYPE_', ''));
    const userId = generateUniqueId(prefix || 'UTILISATEUR');

    const userData = {
        numero_utilisateur: userId,
        login_utilisateur: formData.login_utilisateur,
        email_principal: formData.email_principal,
        mot_de_passe: `hashed_${formData.mot_de_passe}`,
        id_groupe_utilisateur: formData.id_groupe_utilisateur,
        id_type_utilisateur: userType,
        id_niveau_acces_donne: formData.id_niveau_acces_donne,
        statut_compte: formData.statut_compte,
        date_creation: new Date().toISOString(),
        email_valide: true,
    };

    let profileData = { nom: formData.nom, prenom: formData.prenom, numero_utilisateur: userId };
    let profileTable, profileIdField;

    if (userType === USER_TYPES.ETUD) { profileTable = TABLES.ETUDIANT; profileIdField = 'numero_carte_etudiant'; }
    else if (userType === USER_TYPES.ENS) { profileTable = TABLES.ENSEIGNANT; profileIdField = 'numero_enseignant'; }
    else if (userType === USER_TYPES.PERS_ADMIN) { profileTable = TABLES.PERSONNEL_ADMINISTRATIF; profileIdField = 'numero_personnel_administratif'; }

    profileData[profileIdField] = userId;

    const { error: userError } = await dataService.createRecord(TABLES.UTILISATEUR, userData);
    if (userError) return { success: false, message: userError.message };

    if (profileTable) {
        const { error: profileError } = await dataService.createRecord(profileTable, profileData);
        if (profileError) {
            await dataService.deleteRecord(TABLES.UTILISATEUR, userId);
            return { success: false, message: profileError.message };
        }
    }
    return { success: true, userId, message: 'User and profile created.' };
}

async function updateUserAndProfile(userId, formData) {
    const { data: user } = await dataService.getRecordById(TABLES.UTILISATEUR, userId);
    if (!user) return { success: false, message: 'User not found.' };

    const userData = {
        login_utilisateur: formData.login_utilisateur,
        email_principal: formData.email_principal,
        id_groupe_utilisateur: formData.id_groupe_utilisateur,
        id_type_utilisateur: formData.id_type_utilisateur,
        id_niveau_acces_donne: formData.id_niveau_acces_donne,
        statut_compte: formData.statut_compte,
    };
    if (formData.mot_de_passe) userData.mot_de_passe = `hashed_${formData.mot_de_passe}`;

    let profileData = { nom: formData.nom, prenom: formData.prenom };
    let profileTable;
    if (user.id_type_utilisateur === USER_TYPES.ETUD) profileTable = TABLES.ETUDIANT;
    else if (user.id_type_utilisateur === USER_TYPES.ENS) profileTable = TABLES.ENSEIGNANT;
    else if (user.id_type_utilisateur === USER_TYPES.PERS_ADMIN) profileTable = TABLES.PERSONNEL_ADMINISTRATIF;

    const { error: userError } = await dataService.updateRecord(TABLES.UTILISATEUR, userId, userData);
    if (userError) return { success: false, message: userError.message };

    if (profileTable) {
        const { error: profileError } = await dataService.updateRecord(profileTable, userId, profileData);
        if (profileError) return { success: false, message: profileError.message };
    }
    return { success: true, message: 'User and profile updated.' };
}

async function deleteUserAndProfile(userId) {
    const { data: user } = await dataService.getRecordById(TABLES.UTILISATEUR, userId);
    if (!user) return { success: true, message: 'User already deleted.' };

    let profileTable;
    if (user.id_type_utilisateur === USER_TYPES.ETUD) profileTable = TABLES.ETUDIANT;
    else if (user.id_type_utilisateur === USER_TYPES.ENS) profileTable = TABLES.ENSEIGNANT;
    else if (user.id_type_utilisateur === USER_TYPES.PERS_ADMIN) profileTable = TABLES.PERSONNEL_ADMINISTRATIF;

    if (profileTable) await dataService.deleteRecord(profileTable, userId);
    await dataService.deleteRecord(TABLES.UTILISATEUR, userId);

    return { success: true, message: 'User deleted.' };
}

async function createReportFromModel(studentId, modelId) {
    const { data: model } = await dataService.getRecordById(TABLES.RAPPORT_MODELE, modelId);
    const { data: modelSections } = await dataService.getRecords(TABLES.RAPPORT_MODELE_SECTION, { id_modele: modelId }, 'ordre ASC');
    const reportId = generateUniqueId('RAPPORT');
    await dataService.createRecord(TABLES.RAPPORT_ETUDIANT, {
        id_rapport_etudiant: reportId,
        libelle_rapport_etudiant: `Rapport basé sur ${model.nom_modele}`,
        theme: 'À définir',
        resume: '',
        numero_carte_etudiant: studentId,
        id_statut_rapport: REPORT_STATUS.BROUILLON,
        date_derniere_modif: new Date().toISOString(),
    });
    for (const modelSection of modelSections) {
        await dataService.createRecord(TABLES.SECTION_RAPPORT, {
            id_rapport_etudiant: reportId,
            titre_section: modelSection.titre_section,
            contenu_section: modelSection.contenu_par_defaut,
            ordre: modelSection.ordre,
        });
    }
    return { success: true, reportId };
}

async function createBlankReport(studentId) {
    const reportId = generateUniqueId('RAPPORT');
    await dataService.createRecord(TABLES.RAPPORT_ETUDIANT, {
        id_rapport_etudiant: reportId,
        libelle_rapport_etudiant: 'Nouveau rapport',
        theme: 'À définir',
        resume: '',
        numero_carte_etudiant: studentId,
        id_statut_rapport: REPORT_STATUS.BROUILLON,
        date_derniere_modif: new Date().toISOString(),
    });
    await dataService.createRecord(TABLES.SECTION_RAPPORT, {
        id_rapport_etudiant: reportId,
        titre_section: 'Introduction',
        contenu_section: '',
        ordre: 1,
    });
    return { success: true, reportId };
}

async function saveReportDraft(reportId, studentId, metadonnees, sections) {
    await dataService.updateRecord(TABLES.RAPPORT_ETUDIANT, reportId, metadonnees);
    for (const title in sections) {
        await dataService.updateRecords(TABLES.SECTION_RAPPORT, { contenu_section: sections[title] }, { id_rapport_etudiant: reportId, titre_section: title });
    }
    return { success: true, message: 'Draft saved.' };
}

async function submitReport(reportId, studentId, metadonnees, sections) {
    await saveReportDraft(reportId, studentId, metadonnees, sections);
    await dataService.updateRecord(TABLES.RAPPORT_ETUDIANT, reportId, {
        id_statut_rapport: REPORT_STATUS.SOUMIS,
        date_soumission: new Date().toISOString(),
    });
    return { success: true, message: 'Report submitted.' };
}

async function submitVote(reportId, sessionId, userId, decision, comment) {
    await dataService.createRecord(TABLES.VOTE_COMMISSION, {
        id_vote: generateUniqueId('VOTE'),
        id_session: sessionId,
        id_rapport_etudiant: reportId,
        numero_enseignant: userId,
        id_decision_vote: decision,
        commentaire_vote: comment,
        date_vote: new Date().toISOString(),
        tour_vote: 1,
    });
    return { success: true, message: 'Vote submitted.' };
}

async function approvePv(pvId, userId) {
    await dataService.updateRecord(TABLES.COMPTE_RENDU, pvId, { id_statut_pv: 'PV_VALIDE' });
    return { success: true, message: 'PV approved.' };
}

async function processConformityCheck(reportId, userId, isConforme) {
    const newStatus = isConforme ? REPORT_STATUS.CONF : REPORT_STATUS.NON_CONF;
    await dataService.updateRecord(TABLES.RAPPORT_ETUDIANT, reportId, { id_statut_rapport: newStatus });
    return { success: true, message: 'Conformity check processed.' };
}

async function activateStudentAccount(studentId, login, email, password) {
    await dataService.createRecord(TABLES.UTILISATEUR, {
        numero_utilisateur: studentId,
        login_utilisateur: login,
        email_principal: email,
        mot_de_passe: `hashed_${password}`,
        id_groupe_utilisateur: ROLES.ETUDIANT,
        id_type_utilisateur: USER_TYPES.ETUD,
        statut_compte: 'actif',
        date_creation: new Date().toISOString(),
        email_valide: true,
    });
    await dataService.updateRecord(TABLES.ETUDIANT, studentId, { numero_utilisateur: studentId });
    return { success: true, message: 'Account activated.' };
}

async function respondToReclamation(reclamationId, responseText, userId) {
    await dataService.updateRecord(TABLES.RECLAMATION, reclamationId, {
        reponse_reclamation: responseText,
        id_statut_reclamation: 'RECLA_EN_COURS',
        numero_personnel_traitant: userId,
        date_reponse: new Date().toISOString(),
    });
    return { success: true, message: 'Response sent.' };
}

async function closeReclamation(reclamationId, responseText, userId) {
    await dataService.updateRecord(TABLES.RECLAMATION, reclamationId, {
        reponse_reclamation: responseText,
        id_statut_reclamation: 'RECLA_CLOTUREE',
        numero_personnel_traitant: userId,
        date_reponse: new Date().toISOString(),
    });
    return { success: true, message: 'Reclamation closed.' };
}

async function validateStage(studentId, companyId, userId) {
    await dataService.updateRecords(TABLES.FAIRE_STAGE, { est_valide: true }, { numero_carte_etudiant: studentId, id_entreprise: companyId });
    return { success: true, message: 'Stage validated.' };
}

export const functionService = {
    getAdminDashboardStats,
    getUsersWithProfiles,
    createUserAndProfile,
    updateUserAndProfile,
    deleteUserAndProfile,
    createReportFromModel,
    createBlankReport,
    saveReportDraft,
    submitReport,
    submitVote,
    approvePv,
    processConformityCheck,
    activateStudentAccount,
    respondToReclamation,
    closeReclamation,
    validateStage,
};