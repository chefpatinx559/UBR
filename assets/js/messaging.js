/**
 * Système de messagerie pour UBR - Union Bénie et Réelle
 * Ce fichier gère les fonctionnalités de messagerie entre utilisateurs
 */

// Classe principale pour la gestion des messages
class MessagingSystem {
    constructor(config = {}) {
        // Initialisation des données
        this.messages = {};
        this.currentUser = this.getCurrentUser();
        this.activeConversation = null;
        this.apiBaseUrl = 'http://localhost:5000/api';
        this.config = config;
        
        // Initialisation automatique si les éléments sont fournis
        if (Object.keys(config).length > 0) {
            this.initWithConfig();
        }
    }
    
    // Initialisation avec configuration
    initWithConfig() {
        // Assignation des éléments DOM depuis la configuration
        this.messagesContainer = this.config.messagesContainer;
        this.messageInput = this.config.messageInput;
        this.sendButton = this.config.sendButton;
        this.conversationItems = this.config.conversationItems;
        this.conversationName = this.config.conversationName;
        this.conversationStatus = this.config.conversationStatus;
        this.conversationAvatar = this.config.conversationAvatar;
        this.searchInput = this.config.searchInput;
        
        // Initialiser les écouteurs d'événements
        this.initEventListeners();
        
        // Charger les conversations
        this.fetchConversations();
    }
    
    // Méthode d'initialisation manuelle
    init() {
        this.initElements();
        this.initEventListeners();
        this.fetchConversations();
    }
    
    // Initialisation des éléments DOM (méthode de secours)
    initElements() {
        this.conversationItems = document.querySelectorAll('.conversation-item');
        this.chatContainer = document.getElementById('chat-container');
        this.messageInput = document.getElementById('message-input');
        this.sendButton = document.getElementById('send-button');
        this.conversationName = document.getElementById('conversation-name');
        this.conversationStatus = document.getElementById('conversation-status');
        this.conversationAvatar = document.getElementById('conversation-avatar');
        this.messagesContainer = document.getElementById('messagesContainer');
        this.emptyState = document.getElementById('empty-state');
    }
    
    // Initialisation des écouteurs d'événements
    initEventListeners() {
        // Gestion des clics sur les conversations
        this.conversationItems.forEach(item => {
            item.addEventListener('click', () => {
                const conversationId = item.getAttribute('data-conversation');
                this.setActiveConversation(conversationId);
            });
        });
        
        // Envoi de message
        this.sendButton.addEventListener('click', () => {
            this.sendMessage();
        });
        
        // Envoi avec la touche Entrée
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
    }
    
    // Obtenir l'utilisateur actuel (simulé)
    getCurrentUser() {
        // Dans une application réelle, cela viendrait d'une session authentifiée
        return {
            id: 'current-user',
            name: 'Vous',
            avatar: 'https://via.placeholder.com/50x50/2563eb/ffffff?text=V'
        };
    }
    
    // Récupérer le token d'authentification
    getAuthToken() {
        return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    }
    
