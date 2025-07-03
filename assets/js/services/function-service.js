// /assets/js/services/function-service.js

import { supabase } from './supabase-client.js';
import { EDGE_FUNCTIONS } from '../utils/constants.js';

/**
 * Appelle la fonction Edge 'send-password-reset-email'.
 * @param {string} email - L'adresse e-mail du destinataire.
 * @returns {Promise<{success: boolean, message: string}>}
 */
async function sendPasswordResetEmail(email) {
    try {
        const { data, error } = await supabase.functions.invoke(EDGE_FUNCTIONS.SEND_PASSWORD_RESET_EMAIL, {
            body: { email },
        });

        if (error) {
            throw error;
        }
        return { success: true, message: data.message || 'If the email exists, a password reset link has been sent.' };
    } catch (error) {
        console.error("Erreur lors de l'appel de la fonction d'envoi de réinitialisation de mot de passe:", error);
        return { success: false, message: error.message || "Échec de l'envoi du lien de réinitialisation." };
    }
}

/**
 * Appelle la fonction Edge 'send-email-validation'.
 * @param {string} userId - L'ID de l'utilisateur.
 * @param {string} email - L'adresse e-mail du destinataire.
 * @returns {Promise<{success: boolean, message: string}>}
 */
async function sendEmailValidation(userId, email) {
    try {
        const { data, error } = await supabase.functions.invoke(EDGE_FUNCTIONS.SEND_EMAIL_VALIDATION, {
            body: { userId, email },
        });

        if (error) {
            throw error;
        }
        return { success: true, message: data.message || 'Validation email sent successfully.' };
    } catch (error) {
        console.error("Erreur lors de l'appel de la fonction d'envoi de validation d'e-mail:", error);
        return { success: false, message: error.message || "Échec de l'envoi de l'e-mail de validation." };
    }
}

/**
 * Appelle la fonction Edge 'validate-email-token'.
 * @param {string} token - Le token de validation d'email.
 * @returns {Promise<{success: boolean, message: string}>}
 */
async function validateEmailToken(token) {
    try {
        const { data, error } = await supabase.functions.invoke(EDGE_FUNCTIONS.VALIDATE_EMAIL_TOKEN, {
            body: { token },
        });

        if (error) {
            throw error;
        }
        return { success: data.success, message: data.message };
    } catch (error) {
        console.error("Erreur lors de l'appel de la fonction de validation d'e-mail:", error);
        return { success: false, message: error.message || "Échec de la validation de l'e-mail." };
    }
}

/**
 * Appelle la fonction Edge 'generate-2fa-secret'.
 * @param {string} userId - L'ID de l'utilisateur.
 * @param {string} email - L'email de l'utilisateur (pour le label du QR code).
 * @returns {Promise<{success: boolean, secret?: string, qrCodeUrl?: string, message: string}>}
 */
async function generate2FaSecret(userId, email) {
    try {
        const { data, error } = await supabase.functions.invoke(EDGE_FUNCTIONS.GENERATE_2FA_SECRET, {
            body: { userId, email },
        });

        if (error) {
            throw error;
        }
        return { success: true, secret: data.secret, qrCodeUrl: data.qrCodeUrl, message: '2FA secret generated.' };
    } catch (error) {
        console.error("Erreur lors de l'appel de la fonction de génération de secret 2FA:", error);
        return { success: false, message: error.message || "Échec de la génération du secret 2FA." };
    }
}

/**
 * Appelle la fonction Edge 'verify-2fa-code'.
 * @param {string} userId - L'ID de l'utilisateur.
 * @param {string} totpCode - Le code TOTP à vérifier.
 * @returns {Promise<{valid: boolean, message: string}>}
 */
