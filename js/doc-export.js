// @ts-nocheck
// DOCX Export using docx library (npm package)
class DOCXExporter {
    constructor() {
        this.init();
    }

    init() {
        // Button may not exist if using dropdown - handled by export-enhancements.js
        const exportBtn = document.getElementById('export-docx');
        if (exportBtn) {
            exportBtn.addEventListener('click', async () => {
                await this.exportToDOCX('standard', 'a4', null);
            });
        }
    }

    async exportToDOCX(quality = 'standard', paperSize = 'a4', fileName = null) {
        try {
            const previewContent = document.getElementById('preview-content');
            if (!previewContent) {
                alert('No preview content found');
                return;
            }

            const currentTab = window.tabManager ? window.tabManager.getCurrentTab() : 'cv';
            const defaultFileName = currentTab === 'cv' ? 'CV.docx' : 'Resume.docx';
            const finalFileName = fileName || defaultFileName;

            // Get current template, color, and font settings
            const settings = this.getPreviewSettings(previewContent);

            // Try to use the docx library first (for proper .docx files that work on mobile)
            // If it fails or isn't available, fall back to the simple HTML method
            try {
                if (typeof docx !== 'undefined') {
                    await this.createDOCXWithLibrary(previewContent, finalFileName, paperSize, settings);
                    return;
                }
            } catch (libraryError) {
                console.warn('DOCX library not available or error:', libraryError);
            }

            // Fallback to simple HTML method
            this.createSimpleDOCX(previewContent, finalFileName, paperSize, settings);
        } catch (error) {
            console.error('DOCX Export Error:', error);
            alert('Error generating DOCX. Using fallback method.');
            const fallbackFileName = 'CV.docx';
            const previewContent = document.getElementById('preview-content');
            const settings = previewContent ? this.getPreviewSettings(previewContent) : null;
            this.createSimpleDOCX(previewContent, fallbackFileName, paperSize, settings);
        }
    }

    async createDOCXWithLibrary(previewContent, fileName, paperSize = 'a4', settings = null) {
        // Get CV data from form manager
        const cvData = window.cvFormManager ? window.cvFormManager.getData() : null;
        if (!cvData) {
            throw new Error('CV data not available');
        }

        // Get settings if not provided
        if (!settings) {
            settings = this.getPreviewSettings(previewContent);
        }
        if (!settings) {
            settings = { template: 'modern', color: 'optimism-blue', font: 'system', accentColor: '#1a7fa3', fontFamily: 'Times New Roman, serif' };
        }

        const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType } = docx;

        // Convert hex color to RGB
        const hexToRgb = (hex) => {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : { r: 26, g: 127, b: 163 };
        };

        const accentRgb = hexToRgb(settings.accentColor);
        
