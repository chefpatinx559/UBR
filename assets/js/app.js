/**
 * app.js - Point d'entrée pour les modules extraits de l'application UBR
 * Ce fichier charge les modules nécessaires et initialise les fonctionnalités
 * en fonction de la page actuelle.
 */

// Attendre que le DOM soit complètement chargé
document.addEventListener('DOMContentLoaded', function() {
    // Initialiser les fonctionnalités communes à toutes les pages
    initCommonFeatures();
    
    // Initialiser les fonctionnalités spécifiques à chaque page
    initPageSpecificFeatures();
});

/**
 * Initialise les fonctionnalités communes à toutes les pages
 */
function initCommonFeatures() {
    // Initialiser les animations au défilement si UBRUtils est disponible
    if (window.UBRUtils && typeof window.UBRUtils.initScrollAnimations === 'function') {
        window.UBRUtils.initScrollAnimations();
    }
    
    // Initialiser la validation des formulaires si UBRUtils est disponible
    if (window.UBRUtils && typeof window.UBRUtils.validateForm === 'function') {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            window.UBRUtils.validateForm(form);
        });
    }
    
    // Initialiser les compteurs de caractères si UBRUtils est disponible
    if (window.UBRUtils && typeof window.UBRUtils.initCharCounters === 'function') {
        window.UBRUtils.initCharCounters();
    }
}

/**
 * Initialise les fonctionnalités spécifiques à chaque page
 * en fonction de l'URL ou des éléments présents sur la page
 */
function initPageSpecificFeatures() {
    // Déterminer la page actuelle en fonction de l'URL ou des éléments présents
    const currentPath = window.location.pathname;
    const pageName = currentPath.split('/').pop() || 'index.html';
    
    // Page des utilisateurs bloqués
    if (pageName === 'blocked-users.html' || document.querySelector('#blocked-users-container')) {
        initBlockedUsersPage();
    }
    
    // Page de contact
    if (pageName === 'contact.html' || document.querySelector('#contact-form')) {
        initContactPage();
    }
    
    // Page de témoignages
    if (pageName === 'temoignages.html' || document.querySelector('#testimonials-container')) {
        initTestimonialsPage();
    }
    
    // Page de signalement
    if (pageName === 'signaler.html' || document.querySelector('#report-form')) {
        initReportPage();
    }
    
    // Page d'édition de profil
    if (pageName === 'profile-edit.html' || document.querySelector('#profile-edit-form')) {
        initProfileEditPage();
    }
}

/**
 * Initialise la page des utilisateurs bloqués
 */
function initBlockedUsersPage() {
    if (!window.UBRUserManagement) return;
    
    // Initialiser la gestion des utilisateurs bloqués
    window.UBRUserManagement.initBlockedUsers(
        '#blocked-users-list',
        '#blocked-count',
        '#clear-all-blocked'
    );
    
    // Initialiser les filtres
    window.UBRUserManagement.initBlockedFilters(
        '.filter-btn',
        '#search-blocked',
        '.blocked-user-item'
    );
    
    // Initialiser l'exportation
    window.UBRUserManagement.initBlockedExport(
        '#export-blocked',
        '.blocked-user-item'
    );
}

/**
 * Initialise la page de contact
 */
