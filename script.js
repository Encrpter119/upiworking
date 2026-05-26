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
        icon: 'paytmlogo.png',
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
        name: 'super.money',
        icon: 'supermoney.jpg',
        links: [
            'https://link.super.money/fA3GYpgbyVb',
            'https://link.super.money/ZsgcLKVBRZb',
            'https://link.super.money/ZsgcLKVBRZb'
        ],
        readonly: true
    },
    {
        id: 'slice',
        name: 'slice',
        icon: 'slice.png',
        link: 'https://slice.bank.in/t?c=vv2GKIx&ic=MOHAM7011444',
        code: '&MOHAM7011444',
        promoText: 'Get cashback on your first UPI/credit payment',
        readonly: true
    }
];

// Deep clone of apps array to keep track of default links/codes
const defaultApps = JSON.parse(JSON.stringify(apps));

// Get referral code, prioritizing hardcoded default codes when the link is unchanged
const getAppCode = (app, linkIndex = null) => {
    if (app.links && linkIndex !== null) {
        return extractReferralCode(app.links[linkIndex], app.id);
    }
    
    const defaultApp = defaultApps.find(a => a.id === app.id);
    
    // If link matches the default, prioritize the default hardcoded code
    if (defaultApp && app.link === defaultApp.link && defaultApp.code) {
        return defaultApp.code;
    }
    
    // Otherwise extract dynamically from user link
    const extracted = extractReferralCode(app.link, app.id);
    if (extracted) {
        return extracted;
    }
    
    // Fallback to default code if extraction fails
    if (defaultApp && defaultApp.code) {
        return defaultApp.code;
    }
    
    return '';
};

// Load saved links from localStorage
const loadSavedLinks = () => {
    const saved = localStorage.getItem('referralLinks');
    if (saved) {
        const parsed = JSON.parse(saved);
        apps.forEach(app => {
            if (app.readonly) return; // Read-only links should not be overwritten
            if (parsed[app.id] !== undefined) {
                if (app.links && Array.isArray(parsed[app.id])) {
                    app.links = parsed[app.id];
                } else if (app.links && typeof parsed[app.id] === 'string') {
                    app.links[0] = parsed[app.id];
                } else {
                    app.link = parsed[app.id];
                }
            }
        });
    }
};

