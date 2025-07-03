<!-- /pages/admin/utilisateurs.html -->
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gestion Utilisateurs - GestionMySoutenance</title>
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
        <h1 class="page-title">Gestion des Utilisateurs</h1>

        <div class="controls-bar">
            <div class="search-filter-group">
                <input type="text" id="search-users" placeholder="Rechercher par nom, email..." class="input-text">
                <select id="filter-role" class="select-box">
                    <option value="">Tous les rôles</option>
                    <!-- Options will be loaded by JS -->
                </select>
                <select id="filter-status" class="select-box">
                    <option value="">Tous les statuts</option>
                    <option value="actif">Actif</option>
                    <option value="inactif">Inactif</option>
                    <option value="bloque">Bloqué</option>
                    <option value="en_attente_validation">En attente de validation</option>
                    <option value="archive">Archivé</option>
                </select>
            </div>
            <button id="add-user-btn" class="btn btn-primary"><i class="fas fa-plus"></i> Ajouter Utilisateur</button>
        </div>

        <div class="table-container">
            <table class="data-table">
                <thead>
                <tr>
                    <th>Nom Complet</th>
                    <th>Email Principal</th>
                    <th>Login</th>
                    <th>Rôle</th>
                    <th>Statut</th>
                    <th>Dernière Connexion</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody id="user-list-body">
                <!-- User rows will be loaded here by JS -->
                <tr><td colspan="7" class="text-center">Chargement des utilisateurs...</td></tr>
                </tbody>
            </table>
        </div>

        <!-- Pagination (optional, can be added later) -->
        <div class="pagination-controls"></div>

        <!-- Modale de Création/Modification Utilisateur -->
        <dialog id="user-modal" class="modal">
            <div class="modal-box">
                <h3 class="modal-title" id="user-modal-title">Ajouter un nouvel utilisateur</h3>
                <form id="user-form" class="form-grid">
                    <input type="hidden" id="user-id-hidden" name="numero_utilisateur">
                    <div class="form-group">
                        <label for="form-nom">Nom</label>
                        <input type="text" id="form-nom" name="nom" required>
                    </div>
                    <div class="form-group">
                        <label for="form-prenom">Prénom</label>
                        <input type="text" id="form-prenom" name="prenom" required>
                    </div>
                    <div class="form-group">
                        <label for="form-login">Login</label>
                        <input type="text" id="form-login" name="login_utilisateur" required>
                    </div>
                    <div class="form-group">
                        <label for="form-email">Email Principal</label>
                        <input type="email" id="form-email" name="email_principal" required>
                    </div>
                    <div class="form-group">
                        <label for="form-password">Mot de passe</label>
                        <input type="password" id="form-password" name="mot_de_passe">
                        <small class="form-hint">Laisser vide pour ne pas changer (modification).</small>
                    </div>
                    <div class="form-group">
                        <label for="form-role">Rôle</label>
                        <select id="form-role" name="id_groupe_utilisateur" required>
                            <!-- Options loaded by JS -->
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="form-type">Type d'utilisateur</label>
                        <select id="form-type" name="id_type_utilisateur" required>
                            <!-- Options loaded by JS -->
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="form-access-level">Niveau d'Accès</label>
                        <select id="form-access-level" name="id_niveau_acces_donne" required>
                            <!-- Options loaded by JS -->
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="form-status">Statut du Compte</label>
                        <select id="form-status" name="statut_compte" required>
                            <option value="actif">Actif</option>
                            <option value="inactif">Inactif</option>
                            <option value="bloque">Bloqué</option>
                            <option value="en_attente_validation">En attente de validation</option>
                            <option value="archive">Archivé</option>
                        </select>
                    </div>
                    <div class="modal-action">
                        <button type="button" class="btn" id="user-modal-cancel">Annuler</button>
                        <button type="submit" class="btn btn-primary" id="user-modal-submit">
                            <span class="btn-text">Enregistrer</span>
                            <span class="loading-spinner"></span>
                        </button>
                    </div>
                </form>
            </div>
        </dialog>

        <!-- Template pour une ligne d'utilisateur -->
        <template id="user-row-template">
            <tr>
                <td class="user-full-name"></td>
                <td class="user-email"></td>
                <td class="user-login"></td>
                <td class="user-role-label"></td>
                <td class="user-status"></td>
                <td class="user-last-login"></td>
                <td class="user-actions">
                    <button class="btn btn-sm btn-secondary edit-user-btn" title="Modifier"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-sm btn-danger delete-user-btn" title="Supprimer"><i class="fas fa-trash"></i></button>
                    <button class="btn btn-sm btn-info impersonate-user-btn" title="Impersonnaliser"><i class="fas fa-mask"></i></button>
                </td>
            </tr>
        </template>
    </main>
</div>
</body>
</html>