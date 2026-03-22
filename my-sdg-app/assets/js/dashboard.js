const BASE_URL = `${window.location.origin}/api`;
let goalsChart;
let assessmentsChart;
let dashboardState = {
    user: null,
    goals: [],
    assessments: [],
    consumption: [],
    resources: []
};
let uiState = {
    goalsVisible: 8,
    assessmentsVisible: 8
};
let activityTrail = [];
const undoQueue = new Map();

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

async function sendJson(endpoint, method, token, body) {
    try {
        const hasBody = typeof body !== 'undefined' && body !== null;
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method,
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: hasBody ? JSON.stringify(body) : undefined
        });

        const payload = await response.json();
        return {
            ok: response.ok,
            status: response.status,
            message: payload?.message || 'Request completed',
            data: payload?.data || null
        };
    } catch (error) {
        console.error(`Failed to send ${method} to ${endpoint}:`, error);
        return { ok: false, status: 0, message: 'Network error', data: null };
    }
}

function setFormBusy(form, isBusy, busyText) {
    if (!form) return;
    const submitButton = form.querySelector('button[type="submit"]');
    if (!submitButton) return;

    if (isBusy) {
        submitButton.dataset.originalText = submitButton.textContent;
        submitButton.textContent = busyText;
    } else if (submitButton.dataset.originalText) {
        submitButton.textContent = submitButton.dataset.originalText;
    }

    Array.from(form.elements).forEach((element) => {
        element.disabled = isBusy;
    });
}

function ensureUndoContainer() {
    let container = document.getElementById('undoToastStack');
    if (container) return container;

    container = document.createElement('div');
    container.id = 'undoToastStack';
    container.className = 'undo-toast-stack';
    container.setAttribute('aria-live', 'polite');
    document.body.appendChild(container);
    return container;
}

function clearUndoEntry(entryId) {
    const entry = undoQueue.get(entryId);
    if (!entry) return;

    clearTimeout(entry.timeoutId);
    clearInterval(entry.intervalId);
    undoQueue.delete(entryId);

    if (entry.toast && entry.toast.parentElement) {
        entry.toast.remove();
    }
}

