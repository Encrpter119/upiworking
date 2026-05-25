const apps = [
    {
        id: 'phonepe',
        name: 'PhonePe',
        icon: 'phonelogo.jpg',
        link: 'https://phon.pe/v6r5u490',
        code: 'v6r5u490',
        promoText: 'Get rewards on first money transfer'
    },
    {
        id: 'paytm',
        name: 'Paytm',
        icon: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Paytm_Logo_%28standalone%29.svg',
        link: 'https://p.paytm.me/xCTH/l09z4k8v?utmt=052320',
        code: '7006780939',
        promoText: 'Get cashback on your first UPI transaction'
    },
    {
        id: 'gpay',
        name: 'Google Pay',
        icon: 'https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg',
        link: 'https://gpay.app.goo.gl/invite-ac8sh0t'
    },
    {
        id: 'bhim',
        name: 'BHIM UPI',
        icon: 'bhimupi.png',
        link: 'https://bhimnpci.page.link/app',
        code: 'Cdmbj5',
        promoText: 'Get 50% cashback on first transaction'
    },
    {
        id: 'navi',
        name: 'Navi',
        icon: 'naviupi.png',
        link: 'https://r.navi.com/hdtb4C',
        code: 'hf5RvG',
        promoText: 'Get flat cashback or rewards on signup'
    },
    {
        id: 'superupi',
        name: 'Super UPI',
        icon: 'https://logo.clearbit.com/super.money',
        link: ''
    }
];

// Load saved links from localStorage
const loadSavedLinks = () => {
    const saved = localStorage.getItem('referralLinks');
    if (saved) {
        const parsed = JSON.parse(saved);
        apps.forEach(app => {
            if (parsed[app.id]) {
                app.link = parsed[app.id];
            }
        });
    }
};

// Save links to localStorage
const saveLinks = () => {
    const linksToSave = {};
    apps.forEach(app => {
        linksToSave[app.id] = app.link;
    });
    localStorage.setItem('referralLinks', JSON.stringify(linksToSave));
};

let currentEditingApp = null;
let submissions = [];

const grid = document.getElementById('referral-grid');
const modal = document.getElementById('modal');
const closeModalBtn = document.getElementById('close-modal');
const modalIcon = document.getElementById('modal-icon');
const modalTitle = document.getElementById('modal-title');
const linkInput = document.getElementById('referral-link');
const saveBtn = document.getElementById('save-link');
const copyBtn = document.getElementById('copy-link');
const feedbackMsg = document.getElementById('feedback-msg');

// Form elements
const submitType = document.getElementById('submit-type');
const groupAppName = document.getElementById('group-app-name');
const groupAppLink = document.getElementById('group-app-link');
const groupMessage = document.getElementById('group-message');
const appNameInput = document.getElementById('app-name');
const appLinkInput = document.getElementById('app-link');
const messageInput = document.getElementById('message');
const userNameInput = document.getElementById('user-name');
const userEmailInput = document.getElementById('user-email');
const submissionForm = document.getElementById('submission-form');
const submitBtnText = document.querySelector('#submit-form-btn span');
const formFeedback = document.getElementById('form-feedback');
const submissionsHistory = document.getElementById('submissions-history');
const submissionList = document.getElementById('submission-list');
const clearSubmissionsBtn = document.getElementById('clear-submissions');

const renderGrid = () => {
    grid.innerHTML = '';
    apps.forEach(app => {
        const card = document.createElement('div');
        card.className = 'card';
        card.onclick = () => {
            if (app.link && app.link.trim() !== '') {
                window.open(app.link, '_blank');
            } else {
                openModal(app);
            }
        };
        
        const hasLink = app.link && app.link.trim() !== '';
        
        let codeButtonHtml = '';
        if (app.code) {
            codeButtonHtml = `
                <button class="card-code-btn" title="Click to copy code">
                    <span class="code-value">Code: ${app.code}</span>
                    <span class="code-promo">${app.promoText || 'Get rewards on signup'}</span>
                </button>
            `;
        }
        
        card.innerHTML = `
            <div class="card-icon">
                <img src="${app.icon}" alt="${app.name} icon" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMzMzMiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIvPjxsaW5lIHgxPSIxMiIgeTE9IjgiIHgyPSIxMiIgeTI9IjEyIi8+PGxpbmUgeDE9IjEyIiB5MT0iMTYiIHgyPSIxMi4wMSIgeTI9IjE2Ii8+PC9zdmc+'">
            </div>
            <h2 class="card-title">${app.name}</h2>
            <span class="card-status ${hasLink ? 'active' : ''}">
                ${hasLink ? 'Link Added' : 'No Link Yet'}
            </span>
            ${codeButtonHtml}
        `;
        
        if (app.code) {
            const codeBtn = card.querySelector('.card-code-btn');
            codeBtn.onclick = (e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(app.code).then(() => {
                    const originalHtml = codeBtn.innerHTML;
                    codeBtn.innerHTML = `
                        <span class="code-value" style="color: #065f46;">Copied!</span>
                        <span class="code-promo" style="color: #065f46;">Code copied to clipboard</span>
                    `;
                    codeBtn.style.borderColor = '#059669';
                    codeBtn.style.background = '#d1fae5';
                    setTimeout(() => {
                        codeBtn.innerHTML = originalHtml;
                        codeBtn.style.borderColor = '';
                        codeBtn.style.background = '';
                    }, 2000);
                });
            };
        }
        
        grid.appendChild(card);
    });
};

