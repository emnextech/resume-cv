// CV Form Management
class CVFormManager {
    constructor() {
        this.data = this.getDefaultData();
        this.selectedIndustry = '';
        this.selectedSkills = [];
        this.init();
    }

    // Industry-specific skills data
    getIndustrySkills() {
        return {
            it: [
                'Python', 'JavaScript', 'Java', 'C++', 'C#', 'React', 'Node.js', 'Angular', 'Vue.js',
                'SQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Git', 'Docker', 'Kubernetes', 'AWS',
                'Azure', 'Linux', 'Windows Server', 'Networking', 'Cybersecurity', 'UI/UX Design',
                'Agile', 'Scrum', 'DevOps', 'CI/CD', 'REST APIs', 'GraphQL', 'Machine Learning',
                'Data Science', 'Cloud Computing', 'System Administration', 'Database Management'
            ],
            business: [
                'Project Management', 'Strategic Planning', 'Business Analysis', 'Financial Analysis',
                'Market Research', 'Sales', 'Marketing', 'Customer Relations', 'Negotiation',
                'Leadership', 'Team Management', 'Budget Management', 'Risk Management',
                'Data Analysis', 'Excel', 'PowerPoint', 'Business Writing', 'Public Speaking',
                'Stakeholder Management', 'Process Improvement', 'Change Management', 'CRM',
                'ERP Systems', 'Supply Chain Management', 'Operations Management', 'Consulting',
                'Business Development', 'Partnership Development', 'Vendor Management'
            ],
            education: [
                'Curriculum Development', 'Lesson Planning', 'Classroom Management', 'Student Assessment',
                'Educational Technology', 'E-Learning', 'Pedagogy', 'Differentiated Instruction',
                'Special Education', 'Educational Research', 'Academic Writing', 'Research Methods',
                'Student Counseling', 'Parent Communication', 'Educational Leadership', 'Training & Development',
                'Instructional Design', 'Learning Management Systems', 'Educational Psychology',
                'Assessment Design', 'Program Evaluation', 'Grant Writing', 'Educational Policy'
            ],
            engineering: [
                'AutoCAD', 'SolidWorks', 'MATLAB', 'ANSYS', 'Project Management', 'Systems Engineering',
                'Mechanical Design', 'Electrical Engineering', 'Civil Engineering', 'Structural Analysis',
                'CAD/CAM', '3D Modeling', 'Prototyping', 'Quality Control', 'Manufacturing Processes',
                'Materials Science', 'Thermodynamics', 'Fluid Mechanics', 'Control Systems',
                'PLC Programming', 'HVAC Design', 'Building Information Modeling (BIM)', 'Risk Assessment',
                'Technical Writing', 'Engineering Standards', 'Product Development', 'Testing & Validation'
            ],
            health: [
                'Patient Care', 'Medical Records', 'HIPAA Compliance', 'Clinical Documentation',
                'Electronic Health Records (EHR)', 'Medical Terminology', 'Phlebotomy', 'Vital Signs',
                'CPR', 'First Aid', 'Medication Administration', 'Patient Assessment', 'Care Planning',
                'Health Education', 'Public Health', 'Epidemiology', 'Health Informatics',
                'Medical Billing', 'Medical Coding', 'Healthcare Administration', 'Telemedicine',
                'Medical Research', 'Clinical Trials', 'Health Policy', 'Healthcare Quality'
            ],
            hospitality: [
                'Customer Service', 'Guest Relations', 'Event Planning', 'Hotel Management',
                'Restaurant Management', 'Food & Beverage', 'Front Office Operations', 'Housekeeping',
                'Revenue Management', 'Reservation Systems', 'Tourism', 'Travel Planning',
                'Catering', 'Banquet Management', 'Hospitality Marketing', 'Quality Assurance',
                'Staff Training', 'Inventory Management', 'Point of Sale (POS)', 'Hospitality Software',
                'Concierge Services', 'Spa Management', 'Entertainment Management', 'Hospitality Sales'
            ]
        };
    }

    getDefaultData() {
        return {
            name: '',
            email: '',
            phone: '',
            address: '',
            website: '',
            summary: '',
            education: [{ year: '', level: '', school: '', qualification: '' }],
            work: [{ title: '', company: '', period: '', description: '' }],
            research: [{ title: '', institution: '', period: '', description: '' }],
            publications: [{ title: '', venue: '', year: '' }],
            certifications: [{ name: '', issuer: '', year: '' }],
            conferences: [{ name: '', location: '', year: '' }],
            achievements: [{ description: '' }],
            projects: [{ name: '', tech: '', description: '' }],
            skills: [],
            references: [{ name: '', position: '', phone: '', email: '' }]
        };
    }

