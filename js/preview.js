// Preview Manager with Fake Placeholder Data
class PreviewManager {
    constructor() {
        this.currentTemplate = 'modern';
        this.currentColor = 'optimism-blue';
        this.currentFont = 'system';
        this.init();
    }

    init() {
        // Template selector
        const templateSelect = document.getElementById('template-select');
        if (templateSelect) {
            templateSelect.addEventListener('change', (e) => {
                this.currentTemplate = e.target.value;
                this.updatePreview();
            });
        }

        // Color selector
        const colorSelect = document.getElementById('color-select');
        if (colorSelect) {
            colorSelect.addEventListener('change', (e) => {
                this.currentColor = e.target.value;
                this.updatePreview();
            });
        }

        // Font selector
        const fontSelect = document.getElementById('font-select');
        if (fontSelect) {
            fontSelect.addEventListener('change', (e) => {
                this.currentFont = e.target.value;
                this.updatePreview();
            });
        }

        // Initial preview update
        this.updatePreview();
    }

    getCurrentData() {
        const currentTab = window.tabManager ? window.tabManager.getCurrentTab() : 'cv';
        if (currentTab === 'cv') {
            return window.cvFormManager ? window.cvFormManager.getData() : {};
        } else {
            return window.resumeFormManager ? window.resumeFormManager.getData() : {};
        }
    }

    isFieldEmpty(value) {
        return !value || value.trim() === '';
    }

