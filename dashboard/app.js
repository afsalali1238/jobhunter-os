// --- STATE MANAGEMENT ---
let profile = JSON.parse(localStorage.getItem('jobHunterProfile')) || null;
let jobs = JSON.parse(localStorage.getItem('jobHunterData')) || [];

const COLUMNS = ['Scouted', 'CV Ready', 'Applied', 'Interviewing', 'Offer', 'Rejected'];

// --- DOM ELEMENTS ---
const onboardingModal = document.getElementById('onboarding-modal');
const onboardingForm = document.getElementById('onboarding-form');
const appContainer = document.getElementById('app-container');

const displayName = document.getElementById('display-name');
const greeting = document.getElementById('greeting');
const displayRoles = document.getElementById('display-roles');

const viewKanbanBtn = document.getElementById('toggle-kanban');
const viewTableBtn = document.getElementById('toggle-table');
const viewKanban = document.getElementById('view-kanban');
const viewTable = document.getElementById('view-table');

const addJobModal = document.getElementById('add-job-modal');
const addJobForm = document.getElementById('add-job-form');
const btnAddJob = document.getElementById('btn-add-job');
const closeAddJob = document.getElementById('close-add-job');

// Apply Dialog
const applyDialog = document.getElementById('apply-dialog');
const dialogCompany = document.getElementById('dialog-company');
const btnApplySuccess = document.getElementById('btn-apply-success');
const btnApplyManual = document.getElementById('btn-apply-manual');
const btnApplyCancel = document.getElementById('btn-apply-cancel');
let currentApplyJobId = null;

// KPI elements
const kpiTotal = document.getElementById('kpi-total');
const kpiApplied = document.getElementById('kpi-applied');
const kpiInterviewing = document.getElementById('kpi-interviewing');
const kpiOffers = document.getElementById('kpi-offers');

// Import / Export
const btnExport = document.getElementById('btn-export');
const btnImport = document.getElementById('btn-import');
const importFile = document.getElementById('import-file');
const onboardingImportLink = document.getElementById('onboarding-import-link');

// --- INITIALIZATION ---
function init() {
    if (!profile) {
        onboardingModal.classList.remove('hidden');
    } else {
        showApp();
    }
}

function showApp() {
    onboardingModal.classList.add('hidden');
    appContainer.classList.remove('hidden');

    // Set Profile Data
    displayName.textContent = profile.name;
    greeting.textContent = `Hello, ${profile.name}!`;
    displayRoles.textContent = profile.roles;

    renderApp();
}

function renderApp() {
    updateKPIs();
    renderKanban();
    renderTable();
}

function saveData() {
    localStorage.setItem('jobHunterProfile', JSON.stringify(profile));
    localStorage.setItem('jobHunterData', JSON.stringify(jobs));
    renderApp();
}

// --- EVENT LISTENERS ---
onboardingForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('user-name').value;
    const roles = document.getElementById('target-roles').value;

    profile = { name, roles, createdAt: new Date().toISOString() };
    saveData();
    showApp();
});

btnAddJob.addEventListener('click', () => addJobModal.classList.remove('hidden'));
closeAddJob.addEventListener('click', () => addJobModal.classList.add('hidden'));

addJobForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const company = document.getElementById('job-company').value;
    const title = document.getElementById('job-title').value;
    const url = document.getElementById('job-url').value;
    const status = document.getElementById('job-status').value;
    const scoreRaw = document.getElementById('job-score').value;
    const score = scoreRaw === '' ? null : Math.max(0, Math.min(100, parseInt(scoreRaw, 10)));
    const notes = (document.getElementById('job-notes') || {}).value || '';
    const interviewDate = (document.getElementById('job-interview-date') || {}).value || null;

    // Fix 5: Check for duplicate URL before adding (ignoring tracking query params/fragments)
    const normalizedUrl = normalizeUrl(url);
    if (normalizedUrl && jobs.some(j => normalizeUrl(j.url) === normalizedUrl)) {
        alert('A job with this URL already exists in your pipeline.');
        return;
    }

    const newJob = {
        id: Date.now().toString(),
        company,
        title,
        url,
        status,
        score,
        notes: notes || null,
        interviewDate: interviewDate || null,
        applyStatus: null,
        addedDate: new Date().toLocaleDateString()
    };

    jobs.push(newJob);
    saveData();
    addJobModal.classList.add('hidden');
    addJobForm.reset();
});