async function verify2FaCode(userId, totpCode) {
    try {
        const { data, error } = await supabase.functions.invoke(EDGE_FUNCTIONS.VERIFY_2FA_CODE, {
            body: { userId, totpCode },
        });

        if (error) {
            throw error;
        }
        return { valid: data.valid, message: data.message };
    } catch (error) {
        console.error("Erreur lors de l'appel de la fonction de vérification 2FA:", error);
        return { valid: false, message: error.message || "Échec de la vérification 2FA." };
    }
}

/**
 * Appelle la fonction Edge 'impersonate-user'.
 * @param {string} targetUserId - L'ID de l'utilisateur à impersonnaliser.
 * @returns {Promise<{success: boolean, impersonationLink?: string, message: string}>}
 */
async function impersonateUser(targetUserId) {
    try {
        // Le token de l'admin est automatiquement envoyé par le SDK Supabase si l'utilisateur est connecté.
        const { data, error } = await supabase.functions.invoke(EDGE_FUNCTIONS.IMPERSONATE_USER, {
            body: { targetUserId },
        });

        if (error) {
            throw error;
        }
        return { success: true, impersonationLink: data.impersonationLink, message: data.message || 'Impersonation successful.' };
    } catch (error) {
        console.error("Erreur lors de l'appel de la fonction d'impersonation:", error);
        return { success: false, message: error.message || "Échec de l'impersonation." };
    }
}

// --- NOUVELLES FONCTIONS EDGE À AJOUTER ICI ---

/**
 * Appelle la fonction Edge 'create-entity'.
 * @param {string} entityType - Le type d'entité (e.g., 'etudiant', 'enseignant').
 * @param {object} entityData - Les données de l'entité.
 * @returns {Promise<{success: boolean, entityId?: string, message: string}>}
 */
async function createEntity(entityType, entityData) {
    try {
        const { data, error } = await supabase.functions.invoke(EDGE_FUNCTIONS.CREATE_ENTITY, {
            body: { entityType, entityData },
        });
        if (error) throw error;
        return { success: true, entityId: data.entityId, message: data.message };
    } catch (error) {
        console.error(`Erreur lors de la création de l'entité ${entityType}:`, error);
        return { success: false, message: error.message || `Échec de la création de l'entité ${entityType}.` };
    }
}

/**
 * Appelle la fonction Edge 'activate-student-account'.
 * @param {string} studentId - L'ID de l'entité étudiant.
 * @param {string} login - Le login souhaité.
 * @param {string} email - L'email principal.
 * @param {string} password - Le mot de passe temporaire.
 * @returns {Promise<{success: boolean, message: string}>}
 */
async function activateStudentAccount(studentId, login, email, password) {
    try {
        const { data, error } = await supabase.functions.invoke(EDGE_FUNCTIONS.ACTIVATE_STUDENT_ACCOUNT, {
            body: { studentId, login, email, password },
        });
        if (error) throw error;
        return { success: true, message: data.message };
    } catch (error) {
        console.error(`Erreur lors de l'activation du compte étudiant ${studentId}:`, error);
        return { success: false, message: error.message || `Échec de l'activation du compte étudiant ${studentId}.` };
    }
}

/**
 * Appelle la fonction Edge 'update-user-profile'.
 * @param {string} userId - L'ID de l'utilisateur.
 * @param {string} userType - Le type d'utilisateur (e.g., 'TYPE_ETUD').
 * @param {object} profileData - Les données du profil à mettre à jour.
 * @returns {Promise<{success: boolean, message: string}>}
 */
async function updateUserProfile(userId, userType, profileData) {
    try {
        const { data, error } = await supabase.functions.invoke(EDGE_FUNCTIONS.UPDATE_USER_PROFILE, {
            body: { userId, userType, profileData },
        });
        if (error) throw error;
        return { success: true, message: data.message };
    } catch (error) {
        console.error(`Erreur lors de la mise à jour du profil utilisateur ${userId}:`, error);
        return { success: false, message: error.message || `Échec de la mise à jour du profil utilisateur ${userId}.` };
    }
}

