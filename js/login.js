document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const username = usernameInput.value.trim();
        const password = passwordInput.value;
        
        // Simulated successful login
        alert(`¡Bienvenido, ${username}! Redirigiendo al panel de control...`);
        
        // Redirect to inicio.html
        window.location.href = 'page/inicio.html';
    });

    // Hide error message when typing
    usernameInput.addEventListener('input', () => {
        errorMessage.style.display = 'none';
    });

    passwordInput.addEventListener('input', () => {
        errorMessage.style.display = 'none';
    });

    // Forgot Password and Register links
    document.getElementById('forgotPassword').addEventListener('click', (e) => {
        e.preventDefault();
        alert('Funcionalidad de recuperación de contraseña (próximamente)');
    });

    document.getElementById('register').addEventListener('click', (e) => {
        e.preventDefault();
        alert('Funcionalidad de registro (próximamente)');
    });

    // Social Login placeholders
    document.querySelectorAll('.social-login a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            alert('Inicio de sesión social (próximamente)');
        });
    });
});