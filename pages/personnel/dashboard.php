<!-- /pages/personnel/dashboard.html -->
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard Personnel - GestionMySoutenance</title>
    <link href="/assets/css/main.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==" crossorigin="anonymous" referrerpolicy="no-referrer" />
    <script src="/assets/js/main.js" type="module" defer></script>
    <script src="/assets/js/pages/personnel.js" type="module" defer></script>
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
        <h1 class="page-title">Tableau de Bord Personnel</h1>

        <div class="dashboard-grid">
            <!-- Carte: Rapports en attente de Conformité (pour Agent de Conformité) -->
            <div id="conformity-reports-card" class="card hidden">
                <div class="card-header">
                    <h2 class="card-title"><i class="fas fa-clipboard-check icon-primary"></i> Rapports à Vérifier</h2>
                </div>
                <div class="card-body">
                    <p>Total en attente: <span id="stat-pending-conformity-reports" class="stat-value">...</span></p>
                    <ul id="pending-conformity-reports-list" class="item-list">
                        <!-- Reports will be loaded here by JS -->
                        <li>Aucun rapport en attente de vérification.</li>
                    </ul>
                    <div class="card-actions">
                        <a href="/pages/personnel/gestion-dossiers.html?tab=conformity" class="btn btn-secondary btn-sm"><i class="fas fa-eye"></i> Gérer la file</a>
                    </div>
                </div>
            </div>

            <!-- Carte: Étudiants à Activer (pour RS) -->
            <div id="students-to-activate-card" class="card hidden">
                <div class="card-header">
                    <h2 class="card-title"><i class="fas fa-user-plus icon-primary"></i> Étudiants à Activer</h2>
                </div>
                <div class="card-body">
                    <p>Total: <span id="stat-students-to-activate" class="stat-value">...</span></p>
                    <ul id="students-to-activate-list" class="item-list">
                        <!-- Students will be loaded here by JS -->
                        <li>Aucun étudiant en attente d'activation.</li>
                    </ul>
                    <div class="card-actions">
                        <a href="/pages/personnel/gestion-dossiers.html?tab=access" class="btn btn-secondary btn-sm"><i class="fas fa-eye"></i> Gérer les accès</a>
                    </div>
                </div>
            </div>

            <!-- Carte: Réclamations Ouvertes (pour RS) -->
            <div id="open-reclamations-card" class="card hidden">
                <div class="card-header">
                    <h2 class="card-title"><i class="fas fa-question-circle icon-primary"></i> Réclamations Ouvertes</h2>
                </div>
                <div class="card-body">
                    <p>Total: <span id="stat-open-reclamations" class="stat-value">...</span></p>
                    <ul id="open-reclamations-list" class="item-list">
                        <!-- Reclamations will be loaded here by JS -->
                        <li>Aucune réclamation ouverte.</li>
                    </ul>
                    <div class="card-actions">
                        <a href="/pages/personnel/gestion-dossiers.html?tab=reclamations" class="btn btn-secondary btn-sm"><i class="fas fa-eye"></i> Gérer les réclamations</a>
                    </div>
                </div>
            </div>

            <!-- Carte: Stages à Valider (pour RS) -->
            <div id="stages-to-validate-card" class="card hidden">
                <div class="card-header">
                    <h2 class="card-title"><i class="fas fa-briefcase icon-primary"></i> Stages à Valider</h2>
                </div>
                <div class="card-body">
                    <p>Total: <span id="stat-stages-to-validate" class="stat-value">...</span></p>
                    <ul id="stages-to-validate-list" class="item-list">
                        <!-- Stages will be loaded here by JS -->
                        <li>Aucun stage en attente de validation.</li>
                    </ul>
                    <div class="card-actions">
                        <a href="/pages/personnel/gestion-dossiers.html?tab=stages" class="btn btn-secondary btn-sm"><i class="fas fa-eye"></i> Gérer les stages</a>
                    </div>
                </div>
            </div>
        </div>

        <!-- Template pour un rapport en attente de conformité -->
        <template id="pending-conformity-report-template">
            <li>
                <span class="item-title"></span>
                <span class="item-meta">Étudiant: <span class="student-name"></span></span>
                <button class="btn btn-sm btn-primary view-conformity-btn" data-report-id="">Vérifier</button>
            </li>
        </template>

        <!-- Template pour un étudiant à activer -->
        <template id="student-to-activate-template">
            <li>
                <span class="item-title"></span>
                <span class="item-meta">Email: <span class="student-email"></span></span>
                <button class="btn btn-sm btn-primary activate-student-btn" data-student-id="">Activer</button>
            </li>
        </template>

        <!-- Template pour une réclamation ouverte -->
        <template id="open-reclamation-template">
            <li>
                <span class="item-title"></span>
                <span class="item-meta">Étudiant: <span class="student-name"></span></span>
                <button class="btn btn-sm btn-primary view-reclamation-btn" data-reclamation-id="">Traiter</button>
            </li>
        </template>

        <!-- Template pour un stage à valider -->
        <template id="stage-to-validate-template">
            <li>
                <span class="item-title"></span>
                <span class="item-meta">Étudiant: <span class="student-name"></span></span>
                <button class="btn btn-sm btn-primary validate-stage-btn" data-stage-id="">Valider</button>
            </li>
        </template>
    </main>
</div>
</body>
</html>