/**
 * Appelle la fonction Edge 'create-report-from-model'.
 * @param {string} studentId - L'ID de l'étudiant.
 * @param {string} modelId - L'ID du modèle de rapport.
 * @returns {Promise<{success: boolean, reportId?: string, message: string}>}
 */
async function createReportFromModel(studentId, modelId) {
    try {
        const { data, error } = await supabase.functions.invoke(EDGE_FUNCTIONS.CREATE_REPORT_FROM_MODEL, {
            body: { studentId, modelId },
        });
        if (error) throw error;
        return { success: true, reportId: data.reportId, message: data.message };
    } catch (error) {
        console.error(`Erreur lors de la création du rapport depuis le modèle:`, error);
        return { success: false, message: error.message || `Échec de la création du rapport.` };
    }
}

/**
 * Appelle la fonction Edge 'create-blank-report'.
 * @param {string} studentId - L'ID de l'étudiant.
 * @returns {Promise<{success: boolean, reportId?: string, message: string}>}
 */
async function createBlankReport(studentId) {
    try {
        const { data, error } = await supabase.functions.invoke(EDGE_FUNCTIONS.CREATE_BLANK_REPORT, {
            body: { studentId },
        });
        if (error) throw error;
        return { success: true, reportId: data.reportId, message: data.message };
    } catch (error) {
        console.error(`Erreur lors de la création du rapport vierge:`, error);
        return { success: false, message: error.message || `Échec de la création du rapport vierge.` };
    }
}

/**
 * Appelle la fonction Edge 'save-report-draft'.
 * @param {string} reportId - L'ID du rapport.
 * @param {string} studentId - L'ID de l'étudiant.
 * @param {object} metadonnees - Les métadonnées du rapport.
 * @param {object} sections - Les sections du rapport.
 * @returns {Promise<{success: boolean, message: string}>}
 */
async function saveReportDraft(reportId, studentId, metadonnees, sections) {
    try {
        const { data, error } = await supabase.functions.invoke(EDGE_FUNCTIONS.SAVE_REPORT_DRAFT, {
            body: { reportId, studentId, metadonnees, sections },
        });
        if (error) throw error;
        return { success: true, message: data.message };
    } catch (error) {
        console.error(`Erreur lors de la sauvegarde du brouillon du rapport ${reportId}:`, error);
        return { success: false, message: error.message || `Échec de la sauvegarde du brouillon.` };
    }
}

/**
 * Appelle la fonction Edge 'submit-report'.
 * @param {string} reportId - L'ID du rapport.
 * @param {string} studentId - L'ID de l'étudiant.
 * @param {object} metadonnees - Les métadonnées du rapport.
 * @param {object} sections - Les sections du rapport.
 * @returns {Promise<{success: boolean, message: string}>}
 */
async function submitReport(reportId, studentId, metadonnees, sections) {
    try {
        const { data, error } = await supabase.functions.invoke(EDGE_FUNCTIONS.SUBMIT_REPORT, {
            body: { reportId, studentId, metadonnees, sections },
        });
        if (error) throw error;
        return { success: true, message: data.message };
    } catch (error) {
        console.error(`Erreur lors de la soumission du rapport ${reportId}:`, error);
        return { success: false, message: error.message || `Échec de la soumission du rapport.` };
    }
}

/**
 * Appelle la fonction Edge 'submit-report-corrections'.
 * @param {string} reportId - L'ID du rapport.
 * @param {string} studentId - L'ID de l'étudiant.
 * @param {object} metadonnees - Les métadonnées du rapport.
 * @param {object} sections - Les sections du rapport.
 * @param {string} noteExplicative - Note explicative des corrections.
 * @returns {Promise<{success: boolean, message: string}>}
 */
