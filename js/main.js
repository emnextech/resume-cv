// Main Application Controller
class AppController {
    constructor() {
        this.init();
    }

    init() {
        // Wait for all managers to be initialized
        // Since managers are initialized in other scripts that load after this one,
        // we need to wait for them to be available
        this.waitForManagers().then(() => {
                this.setupEventListeners();
            });
    }

    waitForManagers(maxAttempts = 100, attempt = 0) {
        return new Promise((resolve) => {
            // Check if managers are initialized
            // Only cvFormManager and previewManager are required
            const managersReady = window.cvFormManager && window.previewManager;
            
            if (managersReady || attempt >= maxAttempts) {
                // Managers are ready or we've given up waiting
                if (!managersReady && attempt >= maxAttempts) {
                    console.warn('CVFormManager or PreviewManager not initialized after waiting');
                }
                resolve();
                return;
            }

            // Wait a bit and try again (check every 20ms, up to 2 seconds total)
            setTimeout(() => {
                this.waitForManagers(maxAttempts, attempt + 1).then(resolve);
            }, 20);
        });
    }

    setupEventListeners() {
        // Managers should be ready now, but check anyway
        // Only warn if they're still missing (shouldn't happen after waitForManagers)
        if (!window.cvFormManager) {
            console.warn('CVFormManager not initialized');
        }
        if (!window.previewManager) {
            console.warn('PreviewManager not initialized');
        }
        // TabManager is optional, so we don't warn if it's missing
        if (!window.tabManager) {
            // TabManager is optional, no warning needed
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
// Wait for DOM to be ready, then wait for managers to initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.appController = new AppController();
    });
} else {
    // DOM already loaded, initialize immediately
    // The waitForManagers method will handle waiting for managers
window.appController = new AppController();
}

// Export function for debugging
window.getAppState = () => {
    return {
        currentTab: window.tabManager ? window.tabManager.getCurrentTab() : null,
        cvData: window.cvFormManager ? window.cvFormManager.getData() : null,
        currentTemplate: window.previewManager ? window.previewManager.getCurrentTemplate() : null
    };
};

