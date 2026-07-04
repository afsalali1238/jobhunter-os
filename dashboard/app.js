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
    
    const newJob = {
        id: Date.now().toString(),
        company,
        title,
        url,
        status,
        applyStatus: null,
        addedDate: new Date().toLocaleDateString()
    };
    
    jobs.push(newJob);
    saveData();
    addJobModal.classList.add('hidden');
    addJobForm.reset();
});

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
    if (job.url) window.open(job.url, '_blank');
    
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
            job.applyStatus = `✅ Applied ${today}`;
            job.status = 'Applied'; // Auto-move to Applied
        } else if (state === 'manual') {
            job.applyStatus = `⚠️ Manual Apply Required`;
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
    
    // Check if table header needs an update
    const theadTr = document.querySelector('thead tr');
    if (theadTr && theadTr.children.length === 5) {
        const applyTh = document.createElement('th');
        applyTh.textContent = 'Apply';
        theadTr.insertBefore(applyTh, theadTr.lastElementChild);
    }
    
    jobs.forEach(job => {
        const tr = document.createElement('tr');
        
        let applyHtml = '';
        if (!job.applyStatus) {
            applyHtml = `<button onclick="handleApply('${job.id}')" class="btn-primary" style="padding: 4px 10px; font-size: 0.75rem;">🚀 Apply</button>`;
        } else if (job.applyStatus.startsWith('✅')) {
            applyHtml = `<span style="color:var(--status-offer); font-weight:600; font-size:0.8rem;">${job.applyStatus}</span>`;
        } else if (job.applyStatus.startsWith('⚠️')) {
            applyHtml = `<span style="color:var(--status-applied); font-weight:600; font-size:0.8rem;">${job.applyStatus}</span> <button onclick="handleApply('${job.id}')" style="background:none;border:none;color:var(--accent);cursor:pointer;text-decoration:underline;font-size:0.75rem">Retry</button>`;
        }
        
        tr.innerHTML = `
            <td><strong>${job.company}</strong></td>
            <td><a href="${job.url || '#'}" target="_blank" style="color:var(--text); text-decoration:none;">${job.title}</a></td>
            <td><span class="status-badge badge-${job.status.replace(' ', '-')}">${job.status}</span></td>
            <td>${job.addedDate}</td>
            <td>${applyHtml}</td>
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
        const colJobs = jobs.filter(j => j.status === colName);
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
                <div class="job-card-company">${job.company}</div>
                <div class="job-card-title">${job.title}</div>
                <div class="job-card-meta">
                    <span><i class="fa-regular fa-calendar"></i> ${job.addedDate}</span>
                    <div class="job-actions">
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

importFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if(!file) return;
    
    const reader = new FileReader();
    reader.onload = function(evt) {
        try {
            const contents = JSON.parse(evt.target.result);
            if(contents.profile && contents.jobs) {
                profile = contents.profile;
                jobs = contents.jobs;
                saveData();
                alert("Data imported successfully!");
            } else {
                alert("Invalid format. Please upload a valid JobHunter OS export file.");
            }
        } catch (err) {
            alert("Error parsing file.");
        }
    };
    reader.readAsText(file);
});

// Run
init();
