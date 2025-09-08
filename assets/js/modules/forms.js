/**
 * forms.js - Gestion des formulaires pour l'application UBR
 */

const UBRForms = {
    /**
     * Initialise un formulaire avec gestion de soumission et animation
     * @param {string} formId - L'ID du formulaire
     * @param {Function} onSuccess - Fonction à exécuter en cas de succès
     * @param {Function} onError - Fonction à exécuter en cas d'erreur
     * @param {number} simulatedDelay - Délai simulé pour la démo (à supprimer en production)
     */
    initFormSubmission: function(formId, onSuccess, onError, simulatedDelay = 1500) {
        const form = document.getElementById(formId);
        if (!form) return;
        
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const submitBtn = this.querySelector('button[type="submit"]');
            if (!submitBtn) return;
            
            const originalText = submitBtn.innerHTML;
            
            // Animation de soumission
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Envoi en cours...';
            submitBtn.disabled = true;
            
            // Simulation d'envoi (à remplacer par un vrai appel API en production)
            setTimeout(() => {
                try {
                    // Simuler une réponse réussie
                    submitBtn.innerHTML = '<i class="fas fa-check mr-2"></i>Envoyé !';
                    submitBtn.classList.remove('bg-primary', 'bg-red-500');
                    submitBtn.classList.add('bg-green-500');
                    
                    if (typeof onSuccess === 'function') {
                        onSuccess(form);
                    }
                    
                    // Reset après 3 secondes
                    setTimeout(() => {
                        submitBtn.innerHTML = originalText;
                        submitBtn.disabled = false;
                        submitBtn.classList.remove('bg-green-500');
                        submitBtn.classList.add('bg-primary');
                    }, 3000);
                    
                } catch (error) {
                    // En cas d'erreur
                    submitBtn.innerHTML = '<i class="fas fa-times mr-2"></i>Erreur !';
                    submitBtn.classList.remove('bg-primary');
                    submitBtn.classList.add('bg-red-500');
                    
                    if (typeof onError === 'function') {
                        onError(error);
                    }
                    
                    // Reset après 3 secondes
                    setTimeout(() => {
                        submitBtn.innerHTML = originalText;
                        submitBtn.disabled = false;
                        submitBtn.classList.remove('bg-red-500');
                        submitBtn.classList.add('bg-primary');
                    }, 3000);
                }
            }, simulatedDelay);
        });
    },
    
    /**
     * Réinitialise un formulaire
     * @param {string} formId - L'ID du formulaire à réinitialiser
     * @param {Function} callback - Fonction à exécuter après la réinitialisation
     */
    resetForm: function(formId, callback) {
        const form = document.getElementById(formId);
        if (!form) return;
        
        form.reset();
        
        // Réinitialiser les styles des champs
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.classList.remove('border-red-500', 'border-green-500', 'border-yellow-500');
            input.classList.add('border-gray-300');
        });
        
        // Réinitialiser les compteurs de caractères si UBRUtils est disponible
        if (window.UBRUtils && typeof window.UBRUtils.resetCharCounters === 'function') {
            window.UBRUtils.resetCharCounters();
        }
        
        if (typeof callback === 'function') {
            callback(form);
        }
    },
    
    /**
     * Configure l'auto-suggestion basée sur le type de sélection
     * @param {string} selectSelector - Le sélecteur du select
     * @param {string} textareaSelector - Le sélecteur de la textarea
     * @param {Object} suggestions - Objet avec les suggestions par valeur du select
     */
    setupAutoSuggestions: function(selectSelector, textareaSelector, suggestions) {
        const selectElement = document.querySelector(selectSelector);
        const textareaElement = document.querySelector(textareaSelector);
        
        if (!selectElement || !textareaElement || !suggestions) return;
        
        selectElement.addEventListener('change', function() {
            const suggestion = suggestions[this.value];
            if (suggestion && !textareaElement.value.trim()) {
                textareaElement.placeholder = `Exemple : ${suggestion}`;
            }
        });
    },
    
    /**
     * Configure l'auto-complétion du sujet basée sur les mots-clés du message
     * @param {string} messageSelector - Le sélecteur du champ message
     * @param {string} subjectSelector - Le sélecteur du champ sujet
     * @param {Object} keywordMap - Mapping des mots-clés vers les sujets
     */
    setupSubjectAutoCompletion: function(messageSelector, subjectSelector, keywordMap) {
        const messageElement = document.querySelector(messageSelector);
        const subjectElement = document.querySelector(subjectSelector);
        
        if (!messageElement || !subjectElement || !keywordMap) return;
        
        messageElement.addEventListener('input', function() {
            // Ne pas modifier si l'utilisateur a déjà choisi un sujet
            if (subjectElement.value.trim()) return;
            
            const messageText = this.value.toLowerCase();
            
            for (const [keyword, subject] of Object.entries(keywordMap)) {
                if (messageText.includes(keyword.toLowerCase())) {
                    subjectElement.value = subject;
                    // Mettre en évidence le champ pour montrer qu'il a été auto-complété
                    subjectElement.classList.add('border-green-500');
                    setTimeout(() => {
                        subjectElement.classList.remove('border-green-500');
                    }, 2000);
                    break;
                }
            }
        });
    },
    
    /**
     * Configure la détection d'urgence basée sur les mots-clés
     * @param {string} textareaSelector - Le sélecteur de la textarea
     * @param {string} urgencySelector - Le sélecteur du champ d'urgence
     * @param {Array} urgentKeywords - Mots-clés pour urgence élevée
     * @param {Array} mediumKeywords - Mots-clés pour urgence moyenne
     */
    setupUrgencyDetection: function(textareaSelector, urgencySelector, urgentKeywords, mediumKeywords) {
        const textareaElement = document.querySelector(textareaSelector);
        const urgencyElement = document.querySelector(urgencySelector);
        
        if (!textareaElement || !urgencyElement) return;
        
        textareaElement.addEventListener('input', function() {
            const text = this.value.toLowerCase();
            
            if (urgentKeywords.some(keyword => text.includes(keyword))) {
                urgencyElement.value = 'high';
                urgencyElement.classList.add('ring-2', 'ring-red-500');
                setTimeout(() => urgencyElement.classList.remove('ring-2', 'ring-red-500'), 2000);
            } else if (mediumKeywords.some(keyword => text.includes(keyword))) {
                if (urgencyElement.value === 'low') {
                    urgencyElement.value = 'medium';
                }
            }
        });
    },
    
    /**
     * Configure la sauvegarde automatique du brouillon d'un formulaire
     * @param {string} formId - L'ID du formulaire
     * @param {string} storageKey - La clé pour le stockage local
     */
    setupAutoSave: function(formId, storageKey) {
        const form = document.getElementById(formId);
        if (!form) return;
        
        const inputs = form.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            input.addEventListener('input', function() {
                try {
                    const formData = new FormData(form);
                    const draft = {};
                    for (let [key, value] of formData.entries()) {
                        draft[key] = value;
                    }
                    localStorage.setItem(storageKey, JSON.stringify(draft));
                } catch (e) {
                    // Ignore si localStorage non disponible
                    console.error('Erreur lors de la sauvegarde du brouillon:', e);
                }
            });
        });
    },
    
    /**
     * Restaure un brouillon sauvegardé
     * @param {string} formId - L'ID du formulaire
     * @param {string} storageKey - La clé pour le stockage local
     * @param {Function} callback - Fonction à exécuter après la restauration
     */
    restoreDraft: function(formId, storageKey, callback) {
        try {
            const draft = localStorage.getItem(storageKey);
            if (!draft) return false;
            
            const draftData = JSON.parse(draft);
            const form = document.getElementById(formId);
            
            if (!form) return false;
            
            Object.keys(draftData).forEach(key => {
                const input = form.querySelector(`[name="${key}"]`);
                if (input && draftData[key]) {
                    input.value = draftData[key];
                    
                    // Déclencher l'événement input pour les compteurs
                    if (input.tagName === 'TEXTAREA' || input.tagName === 'SELECT') {
                        input.dispatchEvent(new Event('input'));
                        input.dispatchEvent(new Event('change'));
                    }
                }
            });
            
            if (typeof callback === 'function') {
                callback(form, draftData);
            }
            
            return true;
        } catch (e) {
            console.error('Erreur lors de la restauration du brouillon:', e);
            return false;
        }
    },
    
    /**
     * Supprime un brouillon sauvegardé
     * @param {string} storageKey - La clé pour le stockage local
     */
    clearDraft: function(storageKey) {
        try {
            localStorage.removeItem(storageKey);
            return true;
        } catch (e) {
            console.error('Erreur lors de la suppression du brouillon:', e);
            return false;
        }
    },
    
    /**
     * Configure la confirmation avant fermeture si le formulaire est rempli
     * @param {string} formId - L'ID du formulaire
     * @param {string} message - Le message de confirmation
     */
    setupBeforeUnloadWarning: function(formId, message = 'Vous avez des données non sauvegardées. Êtes-vous sûr de vouloir quitter ?') {
        const form = document.getElementById(formId);
        if (!form) return;
        
        window.addEventListener('beforeunload', function(e) {
            const formData = new FormData(form);
            let hasData = false;
            
            for (let [key, value] of formData.entries()) {
                if (value.trim()) {
                    hasData = true;
                    break;
                }
            }
            
            if (hasData) {
                e.preventDefault();
                e.returnValue = message;
                return message;
            }
        });
    }
};

// Exporter l'objet UBRForms pour une utilisation dans d'autres fichiers
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UBRForms;
} else {
    window.UBRForms = UBRForms;
}