    init() {
        // Bind input events
        this.bindInputs();
        // Bind add buttons
        this.bindAddButtons();
        // Initialize skills selector
        this.initSkillsSelector();
        // Load fake data initially
        this.loadFakeData();
        // Ensure at least one education row exists after loading data
        this.ensureEducationRow();
    }

    initSkillsSelector() {
        const industrySelect = document.getElementById('cv-industry-select');
        if (!industrySelect) return;

        industrySelect.addEventListener('change', (e) => {
            this.selectedIndustry = e.target.value;
            this.loadSkillsForIndustry(this.selectedIndustry);
        });
    }

    loadSkillsForIndustry(industry) {
        const skillsContainer = document.getElementById('cv-skills-container');
        const checkboxesContainer = document.getElementById('cv-skills-checkboxes');
        
        if (!skillsContainer || !checkboxesContainer) return;

        if (!industry) {
            skillsContainer.style.display = 'none';
            return;
        }

        const industrySkills = this.getIndustrySkills()[industry] || [];
        checkboxesContainer.innerHTML = '';

        industrySkills.forEach(skill => {
            const label = document.createElement('label');
            label.className = 'skill-checkbox-label';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = skill;
            checkbox.className = 'skill-checkbox';
            
            // Check if this skill is already selected
            if (this.selectedSkills.includes(skill)) {
                checkbox.checked = true;
            }
            
            checkbox.addEventListener('change', (e) => {
                this.handleSkillToggle(skill, e.target.checked);
            });
            
            const span = document.createElement('span');
            span.textContent = skill;
            
            label.appendChild(checkbox);
            label.appendChild(span);
            checkboxesContainer.appendChild(label);
        });

        skillsContainer.style.display = 'block';
        this.updateSelectedSkillsDisplay();
    }

    handleSkillToggle(skill, isChecked) {
        if (isChecked) {
            if (!this.selectedSkills.includes(skill)) {
                this.selectedSkills.push(skill);
            }
        } else {
            this.selectedSkills = this.selectedSkills.filter(s => s !== skill);
        }
        
        this.data.skills = [...this.selectedSkills];
        this.updateSelectedSkillsDisplay();
        
        if (window.previewManager) {
            window.previewManager.updatePreview();
        }
    }

    updateSelectedSkillsDisplay() {
        const displayContainer = document.getElementById('cv-selected-skills-display');
        const skillsList = document.getElementById('cv-selected-skills-list');
        
        if (!displayContainer || !skillsList) return;

        if (this.selectedSkills.length === 0) {
            displayContainer.style.display = 'none';
            return;
        }

        displayContainer.style.display = 'block';
        skillsList.innerHTML = '';
        
        this.selectedSkills.forEach(skill => {
            const skillTag = document.createElement('span');
            skillTag.className = 'selected-skill-tag';
            skillTag.textContent = skill;
            
            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.className = 'remove-skill-btn';
            removeBtn.innerHTML = '×';
            removeBtn.setAttribute('aria-label', `Remove ${skill}`);
            removeBtn.addEventListener('click', () => {
                this.removeSkill(skill);
            });
            
            skillTag.appendChild(removeBtn);
            skillsList.appendChild(skillTag);
        });
    }

    removeSkill(skill) {
        this.selectedSkills = this.selectedSkills.filter(s => s !== skill);
        this.data.skills = [...this.selectedSkills];
        
        // Uncheck the checkbox if it exists
        const checkbox = document.querySelector(`#cv-skills-checkboxes input[value="${skill}"]`);
        if (checkbox) {
            checkbox.checked = false;
        }
        
        this.updateSelectedSkillsDisplay();
        
        if (window.previewManager) {
            window.previewManager.updatePreview();
        }
    }

    ensureEducationRow() {
        const container = document.getElementById('cv-education-container');
        if (container && container.children.length === 0) {
            this.addEducationRow();
        }
    }

