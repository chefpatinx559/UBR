// assets/js/component-loader.js
/**
 * Système de chargement de composants avec Fetch et innerHTML
 * UBR - Union Bénie et Réelle
 */

class ComponentLoader {
    constructor() {
        this.cache = new Map();
        this.loadingComponents = new Set();
    }

    /**
     * Charge un composant HTML
     * @param {string} componentPath - Chemin vers le composant
     * @param {boolean} useCache - Utiliser le cache (défaut: true)
     * @returns {Promise<string>} Contenu HTML du composant
     */
    async loadComponent(componentPath, useCache = true) {
        // Vérifier le cache
        if (useCache && this.cache.has(componentPath)) {
            return this.cache.get(componentPath);
        }

        // Éviter les chargements multiples simultanés
        if (this.loadingComponents.has(componentPath)) {
            return new Promise((resolve) => {
                const checkCache = () => {
                    if (this.cache.has(componentPath)) {
                        resolve(this.cache.get(componentPath));
                    } else {
                        setTimeout(checkCache, 10);
                    }
                };
                checkCache();
            });
        }

        this.loadingComponents.add(componentPath);

        try {
            const response = await fetch(componentPath);
            
            if (!response.ok) {
                throw new Error(`Erreur ${response.status}: ${response.statusText}`);
            }

            const html = await response.text();
            
            // Mettre en cache
            if (useCache) {
                this.cache.set(componentPath, html);
            }

            this.loadingComponents.delete(componentPath);
            return html;

        } catch (error) {
            this.loadingComponents.delete(componentPath);
            console.error(`Erreur lors du chargement du composant ${componentPath}:`, error);
            return `<div class="error-component">Erreur de chargement: ${componentPath}</div>`;
        }
    }

    /**
     * Inclut un composant dans un élément du DOM
     * @param {string} selector - Sélecteur CSS de l'élément cible
     * @param {string} componentPath - Chemin vers le composant
     * @param {boolean} append - Ajouter au contenu existant (défaut: false = remplacer)
     */
    async includeComponent(selector, componentPath, append = false) {
        const element = document.querySelector(selector);
        
        if (!element) {
            console.error(`Élément non trouvé: ${selector}`);
            return false;
        }

        try {
            // Afficher un indicateur de chargement
            if (!append) {
                element.innerHTML = '<div class="loading-component">Chargement...</div>';
            }

            const html = await this.loadComponent(componentPath);
            
            if (append) {
                element.insertAdjacentHTML('beforeend', html);
            } else {
                element.innerHTML = html;
            }

            // Déclencher un événement personnalisé
            element.dispatchEvent(new CustomEvent('componentLoaded', {
                detail: { componentPath, selector }
            }));

            return true;

        } catch (error) {
            console.error(`Erreur lors de l'inclusion du composant:`, error);
            element.innerHTML = '<div class="error-component">Erreur de chargement</div>';
            return false;
        }
    }

    /**
     * Charge plusieurs composants en parallèle
     * @param {Array} components - Tableau d'objets {selector, path}
     */
    async loadMultipleComponents(components) {
        const promises = components.map(({selector, path, append = false}) => 
            this.includeComponent(selector, path, append)
        );

        try {
            const results = await Promise.all(promises);
            console.log('Tous les composants chargés:', results);
            return results;
        } catch (error) {
            console.error('Erreur lors du chargement multiple:', error);
            return [];
        }
    }

    /**
     * Auto-chargement basé sur des attributs data
     */
    async autoLoadComponents() {
        const elements = document.querySelectorAll('[data-component]');
        
        const components = Array.from(elements).map(element => ({
            selector: `#${element.id}` || `[data-component="${element.dataset.component}"]`,
            path: element.dataset.component,
            append: element.dataset.append === 'true'
        }));

        if (components.length > 0) {
            await this.loadMultipleComponents(components);
        }
    }

    /**
     * Recharge un composant (force le rechargement sans cache)
     * @param {string} selector - Sélecteur de l'élément
     * @param {string} componentPath - Chemin du composant
     */
    async reloadComponent(selector, componentPath) {
        return await this.includeComponent(selector, componentPath + '?t=' + Date.now(), false);
    }

    /**
     * Vide le cache
     */
    clearCache() {
        this.cache.clear();
        console.log('Cache des composants vidé');
    }

    /**
     * Pré-charge des composants (pour optimiser les performances)
     * @param {Array<string>} componentPaths - Chemins des composants à pré-charger
     */
    async preloadComponents(componentPaths) {
        const promises = componentPaths.map(path => this.loadComponent(path, true));
        
        try {
            await Promise.all(promises);
            console.log('Composants pré-chargés:', componentPaths);
        } catch (error) {
            console.error('Erreur lors du pré-chargement:', error);
        }
    }
}

// Instance globale
window.componentLoader = new ComponentLoader();

// Auto-chargement au chargement de la page
document.addEventListener('DOMContentLoaded', async () => {
    await window.componentLoader.autoLoadComponents();
    // Déclencher un événement global
    document.dispatchEvent(new CustomEvent('allComponentsLoaded'));
});

// Fonctions utilitaires globales
window.loadComponent = (selector, path, append = false) => {
    return window.componentLoader.includeComponent(selector, path, append);
};

window.reloadComponent = (selector, path) => {
    return window.componentLoader.reloadComponent(selector, path);
};

// Script additionnel pour le chargement automatique des composants
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll('[data-component]').forEach(async (el) => {
    const url = el.getAttribute('data-component');
    try {
      const res = await fetch(url);
      if (res.ok) {
        el.innerHTML = await res.text();
      } else {
        el.innerHTML = "<!-- Erreur de chargement du composant -->";
      }
    } catch (e) {
      el.innerHTML = "<!-- Erreur de chargement du composant -->";
    }
  });
});


// Export pour les modules ES6 si nécessaire
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ComponentLoader;
}