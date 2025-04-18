// TChat - Login Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize theme
    const darkMode = localStorage.getItem('darkMode') === 'true';
    const themeSwitch = document.getElementById('theme-switch');
    
    if (darkMode) {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeSwitch.checked = true;
    }
    
    // Theme toggle event listener
    themeSwitch.addEventListener('change', function() {
        const isDark = themeSwitch.checked;
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
        localStorage.setItem('darkMode', isDark);
    });
    
    // Authentication setup
    let authClient;
    
    // Internet Identity login button
    const iiLoginBtn = document.getElementById('ii-login-btn');
    iiLoginBtn.addEventListener('click', async () => {
        await initAuth();
        await login();
    });
    
    // Demo account login
    const demoLoginBtn = document.getElementById('demo-login-btn');
    demoLoginBtn.addEventListener('click', () => {
        // Create a demo user
        const demoUser = {
            id: 'demo-user-' + Date.now(),
            principal: 'demo-principal',
            displayName: 'Demo User',
            photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=demo`,
            lastSeen: new Date().toISOString()
        };
        
        // Save user to local storage
        localStorage.setItem('tchat_user', JSON.stringify(demoUser));
        
        // Redirect to chat page
        window.location.href = 'index.html';
    });
    
    // Check if already authenticated
    async function checkAuthState() {
        await initAuth();
        const isAuthenticated = await authClient.isAuthenticated();
        
        if (isAuthenticated) {
            window.location.href = 'index.html';
        }
    }
    
    // Initialize authentication
    async function initAuth() {
        if (!authClient) {
            try {
                authClient = await window.auth_client.AuthClient.create();
            } catch (error) {
                console.error('Failed to create auth client:', error);
            }
        }
        return authClient;
    }
    
    // Internet Identity login
    async function login() {
        if (!authClient) return;
        
        const days = 30;
        // Local development
        const identityProviderUrl = 'http://localhost:4943?canisterId=rdmx6-jaaaa-aaaaa-aaadq-cai';
        // For production (uncomment when deploying to IC)
        // const identityProviderUrl = 'https://identity.ic0.app';
        
        authClient.login({
            identityProvider: identityProviderUrl,
            maxTimeToLive: BigInt(days * 24 * 60 * 60 * 1000 * 1000 * 1000),
            onSuccess: async () => {
                // Get user's identity and principal
                const identity = await authClient.getIdentity();
                const principal = identity.getPrincipal();
                const principalText = principal.toString();
                
                // Create user profile
                const shortPrincipal = principalText.substring(0, 5);
                const user = {
                    id: principalText,
                    principal: principalText,
                    displayName: `User-${shortPrincipal}`,
                    photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${principalText}`,
                    lastSeen: new Date().toISOString()
                };
                
                // Save user to local storage
                localStorage.setItem('tchat_user', JSON.stringify(user));
                
                // Redirect to chat page
                window.location.href = 'index.html';
            },
            onError: (error) => {
                console.error('Login failed:', error);
            }
        });
    }
    
    // Check if user is already logged in
    checkAuthState();
});
