<!-- /pages/etudiant/rapport.html -->
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mon Rapport - GestionMySoutenance</title>
    <link href="/assets/css/main.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==" crossorigin="anonymous" referrerpolicy="no-referrer" />
    <script src="/assets/js/main.js" type="module" defer></script>
    <script src="/assets/js/pages/etudiant.js" type="module" defer></script>
    <!-- TinyMCE pour l'éditeur WYSIWYG -->
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
        <h1 class="page-title">Rédaction de mon Rapport</h1>

        <!-- Section Choix du Modèle (visible si pas de rapport existant) -->
        <div id="model-selection-section" class="card hidden">
            <div class="card-header">
                <h2 class="card-title"><i class="fas fa-th-list icon-primary"></i> Choisir un Modèle de Rapport</h2>
            </div>
            <div class="card-body">
                <form id="select-model-form">
                    <div id="model-list-container" class="model-grid">
                        <!-- Models will be loaded here by JS -->
                    </div>
                    <div class="form-action-buttons mt-4">
                        <button type="submit" class="btn btn-primary" id="create-from-model-btn">
                            <span class="btn-text">Créer le rapport</span>
                            <span class="loading-spinner"></span>
                        </button>
                        <button type="button" class="btn btn-secondary" id="create-blank-report-btn">
                            <span class="btn-text">Commencer une page blanche</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Section Éditeur de Rapport (visible si rapport existant ou créé) -->
        <div id="report-editor-section" class="card hidden">
            <div class="card-header">
                <h2 class="card-title"><i class="fas fa-pencil-alt icon-primary"></i> Éditeur de Rapport</h2>
            </div>
            <div class="card-body">
                <form id="report-form">
                    <input type="hidden" id="report-id-hidden" name="id_rapport_etudiant">
                    <div class="form-group">
                        <label for="report-title-input">Titre du Rapport</label>
                        <input type="text" id="report-title-input" name="libelle_rapport_etudiant" required>
                    </div>
                    <div class="form-group">
                        <label for="report-theme-input">Thème Principal</label>
                        <input type="text" id="report-theme-input" name="theme" required>
                    </div>
                    <div class="form-group">
                        <label for="report-pages-input">Nombre de pages estimé</label>
                        <input type="number" id="report-pages-input" name="nombre_pages" min="0">
                    </div>
                    <div class="form-group">
                        <label for="report-resume-editor">Résumé</label>
                        <textarea id="report-resume-editor" name="resume" class="tinymce-editor"></textarea>
                    </div>

                    <div id="report-sections-container">
                        <!-- Dynamic sections will be loaded here by JS -->
                        <div class="report-section-item">
                            <h3 class="section-title">Introduction</h3>
                            <textarea id="section-introduction" name="sections[Introduction]" class="tinymce-editor"></textarea>
                        </div>
                        <!-- More sections dynamically added -->
                    </div>

                    <div id="correction-note-section" class="form-group hidden">
                        <label for="correction-note">Note Explicative des Corrections</label>
                        <textarea id="correction-note" name="note_explicative" rows="5" placeholder="Décrivez les modifications apportées..."></textarea>
                        <small class="form-hint">Obligatoire si vous soumettez des corrections.</small>
                    </div>

                    <div class="form-action-buttons mt-6">
                        <button type="button" class="btn btn-secondary" id="save-draft-btn">
                            <span class="btn-text">Sauvegarder Brouillon</span>
                            <span class="loading-spinner"></span>
                        </button>
                        <button type="submit" class="btn btn-primary" id="submit-report-btn">
                            <span class="btn-text">Soumettre le Rapport</span>
                            <span class="loading-spinner"></span>
                        </button>
                        <button type="submit" class="btn btn-primary hidden" id="submit-corrections-btn">
                            <span class="btn-text">Soumettre les Corrections</span>
                            <span class="loading-spinner"></span>
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Template pour un modèle de rapport -->
        <template id="model-card-template">
            <div class="model-card" data-id="">
                <h3 class="model-card-title"></h3>
                <p class="model-card-description"></p>
                <div class="model-card-footer">
                    <span class="model-card-version"></span>
                    <button class="btn btn-sm btn-secondary select-model-btn">Sélectionner</button>
                </div>
            </div>
        </template>

        <!-- Template pour une section de rapport -->
        <template id="report-section-template">
            <div class="report-section-item">
                <h3 class="section-title"></h3>
                <textarea class="tinymce-editor"></textarea>
            </div>
        </template>
    </main>
</div>
</body>
</html>