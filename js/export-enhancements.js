// Export Enhancements: Quality, Paper Size, Notifications, History
class ExportEnhancements {
    constructor() {
        this.exportHistory = this.loadExportHistory();
        this.currentExportSettings = {
            quality: 'standard',
            paperSize: 'a4'
        };
        this.init();
    }

    init() {
        this.createExportOptions();
        this.setupEventListeners();
        this.updateExportButtons();
    }

    createExportOptions() {
        // Export buttons are now in navbar - skip enhanced options for simplicity
        // The basic export buttons (export-pdf, export-docx) will work directly
        return;
    }

    setupEventListeners() {
        // Quality and paper size selectors
        document.getElementById('export-quality')?.addEventListener('change', (e) => {
            this.currentExportSettings.quality = e.target.value;
        });

        document.getElementById('export-paper-size')?.addEventListener('change', (e) => {
            this.currentExportSettings.paperSize = e.target.value;
        });

        // Enhanced export buttons
        document.getElementById('export-pdf-enhanced')?.addEventListener('click', () => {
            this.exportPDF();
        });

        document.getElementById('export-docx-enhanced')?.addEventListener('click', () => {
            this.exportDOCX();
        });

        // Clear history
        document.getElementById('clear-history')?.addEventListener('click', () => {
            this.clearExportHistory();
        });

        // Show/hide history
        this.updateHistoryDisplay();
    }

    updateExportButtons() {
        // Trigger original export buttons through enhanced ones
        const pdfBtn = document.getElementById('export-pdf');
        const docxBtn = document.getElementById('export-docx');
        
        if (pdfBtn && docxBtn) {
            // The enhanced buttons will call the export methods directly
        }
    }

    async exportPDF() {
        const button = document.getElementById('export-pdf-enhanced');
        if (!button) return;

        try {
            this.showLoadingState(button, 'Generating PDF...');
            this.showProgress(0);
            
            const previewContent = document.getElementById('preview-content');
            if (!previewContent) {
                this.showNotification('No preview content found', 'error');
                this.hideLoadingState(button);
                this.hideProgress();
                return;
            }

            const currentTab = window.tabManager ? window.tabManager.getCurrentTab() : 'cv';
            const fileName = currentTab === 'cv' ? 'CV.pdf' : 'Resume.pdf';

            // Get export settings
            const quality = this.currentExportSettings.quality;
            const paperSize = this.currentExportSettings.paperSize;

            // Simulate progress
            this.updateProgress(30);
            await new Promise(resolve => setTimeout(resolve, 100));

            // Call PDF exporter with settings
            this.updateProgress(60);
            if (window.pdfExporter && typeof window.pdfExporter.exportToPDFEnhanced === 'function') {
                await window.pdfExporter.exportToPDFEnhanced(quality, paperSize, fileName);
            } else if (window.pdfExporter && typeof window.pdfExporter.exportToPDF === 'function') {
                await window.pdfExporter.exportToPDF(quality, paperSize, fileName);
            } else {
                // Fallback to original export
                document.getElementById('export-pdf')?.click();
            }
            
            this.updateProgress(100);
            await new Promise(resolve => setTimeout(resolve, 200));
            
            this.addToHistory('PDF', fileName, quality, paperSize);
            this.showNotification(`PDF exported successfully!`, 'success');
        } catch (error) {
            console.error('PDF Export Error:', error);
            this.showNotification('Error generating PDF. Please try again.', 'error');
        } finally {
            this.hideLoadingState(button);
            this.hideProgress();
        }
    }

    async exportDOCX() {
        const button = document.getElementById('export-docx-enhanced');
        if (!button) return;

        try {
            this.showLoadingState(button, 'Generating DOCX...');
            this.showProgress(0);
            
            const previewContent = document.getElementById('preview-content');
            if (!previewContent) {
                this.showNotification('No preview content found', 'error');
                this.hideLoadingState(button);
                this.hideProgress();
                return;
            }

            const currentTab = window.tabManager ? window.tabManager.getCurrentTab() : 'cv';
            const fileName = currentTab === 'cv' ? 'CV.docx' : 'Resume.docx';

            // Get export settings
            const quality = this.currentExportSettings.quality;
            const paperSize = this.currentExportSettings.paperSize;

            // Simulate progress
            this.updateProgress(30);
            await new Promise(resolve => setTimeout(resolve, 100));

            // Call DOCX exporter with settings
            this.updateProgress(60);
            if (window.docxExporter && typeof window.docxExporter.exportToDOCXEnhanced === 'function') {
                await window.docxExporter.exportToDOCXEnhanced(quality, paperSize, fileName);
            } else if (window.docxExporter && typeof window.docxExporter.exportToDOCX === 'function') {
                await window.docxExporter.exportToDOCX(quality, paperSize, fileName);
            } else {
                // Fallback to original export
                document.getElementById('export-docx')?.click();
            }
            
            this.updateProgress(100);
            await new Promise(resolve => setTimeout(resolve, 200));
            
            this.addToHistory('DOCX', fileName, quality, paperSize);
            this.showNotification(`DOCX exported successfully!`, 'success');
        } catch (error) {
            console.error('DOCX Export Error:', error);
            this.showNotification('Error generating DOCX. Please try again.', 'error');
        } finally {
            this.hideLoadingState(button);
            this.hideProgress();
        }
    }

