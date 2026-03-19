const BASE_URL = `${window.location.origin}/api`;
let goalsChart;
let assessmentsChart;

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

async function fetchJson(endpoint, token) {
    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const body = await response.json();

        if (!response.ok) {
            return {
                ok: false,
                status: response.status,
                message: body?.message || 'Request failed',
                data: null
            };
        }

        return {
            ok: true,
            status: response.status,
            message: body?.message || 'Request successful',
            data: Object.prototype.hasOwnProperty.call(body, 'data') ? body.data : body
        };
    } catch (error) {
        console.error(`Failed to fetch ${endpoint}:`, error);
        return { ok: false, status: 0, message: 'Network error', data: null };
    }
}

function setActiveNav() {
    const links = document.querySelectorAll('.main-nav a');
    const hash = window.location.hash || '#overview';
    links.forEach((link) => {
        link.classList.toggle('active', link.getAttribute('href') === hash);
    });
}

function metricCard(label, value) {
    return `
        <article class="metric-card">
            <p class="metric-label">${escapeHtml(label)}</p>
            <p class="metric-value">${escapeHtml(value)}</p>
        </article>
    `;
}

function safeDate(dateValue) {
    const date = new Date(dateValue);
    return Number.isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
}

function normalizeArray(result) {
    return result.ok && Array.isArray(result.data) ? result.data : [];
}

function sectionWithItems(title, items, mapItem, chartId) {
    if (!items.length) {
        return `
            <h2 class="section-title">${escapeHtml(title)}</h2>
            <p class="empty-state">No ${escapeHtml(title.toLowerCase())} found yet.</p>
        `;
    }

    return `
        <h2 class="section-title">${escapeHtml(title)}</h2>
        ${chartId ? `<div class="chart-wrap"><canvas id="${chartId}" aria-label="${escapeHtml(title)} chart"></canvas></div>` : ''}
        <ul class="item-list">
            ${items.map(mapItem).join('')}
        </ul>
    `;
}

function renderGoalsChart(goals) {
    const chartCanvas = document.getElementById('goalsChart');
    if (!chartCanvas || typeof Chart === 'undefined') {
        return;
    }

    const statusMap = goals.reduce((acc, goal) => {
        const key = (goal.status || 'unknown').toLowerCase();
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {});

    if (goalsChart) {
        goalsChart.destroy();
    }

    goalsChart = new Chart(chartCanvas, {
        type: 'doughnut',
        data: {
            labels: Object.keys(statusMap).map((s) => s[0].toUpperCase() + s.slice(1)),
            datasets: [{
                data: Object.values(statusMap),
                backgroundColor: ['#2ec4b6', '#ff7f50', '#f4d35e', '#457b9d']
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { position: 'bottom' } }
        }
    });
}

function renderAssessmentsChart(assessments) {
    const chartCanvas = document.getElementById('assessmentsChart');
    if (!chartCanvas || typeof Chart === 'undefined') {
        return;
    }

    const recent = assessments
        .slice()
        .sort((a, b) => new Date(a.date || a.createdAt) - new Date(b.date || b.createdAt))
        .slice(-8);

    if (assessmentsChart) {
        assessmentsChart.destroy();
    }

    assessmentsChart = new Chart(chartCanvas, {
        type: 'line',
        data: {
            labels: recent.map((item) => safeDate(item.date || item.createdAt)),
            datasets: [{
                label: 'Assessment Score',
                data: recent.map((item) => Number(item.scores || item.score || 0)),
                borderColor: '#ff7f50',
                pointBackgroundColor: '#124559',
                borderWidth: 3,
                fill: false,
                tension: 0.25
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 }
                }
            }
        }
    });
}

async function loadDashboard() {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    if (!token || !userId) {
        window.location.href = '/login';
        return;
    }

    const [userResult, goalsResult, consumptionResult, assessmentsResult, resourcesResult] = await Promise.all([
        fetchJson(`/users/${userId}`, token),
        fetchJson('/goals', token),
        fetchJson('/alcohol-consumption', token),
        fetchJson('/self-assessment', token),
        fetchJson('/resources', token)
    ]);

    if (!userResult.ok) {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        window.location.href = '/login';
        return;
    }

    const user = userResult.data || {};
    const goals = normalizeArray(goalsResult);
    const consumption = normalizeArray(consumptionResult);
    const assessments = normalizeArray(assessmentsResult);
    const resources = normalizeArray(resourcesResult);

    document.getElementById('overview').innerHTML = `
        <h2 class="section-title">Welcome back, ${escapeHtml(user.name || 'friend')}</h2>
        <p>Email: ${escapeHtml(user.email || 'N/A')} | Member since ${escapeHtml(safeDate(user.createdAt))}</p>
    `;

    document.getElementById('summaryCards').innerHTML = [
        metricCard('Profile', user.name || 'User'),
        metricCard('Goals', goals.length),
        metricCard('Consumption Logs', consumption.length),
        metricCard('Assessments', assessments.length)
    ].join('');

    document.getElementById('goals').innerHTML = sectionWithItems('Goals', goals.slice(0, 6), (goal) => `
        <li>
            <strong>${escapeHtml(goal.title || goal.goal_title || 'Goal')}</strong><br>
            <span>Status: ${escapeHtml(goal.status || 'Not set')}</span>
        </li>
    `, 'goalsChart');

    document.getElementById('alcohol').innerHTML = sectionWithItems('Consumption', consumption.slice(0, 5), (entry) => `
        <li>
            <strong>${escapeHtml(entry.amount || 'Entry')}</strong><br>
            <span>${escapeHtml(safeDate(entry.date || entry.createdAt))}</span>
        </li>
    `);

    document.getElementById('assessments').innerHTML = sectionWithItems('Self-Assessment', assessments.slice(0, 6), (assessment) => `
        <li>
            <strong>Risk: ${escapeHtml(assessment.risk_level || 'N/A')}</strong><br>
            <span>Score: ${escapeHtml(assessment.scores || assessment.score || 'N/A')}</span>
        </li>
    `, 'assessmentsChart');

    document.getElementById('resources').innerHTML = sectionWithItems('Resources', resources.slice(0, 5), (resource) => `
        <li>
            <strong>${escapeHtml(resource.title || 'Resource')}</strong><br>
            <span>${escapeHtml(resource.description || resource.link || 'No details available')}</span>
        </li>
    `);

    renderGoalsChart(goals);
    renderAssessmentsChart(assessments);
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    window.location.href = '/login';
}

document.addEventListener('DOMContentLoaded', () => {
    const logoutButton = document.getElementById('logoutBtn');
    if (logoutButton) {
        logoutButton.addEventListener('click', logout);
    }

    setActiveNav();
    window.addEventListener('hashchange', setActiveNav);
    loadDashboard();
});
