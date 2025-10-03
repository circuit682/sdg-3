// script.js

const BASE_URL = 'http://localhost:3000/api';

// Utility function to handle requests
async function fetchData(endpoint, method = 'GET', data) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : null,
    };

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, options);
        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Fetch error:', error);
        return null;
    }
}

// Users
async function registerUser(userData) {
    return await fetchData('/users/register', 'POST', userData);
}

async function loginUser(userData) {
    return await fetchData('/auth/login', 'POST', userData);
}

// Goals
async function fetchGoals() {
    return await fetchData('/goals', 'GET');
}

async function addGoal(goalData) {
    return await fetchData('/goals', 'POST', goalData);
}

// Support
async function fetchSupportRequests() {
    return await fetchData('/support', 'GET');
}

async function createSupportRequest(supportData) {
    return await fetchData('/support', 'POST', supportData);
}

// Alcohol Consumption
async function logAlcoholConsumption(data) {
    return await fetchData('/alcohol-consumption', 'POST', data);
}

async function getAlcoholConsumptionRecords() {
    return await fetchData('/alcohol-consumption', 'GET');
}

// Consultations
async function bookConsultation(consultationData) {
    return await fetchData('/consultations', 'POST', consultationData);
}

async function fetchConsultations() {
    return await fetchData('/consultations', 'GET');
}

// Resources
async function fetchResources() {
    return await fetchData('/resources', 'GET');
}

async function addResource(resourceData) {
    return await fetchData('/resources', 'POST', resourceData);
}

// Self-Assessment
async function submitSelfAssessment(assessmentData) {
    return await fetchData('/self-assessment', 'POST', assessmentData);
}

async function fetchSelfAssessmentResults() {
    return await fetchData('/self-assessment', 'GET');
}

// Dashboard
async function fetchDashboardData() {
    return await fetchData('/dashboard', 'GET');
}

// // Example Usage in HTML
// // Call these functions based on user actions, e.g., button clicks, form submissions
// document.getElementById('loginForm').onsubmit = async (event) => {
//     event.preventDefault();
//     const email = document.getElementById('email').value;
//     const password = document.getElementById('password').value;
//     const result = await loginUser({ email, password });
//     console.log('Login Result:', result);
// };

//  similar event listeners or function calls for other actions
// Registration form submission event
document.getElementById('registerForm').onsubmit = async (event) => {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    const result = await registerUser({ username, email, password });
    console.log('Registration Result:', result);
    if (result) {
        alert("Registration successful!");
    } else {
        alert("Registration failed. Please try again.");
    }
};

