/**
 * utils.js - Fonctions utilitaires communes pour l'application UBR
 */

const UBRUtils = {
    /**
     * Affiche une notification toast
     * @param {string} message - Le message à afficher
     * @param {string} type - Le type de notification (success, error, info, warning)
     * @param {number} duration - La durée d'affichage en millisecondes
     */
    showNotification: function(message, type = 'info', duration = 5000) {
        const toast = document.createElement('div');
        const colors = {
            success: 'bg-green-500 text-white',
            error: 'bg-red-500 text-white',
            info: 'bg-blue-500 text-white',
            warning: 'bg-yellow-500 text-white'
        };
        
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-times-circle',
            info: 'fa-info-circle',
            warning: 'fa-exclamation-triangle'
        };
        
        toast.className = `toast ${colors[type]} text-white p-4 rounded-lg shadow-lg max-w-md fixed top-4 right-4 z-50 transition-all duration-300 transform translate-x-full`;
        toast.innerHTML = `
            <div class="flex items-start">
                <i class="fas ${icons[type]} mr-3 mt-1"></i>
                <div class="flex-1">
                    <span class="text-sm">${message}</span>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-4 hover:bg-white/20 rounded p-1 flex-shrink-0">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.classList.remove('translate-x-full');
        }, 100);
        
        // Remove after duration
        setTimeout(() => {
            toast.classList.add('translate-x-full');
            setTimeout(() => {
                if (toast.parentElement) {
                    toast.remove();
                }
            }, 300);
        }, duration);
    },

    /**
     * Initialise les compteurs de caractères pour les textareas
     */
    initCharCounters: function() {
        const textareas = document.querySelectorAll('textarea[maxlength]');
        
        textareas.forEach(textarea => {
            const maxLength = textarea.getAttribute('maxlength');
            const counter = textarea.parentNode.querySelector('.text-right');
            
            if (counter) {
                // Initialiser le compteur
                counter.textContent = `0/${maxLength}`;
                
                textarea.addEventListener('input', function() {
                    const count = this.value.length;
                    counter.textContent = `${count}/${maxLength}`;
                    
                    if (count > maxLength * 0.9) {
                        counter.classList.add('text-red-500');
                        counter.classList.remove('text-gray-500');
                    } else {
                        counter.classList.remove('text-red-500');
                        counter.classList.add('text-gray-500');
                    }
                });
            }
        });
    },

    /**
     * Réinitialise les compteurs de caractères
     */
    resetCharCounters: function() {
        const counters = document.querySelectorAll('.text-right');
        counters.forEach(counter => {
            if (counter.textContent.includes('/')) {
                const maxLength = counter.textContent.split('/')[1];
                counter.textContent = `0/${maxLength}`;
                counter.classList.remove('text-red-500');
                counter.classList.add('text-gray-500');
            }
        });
    },

    /**
     * Initialise les animations au défilement
     */
    initScrollAnimations: function() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-visible');
                }
            });
        }, observerOptions);

        document.querySelectorAll('.scroll-animate').forEach(el => {
            observer.observe(el);
        });
    },

    /**
     * Validation en temps réel des formulaires
     * @param {string} formId - L'ID du formulaire à valider
     */
    validateForm: function(formId) {
        const form = document.getElementById(formId);
        if (!form) return;
        
        const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
        
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                if (!this.value.trim()) {
                    this.classList.add('border-red-500');
                    this.classList.remove('border-gray-300');
                } else {
                    this.classList.remove('border-red-500');
                    this.classList.add('border-gray-300');
                }
            });
            
            input.addEventListener('input', function() {
                if (this.value.trim()) {
                    this.classList.remove('border-red-500');
                    this.classList.add('border-gray-300');
                }
            });
        });
    },

    /**
     * Validation d'email en temps réel
     * @param {string} inputSelector - Le sélecteur de l'input email
     */
    setupEmailValidation: function(inputSelector) {
        const emailInput = document.querySelector(inputSelector);
        if (!emailInput) return;
        
        emailInput.addEventListener('input', function() {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (this.value && !emailRegex.test(this.value)) {
                this.classList.add('border-yellow-500');
                this.classList.remove('border-gray-300', 'border-red-500', 'border-green-500');
            } else if (this.value) {
                this.classList.remove('border-yellow-500', 'border-red-500');
                this.classList.add('border-green-500');
            } else {
                this.classList.remove('border-yellow-500', 'border-red-500', 'border-green-500');
                this.classList.add('border-gray-300');
            }
        });
    },

    /**
     * Formatage automatique des numéros de téléphone ivoiriens
     * @param {string} inputSelector - Le sélecteur de l'input téléphone
     */
    setupPhoneNumberFormatting: function(inputSelector) {
        const phoneInput = document.querySelector(inputSelector);
        if (!phoneInput) return;
        
        phoneInput.addEventListener('input', function(e) {
            let value = this.value.replace(/\D/g, '');
            
            // Format pour les numéros ivoiriens
            if (value.length > 0) {
                if (value.length <= 2) {
                    this.value = value;
                } else if (value.length <= 4) {
                    this.value = value.slice(0, 2) + ' ' + value.slice(2);
                } else if (value.length <= 6) {
                    this.value = value.slice(0, 2) + ' ' + value.slice(2, 4) + ' ' + value.slice(4);
                } else if (value.length <= 8) {
                    this.value = value.slice(0, 2) + ' ' + value.slice(2, 4) + ' ' + value.slice(4, 6) + ' ' + value.slice(6);
                } else {
                    this.value = value.slice(0, 2) + ' ' + value.slice(2, 4) + ' ' + value.slice(4, 6) + ' ' + value.slice(6, 8) + ' ' + value.slice(8, 10);
                }
            }
        });
    }
};

// Exporter l'objet UBRUtils pour une utilisation dans d'autres fichiers
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UBRUtils;
} else {
    window.UBRUtils = UBRUtils;
}