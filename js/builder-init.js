// Builder Initialization - Reads URL parameter and sets up the builder
class BuilderInitializer {
    constructor() {
        this.documentType = null;
        this.init();
    }

    init() {
        // Get type from URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        this.documentType = urlParams.get('type') || 'cv';

        // Validate type
        if (this.documentType !== 'cv' && this.documentType !== 'resume') {
            // Invalid type, redirect to landing page
            window.location.href = 'index.html';
            return;
        }

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
        // Hide both sections first
        const cvSection = document.getElementById('cv-section');
        const resumeSection = document.getElementById('resume-section');

        if (cvSection) cvSection.style.display = 'none';
        if (resumeSection) resumeSection.style.display = 'none';

        // Show the appropriate section
        if (this.documentType === 'cv' && cvSection) {
            cvSection.style.display = 'block';
        } else if (this.documentType === 'resume' && resumeSection) {
            resumeSection.style.display = 'block';
        }
    }

    updateHeader() {
        const headerTitle = document.getElementById('builder-title');
        if (headerTitle) {
            headerTitle.textContent = this.documentType === 'cv' 
                ? 'CV Builder' 
                : 'Résumé Builder';
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
