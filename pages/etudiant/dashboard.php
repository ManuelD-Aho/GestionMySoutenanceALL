<!-- /pages/etudiant/dashboard.html -->
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mon Tableau de Bord - GestionMySoutenance</title>
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
        <h1 class="page-title">Mon Tableau de Bord</h1>

        <div id="eligibility-banner" class="banner banner-warning hidden">
            <i class="fas fa-exclamation-triangle"></i>
            <span id="eligibility-message">Votre accès à la soumission de rapport est actuellement restreint. Veuillez vérifier votre situation.</span>
        </div>

        <div class="dashboard-grid">
            <!-- Carte: Résumé du Rapport -->
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title"><i class="fas fa-file-alt icon-primary"></i> Mon Rapport de Soutenance</h2>
                </div>
                <div class="card-body">
                    <p>Titre: <span id="report-title" class="stat-value">...</span></p>
                    <p>Statut: <span id="report-status" class="stat-value">...</span></p>
                    <p>Dernière modification: <span id="report-last-modified" class="stat-value">...</span></p>
                    <div class="card-actions">
                        <button id="start-edit-report-btn" class="btn btn-primary btn-sm hidden"><i class="fas fa-pencil-alt"></i> Commencer/Modifier</button>
                        <button id="view-report-btn" class="btn btn-secondary btn-sm hidden"><i class="fas fa-eye"></i> Voir le rapport</button>
                    </div>
                </div>
            </div>

            <!-- Carte: Workflow du Rapport -->
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title"><i class="fas fa-project-diagram icon-primary"></i> Parcours de Validation</h2>
                </div>
                <div class="card-body">
                    <ul id="workflow-stepper" class="stepper">
                        <!-- Steps will be loaded here by JS -->
                    </ul>
                </div>
            </div>

            <!-- Carte: Notifications Personnelles -->
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title"><i class="fas fa-bell icon-primary"></i> Mes Notifications</h2>
                </div>
                <div class="card-body">
                    <ul id="personal-notifications-list" class="notification-list">
                        <!-- Notifications will be loaded here by JS -->
                        <li>Aucune notification récente.</li>
                    </ul>
                    <div class="card-actions">
                        <button id="view-all-notifications-btn" class="btn btn-secondary btn-sm"><i class="fas fa-eye"></i> Voir toutes</button>
                    </div>
                </div>
            </div>

            <!-- Carte: Accès Rapides -->
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title"><i class="fas fa-bolt icon-primary"></i> Accès Rapides</h2>
                </div>
                <div class="card-body">
                    <ul class="quick-links">
                        <li><a href="/pages/etudiant/profil.html"><i class="fas fa-user-circle"></i> Mon Profil</a></li>
                        <li><a href="#" id="my-documents-link"><i class="fas fa-file-pdf"></i> Mes Documents Officiels</a></li>
                        <li><a href="#" id="my-reclamations-link"><i class="fas fa-question-circle"></i> Mes Réclamations</a></li>
                        <li><a href="#" id="resources-help-link"><i class="fas fa-info-circle"></i> Ressources & Aide</a></li>
                    </ul>
                </div>
            </div>
        </div>
    </main>
</div>
</body>
</html>