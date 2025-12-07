// Résumé Form Management
class ResumeFormManager {
    constructor() {
        this.data = this.getDefaultData();
        this.init();
    }

    getDefaultData() {
        return {
            name: '',
            email: '',
            phone: '',
            location: '',
            linkedin: '',
            summary: '',
            skills: '',
            work: [{ title: '', company: '', period: '', achievements: '' }],
            projects: [{ name: '', tech: '', description: '' }],
            education: [{ year: '', level: '', school: '', qualification: '' }],
            certifications: [{ name: '', year: '' }]
        };
    }

    init() {
        // Bind input events
        this.bindInputs();
        // Bind add buttons
        this.bindAddButtons();
        // Load fake data initially
        this.loadFakeData();
        // Ensure at least one education row exists after loading data
        this.ensureEducationRow();
    }

    ensureEducationRow() {
        const container = document.getElementById('resume-education-container');
        if (container && container.children.length === 0) {
            this.addEducationRow();
        }
    }

    loadFakeData() {
        // Set fake placeholder data
        const fakeData = {
            name: 'Sarah Johnson',
            email: 'sarah.j@email.com',
            phone: '+1 (555) 123-4567',
            location: 'New York, NY',
            linkedin: 'linkedin.com/in/sarahjohnson',
            summary: 'Results-driven software engineer with 3+ years of experience building scalable web applications. Passionate about clean code and user experience.',
            skills: 'JavaScript, React, Node.js, Python, AWS, Docker, Git, Agile Methodologies',
            work: [
                { title: 'Software Engineer', company: 'TechStart Inc.', period: '2021-Present', achievements: '• Led development of customer portal resulting in 30% increase in user engagement\n• Implemented CI/CD pipeline reducing deployment time by 50%\n• Mentored 2 junior developers' },
                { title: 'Junior Developer', company: 'WebSolutions Ltd.', period: '2019-2021', achievements: '• Developed RESTful APIs serving 100K+ requests daily\n• Improved application performance by 40% through code optimization' }
            ],
            projects: [
                { name: 'Task Management App', tech: 'React, Node.js, MongoDB', description: 'Full-stack application for team collaboration with real-time updates and notifications.' },
                { name: 'E-Commerce Dashboard', tech: 'Vue.js, Python, PostgreSQL', description: 'Analytics dashboard for tracking sales and inventory with interactive charts.' }
            ],
            education: [
                { year: '2015-2019', level: 'Bachelor', school: 'State University', qualification: 'B.S. Computer Science' },
                { year: '2011-2015', level: 'High School', school: 'Central High School', qualification: 'Diploma' }
            ],
            certifications: [
                { name: 'AWS Solutions Architect', year: '2022' },
                { name: 'React Developer Certification', year: '2021' }
            ]
        };

        // Populate form with fake data
        Object.keys(fakeData).forEach(key => {
            if (key === 'name') document.getElementById('resume-name').value = fakeData[key];
            else if (key === 'email') document.getElementById('resume-email').value = fakeData[key];
            else if (key === 'phone') document.getElementById('resume-phone').value = fakeData[key];
            else if (key === 'location') document.getElementById('resume-location').value = fakeData[key];
            else if (key === 'linkedin') document.getElementById('resume-linkedin').value = fakeData[key];
            else if (key === 'summary') document.getElementById('resume-summary').value = fakeData[key];
            else if (key === 'skills') document.getElementById('resume-skills').value = fakeData[key];
            else if (Array.isArray(fakeData[key])) {
                this.populateArrayField(key, fakeData[key]);
            }
        });

        // Update data object
        this.data = fakeData;
    }

    populateArrayField(fieldName, items) {
        const container = document.getElementById(`resume-${fieldName}-container`);
        if (!container) return;

        container.innerHTML = '';
        if (fieldName === 'education') {
            items.forEach(item => {
                this.addEducationRow(item);
            });
        } else {
            items.forEach(item => {
                this.addEntryItem(fieldName, item);
            });
        }
    }

