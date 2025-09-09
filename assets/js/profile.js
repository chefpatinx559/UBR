/**
 * Gestion du profil utilisateur
 */

document.addEventListener('DOMContentLoaded', async function() {
    // Vérifier l'authentification
    if (!window.authManager.requireAuth()) {
        return;
    }

    try {
        // Charger les données du profil
        const userResponse = await window.ubrApi.getMe();
        const user = userResponse.user;
        
        // Mettre à jour l'interface avec les données utilisateur
        updateProfileUI(user);
        
        // Charger les statistiques
        loadUserStats();
        
    } catch (error) {
        console.error('Erreur lors du chargement du profil:', error);
    }

    // Photo gallery functionality
    const photoItems = document.querySelectorAll('.photo-item');
    photoItems.forEach(item => {
        item.addEventListener('click', function() {
            // Create modal for photo view
            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50';
            modal.innerHTML = `
                <div class="relative max-w-4xl max-h-full p-4">
                    <img src="${this.querySelector('img').src}" alt="Photo" class="max-w-full max-h-full object-contain">
                    <button class="absolute top-4 right-4 text-white text-2xl hover:text-gray-300">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Close modal
            modal.addEventListener('click', function(e) {
                if (e.target === modal || e.target.closest('button')) {
                    modal.remove();
                }
            });
        });
    });

    // Profile completion progress
    const progressBar = document.querySelector('.bg-primary.h-2');
    const progressText = document.querySelector('.text-primary');
    
    // Animate progress bar
    setTimeout(() => {
        progressBar.style.transition = 'width 1s ease-in-out';
        progressBar.style.width = '85%';
    }, 500);

    // Quick actions functionality
    document.querySelectorAll('.bg-primary, .bg-green-600, .bg-yellow-600, .bg-gray-600').forEach(btn => {
        btn.addEventListener('click', function(e) {
            // Add click effect
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
    });

    // Share profile functionality
    const shareBtn = document.querySelector('.fa-share')?.parentElement;
    if (shareBtn) {
        shareBtn.addEventListener('click', function() {
            if (navigator.share) {
                navigator.share({
                    title: 'Mon profil UBR',
                    text: 'Découvrez mon profil sur UBR - Union Bénie et Réelle',
                    url: window.location.href
                });
            } else {
                // Fallback for browsers that don't support Web Share API
                const url = window.location.href;
                navigator.clipboard.writeText(url).then(() => {
                    showNotification('Lien du profil copié dans le presse-papiers', 'success');
                });
            }
        });
    }

    // Notification system
    function showNotification(message, type = 'info') {
        if (window.UBRUtils && typeof window.UBRUtils.showNotification === 'function') {
            window.UBRUtils.showNotification(message, type);
        }
    }

    // Mettre à jour l'interface du profil
    function updateProfileUI(user) {
        // Mettre à jour le nom
        const nameElements = document.querySelectorAll('.text-3xl.font-bold.text-gray-800');
        nameElements.forEach(el => {
            if (el.textContent.includes('Marie')) {
                el.textContent = `${user.first_name} ${user.last_name}`;
            }
        });

        // Mettre à jour les informations
        const infoElements = document.querySelectorAll('.text-gray-600');
        infoElements.forEach(el => {
            if (el.textContent.includes('ans')) {
                el.textContent = `${user.age} ans • ${user.city}, Côte d'Ivoire`;
            }
            if (el.textContent.includes('Infirmière')) {
                el.textContent = `${user.profession || 'Profession non renseignée'} • ${user.denomination}`;
            }
        });

        // Mettre à jour la photo de profil
        if (user.primary_photo) {
            const photoElements = document.querySelectorAll('img[alt*="Photo"]');
            photoElements.forEach(img => {
                img.src = `http://localhost:8000/storage/${user.primary_photo.path}`;
            });
        }

        // Mettre à jour les descriptions
        if (user.about_me) {
            const aboutSection = document.querySelector('p.text-gray-700.leading-relaxed');
            if (aboutSection) {
                aboutSection.textContent = user.about_me;
            }
        }
    }

    // Charger les statistiques utilisateur
    async function loadUserStats() {
        try {
            const stats = await window.ubrApi.request('/users/stats');
            
            // Mettre à jour les statistiques dans l'interface
            const statsElements = document.querySelectorAll('.font-medium.text-gray-900');
            if (statsElements.length >= 5) {
                statsElements[0].textContent = stats.profile_views || 0;
                statsElements[1].textContent = stats.likes_sent || 0;
                statsElements[2].textContent = stats.matches || 0;
                statsElements[3].textContent = stats.messages_sent || 0;
                statsElements[4].textContent = stats.days_active || 0;
            }
        } catch (error) {
            console.error('Erreur lors du chargement des statistiques:', error);
        }
    }
});