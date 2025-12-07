// Preview Enhancements: Zoom, Fullscreen, Print Preview, Scroll-to-Section, Copy-to-Clipboard
class PreviewEnhancements {
    constructor() {
        this.zoomLevel = 100;
        this.isPrintMode = false;
        this.isFullscreen = false;
        this.init();
    }

    init() {
        this.createPreviewControls();
        this.setupEventListeners();
        this.setupScrollToSection();
    }

    createPreviewControls() {
        // Controls moved to navbar - this function no longer needed
        // But we still need to create zoom and action controls if needed
        // For now, we'll skip this as controls are in navbar
        return;
    }

    setupEventListeners() {
        // Zoom controls
        document.getElementById('zoom-in')?.addEventListener('click', () => this.zoomIn());
        document.getElementById('zoom-out')?.addEventListener('click', () => this.zoomOut());
        document.getElementById('zoom-reset')?.addEventListener('click', () => this.resetZoom());
        
        // Action controls
        document.getElementById('copy-text')?.addEventListener('click', () => this.copyToClipboard());
        document.getElementById('print-preview')?.addEventListener('click', () => this.togglePrintPreview());
        document.getElementById('fullscreen')?.addEventListener('click', () => this.toggleFullscreen());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                if (e.key === '=' || e.key === '+') {
                    e.preventDefault();
                    this.zoomIn();
                } else if (e.key === '-') {
                    e.preventDefault();
                    this.zoomOut();
                } else if (e.key === '0') {
                    e.preventDefault();
                    this.resetZoom();
                }
            }
        });

        // Exit fullscreen on ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isFullscreen) {
                this.toggleFullscreen();
            }
        });
    }

    zoomIn() {
        this.zoomLevel = Math.min(this.zoomLevel + 10, 200);
        this.applyZoom();
    }

    zoomOut() {
        this.zoomLevel = Math.max(this.zoomLevel - 10, 50);
        this.applyZoom();
    }

    resetZoom() {
        this.zoomLevel = 100;
        this.applyZoom();
    }

    applyZoom() {
        const previewContent = document.getElementById('preview-content');
        if (previewContent) {
            previewContent.style.transform = `scale(${this.zoomLevel / 100})`;
            previewContent.style.transformOrigin = 'top left';
            previewContent.style.transition = 'transform 0.2s ease';
        }
        const zoomLevelDisplay = document.getElementById('zoom-level');
        if (zoomLevelDisplay) {
            zoomLevelDisplay.textContent = `${this.zoomLevel}%`;
        }
    }

    togglePrintPreview() {
        this.isPrintMode = !this.isPrintMode;
        const previewContainer = document.querySelector('.preview-container');
        const previewContent = document.getElementById('preview-content');
        
        if (this.isPrintMode) {
            previewContainer?.classList.add('print-preview-mode');
            previewContent?.classList.add('print-preview-mode');
            document.getElementById('print-preview')?.classList.add('active');
        } else {
            previewContainer?.classList.remove('print-preview-mode');
            previewContent?.classList.remove('print-preview-mode');
            document.getElementById('print-preview')?.classList.remove('active');
        }
    }

    toggleFullscreen() {
        const previewSection = document.querySelector('.preview-section');
        if (!previewSection) return;

        if (!this.isFullscreen) {
            // Enter fullscreen
            if (previewSection.requestFullscreen) {
                previewSection.requestFullscreen();
            } else if (previewSection.webkitRequestFullscreen) {
                previewSection.webkitRequestFullscreen();
            } else if (previewSection.msRequestFullscreen) {
                previewSection.msRequestFullscreen();
            }
            previewSection.classList.add('fullscreen-mode');
            this.isFullscreen = true;
            document.getElementById('fullscreen')?.classList.add('active');
        } else {
            // Exit fullscreen
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
            previewSection.classList.remove('fullscreen-mode');
            this.isFullscreen = false;
            document.getElementById('fullscreen')?.classList.remove('active');
        }
    }

    copyToClipboard() {
        const previewContent = document.getElementById('preview-content');
        if (!previewContent) return;

        // Get all text content
        const text = previewContent.innerText || previewContent.textContent;
        
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                this.showNotification('Text copied to clipboard!', 'success');
            }).catch(() => {
                this.fallbackCopyText(text);
            });
        } else {
            this.fallbackCopyText(text);
        }
    }

    fallbackCopyText(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            this.showNotification('Text copied to clipboard!', 'success');
        } catch (err) {
            this.showNotification('Failed to copy text', 'error');
        }
        
        document.body.removeChild(textArea);
    }

    setupScrollToSection() {
        // Section navigation removed - no longer needed
        return;
    }

    smoothScrollToSection(element) {
        const previewContainer = document.querySelector('.preview-container');
        if (!previewContainer || !element) return;

        const containerRect = previewContainer.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        const scrollTop = previewContainer.scrollTop;
        const targetScroll = scrollTop + elementRect.top - containerRect.top - 20;

        previewContainer.scrollTo({
            top: targetScroll,
            behavior: 'smooth'
        });

        // Highlight the section briefly
        element.style.transition = 'background-color 0.3s ease';
        element.style.backgroundColor = 'rgba(38, 156, 204, 0.1)';
        setTimeout(() => {
            element.style.backgroundColor = '';
        }, 1000);
    }

    showNotification(message, type = 'info') {
        // Remove existing notification
        const existing = document.querySelector('.preview-notification');
        if (existing) {
            existing.remove();
        }

        const notification = document.createElement('div');
        notification.className = `preview-notification preview-notification-${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        // Hide after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
}

// Initialize when DOM is ready and preview is available
function initPreviewEnhancements() {
    // Wait for preview content to be available
    const checkPreview = setInterval(() => {
        const previewContent = document.getElementById('preview-content');
        if (previewContent || document.querySelector('.preview-section')) {
            clearInterval(checkPreview);
            if (!window.previewEnhancements) {
                window.previewEnhancements = new PreviewEnhancements();
            }
        }
    }, 100);

    // Timeout after 5 seconds
    setTimeout(() => {
        clearInterval(checkPreview);
        if (!window.previewEnhancements) {
            window.previewEnhancements = new PreviewEnhancements();
        }
    }, 5000);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPreviewEnhancements);
} else {
    initPreviewEnhancements();
}