async function submitReportCorrections(reportId, studentId, metadonnees, sections, noteExplicative) {
    try {
        const { data, error } = await supabase.functions.invoke(EDGE_FUNCTIONS.SUBMIT_REPORT_CORRECTIONS, {
            body: { reportId, studentId, metadonnees, sections, noteExplicative },
        });
        if (error) throw error;
        return { success: true, message: data.message };
    } catch (error) {
        console.error(`Erreur lors de la soumission des corrections du rapport ${reportId}:`, error);
        return { success: false, message: error.message || `Échec de la soumission des corrections.` };
    }
}

/**
 * Appelle la fonction Edge 'submit-vote'.
 * @param {string} reportId - L'ID du rapport.
 * @param {string} sessionId - L'ID de la session.
 * @param {string} userId - L'ID de l'utilisateur votant.
 * @param {string} decision - La décision de vote.
 * @param {string} comment - Le commentaire de vote.
 * @returns {Promise<{success: boolean, message: string}>}
 */
async function submitVote(reportId, sessionId, userId, decision, comment) {
    try {
        const { data, error } = await supabase.functions.invoke(EDGE_FUNCTIONS.SUBMIT_VOTE, {
            body: { reportId, sessionId, userId, decision, comment },
        });
        if (error) throw error;
        return { success: true, message: data.message };
    } catch (error) {
        console.error(`Erreur lors de la soumission du vote pour le rapport ${reportId}:`, error);
        return { success: false, message: error.message || `Échec de la soumission du vote.` };
    }
}

/**
 * Appelle la fonction Edge 'initiate-pv'.
 * @param {string} sessionId - L'ID de la session.
 * @param {string} userId - L'ID de l'utilisateur initiant le PV.
 * @returns {Promise<{success: boolean, pvId?: string, message: string}>}
 */
async function initiatePv(sessionId, userId) {
    try {
        const { data, error } = await supabase.functions.invoke(EDGE_FUNCTIONS.INITIATE_PV, {
            body: { sessionId, userId },
        });
        if (error) throw error;
        return { success: true, pvId: data.pvId, message: data.message };
    } catch (error) {
        console.error(`Erreur lors de l'initialisation du PV pour la session ${sessionId}:`, error);
        return { success: false, message: error.message || `Échec de l'initialisation du PV.` };
    }
}

/**
 * Appelle la fonction Edge 'submit-pv-for-approval'.
 * @param {string} pvId - L'ID du PV.
 * @param {string} userId - L'ID de l'utilisateur soumettant pour approbation.
 * @returns {Promise<{success: boolean, message: string}>}
 */
async function submitPvForApproval(pvId, userId) {
    try {
        const { data, error } = await supabase.functions.invoke(EDGE_FUNCTIONS.SUBMIT_PV_FOR_APPROVAL, {
            body: { pvId, userId },
        });
        if (error) throw error;
        return { success: true, message: data.message };
    } catch (error) {
        console.error(`Erreur lors de la soumission du PV ${pvId} pour approbation:`, error);
        return { success: false, message: error.message || `Échec de la soumission du PV pour approbation.` };
    }
}

/**
 * Appelle la fonction Edge 'approve-pv'.
 * @param {string} pvId - L'ID du PV.
 * @param {string} userId - L'ID de l'utilisateur approuvant.
 * @returns {Promise<{success: boolean, message: string}>}
 */
async function approvePv(pvId, userId) {
    try {
        const { data, error } = await supabase.functions.invoke(EDGE_FUNCTIONS.APPROVE_PV, {
            body: { pvId, userId },
        });
        if (error) throw error;
        return { success: true, message: data.message };
    } catch (error) {
        console.error(`Erreur lors de l'approbation du PV ${pvId}:`, error);
        return { success: false, message: error.message || `Échec de l'approbation du PV.` };
    }
}

/**
 * Appelle la fonction Edge 'process-conformity-check'.
 * @param {string} reportId - L'ID du rapport.
 * @param {string} userId - L'ID de l'utilisateur effectuant la vérification.
 * @param {boolean} isConforme - True si conforme, false sinon.
 * @param {Array<object>} checklistData - Les détails de la checklist.
 * @param {string} generalComment - Le commentaire général.
 * @returns {Promise<{success: boolean, message: string}>}
 */