// Save links to localStorage
const saveLinks = () => {
    const linksToSave = {};
    apps.forEach(app => {
        if (app.readonly) return; // Do not save read-only links to localStorage
        if (app.links) {
            linksToSave[app.id] = app.links;
        } else {
            linksToSave[app.id] = app.link;
        }
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
const saveBtn = document.getElementById('save-link');
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

const extractReferralCode = (urlStr, appId) => {
    if (!urlStr) return '';
    try {
        const urlClean = urlStr.trim();
        // If it's not a URL, it might just be the raw referral code itself
        if (!urlClean.startsWith('http://') && !urlClean.startsWith('https://')) {
            if (urlClean.length > 0 && urlClean.length <= 15 && !urlClean.includes('.') && !urlClean.includes('/')) {
                let code = urlClean;
                if (appId === 'slice' && !code.startsWith('&')) {
                    code = '&' + code;
                }
                return code;
            }
            return '';
        }
        
        const url = new URL(urlClean);
        
        // 1. Try to find code in common query parameters
        const queryParams = ['ic', 'code', 'referralCode', 'referral_code', 'ref', 'r', 'invite', 'inviteCode', 'invite_code', 'c'];
        for (const param of queryParams) {
            let val = url.searchParams.get(param);
            if (val) {
                if (appId === 'slice' && !val.startsWith('&')) {
                    val = '&' + val;
                }
                return val;
            }
        }
        
        // 2. Try to extract from path segments
        const pathSegments = url.pathname.split('/').filter(seg => seg.length > 0);
        if (pathSegments.length > 0) {
            const lastSegment = pathSegments[pathSegments.length - 1];
            
            // Exclude generic words
            const genericWords = ['app', 'invite', 'referral', 'download', 'share', 'signup', 'register', 'home', 'main'];
            if (!genericWords.includes(lastSegment.toLowerCase())) {
                let code = lastSegment;
                if (lastSegment.toLowerCase().startsWith('invite-')) {
                    code = lastSegment.substring(7);
                }
                if (appId === 'slice' && !code.startsWith('&')) {
                    code = '&' + code;
                }
                return code;
            }
            
            if (pathSegments.length > 1) {
                const prevSegment = pathSegments[pathSegments.length - 2];
                if (!genericWords.includes(prevSegment.toLowerCase())) {
                    let code = prevSegment;
                    if (appId === 'slice' && !code.startsWith('&')) {
                        code = '&' + code;
                    }
                    return code;
                }
            }
        }
    } catch (e) {
        console.error('Failed to parse URL for code extraction:', e);
    }
    return '';
};

const renderGrid = () => {
    grid.innerHTML = '';
    apps.forEach(app => {
        const card = document.createElement('div');
        card.className = 'card';
        card.onclick = () => {
            if (app.links) {
                openModal(app);
            } else if (app.link && app.link.trim() !== '') {
                window.open(app.link, '_blank');
            } else {
                openModal(app);
            }
        };
        
        let hasLink = false;
        let statusText = 'No Link Yet';
        if (app.links) {
            const addedCount = app.links.filter(l => l && l.trim() !== '').length;
            if (addedCount > 0) {
                statusText = `${addedCount}/3 Links Added`;
                hasLink = true;
            }
        } else if (app.link && app.link.trim() !== '') {
            statusText = 'Link Added';
            hasLink = true;
        }
        
        // Extract referral codes dynamically
        let codes = [];
        if (app.links) {
            // For multi-link apps (super.money), we do NOT render codes on the card,
            // they are visible inside the modal popup when clicked.
        } else {
            const codeVal = getAppCode(app);
            if (codeVal) {
                codes.push({
                    code: codeVal,
                    label: 'Code',
                    promoText: app.promoText || 'Get rewards on signup'
                });
            }
        }
        
        let codeButtonsHtml = '';
        if (codes.length > 0) {
            codeButtonsHtml = `<div class="card-codes-container">`;
            codes.forEach(c => {
                codeButtonsHtml += `
                    <button class="card-code-btn" title="Click to copy code" data-code="${c.code}">
                        <span class="code-value">${c.label}: ${c.code}</span>
                        <span class="code-promo">${c.promoText}</span>
                    </button>
                `;
            });
            codeButtonsHtml += `</div>`;
        }
        
        let viewLinksButtonHtml = '';
        if (app.links) {
            viewLinksButtonHtml = `
                <button class="card-view-links-btn">
                    View Links
                </button>
            `;
        }
        
        let bottomContentHtml = '';
        if (codeButtonsHtml || viewLinksButtonHtml) {
            bottomContentHtml = `
                <div class="card-bottom-wrapper">
                    ${codeButtonsHtml}
                    ${viewLinksButtonHtml}
                </div>
            `;
        }
        
        card.innerHTML = `
            <div class="card-icon">
                <img src="${app.icon}" alt="${app.name} icon" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMzMzMiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIvPjxsaW5lIHgxPSIxMiIgeTE9IjgiIHgyPSIxMiIgeTI9IjEyIi8+PGxpbmUgeDE9IjEyIiB5MT0iMTYiIHgyPSIxMi4wMSIgeTI9IjE2Ii8+PC9zdmc+'">
            </div>
            <h2 class="card-title">${app.name}</h2>
            <span class="card-status ${hasLink ? 'active' : ''}">
                ${statusText}
            </span>
            ${bottomContentHtml}
        `;
        
        // Bind copy click listeners to dynamically created code buttons
        const codeBtns = card.querySelectorAll('.card-code-btn');
        codeBtns.forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const codeVal = btn.getAttribute('data-code');
                navigator.clipboard.writeText(codeVal).then(() => {
                    const originalHtml = btn.innerHTML;
                    btn.innerHTML = `
                        <span class="code-value" style="color: #065f46;">Copied!</span>
                        <span class="code-promo" style="color: #065f46;">Code copied to clipboard</span>
                    `;
                    btn.style.borderColor = '#059669';
                    btn.style.background = '#d1fae5';
                    setTimeout(() => {
                        btn.innerHTML = originalHtml;
                        btn.style.borderColor = '';
                        btn.style.background = '';
                    }, 2000);
                });
            };
        });
        
        grid.appendChild(card);
    });
};

