// DOCX Export using html-docx-js
class DOCXExporter {
    constructor() {
        this.init();
    }

    init() {
        const exportBtn = document.getElementById('export-docx');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportToDOCX('standard', 'a4', null);
            });
        }
    }

    exportToDOCX() {
        try {
            const previewContent = document.getElementById('preview-content');
            if (!previewContent) {
                alert('No preview content found');
                return;
            }

            const currentTab = window.tabManager ? window.tabManager.getCurrentTab() : 'cv';
            const fileName = currentTab === 'cv' ? 'CV.docx' : 'Resume.docx';

            // Try htmlDocx first
            if (typeof htmlDocx !== 'undefined' && htmlDocx.asBlob) {
                const clonedContent = previewContent.cloneNode(true);
                this.addInlineStyles(clonedContent);
                const htmlString = '<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>' + clonedContent.outerHTML + '</body></html>';
                
                try {
                    const converted = htmlDocx.asBlob(htmlString);
                    if (typeof saveAs !== 'undefined') {
                        saveAs(converted, fileName);
                    } else {
                        this.downloadBlob(converted, fileName);
                    }
                    return;
                } catch (e) {
                    console.warn('htmlDocx conversion failed, using fallback:', e);
                }
            }

            // Fallback: Create a simple HTML file that can be opened in Word
            this.createSimpleDOCX(previewContent, fileName);
        } catch (error) {
            console.error('DOCX Export Error:', error);
            alert('Error generating DOCX. Using fallback method.');
            this.createSimpleDOCX(document.getElementById('preview-content'), 
                window.tabManager ? (window.tabManager.getCurrentTab() === 'cv' ? 'CV.docx' : 'Resume.docx') : 'Document.docx');
        }
    }

    createSimpleDOCX(content, fileName, paperSize = 'a4') {
        // Get page size CSS
        const pageSizeCSS = this.getPageSizeCSS(paperSize);
        
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
        @page { size: ${paperSize === 'letter' ? 'letter' : paperSize === 'legal' ? 'legal' : 'A4'}; margin: 1in; }
        body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.6; margin: 1in; }
        .preview-name { font-size: 20pt; font-weight: bold; margin-bottom: 10pt; }
        .preview-contact { font-size: 10pt; margin-bottom: 15pt; }
        .preview-section-title { font-size: 14pt; font-weight: bold; margin-top: 15pt; margin-bottom: 10pt; border-bottom: 1px solid #000; padding-bottom: 3pt; }
        .preview-entry-title { font-size: 12pt; font-weight: bold; }
        .preview-entry-subtitle { font-size: 10pt; color: #666; }
        .preview-entry-details { font-size: 10pt; margin-top: 5pt; }
        .preview-summary { font-style: italic; margin-bottom: 15pt; }
        .preview-skills { margin-top: 5pt; }
        .preview-skill-item { display: inline-block; margin-right: 10pt; }
    </style>
</head>
<body>
${content.innerHTML}
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

    addInlineStyles(element, paperSize = 'a4') {
        // Add basic inline styles for better DOCX rendering
        const style = document.createElement('style');
        style.textContent = `
            @page { size: ${paperSize === 'letter' ? 'letter' : paperSize === 'legal' ? 'legal' : 'A4'}; }
            body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.6; }
            .preview-name { font-size: 20pt; font-weight: bold; margin-bottom: 10pt; }
            .preview-contact { font-size: 10pt; margin-bottom: 15pt; }
            .preview-section-title { font-size: 14pt; font-weight: bold; margin-top: 15pt; margin-bottom: 10pt; }
            .preview-entry-title { font-size: 12pt; font-weight: bold; }
            .preview-entry-subtitle { font-size: 10pt; color: #666; }
            .preview-entry-details { font-size: 10pt; margin-top: 5pt; }
            .preview-summary { font-style: italic; margin-bottom: 15pt; }
        `;
        element.insertBefore(style, element.firstChild);
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