function initContactPage() {
    if (!window.UBRForms) return;
    
    // Initialiser la soumission du formulaire de contact
    window.UBRForms.initFormSubmission(
        'contact-form',
        function(form) {
            // Fonction de succès
            if (window.UBRUtils && typeof window.UBRUtils.showNotification === 'function') {
                window.UBRUtils.showNotification(
                    'Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.',
                    'success'
                );
            }
        },
        function(error) {
            // Fonction d'erreur
            if (window.UBRUtils && typeof window.UBRUtils.showNotification === 'function') {
                window.UBRUtils.showNotification(
                    'Une erreur est survenue lors de l\'envoi du message. Veuillez réessayer plus tard.',
                    'error'
                );
            }
        }
    );
    
    // Initialiser la validation d'email si UBRUtils est disponible
    if (window.UBRUtils && typeof window.UBRUtils.setupEmailValidation === 'function') {
        window.UBRUtils.setupEmailValidation('#contact-email');
    }
    
    // Initialiser le formatage des numéros de téléphone si UBRUtils est disponible
    if (window.UBRUtils && typeof window.UBRUtils.setupPhoneNumberFormatting === 'function') {
        window.UBRUtils.setupPhoneNumberFormatting('#contact-phone');
    }
    
    // Initialiser l'auto-complétion du sujet
    window.UBRForms.setupSubjectAutoCompletion(
        '#contact-message',
        '#contact-subject',
        {
            'problème': 'Signalement de problème',
            'bug': 'Signalement de problème',
            'erreur': 'Signalement de problème',
            'suggestion': 'Suggestion d\'amélioration',
            'amélioration': 'Suggestion d\'amélioration',
            'idée': 'Suggestion d\'amélioration',
            'félicitation': 'Témoignage',
            'merci': 'Témoignage',
            'témoignage': 'Témoignage',
            'partenariat': 'Proposition de partenariat',
            'collaboration': 'Proposition de partenariat',
            'presse': 'Contact presse',
            'média': 'Contact presse',
            'interview': 'Contact presse',
            'emploi': 'Candidature',
            'recrutement': 'Candidature',
            'stage': 'Candidature',
            'travail': 'Candidature'
        }
    );
}

/**
 * Initialise la page de témoignages
 */
function initTestimonialsPage() {
    if (!window.UBRTestimonials) return;
    
    // Initialiser le système de notation par étoiles
    window.UBRTestimonials.initStarRating(
        '.stars-container',
        '#rating-input'
    );
    
    // Initialiser le modal de témoignage
    window.UBRTestimonials.initTestimonialModal(
        '#share-testimonial-btn',
        '#close-testimonial-modal',
        '#testimonial-modal'
    );
    
    // Initialiser le formulaire de témoignage
    window.UBRTestimonials.initTestimonialForm(
        '#testimonial-form',
        '#testimonial-modal'
    );
    
    // Initialiser les filtres de témoignages
    window.UBRTestimonials.initTestimonialFilters(
        '.testimonial-filter',
        '.testimonial-item'
    );
}

/**
 * Initialise la page de signalement
 */
function initReportPage() {
    if (!window.UBRReports) return;
    
    // Initialiser le système de signalement
    window.UBRReports.initReportSystem('#report-form', {
        urgentKeywords: ['urgent', 'immédiat', 'danger', 'menace', 'suicide', 'mort', 'agression', 'violence'],
        mediumKeywords: ['important', 'préoccupant', 'inquiétant', 'harcèlement', 'arnaque', 'fraude'],
        autoSaveKey: 'ubr_report_draft',
        confirmMessage: 'Vous avez un signalement non soumis. Êtes-vous sûr de vouloir quitter cette page ?'
    });
}

/**
 * Initialise la page d'édition de profil
 */
function initProfileEditPage() {
    if (!window.UBRUserManagement) return;
    
    // Initialiser la gestion des photos de profil
    window.UBRUserManagement.initProfilePhotoUpload(
        '#upload-photo-btn',
        '#profile-photo-preview',
        '#remove-photo-btn',
        '#photo-upload-input'
    );
    
    // Initialiser la soumission du formulaire de profil
    if (window.UBRForms && typeof window.UBRForms.initFormSubmission === 'function') {
        window.UBRForms.initFormSubmission(
            'profile-edit-form',
            function(form) {
                // Fonction de succès
                if (window.UBRUtils && typeof window.UBRUtils.showNotification === 'function') {
                    window.UBRUtils.showNotification(
                        'Votre profil a été mis à jour avec succès !',
                        'success'
                    );
                }
                
                // Simuler une redirection (à remplacer en production)
                setTimeout(() => {
                    console.log('Redirection vers la page de profil...');
                    // window.location.href = 'profile.html';
                }, 2000);
            },
            function(error) {
                // Fonction d'erreur
                if (window.UBRUtils && typeof window.UBRUtils.showNotification === 'function') {
                    window.UBRUtils.showNotification(
                        'Une erreur est survenue lors de la mise à jour de votre profil. Veuillez réessayer.',
                        'error'
                    );
                }
            }
        );
    }
}