        // Get font family based on settings
        const getFontFamily = () => {
            const fontMap = {
                'system': 'Calibri',
                'serif': 'Times New Roman',
                'sans-serif': 'Arial',
                'modern': 'Calibri',
                'classic': 'Times New Roman',
                'monospace': 'Courier New'
            };
            // Use computed font family if available, otherwise use font map
            if (settings.fontFamily && settings.fontFamily !== '') {
                // Extract first font from font family string
                const firstFont = settings.fontFamily.split(',')[0].replace(/['"]/g, '').trim();
                return firstFont || fontMap[settings.font] || 'Calibri';
            }
            return fontMap[settings.font] || 'Calibri';
        };

        const fontFamily = getFontFamily();
        const isBoldTemplate = settings.template === 'bold';
        const isClassicTemplate = settings.template === 'classic';
        const isModernTemplate = settings.template === 'modern';

        // Helper function to format hex color (remove # and ensure uppercase)
        const formatHexColor = (rgb) => {
            return (rgb.r.toString(16).padStart(2, '0') + 
                    rgb.g.toString(16).padStart(2, '0') + 
                    rgb.b.toString(16).padStart(2, '0')).toUpperCase();
        };

        const accentHex = formatHexColor(accentRgb);

        // Helper function to create styled section heading
        const createSectionHeading = (text) => {
            const runs = [new TextRun({
                text: isClassicTemplate ? text.toUpperCase() : text,
                color: isBoldTemplate ? 'FFFFFF' : accentHex,
                bold: true,
                size: isBoldTemplate ? 32 : isClassicTemplate ? 24 : 28, // 14pt = 28 half-points, 16pt = 32
                font: fontFamily
            })];

            return new Paragraph({
                children: runs,
                spacing: { before: isModernTemplate ? 400 : 400, after: 200 },
                border: {
                    bottom: {
                        color: accentHex,
                        size: isModernTemplate ? 16 : isClassicTemplate ? 8 : 16, // 2pt = 16, 1pt = 8
                        style: BorderStyle.SINGLE
                    }
                }
            });
        };

        // Build document children
        const children = [];

        // Header section with template-specific styling
        // For bold template, wrap header in a table cell with background
        if (isBoldTemplate) {
            const headerChildren = [];
            
            if (cvData.name) {
                headerChildren.push(
                    new Paragraph({
                        children: [new TextRun({
                            text: cvData.name,
                            bold: true,
                            size: 48, // 24pt
                            color: 'FFFFFF',
                            font: fontFamily
                        })],
                        alignment: AlignmentType.LEFT,
                        spacing: { after: 200 }
                    })
                );
            }

            // Contact information
            const contactParts = [];
            if (cvData.email) contactParts.push(cvData.email);
            if (cvData.phone) contactParts.push(cvData.phone);
            if (cvData.address) {
                const addrParts = [];
                if (cvData['address-street']) addrParts.push(cvData['address-street']);
                if (cvData['address-city']) addrParts.push(cvData['address-city']);
                if (cvData['address-state']) addrParts.push(cvData['address-state']);
                if (cvData['address-country']) addrParts.push(cvData['address-country']);
                if (addrParts.length > 0) contactParts.push(addrParts.join(', '));
            }
            if (contactParts.length > 0) {
                headerChildren.push(
                    new Paragraph({
                        children: [new TextRun({
                            text: contactParts.join(' | '),
                            color: 'FFFFFF',
                            size: 20, // 10pt
                            font: fontFamily
                        })],
                        alignment: AlignmentType.LEFT,
                        spacing: { after: 0 }
                    })
                );
            }

            if (headerChildren.length > 0) {
                children.push(
                    new Table({
                        rows: [new TableRow({
                            children: [new TableCell({
                                children: headerChildren,
                                shading: {
                                    type: ShadingType.SOLID,
                                    color: accentHex,
                                    fill: accentHex
                                },
                                margins: { top: 400, bottom: 400, left: 400, right: 400 }
                            })]
                        })],
                        width: { size: 100, type: WidthType.PERCENTAGE }
                    })
                );
                children.push(new Paragraph({ text: '', spacing: { after: 400 } }));
            }
        } else {
            // Modern and Classic templates
            if (cvData.name) {
                const nameRuns = [new TextRun({
                    text: isClassicTemplate ? cvData.name.toUpperCase() : cvData.name,
                    bold: true,
                    size: isClassicTemplate ? 36 : 44, // 18pt = 36, 22pt = 44
                    color: '000000',
                    font: fontFamily
                })];

                children.push(
                    new Paragraph({
                        children: nameRuns,
                        alignment: isModernTemplate ? AlignmentType.CENTER : AlignmentType.LEFT,
                        spacing: { after: 200 }
                    })
                );
            }

            // Contact information
            const contactParts = [];
            if (cvData.email) contactParts.push(cvData.email);
            if (cvData.phone) contactParts.push(cvData.phone);
            if (cvData.address) {
                const addrParts = [];
                if (cvData['address-street']) addrParts.push(cvData['address-street']);
                if (cvData['address-city']) addrParts.push(cvData['address-city']);
                if (cvData['address-state']) addrParts.push(cvData['address-state']);
                if (cvData['address-country']) addrParts.push(cvData['address-country']);
                if (addrParts.length > 0) contactParts.push(addrParts.join(', '));
            }
            if (contactParts.length > 0) {
                children.push(
                    new Paragraph({
                        children: [new TextRun({
                            text: contactParts.join(' | '),
                            color: '475569',
                            size: 20, // 10pt
                            font: fontFamily
                        })],
                        alignment: isModernTemplate ? AlignmentType.CENTER : AlignmentType.LEFT,
                        spacing: { after: 400 }
                    })
                );
            }

            // Add border after header for modern/classic templates
            if (cvData.name || contactParts.length > 0) {
                children.push(
                    new Paragraph({
                        spacing: { after: 400 },
                        border: {
                            bottom: {
                                color: accentHex,
                                size: isModernTemplate ? 24 : 16, // 3pt = 24, 2pt = 16
                                style: BorderStyle.SINGLE
                            }
                        }
                    })
                );
            }
        }

        // Professional Summary
        if (cvData.summary) {
            children.push(createSectionHeading('Professional Summary'));
            children.push(
                new Paragraph({
                    children: [new TextRun({
                        text: cvData.summary,
                        size: 24, // 12pt
                        font: fontFamily,
                        italics: isClassicTemplate
                    })],
                    spacing: { after: 400 }
                })
            );
        }

        // Education - only show if has valid content
        const validEducation = cvData.education ? cvData.education.filter(edu => 
            (edu.year && edu.year.trim()) || 
            (edu.level && edu.level.trim()) || 
            (edu.school && edu.school.trim()) || 
            (edu.qualification && edu.qualification.trim())
        ) : [];
        
        if (validEducation.length > 0) {
            const heading = createSectionHeading('Academic Qualifications');

            const headerCells = ['Year', 'Level', 'School', 'Qualification'].map(text => 
                new TableCell({
                    children: [new Paragraph({
                        children: [new TextRun({
                            text: text,
                            bold: true,
                            color: 'FFFFFF',
                            size: 22, // 11pt
                            font: fontFamily
                        })],
                        alignment: AlignmentType.LEFT
                    })],
                    shading: {
                        type: ShadingType.SOLID,
                        color: accentHex,
                        fill: accentHex
                    },
                    margins: { top: 100, bottom: 100, left: 100, right: 100 }
                })
            );

            const educationRows = [
                new TableRow({
                    children: headerCells,
                    tableHeader: true
                })
            ];

            validEducation.forEach((edu, index) => {
                const isEven = index % 2 === 0;
                educationRows.push(
                    new TableRow({
                        children: [
                            new TableCell({
                                children: [new Paragraph({
                                    children: [new TextRun({
                                        text: edu.year || '',
                                        size: 20,
                                        font: fontFamily
                                    })],
                                    alignment: AlignmentType.LEFT
                                })],
                                shading: isEven ? {
                                    type: ShadingType.SOLID,
                                    color: 'F8FAFC',
                                    fill: 'F8FAFC'
                                } : undefined,
                                margins: { top: 100, bottom: 100, left: 100, right: 100 }
                            }),
                            new TableCell({
                                children: [new Paragraph({
                                    children: [new TextRun({
                                        text: edu.level || '',
                                        size: 20,
                                        font: fontFamily
                                    })],
                                    alignment: AlignmentType.LEFT
                                })],
                                shading: isEven ? {
                                    type: ShadingType.SOLID,
                                    color: 'F8FAFC',
                                    fill: 'F8FAFC'
                                } : undefined,
                                margins: { top: 100, bottom: 100, left: 100, right: 100 }
                            }),
                            new TableCell({
                                children: [new Paragraph({
                                    children: [new TextRun({
                                        text: edu.school || '',
                                        size: 20,
                                        font: fontFamily
                                    })],
                                    alignment: AlignmentType.LEFT
                                })],
                                shading: isEven ? {
                                    type: ShadingType.SOLID,
                                    color: 'F8FAFC',
                                    fill: 'F8FAFC'
                                } : undefined,
                                margins: { top: 100, bottom: 100, left: 100, right: 100 }
                            }),
                            new TableCell({
                                children: [new Paragraph({
                                    children: [new TextRun({
                                        text: edu.qualification || '',
                                        size: 20,
                                        font: fontFamily
                                    })],
                                    alignment: AlignmentType.LEFT
                                })],
                                shading: isEven ? {
                                    type: ShadingType.SOLID,
                                    color: 'F8FAFC',
                                    fill: 'F8FAFC'
                                } : undefined,
                                margins: { top: 100, bottom: 100, left: 100, right: 100 }
                            })
                        ]
                    })
                );
            });

            const educationTable = new Table({
                rows: educationRows,
                width: { size: 100, type: WidthType.PERCENTAGE },
                margins: { top: 100, bottom: 100, left: 100, right: 100 }
            });
            
            // Ensure heading has content (table counts as content)
            ensureHeadingContent(heading, [new Paragraph({ text: '' })]);
            children.push(heading);
            children.push(educationTable);
        }

        // Work Experience - only show if has valid content
        const validWork = cvData.work ? cvData.work.filter(work => 
            (work.title && work.title.trim()) || 
            (work.company && work.company.trim()) || 
            (work.description && work.description.trim())
        ) : [];
        
        if (validWork.length > 0) {
            const workParagraphs = [];
            validWork.forEach(work => {
                if (work.title || work.company) {
                    const titleText = work.title || '';
                    const companyText = work.company || '';
                    const periodText = work.period || '';
                    const subtitle = [companyText, periodText].filter(Boolean).join(' - ');

                    workParagraphs.push(
                        new Paragraph({
                            children: [new TextRun({
                                text: titleText,
                                bold: true,
                                size: 24, // 12pt
                                font: fontFamily
                            })],
                            spacing: { before: 200, after: 100 }
                        })
                    );

                    if (subtitle) {
                        workParagraphs.push(
                            new Paragraph({
                                children: [new TextRun({
                                    text: subtitle,
                                    size: 20, // 10pt
                                    font: fontFamily,
                                    italics: isClassicTemplate,
                                    color: '666666'
                                })],
                                spacing: { after: 100 }
                            })
                        );
                    }

                    if (work.description) {
                        workParagraphs.push(
                            new Paragraph({
                                children: [new TextRun({
                                    text: work.description,
                                    size: 20, // 10pt
                                    font: fontFamily
                                })],
                                spacing: { after: 200 }
                            })
                        );
                    }
                }
            });
            
            if (workParagraphs.length > 0) {
                const heading = createSectionHeading('Work Experience');
                ensureHeadingContent(heading, workParagraphs);
                children.push(heading);
                workParagraphs.forEach(p => children.push(p));
            }
        }

        // Research Experience - only show if has valid content
        const validResearch = cvData.research ? cvData.research.filter(res => 
            (res.title && res.title.trim()) || 
            (res.institution && res.institution.trim()) || 
            (res.description && res.description.trim())
        ) : [];
        
        if (validResearch.length > 0) {
            const researchParagraphs = [];
            validResearch.forEach(res => {
                if (res.title || res.institution) {
                    const titleText = res.title || '';
                    const institutionText = res.institution || '';
                    const periodText = res.period || '';
                    const subtitle = [institutionText, periodText].filter(Boolean).join(' - ');

                    researchParagraphs.push(
                        new Paragraph({
                            children: [new TextRun({
                                text: titleText,
                                bold: true,
                                size: 24, // 12pt
                                font: fontFamily
                            })],
                            spacing: { before: 200, after: 100 }
                        })
                    );

                    if (subtitle) {
                        researchParagraphs.push(
                            new Paragraph({
                                children: [new TextRun({
                                    text: subtitle,
                                    size: 20, // 10pt
                                    font: fontFamily,
                                    italics: isClassicTemplate,
                                    color: '666666'
                                })],
                                spacing: { after: 100 }
                            })
                        );
                    }

                    if (res.description) {
                        researchParagraphs.push(
                            new Paragraph({
                                children: [new TextRun({
                                    text: res.description,
                                    size: 20, // 10pt
                                    font: fontFamily
                                })],
                                spacing: { after: 200 }
                            })
                        );
                    }
                }
            });
            
            if (researchParagraphs.length > 0) {
                const heading = createSectionHeading('Research Experience');
                ensureHeadingContent(heading, researchParagraphs);
                children.push(heading);
                researchParagraphs.forEach(p => children.push(p));
            }
        }

        // Publications - only show if has valid content
        const validPublications = cvData.publications ? cvData.publications.filter(pub => 
            (pub.title && pub.title.trim()) || 
            (pub.venue && pub.venue.trim()) || 
            (pub.year && pub.year.trim())
        ) : [];
        
        if (validPublications.length > 0) {
            const publicationParagraphs = [];
            validPublications.forEach(pub => {
                if (pub.title || pub.venue) {
                    const titleText = pub.title || '';
                    const venueText = pub.venue || '';
                    const yearText = pub.year || '';
                    const subtitle = [venueText, yearText].filter(Boolean).join(' • ');

                    publicationParagraphs.push(
                        new Paragraph({
                            children: [new TextRun({
                                text: titleText,
                                bold: true,
                                size: 24, // 12pt
                                font: fontFamily
                            })],
                            spacing: { before: 200, after: 100 }
                        })
                    );

                    if (subtitle) {
                        publicationParagraphs.push(
                            new Paragraph({
                                children: [new TextRun({
                                    text: subtitle,
                                    size: 20, // 10pt
                                    font: fontFamily,
                                    italics: isClassicTemplate,
                                    color: '666666'
                                })],
                                spacing: { after: 200 }
                            })
                        );
                    }
                }
            });
            
            if (publicationParagraphs.length > 0) {
                const heading = createSectionHeading('Publications');
                ensureHeadingContent(heading, publicationParagraphs);
                children.push(heading);
                publicationParagraphs.forEach(p => children.push(p));
            }
        }

        // Certifications - only show if has valid content
        const validCertifications = cvData.certifications ? cvData.certifications.filter(cert => 
            (cert.name && cert.name.trim()) || 
            (cert.issuer && cert.issuer.trim()) || 
            (cert.year && cert.year.trim())
        ) : [];
        
        if (validCertifications.length > 0) {
            const certificationParagraphs = [];
            validCertifications.forEach(cert => {
                if (cert.name || cert.issuer) {
                    const nameText = cert.name || '';
                    const issuerText = cert.issuer || '';
                    const yearText = cert.year || '';
                    const subtitle = [issuerText, yearText].filter(Boolean).join(' • ');

                    certificationParagraphs.push(
                        new Paragraph({
                            children: [new TextRun({
                                text: nameText,
                                bold: true,
                                size: 24, // 12pt
                                font: fontFamily
                            })],
                            spacing: { before: 200, after: 100 }
                        })
                    );

                    if (subtitle) {
                        certificationParagraphs.push(
                            new Paragraph({
                                children: [new TextRun({
                                    text: subtitle,
                                    size: 20, // 10pt
                                    font: fontFamily,
                                    italics: isClassicTemplate,
                                    color: '666666'
                                })],
                                spacing: { after: 200 }
                            })
                        );
                    }
                }
            });
            
            if (certificationParagraphs.length > 0) {
                const heading = createSectionHeading('Certifications');
                ensureHeadingContent(heading, certificationParagraphs);
                children.push(heading);
                certificationParagraphs.forEach(p => children.push(p));
            }
        }

        // Conferences / Workshops - only show if has valid content
        const validConferences = cvData.conferences ? cvData.conferences.filter(conf => 
            (conf.name && conf.name.trim()) || 
            (conf.location && conf.location.trim()) || 
            (conf.year && conf.year.trim())
        ) : [];
        
        if (validConferences.length > 0) {
            const conferenceParagraphs = [];
            validConferences.forEach(conf => {
                if (conf.name || conf.location) {
                    const nameText = conf.name || '';
                    const locationText = conf.location || '';
                    const yearText = conf.year || '';
                    const subtitle = [locationText, yearText].filter(Boolean).join(' • ');

                    conferenceParagraphs.push(
                        new Paragraph({
                            children: [new TextRun({
                                text: nameText,
                                bold: true,
                                size: 24, // 12pt
                                font: fontFamily
                            })],
                            spacing: { before: 200, after: 100 }
                        })
                    );

                    if (subtitle) {
                        conferenceParagraphs.push(
                            new Paragraph({
                                children: [new TextRun({
                                    text: subtitle,
                                    size: 20, // 10pt
                                    font: fontFamily,
                                    italics: isClassicTemplate,
                                    color: '666666'
                                })],
                                spacing: { after: 200 }
                            })
                        );
                    }
                }
            });
            
            if (conferenceParagraphs.length > 0) {
                const heading = createSectionHeading('Conferences / Workshops');
                ensureHeadingContent(heading, conferenceParagraphs);
                children.push(heading);
                conferenceParagraphs.forEach(p => children.push(p));
            }
        }

        // Achievements - only show if has valid content
        const validAchievements = cvData.achievements ? cvData.achievements.filter(ach => 
            (ach.description && ach.description.trim())
        ) : [];
        
        if (validAchievements.length > 0) {
            const achievementParagraphs = [];
            validAchievements.forEach(ach => {
                if (ach.description && ach.description.trim()) {
                    achievementParagraphs.push(
                        new Paragraph({
                            children: [new TextRun({
                                text: ach.description,
                                size: 20, // 10pt
                                font: fontFamily
                            })],
                            spacing: { before: 200, after: 200 }
                        })
                    );
                }
            });
            
            if (achievementParagraphs.length > 0) {
                const heading = createSectionHeading('Achievements');
                ensureHeadingContent(heading, achievementParagraphs);
                children.push(heading);
                achievementParagraphs.forEach(p => children.push(p));
            }
        }

        // Projects - only show if has valid content
        const validProjects = cvData.projects ? cvData.projects.filter(proj => 
            (proj.name && proj.name.trim()) || 
            (proj.tech && proj.tech.trim()) || 
            (proj.description && proj.description.trim())
        ) : [];
        
        if (validProjects.length > 0) {
            const projectParagraphs = [];
            validProjects.forEach(proj => {
                if (proj.name || proj.tech) {
                    const nameText = proj.name || '';
                    const techText = proj.tech || '';

                    projectParagraphs.push(
                        new Paragraph({
                            children: [new TextRun({
                                text: nameText,
                                bold: true,
                                size: 24, // 12pt
                                font: fontFamily
                            })],
                            spacing: { before: 200, after: 100 }
                        })
                    );

                    if (techText) {
                        projectParagraphs.push(
                            new Paragraph({
                                children: [new TextRun({
                                    text: techText,
                                    size: 20, // 10pt
                                    font: fontFamily,
                                    italics: isClassicTemplate,
                                    color: '666666'
                                })],
                                spacing: { after: 100 }
                            })
                        );
                    }

                    if (proj.description) {
                        projectParagraphs.push(
                            new Paragraph({
                                children: [new TextRun({
                                    text: proj.description,
                                    size: 20, // 10pt
                                    font: fontFamily
                                })],
                                spacing: { after: 200 }
                            })
                        );
                    }
                }
            });
            
            if (projectParagraphs.length > 0) {
                const heading = createSectionHeading('Projects');
                ensureHeadingContent(heading, projectParagraphs);
                children.push(heading);
                projectParagraphs.forEach(p => children.push(p));
            }
        }

        // Skills - only show if has valid content
        const validSkills = cvData.skills ? (Array.isArray(cvData.skills) 
            ? cvData.skills.filter(s => s && s.toString().trim())
            : cvData.skills.toString().split(/[,\n]/).map(s => s.trim()).filter(s => s)
        ) : [];
        
        if (validSkills.length > 0) {
            const skillsPara = new Paragraph({
                children: [new TextRun({
                    text: Array.isArray(validSkills) ? validSkills.join(', ') : validSkills,
                    size: 20, // 10pt
                    font: fontFamily
                })],
                spacing: { after: 400 }
            });
            const heading = createSectionHeading('Skills');
            ensureHeadingContent(heading, [skillsPara]);
            children.push(heading);
            children.push(skillsPara);
        }

        // References - only show if has valid content
        const validReferences = cvData.references ? cvData.references.filter(ref => 
            (ref.name && ref.name.trim()) || 
            (ref.position && ref.position.trim()) || 
            (ref.phone && ref.phone.trim()) || 
            (ref.email && ref.email.trim())
        ) : [];
        
        if (validReferences.length > 0) {
            const referenceParagraphs = [];
            validReferences.forEach(ref => {
                if (ref.name || ref.position || ref.phone || ref.email) {
                    const nameText = ref.name || '';
                    const positionText = ref.position || '';
                    const phoneText = ref.phone || '';
                    const emailText = ref.email || '';
                    
                    // Format like preview: Name, Position, Phone • Email
                    const refParts = [];
                    if (nameText) refParts.push(nameText);
                    if (positionText) refParts.push(positionText);
                    
                    let contactInfo = '';
                    if (phoneText && emailText) {
                        contactInfo = `${phoneText} • ${emailText}`;
                    } else if (phoneText) {
                        contactInfo = phoneText;
                    } else if (emailText) {
                        contactInfo = emailText;
                    }
                    
                    if (refParts.length > 0) {
                        referenceParagraphs.push(
                            new Paragraph({
                                children: [new TextRun({
                                    text: refParts.join(', '),
                                    bold: true,
                                    size: 24, // 12pt
                                    font: fontFamily
                                })],
                                spacing: { before: 200, after: 100 }
                            })
                        );
                    }
                    
                    if (contactInfo) {
                        referenceParagraphs.push(
                            new Paragraph({
                                children: [new TextRun({
                                    text: contactInfo,
                                    size: 20, // 10pt
                                    font: fontFamily
                                })],
                                spacing: { after: 200 }
                            })
                        );
                    }
                }
            });
            
            if (referenceParagraphs.length > 0) {
                const heading = createSectionHeading('References');
                ensureHeadingContent(heading, referenceParagraphs);
                children.push(heading);
                referenceParagraphs.forEach(p => children.push(p));
            }
        }

        // Create document with default font
        const doc = new Document({
            styles: {
                default: {
                    document: {
                        run: {
                            font: fontFamily,
                            size: 24 // 12pt default
                        },
                        paragraph: {
                            spacing: { line: 360, lineRule: 'auto' } // 1.5 line height
                        }
                    }
                }
            },
            sections: [{
                properties: {
                    page: {
                        size: {
                            orientation: docx.PageOrientation.PORTRAIT,
                            width: paperSize === 'letter' ? 12240 : paperSize === 'legal' ? 12240 : 11906, // A4 width in twips
                            height: paperSize === 'letter' ? 15840 : paperSize === 'legal' ? 20160 : 16838 // A4 height in twips
                        },
                        margin: {
                            top: 1440, // 1 inch = 1440 twips
                            right: 1440,
                            bottom: 1440,
                            left: 1440
                        }
                    }
                },
                children: children
            }]
        });

        // Generate and download
        const blob = await Packer.toBlob(doc);
        if (typeof saveAs !== 'undefined') {
            saveAs(blob, fileName);
        } else {
            this.downloadBlob(blob, fileName);
        }
    }

    getPreviewSettings(previewContent) {
        // Extract template, color, and font from preview content classes and styles
        const classes = previewContent.className.split(' ');
        let template = 'modern';
        let color = 'optimism-blue';
        let font = 'system';
        let accentColor = '#1a7fa3'; // default

        // Extract from classes
        classes.forEach(cls => {
            if (cls.startsWith('template-')) {
                template = cls.replace('template-', '');
            } else if (cls.startsWith('color-')) {
                color = cls.replace('color-', '');
            } else if (cls.startsWith('font-')) {
                font = cls.replace('font-', '');
            }
        });

        // Get accent color from computed style or inline style
        let computedStyle;
        try {
            computedStyle = window.getComputedStyle(previewContent);
            accentColor = computedStyle.getPropertyValue('--accent-color').trim() || accentColor;
            const fontFamily = computedStyle.getPropertyValue('--preview-font-family').trim() || computedStyle.fontFamily;
            
            // If accent color is still default, try to get it from color map
            if (accentColor === '#1a7fa3' || !accentColor) {
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
                accentColor = colorMap[color] || accentColor;
            }
            
            return { template, color, font, accentColor, fontFamily };
        } catch (e) {
            // Fallback if computed style fails (e.g., element not in DOM)
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
            accentColor = colorMap[color] || accentColor;
            return { template, color, font, accentColor, fontFamily: 'Times New Roman, serif' };
        }
    }

    createSimpleDOCX(content, fileName, paperSize = 'a4', settings = null) {
        // Get page size CSS
        const pageSizeCSS = this.getPageSizeCSS(paperSize);
        
        // Get settings if not provided
        if (!settings && content) {
            settings = this.getPreviewSettings(content);
        }
        if (!settings) {
            settings = { template: 'modern', color: 'optimism-blue', font: 'system', accentColor: '#1a7fa3', fontFamily: 'Times New Roman, serif' };
        }
        
        // Get template-specific styles
        const templateStyles = this.getTemplateStyles(settings);
        
        // Create a properly formatted HTML document that Word can open
        const htmlContent = `
<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
    <meta charset='utf-8'>
    <title>${fileName.replace('.docx', '')}</title>
    <!--[if gte mso 9]>
    <xml>
        <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>90</w:Zoom>
            <w:DoNotOptimizeForBrowser/>
        </w:WordDocument>
    </xml>
    <![endif]-->
    <style>
        /* Standard 1 inch (2.54 cm) margins on all sides */
        @page { 
            size: ${paperSize === 'letter' ? 'letter' : paperSize === 'legal' ? 'legal' : 'A4'}; 
            margin: 1in; 
        }
        /* Body uses page margins, content starts slightly inward with left alignment */
        body { 
            font-family: ${this.getFontFamily(settings.font, settings.fontFamily)}; 
            font-size: 12pt; 
            line-height: 1.6; 
            margin: 0;
            padding: 0;
        }
        /* Content container with proper alignment */
        .content-wrapper {
            width: 100%;
            max-width: 100%;
            box-sizing: border-box;
        }
        ${templateStyles}
        .preview-header-section {
            margin-bottom: 15pt;
        }
        .preview-name { 
            font-size: 20pt; 
            font-weight: bold; 
            margin-bottom: 10pt; 
            text-align: left;
        }
        .preview-contact { 
            font-size: 10pt; 
            margin-bottom: 15pt; 
            text-align: left;
        }
        .preview-section-title { 
            font-size: 14pt; 
            font-weight: bold; 
            margin-top: 15pt; 
            margin-bottom: 10pt; 
            border-bottom: 1px solid ${settings.accentColor}; 
            padding-bottom: 3pt; 
            text-align: left;
            color: ${settings.accentColor};
        }
        .preview-entry-title { 
            font-size: 12pt; 
            font-weight: bold; 
            text-align: left;
        }
        .preview-entry-subtitle { 
            font-size: 10pt; 
            color: #666; 
            text-align: left;
        }
        .preview-entry-details { 
            font-size: 10pt; 
            margin-top: 5pt; 
            text-align: left;
        }
        .preview-summary { 
            font-style: italic; 
            margin-bottom: 15pt; 
            text-align: left;
        }
        .preview-skills-horizontal { 
            margin-top: 5pt; 
            display: flex;
            flex-wrap: wrap;
            gap: 4pt 8pt;
        }
        .preview-skill-item { 
            display: inline; 
            color: #334155;
            padding: 0;
            background: transparent;
            border-radius: 0;
        }
        .skill-separator {
            color: #64748B;
            margin: 0 4pt;
        }
        /* Tables must not exceed printable area - stay within margins */
        .preview-education-table, table { 
            width: 100%; 
            max-width: 100%;
            border-collapse: collapse; 
            margin: 10pt 0; 
            box-sizing: border-box;
            table-layout: fixed;
        }
        .preview-education-table th, table th { 
            background: ${settings.accentColor}; 
            color: white; 
            padding: 6pt; 
            text-align: left; 
            font-weight: bold; 
            border: 1px solid ${this.darkenColor(settings.accentColor)}; 
            word-wrap: break-word;
        }
        .preview-education-table td, table td { 
            padding: 6pt; 
            border: 1px solid #E2E8F0; 
            word-wrap: break-word;
            overflow-wrap: break-word;
        }
        .preview-education-table tbody tr:nth-child(even), table tbody tr:nth-child(even) { 
            background: #F8FAFC; 
        }
        /* Section wrappers - prevent headings from being orphaned */
        .preview-section-wrapper {
            page-break-inside: avoid;
        }
        .preview-section-title {
            page-break-after: avoid;
        }
        /* First content after heading - ensure at least 4 lines stay with heading */
        .preview-entry-first,
        .preview-section-content-first {
            orphans: 4;
            widows: 4;
            page-break-before: avoid;
        }
        /* Education table - keep with section title */
        .preview-section-wrapper .preview-education-table {
            page-break-before: avoid;
            orphans: 4;
            widows: 4;
        }
        /* Page break controls for references - prevent orphaned lines */
        .preview-references-section {
            page-break-inside: avoid;
        }
        .preview-references-section .preview-section-title {
            page-break-after: avoid;
        }
        .preview-entry {
            page-break-inside: avoid;
            orphans: 2;
            widows: 2;
        }
        .preview-entry-last {
            orphans: 3;
            widows: 3;
        }
        /* Keep last 2 references together */
        .preview-references-section .preview-entry:nth-last-child(-n+2) {
            page-break-inside: avoid;
        }
        /* Sparse CV adjustments */
        .cv-sparse {
            padding-bottom: 120pt;
        }
        .cv-sparse .preview-entry {
            margin-bottom: 20pt;
        }
        .cv-sparse .preview-section-title {
            margin-top: 30pt;
        }
    </style>
</head>
<body>
<div class="content-wrapper">
${content.innerHTML}
</div>
</body>
</html>`;

        const blob = new Blob([htmlContent], { type: 'application/msword' });
        this.downloadBlob(blob, fileName.replace('.docx', '.doc'));
    }

    getPageSizeCSS(paperSize) {
        const sizes = {
            'a4': 'A4',
            'letter': 'letter',
            'legal': 'legal'
        };
        return sizes[paperSize] || 'A4';
    }

    getFontFamily(fontKey, computedFontFamily) {
        const fontMap = {
            'system': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
            'serif': '"Times New Roman", Times, serif',
            'sans-serif': 'Arial, Helvetica, sans-serif',
            'modern': '"Roboto", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            'classic': 'Georgia, "Times New Roman", serif',
            'monospace': '"Courier New", Courier, monospace'
        };
        
        // Use computed font family if available, otherwise use font map
        if (computedFontFamily && computedFontFamily !== '') {
            return computedFontFamily;
        }
        return fontMap[fontKey] || fontMap['system'];
    }

    getTemplateStyles(settings) {
        const { template, accentColor } = settings;
        let styles = '';

        if (template === 'modern') {
            styles += `
            .preview-header-section {
                text-align: center;
                padding-bottom: 15pt;
                border-bottom: 3pt solid ${accentColor};
                margin-bottom: 20pt;
            }
            .preview-name {
                font-size: 22pt;
                font-weight: 700;
            }
            .preview-section-title {
                border-bottom: 2pt solid ${accentColor};
                padding-bottom: 6pt;
            }`;
        } else if (template === 'classic') {
            styles += `
            .preview-header-section {
                text-align: left;
                padding-bottom: 12pt;
                border-bottom: 2pt solid ${accentColor};
                margin-bottom: 15pt;
            }
            .preview-name {
                text-transform: uppercase;
                letter-spacing: 1pt;
                font-size: 18pt;
            }
            .preview-section-title {
                text-transform: uppercase;
                letter-spacing: 1pt;
                border-bottom: 1pt solid ${accentColor};
                padding-bottom: 2pt;
            }
            .preview-entry-subtitle {
                font-style: italic;
            }`;
        } else if (template === 'bold') {
            styles += `
            .preview-header-section {
                background: ${accentColor};
                color: white;
                padding: 20pt;
                border-radius: 6pt;
                margin-bottom: 20pt;
            }
            .preview-name {
                font-size: 24pt;
                font-weight: 800;
                color: white;
            }
            .preview-contact {
                color: white;
            }
            .preview-section-title {
                font-size: 16pt;
                font-weight: 800;
            }`;
        }

        return styles;
    }

    darkenColor(color) {
        // Simple darkening by reducing RGB values
        if (color.startsWith('#')) {
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);
            const darkR = Math.max(0, Math.floor(r * 0.7));
            const darkG = Math.max(0, Math.floor(g * 0.7));
            const darkB = Math.max(0, Math.floor(b * 0.7));
            return `#${darkR.toString(16).padStart(2, '0')}${darkG.toString(16).padStart(2, '0')}${darkB.toString(16).padStart(2, '0')}`;
        }
        return color;
    }