async function processConformityCheck(reportId, userId, isConforme, checklistData, generalComment) {
    try {
        const { data, error } = await supabase.functions.invoke(EDGE_FUNCTIONS.PROCESS_CONFORMITY_CHECK, {
            body: { reportId, userId, isConforme, checklistData, generalComment },
        });
        if (error) throw error;
        return { success: true, message: data.message };
    } catch (error) {
        console.error(`Erreur lors du traitement de la conformité du rapport ${reportId}:`, error);
        return { success: false, message: error.message || `Échec du traitement de la conformité.` };
    }
}

/**
 * Appelle la fonction Edge 'respond-to-reclamation'.
 * @param {string} reclamationId - L'ID de la réclamation.
 * @param {string} responseText - Le texte de la réponse.
 * @param {string} userId - L'ID de l'utilisateur répondant.
 * @returns {Promise<{success: boolean, message: string}>}
 */
async function respondToReclamation(reclamationId, responseText, userId) {
    try {
        const { data, error } = await supabase.functions.invoke(EDGE_FUNCTIONS.RESPOND_TO_RECLAMATION, {
            body: { reclamationId, responseText, userId },
        });
        if (error) throw error;
        return { success: true, message: data.message };
    } catch (error) {
        console.error(`Erreur lors de la réponse à la réclamation ${reclamationId}:`, error);
        return { success: false, message: error.message || `Échec de la réponse à la réclamation.` };
    }
}

/**
 * Appelle la fonction Edge 'close-reclamation'.
 * @param {string} reclamationId - L'ID de la réclamation.
 * @param {string} responseText - Le texte de la réponse finale.
 * @param {string} userId - L'ID de l'utilisateur clôturant.
 * @returns {Promise<{success: boolean, message: string}>}
 */
async function closeReclamation(reclamationId, responseText, userId) {
    try {
        const { data, error } = await supabase.functions.invoke(EDGE_FUNCTIONS.CLOSE_RECLAMATION, {
            body: { reclamationId, responseText, userId },
        });
        if (error) throw error;
        return { success: true, message: data.message };
    } catch (error) {
        console.error(`Erreur lors de la clôture de la réclamation ${reclamationId}:`, error);
        return { success: false, message: error.message || `Échec de la clôture de la réclamation.` };
    }
}

/**
 * Appelle la fonction Edge 'validate-stage'.
 * @param {string} studentId - L'ID de l'étudiant.
 * @param {string} companyId - L'ID de l'entreprise du stage.
 * @param {string} userId - L'ID de l'utilisateur validant.
 * @returns {Promise<{success: boolean, message: string}>}
 */
async function validateStage(studentId, companyId, userId) {
    try {
        const { data, error } = await supabase.functions.invoke(EDGE_FUNCTIONS.VALIDATE_STAGE, {
            body: { studentId, companyId, userId },
        });
        if (error) throw error;
        return { success: true, message: data.message };
    } catch (error) {
        console.error(`Erreur lors de la validation du stage de l'étudiant ${studentId}:`, error);
        return { success: false, message: error.message || `Échec de la validation du stage.` };
    }
}

/**
 * Appelle la fonction Edge 'generate-pdf-document'.
 * @param {string} documentType - Le type de document à générer (e.g., 'attestation_scolarite', 'bulletin_notes').
 * @param {object} documentData - Les données spécifiques au document.
 * @returns {Promise<{success: boolean, url?: string, message: string}>}
 */
async function generatePdf(documentType, documentData) {
    try {
        const { data, error } = await supabase.functions.invoke(EDGE_FUNCTIONS.GENERATE_PDF_DOCUMENT, {
            body: { documentType, documentData },
        });
        if (error) throw error;
        return { success: true, url: data.downloadUrl, message: data.message };
    } catch (error) {
        console.error(`Erreur lors de la génération du PDF ${documentType}:`, error);
        return { success: false, message: error.message || `Échec de la génération du PDF.` };
    }
}