    bindInputs() {
        // Single field inputs
        const singleFields = ['name', 'email', 'phone', 'location', 'linkedin', 'summary', 'skills'];
        singleFields.forEach(field => {
            const element = document.getElementById(`resume-${field}`);
            if (element) {
                element.addEventListener('input', (e) => {
                    this.data[field] = e.target.value;
                    if (window.previewManager) {
                        window.previewManager.updatePreview();
                    }
                });
            }
        });

        // Array field inputs - use event delegation
        const resumeSection = document.getElementById('resume-section');
        if (!resumeSection) return; // Section doesn't exist (e.g., on CV builder page)
        
        // Store reference for bindAddButtons
        this.resumeSection = resumeSection;
        
        resumeSection.addEventListener('input', (e) => {
            const field = e.target.getAttribute('data-field');
            if (!field) return;

            // Check if it's an education table input
            const tableRow = e.target.closest('tr');
            if (tableRow && e.target.closest('#resume-education-container')) {
                const container = document.getElementById('resume-education-container');
                const index = Array.from(container.children).indexOf(tableRow);
                if (this.data.education && this.data.education[index]) {
                    this.data.education[index][field] = e.target.value;
                    if (window.previewManager) {
                        window.previewManager.updatePreview();
                    }
                }
                return;
            }

            // Handle regular entry-items
            const entryItem = e.target.closest('.entry-item');
            if (!entryItem) return;

            const container = entryItem.parentElement;
            const index = Array.from(container.children).indexOf(entryItem);
            const fieldType = container.id.replace('resume-', '').replace('-container', '');

            if (this.data[fieldType] && this.data[fieldType][index]) {
                this.data[fieldType][index][field] = e.target.value;
                if (window.previewManager) {
                    window.previewManager.updatePreview();
                }
            }
        });
    }