    downloadBlob(blob, fileName) {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }

    addInlineStyles(element, paperSize = 'a4', settings = null) {
        // Get settings if not provided
        if (!settings && element) {
            settings = this.getPreviewSettings(element);
        }
        if (!settings) {
            settings = { template: 'modern', color: 'optimism-blue', font: 'system', accentColor: '#1a7fa3', fontFamily: 'Times New Roman, serif' };
        }
        
        // Get template-specific styles
        const templateStyles = this.getTemplateStyles(settings);
        
        // Add inline styles with standard 1 inch margins and proper layout constraints
        const style = document.createElement('style');
        style.textContent = `
            /* Standard 1 inch (2.54 cm) margins on all sides */
            @page { 
                size: ${paperSize === 'letter' ? 'letter' : paperSize === 'legal' ? 'legal' : 'A4'}; 
                margin: 1in; 
            }
            body { 
                font-family: ${this.getFontFamily(settings.font, settings.fontFamily)}; 
                font-size: 12pt; 
                line-height: 1.6; 
                margin: 0;
                padding: 0;
            }
            /* Content wrapper ensures proper alignment */
            .content-wrapper {
                width: 100%;
                max-width: 100%;
                box-sizing: border-box;
            }
            ${templateStyles}
            .preview-header-section {
                margin-bottom: 15pt;
            }
            .preview-name { 
                font-size: 20pt; 
                font-weight: bold; 
                margin-bottom: 10pt; 
                text-align: left;
            }
            .preview-contact { 
                font-size: 10pt; 
                margin-bottom: 15pt; 
                text-align: left;
            }
            .preview-section-title { 
                font-size: 14pt; 
                font-weight: bold; 
                margin-top: 15pt; 
                margin-bottom: 10pt; 
                text-align: left;
                color: ${settings.accentColor};
                border-bottom: 1px solid ${settings.accentColor};
                padding-bottom: 3pt;
            }
            .preview-entry-title { 
                font-size: 12pt; 
                font-weight: bold; 
                text-align: left;
            }
            .preview-entry-subtitle { 
                font-size: 10pt; 
                color: #666; 
                text-align: left;
            }
            .preview-entry-details { 
                font-size: 10pt; 
                margin-top: 5pt; 
                text-align: left;
            }
            .preview-summary { 
                font-style: italic; 
                margin-bottom: 15pt; 
                text-align: left;
            }
            .preview-skills-horizontal {
                display: flex;
                flex-wrap: wrap;
                gap: 4pt 8pt;
            }
            .preview-skill-item {
                display: inline;
                color: #334155;
                padding: 0;
                background: transparent;
                border-radius: 0;
                margin-right: 0;
            }
            .skill-separator {
                color: #64748B;
                margin: 0 4pt;
            }
            }
            /* Tables must not exceed printable area - stay within margins */
            .preview-education-table, table { 
                width: 100%; 
                max-width: 100%;
                border-collapse: collapse; 
                margin: 10pt 0; 
                box-sizing: border-box;
                table-layout: fixed;
            }
            .preview-education-table th, table th { 
                background: ${settings.accentColor}; 
                color: white; 
                padding: 6pt; 
                text-align: left; 
                font-weight: bold; 
                border: 1px solid ${this.darkenColor(settings.accentColor)}; 
                word-wrap: break-word;
            }
            .preview-education-table td, table td { 
                padding: 6pt; 
                border: 1px solid #E2E8F0; 
                word-wrap: break-word;
                overflow-wrap: break-word;
            }
            .preview-education-table tbody tr:nth-child(even), table tbody tr:nth-child(even) { 
                background: #F8FAFC; 
            }
        `;
        element.insertBefore(style, element.firstChild);
        
        // Wrap existing content in a wrapper div for proper structure
        // This ensures content stays within margins and tables don't exceed printable area
        const wrapper = document.createElement('div');
        wrapper.className = 'content-wrapper';
        
        // Move all children (except the style we just added) into the wrapper
        const children = Array.from(element.childNodes);
        children.forEach(child => {
            if (child !== style && child.nodeType === Node.ELEMENT_NODE) {
                wrapper.appendChild(child);
            }
        });
        
        // Append wrapper after style
        if (element.firstChild === style) {
            element.insertBefore(wrapper, style.nextSibling);
        } else {
            element.appendChild(wrapper);
        }
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.docxExporter = new DOCXExporter();
    });
} else {
    window.docxExporter = new DOCXExporter();
}