    loadFakeData() {
        // Set fake placeholder data
        const fakeData = {
            name: 'John Banda',
            email: 'john.banda@email.com',
            phone: '+123 456 7890',
            address: '123 Main St, City, Country',
            website: 'www.johnbanda.com',
            summary: 'Motivated IT specialist with 4+ years of experience in software development and system administration. Proven track record of delivering high-quality solutions and leading cross-functional teams.',
            education: [
                { year: '2015-2017', level: 'Tertiary', school: 'Rockview University', qualification: 'Diploma in Computer Science' },
                { year: '2010-2014', level: 'Grade 12', school: 'Central High School', qualification: 'Certificate' }
            ],
            work: [
                { title: 'Junior Developer', company: 'TechLabs Inc.', period: '2021-2023', description: 'Developed and maintained web applications using Python and React. Collaborated with senior developers on system architecture improvements.' },
                { title: 'Software Intern', company: 'StartupCorp', period: '2020-2021', description: 'Assisted in developing REST APIs and database management systems. Participated in code reviews and agile ceremonies.' }
            ],
            research: [
                { title: 'Deep Learning Applications', institution: 'Research Institute', period: '2019-2020', description: 'Research on applying deep learning techniques to medical image analysis.' }
            ],
            publications: [
                { title: 'Optimizing Neural Networks for Real-Time Processing', venue: 'IEEE Conference 2020', year: '2020' }
            ],
            certifications: [
                { name: 'AWS Certified Developer', issuer: 'Amazon Web Services', year: '2022' },
                { name: 'Certified Python Developer', issuer: 'Python Institute', year: '2021' }
            ],
            conferences: [
                { name: 'Tech Conference 2023', location: 'San Francisco, USA', year: '2023' },
                { name: 'AI Workshop 2022', location: 'Online', year: '2022' }
            ],
            achievements: [
                { description: 'Winner of National Coding Competition 2022' },
                { description: 'Published 3 research papers in peer-reviewed journals' }
            ],
            projects: [
                { name: 'E-Commerce Platform', tech: 'Python, Django, React, PostgreSQL', description: 'Full-stack e-commerce solution with payment integration and inventory management.' },
                { name: 'Machine Learning API', tech: 'Python, Flask, TensorFlow', description: 'RESTful API for image classification using deep learning models.' }
            ],
            skills: ['Python', 'JavaScript', 'React', 'Node.js', 'Networking', 'UI Design', 'Database Management', 'Git', 'Docker', 'AWS'],
            references: [
                { name: 'Dr. Sarah Johnson', position: 'Senior Software Engineer', phone: '+1 234 567 8900', email: 'sarah.johnson@email.com' },
                { name: 'Prof. Michael Chen', position: 'Professor of Computer Science', phone: '+1 234 567 8901', email: 'michael.chen@university.edu' }
            ]
        };

        // Populate form with fake data
        Object.keys(fakeData).forEach(key => {
            if (key === 'name') document.getElementById('cv-name').value = fakeData[key];
            else if (key === 'email') document.getElementById('cv-email').value = fakeData[key];
            else if (key === 'phone') document.getElementById('cv-phone').value = fakeData[key];
            else if (key === 'address') document.getElementById('cv-address').value = fakeData[key];
            else if (key === 'website') document.getElementById('cv-website').value = fakeData[key];
            else if (key === 'summary') document.getElementById('cv-summary').value = fakeData[key];
            else if (key === 'skills') {
                // Handle skills array - set IT industry and select skills
                this.selectedSkills = [...fakeData[key]];
                this.data.skills = [...fakeData[key]];
                const industrySelect = document.getElementById('cv-industry-select');
                if (industrySelect) {
                    industrySelect.value = 'it';
                    this.selectedIndustry = 'it';
                    this.loadSkillsForIndustry('it');
                }
            }
            else if (Array.isArray(fakeData[key])) {
                this.populateArrayField(key, fakeData[key]);
            }
        });

        // Update data object
        this.data = fakeData;
    }

