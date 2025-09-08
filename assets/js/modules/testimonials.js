/**
 * testimonials.js - Gestion des témoignages pour l'application UBR
 */

const UBRTestimonials = {
    /**
     * Initialise le système de notation par étoiles
     * @param {string} containerSelector - Sélecteur du conteneur d'étoiles
     * @param {string} inputSelector - Sélecteur de l'input pour stocker la valeur
     */
    initStarRating: function(containerSelector, inputSelector) {
        const container = document.querySelector(containerSelector);
        const input = document.querySelector(inputSelector);
        
        if (!container || !input) return;
        
        const stars = container.querySelectorAll('.star');
        
        // Fonction pour mettre à jour l'affichage des étoiles
        const updateStars = (rating) => {
            stars.forEach((star, index) => {
                if (index < rating) {
                    star.classList.add('text-yellow-500');
                    star.classList.remove('text-gray-300');
                } else {
                    star.classList.add('text-gray-300');
                    star.classList.remove('text-yellow-500');
                }
            });
        };
        
        // Gérer le clic sur les étoiles
        stars.forEach((star, index) => {
            const rating = index + 1;
            
            star.addEventListener('click', () => {
                input.value = rating;
                updateStars(rating);
                
                // Afficher un message basé sur la note
                this.showRatingMessage(rating, container);
            });
            
            // Gérer le survol
            star.addEventListener('mouseenter', () => {
                updateStars(rating);
            });
        });
        
        // Réinitialiser au survol du conteneur
        container.addEventListener('mouseleave', () => {
            const currentRating = parseInt(input.value) || 0;
            updateStars(currentRating);
        });
    },
    
    /**
     * Affiche un message basé sur la note donnée
     * @param {number} rating - La note (1-5)
     * @param {HTMLElement} container - Le conteneur parent
     */
    showRatingMessage: function(rating, container) {
        const messageElement = container.querySelector('.rating-message') || document.createElement('div');
        messageElement.className = 'rating-message text-sm mt-2';
        
        let message = '';
        let color = '';
        
        switch(rating) {
            case 1:
                message = 'Très déçu';
                color = 'text-red-500';
                break;
            case 2:
                message = 'Déçu';
                color = 'text-orange-500';
                break;
            case 3:
                message = 'Correct';
                color = 'text-yellow-500';
                break;
            case 4:
                message = 'Satisfait';
                color = 'text-green-400';
                break;
            case 5:
                message = 'Très satisfait';
                color = 'text-green-600';
                break;
            default:
                message = '';
        }
        
        messageElement.textContent = message;
        messageElement.className = `rating-message text-sm mt-2 ${color}`;
        
        if (!container.querySelector('.rating-message')) {
            container.appendChild(messageElement);
        }
    },
    
    /**
     * Initialise le modal de témoignage
     * @param {string} openBtnSelector - Sélecteur du bouton d'ouverture
     * @param {string} closeBtnSelector - Sélecteur du bouton de fermeture
     * @param {string} modalSelector - Sélecteur du modal
     */
    initTestimonialModal: function(openBtnSelector, closeBtnSelector, modalSelector) {
        const openBtn = document.querySelector(openBtnSelector);
        const closeBtn = document.querySelector(closeBtnSelector);
        const modal = document.querySelector(modalSelector);
        
        if (!openBtn || !modal) return;
        
        openBtn.addEventListener('click', () => {
            modal.classList.remove('hidden');
            setTimeout(() => {
                modal.classList.add('opacity-100');
                modal.classList.remove('opacity-0');
            }, 10);
            document.body.classList.add('overflow-hidden');
        });
        
        const closeModal = () => {
            modal.classList.remove('opacity-100');
            modal.classList.add('opacity-0');
            setTimeout(() => {
                modal.classList.add('hidden');
                document.body.classList.remove('overflow-hidden');
            }, 300);
        };
        
        if (closeBtn) {
            closeBtn.addEventListener('click', closeModal);
        }
        
        // Fermer en cliquant sur l'arrière-plan
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
        
        // Fermer avec la touche Echap
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
                closeModal();
            }
        });
    },
    
    /**
     * Initialise le formulaire de témoignage
     * @param {string} formSelector - Sélecteur du formulaire
     * @param {string} modalSelector - Sélecteur du modal à fermer après soumission
     */
    initTestimonialForm: function(formSelector, modalSelector) {
        const form = document.querySelector(formSelector);
        const modal = document.querySelector(modalSelector);
        
        if (!form) return;
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const submitBtn = form.querySelector('button[type="submit"]');
            if (!submitBtn) return;
            
            const originalText = submitBtn.innerHTML;
            
            // Animation de soumission
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Envoi en cours...';
            submitBtn.disabled = true;
            
            // Simulation d'envoi (à remplacer par un vrai appel API en production)
            setTimeout(() => {
                submitBtn.innerHTML = '<i class="fas fa-check mr-2"></i>Envoyé !';
                submitBtn.classList.remove('bg-primary');
                submitBtn.classList.add('bg-green-500');
                
                // Afficher une notification si UBRUtils est disponible
                if (window.UBRUtils && typeof window.UBRUtils.showNotification === 'function') {
                    window.UBRUtils.showNotification('Merci pour votre témoignage !', 'success');
                }
                
                // Fermer le modal après 2 secondes
                setTimeout(() => {
                    if (modal) {
                        modal.classList.remove('opacity-100');
                        modal.classList.add('opacity-0');
                        setTimeout(() => {
                            modal.classList.add('hidden');
                            document.body.classList.remove('overflow-hidden');
                            
                            // Réinitialiser le formulaire
                            form.reset();
                            submitBtn.innerHTML = originalText;
                            submitBtn.disabled = false;
                            submitBtn.classList.remove('bg-green-500');
                            submitBtn.classList.add('bg-primary');
                            
                            // Réinitialiser les étoiles
                            const starsContainer = form.querySelector('.stars-container');
                            if (starsContainer) {
                                const stars = starsContainer.querySelectorAll('.star');
                                stars.forEach(star => {
                                    star.classList.add('text-gray-300');
                                    star.classList.remove('text-yellow-500');
                                });
                                
                                const ratingMessage = starsContainer.querySelector('.rating-message');
                                if (ratingMessage) {
                                    ratingMessage.remove();
                                }
                            }
                            
                            // Réinitialiser les compteurs de caractères si UBRUtils est disponible
                            if (window.UBRUtils && typeof window.UBRUtils.resetCharCounters === 'function') {
                                window.UBRUtils.resetCharCounters();
                            }
                        }, 300);
                    }
                }, 2000);
            }, 1500);
        });
    },
    
    /**
     * Initialise le filtrage des témoignages
     * @param {string} filterSelector - Sélecteur des boutons de filtre
     * @param {string} testimonialSelector - Sélecteur des témoignages
     */
    initTestimonialFilters: function(filterSelector, testimonialSelector) {
        const filterButtons = document.querySelectorAll(filterSelector);
        const testimonials = document.querySelectorAll(testimonialSelector);
        
        if (!filterButtons.length || !testimonials.length) return;
        
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                const filter = button.getAttribute('data-filter');
                
                // Mettre à jour l'état actif des boutons
                filterButtons.forEach(btn => btn.classList.remove('active-filter'));
                button.classList.add('active-filter');
                
                // Filtrer les témoignages
                testimonials.forEach(testimonial => {
                    if (filter === 'all') {
                        testimonial.style.display = '';
                    } else {
                        const rating = parseInt(testimonial.getAttribute('data-rating'));
                        
                        if (filter === 'positive' && rating >= 4) {
                            testimonial.style.display = '';
                        } else if (filter === 'neutral' && rating === 3) {
                            testimonial.style.display = '';
                        } else if (filter === 'negative' && rating <= 2) {
                            testimonial.style.display = '';
                        } else {
                            testimonial.style.display = 'none';
                        }
                    }
                });
            });
        });
    }
};

// Exporter l'objet UBRTestimonials pour une utilisation dans d'autres fichiers
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UBRTestimonials;
} else {
    window.UBRTestimonials = UBRTestimonials;
}