    // Effectuer une requête API authentifiée
    async fetchAPI(endpoint, method = 'GET', body = null) {
        const token = this.getAuthToken();
        if (!token) {
            console.error('Aucun token d\'authentification trouvé');
            return null;
        }
        
        try {
            const options = {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            };
            
            if (body) {
                options.body = JSON.stringify(body);
            }
            
            const response = await fetch(`${this.apiBaseUrl}${endpoint}`, options);
            
            if (!response.ok) {
                throw new Error(`Erreur API: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Erreur lors de la requête API:', error);
            return null;
        }
    }
    
    // Récupérer les conversations depuis l'API
    async fetchConversations() {
        const conversations = await this.fetchAPI('/messages/conversations');
        
        if (conversations && conversations.length > 0) {
            // Mettre à jour l'interface avec les conversations
            this.updateConversationsUI(conversations);
            
            // Activer la première conversation par défaut
            if (this.conversationItems.length > 0) {
                const firstConversation = this.conversationItems[0].getAttribute('data-conversation');
                this.setActiveConversation(firstConversation);
            }
        } else {
            // Afficher un message si aucune conversation n'est disponible
            if (this.emptyState) {
                this.emptyState.classList.remove('hidden');
                this.emptyState.innerHTML = `
                    <div class="text-center p-6">
                        <i class="fas fa-comments text-gray-300 text-5xl mb-4"></i>
                        <h3 class="text-xl font-semibold text-gray-600 mb-2">Aucune conversation</h3>
                        <p class="text-gray-500">Commencez à discuter avec d'autres membres pour voir vos conversations ici.</p>
                    </div>
                `;
            }
            if (this.chatContainer) this.chatContainer.classList.add('hidden');
        }
    }
    
    // Mettre à jour l'interface des conversations
    updateConversationsUI(conversations) {
        const conversationsList = document.querySelector('.conversations-list');
        if (!conversationsList) return;
        
        // Vider la liste des conversations
        conversationsList.innerHTML = '';
        
        // Ajouter chaque conversation à la liste
        conversations.forEach(conversation => {
            const { user, lastMessage } = conversation;
            const isOnline = user.isOnline;
            const formattedTime = new Date(lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            const conversationItem = document.createElement('div');
            conversationItem.className = 'conversation-item flex items-center p-4 border-l-4 border-transparent hover:bg-gray-50 cursor-pointer transition-all';
            conversationItem.setAttribute('data-conversation', user.id);
            
            conversationItem.innerHTML = `
                <div class="relative mr-3">
                    <img src="${user.profilePicture || '../assets/images/default-avatar.png'}" alt="${user.firstName}" class="w-12 h-12 rounded-full object-cover">
                    <span class="absolute bottom-0 right-0 w-3 h-3 ${isOnline ? 'bg-green-500' : 'bg-gray-400'} rounded-full border-2 border-white"></span>
                </div>
                <div class="flex-1 min-w-0">
                    <div class="flex justify-between items-center">
                        <h3 class="font-semibold text-gray-900 truncate">${user.firstName} ${user.lastName}</h3>
                        <span class="text-xs text-gray-500">${formattedTime}</span>
                    </div>
                    <p class="text-sm text-gray-600 truncate">${lastMessage.content}</p>
                </div>
                ${!lastMessage.isRead && !lastMessage.isSent ? '<span class="bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ml-2">1</span>' : ''}
            `;
            
            conversationItem.addEventListener('click', () => {
                this.setActiveConversation(user.id);
            });
            
            conversationsList.appendChild(conversationItem);
        });
        
        // Mettre à jour la référence aux éléments de conversation
        this.conversationItems = document.querySelectorAll('.conversation-item');
    }
    
    // Obtenir l'utilisateur actuel depuis le stockage local
    getCurrentUser() {
        const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
        if (!userStr) return { id: 'current-user', firstName: 'Utilisateur', lastName: 'Actuel' };
        
        try {
            return JSON.parse(userStr);
        } catch (e) {
            console.error('Erreur lors de la récupération des données utilisateur:', e);
            return { id: 'current-user', firstName: 'Utilisateur', lastName: 'Actuel' };
        }
    }
    
    // Définir la conversation active
    async setActiveConversation(conversationId) {
        // Mettre à jour la classe active
        this.conversationItems.forEach(item => {
            if (item.getAttribute('data-conversation') === conversationId) {
                item.classList.add('bg-gray-100');
                item.classList.remove('border-transparent');
                item.classList.add('border-primary');
                // Supprimer le badge de notification
                const badge = item.querySelector('.bg-primary');
                if (badge) badge.remove();
            } else {
                item.classList.remove('bg-gray-100');
                item.classList.remove('border-primary');
                item.classList.add('border-transparent');
            }
        });
        
        this.activeConversation = conversationId;
        
        // Mettre à jour les informations de la conversation
        this.updateConversationInfo(conversationId);
        
        // Récupérer et afficher les messages
        await this.fetchAndDisplayMessages(conversationId);
        
        // Afficher la conversation et masquer l'état vide
        if (this.emptyState) this.emptyState.classList.add('hidden');
        if (this.chatContainer) this.chatContainer.classList.remove('hidden');
    }
    
    // Mettre à jour les informations de la conversation (titre, statut, avatar)
    updateConversationInfo(conversationId) {
        const conversationItem = document.querySelector(`[data-conversation="${conversationId}"]`);
        if (!conversationItem) return;
        
        const name = conversationItem.querySelector('h3').textContent;
        const avatar = conversationItem.querySelector('img').src;
        const isOnline = conversationItem.querySelector('.bg-green-500') !== null;
        
        if (this.conversationTitle) this.conversationTitle.textContent = name;
        if (this.conversationStatus) {
            this.conversationStatus.textContent = isOnline ? 'En ligne' : 'Hors ligne';
            this.conversationStatus.className = isOnline ? 'text-green-500' : 'text-gray-500';
        }
        if (this.conversationAvatar) this.conversationAvatar.src = avatar;
    }
    
    // Récupérer et afficher les messages d'une conversation
    async fetchAndDisplayMessages(conversationId) {
        if (!this.messagesList) return;
        
        // Vider la liste des messages
        this.messagesList.innerHTML = '';
        
        // Afficher un indicateur de chargement
        this.messagesList.innerHTML = `
            <div class="flex justify-center items-center h-32">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        `;
        
        // Récupérer les messages depuis l'API
        const messages = await this.fetchAPI(`/messages/${conversationId}`);
        
        // Vider à nouveau la liste des messages
        this.messagesList.innerHTML = '';
        
        if (!messages || messages.length === 0) {
            // Afficher un message si aucun message n'est disponible
            this.messagesList.innerHTML = `
                <div class="text-center p-6">
                    <p class="text-gray-500">Aucun message. Commencez la conversation !</p>
                </div>
            `;
            return;
        }
        
        // Stocker les messages dans la mémoire locale
        this.messages[conversationId] = messages;
        
        // Afficher chaque message
        messages.forEach(message => {
            const messageElement = this.createMessageElement(message, message.isSent);
            this.messagesList.appendChild(messageElement);
        });
        
        // Faire défiler jusqu'au dernier message
        this.scrollToBottom();
    }
    
    // Créer un élément de message
    createMessageElement(message, isSent) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `flex ${isSent ? 'justify-end' : 'justify-start'} mb-4`;
        
        const timestamp = new Date(message.timestamp);
        const formattedTime = timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        messageDiv.innerHTML = `
            <div class="flex flex-col ${isSent ? 'items-end' : 'items-start'}">
                <div class="${isSent ? 'bg-primary text-white rounded-t-lg rounded-bl-lg' : 'bg-gray-100 text-gray-800 rounded-t-lg rounded-br-lg'} px-4 py-3 max-w-xs md:max-w-md lg:max-w-lg shadow-sm">
                    ${message.content}
                </div>
                <span class="text-xs text-gray-500 mt-1">${formattedTime}</span>
            </div>
        `;
        
        return messageDiv;
    }
    
    // Envoyer un message
    async sendMessage() {
        if (!this.messageInput || !this.activeConversation) return;
        
        const content = this.messageInput.value.trim();
        if (!content) return;
        
        // Désactiver le bouton d'envoi pendant l'envoi
        if (this.sendButton) {
            this.sendButton.disabled = true;
            this.sendButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        }
        
        // Préparer les données du message
        const messageData = {
            receiverId: this.activeConversation,
            content: content
        };
        
        // Envoyer le message à l'API
        const response = await this.fetchAPI('/messages', 'POST', messageData);
        
        // Réactiver le bouton d'envoi
        if (this.sendButton) {
            this.sendButton.disabled = false;
            this.sendButton.innerHTML = '<i class="fas fa-paper-plane"></i>';
        }
        
        if (response) {
            // Ajouter le message à la conversation locale
            if (!this.messages[this.activeConversation]) {
                this.messages[this.activeConversation] = [];
            }
            this.messages[this.activeConversation].push(response);
            
            // Afficher le nouveau message
            const messageElement = this.createMessageElement(response, true);
            if (this.messagesList) {
                this.messagesList.appendChild(messageElement);
                this.scrollToBottom();
            }
            
            // Vider le champ de saisie
            this.messageInput.value = '';
            
            // Mettre à jour la liste des conversations
            this.fetchConversations();
        } else {
            // Afficher un message d'erreur
            alert('Erreur lors de l\'envoi du message. Veuillez réessayer.');
        }
    }
    
    // Vérifier les nouveaux messages périodiquement
    startMessagePolling() {
        // Vérifier les nouveaux messages toutes les 30 secondes
        this.pollingInterval = setInterval(() => {
            if (this.activeConversation) {
                this.fetchAndDisplayMessages(this.activeConversation);
            }
            this.fetchConversations();
        }, 30000);
    }
    
    // Arrêter la vérification périodique
    stopMessagePolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
        }
    }
    
    // Afficher l'indicateur de frappe
    showTypingIndicator() {
        if (!this.messagesList) return;
        
        const typingDiv = document.createElement('div');
        typingDiv.id = 'typing-indicator';
        typingDiv.className = 'flex justify-start mb-4';
        
        typingDiv.innerHTML = `
            <div class="bg-gray-100 text-gray-800 rounded-t-lg rounded-br-lg px-4 py-3 flex space-x-1 items-center">
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-0"></div>
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-300"></div>
            </div>
        `;
        
        this.messagesList.appendChild(typingDiv);
        this.scrollToBottom();
    }
    
    // Masquer l'indicateur de frappe
    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    // Faire défiler jusqu'au dernier message
    scrollToBottom() {
        if (this.messagesList) {
            this.messagesList.scrollTop = this.messagesList.scrollHeight;
        }
    }
    
    // Créer une nouvelle conversation
    async createNewConversation(userId) {
        // Envoyer un premier message pour créer la conversation
        const messageData = {
            receiverId: userId,
            content: "Bonjour, j'aimerais faire votre connaissance."
        };
        
        const response = await this.fetchAPI('/messages', 'POST', messageData);
        
        if (response) {
            // Rafraîchir les conversations
            await this.fetchConversations();
            
            // Activer la nouvelle conversation
            this.setActiveConversation(userId);
            
            return true;
        }
        
        return false;
    }
}

// Initialiser le système de messagerie lorsque le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    const messagingSystem = new MessagingSystem();
    
    // Exposer l'instance pour les tests
    window.messagingSystem = messagingSystem;
});

