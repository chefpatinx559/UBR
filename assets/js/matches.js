/**
 * Système de gestion des matches pour UBR - Union Bénie et Réelle
 * Ce fichier gère les fonctionnalités liées aux matches entre utilisateurs
 */

document.addEventListener('DOMContentLoaded', function() {
    // Système de notification
    function showNotification(message, type = 'info') {
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
        
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);
        
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
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
        });
    });

    // Bouton d'actualisation
    document.querySelector('.bg-primary.text-white').addEventListener('click', function() {
        showNotification('Actualisation des matches en cours...', 'info');
        setTimeout(() => {
            showNotification('Nouveaux matches trouvés !', 'success');
        }, 2000);
    });

    // Bouton "Charger Plus"
    document.querySelector('.px-8.py-3').addEventListener('click', function() {
        showNotification('Chargement de nouveaux matches...', 'info');
        setTimeout(() => {
            showNotification('3 nouveaux matches ajoutés !', 'success');
        }, 1500);
    });

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