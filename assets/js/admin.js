/**
 * Système d'administration pour UBR - Union Bénie et Réelle
 * Ce fichier gère les fonctionnalités du tableau de bord administrateur
 */

// Initialize dynamic functionality
function initializeDynamicFeatures() {
    // Message moderation buttons
    document.querySelectorAll('[data-filter]').forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            console.log('Filter applied:', filter);
            // Add visual feedback
            this.classList.add('ring-2', 'ring-blue-500');
            setTimeout(() => {
                this.classList.remove('ring-2', 'ring-blue-500');
            }, 500);
        });
    });

    // Action buttons in messages
    document.querySelectorAll('.bg-green-600, .bg-red-600, .bg-yellow-600, .bg-gray-600').forEach(button => {
        button.addEventListener('click', function() {
            const action = this.textContent.trim();
            const messageContainer = this.closest('.p-6');
            
            if (action.includes('Approuver')) {
                showNotification('Message approuvé avec succès', 'success');
                messageContainer.style.opacity = '0.5';
                setTimeout(() => {
                    messageContainer.remove();
                }, 1000);
            } else if (action.includes('Rejeter')) {
                showNotification('Message rejeté', 'error');
                messageContainer.style.opacity = '0.5';
                setTimeout(() => {
                    messageContainer.remove();
                }, 1000);
            } else if (action.includes('Signaler')) {
                showNotification('Message signalé pour modération', 'warning');
            } else if (action.includes('Voir Profil')) {
                showNotification('Ouverture du profil utilisateur', 'info');
            }
        });
    });

    // User management buttons
    document.querySelectorAll('.text-blue-600, .text-yellow-600, .text-red-600, .text-green-600').forEach(button => {
        button.addEventListener('click', function() {
            const action = this.textContent.trim();
            
            if (action === 'Voir') {
                showNotification('Ouverture du profil utilisateur', 'info');
            } else if (action === 'Suspendre') {
                showNotification('Utilisateur suspendu', 'warning');
                this.textContent = 'Suspendu';
                this.classList.remove('text-yellow-600', 'hover:text-yellow-900');
                this.classList.add('text-red-600', 'hover:text-red-900');
            } else if (action === 'Supprimer') {
                if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
                    showNotification('Utilisateur supprimé', 'error');
                    this.closest('tr').remove();
                }
            } else if (action === 'Approuver') {
                showNotification('Profil approuvé', 'success');
                this.textContent = 'Approuvé';
                this.classList.remove('text-green-600', 'hover:text-green-900');
                this.classList.add('text-blue-600', 'hover:text-blue-900');
            } else if (action === 'Refuser') {
                if (confirm('Êtes-vous sûr de vouloir refuser ce profil ?')) {
                    showNotification('Profil refusé', 'error');
                    this.closest('tr').remove();
                }
            }
        });
    });

    // Profile verification buttons
    document.querySelectorAll('.bg-green-600.text-white, .bg-red-600.text-white').forEach(button => {
        button.addEventListener('click', function() {
            const action = this.textContent.trim();
            
            if (action.includes('Approuver')) {
                showNotification('Profil approuvé avec succès', 'success');
                this.closest('.bg-white.rounded-xl').style.opacity = '0.5';
                setTimeout(() => {
                    this.closest('.bg-white.rounded-xl').remove();
                }, 1000);
            } else if (action.includes('Refuser')) {
                if (confirm('Êtes-vous sûr de vouloir refuser ce profil ?')) {
                    showNotification('Profil refusé', 'error');
                    this.closest('.bg-white.rounded-xl').style.opacity = '0.5';
                    setTimeout(() => {
                        this.closest('.bg-white.rounded-xl').remove();
                    }, 1000);
                }
            }
        });
    });

    // Report action buttons
    document.querySelectorAll('.bg-blue-600.text-white, .bg-yellow-600.text-white, .bg-red-600.text-white').forEach(button => {
        button.addEventListener('click', function() {
            const action = this.textContent.trim();
            
            if (action === 'Examiner') {
                showNotification('Examen du signalement en cours', 'info');
            } else if (action === 'Avertir Utilisateur') {
                showNotification('Avertissement envoyé à l\'utilisateur', 'warning');
            } else if (action === 'Suspendre') {
                if (confirm('Êtes-vous sûr de vouloir suspendre cet utilisateur ?')) {
                    showNotification('Utilisateur suspendu', 'error');
                }
            } else if (action === 'Vérifier Identité') {
                showNotification('Vérification d\'identité en cours', 'info');
            } else if (action === 'Supprimer Profil') {
                if (confirm('Êtes-vous sûr de vouloir supprimer ce profil ?')) {
                    showNotification('Profil supprimé', 'error');
                }
            }
        });
    });

    // Settings toggles
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const setting = this.closest('label')?.textContent.trim() || 'Paramètre';
            const status = this.checked ? 'activé' : 'désactivé';
            showNotification(`${setting} ${status}`, 'info');
        });
    });

    // Settings buttons
    document.querySelectorAll('.bg-blue-600.text-white, .bg-yellow-600.text-white, .bg-green-600.text-white').forEach(button => {
        button.addEventListener('click', function() {
            const action = this.textContent.trim();
            
            if (action.includes('Exporter')) {
                showNotification('Export en cours...', 'info');
                setTimeout(() => {
                    showNotification('Export terminé', 'success');
                }, 2000);
            } else if (action.includes('Nettoyer')) {
                if (confirm('Êtes-vous sûr de vouloir nettoyer les profils inactifs ?')) {
                    showNotification('Nettoyage en cours...', 'info');
                    setTimeout(() => {
                        showNotification('Nettoyage terminé', 'success');
                    }, 2000);
                }
            } else if (action.includes('Synchroniser')) {
                showNotification('Synchronisation en cours...', 'info');
                setTimeout(() => {
                    showNotification('Synchronisation terminée', 'success');
                }, 2000);
            }
        });
    });

    // Danger zone buttons
    document.querySelectorAll('.bg-red-600.text-white').forEach(button => {
        button.addEventListener('click', function() {
            const action = this.textContent.trim();
            
            if (action.includes('Réinitialiser')) {
                if (confirm('ATTENTION: Cette action réinitialisera toutes les statistiques. Continuer ?')) {
                    showNotification('Réinitialisation des statistiques...', 'warning');
                    setTimeout(() => {
                        showNotification('Statistiques réinitialisées', 'success');
                    }, 2000);
                }
            } else if (action.includes('Maintenance')) {
                if (confirm('ATTENTION: Le site sera mis en mode maintenance. Continuer ?')) {
                    showNotification('Activation du mode maintenance...', 'warning');
                    setTimeout(() => {
                        showNotification('Mode maintenance activé', 'success');
                    }, 2000);
                }
            }
        });
    });

    document.querySelectorAll('button').forEach(btn => {
        if (btn.textContent.includes('Mode Maintenance')) {
            btn.addEventListener('click', async () => {
                const res = await fetch('/api/settings/maintenance', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ active: true })
                });
                const data = await res.json();
                if (data.success) {
                    alert('Mode maintenance activé !');
                }
            });
        }
    });
}