    showLoadingState(button, message) {
        button.disabled = true;
        button.classList.add('loading');
        const text = button.querySelector('.export-btn-text');
        if (text) {
            text.textContent = message;
        }
    }

    hideLoadingState(button) {
        button.disabled = false;
        button.classList.remove('loading');
        const text = button.querySelector('.export-btn-text');
        if (text) {
            const icon = button.querySelector('.export-btn-icon');
            if (icon.textContent === '📄') {
                text.textContent = 'Download PDF';
            } else {
                text.textContent = 'Download DOCX';
            }
        }
    }

    addToHistory(type, fileName, quality, paperSize) {
        const exportRecord = {
            type,
            fileName,
            quality,
            paperSize,
            timestamp: new Date().toISOString(),
            date: new Date().toLocaleString()
        };

        this.exportHistory.unshift(exportRecord);
        
        // Keep only last 10 exports
        if (this.exportHistory.length > 10) {
            this.exportHistory = this.exportHistory.slice(0, 10);
        }

        this.saveExportHistory();
        this.updateHistoryDisplay();
    }

    loadExportHistory() {
        try {
            const history = localStorage.getItem('exportHistory');
            return history ? JSON.parse(history) : [];
        } catch (e) {
            return [];
        }
    }

    saveExportHistory() {
        try {
            localStorage.setItem('exportHistory', JSON.stringify(this.exportHistory));
        } catch (e) {
            console.warn('Could not save export history:', e);
        }
    }

    clearExportHistory() {
        this.exportHistory = [];
        this.saveExportHistory();
        this.updateHistoryDisplay();
    }

    updateHistoryDisplay() {
        const container = document.getElementById('export-history-container');
        const list = document.getElementById('export-history-list');
        
        if (!container || !list) return;

        if (this.exportHistory.length === 0) {
            container.style.display = 'none';
            return;
        }

        container.style.display = 'block';
        list.innerHTML = '';

        this.exportHistory.forEach((record, index) => {
            const item = document.createElement('div');
            item.className = 'export-history-item';
            item.innerHTML = `
                <div class="history-item-icon">${record.type === 'PDF' ? '📄' : '📝'}</div>
                <div class="history-item-details">
                    <div class="history-item-name">${record.fileName}</div>
                    <div class="history-item-meta">${record.quality} quality • ${record.paperSize.toUpperCase()} • ${record.date}</div>
                </div>
            `;
            list.appendChild(item);
        });
    }

    showNotification(message, type = 'info') {
        // Remove existing notification
        const existing = document.querySelector('.export-notification');
        if (existing) {
            existing.remove();
        }

        const notification = document.createElement('div');
        notification.className = `export-notification export-notification-${type}`;
        notification.innerHTML = `
            <div class="notification-icon">${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</div>
            <div class="notification-message">${message}</div>
        `;
        document.body.appendChild(notification);

        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        // Hide after 4 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 4000);
    }

    getExportSettings() {
        return { ...this.currentExportSettings };
    }

    showProgress(percentage) {
        const progress = document.getElementById('export-progress');
        const progressBar = document.getElementById('export-progress-bar');
        if (progress && progressBar) {
            progress.classList.add('active');
            progressBar.style.width = `${percentage}%`;
        }
    }

    updateProgress(percentage) {
        const progressBar = document.getElementById('export-progress-bar');
        if (progressBar) {
            progressBar.style.width = `${percentage}%`;
        }
    }

    hideProgress() {
        const progress = document.getElementById('export-progress');
        if (progress) {
            setTimeout(() => {
                progress.classList.remove('active');
                const progressBar = document.getElementById('export-progress-bar');
                if (progressBar) {
                    progressBar.style.width = '0%';
                }
            }, 300);
        }
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.exportEnhancements = new ExportEnhancements();
    });
} else {
    window.exportEnhancements = new ExportEnhancements();
}
