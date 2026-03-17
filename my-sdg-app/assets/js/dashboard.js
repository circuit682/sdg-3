// dashboard.js
const BASE_URL = 'http://localhost:3000/api';

// Check if user is authenticated
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login';
    }
    return token;
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    window.location.href = '/';
}

// Load user data
async function loadUserData() {
    try {
        const token = checkAuth();
        const userId = localStorage.getItem('userId');

        // Fetch user profile
        const userResponse = await fetch(`${BASE_URL}/users/${userId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!userResponse.ok) throw new Error('Failed to load user data');
        const userData = await userResponse.json();

        // Fetch alcohol consumption data
        const consumptionResponse = await fetch(`${BASE_URL}/alcohol-consumption`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const consumptionData = consumptionResponse.ok ? await consumptionResponse.json() : [];

        // Fetch goals
        const goalsResponse = await fetch(`${BASE_URL}/goals`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const goalsData = goalsResponse.ok ? await goalsResponse.json() : [];

        // Display metrics
        displayMetrics(userData, consumptionData, goalsData);
    } catch (error) {
        console.error('Error loading user data:', error);
        document.getElementById('userData').innerHTML = '<p style="color: red;">Error loading dashboard data. Please refresh the page.</p>';
    }
}

// Display metrics on the dashboard
function displayMetrics(user, consumption, goals) {
    const userDataDiv = document.getElementById('userData');
    if (!userDataDiv) return;

    const consumptionCount = consumption.length || 0;
    const goalsCount = goals.length || 0;

    userDataDiv.innerHTML = `
        <h3>Welcome, ${user.name || 'User'}!</h3>
        <div class="metric">
            <i class='bx bx-user'></i>
            <p><strong>Email:</strong> ${user.email || 'N/A'}</p>
        </div>
        <div class="metric">
            <i class='bx bx-bottle'></i>
            <p><strong>Consumption Records:</strong> ${consumptionCount}</p>
        </div>
        <div class="metric">
            <i class='bx bx-target-lock'></i>
            <p><strong>Active Goals:</strong> ${goalsCount}</p>
        </div>
        <div class="metric">
            <i class='bx bx-calendar'></i>
            <p><strong>Member Since:</strong> ${new Date(user.createdAt).toLocaleDateString() || 'N/A'}</p>
        </div>
    `;
}

// Load user data when the page is ready
document.addEventListener('DOMContentLoaded', loadUserData);