    bindAddButtons() {
        if (!this.resumeSection) return; // Section doesn't exist
        this.resumeSection.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-btn')) {
                const fieldType = e.target.getAttribute('data-add');
                this.addEntryItem(fieldType);
            } else if (e.target.classList.contains('remove-btn')) {
                const entryItem = e.target.closest('.entry-item');
                if (entryItem) {
                    this.handleRemoveEntry(entryItem);
                }
            }
        });
    }

    addEntryItem(fieldType, data = null) {
        const container = document.getElementById(`resume-${fieldType}-container`);
        if (!container) return;

        const entryDiv = document.createElement('div');
        entryDiv.className = 'entry-item';

        // Generate unique index for this entry
        const entryIndex = container.children.length;
        const timestamp = Date.now();
        const uniqueId = `resume-${fieldType}-${entryIndex}-${timestamp}`;

        let fields = [];
        if (fieldType === 'education') {
            // Education is now handled as a table, not entry-item
            return this.addEducationRow(data);
        } else if (fieldType === 'work') {
            fields = [
                { field: 'title', type: 'text', placeholder: 'Job Title' },
                { field: 'company', type: 'text', placeholder: 'Company' },
                { field: 'period', type: 'text', placeholder: 'Period' },
                { field: 'achievements', type: 'textarea', placeholder: 'Key achievements (bullet points)', rows: 2 }
            ];
        } else if (fieldType === 'projects') {
            fields = [
                { field: 'name', type: 'text', placeholder: 'Project Name' },
                { field: 'tech', type: 'text', placeholder: 'Technologies' },
                { field: 'description', type: 'textarea', placeholder: 'Brief description', rows: 2 }
            ];
        } else if (fieldType === 'certifications') {
            fields = [
                { field: 'name', type: 'text', placeholder: 'Certification' },
                { field: 'year', type: 'text', placeholder: 'Year' }
            ];
        }

        fields.forEach(f => {
            const fieldId = `${uniqueId}-${f.field}`;
            const fieldName = `${fieldType}[${entryIndex}][${f.field}]`;
            
            if (f.type === 'textarea') {
                const textarea = document.createElement('textarea');
                textarea.id = fieldId;
                textarea.name = fieldName;
                textarea.className = 'entry-field';
                textarea.setAttribute('data-field', f.field);
                textarea.placeholder = f.placeholder;
                textarea.rows = f.rows || 2;
                if (data && data[f.field]) textarea.value = data[f.field];
                entryDiv.appendChild(textarea);
            } else {
                const input = document.createElement('input');
                input.id = fieldId;
                input.name = fieldName;
                input.type = f.type || 'text';
                input.className = 'entry-field';
                input.setAttribute('data-field', f.field);
                input.placeholder = f.placeholder;
                if (data && data[f.field]) input.value = data[f.field];
                entryDiv.appendChild(input);
            }
        });

        if (container.children.length > 0) {
            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.className = 'remove-btn';
            removeBtn.textContent = 'Remove';
            entryDiv.appendChild(removeBtn);
        }

        container.appendChild(entryDiv);

        // Update data object
        if (!this.data[fieldType]) {
            this.data[fieldType] = [];
        }
        const newItem = {};
        fields.forEach(f => {
            newItem[f.field] = data ? (data[f.field] || '') : '';
        });
        this.data[fieldType].push(newItem);
    }

    addEducationRow(data = null) {
        const container = document.getElementById('resume-education-container');
        if (!container) return;

        const row = document.createElement('tr');
        
        // Generate unique index for this row
        const rowIndex = container.children.length;
        const timestamp = Date.now();
        const uniqueId = `resume-education-${rowIndex}-${timestamp}`;
        
        // Year field
        const yearCell = document.createElement('td');
        const yearInput = document.createElement('input');
        yearInput.id = `${uniqueId}-year`;
        yearInput.name = `education[${rowIndex}][year]`;
        yearInput.type = 'text';
        yearInput.setAttribute('data-field', 'year');
        yearInput.placeholder = 'e.g., 2015-2017';
        if (data && data.year) yearInput.value = data.year;
        yearCell.appendChild(yearInput);
        row.appendChild(yearCell);

        // Level field
        const levelCell = document.createElement('td');
        const levelInput = document.createElement('input');
        levelInput.id = `${uniqueId}-level`;
        levelInput.name = `education[${rowIndex}][level]`;
        levelInput.type = 'text';
        levelInput.setAttribute('data-field', 'level');
        levelInput.placeholder = 'e.g., Grade 12, Tertiary, Bachelor';
        if (data && data.level) levelInput.value = data.level;
        levelCell.appendChild(levelInput);
        row.appendChild(levelCell);

        // School field
        const schoolCell = document.createElement('td');
        const schoolInput = document.createElement('input');
        schoolInput.id = `${uniqueId}-school`;
        schoolInput.name = `education[${rowIndex}][school]`;
        schoolInput.type = 'text';
        schoolInput.setAttribute('data-field', 'school');
        schoolInput.placeholder = 'e.g., Rockview University';
        if (data && data.school) schoolInput.value = data.school;
        schoolCell.appendChild(schoolInput);
        row.appendChild(schoolCell);

        // Qualification field
        const qualificationCell = document.createElement('td');
        const qualificationInput = document.createElement('input');
        qualificationInput.id = `${uniqueId}-qualification`;
        qualificationInput.name = `education[${rowIndex}][qualification]`;
        qualificationInput.type = 'text';
        qualificationInput.setAttribute('data-field', 'qualification');
        qualificationInput.placeholder = 'e.g., Certificate, Diploma';
        if (data && data.qualification) qualificationInput.value = data.qualification;
        qualificationCell.appendChild(qualificationInput);
        row.appendChild(qualificationCell);

        // Remove button cell
        const actionCell = document.createElement('td');
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'table-remove-btn';
        removeBtn.textContent = 'Remove';
        removeBtn.addEventListener('click', async () => {
            const index = Array.from(container.children).indexOf(row);
            if (this.data.education && this.data.education.length > 1) {
                const confirmed = await window.uxEnhancements?.showConfirmationDialog(
                    'Are you sure you want to remove this education entry?',
                    'Remove Entry'
                );
                if (!confirmed) return;

                this.data.education.splice(index, 1);
                row.remove();
                if (window.previewManager) {
                    window.previewManager.updatePreview();
                }
                // Save state for undo
                if (window.uxEnhancements) {
                    setTimeout(() => window.uxEnhancements.saveState(), 100);
                }
            } else if (this.data.education && this.data.education.length === 1) {
                // Keep at least one row, just clear it
                this.data.education[0] = { year: '', level: '', school: '', qualification: '' };
                yearInput.value = '';
                levelInput.value = '';
                schoolInput.value = '';
                qualificationInput.value = '';
                if (window.previewManager) {
                    window.previewManager.updatePreview();
                }
            }
        });
        actionCell.appendChild(removeBtn);
        row.appendChild(actionCell);

        container.appendChild(row);

        // Update data object
        if (!this.data.education) {
            this.data.education = [];
        }
        const newItem = {
            year: data ? (data.year || '') : '',
            level: data ? (data.level || '') : '',
            school: data ? (data.school || '') : '',
            qualification: data ? (data.qualification || '') : ''
        };
        this.data.education.push(newItem);

        // Bind input events for this row
        [yearInput, levelInput, schoolInput, qualificationInput].forEach(input => {
            input.addEventListener('input', (e) => {
                const field = e.target.getAttribute('data-field');
                const rowIndex = Array.from(container.children).indexOf(row);
                if (this.data.education && this.data.education[rowIndex]) {
                    this.data.education[rowIndex][field] = e.target.value;
                    if (window.previewManager) {
                        window.previewManager.updatePreview();
                    }
                }
            });
        });
    }

    async handleRemoveEntry(entryItem) {
        const confirmed = await window.uxEnhancements?.showConfirmationDialog(
            'Are you sure you want to remove this entry?',
            'Remove Entry'
        );
        if (!confirmed) return;

        const container = entryItem.parentElement;
        const index = Array.from(container.children).indexOf(entryItem);
        const fieldType = container.id.replace('resume-', '').replace('-container', '');
        
        if (this.data[fieldType] && this.data[fieldType].length > 1) {
            this.data[fieldType].splice(index, 1);
            entryItem.remove();
            if (window.previewManager) {
                window.previewManager.updatePreview();
            }
            // Save state for undo
            if (window.uxEnhancements) {
                setTimeout(() => window.uxEnhancements.saveState(), 100);
            }
        }
    }

    getData() {
        return this.data;
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.resumeFormManager = new ResumeFormManager();
    });
} else {
    window.resumeFormManager = new ResumeFormManager();
}

