// UX Enhancements - Undo/Redo, Confirmation Dialogs, Onboarding, Help, Keyboard Shortcuts

class UXEnhancements {
    constructor() {
        this.history = [];
        this.historyIndex = -1;
        this.maxHistorySize = 50;
        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setup();
            });
        } else {
            this.setup();
        }
    }

    setup() {
        // Wait for form managers to be ready
        this.waitForFormManagers(() => {
            // Removed setupUndoRedo() - undo/redo buttons removed per user request
            // Remove any existing undo/redo buttons
            const existingUndoRedo = document.querySelector('.undo-redo-container');
            if (existingUndoRedo) {
                existingUndoRedo.remove();
            }
            
            this.setupConfirmationDialogs();
            // Removed setupLoadingSkeletons() - preview updates should be instant/live
            this.setupEmptyStates();
            this.setupOnboardingTour();
            this.setupHelpModal();
            this.setupKeyboardShortcuts();
            this.setupExampleData();
            // Removed initializeHistory() - not needed without undo/redo
        });
    }

    waitForFormManagers(callback) {
        const checkManagers = () => {
            const formManager = this.getFormManager();
            if (formManager) {
                callback();
            } else {
                setTimeout(checkManagers, 100);
            }
        };
        checkManagers();
    }

    // ============================================
    // UNDO/REDO FUNCTIONALITY
    // ============================================

    initializeHistory() {
        // Get initial state
        const formManager = this.getFormManager();
        if (formManager) {
            const initialState = JSON.parse(JSON.stringify(formManager.getData()));
            this.history = [initialState];
            this.historyIndex = 0;
        }
    }

    getFormManager() {
        return window.cvFormManager;
    }

    saveState() {
        const formManager = this.getFormManager();
        if (!formManager) return;

        const currentState = JSON.parse(JSON.stringify(formManager.getData()));
        
        // Remove any states after current index (for redo)
        if (this.historyIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.historyIndex + 1);
        }

        // Add new state
        this.history.push(currentState);
        this.historyIndex++;

        // Limit history size
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
            this.historyIndex--;
        }

        this.updateUndoRedoButtons();
    }

    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.restoreState(this.history[this.historyIndex]);
            this.showUndoNotification();
        }
    }

    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.restoreState(this.history[this.historyIndex]);
        }
    }

    restoreState(state) {
        const formManager = this.getFormManager();
        if (!formManager) return;

        const docType = this.documentType;

        // Update form manager data
        formManager.data = JSON.parse(JSON.stringify(state));

        // Restore form fields
        const sectionId = 'cv-section';
        const section = document.getElementById(sectionId);
        if (!section) return;

        // Restore single fields
        Object.keys(state).forEach(key => {
            if (typeof state[key] === 'string') {
                const element = document.getElementById(`${docType}-${key}`);
                if (element) {
                    element.value = state[key];
                }
            }
        });

        // Restore array fields
        Object.keys(state).forEach(key => {
            if (Array.isArray(state[key])) {
                this.restoreArrayField(key, state[key]);
            }
        });

        // Update preview
        if (window.previewManager) {
            window.previewManager.updatePreview();
        }

        this.updateUndoRedoButtons();
    }

    restoreArrayField(fieldName, items) {
        const docType = this.documentType;
        const container = document.getElementById(`${docType}-${fieldName}-container`);
        if (!container) return;

        const formManager = this.getFormManager();
        if (!formManager) return;

        // Clear container
        container.innerHTML = '';

        // Rebuild items
        if (fieldName === 'education') {
            items.forEach(item => {
                formManager.addEducationRow(item);
            });
        } else {
            items.forEach((item, index) => {
                formManager.addEntryItem(fieldName, item);
            });
        }
    }

    setupUndoRedo() {
        // Undo/redo buttons removed per user request
        // Remove any existing undo/redo containers
        const existingContainer = document.querySelector('.undo-redo-container');
        if (existingContainer) {
            existingContainer.remove();
        }
    }

    setupHistoryTracking() {
        // History tracking disabled - undo/redo buttons removed per user request
        // No longer tracking history
    }

    updateUndoRedoButtons() {
        if (this.undoBtn) {
            this.undoBtn.disabled = this.historyIndex <= 0;
        }
        if (this.redoBtn) {
            this.redoBtn.disabled = this.historyIndex >= this.history.length - 1;
        }
    }

    showUndoNotification() {
        // Remove existing notification
        const existing = document.querySelector('.undo-notification');
        if (existing) existing.remove();

        const notification = document.createElement('div');
        notification.className = 'undo-notification';
        notification.innerHTML = `
            <span class="undo-notification-message">Action undone</span>
            <button class="undo-notification-btn" onclick="this.closest('.undo-notification').remove()">Dismiss</button>
        `;
        document.body.appendChild(notification);

        setTimeout(() => notification.classList.add('show'), 10);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // ============================================
    // CONFIRMATION DIALOGS
    // ============================================

    setupConfirmationDialogs() {
        // Replace all confirm() calls with custom dialogs
        this.interceptConfirms();
    }

    interceptConfirms() {
        // Note: We're not overriding window.confirm globally
        // Instead, we'll use showConfirmationDialog directly where needed
    }

    showConfirmationDialog(message, title = 'Confirm Action') {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.className = 'confirmation-dialog-overlay';
            overlay.innerHTML = `
                <div class="confirmation-dialog">
                    <div class="confirmation-dialog-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                        </svg>
                    </div>
                    <h3 class="confirmation-dialog-title">${title}</h3>
                    <p class="confirmation-dialog-message">${message}</p>
                    <div class="confirmation-dialog-actions">
                        <button class="confirmation-dialog-btn confirmation-dialog-btn-cancel">Cancel</button>
                        <button class="confirmation-dialog-btn confirmation-dialog-btn-confirm">Confirm</button>
                    </div>
                </div>
            `;

            document.body.appendChild(overlay);
            setTimeout(() => overlay.classList.add('active'), 10);

            const cancelBtn = overlay.querySelector('.confirmation-dialog-btn-cancel');
            const confirmBtn = overlay.querySelector('.confirmation-dialog-btn-confirm');

            const close = (result) => {
                overlay.classList.remove('active');
                setTimeout(() => overlay.remove(), 300);
                resolve(result);
            };

            cancelBtn.addEventListener('click', () => close(false));
            confirmBtn.addEventListener('click', () => close(true));

            // Close on overlay click
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) close(false);
            });

            // Close on Escape
            const handleEscape = (e) => {
                if (e.key === 'Escape') {
                    close(false);
                    document.removeEventListener('keydown', handleEscape);
                }
            };
            document.addEventListener('keydown', handleEscape);

            // Focus management
            confirmBtn.focus();
        });
    }

    // ============================================
    // LOADING SKELETONS - REMOVED
    // ============================================
    // Removed setupLoadingSkeletons() to enable live preview updates
    // Preview now updates instantly as user types without showing skeleton/shimmer
    // Shimmer loading is only used for page navigation (see index.html)

    // ============================================
    // EMPTY STATES
    // ============================================

    setupEmptyStates() {
        // Check for empty sections and show empty states
        this.checkEmptySections();
        setInterval(() => this.checkEmptySections(), 2000);
    }

    checkEmptySections() {
        const docType = this.documentType;
        const sectionId = 'cv-section';
        const section = document.getElementById(sectionId);
        if (!section) return;

        const containers = section.querySelectorAll('[id$="-container"]');
        containers.forEach(container => {
            const items = container.querySelectorAll('.entry-item, tr');
            if (items.length === 0 || (items.length === 1 && this.isEmptyItem(items[0]))) {
                this.showEmptyState(container);
            } else {
                this.hideEmptyState(container);
            }
        });
    }

    isEmptyItem(item) {
        const inputs = item.querySelectorAll('input, textarea');
        for (const input of inputs) {
            if (input.value && input.value.trim() !== '') {
                return false;
            }
        }
        return true;
    }

    showEmptyState(container) {
        if (container.querySelector('.section-empty-state')) return;

        const emptyState = document.createElement('div');
        emptyState.className = 'section-empty-state';
        const docType = this.documentType;
        const fieldName = container.id.replace(`${docType}-`, '').replace('-container', '');
        emptyState.innerHTML = `
            <div class="empty-state-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="12" y1="18" x2="12" y2="12"/>
                    <line x1="9" y1="15" x2="15" y2="15"/>
                </svg>
            </div>
            <h4 class="empty-state-title">No ${this.formatFieldName(fieldName)} yet</h4>
            <p class="empty-state-description">Click the "Add" button above to get started.</p>
        `;
        container.appendChild(emptyState);
    }

    hideEmptyState(container) {
        const emptyState = container.querySelector('.section-empty-state');
        if (emptyState) emptyState.remove();
    }

    formatFieldName(fieldName) {
        return fieldName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    // ============================================
    // ONBOARDING TOUR
    // ============================================

    setupOnboardingTour() {
        // Check if user has completed tour
        const tourCompleted = localStorage.getItem('cv-builder-tour-completed');
        if (!tourCompleted) {
            // Show tour after a short delay
            setTimeout(() => {
                this.startTour();
            }, 1000);
        }
    }

    startTour() {
        const steps = this.getTourSteps();
        if (steps.length === 0) return;

        this.tourSteps = steps;
        this.currentStep = 0;
        this.showTourStep(0);
    }

    getTourSteps() {
        const docType = this.documentType;
        const sectionId = 'cv-section';
        const section = document.getElementById(sectionId);
        if (!section) return [];

        return [
            {
                element: section.querySelector(`#cv-personal-info, #cv-contact-info`),
                title: 'Welcome to the CV Builder!',
                description: 'Start by filling in your personal information. All fields are optional, but the more you complete, the better your CV will look.',
                position: 'bottom'
            },
            {
                element: document.querySelector('.preview-section'),
                title: 'Live Preview',
                description: 'Watch your CV update in real-time as you type. You can customize templates, colors, and fonts using the controls above.',
                position: 'left'
            },
            {
                element: document.querySelector('.navbar-download'),
                title: 'Export Your CV',
                description: 'Once you\'re done, export your CV as PDF or Word document. Your work is automatically saved as you type.',
                position: 'bottom'
            }
        ].filter(step => step.element);
    }

    showTourStep(index) {
        if (index >= this.tourSteps.length) {
            this.endTour();
            return;
        }

        const step = this.tourSteps[index];
        const element = step.element;
        const rect = element.getBoundingClientRect();

        // Create overlay
        if (!this.tourOverlay) {
            this.tourOverlay = document.createElement('div');
            this.tourOverlay.className = 'tour-overlay';
            document.body.appendChild(this.tourOverlay);
        }
        this.tourOverlay.classList.add('active');

        // Create highlight
        if (this.tourHighlight) this.tourHighlight.remove();
        this.tourHighlight = document.createElement('div');
        this.tourHighlight.className = 'tour-highlight';
        this.tourHighlight.style.width = `${rect.width}px`;
        this.tourHighlight.style.height = `${rect.height}px`;
        this.tourHighlight.style.left = `${rect.left}px`;
        this.tourHighlight.style.top = `${rect.top}px`;
        document.body.appendChild(this.tourHighlight);

        // Create tooltip
        if (this.tourTooltip) this.tourTooltip.remove();
        this.tourTooltip = document.createElement('div');
        this.tourTooltip.className = 'tour-tooltip';
        
        let tooltipLeft, tooltipTop;
        if (step.position === 'bottom') {
            tooltipLeft = rect.left + rect.width / 2;
            tooltipTop = rect.bottom + 20;
        } else if (step.position === 'left') {
            tooltipLeft = rect.left - 380;
            tooltipTop = rect.top + rect.height / 2;
        } else {
            tooltipLeft = rect.left + rect.width / 2;
            tooltipTop = rect.top - 200;
        }

        this.tourTooltip.style.left = `${tooltipLeft}px`;
        this.tourTooltip.style.top = `${tooltipTop}px`;
        this.tourTooltip.innerHTML = `
            <h3 class="tour-tooltip-title">${step.title}</h3>
            <p class="tour-tooltip-description">${step.description}</p>
            <div class="tour-tooltip-actions">
                <span class="tour-tooltip-progress">${index + 1} of ${this.tourSteps.length}</span>
                <div class="tour-tooltip-buttons">
                    ${index > 0 ? '<button class="tour-tooltip-btn tour-tooltip-btn-secondary" data-action="prev">Previous</button>' : ''}
                    <button class="tour-tooltip-btn tour-tooltip-btn-secondary" data-action="skip">Skip</button>
                    <button class="tour-tooltip-btn tour-tooltip-btn-primary" data-action="next">${index === this.tourSteps.length - 1 ? 'Finish' : 'Next'}</button>
                </div>
            </div>
        `;
        document.body.appendChild(this.tourTooltip);
        setTimeout(() => this.tourTooltip.classList.add('active'), 10);

        // Add event listeners
        this.tourTooltip.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.getAttribute('data-action');
                if (action === 'next') {
                    this.showTourStep(index + 1);
                } else if (action === 'prev') {
                    this.showTourStep(index - 1);
                } else if (action === 'skip') {
                    this.endTour();
                }
            });
        });
    }

    endTour() {
        if (this.tourOverlay) {
            this.tourOverlay.classList.remove('active');
            setTimeout(() => this.tourOverlay.remove(), 300);
        }
        if (this.tourHighlight) this.tourHighlight.remove();
        if (this.tourTooltip) this.tourTooltip.remove();
        localStorage.setItem('cv-builder-tour-completed', 'true');
    }

    // ============================================
    // HELP MODAL
    // ============================================

    setupHelpModal() {
        // Add help button to utility controls group (next to save button)
        // Wait a bit to ensure BuilderEnhancements has created the utility-controls group
        const setupHelpButton = () => {
            let utilityControls = document.querySelector('.utility-controls');
            
            // If not found, create it
            if (!utilityControls) {
                const navbar = document.querySelector('.preview-navbar');
                if (!navbar) {
                    // Retry if navbar not ready yet
                    setTimeout(setupHelpButton, 100);
                    return;
                }
                
                utilityControls = document.createElement('div');
                utilityControls.className = 'utility-controls';
                // Insert after navbar-left to place on left side
                const navbarLeft = navbar.querySelector('.navbar-left');
                if (navbarLeft) {
                    navbarLeft.appendChild(utilityControls);
                } else {
                    // If navbar-left doesn't exist, create it
                    const newNavbarLeft = document.createElement('div');
                    newNavbarLeft.className = 'navbar-left';
                    newNavbarLeft.appendChild(utilityControls);
                    navbar.insertBefore(newNavbarLeft, navbar.firstChild);
                }
            }

            // Check if help button already exists
            if (utilityControls.querySelector('.help-btn')) {
                return; // Already added
            }

            const helpBtn = document.createElement('button');
            helpBtn.className = 'help-btn';
            helpBtn.setAttribute('aria-label', 'Help');
            helpBtn.textContent = '?';
            helpBtn.addEventListener('click', () => this.showHelpModal());
            utilityControls.appendChild(helpBtn);
        };

        // Try immediately, then retry if needed
        setupHelpButton();
        setTimeout(setupHelpButton, 200);
    }

    showHelpModal() {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h2 class="modal-title">Help & Tips</h2>
                    <button class="modal-close" aria-label="Close">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>
                <div class="modal-content">
                    <div class="modal-section">
                        <h3 class="modal-section-title">Getting Started</h3>
                        <ul class="modal-list">
                            <li class="modal-list-item">
                                <strong>Fill in your information:</strong> Start with personal details and work your way through each section.
                            </li>
                            <li class="modal-list-item">
                                <strong>Watch the preview:</strong> Your CV updates in real-time as you type.
                            </li>
                            <li class="modal-list-item">
                                <strong>Customize appearance:</strong> Use the template, color, and font selectors in the navbar.
                            </li>
                            <li class="modal-list-item">
                                <strong>Export when ready:</strong> Download your CV as PDF or Word document.
                            </li>
                        </ul>
                    </div>
                    <div class="modal-section">
                        <h3 class="modal-section-title">Tips for Best Results</h3>
                        <ul class="modal-list">
                            <li class="modal-list-item">
                                <strong>Be specific:</strong> Include concrete achievements and numbers where possible.
                            </li>
                            <li class="modal-list-item">
                                <strong>Keep it concise:</strong> Aim for 1-2 pages for résumés, 2-3 pages for CVs.
                            </li>
                            <li class="modal-list-item">
                                <strong>Use action verbs:</strong> Start bullet points with words like "Developed", "Led", "Improved".
                            </li>
                            <li class="modal-list-item">
                                <strong>Proofread:</strong> Check for spelling and grammar errors before exporting.
                            </li>
                        </ul>
                    </div>
                    <div class="modal-section">
                        <h3 class="modal-section-title">Features</h3>
                        <ul class="modal-list">
                            <li class="modal-list-item">
                                <strong>Auto-save:</strong> Your work is automatically saved as you type.
                            </li>
                            <li class="modal-list-item">
                                <strong>Multiple templates:</strong> Choose from Modern, Classic, or Bold designs.
                            </li>
                            <li class="modal-list-item">
                                <strong>Color schemes:</strong> Select from 8 professional color options.
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        setTimeout(() => overlay.classList.add('active'), 10);

        const closeBtn = overlay.querySelector('.modal-close');
        const close = () => {
            overlay.classList.remove('active');
            setTimeout(() => overlay.remove(), 300);
        };

        closeBtn.addEventListener('click', close);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) close();
        });

        // Close on Escape
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                close();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
    }

    // ============================================
    // KEYBOARD SHORTCUTS
    // ============================================

    setupKeyboardShortcuts() {
        // Show keyboard shortcut hint
        this.showKeyboardHint();

        // Listen for ? key
        document.addEventListener('keydown', (e) => {
            if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
                const activeElement = document.activeElement;
                if (activeElement.tagName !== 'INPUT' && activeElement.tagName !== 'TEXTAREA') {
                    e.preventDefault();
                    this.showKeyboardShortcutsModal();
                }
            }

            // Undo/Redo shortcuts disabled - undo/redo buttons removed per user request
            // Keyboard shortcuts for undo/redo no longer work
        });
    }

    showKeyboardHint() {
        const hint = document.createElement('div');
        hint.className = 'keyboard-shortcut-hint';
        hint.innerHTML = `
            Press <span class="keyboard-shortcut-hint-key">?</span> for keyboard shortcuts
        `;
        document.body.appendChild(hint);

        // Hide after 5 seconds
        setTimeout(() => {
            hint.style.opacity = '0';
            setTimeout(() => hint.remove(), 300);
        }, 5000);
    }

    showKeyboardShortcutsModal() {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h2 class="modal-title">Keyboard Shortcuts</h2>
                    <button class="modal-close" aria-label="Close">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>
                <div class="modal-content">
                    <div class="modal-section">
                        <h3 class="modal-section-title">General</h3>
                        <ul class="modal-list">
                            <li class="modal-list-item">
                                <strong>Show shortcuts</strong>
                                <span class="keyboard-shortcut">
                                    <kbd class="keyboard-key">?</kbd>
                                </span>
                            </li>
                        </ul>
                    </div>
                    <div class="modal-section">
                        <h3 class="modal-section-title">Navigation</h3>
                        <ul class="modal-list">
                            <li class="modal-list-item">
                                <strong>Tab</strong> - Move to next field
                            </li>
                            <li class="modal-list-item">
                                <strong>Shift + Tab</strong> - Move to previous field
                            </li>
                            <li class="modal-list-item">
                                <strong>Enter</strong> - Submit form (in textareas, creates new line)
                            </li>
                            <li class="modal-list-item">
                                <strong>Escape</strong> - Close modals/dialogs
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        setTimeout(() => overlay.classList.add('active'), 10);

        const closeBtn = overlay.querySelector('.modal-close');
        const close = () => {
            overlay.classList.remove('active');
            setTimeout(() => overlay.remove(), 300);
        };

        closeBtn.addEventListener('click', close);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) close();
        });

        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                close();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
    }

    // ============================================
    // EXAMPLE DATA
    // ============================================

    setupExampleData() {
        // Add "Load Example" button to first section
        const docType = this.documentType;
        const sectionId = 'cv-section';
        const section = document.getElementById(sectionId);
        if (!section) return;

        const firstGroup = section.querySelector('.form-group');
        if (!firstGroup) return;

        // Check if example data is already loaded
        const formManager = this.getFormManager();
        if (formManager && formManager.data && formManager.data.name) {
            // Data already loaded, don't show button
            return;
        }

        const exampleBtn = document.createElement('button');
        exampleBtn.className = 'add-btn';
        exampleBtn.style.marginTop = '10px';
        exampleBtn.textContent = '📝 Load Example Data';
        exampleBtn.addEventListener('click', async () => {
            const confirmed = await this.showConfirmationDialog(
                'Load example data? This will replace any existing data.',
                'Load Example Data'
            );
            if (confirmed) {
                this.loadExampleData();
                exampleBtn.remove();
            }
        });
        firstGroup.appendChild(exampleBtn);
    }

    loadExampleData() {
        // Example data is already loaded by form managers
        // This is just a placeholder for user-triggered reload
        const formManager = this.getFormManager();
        if (formManager && formManager.loadFakeData) {
            formManager.loadFakeData();
            if (window.previewManager) {
                window.previewManager.updatePreview();
            }
            this.initializeHistory();
        }
    }

    get documentType() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('type') || 'cv';
    }
}

// Initialize UX enhancements
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.uxEnhancements = new UXEnhancements();
    });
} else {
    window.uxEnhancements = new UXEnhancements();
}
