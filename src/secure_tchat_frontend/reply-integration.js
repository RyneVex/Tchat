// Reply functionality integration
(function() {
    console.log('Initializing reply integration...');
    
    // Wait for DOM to be ready
    document.addEventListener('DOMContentLoaded', function() {
        // Hook into the send button
        const sendBtn = document.getElementById('send-btn');
        const messageInput = document.getElementById('message-input');
        
        if (sendBtn && messageInput) {
            // Add event listener to send message when enter key is pressed
            messageInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    sendMessageWithReply();
                }
            });
            
            // Add event listener to send button
            sendBtn.addEventListener('click', sendMessageWithReply);
        }
        
        // Function to send a message with reply info
        function sendMessageWithReply() {
            const text = messageInput.value.trim();
            const currentChatId = localStorage.getItem('currentChatId') || window.currentChatId;
            
            // Do not send if no text and no attachments, or no selected chat
            if ((!text && (!window.attachments || window.attachments.length === 0)) || !currentChatId) return;
            
            // Get reply information if replying
            const replyInfo = window.replyingTo;
            
            // Create the message
            const newMessage = {
                id: 'm' + Date.now(),
                text: text,
                senderId: (window.currentUser || JSON.parse(localStorage.getItem('tchat_user'))).id,
                timestamp: new Date().toISOString(),
                attachments: window.attachments || []
            };
            
            // Add reply information if replying
            if (replyInfo) {
                newMessage.replyTo = replyInfo;
                // Clear the reply UI
                if (window.cancelReply) window.cancelReply();
            }
            
            // Add to chat data
            try {
                // Find the current chat
                let chat;
                if (window.chats && window.chats[currentChatId]) {
                    chat = window.chats[currentChatId];
                } else if (window.state && window.state.chats && window.state.chats[currentChatId]) {
                    chat = window.state.chats[currentChatId];
                }
                
                // Add message to chat if found
                if (chat) {
                    if (!chat.messages) chat.messages = [];
                    chat.messages.push(newMessage);
                    
                    // Update last message
                    chat.lastMessage = {
                        ...newMessage,
                        text: newMessage.attachments.length > 0 ? 
                              (text ? `${text} (${newMessage.attachments.length} attachment${newMessage.attachments.length > 1 ? 's' : ''})` : 
                              `Sent ${newMessage.attachments.length} attachment${newMessage.attachments.length > 1 ? 's' : ''}`) : 
                              text
                    };
                }
                
                // Clear input and attachments
                messageInput.value = '';
                if (window.clearAttachments) window.clearAttachments();
                
                // Update UI
                if (window.renderMessages) window.renderMessages(currentChatId);
                if (window.renderChatList) window.renderChatList();
                
                console.log('Message sent with reply integration:', newMessage);
                
                // Simulate reply?
                if (Math.random() > 0.5 && window.simulateReply) {
                    window.simulateReply(currentChatId);
                }
            } catch (error) {
                console.error('Error sending message with reply:', error);
            }
        }
    });
})();