/**
 * Appelle la fonction Edge 'import-word-document'.
 * @param {File} file - Le fichier Word à importer.
 * @returns {Promise<{success: boolean, message: string}>}
 */
async function importWordDocument(file) {
    try {
        // Pour envoyer un fichier à une fonction Edge, il faut utiliser FormData
        const formData = new FormData();
        formData.append('file', file);

        const { data, error } = await supabase.functions.invoke(EDGE_FUNCTIONS.IMPORT_WORD_DOCUMENT, {
            body: formData,
            headers: { 'Content-Type': 'multipart/form-data' }, // Important pour les fichiers
        });
        if (error) throw error;
        return { success: true, message: data.message };
    } catch (error) {
        console.error(`Erreur lors de l'importation du document Word:`, error);
        return { success: false, message: error.message || `Échec de l'importation du document Word.` };
    }
}

/**
 * Appelle la fonction Edge 'update-menu-structure'.
 * @param {Array<object>} menuStructure - La structure du menu à sauvegarder.
 * @returns {Promise<{success: boolean, message: string}>}
 */
async function updateMenuStructure(menuStructure) {
    try {
        const { data, error } = await supabase.functions.invoke(EDGE_FUNCTIONS.UPDATE_MENU_STRUCTURE, {
            body: { menuStructure },
        });
        if (error) throw error;
        return { success: true, message: data.message };
    } catch (error) {
        console.error(`Erreur lors de la mise à jour de la structure du menu:`, error);
        return { success: false, message: error.message || `Échec de la mise à jour de la structure du menu.` };
    }
}

/**
 * Appelle la fonction Edge 'get-admin-dashboard-stats'.
 * @returns {Promise<{success: boolean, stats?: object, message: string}>}
 */
async function getAdminDashboardStats() {
    try {
        const { data, error } = await supabase.functions.invoke(EDGE_FUNCTIONS.GET_ADMIN_DASHBOARD_STATS);
        if (error) throw error;
        return { success: true, stats: data.stats, message: data.message };
    } catch (error) {
        console.error(`Erreur lors de la récupération des statistiques du dashboard admin:`, error);
        return { success: false, message: error.message || `Échec de la récupération des statistiques.` };
    }
}

/**
 * Appelle la fonction Edge 'get-users-with-profiles'.
 * @param {object} filters - Les filtres à appliquer.
 * @returns {Promise<{success: boolean, users?: Array<object>, message: string}>}
 */
async function getUsersWithProfiles(filters) {
    try {
        const { data, error } = await supabase.functions.invoke(EDGE_FUNCTIONS.GET_USERS_WITH_PROFILES, {
            body: { filters },
        });
        if (error) throw error;
        return { success: true, users: data.users, message: data.message };
    } catch (error) {
        console.error(`Erreur lors de la récupération des utilisateurs avec profils:`, error);
        return { success: false, message: error.message || `Échec de la récupération des utilisateurs.` };
    }
}

/**
 * Appelle la fonction Edge 'create-user-and-profile'.
 * @param {object} userData - Les données de l'utilisateur.
 * @param {object} profileData - Les données du profil métier.
 * @returns {Promise<{success: boolean, userId?: string, message: string}>}
 */
async function createUserAndProfile(userData, profileData) {
    try {
        const { data, error } = await supabase.functions.invoke(EDGE_FUNCTIONS.CREATE_USER_AND_PROFILE, {
            body: { userData, profileData },
        });
        if (error) throw error;
        return { success: true, userId: data.userId, message: data.message };
    } catch (error) {
        console.error(`Erreur lors de la création de l'utilisateur et du profil:`, error);
        return { success: false, message: error.message || `Échec de la création de l'utilisateur.` };
    }
}

