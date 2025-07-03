<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard Admin - GestionMySoutenance</title>
    <link href="/assets/css/main.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==" crossorigin="anonymous" referrerpolicy="no-referrer" />
    <script src="/assets/js/main.js" type="module" defer></script>
    <script src="/assets/js/pages/admin.js" type="module" defer></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.2/dist/chart.umd.min.js"></script>
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
        <h1 class="page-title">Tableau de Bord Administrateur</h1>

        <div class="dashboard-grid">
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title"><i class="fas fa-users icon-primary"></i> Utilisateurs</h2>
                </div>
                <div class="card-body">
                    <p>Total: <span id="stat-total-users" class="stat-value">...</span></p>
                    <p>Actifs: <span id="stat-active-users" class="stat-value">...</span></p>
                    <p>Bloqués: <span id="stat-blocked-users" class="stat-value">...</span></p>
                </div>
            </div>
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title"><i class="fas fa-file-alt icon-primary"></i> Rapports</h2>
                </div>
                <div class="card-body">
                    <p>Soumis: <span id="stat-submitted-reports" class="stat-value">...</span></p>
                    <p>En Commission: <span id="stat-in-commission-reports" class="stat-value">...</span></p>
                    <p>Validés: <span id="stat-validated-reports" class="stat-value">...</span></p>
                </div>
            </div>
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title"><i class="fas fa-tasks icon-primary"></i> Tâches Asynchrones</h2>
                </div>
                <div class="card-body">
                    <p>En attente: <span id="stat-pending-tasks" class="stat-value">...</span></p>
                    <p>Échouées: <span id="stat-failed-tasks" class="stat-value">...</span></p>
                </div>
            </div>
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title"><i class="fas fa-question-circle icon-primary"></i> Réclamations</h2>
                </div>
                <div class="card-body">
                    <p>Ouvertes: <span id="stat-open-reclamations" class="stat-value">...</span></p>
                    <p>En cours: <span id="stat-in-progress-reclamations" class="stat-value">...</span></p>
                </div>
            </div>
        </div>

        <div class="dashboard-charts">
            <div class="chart-card">
                <h2 class="card-title"><i class="fas fa-chart-pie icon-primary"></i> Répartition des Rapports par Statut</h2>
                <canvas id="reportsStatusChart"></canvas>
            </div>
            <div class="chart-card">
                <h2 class="card-title"><i class="fas fa-chart-bar icon-primary"></i> Activité Récente (7 derniers jours)</h2>
                <canvas id="recentActivityChart"></canvas>
            </div>
        </div>

        <div class="dashboard-section">
            <h2 class="section-title"><i class="fas fa-exclamation-triangle icon-warning"></i> Alertes Système</h2>
            <div id="system-alerts-list" class="alert-list">
                <div class="alert alert-info">
                    <i class="fas fa-info-circle"></i>
                    <span>Aucune alerte critique pour le moment.</span>
                </div>
            </div>
        </div>
    </main>
</div>
</body>
</html>