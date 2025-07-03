<!-- /pages/etudiant/profil.html -->
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mon Profil - GestionMySoutenance</title>
    <link href="/assets/css/main.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==" crossorigin="anonymous" referrerpolicy="no-referrer" />
    <script src="/assets/js/main.js" type="module" defer></script>
    <script src="/assets/js/pages/etudiant.js" type="module" defer></script>
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
        <h1 class="page-title">Mon Profil</h1>

        <div class="profile-grid">
            <!-- Section Photo de Profil -->
            <div class="card profile-photo-card">
                <div class="card-header">
                    <h2 class="card-title"><i class="fas fa-camera icon-primary"></i> Photo de Profil</h2>
                </div>
                <div class="card-body text-center">
                    <img id="profile-picture-display" src="/assets/images/default-avatar.png" alt="Photo de profil" class="profile-picture-large">
                    <form id="profile-picture-form" enctype="multipart/form-data" class="mt-4">
                        <input type="file" id="profile-picture-input" name="photo_profil_file" accept="image/*" class="file-input">
                        <label for="profile-picture-input" class="btn btn-secondary btn-sm mt-2">
                            <i class="fas fa-upload"></i> Choisir une photo
                        </label>
                        <button type="submit" class="btn btn-primary btn-sm mt-2 hidden" id="upload-photo-btn">
                            <span class="btn-text">Télécharger</span>
                            <span class="loading-spinner"></span>
                        </button>
                    </form>
                </div>
            </div>

            <!-- Section Informations Personnelles -->
            <div class="card profile-info-card">
                <div class="card-header">
                    <h2 class="card-title"><i class="fas fa-info-circle icon-primary"></i> Informations Personnelles</h2>
                </div>
                <div class="card-body">
                    <form id="personal-info-form" class="form-grid">
                        <div class="form-group">
                            <label>Nom</label>
                            <p id="display-nom" class="form-display-text"></p>
                        </div>
                        <div class="form-group">
                            <label>Prénom</label>
                            <p id="display-prenom" class="form-display-text"></p>
                        </div>
                        <div class="form-group">
                            <label for="input-telephone">Téléphone Personnel</label>
                            <input type="tel" id="input-telephone" name="telephone">
                        </div>
                        <div class="form-group">
                            <label for="input-email-secondary">Email Secondaire</label>
                            <input type="email" id="input-email-secondary" name="email_contact_secondaire">
                        </div>
                        <div class="form-group">
                            <label for="input-adresse">Adresse Postale</label>
                            <input type="text" id="input-adresse" name="adresse_postale">
                        </div>
                        <div class="form-group">
                            <label for="input-ville">Ville</label>
                            <input type="text" id="input-ville" name="ville">
                        </div>
                        <div class="form-group">
                            <label for="input-code-postal">Code Postal</label>
                            <input type="text" id="input-code-postal" name="code_postal">
                        </div>
                        <div class="form-group">
                            <label for="input-contact-urgence-nom">Contact Urgence (Nom)</label>
                            <input type="text" id="input-contact-urgence-nom" name="contact_urgence_nom">
                        </div>
                        <div class="form-group">
                            <label for="input-contact-urgence-tel">Contact Urgence (Téléphone)</label>
                            <input type="tel" id="input-contact-urgence-tel" name="contact_urgence_telephone">
                        </div>
                        <div class="form-group">
                            <label for="input-contact-urgence-relation">Contact Urgence (Relation)</label>
                            <input type="text" id="input-contact-urgence-relation" name="contact_urgence_relation">
                        </div>
                        <div class="form-action-buttons">
                            <button type="submit" class="btn btn-primary">
                                <span class="btn-text">Sauvegarder Infos</span>
                                <span class="loading-spinner"></span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Section Sécurité du Compte -->
            <div class="card profile-security-card">
                <div class="card-header">
                    <h2 class="card-title"><i class="fas fa-shield-alt icon-primary"></i> Sécurité du Compte</h2>
                </div>
                <div class="card-body">
                    <h3 class="subsection-title">Modifier le Mot de Passe</h3>
                    <form id="change-password-form" class="form-grid">
                        <div class="form-group">
                            <label for="current-password">Mot de passe actuel</label>
                            <input type="password" id="current-password" name="current_password" required>
                        </div>
                        <div class="form-group">
                            <label for="new-password">Nouveau mot de passe</label>
                            <input type="password" id="new-password" name="new_password" required>
                            <small class="form-hint">Min. 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre.</small>
                        </div>
                        <div class="form-group">
                            <label for="confirm-new-password">Confirmer nouveau mot de passe</label>
                            <input type="password" id="confirm-new-password" name="confirm_new_password" required>
                        </div>
                        <div class="form-action-buttons">
                            <button type="submit" class="btn btn-primary">
                                <span class="btn-text">Changer Mot de Passe</span>
                                <span class="loading-spinner"></span>
                            </button>
                        </div>
                    </form>

                    <h3 class="subsection-title mt-6">Authentification à Deux Facteurs (2FA)</h3>
                    <div id="2fa-status-section" class="2fa-status-section">
                        <p>Statut 2FA: <span id="2fa-status-display" class="status-badge">Désactivé</span></p>
                        <div id="2fa-actions">
                            <button id="enable-2fa-btn" class="btn btn-secondary btn-sm hidden">Activer 2FA</button>
                            <button id="disable-2fa-btn" class="btn btn-danger btn-sm hidden">Désactiver 2FA</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Modale 2FA Setup -->
            <dialog id="2fa-setup-modal" class="modal">
                <div class="modal-box">
                    <h3 class="modal-title">Activer l'Authentification à Deux Facteurs</h3>
                    <p class="py-4">Scannez ce QR code avec votre application d'authentification (ex: Google Authenticator) ou entrez la clé manuellement.</p>
                    <div class="text-center my-4">
                        <img id="qr-code-display" src="" alt="QR Code 2FA" class="mx-auto">
                        <p class="mt-2 text-sm">Clé secrète: <strong id="secret-key-display"></strong></p>
                    </div>
                    <form id="2fa-verify-form" class="form-grid">
                        <div class="form-group">
                            <label for="2fa-code-input">Code de vérification</label>
                            <input type="text" id="2fa-code-input" name="totp_code" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" required>
                        </div>
                        <div class="modal-action">
                            <button type="button" class="btn" onclick="closeModal(document.getElementById('2fa-setup-modal'))">Annuler</button>
                            <button type="submit" class="btn btn-primary">
                                <span class="btn-text">Vérifier et Activer</span>
                                <span class="loading-spinner"></span>
                            </button>
                        </div>
                    </form>
                </div>
            </dialog>
        </div>
    </main>
</div>
</body>
</html>