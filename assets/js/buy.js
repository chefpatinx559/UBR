let selectedPlanData = {};

function togglePaymentFields() {
    const paymentMethod = document.getElementById('paymentMethod').value;
    const mobileFields = document.getElementById('mobileMoneyFields');
    const cardFields = document.getElementById('cardFields');
    const bankFields = document.getElementById('bankFields');
    
    // Cacher tous les champs
    mobileFields.classList.add('hidden');
    cardFields.classList.add('hidden');
    bankFields.classList.add('hidden');
    
    // Afficher les champs appropriés
    if (['orange', 'mtn', 'moov'].includes(paymentMethod)) {
        mobileFields.classList.remove('hidden');
    } else if (paymentMethod === 'card') {
        cardFields.classList.remove('hidden');
    } else if (paymentMethod === 'bank') {
        bankFields.classList.remove('hidden');
    }
}

function selectPlan(planName, price) {
    selectedPlanData = { name: planName, price: price };
    document.getElementById('selectedPlan').textContent = planName.charAt(0).toUpperCase() + planName.slice(1);
    document.getElementById('selectedPrice').textContent = price.toLocaleString('fr-FR');
    
    // Rediriger vers mode-buy.html avec les paramètres du forfait
    window.location.href = `mode-buy.html?plan=${planName}&amount=${price}`;
}

function closePaymentModal() {
    document.getElementById('paymentModal').classList.add('hidden');
}

// Initialiser les écouteurs d'événements lorsque le DOM est chargé
document.addEventListener('DOMContentLoaded', function() {
    // Écouteur pour le formulaire de paiement
    const paymentForm = document.getElementById('paymentForm');
    if (paymentForm) {
        paymentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Simulation du traitement du paiement
            const loadingBtn = e.target.querySelector('button[type="submit"]');
            loadingBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Traitement...';
            loadingBtn.disabled = true;

            setTimeout(() => {
                // Stocker les données de paiement (simulation)
                const paymentData = {
                    plan: selectedPlanData.name,
                    price: selectedPlanData.price,
                    paymentDate: new Date().toISOString(),
                    status: 'paid'
                };
                
                // Dans un vrai projet, vous stockeriez cela dans une base de données
                sessionStorage.setItem('paymentData', JSON.stringify(paymentData));
                sessionStorage.setItem('canRegister', 'true');
                
                alert('Paiement effectué avec succès ! Vous allez être redirigé vers l\'inscription.');
                
                // Redirection vers la page d'inscription
                window.location.href = 'register.html';
            }, 2000);
        });
    }

    // Vérifier si l'utilisateur a déjà payé au chargement de la page
    const paymentData = sessionStorage.getItem('paymentData');
    if (paymentData) {
        const data = JSON.parse(paymentData);
        if (data.status === 'paid') {
            // Afficher un message ou rediriger
            const banner = document.createElement('div');
            banner.className = 'bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4';
            banner.innerHTML = `
                <i class="fas fa-check-circle mr-2"></i>
                Vous avez déjà souscrit au plan ${data.plan}. 
                <a href="register.html" class="underline font-semibold">Continuer l'inscription</a>
            `;
            document.querySelector('.container').insertBefore(banner, document.querySelector('.container').firstChild);
        }
    }
});