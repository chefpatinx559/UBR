/**
 * Système de découverte de profils
 * Ce fichier gère les interactions avec les profils sur la page de découverte
 */

class DiscoverSystem {
    constructor() {
        this.api = window.ubrApi;
        this.initEventListeners();
        this.loadProfiles();
    }

    /**
     * Initialiser les écouteurs d'événements
     */
    initEventListeners() {
        document.addEventListener('DOMContentLoaded', () => {
            // Filtres interactifs
            document.querySelectorAll('select').forEach(select => {
                select.addEventListener('change', () => {
                    this.loadProfiles();
                });
            });

            // Bouton de filtre
            const filterButton = document.querySelector('.bg-primary.text-white');
            if (filterButton) {
                filterButton.addEventListener('click', () => {
                    this.loadProfiles();
                });
            }

            // Boutons de vue profil
            document.querySelectorAll('.fa-eye').forEach(button => {
                button.parentElement.addEventListener('click', function() {
                    const card = this.closest('.profile-card');
                    const profileId = card.getAttribute('data-profile-id');
                    window.location.href = `profile-view.html?id=${profileId}`;
                });
            });
        });
    }

    /**
     * Charger les profils depuis l'API
     */
    async loadProfiles() {
        try {
            const response = await this.api.getUsers();
            this.renderProfiles(response.data);
        } catch (error) {
            console.error('Erreur lors du chargement des profils:', error);
            this.showNotification('Erreur lors du chargement des profils', 'error');
        }
    }

    /**
     * Afficher les profils dans l'interface
     */
    renderProfiles(profiles) {
        const container = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-2');
        if (!container) return;

        container.innerHTML = '';

        profiles.forEach(profile => {
            const profileCard = this.createProfileCard(profile);
            container.appendChild(profileCard);
        });
    }

    /**
     * Créer une carte de profil
     */
    createProfileCard(profile) {
        const card = document.createElement('div');
        card.className = 'profile-card bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden';
        card.setAttribute('data-profile-id', profile.id);

        const photoUrl = profile.primary_photo?.path 
            ? `http://localhost:8000/storage/${profile.primary_photo.path}`
            : 'https://via.placeholder.com/300x400/667eea/ffffff?text=' + profile.first_name;

        card.innerHTML = `
            <div class="relative">
                <img src="${photoUrl}" alt="${profile.first_name}" class="w-full h-64 object-cover">
                <div class="absolute top-4 right-4 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    <i class="fas fa-check-circle mr-1"></i>Vérifié
                </div>
                ${profile.is_online ? '<div class="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm"><i class="fas fa-clock mr-1"></i>En ligne</div>' : ''}
            </div>
            
            <div class="p-6">
                <div class="flex items-center justify-between mb-3">
                    <h3 class="font-semibold text-lg text-gray-800">${profile.first_name} ${profile.last_name.charAt(0)}.</h3>
                    <span class="text-gray-600">${profile.age} ans</span>
                </div>
                
                <div class="space-y-2 mb-4">
                    <p class="text-gray-600 text-sm">
                        <i class="fas fa-map-marker-alt mr-2 text-primary"></i>${profile.city}
                    </p>
                    <p class="text-gray-600 text-sm">
                        <i class="fas fa-church mr-2 text-secondary"></i>${profile.denomination}
                    </p>
                    ${profile.profession ? `<p class="text-gray-600 text-sm"><i class="fas fa-briefcase mr-2 text-accent"></i>${profile.profession}</p>` : ''}
                </div>
                
                <p class="text-gray-700 text-sm mb-4 line-clamp-2">
                    ${profile.about_me || 'Aucune description disponible...'}
                </p>
                
                <div class="flex space-x-2">
                    <button class="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition duration-300 flex items-center justify-center" onclick="dislikeProfile(this)">
                        <i class="fas fa-times mr-1"></i>
                    </button>
                    <button class="flex-1 bg-primary hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition duration-300 flex items-center justify-center" onclick="likeProfile(this)">
                        <i class="fas fa-heart mr-1"></i>
                    </button>
                    <button class="px-3 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition duration-300" onclick="viewProfile(${profile.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </div>
        `;

        return card;
    }

    /**
     * Liker un profil via l'API
     */
    async likeProfile(profileId) {
        try {
            const response = await this.api.likeUser(profileId);
            return response;
        } catch (error) {
            console.error('Erreur lors du like:', error);
            return null;
        }
    }

    /**
     * Disliker un profil via l'API
     */
    async dislikeProfile(profileId) {
        try {
            const response = await this.api.dislikeUser(profileId);
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
        if (window.UBRUtils && typeof window.UBRUtils.showNotification === 'function') {
            window.UBRUtils.showNotification(message, type);
        }
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
            if (response.is_match) {
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

// Fonction pour voir un profil
window.viewProfile = function(profileId) {
    window.location.href = `profile-view.html?id=${profileId}`;
};