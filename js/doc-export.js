// DOCX Export using html-docx-js
class DOCXExporter {
    constructor() {
        this.init();
    }

    init() {
        // Button may not exist if using dropdown - handled by export-enhancements.js
        const exportBtn = document.getElementById('export-docx');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportToDOCX('standard', 'a4', null);
            });
        }
    }

    exportToDOCX(quality = 'standard', paperSize = 'a4', fileName = null) {
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

            // Use the reliable fallback method that creates an HTML file Word can open directly
            // This method doesn't require external libraries and avoids CORS/CORB issues
            // Word will automatically recognize and format the HTML file when opened
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

