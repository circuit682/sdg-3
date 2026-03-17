// URL for your API backend
const BASE_URL = 'http://localhost:3000/api';

// Display message function
function showMessage(message, isSuccess = true) {
    const messageDiv = document.getElementById('message');
    if (!messageDiv) return;
    messageDiv.style.display = 'block';
    messageDiv.style.color = isSuccess ? 'green' : 'red';
    messageDiv.innerText = message;

    // Hide message after a few seconds
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 3000);
}

// Handle register form submission
async function handleRegister(event) {
    event.preventDefault();  // Prevent the page from refreshing on submit

    // Collect form data
    const name = document.getElementById('name').value; 
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Prepare the data for API call
    const userData = { name, email, password };

    try {
        // Make API request to register the user
        const response = await fetch(`${BASE_URL}/users`, { // Ensure BASE_URL is used with the correct endpoint
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const result = await response.json();

        if (response.ok) {
            // Show success message
            showMessage('Registration successful! Redirecting to login...', true);

            // Redirect to login page after a short delay
            setTimeout(() => {
                window.location.href = '/login';
            }, 2000);
        } else {
            // Show error message
            showMessage(result.error || 'Registration failed. Please try again.', false);
        }
    } catch (error) {
        console.error('Error during registration:', error);
        showMessage('An error occurred. Please try again later.', false);
    }
}

// Event listener for the registration form
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
}

// Handle login form submission
async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: email, password })
        });
        const data = await response.json();

        if (response.ok && data.token) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('userId', data.userId);
            window.location.href = '/';
        } else {
            showMessage(data.error || 'Login failed', false);
        }
    } catch (error) {
        console.error('Error logging in:', error);
        showMessage('An error occurred during login', false);
    }
}

// Attach login form listener
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    window.location.href = '/';
}
