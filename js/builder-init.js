// Builder Initialization - Reads URL parameter and sets up the builder
class BuilderInitializer {
    constructor() {
        this.documentType = null;
        this.init();
    }

    init() {
        // Always use CV type (resume support removed)
        this.documentType = 'cv';

        // Create a simple type manager for compatibility with existing code (needed early)
        this.createTypeManager();

        // Wait for DOM and other managers to initialize
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupDOM();
                this.finalizeSetup();
            });
        } else {
            this.setupDOM();
            this.finalizeSetup();
        }
    }

    setupDOM() {
        // Show appropriate form section
        this.setupFormSection();
        
        // Update header title
        this.updateHeader();
    }

    setupFormSection() {
        // Show CV section only
        const cvSection = document.getElementById('cv-section');
        if (cvSection) {
            cvSection.style.display = 'block';
        }
    }

    updateHeader() {
        const headerTitle = document.getElementById('builder-title');
        if (headerTitle) {
            headerTitle.textContent = 'CareerCraft - CV Builder';
        }
    }

    createTypeManager() {
        // Create a simple type manager compatible with existing code
        // This replaces the TabManager functionality
        window.typeManager = {
            getCurrentTab: () => this.documentType,
            getDocumentType: () => this.documentType
        };

        // Also create tabManager for backward compatibility with preview.js
        window.tabManager = {
            getCurrentTab: () => this.documentType
        };
    }

    finalizeSetup() {
        // Trigger preview update after everything is loaded
        setTimeout(() => {
            if (window.previewManager) {
                window.previewManager.updatePreview();
            }
        }, 100);
    }
}

// Initialize builder when script loads
window.builderInitializer = new BuilderInitializer();
