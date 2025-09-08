# Modules JavaScript UBR

Ce dossier contient les modules JavaScript extraits des pages HTML de l'application UBR. Ces modules ont été créés pour améliorer la maintenabilité, la réutilisabilité et les performances du code.

## Structure des modules

- **utils.js** : Fonctions utilitaires communes à toutes les pages (notifications, compteurs de caractères, animations, validation de formulaires, etc.)
- **forms.js** : Gestion des formulaires (soumission, réinitialisation, auto-suggestion, sauvegarde de brouillons, etc.)
- **user-management.js** : Gestion des utilisateurs (blocage/déblocage, filtrage, exportation, gestion des photos de profil, etc.)
- **testimonials.js** : Gestion des témoignages (notation par étoiles, modal, formulaire, filtrage, etc.)
- **reports.js** : Gestion des signalements (système de signalement, pré-sélection, suggestions automatiques, etc.)

## Comment intégrer les modules

Pour intégrer ces modules dans vos pages HTML existantes, suivez ces étapes :

1. Ajoutez d'abord le module `utils.js` qui contient les fonctions utilitaires communes.
2. Ajoutez ensuite les modules spécifiques dont vous avez besoin (forms.js, user-management.js, testimonials.js, reports.js).
3. Enfin, ajoutez le fichier `app.js` qui initialise les fonctionnalités en fonction de la page.

```html
<!-- Modules JavaScript -->
<script src="assets/js/modules/utils.js"></script>

<!-- Modules spécifiques (ajoutez uniquement ceux dont vous avez besoin) -->
<script src="assets/js/modules/forms.js"></script>
<script src="assets/js/modules/user-management.js"></script>
<script src="assets/js/modules/testimonials.js"></script>
<script src="assets/js/modules/reports.js"></script>

<!-- Initialisation de l'application -->
<script src="assets/js/app.js"></script>

<!-- Script principal existant (conservez-le si nécessaire) -->
<script src="assets/js/main.js"></script>
```

## Fonctionnalités disponibles

### utils.js

- `UBRUtils.showNotification(message, type, duration)` : Affiche une notification toast
- `UBRUtils.initCharCounters()` : Initialise les compteurs de caractères pour les zones de texte
- `UBRUtils.resetCharCounters()` : Réinitialise les compteurs de caractères
- `UBRUtils.initScrollAnimations()` : Initialise les animations au défilement
- `UBRUtils.validateForm(form)` : Valide un formulaire en temps réel
- `UBRUtils.setupEmailValidation(selector)` : Configure la validation d'email
- `UBRUtils.setupPhoneNumberFormatting(selector)` : Configure le formatage des numéros de téléphone

### forms.js

- `UBRForms.initFormSubmission(formId, onSuccess, onError, simulatedDelay)` : Initialise la soumission d'un formulaire avec animation
- `UBRForms.resetForm(formId, callback)` : Réinitialise un formulaire
- `UBRForms.setupAutoSuggestions(selectSelector, textareaSelector, suggestions)` : Configure l'auto-suggestion basée sur le type de sélection
- `UBRForms.setupSubjectAutoCompletion(messageSelector, subjectSelector, keywordMap)` : Configure l'auto-complétion du sujet basée sur les mots-clés
- `UBRForms.setupUrgencyDetection(textareaSelector, urgencySelector, urgentKeywords, mediumKeywords)` : Configure la détection d'urgence basée sur les mots-clés
- `UBRForms.setupAutoSave(formId, storageKey)` : Configure la sauvegarde automatique du brouillon d'un formulaire
- `UBRForms.restoreDraft(formId, storageKey, callback)` : Restaure un brouillon sauvegardé
- `UBRForms.clearDraft(storageKey)` : Supprime un brouillon sauvegardé
- `UBRForms.setupBeforeUnloadWarning(formId, message)` : Configure la confirmation avant fermeture si le formulaire est rempli

### user-management.js

- `UBRUserManagement.initBlockedUsers(blockListSelector, countSelector, clearAllSelector)` : Initialise la gestion des utilisateurs bloqués
- `UBRUserManagement.initUnblockButtons()` : Initialise les boutons de déblocage individuels
- `UBRUserManagement.updateBlockedCount(countElement, count)` : Met à jour le compteur d'utilisateurs bloqués
- `UBRUserManagement.initBlockedFilters(filterSelector, searchSelector, itemSelector)` : Initialise les filtres pour les utilisateurs bloqués
- `UBRUserManagement.applySearch(searchTerm, items)` : Applique la recherche sur les éléments
- `UBRUserManagement.initBlockedExport(exportBtnSelector, itemSelector)` : Initialise l'exportation des utilisateurs bloqués
- `UBRUserManagement.initProfilePhotoUpload(uploadBtnSelector, previewSelector, removeSelector, inputSelector)` : Initialise la gestion des photos de profil

### testimonials.js

- `UBRTestimonials.initStarRating(containerSelector, inputSelector)` : Initialise le système de notation par étoiles
- `UBRTestimonials.showRatingMessage(rating, container)` : Affiche un message basé sur la note donnée
- `UBRTestimonials.initTestimonialModal(openBtnSelector, closeBtnSelector, modalSelector)` : Initialise le modal de témoignage
- `UBRTestimonials.initTestimonialForm(formSelector, modalSelector)` : Initialise le formulaire de témoignage
- `UBRTestimonials.initTestimonialFilters(filterSelector, testimonialSelector)` : Initialise le filtrage des témoignages

### reports.js

- `UBRReports.initReportSystem(formSelector, options)` : Initialise le système de signalement
- `UBRReports.initQuickReportButtons()` : Initialise les boutons de pré-sélection rapide du type de rapport
- `UBRReports.preSelectReport(reportType)` : Pré-sélectionne un type de rapport et fait défiler jusqu'au formulaire
- `UBRReports.setupAutoSuggestions()` : Configure les suggestions automatiques basées sur le type de rapport
- `UBRReports.initReportSubmission(form)` : Initialise la soumission du formulaire de signalement

## Exemple d'utilisation

Voir le fichier `integration-example.html` à la racine du projet pour un exemple complet d'intégration des modules JavaScript.