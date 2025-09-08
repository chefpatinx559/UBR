/**
 * Script d'inscription pour les nouveaux utilisateurs
 * Gère la validation du formulaire, l'inscription et le stockage des tokens
 */

window.addEventListener('load', function() {
    const canRegister = sessionStorage.getItem('canRegister');
    const paymentData = sessionStorage.getItem('paymentData');
    
    if (!canRegister || !paymentData) {
        alert('Vous devez d\'abord souscrire à un abonnement pour vous inscrire.');
        window.location.href = 'buy.html';
        return;
    }
    
    // Afficher le plan souscrit
    const data = JSON.parse(paymentData);
    const planInfo = document.createElement('div');
    planInfo.className = 'bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded-lg mb-4';
    planInfo.innerHTML = `
        <i class="fas fa-info-circle mr-2"></i>
        Plan souscrit: <strong>${data.plan}</strong> (${data.price.toLocaleString('fr-FR')} FCFA)
    `;
    document.querySelector('form').insertBefore(planInfo, document.querySelector('form').firstChild);

    // Gestion du formulaire d'inscription
    const form = document.getElementById('registerForm');
    const errorMessage = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Récupérer les valeurs du formulaire
        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const email = document.getElementById('email').value.trim();
        const dateOfBirth = document.getElementById('dateOfBirth').value;
        const gender = document.getElementById('gender').value;
        const city = document.getElementById('city').value.trim();
        const denomination = document.getElementById('denomination').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // Validation basique
        if (!firstName || !lastName || !email || !dateOfBirth || !gender || !city || !denomination || !password) {
            showError('Veuillez remplir tous les champs obligatoires.');
            return;
        }
        
        if (password !== confirmPassword) {
            showError('Les mots de passe ne correspondent pas.');
            return;
        }
        
        if (password.length < 8) {
            showError('Le mot de passe doit contenir au moins 8 caractères.');
            return;
        }
        
        // Vérifier les cases à cocher
        const checkboxes = form.querySelectorAll('input[type="checkbox"]');
        let allChecked = true;
        checkboxes.forEach(checkbox => {
            if (!checkbox.checked) {
                allChecked = false;
            }
        });
        
        if (!allChecked) {
            showError('Veuillez accepter toutes les conditions.');
            return;
        }
        
        // Récupérer les données d'abonnement
        const paymentData = JSON.parse(sessionStorage.getItem('paymentData'));
        const subscription = paymentData.plan.toLowerCase();
        
        // Appel à l'API d'inscription
        registerUser({
            firstName,
            lastName,
            email,
            password,
            dateOfBirth,
            gender,
            city,
            denomination,
            subscription
        });
    });

    function showError(message) {
        errorText.textContent = message;
        errorMessage.classList.remove('hidden');
        setTimeout(() => {
            errorMessage.classList.add('hidden');
        }, 5000);
    }

    function registerUser(userData) {
        // Afficher l'état de chargement
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Inscription en cours...';
        submitBtn.disabled = true;

        // Appel à l'API d'inscription
        fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => Promise.reject(data));
            }
            return response.json();
        })
        .then(data => {
            // Inscription réussie
            submitBtn.innerHTML = '<i class="fas fa-check mr-2"></i>Inscription réussie';
            submitBtn.classList.remove('bg-secondary', 'hover:bg-green-700');
            submitBtn.classList.add('bg-green-600', 'hover:bg-green-700');
            
            // Stocker le token dans sessionStorage
            sessionStorage.setItem('userToken', data.token);
            sessionStorage.setItem('userInfo', JSON.stringify({
                id: data._id,
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                isAdmin: data.isAdmin
            }));
            
            // Nettoyer les données de paiement
            sessionStorage.removeItem('canRegister');
            sessionStorage.removeItem('paymentData');
            
            setTimeout(() => {
                window.location.href = 'profile.html';
            }, 1000);
        })
        .catch(error => {
            // Échec de l'inscription
            console.error('Erreur d\'inscription:', error);
            showError(error.message || 'Erreur lors de l\'inscription. Veuillez réessayer.');
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        });
    }
});