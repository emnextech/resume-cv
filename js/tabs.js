// Tab Switching Logic
class TabManager {
    constructor() {
        this.currentTab = 'cv';
        this.init();
    }

    init() {
        const tabButtons = document.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabName = button.getAttribute('data-tab');
                this.switchTab(tabName);
            });
        });
    }

    switchTab(tabName) {
        // Update buttons
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update sections
        document.querySelectorAll('.form-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(`${tabName}-section`).classList.add('active');

        this.currentTab = tabName;
        
        // Trigger preview update
        if (window.previewManager) {
            window.previewManager.updatePreview();
        }
    }

    getCurrentTab() {
        return this.currentTab;
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.tabManager = new TabManager();
    });
} else {
    window.tabManager = new TabManager();
}

