const BASE_URL = `${window.location.origin}/api`;

function showMessage(message, isSuccess = true) {
    const messageDiv = document.getElementById('message');
    if (!messageDiv) return;

    messageDiv.style.display = 'block';
    messageDiv.style.background = isSuccess ? '#e7f9ef' : '#fdecec';
    messageDiv.style.color = isSuccess ? '#1f7a4d' : '#b42318';
    messageDiv.style.borderRadius = '8px';
    messageDiv.style.padding = '0.7rem 0.9rem';
    messageDiv.style.marginBottom = '1rem';
    messageDiv.innerText = message;

    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 3000);
}

function getMessage(payload, fallback) {
    return payload?.message || payload?.error?.message || payload?.error || fallback;
}

async function handleRegister(event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${BASE_URL}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });

        const result = await response.json();

        if (response.ok && result.success) {
            showMessage('Registration successful! Redirecting to login...', true);
            setTimeout(() => {
                window.location.href = '/login';
            }, 2000);
            return;
        }

        showMessage(getMessage(result, 'Registration failed. Please try again.'), false);
    } catch (error) {
        console.error('Error during registration:', error);
        showMessage('An error occurred. Please try again later.', false);
    }
}

const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
}

async function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const payload = await response.json();
        const authData = payload?.data || {};

        if (response.ok && payload.success && authData.token) {
            localStorage.setItem('token', authData.token);
            localStorage.setItem('userId', String(authData.userId || authData.user?.id || ''));
            window.location.href = '/dashboard';
            return;
        }

        showMessage(getMessage(payload, 'Login failed'), false);
    } catch (error) {
        console.error('Error logging in:', error);
        showMessage('An error occurred during login', false);
    }
}

const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    window.location.href = '/login';
}