// --- URL SAFETY ---
// Leads can come from an imported JSON file the agent generated, so never trust a URL blindly —
// only allow http(s) links through to href/window.open. Blocks javascript:, data:, etc.
function safeUrl(url) {
    if (typeof url !== 'string') return null;
    const trimmed = url.trim();
    return /^https?:\/\//i.test(trimmed) ? trimmed : null;
}

// --- URL NORMALIZATION (for de-dup) ---
// Strips query string/fragment and a trailing slash before comparing, so the same posting
// re-listed with a different tracking param (?utm_source=...) is still caught as a duplicate.
// Mirrors excel/add_lead.py's normalize_url() so the dashboard and the Excel companion agree
// on what counts as "the same lead".
function normalizeUrl(url) {
    if (!url) return '';
    let u = url.trim().toLowerCase();
    try {
        const parsed = new URL(u);
        u = `${parsed.protocol}//${parsed.host}${parsed.pathname.replace(/\/$/, '')}`;
    } catch (e) {
        // Not a valid absolute URL — fall back to the raw trimmed/lowercased string.
    }
    return u;
}

// Same reasoning for text fields: escape before dropping into innerHTML so an imported
// lead can't smuggle in markup.
function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// --- FIT SCORE BADGE ---
// Bands mirror the score-fit skill: >=80 HOT, 70-79 Strong, 60-69 Consider, <60 Low.
function scoreBand(score) {
    if (score >= 80) return { label: 'HOT', cls: 'score-hot' };
    if (score >= 70) return { label: 'STRONG', cls: 'score-strong' };
    if (score >= 60) return { label: 'CONSIDER', cls: 'score-consider' };
    return { label: 'LOW', cls: 'score-low' };
}
function scoreBadgeHtml(score) {
    if (score === null || score === undefined || score === '') {
        return `<span class="score-badge score-none">&mdash;</span>`;
    }
    const band = scoreBand(score);
    return `<span class="score-badge ${band.cls}">${score} &middot; ${band.label}</span>`;
}

// View Toggles
viewKanbanBtn.addEventListener('click', () => {
    viewKanbanBtn.classList.add('active');
    viewTableBtn.classList.remove('active');
    viewKanban.classList.remove('hidden');
    viewTable.classList.add('hidden');
});

viewTableBtn.addEventListener('click', () => {
    viewTableBtn.classList.add('active');
    viewKanbanBtn.classList.remove('active');
    viewTable.classList.remove('hidden');
    viewKanban.classList.add('hidden');
});

// Delete Job
function deleteJob(id) {
    if(confirm("Are you sure you want to delete this job?")) {
        jobs = jobs.filter(j => j.id !== id);
        saveData();
    }
}

// Update Job Status
function updateJobStatus(id, newStatus) {
    const job = jobs.find(j => j.id === id);
    if(job && job.status !== newStatus) {
        job.status = newStatus;
        saveData();
    }
}

// Apply Job Functionality
window.handleApply = function(jobId) {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;

    currentApplyJobId = jobId;
    const url = safeUrl(job.url);
    if (url) window.open(url, '_blank', 'noopener,noreferrer');

    dialogCompany.textContent = job.company;
    setTimeout(() => {
        applyDialog.classList.remove('hidden');
    }, 1000);
};

btnApplyCancel.addEventListener('click', () => {
    applyDialog.classList.add('hidden');
    currentApplyJobId = null;
});