    populateArrayField(fieldName, items) {
        const container = document.getElementById(`cv-${fieldName}-container`);
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
        // Single field inputs (skills is now handled separately)
        const singleFields = ['name', 'email', 'phone', 'address', 'website', 'summary'];
        singleFields.forEach(field => {
            const element = document.getElementById(`cv-${field}`);
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
        const cvSection = document.getElementById('cv-section');
        if (!cvSection) return; // Section doesn't exist (e.g., on resume builder page)
        
        // Store reference for bindAddButtons
        this.cvSection = cvSection;
        
        cvSection.addEventListener('input', (e) => {
            const field = e.target.getAttribute('data-field');
            if (!field) return;

            // Check if it's an education table input
            const tableRow = e.target.closest('tr');
            if (tableRow && e.target.closest('#cv-education-container')) {
                const container = document.getElementById('cv-education-container');
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
            const fieldType = container.id.replace('cv-', '').replace('-container', '');

            if (this.data[fieldType] && this.data[fieldType][index]) {
                this.data[fieldType][index][field] = e.target.value;
                if (window.previewManager) {
                    window.previewManager.updatePreview();
                }
            }
        });
    }

    bindAddButtons() {
        if (!this.cvSection) return; // Section doesn't exist
        this.cvSection.addEventListener('click', (e) => {
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
        const container = document.getElementById(`cv-${fieldType}-container`);
        if (!container) return;

        const entryDiv = document.createElement('div');
        entryDiv.className = 'entry-item';

        let fields = [];
        if (fieldType === 'education') {
            // Education is now handled as a table, not entry-item
            return this.addEducationRow(data);
        } else if (fieldType === 'work') {
            fields = [
                { field: 'title', type: 'text', placeholder: 'Job Title' },
                { field: 'company', type: 'text', placeholder: 'Company' },
                { field: 'period', type: 'text', placeholder: 'Period (e.g., 2020-2023)' },
                { field: 'description', type: 'textarea', placeholder: 'Description', rows: 3 }
            ];
        } else if (fieldType === 'research') {
            fields = [
                { field: 'title', type: 'text', placeholder: 'Research Title' },
                { field: 'institution', type: 'text', placeholder: 'Institution' },
                { field: 'period', type: 'text', placeholder: 'Period' },
                { field: 'description', type: 'textarea', placeholder: 'Description', rows: 3 }
            ];
        } else if (fieldType === 'publications') {
            fields = [
                { field: 'title', type: 'text', placeholder: 'Publication Title' },
                { field: 'venue', type: 'text', placeholder: 'Journal/Conference' },
                { field: 'year', type: 'text', placeholder: 'Year' }
            ];
        } else if (fieldType === 'certifications') {
            fields = [
                { field: 'name', type: 'text', placeholder: 'Certification Name' },
                { field: 'issuer', type: 'text', placeholder: 'Issuing Organization' },
                { field: 'year', type: 'text', placeholder: 'Year' }
            ];
        } else if (fieldType === 'conferences') {
            fields = [
                { field: 'name', type: 'text', placeholder: 'Event Name' },
                { field: 'location', type: 'text', placeholder: 'Location' },
                { field: 'year', type: 'text', placeholder: 'Year' }
            ];
        } else if (fieldType === 'achievements') {
            fields = [
                { field: 'description', type: 'textarea', placeholder: 'Achievement description', rows: 2 }
            ];
        } else if (fieldType === 'projects') {
            fields = [
                { field: 'name', type: 'text', placeholder: 'Project Name' },
                { field: 'tech', type: 'text', placeholder: 'Technologies Used' },
                { field: 'description', type: 'textarea', placeholder: 'Description', rows: 3 }
            ];
        } else if (fieldType === 'references') {
            fields = [
                { field: 'name', type: 'text', placeholder: 'Name' },
                { field: 'position', type: 'text', placeholder: 'Position' },
                { field: 'phone', type: 'tel', placeholder: 'Phone Number' },
                { field: 'email', type: 'email', placeholder: 'Email (Optional)' }
            ];
        }

        fields.forEach(f => {
            if (f.type === 'textarea') {
                const textarea = document.createElement('textarea');
                textarea.className = 'entry-field';
                textarea.setAttribute('data-field', f.field);
                textarea.placeholder = f.placeholder;
                textarea.rows = f.rows || 2;
                if (data && data[f.field]) textarea.value = data[f.field];
                entryDiv.appendChild(textarea);
            } else {
                const input = document.createElement('input');
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
        const container = document.getElementById('cv-education-container');
        if (!container) return;

        const row = document.createElement('tr');
        
        // Year field
        const yearCell = document.createElement('td');
        const yearInput = document.createElement('input');
        yearInput.type = 'text';
        yearInput.setAttribute('data-field', 'year');
        yearInput.placeholder = 'e.g., 2015-2017';
        if (data && data.year) yearInput.value = data.year;
        yearCell.appendChild(yearInput);
        row.appendChild(yearCell);

        // Level field
        const levelCell = document.createElement('td');
        const levelInput = document.createElement('input');
        levelInput.type = 'text';
        levelInput.setAttribute('data-field', 'level');
        levelInput.placeholder = 'e.g., Grade 12, Tertiary, Bachelor';
        if (data && data.level) levelInput.value = data.level;
        levelCell.appendChild(levelInput);
        row.appendChild(levelCell);

        // School field
        const schoolCell = document.createElement('td');
        const schoolInput = document.createElement('input');
        schoolInput.type = 'text';
        schoolInput.setAttribute('data-field', 'school');
        schoolInput.placeholder = 'e.g., Rockview University';
        if (data && data.school) schoolInput.value = data.school;
        schoolCell.appendChild(schoolInput);
        row.appendChild(schoolCell);

        // Qualification field
        const qualificationCell = document.createElement('td');
        const qualificationInput = document.createElement('input');
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
        const fieldType = container.id.replace('cv-', '').replace('-container', '');
        
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
        window.cvFormManager = new CVFormManager();
    });
} else {
    window.cvFormManager = new CVFormManager();
}

