// TChat - Modern Chat Application
document.addEventListener('DOMContentLoaded', function() {
    // App state
    const state = {
        currentUser: null,
        contacts: [],
        chats: {},
        currentChatId: null,
        darkMode: localStorage.getItem('darkMode') === 'true',
        attachments: []
    };

    // DOM elements
    const elements = {
        chatList: document.getElementById('chat-list'),
        messageInput: document.getElementById('message-input'),
        sendBtn: document.getElementById('send-btn'),
        chatMessages: document.getElementById('chat-messages'),
        currentChatInfo: document.getElementById('current-chat-info'),
        newChatBtn: document.getElementById('new-chat'),
        userInfo: document.getElementById('user-info'),
        profileSidebar: document.getElementById('profile-sidebar'),
        profileContent: document.getElementById('profile-content'),
        closeProfileBtn: document.getElementById('close-profile-btn'),
        searchBtn: document.getElementById('search-btn'),
        attachBtn: document.getElementById('attach-btn'),
        voiceCallBtn: document.getElementById('voice-call-btn'),
        videoCallBtn: document.getElementById('video-call-btn'),
        chatHeader: document.getElementById('chat-header'),
        messageInputContainer: document.querySelector('.message-input-container')
    };

    // Bootstrap modals
    const logoutModal = new bootstrap.Modal(document.getElementById('logoutModal'));
    const confirmLogoutBtn = document.getElementById('confirm-logout-btn');
    confirmLogoutBtn.addEventListener('click', handleLogout);

    // Initialize theme
    if (state.darkMode) {
        document.documentElement.setAttribute('data-theme', 'dark');
        // Theme switch now only in profile menu, set when profile is opened
    }

    // Event listeners
    // Theme switch removed from sidebar, now only in profile
    elements.messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    elements.sendBtn.addEventListener('click', sendMessage);
    elements.closeProfileBtn.addEventListener('click', toggleProfileSidebar);
    elements.newChatBtn.addEventListener('click', showNewChatModal);
    elements.voiceCallBtn.addEventListener('click', startVoiceCall);
    elements.videoCallBtn.addEventListener('click', startVideoCall);
    elements.attachBtn.addEventListener('click', handleAttachment);
    
    // Initialize application
    initializeApp();

    // Functions
    function initializeApp() {
        // Get user from local storage
        const savedUser = localStorage.getItem('tchat_user');
        if (savedUser) {
            state.currentUser = JSON.parse(savedUser);
            
            // Render user info
            renderUserInfo();
            
            // Load mock data
            loadMockData();
            
            // Render chat list
            renderChatList();
            
            // Initial UI state - hide message input if no chat selected
            if (state.currentChatId) {
                showChat(state.currentChatId);
                showMessageInput(true);
            } else {
                showEmptyState(); // Using showEmptyState instead of showWelcomeScreen
                showMessageInput(false);
            }
            
            // Set up message input
            setupMessageInput();
            
            // Render the user information
            renderUserInfo();
            
            // Check dark mode preference
            checkDarkModePreference();
        } else {
            // If no user found in local storage, redirect to login page
            window.location.href = 'login.html';
        }
    }

    function loadMockData() {
        // Load mock contacts
        state.contacts = [
            {
                id: 'contact1',
                displayName: 'Jamal',
                email: 'jamal@example.com',
                photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jamal',
                lastSeen: new Date().toISOString(),
                isOnline: true
            },
            {
                id: 'contact2',
                displayName: 'Anak Haram',
                email: 'haram@example.com',
                photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Haram',
                lastSeen: new Date().toISOString(),
                isOnline: false
            },
            {
                id: 'contact3',
                displayName: 'Hikmal',
                email: 'hikmal@example.com',
                photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Hikmal',
                lastSeen: new Date().toISOString(),
                isOnline: true
            }
        ];
        
        // Load mock chats and messages
        state.chats = {
            'chat1': {
                id: 'chat1',
                participants: [state.currentUser.id, 'contact1'],
                lastMessage: {
                    text: 'lagi coli ya?',
                    senderId: 'contact1',
                    timestamp: new Date(Date.now() - 3600000).toISOString()
                },
                messages: [
                    {
                        id: 'm1',
                        text: 'WOI',
                        senderId: 'contact1',
                        timestamp: new Date(Date.now() - 7200000).toISOString()
                    },
                    {
                        id: 'm2',
                        text: 'ha?',
                        senderId: state.currentUser.id,
                        timestamp: new Date(Date.now() - 5400000).toISOString()
                    },
                    {
                        id: 'm3',
                        text: 'lagi coli ya?',
                        senderId: 'contact1',
                        timestamp: new Date(Date.now() - 3600000).toISOString()
                    }
                ],
                unreadCount: 1
            },
            'chat2': {
                id: 'chat2',
                participants: [state.currentUser.id, 'contact2'],
                lastMessage: {
                    text: 'STFU weirdo😹😹',
                    senderId: state.currentUser.id,
                    timestamp: new Date(Date.now() - 86400000).toISOString()
                },
                messages: [
                    {
                        id: 'm4',
                        text: 'Hello baka',
                        senderId: 'contact2',
                        timestamp: new Date(Date.now() - 172800000).toISOString()
                    },
                    {
                        id: 'm5',
                        text: 'WTF??.',
                        senderId: state.currentUser.id,
                        timestamp: new Date(Date.now() - 158400000).toISOString()
                    },
                    {
                        id: 'm6',
                        text: 'STFU weirdo😹😹',
                        senderId: state.currentUser.id,
                        timestamp: new Date(Date.now() - 86400000).toISOString()
                    }
                ],
                unreadCount: 0
            }
        };
    }

    function renderUserInfo() {
        elements.userInfo.innerHTML = `
            <img src="${state.currentUser.photoURL}" alt="${state.currentUser.displayName}" class="user-avatar">
            <div class="user-details">
                <div class="user-name">${state.currentUser.displayName}</div>
                <div class="user-status">Online</div>
            </div>
        `;
        elements.userInfo.addEventListener('click', showProfile);
    }

    // Function to show the empty state when no chat is selected
    function showEmptyState() {
        state.currentChatId = null;
        
        // Update header to welcome
        elements.currentChatInfo.innerHTML = `<h3>Welcome to TChat</h3>`;
        
        // Show welcome screen
        elements.chatMessages.innerHTML = `
            <div class="welcome-screen">
                <img src="icon.svg" alt="Wave" class="welcome-emoji">
                <h2>Welcome to TChat</h2>
                <p>Start a new conversation or select an existing chat to begin messaging</p>
            </div>
        `;
        
        // Hide message input and call buttons
        showMessageInput(false);
    }
    
    function renderChatList() {
        elements.chatList.innerHTML = '';
        
        // If no chat is selected, show empty state
        if (!state.currentChatId) {
            showEmptyState();
        }
        
        // Sort chats by last message timestamp (most recent first)
        const sortedChats = Object.values(state.chats).sort((a, b) => {
            return new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp);
        });
        
        sortedChats.forEach(chat => {
            // Find the other participant (not current user)
            const otherParticipantId = chat.participants.find(id => id !== state.currentUser.id);
            const otherParticipant = state.contacts.find(contact => contact.id === otherParticipantId);
            
            if (!otherParticipant) return;
            
            const chatItem = document.createElement('div');
            chatItem.className = `chat-item ${chat.id === state.currentChatId ? 'active' : ''}`;
            chatItem.dataset.chatId = chat.id;
            
            // Format timestamp
            const timestamp = formatTimestamp(chat.lastMessage.timestamp);
            
            chatItem.innerHTML = `
                <img src="${otherParticipant.photoURL}" alt="${otherParticipant.displayName}" class="chat-avatar">
                <div class="chat-info">
                    <div class="chat-name">${otherParticipant.displayName}</div>
                    <div class="chat-preview">${chat.lastMessage.text}</div>
                </div>
                <div class="chat-meta">
                    <div class="chat-time">${timestamp}</div>
                    ${chat.unreadCount > 0 ? `<div class="chat-badge">${chat.unreadCount}</div>` : ''}
                </div>
            `;
            
            chatItem.addEventListener('click', () => openChat(chat.id));
            elements.chatList.appendChild(chatItem);
        });
    }

    function openChat(chatId) {
        // Update current chat
        state.currentChatId = chatId;
        const chat = state.chats[chatId];
        
        // Reset unread count
        chat.unreadCount = 0;
        
        // Update UI
        renderChatList();
        renderChatHeader(chatId);
        renderMessages(chatId);
        
        // Show message input and call buttons
        showMessageInput(true);
        
        // Focus message input
        elements.messageInput.focus();
    }

    function renderChatHeader(chatId) {
        const chat = state.chats[chatId];
        const otherParticipantId = chat.participants.find(id => id !== state.currentUser.id);
        const otherParticipant = state.contacts.find(contact => contact.id === otherParticipantId);
        
        elements.currentChatInfo.innerHTML = `
            <img src="${otherParticipant.photoURL}" alt="${otherParticipant.displayName}" class="chat-avatar">
            <div>
                <h3>${otherParticipant.displayName}</h3>
                <div class="user-status">${otherParticipant.isOnline ? 'Online' : 'Last seen ' + formatLastSeen(otherParticipant.lastSeen)}</div>
            </div>
        `;
    }

    function renderMessages(chatId) {
        const chat = state.chats[chatId];
        elements.chatMessages.innerHTML = '';
        
        if (!chat.messages.length) {
            elements.chatMessages.innerHTML = `
                <div class="welcome-screen">
                    <img src="icon.svg" alt="Wave" class="welcome-emoji">
                    <h2>No messages yet</h2>
                    <p>Start a new conversation or select an existing chat to begin messaging</p>
                </div>
            `;
            return;
        }
        
        chat.messages.forEach(message => {
            const messageEl = createMessageElement(message);
            elements.chatMessages.appendChild(messageEl);
        });
        
        // Scroll to bottom
        elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
    }

    function createMessageElement(message) {
        const isOutgoing = message.senderId === state.currentUser.id;
        const sender = isOutgoing ? state.currentUser : state.contacts.find(c => c.id === message.senderId);
        
        const messageContainer = document.createElement('div');
        messageContainer.className = `message-container ${isOutgoing ? 'outgoing' : ''} fade-in`;
        
        // Format message text (handle markdown and links)
        let messageText = message.text || '';
        // Allow for safe HTML rendering with DOMPurify if message contains markdown
        if (message.text && (message.text.includes('```') || message.text.includes('**') || message.text.includes('*'))) {
            messageText = DOMPurify.sanitize(marked.parse(message.text));
        }
        
        // Format timestamp
        const timestamp = formatMessageTime(message.timestamp);
        
        // Handle attachments
        let attachmentsHTML = '';
        if (message.attachments && message.attachments.length > 0) {
            attachmentsHTML = `
                <div class="message-attachments">
                    ${message.attachments.map((attachment, index) => {
                        // Generate a unique ID for each attachment
                        const attachmentId = `attachment-${message.id}-${index}`;
                        
                        if (attachment.type.startsWith('image/')) {
                            return `<div class="attachment-item image-attachment" data-attachment-id="${attachmentId}">
                                <img src="${attachment.data}" alt="Image" class="attachment-preview">
                                <div class="attachment-info">
                                    <span>${attachment.name}</span>
                                </div>
                                <button class="attachment-options-btn" onclick="event.stopPropagation(); showAttachmentOptions('${attachmentId}', '${attachment.type}', '${encodeURIComponent(attachment.name)}')">
                                    <i class="bi bi-three-dots-vertical"></i>
                                </button>
                            </div>`;
                        } else if (attachment.type.startsWith('video/')) {
                            return `<div class="attachment-item video-attachment" data-attachment-id="${attachmentId}">
                                <div class="video-preview">
                                    <i class="bi bi-play-circle-fill video-play-icon"></i>
                                </div>
                                <div class="attachment-info">
                                    <span>${attachment.name}</span>
                                    <small>${formatFileSize(attachment.size)}</small>
                                </div>
                                <button class="attachment-options-btn" onclick="event.stopPropagation(); showAttachmentOptions('${attachmentId}', '${attachment.type}', '${encodeURIComponent(attachment.name)}')">
                                    <i class="bi bi-three-dots-vertical"></i>
                                </button>
                            </div>`;
                        } else {
                            // File icon based on type
                            let iconClass = 'bi-file-earmark';
                            if (attachment.type.includes('pdf')) iconClass = 'bi-file-earmark-pdf';
                            else if (attachment.type.includes('word')) iconClass = 'bi-file-earmark-word';
                            else if (attachment.type.includes('excel')) iconClass = 'bi-file-earmark-excel';
                            else if (attachment.type.includes('video')) iconClass = 'bi-file-earmark-play';
                            else if (attachment.type.includes('audio')) iconClass = 'bi-file-earmark-music';
                            else if (attachment.type.includes('zip')) iconClass = 'bi-file-earmark-zip';
                            
                            return `<div class="attachment-item file-attachment" data-attachment-id="${attachmentId}">
                                <i class="bi ${iconClass} attachment-icon"></i>
                                <div class="attachment-info">
                                    <span>${attachment.name}</span>
                                    <small>${formatFileSize(attachment.size)}</small>
                                </div>
                                <button class="attachment-options-btn" onclick="event.stopPropagation(); showAttachmentOptions('${attachmentId}', '${attachment.type}', '${encodeURIComponent(attachment.name)}')">
                                    <i class="bi bi-three-dots-vertical"></i>
                                </button>
                            </div>`;
                        }
                    }).join('')}
                </div>
            `;
            
            // Store attachments in a global variable for access when opening/saving
            window.messageAttachments = window.messageAttachments || {};
            message.attachments.forEach((attachment, index) => {
                const attachmentId = `attachment-${message.id}-${index}`;
                window.messageAttachments[attachmentId] = attachment;
            });
        }
        
        messageContainer.innerHTML = `
            <img src="${sender.photoURL}" alt="${sender.displayName}" class="message-avatar">
            <div class="message">
                ${message.replyTo ? `<div class="reply-to">${message.replyTo.text}</div>` : ''}
                ${messageText ? `<div class="message-text">${messageText}</div>` : ''}
                ${attachmentsHTML}
                <div class="message-time">${timestamp}</div>
            </div>
        `;
        
        return messageContainer;
    }

    function sendMessage() {
        const text = elements.messageInput.value.trim();
        if ((!text && state.attachments.length === 0) || !state.currentChatId) return;
        
        const newMessage = {
            id: 'm' + Date.now(),
            text: text,
            senderId: state.currentUser.id,
            timestamp: new Date().toISOString(),
            attachments: [...state.attachments]
        };
        
        // Add message to current chat
        const chat = state.chats[state.currentChatId];
        chat.messages.push(newMessage);
        chat.lastMessage = {
            ...newMessage,
            text: newMessage.attachments.length > 0 ? 
                  (text ? `${text} (${newMessage.attachments.length} attachment${newMessage.attachments.length > 1 ? 's' : ''})` : 
                  `Sent ${newMessage.attachments.length} attachment${newMessage.attachments.length > 1 ? 's' : ''}`) : 
                  text
        };
        
        // Update UI
        renderMessages(state.currentChatId);
        renderChatList();
        
        // Clear input and attachments
        elements.messageInput.value = '';
        clearAttachments();
        
        // Simulate reply for demo purposes
        if (Math.random() > 0.5) {
            simulateReply(state.currentChatId);
        }
    }

    function simulateReply(chatId) {
        setTimeout(() => {
            const chat = state.chats[chatId];
            const otherParticipantId = chat.participants.find(id => id !== state.currentUser.id);
            
            // Show typing indicator
            const typingIndicator = document.createElement('div');
            typingIndicator.className = 'typing-indicator fade-in';
            typingIndicator.innerHTML = `
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            `;
            elements.chatMessages.appendChild(typingIndicator);
            elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
            
            // After a delay, add the actual message
            setTimeout(() => {
                // Remove typing indicator
                typingIndicator.remove();
                
                const replyTexts = [
                    "Iya Iya",
                    "Hooh."
                ];
                
                const reply = {
                    id: 'm' + Date.now(),
                    text: replyTexts[Math.floor(Math.random() * replyTexts.length)],
                    senderId: otherParticipantId,
                    timestamp: new Date().toISOString()
                };
                
                chat.messages.push(reply);
                chat.lastMessage = reply;
                
                if (state.currentChatId !== chatId) {
                    chat.unreadCount = (chat.unreadCount || 0) + 1;
                }
                
                // Update UI
                if (state.currentChatId === chatId) {
                    renderMessages(chatId);
                }
                renderChatList();
            }, 1500);
        }, 1000);
    }

    function showProfile() {
        // Populate profile content
        elements.profileContent.innerHTML = `
            <img src="${state.currentUser.photoURL}" alt="${state.currentUser.displayName}" class="profile-avatar">
            <div class="profile-name">${state.currentUser.displayName}</div>
            <div class="profile-email">${state.currentUser.email || state.currentUser.id}</div>
            
            <div class="profile-section">
                <div class="profile-section-title">Settings</div>
                <div class="list-group">
                    <div class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                        <span>Dark Theme</span>
                        <div class="theme-toggle d-flex align-items-center">
                            <i class="bi bi-sun-fill me-2 text-warning"></i>
                            <div class="form-check form-switch">
                                <input class="form-check-input" type="checkbox" id="profile-theme-switch" ${state.darkMode ? 'checked' : ''}>
                            </div>
                            <i class="bi bi-moon-fill ms-2 ${state.darkMode ? 'text-primary' : 'text-muted'}"></i>
                        </div>
                    </div>
                    <button class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                        Notifications
                        <span class="badge bg-primary rounded-pill">On</span>
                    </button>
                    <button class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                        Privacy
                    </button>
                    <button class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                        Chat Backup
                    </button>
                </div>
            </div>
            
            <div class="profile-section">
                <div class="profile-section-title">Account</div>
                <div class="list-group">
                    <button class="list-group-item list-group-item-action">Edit Profile</button>
                    <button class="list-group-item list-group-item-action">Change Password</button>
                    <button id="logout-btn" class="list-group-item list-group-item-action text-danger">Logout</button>
                </div>
            </div>
        `;
        
        // Add event listeners
        document.getElementById('logout-btn').addEventListener('click', () => {
            toggleProfileSidebar();
            logoutModal.show();
        });
        
        // Add theme toggle event listener
        const profileThemeSwitch = document.getElementById('profile-theme-switch');
        if (profileThemeSwitch) {
            profileThemeSwitch.addEventListener('change', toggleTheme);
        }
        
        // Show sidebar
        toggleProfileSidebar();
    }

    function handleLogout() {
        // Hide the logout modal
        logoutModal.hide();
        
        // Use Internet Identity logout if available
        if (typeof window.auth_client !== 'undefined') {
            try {
                window.auth_client.AuthClient.create().then(authClient => {
                    authClient.logout();
                    completeLogout();
                });
            } catch (error) {
                console.error('Error during logout:', error);
                completeLogout();
            }
        } else {
            completeLogout();
        }
    }
    
    function completeLogout() {
        // Clear user data from localStorage
        localStorage.removeItem('tchat_user');
        
        // Redirect to login page
        window.location.href = 'login.html';
    }

    function toggleProfileSidebar() {
        elements.profileSidebar.classList.toggle('active');
    }

    function showNewChatModal() {
        // Find contacts who don't already have a chat with the current user
        const contactsWithoutChats = state.contacts.filter(contact => {
            return !Object.values(state.chats).some(chat => 
                chat.participants.includes(contact.id) &&
                chat.participants.includes(state.currentUser.id)
            );
        });
        
        if (contactsWithoutChats.length > 0) {
            const contact = contactsWithoutChats[0];
            const newChatId = 'chat' + Date.now();
            
            state.chats[newChatId] = {
                id: newChatId,
                participants: [state.currentUser.id, contact.id],
                lastMessage: {
                    text: 'Start a conversation',
                    senderId: state.currentUser.id,
                    timestamp: new Date().toISOString()
                },
                messages: [],
                unreadCount: 0
            };
            
            renderChatList();
            openChat(newChatId);
        } else {
            // No available contacts for new chat
            alert('No available contacts to start a new chat with.');
        }
    }

    function toggleTheme(event) {
        // Get the checked state from the event target
        const isChecked = event ? event.target.checked : false;
        
        // Update dark mode state
        state.darkMode = isChecked;
        document.documentElement.setAttribute('data-theme', state.darkMode ? 'dark' : 'light');
        localStorage.setItem('darkMode', state.darkMode);
        
        // If the profile is closed and opened again, make sure the toggle reflects current state
        const profileThemeSwitch = document.getElementById('profile-theme-switch');
        if (profileThemeSwitch) {
            profileThemeSwitch.checked = state.darkMode;
        }
    }

    // Helper functions
    function formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 86400000) { // Less than 24 hours
            return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        } else if (diff < 604800000) { // Less than 7 days
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            return days[date.getDay()];
        } else {
            return date.toLocaleDateString();
        }
    }

    function formatMessageTime(timestamp) {
        return new Date(timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }

    function formatLastSeen(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) { // Less than 1 minute
            return 'just now';
        } else if (diff < 3600000) { // Less than 1 hour
            const minutes = Math.floor(diff / 60000);
            return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
        } else if (diff < 86400000) { // Less than 24 hours
            const hours = Math.floor(diff / 3600000);
            return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
        } else {
            return formatTimestamp(timestamp);
        }
    }
    
    // Function to show/hide message input container
    function showMessageInput(show) {
        if (show) {
            elements.messageInputContainer.style.display = 'block';
            elements.chatHeader.classList.add('with-chat');
            elements.searchBtn.style.visibility = 'visible';
            elements.voiceCallBtn.style.display = 'inline-block';
            elements.videoCallBtn.style.display = 'inline-block';
        } else {
            elements.messageInputContainer.style.display = 'none';
            elements.chatHeader.classList.remove('with-chat');
            elements.searchBtn.style.visibility = 'hidden';
            elements.voiceCallBtn.style.display = 'none';
            elements.videoCallBtn.style.display = 'none';
        }
    }
    
    // Format file size for display
    function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        else return (bytes / 1048576).toFixed(1) + ' MB';
    }
    
    // Attachment handling functions
    function handleAttachment() {
        // Create a hidden file input
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.multiple = true;
        fileInput.accept = 'image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt';
        fileInput.style.display = 'none';
        document.body.appendChild(fileInput);
        
        // Click the file input
        fileInput.click();
        
        // Listen for file selection
        fileInput.addEventListener('change', e => {
            const files = Array.from(e.target.files);
            
            // Process each file
            files.forEach(file => {
                const reader = new FileReader();
                
                reader.onload = event => {
                    const attachment = {
                        id: 'att_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        data: event.target.result
                    };
                    
                    // Add to attachments array
                    state.attachments.push(attachment);
                    
                    // Show attachment preview
                    renderAttachmentPreviews();
                };
                
                // Read all files as data URLs so they can be opened
                reader.readAsDataURL(file);
            });
            
            // Clean up
            document.body.removeChild(fileInput);
        });
    }
    
    function renderAttachmentPreviews() {
        // Check if the preview container exists
        let previewContainer = document.querySelector('.attachment-previews');
        
        // If not, create it
        if (!previewContainer) {
            previewContainer = document.createElement('div');
            previewContainer.className = 'attachment-previews';
            elements.messageInputContainer.insertBefore(previewContainer, elements.messageInputContainer.firstChild);
        }
        
        // Update the previews
        previewContainer.innerHTML = state.attachments.map(attachment => {
            // For images, show a thumbnail
            if (attachment.type.startsWith('image/')) {
                return `
                    <div class="attachment-preview-item">
                        <img src="${attachment.data}" alt="${attachment.name}">
                        <div class="attachment-preview-info">
                            <span>${attachment.name}</span>
                            <small>${formatFileSize(attachment.size)}</small>
                        </div>
                        <button class="remove-attachment" data-id="${attachment.id}">
                            <i class="bi bi-x"></i>
                        </button>
                    </div>
                `;
            } else {
                // For other files, show an icon
                let iconClass = 'bi-file-earmark';
                if (attachment.type.includes('pdf')) iconClass = 'bi-file-earmark-pdf';
                else if (attachment.type.includes('word')) iconClass = 'bi-file-earmark-word';
                else if (attachment.type.includes('excel')) iconClass = 'bi-file-earmark-excel';
                else if (attachment.type.includes('video')) iconClass = 'bi-file-earmark-play';
                else if (attachment.type.includes('audio')) iconClass = 'bi-file-earmark-music';
                else if (attachment.type.includes('zip')) iconClass = 'bi-file-earmark-zip';
                
                return `
                    <div class="attachment-preview-item">
                        <div class="file-icon"><i class="bi ${iconClass}"></i></div>
                        <div class="attachment-preview-info">
                            <span>${attachment.name}</span>
                            <small>${formatFileSize(attachment.size)}</small>
                        </div>
                        <button class="remove-attachment" data-id="${attachment.id}">
                            <i class="bi bi-x"></i>
                        </button>
                    </div>
                `;
            }
        }).join('');
        
        // Add event listeners to remove buttons
        document.querySelectorAll('.remove-attachment').forEach(button => {
            button.addEventListener('click', e => {
                const id = e.currentTarget.dataset.id;
                removeAttachment(id);
            });
        });
        
        // Show or hide based on attachments
        if (state.attachments.length === 0) {
            previewContainer.style.display = 'none';
        } else {
            previewContainer.style.display = 'flex';
        }
    }
    
    function removeAttachment(id) {
        // Find the index of the attachment
        const index = state.attachments.findIndex(att => att.id === id);
        
        if (index !== -1) {
            // Remove the attachment
            state.attachments.splice(index, 1);
            
            // Re-render previews
            renderAttachmentPreviews();
        }
    }
    
    function clearAttachments() {
        // Clear attachments array
        state.attachments = [];
        
        // Remove preview container
        const previewContainer = document.querySelector('.attachment-previews');
        if (previewContainer) {
            previewContainer.style.display = 'none';
            previewContainer.innerHTML = '';
        }
    }
    
    // Call functions
    function startVoiceCall() {
        if (!state.currentChatId) {
            return;
        }
        
        const chat = state.chats[state.currentChatId];
        const otherParticipantId = chat.participants.find(id => id !== state.currentUser.id);
        const otherParticipant = state.contacts.find(contact => contact.id === otherParticipantId);
        
        // Show calling modal
        showCallingModal('voice', otherParticipant);
    }
    
    function startVideoCall() {
        if (!state.currentChatId) {
            return;
        }
        
        const chat = state.chats[state.currentChatId];
        const otherParticipantId = chat.participants.find(id => id !== state.currentUser.id);
        const otherParticipant = state.contacts.find(contact => contact.id === otherParticipantId);
        
        // Show calling modal
        showCallingModal('video', otherParticipant);
    }
    
    function showCallingModal(callType, contact) {
        // Create modal HTML
        const modalHTML = `
            <div class="call-modal">
                <div class="call-content">
                    <img src="${contact.photoURL}" alt="${contact.displayName}" class="call-avatar">
                    <h3>${contact.displayName}</h3>
                    <p>${callType === 'voice' ? 'Voice' : 'Video'} call...</p>
                    <div class="call-actions">
                        <button class="btn btn-danger rounded-circle call-btn" id="end-call-btn">
                            <i class="bi bi-telephone-x-fill"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to body
        const modal = document.createElement('div');
        modal.className = 'call-modal-container';
        modal.innerHTML = modalHTML;
        document.body.appendChild(modal);
        
        // Add animation
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
        
        // Add event listener for end call
        document.getElementById('end-call-btn').addEventListener('click', () => {
            modal.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(modal);
            }, 300);
        });
        
        // Simulate call ringing and auto-end after 5 seconds for demo
        setTimeout(() => {
            if (document.body.contains(modal)) {
                modal.classList.remove('show');
                setTimeout(() => {
                    if (document.body.contains(modal)) {
                        document.body.removeChild(modal);
                    }
                }, 300);
            }
        }, 5000);
    }
    
    // Attachment options popup function
    window.showAttachmentOptions = function(attachmentId, type, fileName) {
        // Decode the file name
        fileName = decodeURIComponent(fileName);
        
        // Get the attachment data
        const attachment = window.messageAttachments[attachmentId];
        if (!attachment) return;
        
        // Find the attachment element
        const attachmentElement = document.querySelector(`[data-attachment-id="${attachmentId}"]`);
        if (!attachmentElement) return;
        
        // Remove any existing options menu
        const existingMenu = document.querySelector('.attachment-options-menu');
        if (existingMenu) existingMenu.remove();
        
        // Create options menu
        const menu = document.createElement('div');
        menu.className = 'attachment-options-menu';
        
        let menuContent = '';
        
        // Different options based on file type
        if (type.startsWith('image/') || type.startsWith('video/')) {
            menuContent = `
                <button class="option-btn" onclick="openAttachment('${attachmentId}')"><i class="bi bi-eye"></i> View</button>
                <button class="option-btn" onclick="saveAttachment('${attachmentId}', '${fileName}')"><i class="bi bi-download"></i> Save As</button>
            `;
        } else {
            menuContent = `
                <button class="option-btn" onclick="openAttachment('${attachmentId}')"><i class="bi bi-box-arrow-up-right"></i> Open</button>
                <button class="option-btn" onclick="saveAttachment('${attachmentId}', '${fileName}')"><i class="bi bi-download"></i> Save As</button>
            `;
        }
        
        menu.innerHTML = menuContent;
        
        // Position the menu near the attachment
        const rect = attachmentElement.getBoundingClientRect();
        menu.style.position = 'fixed';
        menu.style.top = `${rect.top + window.scrollY}px`;
        menu.style.left = `${rect.right + window.scrollX}px`;
        
        // Add the menu to the document
        document.body.appendChild(menu);
        
        // Close menu when clicking outside
        function closeMenu(e) {
            if (!menu.contains(e.target) && e.target !== attachmentElement && !attachmentElement.contains(e.target)) {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            }
        }
        
        // Add a slight delay before adding the event listener
        setTimeout(() => {
            document.addEventListener('click', closeMenu);
        }, 10);
    };
    
    // Function to open an attachment
    window.openAttachment = function(attachmentId) {
        const attachment = window.messageAttachments[attachmentId];
        if (attachment && attachment.data) {
            window.open(attachment.data, '_blank');
        }
    };
    
    // Function to save an attachment
    window.saveAttachment = function(attachmentId, fileName) {
        const attachment = window.messageAttachments[attachmentId];
        if (!attachment || !attachment.data) return;
        
        // Create an anchor and trigger download
        const a = document.createElement('a');
        a.href = attachment.data;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };
});
