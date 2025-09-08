// Récupérer les données du plan sélectionné depuis l'URL
window.addEventListener('load', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const plan = urlParams.get('plan');
    const amount = urlParams.get('amount');
    
    if (plan && amount) {
        // Convertir la première lettre en majuscule
        const formattedPlan = plan.charAt(0).toUpperCase() + plan.slice(1);
        
        // Mettre à jour les éléments de la page
        document.getElementById('selectedPlan').textContent = `Plan ${formattedPlan}`;
        document.getElementById('selectedAmount').textContent = `${parseInt(amount).toLocaleString('fr-FR')} FCFA`;
        document.getElementById('orangeAmount').textContent = `${parseInt(amount).toLocaleString('fr-FR')} FCFA`;
        document.getElementById('mtnAmount').textContent = `${parseInt(amount).toLocaleString('fr-FR')} FCFA`;
        
        // Mettre à jour le titre de la page
        document.title = `Plan ${formattedPlan} - Paiement | Rencontre Chrétienne`;
    }
});

// Gestion des onglets de paiement
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('tab-orange').addEventListener('click', function() {
        showTab('orange');
    });
    document.getElementById('tab-mtn').addEventListener('click', function() {
        showTab('mtn');
    });
    document.getElementById('tab-bank').addEventListener('click', function() {
        showTab('bank');
    });

    document.getElementById('proofForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Simulation de l'envoi
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Envoi en cours...';
        submitBtn.disabled = true;
        
        setTimeout(() => {
            // Afficher une notification au lieu d'une alerte
            const notification = document.createElement('div');
            notification.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg transform transition-transform duration-500 ease-in-out';
            notification.innerHTML = '<div class="flex items-center"><i class="fas fa-check-circle mr-2"></i><span>Preuve de paiement envoyée avec succès !</span></div>';
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.classList.add('translate-y-20', 'opacity-0');
                setTimeout(() => {
                    notification.remove();
                }, 500);
            }, 3000);
            
            // Sauvegarder l'état "en attente de validation"
            localStorage.setItem('paymentPending', JSON.stringify({
                plan: document.getElementById('selectedPlan').textContent,
                amount: document.getElementById('selectedAmount').textContent,
                date: new Date().toISOString(),
                status: 'pending'
            }));
            
            // Mettre à jour l'interface au lieu de rediriger
            submitBtn.innerHTML = '<i class="fas fa-check mr-2"></i>Preuve envoyée';
            submitBtn.classList.remove('bg-purple-600', 'hover:bg-purple-700');
            submitBtn.classList.add('bg-green-600', 'hover:bg-green-700');
            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-paper-plane mr-2"></i>Envoyer la preuve';
                submitBtn.classList.remove('bg-green-600', 'hover:bg-green-700');
                submitBtn.classList.add('bg-purple-600', 'hover:bg-purple-700');
                e.target.reset();
            }, 3000);
        }, 2000);
    });
});

function showTab(tabName) {
    // Masquer tous les contenus
    document.getElementById('content-orange').classList.add('hidden');
    document.getElementById('content-mtn').classList.add('hidden');
    document.getElementById('content-bank').classList.add('hidden');
    
    // Réinitialiser tous les onglets
    document.getElementById('tab-orange').classList.remove('text-purple-600', 'border-b-2', 'border-purple-500');
    document.getElementById('tab-orange').classList.add('text-gray-500', 'hover:text-gray-700');
    document.getElementById('tab-mtn').classList.remove('text-purple-600', 'border-b-2', 'border-purple-500');
    document.getElementById('tab-mtn').classList.add('text-gray-500', 'hover:text-gray-700');
    document.getElementById('tab-bank').classList.remove('text-purple-600', 'border-b-2', 'border-purple-500');
    document.getElementById('tab-bank').classList.add('text-gray-500', 'hover:text-gray-700');
    
    // Afficher le contenu sélectionné
    document.getElementById(`content-${tabName}`).classList.remove('hidden');
    
    // Activer l'onglet sélectionné
    document.getElementById(`tab-${tabName}`).classList.remove('text-gray-500', 'hover:text-gray-700');
    document.getElementById(`tab-${tabName}`).classList.add('text-purple-600', 'border-b-2', 'border-purple-500');
}