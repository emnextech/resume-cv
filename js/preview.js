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
        return window.cvFormManager ? window.cvFormManager.getData() : {};
    }

    isFieldEmpty(value) {
        if (Array.isArray(value)) {
            return value.length === 0;
        }
        return !value || (typeof value === 'string' && value.trim() === '');
    }

    getPlaceholderData(type) {
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
                skills: ['Python', 'JavaScript', 'React', 'Node.js', 'Networking', 'UI Design'],
                references: [
                    { name: 'Dr. Sarah Johnson', position: 'Senior Software Engineer', phone: '+1 234 567 8900', email: 'sarah.johnson@email.com' },
                    { name: 'Prof. Michael Chen', position: 'Professor of Computer Science', phone: '+1 234 567 8901', email: 'michael.chen@university.edu' }
                ]
            };
    }

    getValue(field, data, placeholderData, isPlaceholder = false) {
        const value = data[field];
        
        // Special handling for skills array
        if (field === 'skills') {
            if (Array.isArray(value) && value.length > 0) {
                return value;
            }
            if (isPlaceholder) {
                return Array.isArray(placeholderData[field]) ? placeholderData[field] : [];
            }
            return [];
        }
        
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

        const data = this.getCurrentData();
        const placeholderData = this.getPlaceholderData('cv');

        // Clear and set template, color, and font classes
        previewContent.className = `preview-content template-${this.currentTemplate} color-${this.currentColor} font-${this.currentFont}`;
        
        // Apply color as CSS variable
        this.applyColor(previewContent);
        
        // Apply font
        this.applyFont(previewContent);

        previewContent.innerHTML = this.renderCV(data, placeholderData);
        
        // Remove any existing page count indicators and page break indicators
        setTimeout(() => {
            const existingPageCount = document.getElementById('page-count-indicator');
            if (existingPageCount) {
                existingPageCount.remove();
            }
            const existingIndicators = previewContent.querySelectorAll('.page-break-indicator');
            existingIndicators.forEach(ind => ind.remove());
        }, 100);
    }
    
    showPageCount(count) {
        // Page count indicator removed per user request
        // Do nothing
    }
    
    hidePageCount() {
        // Page count indicator removed per user request
        // Do nothing
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
                <div class="preview-name">${this.escapeHtml(name || 'Your Name')}</div>
                <div class="preview-contact">
                    ${email ? this.escapeHtml(email) + ' • ' : ''}
                    ${phone ? this.escapeHtml(phone) + ' • ' : ''}
                    ${this.escapeHtml(address || '')}
                    ${website ? ' • ' + this.escapeHtml(website) : ''}
                </div>
            </div>
        `;

        if (summary) {
            html += `<div class="preview-summary">${this.formatText(summary)}</div>`;
        }

        // Education - Render as table
        const education = this.getArrayValue(data.education, placeholderData.education, true);
        if (education && education.length > 0) {
            // Filter out completely empty entries
            const validEducation = education.filter(edu => {
                return (edu.year && edu.year.trim()) || 
                       (edu.level && edu.level.trim()) || 
                       (edu.school && edu.school.trim()) || 
                       (edu.qualification && edu.qualification.trim());
            });
            
            if (validEducation.length > 0) {
                html += '<div class="preview-section-title">Academic Qualifications</div>';
                html += '<table class="preview-education-table">';
                html += '<thead><tr><th>Year</th><th>Level</th><th>School</th><th>Qualification</th></tr></thead>';
                html += '<tbody>';
                validEducation.forEach(edu => {
                    html += '<tr>';
                    html += `<td>${this.escapeHtml(edu.year || '')}</td>`;
                    html += `<td>${this.escapeHtml(edu.level || '')}</td>`;
                    html += `<td>${this.escapeHtml(edu.school || '')}</td>`;
                    html += `<td>${this.escapeHtml(edu.qualification || '')}</td>`;
                    html += '</tr>';
                });
                html += '</tbody></table>';
            }
        }

        // Work Experience
        const work = this.getArrayValue(data.work, placeholderData.work, true);
        if (work && work.length > 0) {
            html += '<div class="preview-section-title">Work Experience</div>';
            work.forEach(w => {
                html += `
                    <div class="preview-entry">
                        <div class="preview-entry-title">${this.escapeHtml(w.title || '')}</div>
                        <div class="preview-entry-subtitle">${this.escapeHtml(w.company || '')} ${w.period ? '• ' + this.escapeHtml(w.period) : ''}</div>
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
                        <div class="preview-entry-title">${this.escapeHtml(r.title || '')}</div>
                        <div class="preview-entry-subtitle">${this.escapeHtml(r.institution || '')} ${r.period ? '• ' + this.escapeHtml(r.period) : ''}</div>
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
                        <div class="preview-entry-title">${this.escapeHtml(pub.title || '')}</div>
                        <div class="preview-entry-subtitle">${this.escapeHtml(pub.venue || '')} ${pub.year ? '• ' + this.escapeHtml(pub.year) : ''}</div>
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
                        <div class="preview-entry-title">${this.escapeHtml(cert.name || '')}</div>
                        <div class="preview-entry-subtitle">${this.escapeHtml(cert.issuer || '')} ${cert.year ? '• ' + this.escapeHtml(cert.year) : ''}</div>
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
                        <div class="preview-entry-title">${this.escapeHtml(conf.name || '')}</div>
                        <div class="preview-entry-subtitle">${this.escapeHtml(conf.location || '')} ${conf.year ? '• ' + this.escapeHtml(conf.year) : ''}</div>
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
        if (skills && (Array.isArray(skills) ? skills.length > 0 : skills.trim())) {
            html += '<div class="preview-section-title">Skills</div>';
            // Handle both array and string formats for backward compatibility
            const skillsArray = Array.isArray(skills) 
                ? skills.filter(s => s && s.trim())
                : skills.split(/[,\n]/).map(s => s.trim()).filter(s => s);
            
            if (skillsArray.length > 0) {
                html += '<div class="preview-skills">';
                skillsArray.forEach(skill => {
                    html += `<span class="preview-skill-item">${this.escapeHtml(skill)}</span>`;
                });
                html += '</div>';
            }
        }

        // References
        const references = this.getArrayValue(data.references, placeholderData.references, true);
        if (references && references.length > 0) {
            html += '<div class="preview-section-title">References</div>';
            references.forEach(ref => {
                const name = this.escapeHtml(ref.name || '');
                const position = this.escapeHtml(ref.position || '');
                const phone = this.escapeHtml(ref.phone || '');
                const email = this.escapeHtml(ref.email || '');
                
                let contactInfo = '';
                if (phone && email) {
                    contactInfo = `${phone} • ${email}`;
                } else if (phone) {
                    contactInfo = phone;
                } else if (email) {
                    contactInfo = email;
                }
                
                html += `
                    <div class="preview-entry">
                        <div class="preview-entry-title">${name}</div>
                        ${position ? `<div class="preview-entry-subtitle">${position}</div>` : ''}
                        ${contactInfo ? `<div class="preview-entry-details">${contactInfo}</div>` : ''}
                    </div>
                `;
            });
        }

        return html;
    }


    formatText(text) {
        if (!text) return '';
        // Escape HTML to prevent XSS
        const escapeHtml = (str) => {
            const div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML;
        };
        // Convert newlines to <br> after escaping
        return escapeHtml(text).replace(/\n/g, '<br>').replace(/•/g, '•');
    }
    
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
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