    getPlaceholderData(type) {
        if (type === 'cv') {
            return {
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
                    { title: 'Junior Developer', company: 'TechLabs Inc.', period: '2021-2023', description: 'Developed and maintained web applications using Python and React.' }
                ],
                research: [
                    { title: 'Deep Learning Applications', institution: 'Research Institute', period: '2019-2020', description: 'Research on applying deep learning techniques to medical image analysis.' }
                ],
                publications: [
                    { title: 'Optimizing Neural Networks', venue: 'IEEE Conference 2020', year: '2020' }
                ],
                certifications: [
                    { name: 'AWS Certified Developer', issuer: 'Amazon Web Services', year: '2022' }
                ],
                conferences: [
                    { name: 'Tech Conference 2023', location: 'San Francisco, USA', year: '2023' }
                ],
                achievements: [
                    { description: 'Winner of National Coding Competition 2022' }
                ],
                projects: [
                    { name: 'E-Commerce Platform', tech: 'Python, Django, React', description: 'Full-stack e-commerce solution with payment integration.' }
                ],
                skills: 'Python, JavaScript, React, Node.js, Networking, UI Design'
            };
        } else {
            return {
                name: 'Sarah Johnson',
                email: 'sarah.j@email.com',
                phone: '+1 (555) 123-4567',
                location: 'New York, NY',
                linkedin: 'linkedin.com/in/sarahjohnson',
                summary: 'Results-driven software engineer with 3+ years of experience building scalable web applications. Passionate about clean code and user experience.',
                skills: 'JavaScript, React, Node.js, Python, AWS, Docker, Git',
                work: [
                    { title: 'Software Engineer', company: 'TechStart Inc.', period: '2021-Present', achievements: '• Led development of customer portal\n• Implemented CI/CD pipeline\n• Mentored 2 junior developers' }
                ],
                projects: [
                    { name: 'Task Management App', tech: 'React, Node.js, MongoDB', description: 'Full-stack application for team collaboration.' }
                ],
                education: [
                    { year: '2015-2019', level: 'Bachelor', school: 'State University', qualification: 'B.S. Computer Science' },
                    { year: '2011-2015', level: 'High School', school: 'Central High School', qualification: 'Diploma' }
                ],
                certifications: [
                    { name: 'AWS Solutions Architect', year: '2022' }
                ]
            };
        }
    }

    getValue(field, data, placeholderData, isPlaceholder = false) {
        const value = data[field] || '';
        const isEmpty = this.isFieldEmpty(value);
        
        if (isEmpty && isPlaceholder) {
            return placeholderData[field] || '';
        }
        return isEmpty ? '' : value;
    }

    getArrayValue(array, placeholderArray, isPlaceholder = false) {
        if (!array || array.length === 0) {
            return isPlaceholder ? placeholderArray : [];
        }
        
        // Filter out empty entries
        const filtered = array.filter(item => {
            return Object.values(item).some(val => val && val.trim() !== '');
        });
        
        if (filtered.length === 0 && isPlaceholder) {
            return placeholderArray;
        }
        
        return filtered;
    }

    updatePreview() {
        const previewContent = document.getElementById('preview-content');
        if (!previewContent) return;

        const currentTab = window.tabManager ? window.tabManager.getCurrentTab() : 'cv';
        const data = this.getCurrentData();
        const placeholderData = this.getPlaceholderData(currentTab);

        // Clear and set template, color, and font classes
        previewContent.className = `preview-content template-${this.currentTemplate} color-${this.currentColor} font-${this.currentFont}`;
        
        // Apply color as CSS variable
        this.applyColor(previewContent);
        
        // Apply font
        this.applyFont(previewContent);

        if (currentTab === 'cv') {
            previewContent.innerHTML = this.renderCV(data, placeholderData);
        } else {
            previewContent.innerHTML = this.renderResume(data, placeholderData);
        }
    }

    applyColor(element) {
        // WCAG AA compliant colors (4.5:1 contrast ratio on white)
        const colorMap = {
            'optimism-blue': '#1a7fa3',
            'blue-algae': '#6bb3a0',
            'flat-grey': '#5a5a5a',
            'classic-blue': '#1e40af',
            'forest-green': '#047857',
            'burgundy': '#7f1d1d',
            'charcoal': '#1f2937',
            'navy': '#1e3a8a'
        };
        
        const selectedColor = colorMap[this.currentColor] || colorMap['optimism-blue'];
        element.style.setProperty('--accent-color', selectedColor);
    }

    applyFont(element) {
        const fontMap = {
            'system': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
            'serif': '"Times New Roman", Times, serif',
            'sans-serif': 'Arial, Helvetica, sans-serif',
            'modern': '"Roboto", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            'classic': 'Georgia, "Times New Roman", serif',
            'monospace': '"Courier New", Courier, monospace'
        };
        
        const selectedFont = fontMap[this.currentFont] || fontMap['system'];
        element.style.setProperty('--preview-font-family', selectedFont);
        element.style.fontFamily = selectedFont;
    }

    renderCV(data, placeholderData) {
        const name = this.getValue('name', data, placeholderData, true);
        const email = this.getValue('email', data, placeholderData, true);
        const phone = this.getValue('phone', data, placeholderData, true);
        const address = this.getValue('address', data, placeholderData, true);
        const website = this.getValue('website', data, placeholderData, true);
        const summary = this.getValue('summary', data, placeholderData, true);
        const skills = this.getValue('skills', data, placeholderData, true);

        let html = `
            <div class="preview-header-section">
                <div class="preview-name">${name || 'Your Name'}</div>
                <div class="preview-contact">
                    ${email ? email + ' • ' : ''}
                    ${phone ? phone + ' • ' : ''}
                    ${address || ''}
                    ${website ? ' • ' + website : ''}
                </div>
            </div>
        `;

        if (summary) {
            html += `<div class="preview-summary">${this.formatText(summary)}</div>`;
        }

        // Education
        const education = this.getArrayValue(data.education, placeholderData.education, true);
        if (education && education.length > 0) {
            html += '<div class="preview-section-title">Academic Qualifications</div>';
            education.forEach(edu => {
                const year = edu.year || '';
                const level = edu.level || '';
                const school = edu.school || '';
                const qualification = edu.qualification || '';
                
                // Only show if at least one field has content
                if (year || level || school || qualification) {
                    html += `
                        <div class="preview-entry">
                            <div class="preview-entry-title">${qualification || level || 'Education Entry'}</div>
                            <div class="preview-entry-subtitle">
                                ${school ? school : ''}
                                ${year ? (school ? ' • ' : '') + year : ''}
                                ${level && !qualification ? (school || year ? ' • ' : '') + level : ''}
                            </div>
                        </div>
                    `;
                }
            });
        }

        // Work Experience
        const work = this.getArrayValue(data.work, placeholderData.work, true);
        if (work && work.length > 0) {
            html += '<div class="preview-section-title">Work Experience</div>';
            work.forEach(w => {
                html += `
                    <div class="preview-entry">
                        <div class="preview-entry-title">${w.title || ''}</div>
                        <div class="preview-entry-subtitle">${w.company || ''} ${w.period ? '• ' + w.period : ''}</div>
                        ${w.description ? `<div class="preview-entry-details">${this.formatText(w.description)}</div>` : ''}
                    </div>
                `;
            });
        }

        // Research Experience
        const research = this.getArrayValue(data.research, placeholderData.research, true);
        if (research && research.length > 0) {
            html += '<div class="preview-section-title">Research Experience</div>';
            research.forEach(r => {
                html += `
                    <div class="preview-entry">
                        <div class="preview-entry-title">${r.title || ''}</div>
                        <div class="preview-entry-subtitle">${r.institution || ''} ${r.period ? '• ' + r.period : ''}</div>
                        ${r.description ? `<div class="preview-entry-details">${this.formatText(r.description)}</div>` : ''}
                    </div>
                `;
            });
        }

        // Publications
        const publications = this.getArrayValue(data.publications, placeholderData.publications, true);
        if (publications && publications.length > 0) {
            html += '<div class="preview-section-title">Publications</div>';
            publications.forEach(pub => {
                html += `
                    <div class="preview-entry">
                        <div class="preview-entry-title">${pub.title || ''}</div>
                        <div class="preview-entry-subtitle">${pub.venue || ''} ${pub.year ? '• ' + pub.year : ''}</div>
                    </div>
                `;
            });
        }

        // Certifications
        const certifications = this.getArrayValue(data.certifications, placeholderData.certifications, true);
        if (certifications && certifications.length > 0) {
            html += '<div class="preview-section-title">Certifications</div>';
            certifications.forEach(cert => {
                html += `
                    <div class="preview-entry">
                        <div class="preview-entry-title">${cert.name || ''}</div>
                        <div class="preview-entry-subtitle">${cert.issuer || ''} ${cert.year ? '• ' + cert.year : ''}</div>
                    </div>
                `;
            });
        }

        // Conferences
        const conferences = this.getArrayValue(data.conferences, placeholderData.conferences, true);
        if (conferences && conferences.length > 0) {
            html += '<div class="preview-section-title">Conferences / Workshops</div>';
            conferences.forEach(conf => {
                html += `
                    <div class="preview-entry">
                        <div class="preview-entry-title">${conf.name || ''}</div>
                        <div class="preview-entry-subtitle">${conf.location || ''} ${conf.year ? '• ' + conf.year : ''}</div>
                    </div>
                `;
            });
        }

        // Achievements
        const achievements = this.getArrayValue(data.achievements, placeholderData.achievements, true);
        if (achievements && achievements.length > 0) {
            html += '<div class="preview-section-title">Achievements</div>';
            achievements.forEach(ach => {
                html += `
                    <div class="preview-entry">
                        <div class="preview-entry-details">${this.formatText(ach.description || '')}</div>
                    </div>
                `;
            });
        }

        // Projects
        const projects = this.getArrayValue(data.projects, placeholderData.projects, true);
        if (projects && projects.length > 0) {
            html += '<div class="preview-section-title">Projects</div>';
            projects.forEach(proj => {
                html += `
                    <div class="preview-entry">
                        <div class="preview-entry-title">${proj.name || ''}</div>
                        <div class="preview-entry-subtitle">${proj.tech || ''}</div>
                        ${proj.description ? `<div class="preview-entry-details">${this.formatText(proj.description)}</div>` : ''}
                    </div>
                `;
            });
        }

        // Skills
        if (skills) {
            html += '<div class="preview-section-title">Skills</div>';
            const skillsArray = skills.split(/[,\n]/).map(s => s.trim()).filter(s => s);
            html += '<div class="preview-skills">';
            skillsArray.forEach(skill => {
                html += `<span class="preview-skill-item">${skill}</span>`;
            });
            html += '</div>';
        }

        return html;
    }

    renderResume(data, placeholderData) {
        const name = this.getValue('name', data, placeholderData, true);
        const email = this.getValue('email', data, placeholderData, true);
        const phone = this.getValue('phone', data, placeholderData, true);
        const location = this.getValue('location', data, placeholderData, true);
        const linkedin = this.getValue('linkedin', data, placeholderData, true);
        const summary = this.getValue('summary', data, placeholderData, true);
        const skills = this.getValue('skills', data, placeholderData, true);

        let html = `
            <div class="preview-header-section">
                <div class="preview-name">${name || 'Your Name'}</div>
                <div class="preview-contact">
                    ${email ? email + ' • ' : ''}
                    ${phone ? phone + ' • ' : ''}
                    ${location || ''}
                    ${linkedin ? ' • ' + linkedin : ''}
                </div>
            </div>
        `;

        if (summary) {
            html += `<div class="preview-summary">${this.formatText(summary)}</div>`;
        }

        // Skills
        if (skills) {
            html += '<div class="preview-section-title">Key Skills</div>';
            const skillsArray = skills.split(/[,\n]/).map(s => s.trim()).filter(s => s);
            html += '<div class="preview-skills">';
            skillsArray.forEach(skill => {
                html += `<span class="preview-skill-item">${skill}</span>`;
            });
            html += '</div>';
        }

        // Work Experience
        const work = this.getArrayValue(data.work, placeholderData.work, true);
        if (work && work.length > 0) {
            html += '<div class="preview-section-title">Work Experience</div>';
            work.forEach(w => {
                html += `
                    <div class="preview-entry">
                        <div class="preview-entry-title">${w.title || ''}</div>
                        <div class="preview-entry-subtitle">${w.company || ''} ${w.period ? '• ' + w.period : ''}</div>
                        ${w.achievements ? `<div class="preview-entry-details">${this.formatText(w.achievements)}</div>` : ''}
                    </div>
                `;
            });
        }

        // Projects
        const projects = this.getArrayValue(data.projects, placeholderData.projects, true);
        if (projects && projects.length > 0) {
            html += '<div class="preview-section-title">Projects</div>';
            projects.forEach(proj => {
                html += `
                    <div class="preview-entry">
                        <div class="preview-entry-title">${proj.name || ''}</div>
                        <div class="preview-entry-subtitle">${proj.tech || ''}</div>
                        ${proj.description ? `<div class="preview-entry-details">${this.formatText(proj.description)}</div>` : ''}
                    </div>
                `;
            });
        }

        // Education
        const education = this.getArrayValue(data.education, placeholderData.education, true);
        if (education && education.length > 0) {
            html += '<div class="preview-section-title">Academic Qualifications</div>';
            education.forEach(edu => {
                const year = edu.year || '';
                const level = edu.level || '';
                const school = edu.school || '';
                const qualification = edu.qualification || '';
                
                // Only show if at least one field has content
                if (year || level || school || qualification) {
                    html += `
                        <div class="preview-entry">
                            <div class="preview-entry-title">${qualification || level || 'Education Entry'}</div>
                            <div class="preview-entry-subtitle">
                                ${school ? school : ''}
                                ${year ? (school ? ' • ' : '') + year : ''}
                                ${level && !qualification ? (school || year ? ' • ' : '') + level : ''}
                            </div>
                        </div>
                    `;
                }
            });
        }

        // Certifications
        const certifications = this.getArrayValue(data.certifications, placeholderData.certifications, true);
        if (certifications && certifications.length > 0) {
            html += '<div class="preview-section-title">Certifications</div>';
            certifications.forEach(cert => {
                html += `
                    <div class="preview-entry">
                        <div class="preview-entry-title">${cert.name || ''}</div>
                        ${cert.year ? `<div class="preview-entry-subtitle">${cert.year}</div>` : ''}
                    </div>
                `;
            });
        }

        return html;
    }

    formatText(text) {
        if (!text) return '';
        // Convert newlines to <br>
        return text.replace(/\n/g, '<br>').replace(/•/g, '•');
    }

    getCurrentTemplate() {
        return this.currentTemplate;
    }

    getCurrentColor() {
        return this.currentColor;
    }

    getCurrentFont() {
        return this.currentFont;
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.previewManager = new PreviewManager();
    });
} else {
    window.previewManager = new PreviewManager();
}

