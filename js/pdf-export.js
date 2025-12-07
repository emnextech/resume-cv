// PDF Export using jsPDF and html2canvas
class PDFExporter {
    constructor() {
        this.init();
    }

    init() {
        // Button may not exist if using dropdown - handled by export-enhancements.js
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

            // Ensure preview is fully rendered with all styles applied
            // Force a reflow to ensure all CSS is applied
            void previewContent.offsetHeight;
            
            // Wait a brief moment for any pending style calculations
            await new Promise(resolve => setTimeout(resolve, 100));

            const defaultFileName = 'CV.pdf';
            const finalFileName = fileName || defaultFileName;
            
            // Check if html2canvas is available for better rendering
            // Canvas export preserves all visual styles (template, color, font)
            if (typeof html2canvas !== 'undefined') {
                await this.exportWithCanvas(previewContent, 'cv', quality, paperSize, finalFileName);
            } else {
                // Fallback to text-based rendering (limited style support)
                this.exportTextBased(previewContent, 'cv', paperSize, finalFileName);
            }
        } catch (error) {
            console.error('PDF Export Error:', error);
            alert('Error generating PDF. Please try again.');
        }
    }

    async exportToPDFEnhanced(quality = 'standard', paperSize = 'a4', fileName = null) {
        return this.exportToPDF(quality, paperSize, fileName);
    }

    async exportWithCanvas(previewContent, currentTab = 'cv', quality = 'standard', paperSize = 'a4', fileName = null) {
        try {
            // Standard 1 inch (25.4mm) margins on all sides
            const margin = 25.4;
            const paperDimensions = this.getPaperDimensions(paperSize);
            const pageWidth = paperDimensions.width;
            const pageHeight = paperDimensions.height;
            
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
            
            // Calculate image dimensions to fit within margins
            // Content area width: page width minus left and right margins
            const contentAreaWidth = pageWidth - (margin * 2);
            const imgWidth = contentAreaWidth;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;

            const doc = new jsPDF('p', 'mm', paperSize);
            // Start image at left margin position
            let position = margin;

            doc.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
            heightLeft -= (pageHeight - (margin * 2));

            while (heightLeft > 0) {
                position = margin;
                doc.addPage();
                doc.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
                heightLeft -= (pageHeight - (margin * 2));
            }

            const defaultFileName = 'CV.pdf';
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

    exportTextBased(previewContent, currentTab = 'cv', paperSize = 'a4', fileName = null) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: paperSize
        });

        this.renderPDFContent(doc, previewContent, currentTab, paperSize);

        const defaultFileName = 'CV.pdf';
        const finalFileName = fileName || defaultFileName;
        doc.save(finalFileName);
    }

    renderPDFContent(doc, content, type = 'cv', paperSize = 'a4') {
        // Standard 1 inch (25.4mm) margins on all sides
        const margin = 25.4;
        const paperDimensions = this.getPaperDimensions(paperSize);
        const pageHeight = paperDimensions.height;
        const pageWidth = paperDimensions.width;
        
        // Content starts slightly inward from margins (left alignment)
        // Content area width: page width minus left and right margins
        const contentAreaWidth = pageWidth - (margin * 2);
        const contentStartX = margin;
        
        // Table width must not exceed the printable area
        const maxTableWidth = contentAreaWidth;
        const maxWidth = contentAreaWidth;
        
        let yPos = margin;

        // Helper to add new page if needed
        const checkPageBreak = (requiredSpace) => {
            if (yPos + requiredSpace > pageHeight - margin) {
                doc.addPage();
                yPos = margin; // Reset to top margin on new page
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
            doc.text(summaryLines, contentStartX, yPos);
            yPos += summaryLines.length * 5 + 5;
        }

        // Extract and render sections
        const sections = content.querySelectorAll('.preview-section-title');
        sections.forEach(sectionTitle => {
            checkPageBreak(15);
            
            // Section title
            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            doc.text(sectionTitle.textContent.trim(), contentStartX, yPos);
            yPos += 8;
            doc.line(contentStartX, yPos - 2, contentStartX + maxWidth, yPos - 2);
            yPos += 5;

            // Section content
            let currentElement = sectionTitle.nextElementSibling;
            while (currentElement && !currentElement.classList.contains('preview-section-title')) {
                // Handle education tables and other tables that appear directly after section titles
                if (currentElement.tagName === 'TABLE' || currentElement.classList.contains('preview-education-table')) {
                    checkPageBreak(20);
                    const table = currentElement.tagName === 'TABLE' ? currentElement : currentElement.querySelector('table');
                    if (table) {
                        const tableHeight = this.renderTable(doc, table, contentStartX, yPos, maxTableWidth);
                        yPos = tableHeight + 5; // Space after table
                    }
                } else if (currentElement.classList.contains('preview-entry')) {
                    checkPageBreak(20);
                    
                    const entryTitle = currentElement.querySelector('.preview-entry-title');
                    const entrySubtitle = currentElement.querySelector('.preview-entry-subtitle');
                    const entryDetails = currentElement.querySelector('.preview-entry-details');
                    
                    if (entryTitle) {
                        doc.setFontSize(12);
                        doc.setFont(undefined, 'bold');
                        doc.text(entryTitle.textContent.trim(), contentStartX, yPos);
                        yPos += 6;
                    }
                    
                    if (entrySubtitle) {
                        doc.setFontSize(10);
                        doc.setFont(undefined, 'normal');
                        doc.text(entrySubtitle.textContent.trim(), contentStartX, yPos);
                        yPos += 5;
                    }
                    
                    if (entryDetails) {
                        doc.setFontSize(10);
                        const detailsText = entryDetails.textContent.trim();
                        const detailsLines = doc.splitTextToSize(detailsText, maxWidth);
                        doc.text(detailsLines, contentStartX, yPos);
                        yPos += detailsLines.length * 5;
                    }
                    
                    // Handle tables within entries
                    const table = currentElement.querySelector('table');
                    if (table) {
                        checkPageBreak(15);
                        const tableHeight = this.renderTable(doc, table, contentStartX, yPos, maxTableWidth);
                        yPos = tableHeight + 5; // Space after table
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
                    doc.text(skillLines, contentStartX, yPos);
                    yPos += skillLines.length * 5 + 5;
                }
                
                currentElement = currentElement.nextElementSibling;
            }
        });
    }

    renderTable(doc, table, startX, startY, maxWidth) {
        // Render table ensuring it stays within printable area (between left and right margins)
        const rows = table.querySelectorAll('tr');
        let currentY = startY;
        const baseRowHeight = 8;
        const cellPadding = 2;
        const lineHeight = 5;
        
        rows.forEach((row, rowIndex) => {
            const cells = row.querySelectorAll('th, td');
            const cellCount = cells.length;
            if (cellCount === 0) return;
            
            // Table width must not exceed printable area
            const cellWidth = maxWidth / cellCount;
            let currentX = startX;
            let maxRowHeight = baseRowHeight;
            
            // First pass: calculate row height based on content
            cells.forEach((cell) => {
                const cellText = cell.textContent.trim();
                const textLines = doc.splitTextToSize(cellText, cellWidth - (cellPadding * 2));
                const cellHeight = Math.max(baseRowHeight, textLines.length * lineHeight + (cellPadding * 2));
                maxRowHeight = Math.max(maxRowHeight, cellHeight);
            });
            
            // Second pass: render cells
            cells.forEach((cell, cellIndex) => {
                const cellText = cell.textContent.trim();
                doc.setFontSize(10);
                doc.setFont(undefined, row.querySelector('th') ? 'bold' : 'normal');
                
                // Ensure text fits in cell
                const textLines = doc.splitTextToSize(cellText, cellWidth - (cellPadding * 2));
                doc.text(textLines, currentX + cellPadding, currentY + 5);
                
                // Draw cell border - table stays within printable area
                doc.rect(currentX, currentY - maxRowHeight, cellWidth, maxRowHeight);
                
                currentX += cellWidth;
            });
            
            currentY += maxRowHeight;
        });
        
        return currentY;
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

