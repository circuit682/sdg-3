// dashboard.js
async function loadUserData() {
    try {
        const response = await fetch('/api/userdata');  // Backend endpoint to fetch user data
        const data = await response.json();
        
        // Check if data retrieval was successful
        if (data.success) {
            displayMetrics(data.metrics); // Hypothetical function to handle data display
        } else {
            alert("Failed to load user data.");
        }
    } catch (error) {
        console.error("Error loading user data:", error);
    }
}

// Load user data when the page is ready
document.addEventListener("DOMContentLoaded", loadUserData);