// Notification system
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
    
    // Animate in
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-link');
    const contentSections = document.querySelectorAll('.content-section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active', 'bg-blue-50', 'text-blue-700'));
            navLinks.forEach(l => l.classList.add('text-gray-700', 'hover:bg-gray-50'));
            
            // Add active class to clicked link
            this.classList.add('active', 'bg-blue-50', 'text-blue-700');
            this.classList.remove('text-gray-700', 'hover:bg-gray-50');
            
            // Hide all content sections
            contentSections.forEach(section => section.classList.add('hidden'));
            
            // Show corresponding content section
            const targetId = this.getAttribute('href').substring(1) + '-content';
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.remove('hidden');
            }
        });
    });

    // Initialize charts
    initializeCharts();
    // Initialize dynamic features
    initializeDynamicFeatures();
});

function initializeCharts() {
    // Registrations Chart
    const registrationsCtx = document.getElementById('registrationsChart');
    if (registrationsCtx) {
        new Chart(registrationsCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû'],
                datasets: [{
                    label: 'Inscriptions',
                    data: [65, 78, 90, 102, 125, 145, 167, 189],
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: true },
                    title: { display: false }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }

    // Age Chart (exemple)
    const ageCtx = document.getElementById('ageChart');
    if (ageCtx) {
        new Chart(ageCtx, {
            type: 'doughnut',
            data: {
                labels: ['20-29', '30-39', '40-49', '50+'],
                datasets: [{
                    label: 'Répartition par Âge',
                    data: [120, 90, 40, 10],
                    backgroundColor: [
                        'rgba(59,130,246,0.7)',
                        'rgba(16,185,129,0.7)',
                        'rgba(245,158,11,0.7)',
                        'rgba(124,58,237,0.7)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'bottom' },
                    title: { display: false }
                }
            }
        });
    }
}

async function fetchAdminStats() {
  try {
    const res = await fetch('/api/admin/stats', {
      method: 'GET',
      headers: {
        'x-admin-token': 'monSuperTokenSecret' // Mets la même valeur que dans ton .env
      }
    });
    if (!res.ok) throw new Error('Erreur API');
    const stats = await res.json();
    document.getElementById('user-count').textContent = stats.userCount ?? '-';
    document.getElementById('message-count').textContent = stats.messageCount ?? '-';
    document.getElementById('match-count').textContent = stats.matchCount ?? '-';
  } catch (err) {
    document.getElementById('user-count').textContent = '-';
    document.getElementById('message-count').textContent = '-';
    document.getElementById('match-count').textContent = '-';
    alert('Impossible de charger les statistiques admin');
  }
}

async function fetchAdminUsers() {
    try {
        showLoading(true); // Afficher un indicateur de chargement
        
        const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
        if (!token) {
            window.location.href = 'admin-login.html';
            return;
        }

        const response = await fetch('/api/admin/users', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                // Token expiré ou invalide
                window.location.href = 'admin-login.html';
                return;
            }
            throw new Error('Erreur lors de la récupération des utilisateurs');
        }

        const data = await response.json();
        updateUsersTable(data.users);
        
    } catch (error) {
        console.error('Erreur fetchAdminUsers:', error);
        showNotification('Impossible de charger les utilisateurs. Veuillez réessayer.', 'error');
    } finally {
        showLoading(false); // Cacher l'indicateur de chargement
    }
}

// Fonction utilitaire pour gérer l'affichage du chargement
function showLoading(show) {
    const loadingElement = document.getElementById('loading-indicator');
    if (loadingElement) {
        loadingElement.style.display = show ? 'block' : 'none';
    }
}
  
  function updateUsersTable(users) {
    const tbody = document.querySelector('#users-table tbody');
    if (!tbody) {
      console.error('Tableau des utilisateurs introuvable dans le DOM');
      return;
    }
  
    // Vider le tableau
    tbody.innerHTML = '';
  
    // Remplir avec les nouveaux utilisateurs
    users.forEach(user => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="flex items-center">
            <div class="flex-shrink-0 h-10 w-10">
              <img class="h-10 w-10 rounded-full" src="${user.photo || 'https://via.placeholder.com/40'}" alt="">
            </div>
            <div class="ml-4">
              <div class="text-sm font-medium text-gray-900">${user.firstName} ${user.lastName}</div>
              <div class="text-sm text-gray-500">${user.email}</div>
            </div>
          </div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
            ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
            ${user.isActive ? 'Actif' : 'Inactif'}
          </span>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          ${new Date(user.createdAt).toLocaleDateString()}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <button class="view-btn text-blue-600 hover:text-blue-900 mr-4" data-user-id="${user._id}">Voir</button>
          <button class="suspend-btn ${user.isActive ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'} mr-4" 
                  data-user-id="${user._id}">
            ${user.isActive ? 'Suspendre' : 'Activer'}
          </button>
          <button class="delete-btn text-red-600 hover:text-red-900" data-user-id="${user._id}">Supprimer</button>
        </td>
      `;
      tbody.appendChild(row);
    });
  
    // Ajouter les gestionnaires d'événements
    addUserActionHandlers();
  }
  
  function addUserActionHandlers() {
    // Gestionnaire pour le bouton Voir
    document.querySelectorAll('.view-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const userId = e.target.getAttribute('data-user-id');
        // Ici, vous pouvez rediriger vers la page de détail de l'utilisateur
        // ou afficher une modale avec les détails
        console.log('Voir utilisateur:', userId);
      });
    });
  
    // Gestionnaire pour le bouton Suspendre/Activer
    document.querySelectorAll('.suspend-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const userId = e.target.getAttribute('data-user-id');
        const isSuspending = e.target.textContent.trim() === 'Suspendre';
        
        try {
          const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
          const response = await fetch(`/api/admin/users/${userId}/suspend`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ suspended: isSuspending })
          });
  
          if (!response.ok) throw new Error('Échec de la mise à jour');
          
          showNotification(`Utilisateur ${isSuspending ? 'suspendu' : 'réactivé'} avec succès`, 'success');
          // Recharger la liste des utilisateurs
          fetchAdminUsers();
        } catch (error) {
          console.error('Erreur:', error);
          showNotification('Erreur lors de la mise à jour de l\'utilisateur', 'error');
        }
      });
    });
  
    // Gestionnaire pour le bouton Supprimer
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const userId = e.target.getAttribute('data-user-id');
        
        if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
          return;
        }
  
        try {
          const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
          const response = await fetch(`/api/admin/users/${userId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
  
          if (!response.ok) throw new Error('Échec de la suppression');
          
          showNotification('Utilisateur supprimé avec succès', 'success');
          // Recharger la liste des utilisateurs
          fetchAdminUsers();
        } catch (error) {
          console.error('Erreur:', error);
          showNotification('Erreur lors de la suppression de l\'utilisateur', 'error');
        }
      });
    });
  }

  // Appeler fetchAdminUsers quand la page est chargée
document.addEventListener('DOMContentLoaded', function() {
    // Vérifier si on est sur la page de gestion des utilisateurs
    if (document.getElementById('users-content')) {
      // Charger les utilisateurs immédiatement
      fetchAdminUsers();
      
      // Configurer le rafraîchissement automatique toutes les 30 secondes
      setInterval(fetchAdminUsers, 30000);
    }
  });