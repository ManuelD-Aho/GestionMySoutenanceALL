<!-- /pages/commission/dashboard.html -->
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard Commission - GestionMySoutenance</title>
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
        <h1 class="page-title">Tableau de Bord Commission</h1>

        <div class="dashboard-grid">
            <!-- Carte: Rapports en attente de mon vote -->
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title"><i class="fas fa-vote-yea icon-primary"></i> Rapports à Évaluer</h2>
                </div>
                <div class="card-body">
                    <ul id="reports-to-vote-list" class="item-list">
                        <!-- Reports will be loaded here by JS -->
                        <li>Aucun rapport en attente de votre vote.</li>
                    </ul>
                    <div class="card-actions">
                        <button id="view-all-reports-btn" class="btn btn-secondary btn-sm"><i class="fas fa-eye"></i> Voir tous les rapports</button>
                    </div>
                </div>
            </div>

            <!-- Carte: PVs en attente d'approbation -->
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title"><i class="fas fa-file-signature icon-primary"></i> PVs à Approuver</h2>
                </div>
                <div class="card-body">
                    <ul id="pvs-to-approve-list" class="item-list">
                        <!-- PVs will be loaded here by JS -->
                        <li>Aucun PV en attente de votre approbation.</li>
                    </ul>
                    <div class="card-actions">
                        <button id="view-all-pvs-btn" class="btn btn-secondary btn-sm"><i class="fas fa-eye"></i> Voir tous les PVs</button>
                    </div>
                </div>
            </div>

            <!-- Carte: Mes Sessions Passées -->
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title"><i class="fas fa-history icon-primary"></i> Mon Historique d'Activités</h2>
                </div>
                <div class="card-body">
                    <ul id="my-past-sessions-list" class="item-list">
                        <!-- Past sessions will be loaded here by JS -->
                        <li>Aucune activité récente.</li>
                    </ul>
                    <div class="card-actions">
                        <button id="view-my-history-btn" class="btn btn-secondary btn-sm"><i class="fas fa-eye"></i> Voir mon historique</button>
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
                        <li><a href="/pages/commission/session.html"><i class="fas fa-plus-circle"></i> Créer une nouvelle session</a></li>
                        <li><a href="/pages/commission/session.html"><i class="fas fa-cogs"></i> Gérer les sessions</a></li>
                        <li><a href="/pages/etudiant/profil.html"><i class="fas fa-user-circle"></i> Mon Profil</a></li>
                    </ul>
                </div>
            </div>
        </div>

        <!-- Template pour un rapport à évaluer -->
        <template id="report-to-vote-template">
            <li>
                <span class="item-title"></span>
                <span class="item-meta">Étudiant: <span class="student-name"></span></span>
                <button class="btn btn-sm btn-primary vote-report-btn" data-report-id="" data-session-id="">Voter</button>
            </li>
        </template>

        <!-- Template pour un PV à approuver -->
        <template id="pv-to-approve-template">
            <li>
                <span class="item-title"></span>
                <span class="item-meta">Rédacteur: <span class="redacteur-name"></span></span>
                <button class="btn btn-sm btn-primary approve-pv-btn" data-pv-id="">Approuver</button>
            </li>
        </template>
    </main>
</div>
</body>
</html>