/**
 * Appelle la fonction Edge 'update-user-and-profile'.
 * @param {string} userId - L'ID de l'utilisateur.
 * @param {object} userData - Les données de l'utilisateur.
 * @param {object} profileData - Les données du profil métier.
 * @returns {Promise<{success: boolean, message: string}>}
 */
async function updateUserAndProfile(userId, userData, profileData) {
    try {
        const { data, error } = await supabase.functions.invoke(EDGE_FUNCTIONS.UPDATE_USER_AND_PROFILE, {
            body: { userId, userData, profileData },
        });
        if (error) throw error;
        return { success: true, message: data.message };
    } catch (error) {
        console.error(`Erreur lors de la mise à jour de l'utilisateur et du profil:`, error);
        return { success: false, message: error.message || `Échec de la mise à jour de l'utilisateur.` };
    }
}

/**
 * Appelle la fonction Edge 'delete-user-and-profile'.
 * @param {string} userId - L'ID de l'utilisateur à supprimer.
 * @returns {Promise<{success: boolean, message: string}>}
 */
async function deleteUserAndProfile(userId) {
    try {
        const { data, error } = await supabase.functions.invoke(EDGE_FUNCTIONS.DELETE_USER_AND_PROFILE, {
            body: { userId },
        });
        if (error) throw error;
        return { success: true, message: data.message };
    } catch (error) {
        console.error(`Erreur lors de la suppression de l'utilisateur ${userId}:`, error);
        return { success: false, message: error.message || `Échec de la suppression de l'utilisateur.` };
    }
}

/**
 * Appelle la fonction Edge 'change-user-status'.
 * @param {string} userId - L'ID de l'utilisateur.
 * @param {string} newStatus - Le nouveau statut.
 * @returns {Promise<{success: boolean, message: string}>}
 */
async function changeUserStatus(userId, newStatus) {
    try {
        const { data, error } = await supabase.functions.invoke(EDGE_FUNCTIONS.CHANGE_USER_STATUS, {
            body: { userId, newStatus },
        });
        if (error) throw error;
        return { success: true, message: data.message };
    } catch (error) {
        console.error(`Erreur lors du changement de statut de l'utilisateur ${userId}:`, error);
        return { success: false, message: error.message || `Échec du changement de statut.` };
    }
}

/**
 * Appelle la fonction Edge 'reset-user-password-admin'.
 * @param {string} userId - L'ID de l'utilisateur.
 * @returns {Promise<{success: boolean, message: string}>}
 */
async function resetUserPasswordAdmin(userId) {
    try {
        const { data, error } = await supabase.functions.invoke(EDGE_FUNCTIONS.RESET_USER_PASSWORD_ADMIN, {
            body: { userId },
        });
        if (error) throw error;
        return { success: true, message: data.message };
    } catch (error) {
        console.error(`Erreur lors de la réinitialisation du mot de passe admin pour ${userId}:`, error);
        return { success: false, message: error.message || `Échec de la réinitialisation du mot de passe.` };
    }
}

export const functionService = {
    sendPasswordResetEmail,
    sendEmailValidation,
    validateEmailToken,
    generate2FaSecret,
    verify2FaCode,
    impersonateUser,
    createEntity,
    activateStudentAccount,
    updateUserProfile,
    createReportFromModel,
    createBlankReport,
    saveReportDraft,
    submitReport,
    submitReportCorrections,
    submitVote,
    initiatePv,
    submitPvForApproval,
    approvePv,
    processConformityCheck,
    respondToReclamation,
    closeReclamation,
    validateStage,
    generatePdf,
    importWordDocument,
    updateMenuStructure,
    getAdminDashboardStats,
    getUsersWithProfiles,
    createUserAndProfile,
    updateUserAndProfile,
    deleteUserAndProfile,
    changeUserStatus,
    resetUserPasswordAdmin,
};