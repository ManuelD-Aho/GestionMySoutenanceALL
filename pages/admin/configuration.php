<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Configuration - GestionMySoutenance</title>
    <link href="/assets/css/main.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==" crossorigin="anonymous" referrerpolicy="no-referrer" />
    <script src="/assets/js/main.js" type="module" defer></script>
    <script src="/assets/js/pages/admin.js" type="module" defer></script>
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
        <h1 class="page-title">Configuration du Système</h1>

        <div class="tabs-container">
            <div role="tablist" class="tabs">
                <a role="tab" class="tab tab-active" data-tab="parameters">Paramètres Généraux</a>
                <a role="tab" class="tab" data-tab="academic-years">Années Académiques</a>
                <a role="tab" class="tab" data-tab="referentials">Référentiels</a>
                <a role="tab" class="tab" data-tab="document-models">Modèles de Documents</a>
                <a role="tab" class="tab" data-tab="notifications">Notifications</a>
                <a role="tab" class="tab" data-tab="menu-order">Ordre des Menus</a>
            </div>

            <div id="tab-content-parameters" class="tab-content active">
                <h2 class="section-title">Paramètres Généraux du Système</h2>
                <form id="general-params-form" class="form-grid">
                    <div class="form-group">
                        <label for="MAX_LOGIN_ATTEMPTS">Tentatives de connexion max.</label>
                        <input type="number" id="MAX_LOGIN_ATTEMPTS" name="MAX_LOGIN_ATTEMPTS" required>
                    </div>
                    <div class="form-group">
                        <label for="LOCKOUT_TIME_MINUTES">Durée de blocage (minutes)</label>
                        <input type="number" id="LOCKOUT_TIME_MINUTES" name="LOCKOUT_TIME_MINUTES" required>
                    </div>
                    <div class="form-group">
                        <label for="PASSWORD_MIN_LENGTH">Longueur min. mot de passe</label>
                        <input type="number" id="PASSWORD_MIN_LENGTH" name="PASSWORD_MIN_LENGTH" required>
                    </div>
                    <div class="form-group">
                        <label for="SMTP_HOST">Hôte SMTP</label>
                        <input type="text" id="SMTP_HOST" name="SMTP_HOST" required>
                    </div>
                    <div class="form-group">
                        <label for="SMTP_PORT">Port SMTP</label>
                        <input type="number" id="SMTP_PORT" name="SMTP_PORT" required>
                    </div>
                    <div class="form-group">
                        <label for="SMTP_USER">Utilisateur SMTP</label>
                        <input type="text" id="SMTP_USER" name="SMTP_USER" required>
                    </div>
                    <div class="form-group">
                        <label for="SMTP_PASS">Mot de passe SMTP</label>
                        <input type="password" id="SMTP_PASS" name="SMTP_PASS">
                        <small class="form-hint">Laisser vide pour ne pas changer.</small>
                    </div>
                    <div class="form-group">
                        <label for="SMTP_SECURE">Sécurité SMTP (tls/ssl)</label>
                        <input type="text" id="SMTP_SECURE" name="SMTP_SECURE">
                    </div>
                    <div class="form-group">
                        <label for="SMTP_FROM_EMAIL">Email Expéditeur</label>
                        <input type="email" id="SMTP_FROM_EMAIL" name="SMTP_FROM_EMAIL" required>
                    </div>
                    <div class="form-group">
                        <label for="SMTP_FROM_NAME">Nom Expéditeur</label>
                        <input type="text" id="SMTP_FROM_NAME" name="SMTP_FROM_NAME" required>
                    </div>
                    <div class="form-group">
                        <label for="UPLOADS_PATH_BASE">Chemin de base Uploads</label>
                        <input type="text" id="UPLOADS_PATH_BASE" name="UPLOADS_PATH_BASE" required>
                    </div>
                    <div class="form-group">
                        <label for="UPLOADS_PATH_DOCUMENTS_GENERES">Sous-chemin Docs Générés</label>
                        <input type="text" id="UPLOADS_PATH_DOCUMENTS_GENERES" name="UPLOADS_PATH_DOCUMENTS_GENERES" required>
                    </div>
                    <div class="form-group">
                        <label for="UPLOADS_PATH_PROFILE_PICTURES">Sous-chemin Photos Profil</label>
                        <input type="text" id="UPLOADS_PATH_PROFILE_PICTURES" name="UPLOADS_PATH_PROFILE_PICTURES" required>
                    </div>
                    <div class="form-group">
                        <label for="UPLOADS_PATH_RAPPORT_IMAGES">Sous-chemin Images Rapport</label>
                        <input type="text" id="UPLOADS_PATH_RAPPORT_IMAGES" name="UPLOADS_PATH_RAPPORT_IMAGES" required>
                    </div>
                    <div class="form-action-buttons">
                        <button type="submit" class="btn btn-primary">
                            <span class="btn-text">Sauvegarder</span>
                            <span class="loading-spinner"></span>
                        </button>
                    </div>
                </form>
            </div>

            <div id="tab-content-academic-years" class="tab-content">
                <h2 class="section-title">Gestion des Années Académiques</h2>
                <form id="add-academic-year-form" class="form-grid">
                    <div class="form-group">
                        <label for="year-libelle">Libellé (ex: 2024-2025)</label>
                        <input type="text" id="year-libelle" name="libelle_annee_academique" required>
                    </div>
                    <div class="form-group">
                        <label for="year-start-date">Date de début</label>
                        <input type="date" id="year-start-date" name="date_debut" required>
                    </div>
                    <div class="form-group">
                        <label for="year-end-date">Date de fin</label>
                        <input type="date" id="year-end-date" name="date_fin" required>
                    </div>
                    <div class="form-group checkbox-group">
                        <input type="checkbox" id="year-is-active" name="est_active">
                        <label for="year-is-active">Année active</label>
                    </div>
                    <div class="form-action-buttons">
                        <button type="submit" class="btn btn-primary">
                            <span class="btn-text">Ajouter</span>
                            <span class="loading-spinner"></span>
                        </button>
                    </div>
                </form>
                <div class="table-container mt-4">
                    <table class="data-table">
                        <thead>
                        <tr>
                            <th>Libellé</th>
                            <th>Début</th>
                            <th>Fin</th>
                            <th>Active</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody id="academic-years-list"></tbody>
                    </table>
                </div>
            </div>

            <div id="tab-content-referentials" class="tab-content">
                <h2 class="section-title">Gestion des Référentiels</h2>
                <div class="form-group">
                    <label for="select-referential">Sélectionner un référentiel</label>
                    <select id="select-referential" class="select-box">
                        <option value="">-- Choisir --</option>
                    </select>
                </div>
                <div id="referential-details-panel" class="mt-4">
                    <p class="text-center text-secondary">Sélectionnez un référentiel pour le gérer.</p>
                </div>
            </div>

            <div id="tab-content-document-models" class="tab-content">
                <h2 class="section-title">Gestion des Modèles de Documents</h2>
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                        <tr>
                            <th>Nom du Modèle</th>
                            <th>Version</th>
                            <th>Statut</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody id="document-models-list"></tbody>
                    </table>
                </div>
                <button id="add-document-model-btn" class="btn btn-primary mt-4"><i class="fas fa-plus"></i> Ajouter Modèle</button>
                <button id="import-document-model-btn" class="btn btn-secondary mt-4"><i class="fas fa-file-import"></i> Importer Word</button>
            </div>

            <div id="tab-content-notifications" class="tab-content">
                <h2 class="section-title">Configuration des Notifications</h2>
                <h3 class="subsection-title">Modèles de Notifications</h3>
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Libellé</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody id="notification-templates-list"></tbody>
                    </table>
                </div>
                <h3 class="subsection-title mt-6">Règles de Diffusion</h3>
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                        <tr>
                            <th>Événement Déclencheur</th>
                            <th>Groupe Destinataire</th>
                            <th>Canal</th>
                            <th>Actif</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody id="notification-rules-list"></tbody>
                    </table>
                </div>
            </div>

            <div id="tab-content-menu-order" class="tab-content">
                <h2 class="section-title">Ordre et Hiérarchie des Menus</h2>
                <div class="menu-tree-container">
                    <ul id="menu-tree" class="menu-tree"></ul>
                </div>
                <button id="save-menu-order-btn" class="btn btn-primary mt-4">
                    <span class="btn-text">Sauvegarder l'ordre</span>
                    <span class="loading-spinner"></span>
                </button>
            </div>
        </div>

        <!-- Modales pour les formulaires -->
        <dialog id="academic-year-modal" class="modal">
            <div class="modal-box">
                <h3 class="modal-title" id="year-modal-title">Modifier Année Académique</h3>
                <form id="edit-academic-year-form" class="form-grid">
                    <input type="hidden" id="edit-year-id" name="id_annee_academique">
                    <div class="form-group">
                        <label for="edit-year-libelle">Libellé</label>
                        <input type="text" id="edit-year-libelle" name="libelle_annee_academique" required>
                    </div>
                    <div class="form-group">
                        <label for="edit-year-start-date">Date de début</label>
                        <input type="date" id="edit-year-start-date" name="date_debut" required>
                    </div>
                    <div class="form-group">
                        <label for="edit-year-end-date">Date de fin</label>
                        <input type="date" id="edit-year-end-date" name="date_fin" required>
                    </div>
                    <div class="form-group checkbox-group">
                        <input type="checkbox" id="edit-year-is-active" name="est_active">
                        <label for="edit-year-is-active">Année active</label>
                    </div>
                    <div class="modal-action">
                        <button type="button" class="btn" onclick="closeModal(document.getElementById('academic-year-modal'))">Annuler</button>
                        <button type="submit" class="btn btn-primary">
                            <span class="btn-text">Mettre à jour</span>
                            <span class="loading-spinner"></span>
                        </button>
                    </div>
                </form>
            </div>
        </dialog>

        <dialog id="referential-entry-modal" class="modal">
            <div class="modal-box">
                <h3 class="modal-title" id="referential-entry-modal-title">Ajouter/Modifier Entrée</h3>
                <form id="referential-entry-form" class="form-grid">
                    <input type="hidden" id="referential-entry-id" name="id">
                    <input type="hidden" id="referential-entry-table" name="table_name">
                    <div id="dynamic-referential-fields"></div>
                    <div class="modal-action">
                        <button type="button" class="btn" onclick="closeModal(document.getElementById('referential-entry-modal'))">Annuler</button>
                        <button type="submit" class="btn btn-primary">
                            <span class="btn-text">Enregistrer</span>
                            <span class="loading-spinner"></span>
                        </button>
                    </div>
                </form>
            </div>
        </dialog>

        <dialog id="document-model-modal" class="modal">
            <div class="modal-box">
                <h3 class="modal-title" id="doc-model-modal-title">Ajouter/Modifier Modèle de Document</h3>
                <form id="doc-model-form" class="form-grid">
                    <input type="hidden" id="doc-model-id" name="id_modele">
                    <div class="form-group">
                        <label for="doc-model-name">Nom du Modèle</label>
                        <input type="text" id="doc-model-name" name="nom_modele" required>
                    </div>
                    <div class="form-group">
                        <label for="doc-model-content">Contenu HTML</label>
                        <textarea id="doc-model-content" name="contenu_html" rows="10" required></textarea>
                        <small class="form-hint">Utilisez des balises HTML pour la mise en page.</small>
                    </div>
                    <div class="modal-action">
                        <button type="button" class="btn" onclick="closeModal(document.getElementById('document-model-modal'))">Annuler</button>
                        <button type="submit" class="btn btn-primary">
                            <span class="btn-text">Enregistrer</span>
                            <span class="loading-spinner"></span>
                        </button>
                    </div>
                </form>
            </div>
        </dialog>

        <dialog id="import-doc-model-modal" class="modal">
            <div class="modal-box">
                <h3 class="modal-title">Importer Modèle depuis Word (.docx)</h3>
                <form id="import-doc-model-form" class="form-grid" enctype="multipart/form-data">
                    <div class="form-group">
                        <label for="word-file">Fichier Word (.docx)</label>
                        <input type="file" id="word-file" name="word_file" accept=".docx" required>
                    </div>
                    <div class="modal-action">
                        <button type="button" class="btn" onclick="closeModal(document.getElementById('import-doc-model-modal'))">Annuler</button>
                        <button type="submit" class="btn btn-primary">
                            <span class="btn-text">Importer</span>
                            <span class="loading-spinner"></span>
                        </button>
                    </div>
                </form>
            </div>
        </dialog>

        <dialog id="notification-template-modal" class="modal">
            <div class="modal-box">
                <h3 class="modal-title" id="notif-template-modal-title">Modifier Modèle de Notification</h3>
                <form id="notif-template-form" class="form-grid">
                    <input type="hidden" id="notif-template-id" name="id_notification">
                    <div class="form-group">
                        <label for="notif-template-libelle">Libellé</label>
                        <input type="text" id="notif-template-libelle" name="libelle_notification" required>
                    </div>
                    <div class="form-group">
                        <label for="notif-template-content">Contenu</label>
                        <textarea id="notif-template-content" name="contenu" rows="8" required></textarea>
                        <small class="form-hint">Utilisez {{variable}} pour les données dynamiques.</small>
                    </div>
                    <div class="modal-action">
                        <button type="button" class="btn" onclick="closeModal(document.getElementById('notification-template-modal'))">Annuler</button>
                        <button type="submit" class="btn btn-primary">
                            <span class="btn-text">Mettre à jour</span>
                            <span class="loading-spinner"></span>
                        </button>
                    </div>
                </form>
            </div>
        </dialog>

        <dialog id="notification-rule-modal" class="modal">
            <div class="modal-box">
                <h3 class="modal-title" id="notif-rule-modal-title">Modifier Règle de Diffusion</h3>
                <form id="notif-rule-form" class="form-grid">
                    <input type="hidden" id="notif-rule-id" name="id_regle">
                    <div class="form-group">
                        <label>Événement Déclencheur</label>
                        <p id="notif-rule-event-display" class="form-display-text"></p>
                    </div>
                    <div class="form-group">
                        <label>Groupe Destinataire</label>
                        <p id="notif-rule-group-display" class="form-display-text"></p>
                    </div>
                    <div class="form-group">
                        <label for="notif-rule-channel">Canal de Notification</label>
                        <select id="notif-rule-channel" name="canal_notification" required>
                            <option value="Interne">Interne</option>
                            <option value="Email">Email</option>
                            <option value="Tous">Tous</option>
                        </select>
                    </div>
                    <div class="form-group checkbox-group">
                        <input type="checkbox" id="notif-rule-active" name="est_active">
                        <label for="notif-rule-active">Règle active</label>
                    </div>
                    <div class="modal-action">
                        <button type="button" class="btn" onclick="closeModal(document.getElementById('notification-rule-modal'))">Annuler</button>
                        <button type="submit" class="btn btn-primary">
                            <span class="btn-text">Mettre à jour</span>
                            <span class="loading-spinner"></span>
                        </button>
                    </div>
                </form>
            </div>
        </dialog>

        <!-- Templates pour les listes dynamiques -->
        <template id="academic-year-row-template">
            <tr>
                <td class="year-libelle"></td>
                <td class="year-start-date"></td>
                <td class="year-end-date"></td>
                <td class="year-active"></td>
                <td class="year-actions">
                    <button class="btn btn-sm btn-secondary edit-year-btn" title="Modifier"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-sm btn-danger delete-year-btn" title="Supprimer"><i class="fas fa-trash"></i></button>
                    <button class="btn btn-sm btn-info set-active-year-btn" title="Définir comme active"><i class="fas fa-check-circle"></i></button>
                </td>
            </tr>
        </template>

        <template id="referential-entry-row-template">
            <tr>
                <td class="entry-id"></td>
                <td class="entry-libelle"></td>
                <td class="entry-actions">
                    <button class="btn btn-sm btn-secondary edit-entry-btn" title="Modifier"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-sm btn-danger delete-entry-btn" title="Supprimer"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        </template>

        <template id="document-model-row-template">
            <tr>
                <td class="model-name"></td>
                <td class="model-version"></td>
                <td class="model-status"></td>
                <td class="model-actions">
                    <button class="btn btn-sm btn-secondary edit-model-btn" title="Modifier"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-sm btn-danger delete-model-btn" title="Supprimer"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        </template>

        <template id="notification-template-row-template">
            <tr>
                <td class="template-id"></td>
                <td class="template-libelle"></td>
                <td class="template-actions">
                    <button class="btn btn-sm btn-secondary edit-template-btn" title="Modifier"><i class="fas fa-edit"></i></button>
                </td>
            </tr>
        </template>

        <template id="notification-rule-row-template">
            <tr>
                <td class="rule-event"></td>
                <td class="rule-group"></td>
                <td class="rule-channel"></td>
                <td class="rule-active"></td>
                <td class="rule-actions">
                    <button class="btn btn-sm btn-secondary edit-rule-btn" title="Modifier"><i class="fas fa-edit"></i></button>
                </td>
            </tr>
        </template>

        <template id="menu-item-template">
            <li class="menu-item" data-id="">
                <div class="menu-item-content">
                    <i class="menu-item-icon fas"></i>
                    <span class="menu-item-label"></span>
                    <span class="menu-item-order"></span>
                    <button class="btn btn-sm btn-ghost menu-item-edit-btn" title="Modifier"><i class="fas fa-pencil-alt"></i></button>
                </div>
                <ul class="menu-item-children"></ul>
            </li>
        </template>
    </main>
</div>
</body>
</html>