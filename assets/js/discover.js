/**
 * Système de découverte de profils
 * Ce fichier gère les interactions avec les profils sur la page de découverte
 */

class DiscoverSystem {
    constructor() {
        this.apiBaseUrl = 'http://localhost:5000/api';
        this.initEventListeners();
    }

    /**
     * Initialiser les écouteurs d'événements
     */
    initEventListeners() {
        // Les écouteurs pour like/dislike sont déjà définis dans le HTML avec onclick="likeProfile(this)" et onclick="dislikeProfile(this)"
        
        document.addEventListener('DOMContentLoaded', () => {
            // Filtres interactifs
            document.querySelectorAll('select').forEach(select => {
                select.addEventListener('change', () => {
                    // Simulation de filtrage
                    this.showNotification('Filtres appliqués', 'info');
                });
            });

            // Bouton de filtre
            const filterButton = document.querySelector('.bg-primary.text-white');
            if (filterButton) {
                filterButton.addEventListener('click', () => {
                    this.showNotification('Filtres appliqués avec succès', 'success');
                });
            }

            // Boutons de vue profil
            document.querySelectorAll('.fa-eye').forEach(button => {
                button.parentElement.addEventListener('click', function() {
                    const card = this.closest('.profile-card');
                    const profileId = card.getAttribute('data-profile-id');
                    discoverSystem.showNotification('Ouverture du profil ' + profileId, 'info');
                });
            });
        });
    }

    /**
     * Récupérer le token d'authentification
     */
    getAuthToken() {
        return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    }

    /**
     * Effectuer une requête API authentifiée
     */
    async fetchAPI(endpoint, method = 'GET', body = null) {
        const token = this.getAuthToken();
        if (!token) {
            console.error('Aucun token d\'authentification trouvé');
            return null;
        }
        
        try {
            const options = {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            };
            
            if (body) {
                options.body = JSON.stringify(body);
            }
            
            const response = await fetch(`${this.apiBaseUrl}${endpoint}`, options);
            
            if (!response.ok) {
                throw new Error(`Erreur API: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Erreur lors de la requête API:', error);
            return null;
        }
    }

    /**
     * Liker un profil
     */
    async likeProfile(profileId) {
        try {
            const response = await this.fetchAPI(`/matches/like/${profileId}`, 'POST');
            return response;
        } catch (error) {
            console.error('Erreur lors du like:', error);
            return null;
        }
    }

    /**
     * Disliker un profil
     */
    async dislikeProfile(profileId) {
        try {
            const response = await this.fetchAPI(`/matches/dislike/${profileId}`, 'POST');
            return response;
        } catch (error) {
            console.error('Erreur lors du dislike:', error);
            return null;
        }
    }

    /**
     * Afficher une notification
     */
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full`;
        
        const colors = {
            success: 'bg-green-500 text-white',
            error: 'bg-red-500 text-white',
            warning: 'bg-yellow-500 text-white',
            info: 'bg-blue-500 text-white'
        };
        
        notification.className += ` ${colors[type]}`;
        notification.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'times' : type === 'warning' ? 'exclamation-triangle' : 'info'} mr-2"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animer l'entrée
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);
        
        // Supprimer après 3 secondes
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    /**
     * Mettre à jour le compteur de profils
     */
    updateProfileCount() {
        const remainingProfiles = document.querySelectorAll('.profile-card').length;
        const countElement = document.querySelector('.bg-primary.text-white');
        if (countElement) {
            countElement.textContent = `${remainingProfiles} profils disponibles`;
        }
    }
}

// Initialiser le système de découverte
const discoverSystem = new DiscoverSystem();

// Fonction pour liker un profil (appelée depuis le HTML)
window.likeProfile = async function(button) {
    const card = button.closest('.profile-card');
    const profileId = card.getAttribute('data-profile-id');
    
    if (!profileId) {
        console.error('ID de profil non trouvé');
        discoverSystem.showNotification('Erreur: ID de profil non trouvé', 'error');
        return;
    }
    
    button.classList.add('like-animation');
    button.disabled = true;
    
    // Appel à l'API
    const response = await discoverSystem.likeProfile(profileId);
    
    setTimeout(() => {
        button.classList.remove('like-animation');
        button.disabled = false;
        
        if (response) {
            if (response.isMatch) {
                discoverSystem.showNotification('Match ! Vous avez un nouveau match', 'success');
            } else {
                discoverSystem.showNotification('Profil liké !', 'success');
            }
            
            // Animation de suppression
            card.style.opacity = '0.5';
            setTimeout(() => {
                card.remove();
                discoverSystem.updateProfileCount();
            }, 1000);
        } else {
            discoverSystem.showNotification('Erreur lors du like', 'error');
        }
    }, 600);
};

// Fonction pour disliker un profil (appelée depuis le HTML)
window.dislikeProfile = async function(button) {
    const card = button.closest('.profile-card');
    const profileId = card.getAttribute('data-profile-id');
    
    if (!profileId) {
        console.error('ID de profil non trouvé');
        discoverSystem.showNotification('Erreur: ID de profil non trouvé', 'error');
        return;
    }
    
    button.classList.add('dislike-animation');
    button.disabled = true;
    
    // Appel à l'API
    const response = await discoverSystem.dislikeProfile(profileId);
    
    setTimeout(() => {
        button.classList.remove('dislike-animation');
        button.disabled = false;
        
        if (response) {
            discoverSystem.showNotification('Profil passé', 'info');
            
            // Animation de suppression
            card.style.opacity = '0.5';
            setTimeout(() => {
                card.remove();
                discoverSystem.updateProfileCount();
            }, 1000);
        } else {
            discoverSystem.showNotification('Erreur lors du dislike', 'error');
        }
    }, 600);
};