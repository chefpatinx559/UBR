/**
 * reports.js - Gestion des signalements pour l'application UBR
 */

const UBRReports = {
    /**
     * Initialise le système de signalement
     * @param {string} formSelector - Sélecteur du formulaire de signalement
     * @param {Object} options - Options de configuration
     */
    initReportSystem: function(formSelector, options = {}) {
        const form = document.querySelector(formSelector);
        if (!form) return;
        
        const defaultOptions = {
            urgentKeywords: ['urgent', 'immédiat', 'danger', 'menace', 'suicide', 'mort'],
            mediumKeywords: ['important', 'préoccupant', 'inquiétant', 'harcèlement'],
            autoSaveKey: 'ubr_report_draft',
            confirmMessage: 'Vous avez un signalement non soumis. Êtes-vous sûr de vouloir quitter cette page ?'
        };
        
        const config = { ...defaultOptions, ...options };
        
        // Initialiser la pré-sélection du type de rapport
        this.initQuickReportButtons();
        
        // Initialiser la détection d'urgence basée sur les mots-clés
        if (window.UBRForms && typeof window.UBRForms.setupUrgencyDetection === 'function') {
            window.UBRForms.setupUrgencyDetection(
                '#report-description', 
                '#urgency-level',
                config.urgentKeywords,
                config.mediumKeywords
            );
        }
        
        // Initialiser les suggestions automatiques
        this.setupAutoSuggestions();
        
        // Initialiser la sauvegarde automatique du brouillon
        if (window.UBRForms) {
            if (typeof window.UBRForms.setupAutoSave === 'function') {
                window.UBRForms.setupAutoSave(form.id, config.autoSaveKey);
            }
            
            if (typeof window.UBRForms.restoreDraft === 'function') {
                window.UBRForms.restoreDraft(form.id, config.autoSaveKey, (form, data) => {
                    if (window.UBRUtils && typeof window.UBRUtils.showNotification === 'function') {
                        window.UBRUtils.showNotification('Brouillon restauré', 'info');
                    }
                });
            }
            
            if (typeof window.UBRForms.setupBeforeUnloadWarning === 'function') {
                window.UBRForms.setupBeforeUnloadWarning(form.id, config.confirmMessage);
            }
        }
        
        // Initialiser la soumission du formulaire
        this.initReportSubmission(form);
    },
    
    /**
     * Initialise les boutons de pré-sélection rapide du type de rapport
     */
    initQuickReportButtons: function() {
        const quickButtons = document.querySelectorAll('.quick-report-btn');
        if (!quickButtons.length) return;
        
        quickButtons.forEach(button => {
            button.addEventListener('click', () => {
                const reportType = button.getAttribute('data-report-type');
                if (reportType) {
                    this.preSelectReport(reportType);
                }
            });
        });
    },
    
    /**
     * Pré-sélectionne un type de rapport et fait défiler jusqu'au formulaire
     * @param {string} reportType - Le type de rapport à pré-sélectionner
     */
    preSelectReport: function(reportType) {
        const reportTypeSelect = document.getElementById('report-type');
        const reportForm = document.getElementById('report-form');
        
        if (reportTypeSelect && reportForm) {
            // Sélectionner le type de rapport
            reportTypeSelect.value = reportType;
            
            // Déclencher l'événement change pour activer les suggestions automatiques
            reportTypeSelect.dispatchEvent(new Event('change'));
            
            // Faire défiler jusqu'au formulaire
            reportForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
            
            // Mettre en évidence le champ pendant un moment
            reportTypeSelect.classList.add('ring-2', 'ring-primary');
            setTimeout(() => {
                reportTypeSelect.classList.remove('ring-2', 'ring-primary');
            }, 2000);
        }
    },
    
    /**
     * Configure les suggestions automatiques basées sur le type de rapport
     */
    setupAutoSuggestions: function() {
        const reportTypeSelect = document.getElementById('report-type');
        const descriptionTextarea = document.getElementById('report-description');
        
        if (!reportTypeSelect || !descriptionTextarea) return;
        
        const suggestions = {
            'fake_profile': 'Ce profil utilise des photos qui ne semblent pas authentiques et les informations paraissent contradictoires...',
            'inappropriate_content': 'J\'ai remarqué du contenu inapproprié dans ce profil, notamment...',
            'harassment': 'Cet utilisateur m\'a envoyé plusieurs messages non sollicités malgré mes refus...',
            'scam': 'Cette personne a essayé de me soutirer de l\'argent en prétextant...',
            'underage': 'Je pense que cet utilisateur est mineur car...',
            'impersonation': 'Ce profil se fait passer pour quelqu\'un d\'autre, je connais la vraie personne et...',
            'other': 'Je souhaite signaler un problème concernant...',
        };
        
        reportTypeSelect.addEventListener('change', function() {
            const suggestion = suggestions[this.value];
            if (suggestion && !descriptionTextarea.value.trim()) {
                descriptionTextarea.placeholder = `Exemple : ${suggestion}`;
            }
        });
        
        // Déclencher l'événement au chargement pour définir le placeholder initial
        reportTypeSelect.dispatchEvent(new Event('change'));
    },
    
    /**
     * Initialise la soumission du formulaire de signalement
     * @param {HTMLElement} form - L'élément du formulaire
     */
    initReportSubmission: function(form) {
        if (!form) return;
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const submitBtn = form.querySelector('button[type="submit"]');
            if (!submitBtn) return;
            
            const originalText = submitBtn.innerHTML;
            const urgencyLevel = form.querySelector('#urgency-level')?.value || 'low';
            
            // Déterminer le délai en fonction de l'urgence
            let delay = 1500;
            if (urgencyLevel === 'high') {
                delay = 800;
            } else if (urgencyLevel === 'medium') {
                delay = 1200;
            }
            
            // Animation de soumission
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Traitement en cours...';
            submitBtn.disabled = true;
            
            // Simulation d'envoi (à remplacer par un vrai appel API en production)
            setTimeout(() => {
                submitBtn.innerHTML = '<i class="fas fa-check mr-2"></i>Signalement envoyé !';
                submitBtn.classList.remove('bg-primary');
                submitBtn.classList.add('bg-green-500');
                
                // Générer un numéro de suivi aléatoire
                const trackingNumber = 'UBR-' + Math.floor(100000 + Math.random() * 900000);
                
                // Afficher un message de confirmation
                const confirmationMessage = `Votre signalement a été enregistré sous le numéro <strong>${trackingNumber}</strong>. `;
                let additionalInfo = '';
                
                if (urgencyLevel === 'high') {
                    additionalInfo = 'Notre équipe va le traiter en priorité dans les prochaines heures.';
                } else if (urgencyLevel === 'medium') {
                    additionalInfo = 'Notre équipe va le traiter dans les 24-48 heures.';
                } else {
                    additionalInfo = 'Notre équipe va le traiter dans les prochains jours.';
                }
                
                // Afficher une notification si UBRUtils est disponible
                if (window.UBRUtils && typeof window.UBRUtils.showNotification === 'function') {
                    window.UBRUtils.showNotification(
                        confirmationMessage + additionalInfo,
                        'success',
                        10000 // Afficher plus longtemps pour que l'utilisateur puisse noter le numéro
                    );
                }
                
                // Réinitialiser le formulaire après 3 secondes
                setTimeout(() => {
                    // Réinitialiser le formulaire
                    form.reset();
                    
                    // Réinitialiser le bouton
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                    submitBtn.classList.remove('bg-green-500');
                    submitBtn.classList.add('bg-primary');
                    
                    // Réinitialiser les compteurs de caractères si UBRUtils est disponible
                    if (window.UBRUtils && typeof window.UBRUtils.resetCharCounters === 'function') {
                        window.UBRUtils.resetCharCounters();
                    }
                    
                    // Supprimer le brouillon si UBRForms est disponible
                    if (window.UBRForms && typeof window.UBRForms.clearDraft === 'function') {
                        window.UBRForms.clearDraft('ubr_report_draft');
                    }
                    
                    // Faire défiler vers le haut
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }, 3000);
            }, delay);
        });
    }
};

// Exporter l'objet UBRReports pour une utilisation dans d'autres fichiers
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UBRReports;
} else {
    window.UBRReports = UBRReports;
}