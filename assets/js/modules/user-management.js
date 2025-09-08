/**
 * user-management.js - Gestion des utilisateurs pour l'application UBR
 */

const UBRUserManagement = {
    /**
     * Initialise la gestion des utilisateurs bloqués
     * @param {string} blockListSelector - Sélecteur de la liste des utilisateurs bloqués
     * @param {string} countSelector - Sélecteur pour l'affichage du nombre d'utilisateurs bloqués
     * @param {string} clearAllSelector - Sélecteur pour le bouton de suppression de tous les bloqués
     */
    initBlockedUsers: function(blockListSelector, countSelector, clearAllSelector) {
        const blockList = document.querySelector(blockListSelector);
        const countElement = document.querySelector(countSelector);
        const clearAllBtn = document.querySelector(clearAllSelector);
        
        if (!blockList || !countElement) return;
        
        // Initialiser les boutons de déblocage
        this.initUnblockButtons();
        
        // Initialiser le bouton de suppression de tous les bloqués
        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (confirm('Êtes-vous sûr de vouloir débloquer tous les utilisateurs ?')) {
                    const items = blockList.querySelectorAll('.blocked-user-item');
                    items.forEach(item => item.remove());
                    this.updateBlockedCount(countElement, 0);
                    
                    // Afficher une notification si UBRUtils est disponible
                    if (window.UBRUtils && typeof window.UBRUtils.showNotification === 'function') {
                        window.UBRUtils.showNotification('Tous les utilisateurs ont été débloqués', 'success');
                    }
                }
            });
        }
        
        // Mettre à jour le compteur initial
        this.updateBlockedCount(countElement);
    },
    
    /**
     * Initialise les boutons de déblocage individuels
     */
    initUnblockButtons: function() {
        const unblockButtons = document.querySelectorAll('.unblock-btn');
        const countElement = document.querySelector('#blocked-count');
        
        unblockButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const userItem = button.closest('.blocked-user-item');
                if (userItem) {
                    userItem.classList.add('fade-out');
                    setTimeout(() => {
                        userItem.remove();
                        this.updateBlockedCount(countElement);
                        
                        // Afficher une notification si UBRUtils est disponible
                        if (window.UBRUtils && typeof window.UBRUtils.showNotification === 'function') {
                            window.UBRUtils.showNotification('Utilisateur débloqué avec succès', 'success');
                        }
                    }, 300);
                }
            });
        });
    },
    
    /**
     * Met à jour le compteur d'utilisateurs bloqués
     * @param {HTMLElement} countElement - L'élément affichant le nombre
     * @param {number|null} count - Le nombre à afficher (si null, compte automatiquement)
     */
    updateBlockedCount: function(countElement, count = null) {
        if (!countElement) return;
        
        if (count === null) {
            // Compter automatiquement les éléments
            count = document.querySelectorAll('.blocked-user-item').length;
        }
        
        countElement.textContent = count;
        
        // Mettre à jour les éléments qui affichent le pluriel
        const pluralElements = document.querySelectorAll('.blocked-plural');
        pluralElements.forEach(el => {
            el.style.display = count > 1 ? 'inline' : 'none';
        });
        
        const singularElements = document.querySelectorAll('.blocked-singular');
        singularElements.forEach(el => {
            el.style.display = count === 1 ? 'inline' : 'none';
        });
        
        const emptyStateElement = document.querySelector('.empty-blocked-state');
        if (emptyStateElement) {
            emptyStateElement.style.display = count === 0 ? 'block' : 'none';
        }
    },
    
    /**
     * Initialise les filtres pour les utilisateurs bloqués
     * @param {string} filterSelector - Sélecteur pour les boutons de filtre
     * @param {string} searchSelector - Sélecteur pour le champ de recherche
     * @param {string} itemSelector - Sélecteur pour les éléments à filtrer
     */
    initBlockedFilters: function(filterSelector, searchSelector, itemSelector) {
        const filterButtons = document.querySelectorAll(filterSelector);
        const searchInput = document.querySelector(searchSelector);
        const items = document.querySelectorAll(itemSelector);
        
        if (!filterButtons.length || !items.length) return;
        
        // Filtrage par catégorie
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                const filter = button.getAttribute('data-filter');
                
                // Mettre à jour l'état actif des boutons
                filterButtons.forEach(btn => btn.classList.remove('active-filter'));
                button.classList.add('active-filter');
                
                // Filtrer les éléments
                items.forEach(item => {
                    if (filter === 'all') {
                        item.style.display = '';
                    } else {
                        const reason = item.getAttribute('data-reason');
                        item.style.display = reason === filter ? '' : 'none';
                    }
                });
                
                // Réappliquer la recherche si elle est active
                if (searchInput && searchInput.value.trim()) {
                    this.applySearch(searchInput.value.trim(), items);
                }
            });
        });
        
        // Recherche par nom
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                const searchTerm = searchInput.value.trim().toLowerCase();
                this.applySearch(searchTerm, items);
            });
        }
    },
    
    /**
     * Applique la recherche sur les éléments
     * @param {string} searchTerm - Le terme de recherche
     * @param {NodeList} items - Les éléments à filtrer
     */
    applySearch: function(searchTerm, items) {
        items.forEach(item => {
            // Ne pas modifier les éléments déjà cachés par le filtre de catégorie
            if (item.style.display === 'none' && searchTerm) return;
            
            const userName = item.querySelector('.user-name')?.textContent.toLowerCase() || '';
            const userInfo = item.querySelector('.user-info')?.textContent.toLowerCase() || '';
            
            if (searchTerm === '' || userName.includes(searchTerm) || userInfo.includes(searchTerm)) {
                item.style.display = '';
            } else {
                item.style.display = 'none';
            }
        });
    },
    
    /**
     * Initialise l'exportation des utilisateurs bloqués
     * @param {string} exportBtnSelector - Sélecteur pour le bouton d'exportation
     * @param {string} itemSelector - Sélecteur pour les éléments à exporter
     */
    initBlockedExport: function(exportBtnSelector, itemSelector) {
        const exportBtn = document.querySelector(exportBtnSelector);
        if (!exportBtn) return;
        
        exportBtn.addEventListener('click', () => {
            const items = document.querySelectorAll(itemSelector);
            if (!items.length) {
                if (window.UBRUtils && typeof window.UBRUtils.showNotification === 'function') {
                    window.UBRUtils.showNotification('Aucun utilisateur bloqué à exporter', 'warning');
                }
                return;
            }
            
            const blockedUsers = [];
            items.forEach(item => {
                const userName = item.querySelector('.user-name')?.textContent.trim() || 'Inconnu';
                const userInfo = item.querySelector('.user-info')?.textContent.trim() || '';
                const reason = item.getAttribute('data-reason') || 'Autre';
                const date = item.querySelector('.block-date')?.textContent.trim() || 'Date inconnue';
                
                blockedUsers.push({
                    name: userName,
                    info: userInfo,
                    reason: reason,
                    date: date
                });
            });
            
            // Créer un fichier CSV
            let csvContent = 'Nom,Informations,Raison,Date\n';
            blockedUsers.forEach(user => {
                csvContent += `"${user.name}","${user.info}","${user.reason}","${user.date}"\n`;
            });
            
            // Télécharger le fichier
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', 'utilisateurs_bloques.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            if (window.UBRUtils && typeof window.UBRUtils.showNotification === 'function') {
                window.UBRUtils.showNotification('Liste des utilisateurs bloqués exportée avec succès', 'success');
            }
        });
    },
    
    /**
     * Initialise la gestion des photos de profil
     * @param {string} uploadBtnSelector - Sélecteur pour le bouton d'upload
     * @param {string} previewSelector - Sélecteur pour l'aperçu de l'image
     * @param {string} removeSelector - Sélecteur pour le bouton de suppression
     * @param {string} inputSelector - Sélecteur pour l'input file
     */
    initProfilePhotoUpload: function(uploadBtnSelector, previewSelector, removeSelector, inputSelector) {
        const uploadBtn = document.querySelector(uploadBtnSelector);
        const preview = document.querySelector(previewSelector);
        const removeBtn = document.querySelector(removeSelector);
        const fileInput = document.querySelector(inputSelector);
        
        if (!uploadBtn || !preview || !removeBtn || !fileInput) return;
        
        uploadBtn.addEventListener('click', () => {
            fileInput.click();
        });
        
        fileInput.addEventListener('change', () => {
            if (fileInput.files && fileInput.files[0]) {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    preview.src = e.target.result;
                    preview.classList.remove('hidden');
                    removeBtn.classList.remove('hidden');
                    uploadBtn.textContent = 'Changer la photo';
                };
                
                reader.readAsDataURL(fileInput.files[0]);
            }
        });
        
        removeBtn.addEventListener('click', () => {
            preview.src = '';
            preview.classList.add('hidden');
            removeBtn.classList.add('hidden');
            fileInput.value = '';
            uploadBtn.textContent = 'Ajouter une photo';
        });
    }
};

// Exporter l'objet UBRUserManagement pour une utilisation dans d'autres fichiers
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UBRUserManagement;
} else {
    window.UBRUserManagement = UBRUserManagement;
}