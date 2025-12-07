// Main Application Controller
class AppController {
    constructor() {
        this.init();
    }

    init() {
        // Wait for all managers to be initialized
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupEventListeners();
            });
        } else {
            this.setupEventListeners();
        }
    }

    setupEventListeners() {
        // Ensure all managers exist
        if (!window.tabManager) {
            console.warn('TabManager not initialized');
        }
        if (!window.cvFormManager) {
            console.warn('CVFormManager not initialized');
        }
        if (!window.previewManager) {
            console.warn('PreviewManager not initialized');
        }

        // Listen for form changes to update preview
        this.setupFormWatchers();
    }

    setupFormWatchers() {
        // CV form watchers are handled in cv-form.js
        // Preview updates are triggered automatically on input changes
    }
}

// Initialize app
window.appController = new AppController();

// Export function for debugging
window.getAppState = () => {
    return {
        currentTab: window.tabManager ? window.tabManager.getCurrentTab() : null,
        cvData: window.cvFormManager ? window.cvFormManager.getData() : null,
        currentTemplate: window.previewManager ? window.previewManager.getCurrentTemplate() : null
    };
};