const openModal = (app) => {
    currentEditingApp = app;
    modalIcon.src = app.icon;
    modalTitle.textContent = app.name;
    feedbackMsg.textContent = '';
    
    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = '';
    
    // Set the save/close button text appropriately to Close since editing is disabled
    saveBtn.textContent = 'Close';
    
    if (app.links) {
        // App has multiple links
        const labels = ['super card Referral Link (Link 1)', '5 registrations Referral Link (Link 2)', 'UPI Referral Link (Link 3)'];
        app.links.forEach((linkVal, index) => {
            const group = document.createElement('div');
            group.className = 'input-group';
            const codeVal = getAppCode(app, index);
            
            group.innerHTML = `
                <label for="referral-link-${index}">${labels[index] || `Referral Link ${index + 1}`}</label>
                <div class="input-with-actions">
                    <input type="text" id="referral-link-${index}" value="${linkVal || ''}" placeholder="Link ${index + 1}" readonly style="color: var(--text-secondary); background: #e2e8f0; cursor: not-allowed;">
                    ${codeVal ? `
                    <button class="icon-btn copy-code-btn" title="Copy Code: ${codeVal}" type="button" data-code="${codeVal}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path></svg>
                    </button>
                    ` : ''}
                    <button class="icon-btn copy-btn" title="Copy Link" type="button">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                    </button>
                    <button class="icon-btn open-btn" title="Open Link" type="button">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                    </button>
                </div>
                ${codeVal ? `
                <div class="modal-code-info" style="margin-top: 0.5rem; font-size: 0.85rem; color: var(--text-secondary);">
                    Referral Code: <strong style="color: var(--accent); font-family: monospace; font-size: 0.95rem;">${codeVal}</strong>
                </div>
                ` : ''}
            `;
            
            const copyBtn = group.querySelector('.copy-btn');
            copyBtn.onclick = () => {
                const input = group.querySelector('input');
                const val = input.value.trim();
                if (val) {
                    navigator.clipboard.writeText(val).then(() => {
                        showFeedback(`Link ${index + 1} copied to clipboard!`);
                    }).catch(() => {
                        showFeedback('Failed to copy', true);
                    });
                } else {
                    showFeedback(`No Link ${index + 1} to copy`, true);
                }
            };
            
            const openBtn = group.querySelector('.open-btn');
            openBtn.onclick = () => {
                const input = group.querySelector('input');
                const val = input.value.trim();
                if (val) {
                    window.open(val, '_blank');
                } else {
                    showFeedback(`No Link ${index + 1} to open`, true);
                }
            };
            
            const copyCodeBtn = group.querySelector('.copy-code-btn');
            if (copyCodeBtn) {
                copyCodeBtn.onclick = () => {
                    navigator.clipboard.writeText(codeVal).then(() => {
                        showFeedback('Code copied to clipboard!');
                    }).catch(() => {
                        showFeedback('Failed to copy', true);
                    });
                };
            }
            
            modalBody.appendChild(group);
        });
    } else {
        // Single link app
        const group = document.createElement('div');
        group.className = 'input-group';
        const codeVal = getAppCode(app);
        
        group.innerHTML = `
            <label for="referral-link">Your Referral Link</label>
            <div class="input-with-actions">
                <input type="text" id="referral-link" value="${app.link || ''}" placeholder="Link" readonly style="color: var(--text-secondary); background: #e2e8f0; cursor: not-allowed;">
                ${codeVal ? `
                <button class="icon-btn copy-code-btn" title="Copy Code: ${codeVal}" type="button" data-code="${codeVal}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path></svg>
                </button>
                ` : ''}
                <button class="icon-btn copy-btn" title="Copy Link" type="button">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                </button>
                <button class="icon-btn open-btn" title="Open Link" type="button">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                </button>
            </div>
            ${codeVal ? `
            <div class="modal-code-info" style="margin-top: 0.5rem; font-size: 0.85rem; color: var(--text-secondary);">
                Referral Code: <strong style="color: var(--accent); font-family: monospace; font-size: 0.95rem;">${codeVal}</strong>
            </div>
            ` : ''}
        `;
        
        const copyBtn = group.querySelector('.copy-btn');
        copyBtn.onclick = () => {
            const input = group.querySelector('input');
            const val = input.value.trim();
            if (val) {
                navigator.clipboard.writeText(val).then(() => {
                    showFeedback('Link copied to clipboard!');
                }).catch(() => {
                    showFeedback('Failed to copy', true);
                });
            } else {
                showFeedback('No link to copy', true);
            }
        };
        
        const openBtn = group.querySelector('.open-btn');
        openBtn.onclick = () => {
            const input = group.querySelector('input');
            const val = input.value.trim();
            if (val) {
                window.open(val, '_blank');
            } else {
                showFeedback('No link to open', true);
            }
        };
        
        const copyCodeBtn = group.querySelector('.copy-code-btn');
        if (copyCodeBtn) {
            copyCodeBtn.onclick = () => {
                navigator.clipboard.writeText(codeVal).then(() => {
                    showFeedback('Code copied to clipboard!');
                }).catch(() => {
                    showFeedback('Failed to copy', true);
                });
            };
        }
        
        modalBody.appendChild(group);
    }
    
    modal.classList.add('active');
    
    const firstInput = modalBody.querySelector('input');
    if (firstInput) {
        setTimeout(() => firstInput.focus(), 100);
    }
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

saveBtn.addEventListener('click', closeModal);

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
