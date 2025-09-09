/**
 * Système de gestion des matches pour UBR - Union Bénie et Réelle
 * Ce fichier gère les fonctionnalités liées aux matches entre utilisateurs
 */

document.addEventListener('DOMContentLoaded', function() {
    // Vérifier l'authentification
    if (!window.authManager.requireAuth()) {
        return;
    }

    // Charger les matches depuis l'API
    loadMatches();

    // Système de notification
    function showNotification(message, type = 'info') {
        if (window.UBRUtils && typeof window.UBRUtils.showNotification === 'function') {
            window.UBRUtils.showNotification(message, type);
        }
    }

    // Charger les matches depuis l'API
    async function loadMatches() {
        try {
            const response = await window.ubrApi.getMatches();
            renderMatches(response.data);
        } catch (error) {
            console.error('Erreur lors du chargement des matches:', error);
            showNotification('Erreur lors du chargement des matches', 'error');
        }
    }

    // Afficher les matches dans l'interface
    function renderMatches(matches) {
        const container = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-2');
        if (!container) return;

        container.innerHTML = '';

        matches.forEach(match => {
            const matchCard = createMatchCard(match);
            container.appendChild(matchCard);
        });
    }

    // Créer une carte de match
    function createMatchCard(match) {
        const user = match.matched_user;
        const card = document.createElement('div');
        card.className = 'match-card bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden';
        
        const photoUrl = user.primary_photo?.path 
            ? `http://localhost:8000/storage/${user.primary_photo.path}`
            : `https://via.placeholder.com/400x500/10b981/ffffff?text=${user.first_name}`;

        const compatibilityScore = Math.round(match.compatibility_score || 0);
        let scoreColor = 'bg-yellow-500';
        if (compatibilityScore >= 90) scoreColor = 'bg-green-500';
        else if (compatibilityScore >= 75) scoreColor = 'bg-blue-500';

        card.innerHTML = `
            <div class="relative">
                <img src="${photoUrl}" alt="${user.first_name}" class="w-full h-64 object-cover">
                <div class="absolute top-4 left-4 ${scoreColor} text-white px-3 py-1 rounded-full text-sm font-bold compatibility-score">
                    <i class="fas fa-star mr-1"></i>${compatibilityScore}%
                </div>
                <div class="absolute top-4 right-4 spiritual-badge text-white px-3 py-1 rounded-full text-sm font-medium">
                    <i class="fas fa-cross mr-1"></i>Spirituel
                </div>
                ${user.is_online ? '<div class="absolute bottom-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm"><i class="fas fa-circle mr-1"></i>En ligne</div>' : ''}
            </div>
            
            <div class="p-6">
                <div class="flex items-center justify-between mb-3">
                    <h3 class="font-semibold text-lg text-gray-800">${user.first_name} ${user.last_name.charAt(0)}.</h3>
                    <span class="text-gray-600">${user.age} ans</span>
                </div>
                
                <div class="mb-4">
                    <div class="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Compatibilité Spirituelle</span>
                        <span>${compatibilityScore}%</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                        <div class="${scoreColor.replace('bg-', 'bg-')} h-2 rounded-full" style="width: ${compatibilityScore}%"></div>
                    </div>
                </div>
                
                <div class="space-y-2 mb-4">
                    <p class="text-gray-600 text-sm">
                        <i class="fas fa-map-marker-alt mr-2 text-primary"></i>${user.city}
                    </p>
                    <p class="text-gray-600 text-sm">
                        <i class="fas fa-church mr-2 text-secondary"></i>${user.denomination}
                    </p>
                    ${user.profession ? `<p class="text-gray-600 text-sm"><i class="fas fa-briefcase mr-2 text-accent"></i>${user.profession}</p>` : ''}
                </div>
                
                <p class="text-gray-700 text-sm mb-4 line-clamp-2">
                    ${user.about_me || 'Aucune description disponible...'}
                </p>
                
                <div class="flex space-x-2">
                    <button class="flex-1 bg-primary hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition duration-300 flex items-center justify-center" onclick="startConversation(${user.id})">
                        <i class="fas fa-comment mr-1"></i>Message
                    </button>
                    <button class="px-3 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition duration-300" onclick="viewFullProfile(${user.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </div>
        `;

        return card;
    }

    // Gestion des boutons de match
    document.querySelectorAll('.bg-red-500').forEach(button => {
        button.addEventListener('click', function() {
            const card = this.closest('.match-card');
            showNotification('Match rejeté', 'info');
            card.style.opacity = '0.5';
            setTimeout(() => {
                card.remove();
            }, 1000);
        });
    });

    document.querySelectorAll('.bg-primary').forEach(button => {
        button.addEventListener('click', function() {
            const card = this.closest('.match-card');
            const scoreElement = card.querySelector('.bg-green-500, .bg-blue-500, .bg-yellow-500');
            const score = scoreElement ? scoreElement.textContent : '';
            
            showNotification(`Match liké ! Compatibilité: ${score}`, 'success');
            card.style.opacity = '0.5';
            setTimeout(() => {
                card.remove();
            }, 1000);
        });
    });

    document.querySelectorAll('.fa-comment').forEach(button => {
        button.parentElement.addEventListener('click', function() {
            showNotification('Ouverture de la conversation', 'info');
        });
    });

    // Filtres interactifs
    document.querySelectorAll('select').forEach(select => {
        select.addEventListener('change', function() {
            showNotification('Filtres de compatibilité appliqués', 'info');
            loadMatches();
        });
    });

    // Bouton d'actualisation
    const refreshBtn = document.querySelector('.bg-primary.text-white');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            showNotification('Actualisation des matches en cours...', 'info');
            loadMatches();
        });
    }

    // Bouton "Charger Plus"
    const loadMoreBtn = document.querySelector('.px-8.py-3');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            showNotification('Chargement de nouveaux matches...', 'info');
            loadMatches();
        });
    }

    // Animation des scores de compatibilité
    document.querySelectorAll('.compatibility-score').forEach(score => {
        score.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1)';
        });
        
        score.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });
});

// Fonctions globales pour les interactions
window.startConversation = function(userId) {
    window.location.href = `messages.html?user=${userId}`;
};

window.viewFullProfile = function(userId) {
    window.location.href = `profile-view.html?id=${userId}`;
};