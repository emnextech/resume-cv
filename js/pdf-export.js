// PDF Export using jsPDF and html2canvas
class PDFExporter {
    constructor() {
        this.init();
    }

    init() {
        const exportBtn = document.getElementById('export-pdf');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportToPDF('standard', 'a4', null);
            });
        }
    }

    async exportToPDF(quality = 'standard', paperSize = 'a4', fileName = null) {
        try {
            const previewContent = document.getElementById('preview-content');
            if (!previewContent) {
                alert('No preview content found');
                return;
            }

            const currentTab = window.tabManager ? window.tabManager.getCurrentTab() : 'cv';
            const defaultFileName = currentTab === 'cv' ? 'CV.pdf' : 'Resume.pdf';
            const finalFileName = fileName || defaultFileName;
            
            // Check if html2canvas is available for better rendering
            if (typeof html2canvas !== 'undefined') {
                await this.exportWithCanvas(previewContent, currentTab, quality, paperSize, finalFileName);
            } else {
                // Fallback to text-based rendering
                this.exportTextBased(previewContent, currentTab, paperSize, finalFileName);
            }
        } catch (error) {
            console.error('PDF Export Error:', error);
            alert('Error generating PDF. Please try again.');
        }
    }

    async exportToPDFEnhanced(quality = 'standard', paperSize = 'a4', fileName = null) {
        return this.exportToPDF(quality, paperSize, fileName);
    }

    async exportWithCanvas(previewContent, currentTab, quality = 'standard', paperSize = 'a4', fileName = null) {
        try {
            // Determine scale based on quality
            const scale = quality === 'high' ? 3 : 2;
            
            // Use html2canvas for better visual rendering
            const canvas = await html2canvas(previewContent, {
                scale: scale,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });

            const { jsPDF } = window.jspdf;
            const imgData = canvas.toDataURL('image/png', quality === 'high' ? 1.0 : 0.92);
            
            // Get paper dimensions
            const paperDimensions = this.getPaperDimensions(paperSize);
            const imgWidth = paperDimensions.width;
            const pageHeight = paperDimensions.height;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;

            const doc = new jsPDF('p', 'mm', paperSize);
            let position = 0;

            doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft > 0) {
                position = heightLeft - imgHeight;
                doc.addPage();
                doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            const defaultFileName = currentTab === 'cv' ? 'CV.pdf' : 'Resume.pdf';
            const finalFileName = fileName || defaultFileName;
            doc.save(finalFileName);
        } catch (error) {
            console.warn('Canvas export failed, using text-based:', error);
            this.exportTextBased(previewContent, currentTab, paperSize, fileName);
        }
    }

    getPaperDimensions(paperSize) {
        const dimensions = {
            'a4': { width: 210, height: 297 },
            'letter': { width: 216, height: 279 },
            'legal': { width: 216, height: 356 }
        };
        return dimensions[paperSize] || dimensions['a4'];
    }

    exportTextBased(previewContent, currentTab, paperSize = 'a4', fileName = null) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: paperSize
        });

        this.renderPDFContent(doc, previewContent, currentTab, paperSize);

        const defaultFileName = currentTab === 'cv' ? 'CV.pdf' : 'Resume.pdf';
        const finalFileName = fileName || defaultFileName;
        doc.save(finalFileName);
    }

    renderPDFContent(doc, content, type, paperSize = 'a4') {
        let yPos = 20;
        const paperDimensions = this.getPaperDimensions(paperSize);
        const pageHeight = paperDimensions.height;
        const margin = 20;
        const maxWidth = paperDimensions.width - (margin * 2);

        // Helper to add new page if needed
        const checkPageBreak = (requiredSpace) => {
            if (yPos + requiredSpace > pageHeight - margin) {
                doc.addPage();
                yPos = margin;
                return true;
            }
            return false;
        };

        // Extract and render header
        const headerSection = content.querySelector('.preview-header-section');
        if (headerSection) {
            const name = headerSection.querySelector('.preview-name');
            const contact = headerSection.querySelector('.preview-contact');
            
            if (name) {
                doc.setFontSize(20);
                doc.setFont(undefined, 'bold');
                doc.text(name.textContent.trim(), margin, yPos);
                yPos += 10;
            }
            
            if (contact) {
                doc.setFontSize(10);
                doc.setFont(undefined, 'normal');
                const contactText = contact.textContent.trim().replace(/\s+/g, ' ');
                doc.text(contactText, margin, yPos, { maxWidth });
                yPos += 8;
            }
            
            yPos += 5;
            doc.line(margin, yPos, margin + maxWidth, yPos);
            yPos += 10;
        }

        // Extract and render summary
        const summary = content.querySelector('.preview-summary');
        if (summary) {
            checkPageBreak(15);
            doc.setFontSize(11);
            doc.setFont(undefined, 'italic');
            const summaryText = summary.textContent.trim();
            const summaryLines = doc.splitTextToSize(summaryText, maxWidth);
            doc.text(summaryLines, margin, yPos);
            yPos += summaryLines.length * 5 + 5;
        }

        // Extract and render sections
        const sections = content.querySelectorAll('.preview-section-title');
        sections.forEach(sectionTitle => {
            checkPageBreak(15);
            
            // Section title
            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            doc.text(sectionTitle.textContent.trim(), margin, yPos);
            yPos += 8;
            doc.line(margin, yPos - 2, margin + maxWidth, yPos - 2);
            yPos += 5;

            // Section content
            let currentElement = sectionTitle.nextElementSibling;
            while (currentElement && !currentElement.classList.contains('preview-section-title')) {
                if (currentElement.classList.contains('preview-entry')) {
                    checkPageBreak(20);
                    
                    const entryTitle = currentElement.querySelector('.preview-entry-title');
                    const entrySubtitle = currentElement.querySelector('.preview-entry-subtitle');
                    const entryDetails = currentElement.querySelector('.preview-entry-details');
                    
                    if (entryTitle) {
                        doc.setFontSize(12);
                        doc.setFont(undefined, 'bold');
                        doc.text(entryTitle.textContent.trim(), margin, yPos);
                        yPos += 6;
                    }
                    
                    if (entrySubtitle) {
                        doc.setFontSize(10);
                        doc.setFont(undefined, 'normal');
                        doc.text(entrySubtitle.textContent.trim(), margin, yPos);
                        yPos += 5;
                    }
                    
                    if (entryDetails) {
                        doc.setFontSize(10);
                        const detailsText = entryDetails.textContent.trim();
                        const detailsLines = doc.splitTextToSize(detailsText, maxWidth);
                        doc.text(detailsLines, margin, yPos);
                        yPos += detailsLines.length * 5;
                    }
                    
                    yPos += 3;
                } else if (currentElement.classList.contains('preview-skills')) {
                    checkPageBreak(10);
                    const skillItems = currentElement.querySelectorAll('.preview-skill-item');
                    let skillText = '';
                    skillItems.forEach((item, index) => {
                        if (index > 0) skillText += ', ';
                        skillText += item.textContent.trim();
                    });
                    doc.setFontSize(10);
                    const skillLines = doc.splitTextToSize(skillText, maxWidth);
                    doc.text(skillLines, margin, yPos);
                    yPos += skillLines.length * 5 + 5;
                }
                
                currentElement = currentElement.nextElementSibling;
            }
        });
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.pdfExporter = new PDFExporter();
    });
} else {
    window.pdfExporter = new PDFExporter();
}

