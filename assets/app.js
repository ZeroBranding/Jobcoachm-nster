/**
 * Main Application JavaScript
 * Handles forms, consent management, accessibility, and user interactions
 */

class JobcoachApp {
    constructor() {
        this.consentData = this.loadConsent();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeConsent();
        this.setupFormValidation();
        this.setupAccessibility();
        this.setupNavigation();
        this.initializeQuickCheck();
        this.setupConsentModals();
        this.scheduleDataDeletion();
    }

    setupEventListeners() {
        // DOM Content Loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.onDOMReady());
        } else {
            this.onDOMReady();
        }

        // Window events
        window.addEventListener('resize', this.debounce(() => this.handleResize(), 250));
        window.addEventListener('scroll', this.throttle(() => this.handleScroll(), 16));
    }

    onDOMReady() {
        this.showCookieBanner();
        this.initializeAnimations();
        this.setupFormHandlers();
    }

    // Consent Management
    initializeConsent() {
        const banner = document.getElementById('cookie-banner');
        if (!banner) return;

        // Cookie consent buttons
        document.getElementById('accept-all-cookies')?.addEventListener('click', () => {
            this.setConsent({ essential: true, analytics: true, marketing: true });
            this.hideCookieBanner();
        });

        document.getElementById('accept-selected-cookies')?.addEventListener('click', () => {
            const essential = document.getElementById('essential-cookies')?.checked || false;
            const analytics = document.getElementById('analytics-cookies')?.checked || false;
            const marketing = document.getElementById('marketing-cookies')?.checked || false;
            
            this.setConsent({ essential, analytics, marketing });
            this.hideCookieBanner();
        });

        document.getElementById('reject-optional-cookies')?.addEventListener('click', () => {
            this.setConsent({ essential: true, analytics: false, marketing: false });
            this.hideCookieBanner();
        });

        // Cookie settings buttons
        document.getElementById('cookie-settings')?.addEventListener('click', () => {
            this.showCookieSettings();
        });

        document.getElementById('cookie-settings-footer')?.addEventListener('click', () => {
            this.showCookieSettings();
        });
    }

    loadConsent() {
        try {
            const stored = localStorage.getItem('cookie-consent');
            return stored ? JSON.parse(stored) : null;
        } catch (error) {
            console.error('Error loading consent data:', error);
            return null;
        }
    }

    setConsent(preferences) {
        const consentData = {
            ...preferences,
            timestamp: new Date().toISOString(),
            version: '1.0'
        };

        try {
            localStorage.setItem('cookie-consent', JSON.stringify(consentData));
            this.consentData = consentData;
            this.applyConsent(preferences);
            this.logConsentAction('consent_given', preferences);
        } catch (error) {
            console.error('Error saving consent:', error);
        }
    }

    applyConsent(preferences) {
        // Analytics
        if (preferences.analytics) {
            this.loadAnalytics();
        } else {
            this.removeAnalytics();
        }

        // Marketing
        if (preferences.marketing) {
            this.loadMarketing();
        } else {
            this.removeMarketing();
        }
    }

    loadAnalytics() {
        // Only load analytics if user consented
        console.log('Analytics consent granted - would load analytics scripts here');
        // Example: Google Analytics, Matomo, etc.
    }

    removeAnalytics() {
        // Remove analytics cookies and scripts
        console.log('Analytics consent revoked - removing analytics');
    }

    loadMarketing() {
        // Only load marketing scripts if user consented
        console.log('Marketing consent granted - would load marketing scripts here');
    }

    removeMarketing() {
        // Remove marketing cookies and scripts
        console.log('Marketing consent revoked - removing marketing');
    }

    showCookieBanner() {
        if (!this.consentData) {
            const banner = document.getElementById('cookie-banner');
            if (banner) {
                banner.hidden = false;
                banner.setAttribute('aria-hidden', 'false');
                // Focus management for accessibility
                const firstButton = banner.querySelector('button');
                if (firstButton) {
                    setTimeout(() => firstButton.focus(), 100);
                }
            }
        } else {
            this.applyConsent(this.consentData);
        }
    }

    hideCookieBanner() {
        const banner = document.getElementById('cookie-banner');
        if (banner) {
            banner.hidden = true;
            banner.setAttribute('aria-hidden', 'true');
        }
    }

    showCookieSettings() {
        // Show cookie settings modal (would implement modal here)
        alert('Cookie-Einstellungen würden hier in einem Modal angezeigt.');
    }

    logConsentAction(action, data) {
        const logEntry = {
            action,
            data,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };

        try {
            const logs = JSON.parse(localStorage.getItem('consent-logs') || '[]');
            logs.push(logEntry);
            // Keep only last 50 entries
            if (logs.length > 50) {
                logs.splice(0, logs.length - 50);
            }
            localStorage.setItem('consent-logs', JSON.stringify(logs));
        } catch (error) {
            console.error('Error logging consent action:', error);
        }
    }

    // Consent Modals for Microphone, Upload, WhatsApp
    setupConsentModals() {
        this.setupMicrophoneConsent();
        this.setupUploadConsent();
        this.setupWhatsAppConsent();
    }

    setupMicrophoneConsent() {
        const button = document.getElementById('microphone-consent');
        const modal = document.getElementById('microphone-consent-modal');
        const acceptBtn = document.getElementById('microphone-consent-accept');
        const rejectBtn = document.getElementById('microphone-consent-reject');

        if (!button || !modal) return;

        button.addEventListener('click', () => {
            this.showModal(modal);
        });

        acceptBtn?.addEventListener('click', () => {
            this.setSpecificConsent('microphone', true);
            this.hideModal(modal);
            this.enableMicrophone();
        });

        rejectBtn?.addEventListener('click', () => {
            this.setSpecificConsent('microphone', false);
            this.hideModal(modal);
        });
    }

    setupUploadConsent() {
        const button = document.getElementById('upload-consent');
        const modal = document.getElementById('upload-consent-modal');
        const acceptBtn = document.getElementById('upload-consent-accept');
        const rejectBtn = document.getElementById('upload-consent-reject');
        const fileInput = document.getElementById('document-upload');

        if (!button || !modal) return;

        button.addEventListener('click', () => {
            this.showModal(modal);
        });

        acceptBtn?.addEventListener('click', () => {
            this.setSpecificConsent('upload', true);
            this.hideModal(modal);
            this.enableUpload();
        });

        rejectBtn?.addEventListener('click', () => {
            this.setSpecificConsent('upload', false);
            this.hideModal(modal);
        });

        // Disable file input initially
        if (fileInput) {
            fileInput.disabled = !this.getSpecificConsent('upload');
        }
    }

    setupWhatsAppConsent() {
        const button = document.getElementById('whatsapp-consent');
        const modal = document.getElementById('whatsapp-consent-modal');
        const acceptBtn = document.getElementById('whatsapp-consent-accept');
        const rejectBtn = document.getElementById('whatsapp-consent-reject');

        if (!button || !modal) return;

        button.addEventListener('click', () => {
            this.showModal(modal);
        });

        acceptBtn?.addEventListener('click', () => {
            this.setSpecificConsent('whatsapp', true);
            this.hideModal(modal);
            this.enableWhatsApp();
        });

        rejectBtn?.addEventListener('click', () => {
            this.setSpecificConsent('whatsapp', false);
            this.hideModal(modal);
        });
    }

    setSpecificConsent(type, granted) {
        try {
            const consents = JSON.parse(localStorage.getItem('specific-consents') || '{}');
            consents[type] = {
                granted,
                timestamp: new Date().toISOString(),
                version: '1.0'
            };
            localStorage.setItem('specific-consents', JSON.stringify(consents));
            this.logConsentAction(`${type}_consent`, { granted });
        } catch (error) {
            console.error(`Error saving ${type} consent:`, error);
        }
    }

    getSpecificConsent(type) {
        try {
            const consents = JSON.parse(localStorage.getItem('specific-consents') || '{}');
            return consents[type]?.granted || false;
        } catch (error) {
            console.error(`Error getting ${type} consent:`, error);
            return false;
        }
    }

    enableMicrophone() {
        console.log('Microphone access enabled');
        // Would implement actual microphone functionality here
    }

    enableUpload() {
        const fileInput = document.getElementById('document-upload');
        if (fileInput) {
            fileInput.disabled = false;
            fileInput.parentElement.classList.remove('disabled');
        }
    }

    enableWhatsApp() {
        const button = document.getElementById('whatsapp-consent');
        if (button) {
            button.textContent = 'WhatsApp öffnen';
            button.onclick = () => {
                window.open('https://wa.me/49251XXXXXXX', '_blank');
            };
        }
    }

    // Modal Management
    showModal(modal) {
        if (!modal) return;

        modal.setAttribute('aria-hidden', 'false');
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        // Focus management
        const firstFocusable = modal.querySelector('button, input, select, textarea, a[href]');
        if (firstFocusable) {
            setTimeout(() => firstFocusable.focus(), 100);
        }

        // Escape key handling
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                this.hideModal(modal);
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);

        // Click outside to close
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hideModal(modal);
            }
        });
    }

    hideModal(modal) {
        if (!modal) return;

        modal.setAttribute('aria-hidden', 'true');
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }

    // Form Validation
    setupFormValidation() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
            
            // Real-time validation
            const inputs = form.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                input.addEventListener('blur', () => this.validateField(input));
                input.addEventListener('input', () => this.clearFieldError(input));
            });
        });
    }

    handleFormSubmit(e) {
        e.preventDefault();
        const form = e.target;
        
        if (this.validateForm(form)) {
            this.submitForm(form);
        } else {
            this.showErrorSummary(form);
        }
    }

    validateForm(form) {
        const inputs = form.querySelectorAll('input, select, textarea');
        let isValid = true;
        const errors = [];

        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
                const label = form.querySelector(`label[for="${input.id}"]`);
                const fieldName = label ? label.textContent.replace('*', '').trim() : input.name;
                errors.push({
                    field: input.id,
                    message: this.getFieldError(input),
                    fieldName
                });
            }
        });

        this.currentFormErrors = errors;
        return isValid;
    }

    validateField(field) {
        if (!field) return true;

        const value = field.value.trim();
        const type = field.type;
        const required = field.required;
        
        // Clear previous error
        this.clearFieldError(field);

        // Required validation
        if (required && !value) {
            this.setFieldError(field, 'Dieses Feld ist erforderlich.');
            return false;
        }

        if (!value) return true; // Skip other validations if field is empty and not required

        // Type-specific validation
        switch (type) {
            case 'email':
                if (!this.isValidEmail(value)) {
                    this.setFieldError(field, 'Bitte geben Sie eine gültige E-Mail-Adresse ein.');
                    return false;
                }
                break;

            case 'tel':
                if (!this.isValidPhone(value)) {
                    this.setFieldError(field, 'Bitte geben Sie eine gültige Telefonnummer ein.');
                    return false;
                }
                break;

            case 'text':
                if (field.minLength && value.length < field.minLength) {
                    this.setFieldError(field, `Mindestens ${field.minLength} Zeichen erforderlich.`);
                    return false;
                }
                break;

            case 'number':
                const num = parseFloat(value);
                if (isNaN(num)) {
                    this.setFieldError(field, 'Bitte geben Sie eine gültige Zahl ein.');
                    return false;
                }
                if (field.min && num < parseFloat(field.min)) {
                    this.setFieldError(field, `Mindestwert: ${field.min}`);
                    return false;
                }
                if (field.max && num > parseFloat(field.max)) {
                    this.setFieldError(field, `Höchstwert: ${field.max}`);
                    return false;
                }
                break;

            case 'file':
                if (field.files.length > 0) {
                    const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
                    const maxSize = 10 * 1024 * 1024; // 10MB

                    for (let file of field.files) {
                        if (!validTypes.includes(file.type)) {
                            this.setFieldError(field, 'Nur PDF, JPEG und PNG Dateien sind erlaubt.');
                            return false;
                        }
                        if (file.size > maxSize) {
                            this.setFieldError(field, 'Datei zu groß. Maximum: 10MB');
                            return false;
                        }
                    }
                }
                break;
        }

        // Pattern validation
        if (field.pattern && !new RegExp(field.pattern).test(value)) {
            if (field.id === 'postal-code') {
                this.setFieldError(field, 'Bitte geben Sie eine gültige 5-stellige Postleitzahl ein.');
            } else {
                this.setFieldError(field, 'Das Format ist ungültig.');
            }
            return false;
        }

        // Custom validation for specific fields
        if (field.name === 'message' && value.length < 20) {
            this.setFieldError(field, 'Bitte beschreiben Sie Ihre Situation ausführlicher (mindestens 20 Zeichen).');
            return false;
        }

        return true;
    }

    setFieldError(field, message) {
        const errorElement = document.getElementById(`${field.id}-error`);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.setAttribute('aria-live', 'polite');
        }
        
        field.setAttribute('aria-invalid', 'true');
        field.classList.add('error');
    }

    clearFieldError(field) {
        const errorElement = document.getElementById(`${field.id}-error`);
        if (errorElement) {
            errorElement.textContent = '';
        }
        
        field.setAttribute('aria-invalid', 'false');
        field.classList.remove('error');
    }

    getFieldError(field) {
        const errorElement = document.getElementById(`${field.id}-error`);
        return errorElement ? errorElement.textContent : '';
    }

    showErrorSummary(form) {
        const errorSummary = document.getElementById('error-summary');
        const errorList = document.getElementById('error-list');
        
        if (!errorSummary || !errorList || !this.currentFormErrors) return;

        errorList.innerHTML = '';
        
        this.currentFormErrors.forEach(error => {
            const li = document.createElement('li');
            const link = document.createElement('a');
            link.href = `#${error.field}`;
            link.textContent = `${error.fieldName}: ${error.message}`;
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const field = document.getElementById(error.field);
                if (field) {
                    field.focus();
                    field.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            });
            li.appendChild(link);
            errorList.appendChild(li);
        });

        errorSummary.hidden = false;
        errorSummary.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Auto-hide after 10 seconds
        setTimeout(() => {
            errorSummary.hidden = true;
        }, 10000);
    }

    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    isValidPhone(phone) {
        const re = /^[+0-9 ()-]{6,}$/;
        return re.test(phone);
    }

    // Form Submission
    async submitForm(form) {
        const formData = new FormData(form);
        const formId = form.id;
        
        this.showLoading();
        
        try {
            // Add CSRF token (would be generated server-side)
            formData.append('_token', this.getCSRFToken());
            
            const response = await fetch(`/api/${formId}`, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            if (result.success) {
                this.showSuccess(result.message || 'Ihre Nachricht wurde erfolgreich gesendet.');
                form.reset();
                this.scheduleDataDeletion();
            } else {
                this.showError(result.message || 'Ein Fehler ist aufgetreten.');
            }
        } catch (error) {
            console.error('Form submission error:', error);
            this.showError('Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
        } finally {
            this.hideLoading();
        }
    }

    getCSRFToken() {
        // In a real application, this would be generated server-side
        return 'dummy-csrf-token';
    }

    showLoading() {
        const spinner = document.getElementById('loading-spinner');
        if (spinner) {
            spinner.hidden = false;
        }
    }

    hideLoading() {
        const spinner = document.getElementById('loading-spinner');
        if (spinner) {
            spinner.hidden = true;
        }
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.setAttribute('role', 'alert');
        notification.setAttribute('aria-live', 'polite');
        notification.textContent = message;

        document.body.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }

    // Quick Check Calculator
    initializeQuickCheck() {
        const form = document.getElementById('quick-check-form');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.performQuickCheck();
        });
    }

    performQuickCheck() {
        const form = document.getElementById('quick-check-form');
        const resultDiv = document.getElementById('quick-check-result');
        
        if (!form || !resultDiv) return;

        const formData = new FormData(form);
        const data = {
            householdSize: parseInt(formData.get('householdSize')),
            monthlyIncome: parseFloat(formData.get('monthlyIncome')),
            rentCosts: parseFloat(formData.get('rentCosts')),
            postalCode: formData.get('postalCode')
        };

        // Simple eligibility check (would be more complex in real application)
        const results = this.calculateEligibility(data);
        
        resultDiv.innerHTML = this.generateResultsHTML(results);
        resultDiv.hidden = false;
        resultDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    calculateEligibility(data) {
        const results = {
            buergergeld: false,
            wohngeld: false,
            kindergeld: false,
            recommendations: []
        };

        // Simplified calculation logic
        const totalCosts = data.rentCosts;
        const income = data.monthlyIncome;
        const householdSize = data.householdSize;

        // Bürgergeld check (simplified)
        const buergergeldsatz = this.getBuergergeldsatz(householdSize);
        if (income < buergergeldsatz + totalCosts * 0.8) {
            results.buergergeld = true;
            results.recommendations.push('Bürgergeld könnte für Sie in Frage kommen.');
        }

        // Wohngeld check (simplified)
        if (income > buergergeldsatz * 0.5 && income < buergergeldsatz * 1.5) {
            results.wohngeld = true;
            results.recommendations.push('Wohngeld könnte Ihre Wohnkosten reduzieren.');
        }

        // Kindergeld (always available for families)
        if (householdSize > 1) {
            results.kindergeld = true;
            results.recommendations.push('Kindergeld steht Familien grundsätzlich zu.');
        }

        return results;
    }

    getBuergergeldsatz(householdSize) {
        // Simplified rates (would be configurable)
        const rates = {
            1: 500,
            2: 900,
            3: 1200,
            4: 1500,
            5: 1700
        };
        return rates[Math.min(householdSize, 5)] || 1700;
    }

    generateResultsHTML(results) {
        let html = '<h3>Ihre Ergebnisse:</h3>';
        
        if (results.recommendations.length > 0) {
            html += '<ul class="results-list">';
            results.recommendations.forEach(rec => {
                html += `<li>${rec}</li>`;
            });
            html += '</ul>';
            
            html += '<p><strong>Nächste Schritte:</strong></p>';
            html += '<p>Kontaktieren Sie uns für eine kostenlose, detaillierte Beratung. Wir prüfen Ihre Ansprüche genau und helfen Ihnen bei der Antragstellung.</p>';
            html += '<a href="#contact" class="btn btn-primary">Kostenlose Beratung</a>';
        } else {
            html += '<p>Basierend auf Ihren Angaben könnten Sie möglicherweise keinen Anspruch auf die genannten Leistungen haben.</p>';
            html += '<p>Kontaktieren Sie uns dennoch für eine individuelle Beratung - es gibt viele weitere Unterstützungsmöglichkeiten.</p>';
            html += '<a href="#contact" class="btn btn-outline">Beratung anfragen</a>';
        }

        html += '<p class="disclaimer"><small><strong>Hinweis:</strong> Dies ist nur eine grobe Einschätzung. Für eine verbindliche Prüfung kontaktieren Sie bitte die zuständigen Behörden oder uns für eine detaillierte Beratung.</small></p>';

        return html;
    }

    // Navigation
    setupNavigation() {
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');

        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
                navToggle.setAttribute('aria-expanded', !isExpanded);
                navMenu.classList.toggle('active');
            });
        }

        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(link.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // Accessibility
    setupAccessibility() {
        // Keyboard navigation for custom elements
        document.querySelectorAll('.checkbox-label').forEach(label => {
            const checkbox = label.querySelector('input[type="checkbox"]');
            if (checkbox) {
                label.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        checkbox.click();
                    }
                });
            }
        });

        // Focus trap for modals
        this.setupFocusTraps();
        
        // Announce page changes for screen readers
        this.setupPageAnnouncements();
    }

    setupFocusTraps() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.addEventListener('keydown', (e) => {
                if (e.key === 'Tab') {
                    this.trapFocus(e, modal);
                }
            });
        });
    }

    trapFocus(e, container) {
        const focusableElements = container.querySelectorAll(
            'button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])'
        );
        
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
            if (document.activeElement === firstFocusable) {
                e.preventDefault();
                lastFocusable.focus();
            }
        } else {
            if (document.activeElement === lastFocusable) {
                e.preventDefault();
                firstFocusable.focus();
            }
        }
    }

    setupPageAnnouncements() {
        // Announce dynamic content changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    const addedNodes = Array.from(mutation.addedNodes);
                    addedNodes.forEach(node => {
                        if (node.nodeType === Node.ELEMENT_NODE && node.hasAttribute('aria-live')) {
                            // Content with aria-live was added, no additional action needed
                        }
                    });
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Animation Setup
    initializeAnimations() {
        // Only initialize animations if user hasn't requested reduced motion
        if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.setupScrollAnimations();
            this.setupHoverEffects();
        }
    }

    setupScrollAnimations() {
        // Intersection Observer for scroll animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        // Observe elements that should animate on scroll
        document.querySelectorAll('.service-card, .contact-form, .about-content').forEach(el => {
            observer.observe(el);
        });
    }

    setupHoverEffects() {
        // Add hover effects that respect user preferences
        const cards = document.querySelectorAll('.service-card');
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                    card.style.transform = 'translateY(-5px)';
                }
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    }

    // Data Deletion Management
    scheduleDataDeletion() {
        const retentionDays = 90;
        const now = new Date();
        
        try {
            // Schedule deletion for form submissions
            const submissions = JSON.parse(localStorage.getItem('form-submissions') || '[]');
            const validSubmissions = submissions.filter(submission => {
                const submissionDate = new Date(submission.timestamp);
                const daysDiff = (now - submissionDate) / (1000 * 60 * 60 * 24);
                return daysDiff <= retentionDays;
            });
            
            if (validSubmissions.length !== submissions.length) {
                localStorage.setItem('form-submissions', JSON.stringify(validSubmissions));
                console.log(`Deleted ${submissions.length - validSubmissions.length} old form submissions`);
            }

            // Schedule deletion for consent logs
            const consentLogs = JSON.parse(localStorage.getItem('consent-logs') || '[]');
            const validLogs = consentLogs.filter(log => {
                const logDate = new Date(log.timestamp);
                const daysDiff = (now - logDate) / (1000 * 60 * 60 * 24);
                return daysDiff <= retentionDays;
            });
            
            if (validLogs.length !== consentLogs.length) {
                localStorage.setItem('consent-logs', JSON.stringify(validLogs));
                console.log(`Deleted ${consentLogs.length - validLogs.length} old consent logs`);
            }

        } catch (error) {
            console.error('Error during data cleanup:', error);
        }
    }

    // Utility Functions
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    handleResize() {
        // Handle responsive changes
        this.updateLayout();
    }

    handleScroll() {
        // Handle scroll events
        this.updateScrollPosition();
    }

    updateLayout() {
        // Update layout based on viewport size
        const viewport = window.innerWidth;
        document.documentElement.style.setProperty('--viewport-width', `${viewport}px`);
    }

    updateScrollPosition() {
        // Update scroll-based styles
        const scrolled = window.pageYOffset;
        const header = document.querySelector('.header');
        
        if (header) {
            if (scrolled > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
    }
}

// Initialize the application
const app = new JobcoachApp();

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = JobcoachApp;
}