function queueUndoableDelete({
    item,
    index,
    stateKey,
    endpoint,
    pendingMessage,
    successMessage,
    trailLabel
}) {
    const entryId = `${stateKey}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const container = ensureUndoContainer();
    const toast = document.createElement('div');
    toast.className = 'undo-toast show';
    toast.setAttribute('data-undo-id', entryId);

    const toastText = document.createElement('span');
    const undoButton = document.createElement('button');
    undoButton.type = 'button';
    undoButton.textContent = 'Undo';
    toast.appendChild(toastText);
    toast.appendChild(undoButton);
    container.prepend(toast);

    const entry = {
        toast,
        timeoutId: null,
        intervalId: null,
        remainingMs: 5000,
        endAt: 0,
        paused: false
    };
    undoQueue.set(entryId, entry);

    const updateToastText = () => {
        const seconds = Math.max(0, Math.ceil(entry.remainingMs / 1000));
        toastText.textContent = `${pendingMessage} (${seconds}s)`;
    };

    const scheduleCommit = () => {
        entry.endAt = Date.now() + entry.remainingMs;
        entry.timeoutId = setTimeout(commitDelete, entry.remainingMs);
    };

    const pauseCountdown = () => {
        if (entry.paused) return;
        entry.paused = true;
        clearTimeout(entry.timeoutId);
        entry.remainingMs = Math.max(0, entry.endAt - Date.now());
        updateToastText();
    };

    const resumeCountdown = () => {
        if (!entry.paused || entry.remainingMs <= 0) return;
        entry.paused = false;
        scheduleCommit();
        updateToastText();
    };

    const commitDelete = async () => {
        clearUndoEntry(entryId);

        const token = localStorage.getItem('token');
        const result = await sendJson(endpoint, 'DELETE', token);
        if (!result.ok) {
            dashboardState[stateKey].splice(index, 0, item);
            renderDashboard();
            showFlash(result.message || 'Delete failed. Item restored.', 'error');
            return;
        }

        addTrailEntry(trailLabel);
        showFlash(successMessage);
        await loadDashboard();
    };

    const undoDelete = () => {
        clearUndoEntry(entryId);
        dashboardState[stateKey].splice(index, 0, item);
        renderDashboard();
        addTrailEntry(`Undo: ${trailLabel}`);
        showFlash('Deletion undone.');
    };

    undoButton.addEventListener('click', undoDelete);
    toast.addEventListener('mouseenter', pauseCountdown);
    toast.addEventListener('mouseleave', resumeCountdown);
    toast.addEventListener('focusin', pauseCountdown);
    toast.addEventListener('focusout', resumeCountdown);
    updateToastText();

    entry.intervalId = setInterval(() => {
        if (!entry.paused) {
            entry.remainingMs = Math.max(0, entry.endAt - Date.now());
            updateToastText();
        }
    }, 200);

    scheduleCommit();
    return true;
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

function showFlash(message, type = 'success') {
    const overview = document.getElementById('overview');
    if (!overview) return;

    const alert = document.createElement('p');
    alert.className = type === 'error' ? 'error-state' : 'success-state';
    alert.textContent = message;
    alert.setAttribute('data-flash', 'true');
    overview.appendChild(alert);

    setTimeout(() => {
        alert.remove();
    }, 2200);
}

function addTrailEntry(message) {
    const entry = {
        text: message,
        at: new Date().toISOString()
    };
    activityTrail = [entry, ...activityTrail].slice(0, 6);
}

function safeDate(dateValue) {
    const date = new Date(dateValue);
    return Number.isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
}

function normalizeArray(result) {
    return result.ok && Array.isArray(result.data) ? result.data : [];
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
            animation: {
                duration: 700,
                easing: 'easeOutQuart'
            },
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
            animation: {
                duration: 700,
                easing: 'easeOutQuart'
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 }
                }
            }
        }
    });
}

function renderGoalsSection() {
    const goals = dashboardState.goals;
    const goalsEl = document.getElementById('goals');
    if (!goalsEl) return;

    goalsEl.innerHTML = `
        <div class="panel-head">
            <h2 class="section-title">Goals</h2>
            <p class="section-note">Create a goal, track status, and keep momentum.</p>
        </div>
        <form id="goalForm" class="inline-form">
            <input type="hidden" id="goalId" />
            <div class="field-grid">
                <label>Title
                    <input id="goalTitle" required maxlength="120" placeholder="e.g. 14 alcohol-free days" />
                </label>
                <label>Status
                    <select id="goalStatus" required>
                        <option value="planned">Planned</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                    </select>
                </label>
                <label>End Date
                    <input id="goalEndDate" type="date" />
                </label>
                <label class="field-wide">Description
                    <textarea id="goalDescription" rows="2" placeholder="A short commitment statement"></textarea>
                </label>
            </div>
            <div class="form-actions">
                <button class="action-btn" type="submit">Save Goal</button>
                <button class="action-btn ghost" type="button" id="goalCancelEdit">Cancel Edit</button>
            </div>
        </form>
        <div class="chart-wrap"><canvas id="goalsChart" aria-label="Goals chart"></canvas></div>
        ${goals.length ? `
        <ul class="item-list">
            ${goals.slice(0, uiState.goalsVisible).map((goal) => `
                <li>
                    <strong>${escapeHtml(goal.title || 'Goal')}</strong><br>
                    <span>Status: ${escapeHtml(goal.status || 'Not set')} | End: ${escapeHtml(safeDate(goal.end_date))}</span>
                    <p>${escapeHtml(goal.description || 'No description')}</p>
                    <div class="item-actions">
                        <button class="tiny-btn" type="button" data-action="edit-goal" data-goalid="${goal.goal_id}">Edit</button>
                        <button class="tiny-btn danger" type="button" data-action="delete-goal" data-goalid="${goal.goal_id}">Delete</button>
                    </div>
                </li>
            `).join('')}
        </ul>
        ${goals.length > uiState.goalsVisible ? '<button class="more-btn" id="goalsShowMore" type="button">Show More Goals</button>' : ''}
        ` : '<p class="empty-state">No goals found yet.</p>'}
    `;

    bindGoalForm();
    renderGoalsChart(goals);
}

function renderAssessmentsSection() {
    const assessments = dashboardState.assessments;
    const assessmentsEl = document.getElementById('assessments');
    if (!assessmentsEl) return;

    assessmentsEl.innerHTML = `
        <div class="panel-head">
            <h2 class="section-title">Self-Assessment</h2>
            <p class="section-note">Capture your score over time and watch risk shifts.</p>
        </div>
        <form id="assessmentForm" class="inline-form">
            <input type="hidden" id="assessmentId" />
            <div class="field-grid">
                <label>Date
                    <input id="assessmentDate" type="date" required />
                </label>
                <label>Risk Level
                    <select id="assessmentRisk" required>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                </label>
                <label>Score
                    <input id="assessmentScore" type="number" min="0" max="10" required />
                </label>
                <label class="field-wide">Notes
                    <textarea id="assessmentNotes" rows="2" placeholder="What influenced this score?"></textarea>
                </label>
            </div>
            <div class="form-actions">
                <button class="action-btn" type="submit">Save Assessment</button>
                <button class="action-btn ghost" type="button" id="assessmentCancelEdit">Cancel Edit</button>
            </div>
        </form>
        <div class="chart-wrap"><canvas id="assessmentsChart" aria-label="Assessment chart"></canvas></div>
        ${assessments.length ? `
        <ul class="item-list">
            ${assessments.slice(0, uiState.assessmentsVisible).map((assessment) => `
                <li>
                    <strong>${escapeHtml(safeDate(assessment.date || assessment.createdAt))}</strong><br>
                    <span>Risk: ${escapeHtml(assessment.risk_level || 'N/A')} | Score: ${escapeHtml(assessment.scores || 'N/A')}</span>
                    <p>${escapeHtml(assessment.notes || 'No notes')}</p>
                    <div class="item-actions">
                        <button class="tiny-btn" type="button" data-action="edit-assessment" data-assessmentid="${assessment.assessment_id}">Edit</button>
                        <button class="tiny-btn danger" type="button" data-action="delete-assessment" data-assessmentid="${assessment.assessment_id}">Delete</button>
                    </div>
                </li>
            `).join('')}
        </ul>
        ${assessments.length > uiState.assessmentsVisible ? '<button class="more-btn" id="assessmentsShowMore" type="button">Show More Assessments</button>' : ''}
        ` : '<p class="empty-state">No assessments found yet.</p>'}
    `;

    bindAssessmentForm();
    renderAssessmentsChart(assessments);
}

function latestDataTimestamp() {
    const combined = [
        ...(dashboardState.goals || []),
        ...(dashboardState.assessments || []),
        ...(dashboardState.consumption || []),
        ...(dashboardState.resources || [])
    ];

    const timestamps = combined
        .map((item) => item.updatedAt || item.createdAt || item.date)
        .filter(Boolean)
        .map((value) => new Date(value).getTime())
        .filter((time) => !Number.isNaN(time));

    if (!timestamps.length) {
        return null;
    }

    return new Date(Math.max(...timestamps)).toISOString();
}

function renderOverviewSection() {
    const { user } = dashboardState;
    const latestData = latestDataTimestamp();

    const feed = [
        { text: 'Dashboard synchronized', at: latestData || new Date().toISOString() },
        ...activityTrail
    ].slice(0, 5);

    document.getElementById('overview').innerHTML = `
        <h2 class="section-title">Welcome back, ${escapeHtml(user?.name || 'friend')}</h2>
        <p>Email: ${escapeHtml(user?.email || 'N/A')} | Member since ${escapeHtml(safeDate(user?.createdAt))}</p>
        <div class="audit-box">
            <h3>Recent Activity</h3>
            <ul>
                ${feed.map((entry) => `<li><span>${escapeHtml(entry.text)}</span><time>${escapeHtml(safeDate(entry.at))}</time></li>`).join('')}
            </ul>
        </div>
    `;
}

function renderConsumptionSection() {
    const records = dashboardState.consumption || [];
    const element = document.getElementById('alcohol');
    if (!element) return;

    element.innerHTML = `
        <h2 class="section-title">Consumption</h2>
        ${records.length ? `
            <ul class="item-list">
                ${records.slice(0, 6).map((entry) => `
                    <li>
                        <strong>${escapeHtml(entry.amount || 'Entry')}</strong><br>
                        <span>${escapeHtml(safeDate(entry.date || entry.createdAt))}</span>
                        <div class="item-actions">
                            <button class="tiny-btn danger" type="button" data-action="delete-consumption" data-consumptionid="${entry.consumption_id}">Delete</button>
                        </div>
                    </li>
                `).join('')}
            </ul>
        ` : '<p class="empty-state">No consumption records found yet.</p>'}
    `;

    document.querySelectorAll('[data-action="delete-consumption"]').forEach((button) => {
        button.addEventListener('click', async () => {
            const id = Number(button.getAttribute('data-consumptionid'));
            const index = dashboardState.consumption.findIndex((item) => item.consumption_id === id);
            if (index < 0) return;

            const [removed] = dashboardState.consumption.splice(index, 1);
            renderDashboard();

            const queued = queueUndoableDelete({
                item: removed,
                index,
                stateKey: 'consumption',
                endpoint: `/alcohol-consumption/${id}`,
                pendingMessage: 'Consumption record removed',
                successMessage: 'Consumption record deleted.',
                trailLabel: 'Deleted a consumption record'
            });

            if (!queued) {
                dashboardState.consumption.splice(index, 0, removed);
                renderDashboard();
            }
        });
    });
}

function renderResourcesSection() {
    const resources = dashboardState.resources || [];
    const element = document.getElementById('resources');
    if (!element) return;

    element.innerHTML = `
        <h2 class="section-title">Resources</h2>
        ${resources.length ? `
            <ul class="item-list">
                ${resources.slice(0, 6).map((resource) => `
                    <li>
                        <strong>${escapeHtml(resource.title || 'Resource')}</strong><br>
                        <span>${escapeHtml(resource.description || resource.link || 'No details available')}</span>
                        <div class="item-actions">
                            <button class="tiny-btn danger" type="button" data-action="delete-resource" data-resourceid="${resource.resource_id}">Delete</button>
                        </div>
                    </li>
                `).join('')}
            </ul>
        ` : '<p class="empty-state">No resources found yet.</p>'}
    `;

    document.querySelectorAll('[data-action="delete-resource"]').forEach((button) => {
        button.addEventListener('click', async () => {
            const id = Number(button.getAttribute('data-resourceid'));
            const index = dashboardState.resources.findIndex((item) => item.resource_id === id);
            if (index < 0) return;

            const [removed] = dashboardState.resources.splice(index, 1);
            renderDashboard();

            const queued = queueUndoableDelete({
                item: removed,
                index,
                stateKey: 'resources',
                endpoint: `/resources/${id}`,
                pendingMessage: 'Resource removed',
                successMessage: 'Resource deleted.',
                trailLabel: 'Deleted a resource'
            });

            if (!queued) {
                dashboardState.resources.splice(index, 0, removed);
                renderDashboard();
            }
        });
    });
}

function renderDashboard() {
    const { user, goals, assessments, consumption, resources } = dashboardState;

    renderOverviewSection();

    document.getElementById('summaryCards').innerHTML = [
        metricCard('Profile', user?.name || 'User'),
        metricCard('Goals', goals.length),
        metricCard('Consumption Logs', consumption.length),
        metricCard('Assessments', assessments.length)
    ].join('');

    renderGoalsSection();
    renderAssessmentsSection();
    renderConsumptionSection();
    renderResourcesSection();
}

function resetGoalForm() {
    const form = document.getElementById('goalForm');
    if (!form) return;
    form.reset();
    document.getElementById('goalId').value = '';
}

function resetAssessmentForm() {
    const form = document.getElementById('assessmentForm');
    if (!form) return;
    form.reset();
    document.getElementById('assessmentId').value = '';
}

function bindGoalForm() {
    const form = document.getElementById('goalForm');
    const cancelButton = document.getElementById('goalCancelEdit');
    if (!form || !cancelButton) return;

    cancelButton.addEventListener('click', resetGoalForm);

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const token = localStorage.getItem('token');
        const goalId = document.getElementById('goalId').value;
        const title = document.getElementById('goalTitle').value.trim();
        const payload = {
            title,
            status: document.getElementById('goalStatus').value,
            end_date: document.getElementById('goalEndDate').value || null,
            description: document.getElementById('goalDescription').value.trim()
        };

        if (!title) {
            showFlash('Goal title is required.', 'error');
            return;
        }

        const duplicateTitle = dashboardState.goals
            .some((goal) => goal.goal_id !== Number(goalId || 0) && String(goal.title || '').toLowerCase() === title.toLowerCase());
        if (duplicateTitle) {
            showFlash('A goal with this title already exists.', 'error');
            return;
        }

        const endpoint = goalId ? `/goals/${goalId}` : '/goals';
        const method = goalId ? 'PUT' : 'POST';

        const previous = [...dashboardState.goals];
        if (!goalId) {
            dashboardState.goals = [
                {
                    goal_id: Date.now() * -1,
                    title: payload.title,
                    status: payload.status,
                    end_date: payload.end_date,
                    description: payload.description,
                    createdAt: new Date().toISOString()
                },
                ...dashboardState.goals
            ];
            renderDashboard();
        }

        setFormBusy(form, true, goalId ? 'Updating...' : 'Saving...');
        const result = await sendJson(endpoint, method, token, payload);
        setFormBusy(form, false);

        if (!result.ok) {
            dashboardState.goals = previous;
            renderDashboard();
            showFlash(result.message || 'Failed to save goal', 'error');
            return;
        }

        addTrailEntry(goalId ? 'Updated a goal' : 'Created a goal');
        showFlash(goalId ? 'Goal updated.' : 'Goal created.');
        await loadDashboard();
    });

    const showMore = document.getElementById('goalsShowMore');
    if (showMore) {
        showMore.addEventListener('click', () => {
            uiState.goalsVisible += 6;
            renderGoalsSection();
        });
    }

    document.querySelectorAll('[data-action="edit-goal"]').forEach((button) => {
        button.addEventListener('click', () => {
            const goalId = Number(button.getAttribute('data-goalid'));
            const goal = dashboardState.goals.find((item) => item.goal_id === goalId);
            if (!goal) return;

            document.getElementById('goalId').value = String(goal.goal_id);
            document.getElementById('goalTitle').value = goal.title || '';
            document.getElementById('goalStatus').value = goal.status || 'planned';
            document.getElementById('goalEndDate').value = goal.end_date ? new Date(goal.end_date).toISOString().slice(0, 10) : '';
            document.getElementById('goalDescription').value = goal.description || '';
            form.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    });

    document.querySelectorAll('[data-action="delete-goal"]').forEach((button) => {
        button.addEventListener('click', async () => {
            const goalId = Number(button.getAttribute('data-goalid'));
            const targetGoal = dashboardState.goals.find((item) => item.goal_id === goalId);
            if (!targetGoal) return;

            const shouldDelete = window.confirm(`Delete goal "${targetGoal.title || 'Untitled'}"? You can undo for 5 seconds.`);
            if (!shouldDelete) return;

            const index = dashboardState.goals.findIndex((item) => item.goal_id === goalId);
            if (index < 0) return;

            const [removed] = dashboardState.goals.splice(index, 1);
            renderDashboard();

            const queued = queueUndoableDelete({
                item: removed,
                index,
                stateKey: 'goals',
                endpoint: `/goals/${goalId}`,
                pendingMessage: 'Goal removed',
                successMessage: 'Goal deleted.',
                trailLabel: 'Deleted a goal'
            });

            if (!queued) {
                dashboardState.goals.splice(index, 0, removed);
                renderDashboard();
            }
        });
    });
}

function bindAssessmentForm() {
    const form = document.getElementById('assessmentForm');
    const cancelButton = document.getElementById('assessmentCancelEdit');
    if (!form || !cancelButton) return;

    cancelButton.addEventListener('click', resetAssessmentForm);

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const token = localStorage.getItem('token');
        const assessmentId = document.getElementById('assessmentId').value;
        const score = Number(document.getElementById('assessmentScore').value);
        const payload = {
            date: document.getElementById('assessmentDate').value,
            risk_level: document.getElementById('assessmentRisk').value,
            scores: score,
            notes: document.getElementById('assessmentNotes').value.trim()
        };

        if (!payload.date) {
            showFlash('Assessment date is required.', 'error');
            return;
        }

        if (Number.isNaN(score) || score < 0 || score > 10) {
            showFlash('Assessment score must be between 0 and 10.', 'error');
            return;
        }

        const endpoint = assessmentId ? `/self-assessment/${assessmentId}` : '/self-assessment';
        const method = assessmentId ? 'PUT' : 'POST';

        const previous = [...dashboardState.assessments];
        if (!assessmentId) {
            dashboardState.assessments = [
                {
                    assessment_id: Date.now() * -1,
                    date: payload.date,
                    risk_level: payload.risk_level,
                    scores: payload.scores,
                    notes: payload.notes,
                    createdAt: new Date().toISOString()
                },
                ...dashboardState.assessments
            ];
            renderDashboard();
        }

        setFormBusy(form, true, assessmentId ? 'Updating...' : 'Saving...');
        const result = await sendJson(endpoint, method, token, payload);
        setFormBusy(form, false);

        if (!result.ok) {
            dashboardState.assessments = previous;
            renderDashboard();
            showFlash(result.message || 'Failed to save assessment', 'error');
            return;
        }

        addTrailEntry(assessmentId ? 'Updated an assessment' : 'Created an assessment');
        showFlash(assessmentId ? 'Assessment updated.' : 'Assessment saved.');
        await loadDashboard();
    });

    const showMore = document.getElementById('assessmentsShowMore');
    if (showMore) {
        showMore.addEventListener('click', () => {
            uiState.assessmentsVisible += 6;
            renderAssessmentsSection();
        });
    }

    document.querySelectorAll('[data-action="edit-assessment"]').forEach((button) => {
        button.addEventListener('click', () => {
            const assessmentId = Number(button.getAttribute('data-assessmentid'));
            const assessment = dashboardState.assessments.find((item) => item.assessment_id === assessmentId);
            if (!assessment) return;

            document.getElementById('assessmentId').value = String(assessment.assessment_id);
            document.getElementById('assessmentDate').value = assessment.date ? new Date(assessment.date).toISOString().slice(0, 10) : '';
            document.getElementById('assessmentRisk').value = assessment.risk_level || 'low';
            document.getElementById('assessmentScore').value = Number(assessment.scores || 0);
            document.getElementById('assessmentNotes').value = assessment.notes || '';
            form.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    });

    document.querySelectorAll('[data-action="delete-assessment"]').forEach((button) => {
        button.addEventListener('click', async () => {
            const assessmentId = Number(button.getAttribute('data-assessmentid'));
            const assessment = dashboardState.assessments.find((item) => item.assessment_id === assessmentId);
            if (!assessment) return;

            const shouldDelete = window.confirm(`Delete assessment from ${safeDate(assessment.date || assessment.createdAt)}? You can undo for 5 seconds.`);
            if (!shouldDelete) return;

            const index = dashboardState.assessments.findIndex((item) => item.assessment_id === assessmentId);
            if (index < 0) return;

            const [removed] = dashboardState.assessments.splice(index, 1);
            renderDashboard();

            const queued = queueUndoableDelete({
                item: removed,
                index,
                stateKey: 'assessments',
                endpoint: `/self-assessment/${assessmentId}`,
                pendingMessage: 'Assessment removed',
                successMessage: 'Assessment deleted.',
                trailLabel: 'Deleted an assessment'
            });

            if (!queued) {
                dashboardState.assessments.splice(index, 0, removed);
                renderDashboard();
            }
        });
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

    dashboardState = {
        user: userResult.data || {},
        goals: normalizeArray(goalsResult),
        consumption: normalizeArray(consumptionResult),
        assessments: normalizeArray(assessmentsResult),
        resources: normalizeArray(resourcesResult)
    };

    renderDashboard();
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
