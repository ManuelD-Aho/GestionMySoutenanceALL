<!-- /pages/commission/session.html -->
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gestion Sessions - GestionMySoutenance</title>
    <link href="/assets/css/main.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==" crossorigin="anonymous" referrerpolicy="no-referrer" />
    <script src="/assets/js/main.js" type="module" defer></script>
    <script src="/assets/js/pages/commission.js" type="module" defer></script>
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
        <h1 class="page-title">Gestion des Sessions de Validation</h1>

        <div class="tabs-container">
            <div role="tablist" class="tabs">
                <a role="tab" class="tab tab-active" data-tab="list-sessions">Liste des Sessions</a>
                <a role="tab" class="tab" data-tab="create-session">Créer une Session</a>
            </div>

            <div id="tab-content-list-sessions" class="tab-content active">
                <h2 class="section-title">Sessions de Validation Existantes</h2>
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                        <tr>
                            <th>Nom</th>
                            <th>Président</th>
                            <th>Début Prévu</th>
                            <th>Fin Prévue</th>
                            <th>Statut</th>
                            <th>Mode</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody id="sessions-list-body">
                        <!-- Sessions will be loaded here by JS -->
                        </tbody>
                    </table>
                </div>
            </div>

            <div id="tab-content-create-session" class="tab-content">
                <h2 class="section-title">Créer une Nouvelle Session</h2>
                <form id="create-session-form" class="form-grid">
                    <div class="form-group">
                        <label for="session-name">Nom de la Session</label>
                        <input type="text" id="session-name" name="nom_session" required>
                    </div>
                    <div class="form-group">
                        <label for="session-start-date">Date de Début Prévue</label>
                        <input type="datetime-local" id="session-start-date" name="date_debut_session" required>
                    </div>
                    <div class="form-group">
                        <label for="session-end-date">Date de Fin Prévue</label>
                        <input type="datetime-local" id="session-end-date" name="date_fin_prevue" required>
                    </div>
                    <div class="form-group">
                        <label for="session-mode">Mode de Session</label>
                        <select id="session-mode" name="mode_session" required>
                            <option value="presentiel">Présentiel</option>
                            <option value="en_ligne">En Ligne</option>
                            <option value="hybride">Hybride</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="session-required-voters">Nombre de Votants Requis</label>
                        <input type="number" id="session-required-voters" name="nombre_votants_requis" min="1" required>
                    </div>
                    <div class="form-action-buttons">
                        <button type="submit" class="btn btn-primary">
                            <span class="btn-text">Créer la Session</span>
                            <span class="loading-spinner"></span>
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Modale de Détails/Gestion de Session -->
        <dialog id="session-details-modal" class="modal">
            <div class="modal-box large-modal-box">
                <h3 class="modal-title" id="session-details-title">Détails de la Session</h3>
                <div class="modal-body">
                    <p><strong>ID Session:</strong> <span id="modal-session-id"></span></p>
                    <p><strong>Nom:</strong> <span id="modal-session-name"></span></p>
                    <p><strong>Président:</strong> <span id="modal-session-president"></span></p>
                    <p><strong>Statut:</strong> <span id="modal-session-status"></span></p>
                    <p><strong>Mode:</strong> <span id="modal-session-mode"></span></p>
                    <p><strong>Votants Requis:</strong> <span id="modal-session-voters"></span></p>

                    <h4 class="subsection-title mt-4">Rapports Assignés</h4>
                    <div class="table-container">
                        <table class="data-table">
                            <thead>
                            <tr>
                                <th>Titre Rapport</th>
                                <th>Étudiant</th>
                                <th>Statut Rapport</th>
                                <th>Actions</th>
                            </tr>
                            </thead>
                            <tbody id="modal-session-reports-list">
                            <!-- Reports in session will be loaded here -->
                            </tbody>
                        </table>
                    </div>

                    <h4 class="subsection-title mt-4">Membres de la Commission</h4>
                    <ul id="modal-session-members-list" class="item-list">
                        <!-- Members will be loaded here -->
                    </ul>

                    <div class="modal-action-buttons mt-6">
                        <button class="btn btn-secondary" id="modal-edit-session-btn"><i class="fas fa-edit"></i> Modifier</button>
                        <button class="btn btn-primary" id="modal-start-session-btn"><i class="fas fa-play"></i> Démarrer</button>
                        <button class="btn btn-warning" id="modal-suspend-session-btn"><i class="fas fa-pause"></i> Suspendre</button>
                        <button class="btn btn-info" id="modal-resume-session-btn"><i class="fas fa-redo"></i> Reprendre</button>
                        <button class="btn btn-success" id="modal-close-session-btn"><i class="fas fa-check"></i> Clôturer</button>
                        <button class="btn btn-danger" id="modal-delete-session-btn"><i class="fas fa-trash"></i> Supprimer</button>
                        <button class="btn btn-primary" id="modal-init-pv-btn"><i class="fas fa-file-signature"></i> Initier PV</button>
                        <button class="btn" onclick="closeModal(document.getElementById('session-details-modal'))">Fermer</button>
                    </div>
                </div>
            </div>
        </dialog>

        <!-- Modale de Vote -->
        <dialog id="vote-modal" class="modal">
            <div class="modal-box">
                <h3 class="modal-title" id="vote-modal-title">Voter pour le Rapport</h3>
                <p class="py-4">Rapport: <strong id="vote-report-title"></strong> par <strong id="vote-student-name"></strong></p>
                <form id="vote-form" class="form-grid">
                    <input type="hidden" id="vote-report-id-hidden" name="id_rapport_etudiant">
                    <input type="hidden" id="vote-session-id-hidden" name="id_session">
                    <div class="form-group">
                        <label for="vote-decision">Décision</label>
                        <select id="vote-decision" name="id_decision_vote" required>
                            <!-- Options loaded by JS -->
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="vote-comment">Commentaire (obligatoire si non Approuvé)</label>
                        <textarea id="vote-comment" name="commentaire_vote" rows="4"></textarea>
                    </div>
                    <div class="modal-action">
                        <button type="button" class="btn" onclick="closeModal(document.getElementById('vote-modal'))">Annuler</button>
                        <button type="submit" class="btn btn-primary">
                            <span class="btn-text">Soumettre Vote</span>
                            <span class="loading-spinner"></span>
                        </button>
                    </div>
                </form>
            </div>
        </dialog>

        <!-- Modale de Rédaction PV -->
        <dialog id="pv-editor-modal" class="modal">
            <div class="modal-box large-modal-box">
                <h3 class="modal-title" id="pv-editor-title">Rédiger le Procès-Verbal</h3>
                <form id="pv-editor-form" class="form-grid">
                    <input type="hidden" id="pv-id-hidden" name="id_compte_rendu">
                    <div class="form-group">
                        <label for="pv-libelle">Libellé du PV</label>
                        <input type="text" id="pv-libelle" name="libelle_compte_rendu" required>
                    </div>
                    <div class="form-group">
                        <label for="pv-content">Contenu du PV</label>
                        <textarea id="pv-content" name="contenu" rows="15" class="tinymce-editor"></textarea>
                    </div>
                    <div class="modal-action">
                        <button type="button" class="btn" onclick="closeModal(document.getElementById('pv-editor-modal'))">Annuler</button>
                        <button type="submit" class="btn btn-primary">
                            <span class="btn-text">Sauvegarder PV</span>
                            <span class="loading-spinner"></span>
                        </button>
                        <button type="button" class="btn btn-success" id="submit-pv-for-approval-btn">
                            <span class="btn-text">Soumettre pour Approbation</span>
                            <span class="loading-spinner"></span>
                        </button>
                    </div>
                </form>
            </div>
        </dialog>

        <!-- Template pour une ligne de session -->
        <template id="session-row-template">
            <tr>
                <td class="session-name"></td>
                <td class="session-president"></td>
                <td class="session-start-date"></td>
                <td class="session-end-date"></td>
                <td class="session-status"></td>
                <td class="session-mode"></td>
                <td class="session-actions">
                    <button class="btn btn-sm btn-secondary view-session-btn" title="Voir détails"><i class="fas fa-eye"></i></button>
                    <button class="btn btn-sm btn-info compose-session-btn" title="Composer session"><i class="fas fa-list-alt"></i></button>
                    <button class="btn btn-sm btn-primary start-session-btn" title="Démarrer session"><i class="fas fa-play"></i></button>
                    <button class="btn btn-sm btn-warning suspend-session-btn" title="Suspendre session"><i class="fas fa-pause"></i></button>
                    <button class="btn btn-sm btn-success close-session-btn" title="Clôturer session"><i class="fas fa-check"></i></button>
                    <button class="btn btn-sm btn-danger delete-session-btn" title="Supprimer session"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        </template>

        <!-- Template pour un rapport dans la modale de session -->
        <template id="modal-session-report-template">
            <tr>
                <td class="report-title"></td>
                <td class="student-name"></td>
                <td class="report-status"></td>
                <td class="report-actions">
                    <button class="btn btn-sm btn-secondary view-report-details-btn" title="Voir détails"><i class="fas fa-info-circle"></i></button>
                    <button class="btn btn-sm btn-primary assign-rapporteur-btn" title="Désigner rapporteur"><i class="fas fa-user-tag"></i></button>
                    <button class="btn btn-sm btn-danger remove-report-btn" title="Retirer du session"><i class="fas fa-minus-circle"></i></button>
                </td>
            </tr>
        </template>
    </main>
</div>
</body>
</html>