function markApplyState(state) {
    applyDialog.classList.add('hidden');
    const job = jobs.find(j => j.id === currentApplyJobId);
    if (job) {
        if (state === 'success') {
            const today = new Date().toLocaleDateString('en-GB',{day:'numeric',month:'short'});
            job.applyStatus = `Applied ${today}`;
            job.status = 'Applied'; // Auto-move to Applied
        } else if (state === 'manual') {
            job.applyStatus = `Manual Apply Required`;
        }
        saveData();
    }
    currentApplyJobId = null;
}

btnApplySuccess.addEventListener('click', () => markApplyState('success'));
btnApplyManual.addEventListener('click', () => markApplyState('manual'));

// --- RENDERING ---
function updateKPIs() {
    kpiTotal.textContent = jobs.length;
    kpiApplied.textContent = jobs.filter(j => j.status === 'Applied').length;
    kpiInterviewing.textContent = jobs.filter(j => j.status === 'Interviewing').length;
    kpiOffers.textContent = jobs.filter(j => j.status === 'Offer').length;
}

function renderTable() {
    const tbody = document.getElementById('table-body');
    tbody.innerHTML = '';

    jobs.forEach(job => {
        const tr = document.createElement('tr');

        let applyHtml = '';
        if (!job.applyStatus) {
            applyHtml = `<button onclick="handleApply('${job.id}')" class="btn-primary" style="padding: 4px 10px; font-size: 0.75rem;">Apply</button>`;
        } else if (job.applyStatus.startsWith('Applied')) {
            applyHtml = `<span style="color:var(--status-offer); font-weight:600; font-size:0.8rem;">${escapeHtml(job.applyStatus)}</span>`;
        } else if (job.applyStatus.startsWith('Manual')) {
            applyHtml = `<span style="color:var(--status-applied); font-weight:600; font-size:0.8rem;">${escapeHtml(job.applyStatus)}</span> <button onclick="handleApply('${job.id}')" style="background:none;border:none;color:var(--accent);cursor:pointer;text-decoration:underline;font-size:0.75rem">Retry</button>`;
        }

        const jobUrl = safeUrl(job.url);
        const safeTitle = escapeHtml(job.title);
        const titleHtml = jobUrl
            ? `<a href="${jobUrl}" target="_blank" rel="noopener noreferrer" style="color:var(--text); text-decoration:none;">${safeTitle}</a>`
            : `<span>${safeTitle}</span>`;

        const notesHtml = job.notes
            ? `<span class="notes-truncated" title="${escapeHtml(job.notes)}">${escapeHtml(job.notes)}</span>`
            : '<span style="color:var(--text-muted)">—</span>';

        tr.innerHTML = `
            <td><strong>${escapeHtml(job.company)}</strong></td>
            <td>${titleHtml}</td>
            <td>${scoreBadgeHtml(job.score)}</td>
            <td><span class="status-badge badge-${job.status.replace(' ', '-')}">${escapeHtml(job.status)}</span></td>
            <td>${escapeHtml(job.addedDate)}</td>
            <td>${applyHtml}</td>
            <td>${notesHtml}</td>
            <td>
                <button class="btn-icon" onclick="deleteJob('${job.id}')"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function renderKanban() {
    viewKanban.innerHTML = '';

    COLUMNS.forEach(colName => {
        const colJobs = jobs
            .filter(j => j.status === colName)
            .sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
        const colDiv = document.createElement('div');
        const colClassSafe = colName.toLowerCase().replace(' ', '-');
        colDiv.className = `kanban-col col-${colClassSafe}`;
        colDiv.dataset.status = colName;

        colDiv.innerHTML = `
            <div class="col-header">
                <span>${colName}</span>
                <span class="col-count">${colJobs.length}</span>
            </div>
            <div class="col-body" id="col-${colClassSafe}">
            </div>
        `;

        viewKanban.appendChild(colDiv);

        const colBody = colDiv.querySelector('.col-body');

        colJobs.forEach(job => {
            const card = document.createElement('div');
            card.className = 'job-card';
            card.dataset.id = job.id;
            card.innerHTML = `
                <div class="job-card-top">
                    <div class="job-card-company">${escapeHtml(job.company)}</div>
                    ${scoreBadgeHtml(job.score)}
                </div>
                <div class="job-card-title">${escapeHtml(job.title)}</div>
                ${job.interviewDate ? `<div class="interview-date"><i class="fa-regular fa-calendar-check"></i> Interview: ${escapeHtml(job.interviewDate)}</div>` : ''}
                <div class="job-card-meta">
                    <span><i class="fa-regular fa-calendar"></i> ${escapeHtml(job.addedDate)}</span>
                    <div class="job-actions">
                        ${!job.applyStatus ? `<button onclick="handleApply('${job.id}')" title="Apply"><i class="fa-solid fa-arrow-up-right-from-square"></i></button>` : ''}
                        <button onclick="deleteJob('${job.id}')"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>
            `;
            colBody.appendChild(card);
        });

        // Initialize Sortable
        if (typeof Sortable !== 'undefined') {
            new Sortable(colBody, {
                group: 'shared',
                animation: 150,
                ghostClass: 'sortable-ghost',
                onEnd: function (evt) {
                    const itemEl = evt.item;
                    const jobId = itemEl.dataset.id;
                    const newStatus = evt.to.closest('.kanban-col').dataset.status;
                    updateJobStatus(jobId, newStatus);
                },
            });
        }
    });
}

// --- EXPORT & IMPORT ---
btnExport.addEventListener('click', () => {
    const data = {
        profile,
        jobs,
        exportedAt: new Date().toISOString()
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `JobHunter_Export_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
});

btnImport.addEventListener('click', () => {
    importFile.click();
});

if (onboardingImportLink) {
    onboardingImportLink.addEventListener('click', (e) => {
        e.preventDefault();
        importFile.click();
    });
}

importFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if(!file) return;

    const reader = new FileReader();
    reader.onload = function(evt) {
        try {
            const contents = JSON.parse(evt.target.result);
            // Fix 3: Accept profile:null (agent writes "profile": null in scraped_leads.json)
            if(contents.jobs && Array.isArray(contents.jobs)) {
                // Fix 2: Use import profile only if we don't already have one
                if(!profile && contents.profile) {
                    profile = contents.profile;
                }

                // Fix 2 + 5: Merge new jobs, deduplicating by URL (ignoring tracking query params)
                const existingUrls = new Set(jobs.map(j => normalizeUrl(j.url)));
                let added = 0;
                let skipped = 0;
                contents.jobs.forEach(newJob => {
                    const normalized = normalizeUrl(newJob.url);
                    if (normalized && existingUrls.has(normalized)) {
                        skipped++;
                    } else {
                        // Ensure imported jobs have an id
                        if (!newJob.id) newJob.id = Date.now().toString() + Math.random().toString(36).slice(2, 6);
                        jobs.push(newJob);
                        if (normalized) existingUrls.add(normalized);
                        added++;
                    }
                });

                saveData();
                // If this import came from the onboarding "import instead" link and it carried
                // a real profile, complete onboarding now instead of leaving the modal up.
                if (profile && appContainer.classList.contains('hidden')) {
                    showApp();
                }
                alert(`Imported ${added} new job${added !== 1 ? 's' : ''}${skipped > 0 ? ` (${skipped} duplicate${skipped !== 1 ? 's' : ''} skipped)` : ''}.`);
            } else {
                alert("Invalid format. Expected a JSON file with a 'jobs' array.");
            }
        } catch (err) {
            alert("Error parsing file: " + err.message);
        }
    };
    reader.readAsText(file);
});

// Run
init();
