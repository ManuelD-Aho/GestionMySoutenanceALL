<!-- /pages/personnel/gestion-dossiers.html -->
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gestion Dossiers Étudiants - GestionMySoutenance</title>
    <link href="/assets/css/main.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==" crossorigin="anonymous" referrerpolicy="no-referrer" />
    <script src="/assets/js/main.js" type="module" defer></script>
    <script src="/assets/js/pages/personnel.js" type="module" defer></script>
    <!-- TinyMCE pour l'éditeur WYSIWYG (si utilisé pour commentaires de conformité ou réponses réclamations) -->
    <script src="https://cdn.tiny.cloud/1/no-api-key/tinymce/6/tinymce.min.js" referrerpolicy="origin"></script>
</head>
<body>
<div class="app-wrapper">
    <!-- SIDEBAR (from layout_base.html) -->
    <aside class="sidebar">
        <div class="sidebar-header">
            <div class="logo">GestionMySoutenance</div>
            <input type="text" class="sidebar-search" placeholder="Rechercher...">
        </div>
        <nav class="sidebar-nav">
            <ul id="sidebar-menu" class="nav-list"></ul>
        </nav>
        <div class="user-section">
            <div class="user-info">
                <img id="user-avatar-display" src="/assets/images/default-avatar.png" alt="Avatar" class="user-avatar">
                <div class="user-details">
                    <div id="user-login-display" class="username">Chargement...</div>
                    <div id="user-role-display" class="user-role">Rôle</div>
                </div>
                <button id="logout-btn" class="user-menu-btn"><i class="fas fa-sign-out-alt"></i></button>
            </div>
        </div>
    </aside>

    <!-- MAIN CONTENT AREA -->
    <main id="main-content-area" class="main-content-area">
        <div id="global-flash-messages" class="flash-message-container"></div>
        <h1 class="page-title">Gestion des Dossiers Étudiants</h1>

        <div class="tabs-container">
            <div role="tablist" class="tabs">
                <a role="tab" class="tab tab-active" data-tab="students-list">Liste des Étudiants</a>
                <a role="tab" class="tab" data-tab="conformity">Vérification Conformité</a>
                <a role="tab" class="tab" data-tab="access">Gestion des Accès</a>
                <a role="tab" class="tab" data-tab="inscriptions">Inscriptions</a>
                <a role="tab" class="tab" data-tab="notes">Notes</a>
                <a role="tab" class="tab" data-tab="stages">Stages</a>
                <a role="tab" class="tab" data-tab="penalties">Pénalités</a>
                <a role="tab" class="tab" data-tab="reclamations">Réclamations</a>
                <a role="tab" class="tab" data-tab="documents">Documents Générés</a>
            </div>

            <div id="tab-content-students-list" class="tab-content active">
                <h2 class="section-title">Tous les Étudiants</h2>
                <div class="controls-bar">
                    <input type="text" id="search-students" placeholder="Rechercher étudiant..." class="input-text">
                    <select id="filter-student-level" class="select-box">
                        <option value="">Niveau d'étude</option>
                        <!-- Options loaded by JS -->
                    </select>
                    <select id="filter-student-payment" class="select-box">
                        <option value="">Statut paiement</option>
                        <!-- Options loaded by JS -->
                    </select>
                    <button id="export-students-pdf-btn" class="btn btn-secondary"><i class="fas fa-file-pdf"></i> Export PDF</button>
                    <button id="export-students-csv-btn" class="btn btn-secondary"><i class="fas fa-file-csv"></i> Export CSV</button>
                </div>
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                        <tr>
                            <th>Matricule</th>
                            <th>Nom Complet</th>
                            <th>Email</th>
                            <th>Niveau</th>
                            <th>Statut Paiement</th>
                            <th>Statut Compte</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody id="students-list-body">
                        <!-- Students will be loaded here by JS -->
                        </tbody>
                    </table>
                </div>
            </div>

            <div id="tab-content-conformity" class="tab-content">
                <h2 class="section-title">Vérification de Conformité des Rapports</h2>
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                        <tr>
                            <th>Rapport ID</th>
                            <th>Étudiant</th>
                            <th>Date Soumission</th>
                            <th>Statut</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody id="conformity-queue-body">
                        <!-- Conformity reports will be loaded here -->
                        </tbody>
                    </table>
                </div>
            </div>

            <div id="tab-content-access" class="tab-content">
                <h2 class="section-title">Gestion des Accès Étudiants</h2>
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                        <tr>
                            <th>Matricule</th>
                            <th>Nom Complet</th>
                            <th>Statut Scolarité</th>
                            <th>Stage Validé</th>
                            <th>Pénalités Réglées</th>
                            <th>Compte Actif</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody id="access-management-body">
                        <!-- Students for access management will be loaded here -->
                        </tbody>
                    </table>
                </div>
            </div>

            <div id="tab-content-inscriptions" class="tab-content">
                <h2 class="section-title">Inscriptions des Étudiants</h2>
                <div id="inscriptions-content">
                    <p class="text-center text-secondary">Sélectionnez un étudiant pour voir ses inscriptions.</p>
                </div>
            </div>

            <div id="tab-content-notes" class="tab-content">
                <h2 class="section-title">Notes des Étudiants</h2>
                <div id="notes-content">
                    <p class="text-center text-secondary">Sélectionnez un étudiant pour voir et gérer ses notes.</p>
                </div>
            </div>

            <div id="tab-content-stages" class="tab-content">
                <h2 class="section-title">Stages des Étudiants</h2>
                <div id="stages-content">
                    <p class="text-center text-secondary">Sélectionnez un étudiant pour voir et gérer ses stages.</p>
                </div>
            </div>

            <div id="tab-content-penalties" class="tab-content">
                <h2 class="section-title">Pénalités des Étudiants</h2>
                <div id="penalties-content">
                    <p class="text-center text-secondary">Sélectionnez un étudiant pour voir et gérer ses pénalités.</p>
                </div>
            </div>

            <div id="tab-content-reclamations" class="tab-content">
                <h2 class="section-title">Réclamations Étudiantes</h2>
                <div id="reclamations-content">
                    <p class="text-center text-secondary">Sélectionnez un étudiant pour voir et gérer ses réclamations.</p>
                </div>
            </div>

            <div id="tab-content-documents" class="tab-content">
                <h2 class="section-title">Documents Générés</h2>
                <div id="documents-content">
                    <p class="text-center text-secondary">Sélectionnez un étudiant pour voir ses documents.</p>
                </div>
            </div>
        </div>

        <!-- Modale de Détails Étudiant (pour les onglets Inscriptions, Notes, Stages, etc.) -->
        <dialog id="student-details-modal" class="modal">
            <div class="modal-box large-modal-box">
                <h3 class="modal-title" id="student-details-modal-title">Dossier de l'Étudiant: <span id="student-details-name"></span></h3>
                <div class="modal-body">
                    <div role="tablist" class="tabs student-details-tabs">
                        <a role="tab" class="tab tab-active" data-detail-tab="profile-info">Profil</a>
                        <a role="tab" class="tab" data-detail-tab="inscriptions-detail">Inscriptions</a>
                        <a role="tab" class="tab" data-detail-tab="notes-detail">Notes</a>
                        <a role="tab" class="tab" data-detail-tab="stages-detail">Stages</a>
                        <a role="tab" class="tab" data-detail-tab="penalties-detail">Pénalités</a>
                        <a role="tab" class="tab" data-detail-tab="reclamations-detail">Réclamations</a>
                        <a role="tab" class="tab" data-detail-tab="reports-detail">Rapports</a>
                    </div>

                    <div id="student-detail-content-profile-info" class="detail-tab-content active">
                        <h4 class="subsection-title">Informations Générales</h4>
                        <p><strong>Matricule:</strong> <span id="detail-matricule"></span></p>
                        <p><strong>Email Principal:</strong> <span id="detail-email"></span></p>
                        <p><strong>Date de Naissance:</strong> <span id="detail-dob"></span></p>
                        <!-- ... autres infos de profil ... -->
                    </div>

                    <div id="student-detail-content-inscriptions-detail" class="detail-tab-content">
                        <h4 class="subsection-title">Inscriptions</h4>
                        <div class="table-container">
                            <table class="data-table">
                                <thead><tr><th>Année</th><th>Niveau</th><th>Montant</th><th>Statut Paiement</th><th>Actions</th></tr></thead>
                                <tbody id="detail-inscriptions-list"></tbody>
                            </table>
                        </div>
                        <button class="btn btn-primary btn-sm mt-4" id="add-inscription-btn"><i class="fas fa-plus"></i> Ajouter Inscription</button>
                    </div>

                    <div id="student-detail-content-notes-detail" class="detail-tab-content">
                        <h4 class="subsection-title">Notes</h4>
                        <div class="table-container">
                            <table class="data-table">
                                <thead><tr><th>UE</th><th>ECUE</th><th>Note</th><th>Année</th><th>Actions</th></tr></thead>
                                <tbody id="detail-notes-list"></tbody>
                            </table>
                        </div>
                        <button class="btn btn-primary btn-sm mt-4" id="add-note-btn"><i class="fas fa-plus"></i> Ajouter Note</button>
                    </div>

                    <div id="student-detail-content-stages-detail" class="detail-tab-content">
                        <h4 class="subsection-title">Stages</h4>
                        <div class="table-container">
                            <table class="data-table">
                                <thead><tr><th>Entreprise</th><th>Sujet</th><th>Début</th><th>Fin</th><th>Validé</th><th>Actions</th></tr></thead>
                                <tbody id="detail-stages-list"></tbody>
                            </table>
                        </div>
                        <button class="btn btn-primary btn-sm mt-4" id="add-stage-btn"><i class="fas fa-plus"></i> Ajouter Stage</button>
                    </div>

                    <div id="student-detail-content-penalties-detail" class="detail-tab-content">
                        <h4 class="subsection-title">Pénalités</h4>
                        <div class="table-container">
                            <table class="data-table">
                                <thead><tr><th>Type</th><th>Montant</th><th>Motif</th><th>Statut</th><th>Actions</th></tr></thead>
                                <tbody id="detail-penalties-list"></tbody>
                            </table>
                        </div>
                        <button class="btn btn-primary btn-sm mt-4" id="add-penalty-btn"><i class="fas fa-plus"></i> Ajouter Pénalité</button>
                    </div>

                    <div id="student-detail-content-reclamations-detail" class="detail-tab-content">
                        <h4 class="subsection-title">Réclamations</h4>
                        <div class="table-container">
                            <table class="data-table">
                                <thead><tr><th>Sujet</th><th>Statut</th><th>Date Soumission</th><th>Actions</th></tr></thead>
                                <tbody id="detail-reclamations-list"></tbody>
                            </table>
                        </div>
                        <button class="btn btn-primary btn-sm mt-4" id="add-reclamation-btn"><i class="fas fa-plus"></i> Ajouter Réclamation</button>
                    </div>

                    <div id="student-detail-content-reports-detail" class="detail-tab-content">
                        <h4 class="subsection-title">Rapports de Soutenance</h4>
                        <div class="table-container">
                            <table class="data-table">
                                <thead><tr><th>Titre</th><th>Statut</th><th>Date Soumission</th><th>Actions</th></tr></thead>
                                <tbody id="detail-reports-list"></tbody>
                            </table>
                        </div>
                    </div>

                    <div class="modal-action">
                        <button class="btn" onclick="closeModal(document.getElementById('student-details-modal'))">Fermer</button>
                    </div>
                </div>
            </div>
        </dialog>

        <!-- Modale de Vérification Conformité (pour Agent de Conformité) -->
        <dialog id="conformity-check-modal" class="modal">
            <div class="modal-box large-modal-box">
                <h3 class="modal-title" id="conformity-modal-title">Vérification de Conformité: <span id="conformity-report-title"></span></h3>
                <div class="modal-body">
                    <p><strong>Étudiant:</strong> <span id="conformity-student-name"></span></p>
                    <p><strong>Statut actuel:</strong> <span id="conformity-current-status"></span></p>
                    <h4 class="subsection-title mt-4">Contenu du Rapport</h4>
                    <div id="conformity-report-content" class="report-content-preview scroll-custom">
                        <!-- Report content will be loaded here -->
                    </div>
                    <h4 class="subsection-title mt-4">Checklist de Conformité</h4>
                    <form id="conformity-checklist-form">
                        <input type="hidden" id="conformity-report-id-hidden" name="id_rapport_etudiant">
                        <div id="checklist-items-container">
                            <!-- Checklist items will be loaded here -->
                        </div>
                        <div class="form-group mt-4">
                            <label for="conformity-general-comment">Commentaire Général</label>
                            <textarea id="conformity-general-comment" name="commentaire_general" rows="5" required></textarea>
                        </div>
                        <div class="modal-action">
                            <button type="button" class="btn" onclick="closeModal(document.getElementById('conformity-check-modal'))">Annuler</button>
                            <button type="submit" class="btn btn-success" name="decision_conformite" value="conforme">
                                <span class="btn-text">Marquer Conforme</span>
                                <span class="loading-spinner"></span>
                            </button>
                            <button type="submit" class="btn btn-danger" name="decision_conformite" value="non-conforme">
                                <span class="btn-text">Marquer Non Conforme</span>
                                <span class="loading-spinner"></span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </dialog>

        <!-- Modale d'Activation Compte Étudiant -->
        <dialog id="activate-student-account-modal" class="modal">
            <div class="modal-box">
                <h3 class="modal-title">Activer Compte Étudiant: <span id="activate-student-name"></span></h3>
                <form id="activate-student-account-form" class="form-grid">
                    <input type="hidden" id="activate-student-id-hidden" name="numero_etudiant">
                    <div class="form-group">
                        <label for="activate-login">Login</label>
                        <input type="text" id="activate-login" name="login_utilisateur" required>
                    </div>
                    <div class="form-group">
                        <label for="activate-email">Email Principal</label>
                        <input type="email" id="activate-email" name="email_principal" required>
                    </div>
                    <div class="form-group">
                        <label for="activate-password">Mot de passe temporaire</label>
                        <input type="password" id="activate-password" name="mot_de_passe" required>
                    </div>
                    <div class="modal-action">
                        <button type="button" class="btn" onclick="closeModal(document.getElementById('activate-student-account-modal'))">Annuler</button>
                        <button type="submit" class="btn btn-primary">
                            <span class="btn-text">Activer le compte</span>
                            <span class="loading-spinner"></span>
                        </button>
                    </div>
                </form>
            </div>
        </dialog>

        <!-- Modale de Réponse Réclamation -->
        <dialog id="reclamation-response-modal" class="modal">
            <div class="modal-box large-modal-box">
                <h3 class="modal-title">Répondre à la Réclamation: <span id="reclamation-subject-display"></span></h3>
                <div class="modal-body">
                    <p><strong>Étudiant:</strong> <span id="reclamation-student-display"></span></p>
                    <p><strong>Description:</strong> <span id="reclamation-description-display"></span></p>
                    <form id="reclamation-response-form" class="form-grid mt-4">
                        <input type="hidden" id="reclamation-id-hidden" name="id_reclamation">
                        <div class="form-group">
                            <label for="reclamation-response-text">Votre Réponse</label>
                            <textarea id="reclamation-response-text" name="reponse" rows="8" required></textarea>
                        </div>
                        <div class="modal-action">
                            <button type="button" class="btn" onclick="closeModal(document.getElementById('reclamation-response-modal'))">Annuler</button>
                            <button type="submit" class="btn btn-primary" name="action" value="respond">
                                <span class="btn-text">Envoyer Réponse</span>
                                <span class="loading-spinner"></span>
                            </button>
                            <button type="submit" class="btn btn-success" name="action" value="close">
                                <span class="btn-text">Clôturer Réclamation</span>
                                <span class="loading-spinner"></span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </dialog>

        <!-- Templates pour les listes dynamiques -->
        <template id="student-row-template">
            <tr>
                <td class="student-matricule"></td>
                <td class="student-full-name"></td>
                <td class="student-email"></td>
                <td class="student-level"></td>
                <td class="student-payment-status"></td>
                <td class="student-account-status"></td>
                <td class="student-actions">
                    <button class="btn btn-sm btn-secondary view-student-details-btn" title="Voir dossier"><i class="fas fa-folder-open"></i></button>
                    <button class="btn btn-sm btn-info impersonate-student-btn" title="Impersonnaliser"><i class="fas fa-mask"></i></button>
                </td>
            </tr>
        </template>

        <template id="conformity-checklist-item-template">
            <div class="checklist-item">
                <input type="checkbox" class="checklist-checkbox" name="checklist_item_status" value="Conforme">
                <label class="checklist-label"></label>
                <textarea class="checklist-comment" placeholder="Commentaire spécifique (si Non Conforme)"></textarea>
            </div>
        </template>

        <template id="detail-inscription-row-template">
            <tr>
                <td class="inscription-year"></td>
                <td class="inscription-level"></td>
                <td class="inscription-amount"></td>
                <td class="inscription-payment-status"></td>
                <td class="inscription-actions">
                    <button class="btn btn-sm btn-secondary edit-inscription-btn" title="Modifier"><i class="fas fa-edit"></i></button>
                </td>
            </tr>
        </template>

        <template id="detail-note-row-template">
            <tr>
                <td class="note-ue"></td>
                <td class="note-ecue"></td>
                <td class="note-value"></td>
                <td class="note-year"></td>
                <td class="note-actions">
                    <button class="btn btn-sm btn-secondary edit-note-btn" title="Modifier"><i class="fas fa-edit"></i></button>
                </td>
            </tr>
        </template>

        <template id="detail-stage-row-template">
            <tr>
                <td class="stage-company"></td>
                <td class="stage-subject"></td>
                <td class="stage-start-date"></td>
                <td class="stage-end-date"></td>
                <td class="stage-validated"></td>
                <td class="stage-actions">
                    <button class="btn btn-sm btn-secondary edit-stage-btn" title="Modifier"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-sm btn-success validate-stage-btn" title="Valider"><i class="fas fa-check"></i></button>
                </td>
            </tr>
        </template>

        <template id="detail-penalty-row-template">
            <tr>
                <td class="penalty-type"></td>
                <td class="penalty-amount"></td>
                <td class="penalty-motif"></td>
                <td class="penalty-status"></td>
                <td class="penalty-actions">
                    <button class="btn btn-sm btn-success regularize-penalty-btn" title="Régulariser"><i class="fas fa-check"></i></button>
                </td>
            </tr>
        </template>

        <template id="detail-reclamation-row-template">
            <tr>
                <td class="reclamation-subject"></td>
                <td class="reclamation-status"></td>
                <td class="reclamation-date"></td>
                <td class="reclamation-actions">
                    <button class="btn btn-sm btn-secondary view-reclamation-btn" title="Voir/Répondre"><i class="fas fa-reply"></i></button>
                </td>
            </tr>
        </template>

        <template id="detail-report-row-template">
            <tr>
                <td class="report-title"></td>
                <td class="report-status"></td>
                <td class="report-submission-date"></td>
                <td class="report-actions">
                    <button class="btn btn-sm btn-secondary view-report-btn" title="Voir rapport"><i class="fas fa-eye"></i></button>
                    <button class="btn btn-sm btn-info force-status-btn" title="Forcer statut"><i class="fas fa-magic"></i></button>
                </td>
            </tr>
        </template>
    </main>
</div>
</body>
</html>