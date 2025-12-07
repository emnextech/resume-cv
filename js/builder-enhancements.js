// Builder Enhancement Features
class BuilderEnhancements {
    constructor() {
        this.autosaveInterval = null;
        this.autosaveDelay = 2000; // 2 seconds after last input
        this.lastSaveTime = null;
        this.saveTimeout = null;
        this.documentType = null;
        this.formManager = null;
        this.init();
    }

    init() {
        // Wait for document type to be determined
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setup();
            });
        } else {
            this.setup();
        }
    }

    setup() {
        // Get document type
        const urlParams = new URLSearchParams(window.location.search);
        this.documentType = urlParams.get('type') || 'cv';
        
        // Wait for form managers to be ready
        this.waitForFormManager(() => {
            // Get form manager reference (CV only)
            this.formManager = window.cvFormManager;

            // Setup all enhancements
            this.setupHeader();
            this.setupProgressIndicator();
            this.setupSaveDraft();
            this.setupKeyboardShortcuts();
            this.setupAccordionSections();
            this.setupStickyNavigation();
            this.setupFieldValidation();
            this.setupCharacterCounters();
            this.setupDragAndDrop();
            this.setupAutosave();
            this.setupTooltips();
            this.setupClearAllButtons();
            this.setupCompletionCheckmarks();
            this.loadDraft();

            // Update progress initially
            setTimeout(() => this.updateProgress(), 100);
        });
    }

    waitForFormManager(callback) {
        const checkManager = () => {
            const manager = window.cvFormManager;
            
            if (manager) {
                callback();
            } else {
                setTimeout(checkManager, 50);
            }
        };
        checkManager();
    }

    setupHeader() {
        // Find the sticky navbar
        const navbar = document.querySelector('.preview-navbar');
        if (!navbar) return;

        // Find or create navbar-left container
        let navbarLeft = navbar.querySelector('.navbar-left');
        if (!navbarLeft) {
            navbarLeft = document.createElement('div');
            navbarLeft.className = 'navbar-left';
            navbar.insertBefore(navbarLeft, navbar.firstChild);
        }

        // Find navbar-controls (where other controls are)
        const navbarControls = navbar.querySelector('.navbar-controls');
        if (!navbarControls) return;

        // Progress indicator (bar only, no text) - placed at the beginning
        const progressContainer = document.createElement('div');
        progressContainer.className = 'progress-container';
        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';
        const progressFill = document.createElement('div');
        progressFill.className = 'progress-fill';
        progressBar.appendChild(progressFill);
        progressContainer.appendChild(progressBar);
        progressContainer.setAttribute('title', 'Completion Progress');
        navbarControls.insertBefore(progressContainer, navbarControls.firstChild);

        // Create utility controls group for save and help buttons - place on left side
        let utilityControls = navbar.querySelector('.utility-controls');
        if (!utilityControls) {
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

        // Save Draft button (icon only)
        const saveDraftBtn = document.createElement('button');
        saveDraftBtn.className = 'save-draft-btn';
        saveDraftBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13 4L6 11L3 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        saveDraftBtn.setAttribute('title', 'Save Draft');
        saveDraftBtn.addEventListener('click', () => this.saveDraft(true));
        utilityControls.appendChild(saveDraftBtn);

        // Store references
        this.progressBar = progressFill;
        this.progressText = null; // No text element needed
        this.saveDraftBtn = saveDraftBtn;
        this.utilityControls = utilityControls; // Store for help button placement
    }

    setupProgressIndicator() {
        // Progress is updated in updateProgress method
        // This is called from various places when form changes
        if (this.progressBar) {
            // Initial update already done in setupHeader
        }
    }

    updateProgress() {
        if (!this.formManager || !this.progressBar) return;

        const data = this.formManager.getData();
        const sections = this.getSections();
        let completedFields = 0;
        let totalFields = 0;

        // Count completion
        Object.keys(data).forEach(key => {
            if (Array.isArray(data[key])) {
                data[key].forEach(item => {
                    Object.keys(item).forEach(field => {
                        totalFields++;
                        if (item[field] && String(item[field]).trim() !== '') {
                            completedFields++;
                        }
                    });
                });
            } else {
                totalFields++;
                if (data[key] && String(data[key]).trim() !== '') {
                    completedFields++;
                }
            }
        });

        const percentage = totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;
        this.progressBar.style.width = `${percentage}%`;
        // Update title attribute instead of text
        if (this.progressBar && this.progressBar.parentElement && this.progressBar.parentElement.parentElement) {
            this.progressBar.parentElement.parentElement.setAttribute('title', `${percentage}% Complete`);
        }
    }

    getSections() {
        const sectionId = 'cv-section';
        const section = document.getElementById(sectionId);
        if (!section) return [];
        
        return Array.from(section.querySelectorAll('.form-group')).map(group => ({
            id: group.id || `section-${Math.random().toString(36).substr(2, 9)}`,
            title: group.querySelector('h3')?.textContent || '',
            element: group
        }));
    }

    setupSaveDraft() {
        // Save draft is called via autosave and manual save
        // Storage key
        this.storageKey = `cv-builder-draft-${this.documentType}`;
    }

    saveDraft(showNotification = false) {
        if (!this.formManager) return;

        const data = this.formManager.getData();
        const draftData = {
            data: data,
            timestamp: new Date().toISOString(),
            documentType: this.documentType
        };

        try {
            localStorage.setItem(this.storageKey, JSON.stringify(draftData));
            this.lastSaveTime = Date.now();
            
            if (showNotification) {
                this.showNotification('Draft saved successfully!', 'success');
            }

            // Update autosave indicator
            this.updateAutosaveIndicator(true);
        } catch (e) {
            console.error('Failed to save draft:', e);
            if (showNotification) {
                this.showNotification('Failed to save draft', 'error');
            }
        }
    }

    loadDraft() {
        try {
            const draftData = localStorage.getItem(this.storageKey);
            if (!draftData) return;

            const parsed = JSON.parse(draftData);
            
            // Check if draft type matches current document type
            if (parsed.documentType !== this.documentType) {
                // Type mismatch - don't load, but don't show alert
                return;
            }

            // Automatically load draft without confirmation
            this.populateFormFromDraft(parsed.data);
            // No notification - silent load
        } catch (e) {
            console.error('Failed to load draft:', e);
        }
    }

    populateFormFromDraft(data) {
        if (!this.formManager) return;

        // Populate CV form
        if (window.cvFormManager) {
            this.populateCVForm(data);
        }

        // Update form manager data
        this.formManager.data = data;
        
        // Update preview
        if (window.previewManager) {
            window.previewManager.updatePreview();
        }

        // Update progress
        this.updateProgress();
    }

    populateCVForm(data) {
        // Single fields (excluding skills which is handled separately)
        ['name', 'email', 'phone', 'address', 'website', 'summary'].forEach(field => {
            const el = document.getElementById(`cv-${field}`);
            if (el && data[field]) el.value = data[field];
        });

        // Handle skills array
        if (data.skills && Array.isArray(data.skills) && data.skills.length > 0) {
            if (window.cvFormManager) {
                window.cvFormManager.selectedSkills = [...data.skills];
                window.cvFormManager.data.skills = [...data.skills];
                // Try to detect industry from skills (default to IT if can't determine)
                const industrySelect = document.getElementById('cv-industry-select');
                if (industrySelect) {
                    // Simple heuristic: if skills match IT skills, set to IT
                    const itSkills = window.cvFormManager.getIndustrySkills().it;
                    const hasITSkills = data.skills.some(skill => itSkills.includes(skill));
                    if (hasITSkills) {
                        industrySelect.value = 'it';
                        window.cvFormManager.selectedIndustry = 'it';
                        window.cvFormManager.loadSkillsForIndustry('it');
                    }
                }
            }
        }

        // Array fields
        Object.keys(data).forEach(key => {
            if (key === 'skills') return; // Already handled above
            if (Array.isArray(data[key]) && key !== 'education') {
                const container = document.getElementById(`cv-${key}-container`);
                if (container) {
                    container.innerHTML = '';
                    data[key].forEach(item => {
                        window.cvFormManager.addEntryItem(key, item);
                    });
                }
            } else if (key === 'education' && Array.isArray(data[key])) {
                const container = document.getElementById('cv-education-container');
                if (container) {
                    container.innerHTML = '';
                    data[key].forEach(item => {
                        window.cvFormManager.addEducationRow(item);
                    });
                }
            }
        });
    }

    populateResumeForm(data) {
        // Single fields
        ['name', 'email', 'phone', 'location', 'linkedin', 'summary', 'skills'].forEach(field => {
            const el = document.getElementById(`resume-${field}`);
            if (el && data[field]) el.value = data[field];
        });

        // Array fields
        Object.keys(data).forEach(key => {
            if (Array.isArray(data[key]) && key !== 'education') {
                const container = document.getElementById(`resume-${key}-container`);
                if (container) {
                    container.innerHTML = '';
                    data[key].forEach(item => {
                        window.resumeFormManager.addEntryItem(key, item);
                    });
                }
            } else if (key === 'education' && Array.isArray(data[key])) {
                const container = document.getElementById('resume-education-container');
                if (container) {
                    container.innerHTML = '';
                    data[key].forEach(item => {
                        window.resumeFormManager.addEducationRow(item);
                    });
                }
            }
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+S or Cmd+S to save
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.saveDraft(true);
            }
        });
    }

    setupAccordionSections() {
        const sections = this.getSections();
        sections.forEach(section => {
            const h3 = section.element.querySelector('h3');
            if (h3 && !h3.classList.contains('accordion-header')) {
                h3.classList.add('accordion-header');
                h3.setAttribute('tabindex', '0');
                
                // Add icon
                const icon = document.createElement('span');
                icon.className = 'accordion-icon';
                icon.textContent = '▼';
                h3.insertBefore(icon, h3.firstChild);
                
                // Add click handler
                h3.addEventListener('click', () => this.toggleSection(section.element));
                h3.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.toggleSection(section.element);
                    }
                });

                // Default: all sections expanded
                section.element.classList.add('accordion-expanded');
            }
        });
    }

    toggleSection(section) {
        section.classList.toggle('accordion-expanded');
        const icon = section.querySelector('.accordion-icon');
        if (icon) {
            icon.textContent = section.classList.contains('accordion-expanded') ? '▼' : '▶';
        }
    }

    setupStickyNavigation() {
        // Section navigation removed - no longer needed
        return;
    }

    updateSectionNavigation(navList) {
        const sections = this.getSections();
        navList.innerHTML = '';
        
        sections.forEach((section, index) => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = `#${section.element.id || `section-${index}`}`;
            a.textContent = section.title;
            a.addEventListener('click', (e) => {
                e.preventDefault();
                section.element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                // Update active state
                navList.querySelectorAll('a').forEach(link => link.classList.remove('active'));
                a.classList.add('active');
            });
            li.appendChild(a);
            navList.appendChild(li);
        });
    }

    setupFieldValidation() {
        const sectionId = 'cv-section';
        const formSection = document.getElementById(sectionId);
        if (!formSection) return;

        // Add validation on blur
        formSection.addEventListener('blur', (e) => {
            if (e.target.matches('input, textarea')) {
                this.validateField(e.target);
            }
        }, true);

        // Also validate on input for real-time feedback
        formSection.addEventListener('input', (e) => {
            if (e.target.matches('input, textarea')) {
                // Clear error state on input
                this.clearFieldError(e.target);
            }
        }, true);
    }

    validateField(field) {
        // Basic validation
        if (field.hasAttribute('required') && !field.value.trim()) {
            this.showFieldError(field, 'This field is required');
            return false;
        }

        if (field.type === 'email' && field.value && !this.isValidEmail(field.value)) {
            this.showFieldError(field, 'Please enter a valid email address');
            return false;
        }

        if (field.type === 'url' && field.value && !this.isValidUrl(field.value)) {
            this.showFieldError(field, 'Please enter a valid URL');
            return false;
        }

        this.clearFieldError(field);
        return true;
    }

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    showFieldError(field, message) {
        field.classList.add('field-error');
        
        // Remove existing error message
        const existingError = field.parentElement.querySelector('.field-error-message');
        if (existingError) existingError.remove();

        // Add error message
        const errorMsg = document.createElement('span');
        errorMsg.className = 'field-error-message';
        errorMsg.textContent = message;
        field.parentElement.appendChild(errorMsg);
    }

    clearFieldError(field) {
        field.classList.remove('field-error');
        const errorMsg = field.parentElement.querySelector('.field-error-message');
        if (errorMsg) errorMsg.remove();
    }

    setupCharacterCounters() {
        const sectionId = 'cv-section';
        const formSection = document.getElementById(sectionId);
        if (!formSection) return;

        // Find all textareas
        const textareas = formSection.querySelectorAll('textarea');
        textareas.forEach(textarea => {
            // Create counter
            const counter = document.createElement('div');
            counter.className = 'character-counter';
            const maxLength = textarea.getAttribute('maxlength') || 1000;
            textarea.setAttribute('maxlength', maxLength);
            
            const updateCounter = () => {
                const current = textarea.value.length;
                const max = parseInt(maxLength);
                counter.textContent = `${current}/${max}`;
                counter.classList.toggle('counter-warning', current > max * 0.9);
            };

            textarea.addEventListener('input', updateCounter);
            updateCounter();
            
            // Insert counter after textarea
            textarea.parentElement.insertBefore(counter, textarea.nextSibling);
        });
    }

    setupDragAndDrop() {
        const sectionId = 'cv-section';
        const formSection = document.getElementById(sectionId);
        if (!formSection) return;

        // Make entry items draggable
        formSection.addEventListener('mousedown', (e) => {
            const entryItem = e.target.closest('.entry-item');
            if (!entryItem) return;

            // Don't drag if clicking on input/textarea/button
            if (e.target.matches('input, textarea, button')) return;

            this.initiateDrag(entryItem, e);
        });
    }

    initiateDrag(item, e) {
        item.draggable = true;
        item.classList.add('dragging');
        
        item.addEventListener('dragstart', (e) => {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/html', item.outerHTML);
            e.dataTransfer.setData('text/plain', Array.from(item.parentElement.children).indexOf(item).toString());
        });

        item.addEventListener('dragend', () => {
            item.classList.remove('dragging');
            item.draggable = false;
        });

        // Handle drop zones - use event delegation
        document.addEventListener('dragover', (e) => {
            const dragging = document.querySelector('.entry-item.dragging');
            if (!dragging) return;
            
            const container = dragging.parentElement;
            if (!container || !container.matches('[id$="-container"]')) return;
            
            e.preventDefault();
            const afterElement = this.getDragAfterElement(container, e.clientY);
            
            if (afterElement == null) {
                container.appendChild(dragging);
            } else {
                container.insertBefore(dragging, afterElement);
            }
        }, false);

        document.addEventListener('drop', (e) => {
            const dragging = document.querySelector('.entry-item.dragging');
            if (!dragging) return;
            
            const container = dragging.parentElement;
            if (!container || !container.matches('[id$="-container"]')) return;
            
            // Update form data order
            this.updateDataOrder(container);
            
            // Update preview
            if (window.previewManager) {
                window.previewManager.updatePreview();
            }
        }, false);
    }

    getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.entry-item:not(.dragging)')];
        
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    updateDataOrder(container) {
        if (!this.formManager) return;

        const containerId = container.id;
            const fieldType = containerId.replace(/^cv-/, '').replace('-container$', '');
        
        if (fieldType === 'education') return; // Education uses table, handled differently
        
        const items = Array.from(container.querySelectorAll('.entry-item'));
        const newData = items.map(item => {
            const inputs = item.querySelectorAll('input, textarea');
            const itemData = {};
            inputs.forEach(input => {
                const field = input.getAttribute('data-field');
                if (field) {
                    itemData[field] = input.value;
                }
            });
            return itemData;
        });

        if (this.formManager.data[fieldType]) {
            this.formManager.data[fieldType] = newData;
        }
    }

    setupAutosave() {
        // Listen for form changes
        const sectionId = 'cv-section';
        const formSection = document.getElementById(sectionId);
        if (!formSection) return;

        formSection.addEventListener('input', () => {
            this.scheduleAutosave();
            this.updateProgress();
        });

        // Listen for DOM changes (additions/removals)
        const observer = new MutationObserver(() => {
            this.updateProgress();
        });

        // Observe changes to containers
        const containers = formSection.querySelectorAll('[id$="-container"]');
        containers.forEach(container => {
            observer.observe(container, { childList: true, subtree: true });
        });

        // Also observe form groups for accordion changes
        const formGroups = formSection.querySelectorAll('.form-group');
        formGroups.forEach(group => {
            observer.observe(group, { childList: true, subtree: true });
        });

        // Update autosave indicator
        this.updateAutosaveIndicator(false);
    }

    scheduleAutosave() {
        clearTimeout(this.saveTimeout);
        this.updateAutosaveIndicator(false, 'saving');
        
        this.saveTimeout = setTimeout(() => {
            this.saveDraft(false);
            this.updateAutosaveIndicator(true);
        }, this.autosaveDelay);
    }

    updateAutosaveIndicator(saved = false, status = 'idle') {
        if (!this.saveDraftBtn) return;

        const indicator = this.saveDraftBtn.querySelector('.autosave-indicator') || 
                         document.createElement('span');
        
        if (!this.saveDraftBtn.querySelector('.autosave-indicator')) {
            indicator.className = 'autosave-indicator';
            this.saveDraftBtn.appendChild(indicator);
        }

        if (status === 'saving') {
            indicator.textContent = ' (Saving...)';
            indicator.className = 'autosave-indicator saving';
        } else if (saved) {
            indicator.textContent = ' (Saved)';
            indicator.className = 'autosave-indicator saved';
            setTimeout(() => {
                indicator.textContent = '';
                indicator.className = 'autosave-indicator';
            }, 2000);
        } else {
            indicator.textContent = '';
            indicator.className = 'autosave-indicator';
        }
    }

    setupTooltips() {
        // Add tooltips to complex fields
        const tooltips = {
            'cv-summary': 'Write 2-4 sentences highlighting your key qualifications and career objectives.',
            'cv-skills': 'List skills separated by commas or on separate lines. Include technical and soft skills.'
        };

        Object.keys(tooltips).forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.setAttribute('title', tooltips[fieldId]);
                field.classList.add('has-tooltip');
            }
        });
    }

    setupClearAllButtons() {
        const sectionId = 'cv-section';
        const formSection = document.getElementById(sectionId);
        if (!formSection) return;

        const sections = formSection.querySelectorAll('.form-group');
        sections.forEach(section => {
            const h3 = section.querySelector('h3');
            if (h3 && !h3.querySelector('.clear-all-btn')) {
                const clearBtn = document.createElement('button');
                clearBtn.className = 'clear-all-btn';
                clearBtn.textContent = 'Clear All';
                clearBtn.type = 'button';
                clearBtn.addEventListener('click', async () => await this.clearSection(section));
                h3.appendChild(clearBtn);
            }
        });
    }

    async clearSection(section) {
        const confirmed = await window.uxEnhancements?.showConfirmationDialog(
            'Are you sure you want to clear all fields in this section?',
            'Clear Section'
        );
        if (!confirmed) return;

        const inputs = section.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.value = '';
            this.clearFieldError(input);
        });

        // Remove extra entry items (keep first one)
        const containers = section.querySelectorAll('[id$="-container"]');
        containers.forEach(container => {
            const items = container.querySelectorAll('.entry-item');
            if (items.length > 1) {
                items.forEach((item, index) => {
                    if (index > 0) item.remove();
                });
            } else if (items.length === 1) {
                // Clear the single item
                const inputs = items[0].querySelectorAll('input, textarea');
                inputs.forEach(input => input.value = '');
            }
        });

        // For education tables, keep first row but clear it
        const educationTable = section.querySelector('.education-table tbody');
        if (educationTable) {
            const rows = educationTable.querySelectorAll('tr');
            if (rows.length > 1) {
                rows.forEach((row, index) => {
                    if (index > 0) row.remove();
                });
            }
            // Clear first row
            const firstRow = educationTable.querySelector('tr');
            if (firstRow) {
                const inputs = firstRow.querySelectorAll('input');
                inputs.forEach(input => input.value = '');
            }
        }

        // Update form data and preview
        if (this.formManager && window.previewManager) {
            // Rebuild data from form
            // This is handled by form managers on input
            window.previewManager.updatePreview();
        }

        this.updateProgress();
    }

    setupCompletionCheckmarks() {
        const sectionId = 'cv-section';
        const formSection = document.getElementById(sectionId);
        if (!formSection) return;

        // Add checkmarks to section headers
        const sections = formSection.querySelectorAll('.form-group');
        sections.forEach(section => {
            const h3 = section.querySelector('h3');
            if (h3 && !h3.querySelector('.section-checkmark')) {
                const checkmark = document.createElement('span');
                checkmark.className = 'section-checkmark';
                checkmark.innerHTML = '✓';
                h3.insertBefore(checkmark, h3.firstChild);
            }
        });

        // Update checkmarks periodically
        setInterval(() => this.updateCompletionCheckmarks(), 1000);
    }

    updateCompletionCheckmarks() {
        const sectionId = 'cv-section';
        const formSection = document.getElementById(sectionId);
        if (!formSection) return;

        const sections = formSection.querySelectorAll('.form-group');
        sections.forEach(section => {
            const checkmark = section.querySelector('.section-checkmark');
            if (!checkmark) return;

            const hasContent = this.sectionHasContent(section);
            checkmark.classList.toggle('completed', hasContent);
        });
    }

    sectionHasContent(section) {
        const inputs = section.querySelectorAll('input, textarea');
        for (const input of inputs) {
            if (input.value && input.value.trim() !== '') {
                return true;
            }
        }
        return false;
    }

    showNotification(message, type = 'info') {
        // Remove existing notification
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        // Show notification
        setTimeout(() => notification.classList.add('show'), 10);

        // Hide after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize enhancements
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.builderEnhancements = new BuilderEnhancements();
    });
} else {
    window.builderEnhancements = new BuilderEnhancements();
}