const openModal = (app) => {
    currentEditingApp = app;
    modalIcon.src = app.icon;
    modalTitle.textContent = app.name;
    linkInput.value = app.link || '';
    feedbackMsg.textContent = '';
    modal.classList.add('active');
    
    // Focus input with a slight delay for transition
    setTimeout(() => linkInput.focus(), 100);
};

const closeModal = () => {
    modal.classList.remove('active');
    setTimeout(() => {
        currentEditingApp = null;
    }, 300);
};

// Form Toggle Logic
submitType.addEventListener('change', () => {
    if (submitType.value === 'app-request') {
        groupAppName.style.display = 'flex';
        groupAppLink.style.display = 'flex';
        groupMessage.style.display = 'none';
        appNameInput.required = true;
        messageInput.required = false;
        submitBtnText.textContent = 'Submit Request';
    } else {
        groupAppName.style.display = 'none';
        groupAppLink.style.display = 'none';
        groupMessage.style.display = 'flex';
        appNameInput.required = false;
        messageInput.required = true;
        submitBtnText.textContent = 'Send Query';
    }
});

// Load Submissions History
const loadSubmissions = () => {
    const saved = localStorage.getItem('referralHubSubmissions');
    if (saved) {
        submissions = JSON.parse(saved);
    }
};

// Save Submissions History
const saveSubmissions = () => {
    localStorage.setItem('referralHubSubmissions', JSON.stringify(submissions));
};

// Render Submissions History
const renderSubmissions = () => {
    if (submissions.length === 0) {
        submissionsHistory.style.display = 'none';
        return;
    }
    
    submissionsHistory.style.display = 'block';
    submissionList.innerHTML = '';
    
    // Show latest submissions first
    [...submissions].reverse().forEach(sub => {
        const date = new Date(sub.timestamp).toLocaleDateString(undefined, {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
        
        const item = document.createElement('div');
        item.className = 'submission-item';
        
        const isApp = sub.type === 'app-request';
        const badgeClass = isApp ? 'app-request' : 'query';
        const badgeText = isApp ? 'App Request' : 'Query';
        
        let bodyContent = '';
        if (isApp) {
            bodyContent = `Requested App: <strong>${sub.appName}</strong>`;
            if (sub.appLink) {
                bodyContent += `<br>Link: <a href="${sub.appLink}" target="_blank" style="color: var(--accent); text-decoration: underline; word-break: break-all;">${sub.appLink}</a>`;
            }
        } else {
            bodyContent = `Message: <em>"${sub.message}"</em>`;
        }
        
        item.innerHTML = `
            <div class="submission-item-header">
                <span class="submission-badge ${badgeClass}">${badgeText}</span>
                <span class="submission-date">${date}</span>
            </div>
            <div class="submission-body">
                ${bodyContent}
            </div>
            <div class="submission-meta">
                Submitted by: ${sub.userName} (${sub.userEmail})
            </div>
        `;
        submissionList.appendChild(item);
    });
};

// Form Submission Event
submissionForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const type = submitType.value;
    const userName = userNameInput.value.trim();
    const userEmail = userEmailInput.value.trim();
    
    const newSubmission = {
        id: 'sub_' + Date.now(),
        type,
        userName,
        userEmail,
        timestamp: new Date().toISOString()
    };
    
    if (type === 'app-request') {
        const appName = appNameInput.value.trim();
        const appLink = appLinkInput.value.trim();
        if (!appName) {
            showFormFeedback('Please enter the App Name.', true);
            return;
        }
        newSubmission.appName = appName;
        newSubmission.appLink = appLink;
    } else {
        const message = messageInput.value.trim();
        if (!message) {
            showFormFeedback('Please enter a message or query.', true);
            return;
        }
        newSubmission.message = message;
    }
    
    submissions.push(newSubmission);
    saveSubmissions();
    renderSubmissions();
    
    // Clear inputs (except user details for convenience)
    appNameInput.value = '';
    appLinkInput.value = '';
    messageInput.value = '';
    
    showFormFeedback('Thank you! Your submission has been saved successfully.');
});

const showFormFeedback = (msg, isError = false) => {
    formFeedback.textContent = msg;
    formFeedback.className = `form-feedback ${isError ? 'error' : 'success'}`;
    
    setTimeout(() => {
        formFeedback.className = 'form-feedback';
        formFeedback.textContent = '';
    }, 5000);
};

// Clear Submission History Event
clearSubmissionsBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear your submission history?')) {
        submissions = [];
        saveSubmissions();
        renderSubmissions();
    }
});

// Event Listeners
closeModalBtn.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});

saveBtn.addEventListener('click', () => {
    if (currentEditingApp) {
        currentEditingApp.link = linkInput.value.trim();
        saveLinks();
        renderGrid();
        showFeedback('Link saved successfully!');
    }
});

copyBtn.addEventListener('click', () => {
    const link = linkInput.value.trim();
    if (link) {
        navigator.clipboard.writeText(link).then(() => {
            showFeedback('Link copied to clipboard!');
        }).catch(err => {
            showFeedback('Failed to copy', true);
        });
    } else {
        showFeedback('No link to copy', true);
    }
});

const showFeedback = (msg, isError = false) => {
    feedbackMsg.textContent = msg;
    feedbackMsg.style.color = isError ? '#ef4444' : '#10b981';
    setTimeout(() => {
        feedbackMsg.textContent = '';
    }, 3000);
};

// Initialize
loadSavedLinks();
renderGrid();
loadSubmissions();
renderSubmissions();
