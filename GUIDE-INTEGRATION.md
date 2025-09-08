# Guide d'intégration des modules JavaScript

## Introduction

Ce guide explique comment intégrer les nouveaux modules JavaScript dans les pages HTML existantes du projet UBR. Les modules ont été créés pour améliorer la maintenabilité, la réutilisabilité et les performances du code JavaScript.

## Structure des modules

Les modules JavaScript sont organisés dans le répertoire `assets/js/modules/` :

- `utils.js` : Fonctions utilitaires communes (notifications, compteurs de caractères, animations)
- `forms.js` : Gestion des formulaires (soumission, validation, sauvegarde automatique)
- `user-management.js` : Gestion des utilisateurs (blocage, déblocage, photos de profil)
- `testimonials.js` : Gestion des témoignages (notation par étoiles, filtrage)
- `reports.js` : Gestion des signalements (formulaires, types de signalement)

Le fichier `app.js` sert de point d'entrée pour initialiser les fonctionnalités appropriées en fonction de la page actuelle.

## Comment intégrer les modules

### 1. Ajouter les scripts dans l'ordre approprié

Ajoutez les balises script suivantes juste avant la fermeture de la balise `</body>` dans vos fichiers HTML :

```html
<!-- Modules JavaScript -->
<script src="../assets/js/modules/utils.js"></script>
<!-- Ajoutez uniquement les modules nécessaires pour la page -->
<script src="../assets/js/modules/forms.js"></script>
<script src="../assets/js/modules/user-management.js"></script>
<script src="../assets/js/modules/testimonials.js"></script>
<script src="../assets/js/modules/reports.js"></script>

<!-- Initialisation de l'application -->
<script src="../assets/js/app.js"></script>
```

**Important** : Incluez toujours `utils.js` en premier, car les autres modules en dépendent.

### 2. Modules à inclure selon le type de page

| Type de page | Modules requis |
|--------------|---------------|
| Utilisateurs bloqués | `utils.js`, `user-management.js` |
| Contact | `utils.js`, `forms.js` |
| Témoignages | `utils.js`, `forms.js`, `testimonials.js` |
| Signalement | `utils.js`, `forms.js`, `reports.js` |
| Édition de profil | `utils.js`, `forms.js`, `user-management.js` |

### 3. Structure HTML requise

Pour que les modules fonctionnent correctement, assurez-vous que votre HTML contient les éléments avec les IDs appropriés :

#### Pour les notifications (utils.js)

```html
<div id="notification" class="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 transform translate-y-10 opacity-0 transition-all duration-300 z-50 max-w-md hidden">
    <div class="flex items-center">
        <div id="notification-icon" class="w-8 h-8 rounded-full flex items-center justify-center mr-3">
            <i class="fas"></i>
        </div>
        <div class="flex-1">
            <h4 id="notification-title" class="font-semibold text-gray-900"></h4>
            <p id="notification-message" class="text-sm text-gray-600"></p>
        </div>
        <button id="close-notification" class="text-gray-400 hover:text-gray-600 ml-4">
            <i class="fas fa-times"></i>
        </button>
    </div>
</div>
```

#### Pour les compteurs de caractères (utils.js)

Ajoutez un élément avec l'ID `char-count` près de chaque textarea qui doit avoir un compteur :

```html
<textarea id="message" name="message" maxlength="500"></textarea>
<div class="flex justify-end mt-1">
    <span class="text-xs text-gray-500"><span id="char-count">0</span>/500 caractères</span>
</div>
```

## Exemples d'intégration

Vous pouvez consulter les exemples d'intégration dans les fichiers suivants :

- `pages/blocked-users-updated.html`
- `pages/contact-updated.html`
- `pages/profile-edit-updated.html`
- `pages/temoignages-updated.html`
- `pages/signaler-updated.html`

Ces fichiers montrent comment les modules JavaScript ont été intégrés dans les pages HTML existantes.

## Utilisation des fonctions principales

### Afficher une notification

```javascript
UBRUtils.showNotification({
    type: 'success', // 'success', 'error', 'warning', 'info'
    title: 'Succès !',
    message: 'Votre action a été effectuée avec succès.'
});
```

### Initialiser les compteurs de caractères

```javascript
UBRUtils.initCharCounters();
```

### Initialiser un formulaire avec validation

```javascript
UBRForms.initFormSubmission({
    formId: 'contact-form',
    onSubmit: function(formData) {
        // Traitement du formulaire
        console.log(formData);
        
        // Simuler un délai de traitement
        setTimeout(function() {
            UBRUtils.showNotification({
                type: 'success',
                title: 'Formulaire envoyé',
                message: 'Nous avons bien reçu votre message.'
            });
            
            // Réinitialiser le formulaire
            document.getElementById('contact-form').reset();
            UBRUtils.resetCharCounters();
        }, 1500);
    }
});
```

## Conclusion

En suivant ce guide, vous pourrez facilement intégrer les nouveaux modules JavaScript dans vos pages HTML existantes. Cette approche modulaire améliore la maintenabilité du code et facilite les futures évolutions du projet.

Pour toute question ou assistance supplémentaire, consultez la documentation dans le répertoire `assets/js/modules/README.md`.