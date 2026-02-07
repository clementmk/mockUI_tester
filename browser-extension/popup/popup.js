// Load recent tests when popup opens
document.addEventListener('DOMContentLoaded', () => {
    loadRecentTests();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Quick test scenario buttons
    document.querySelectorAll('.btn-scenario').forEach(btn => {
        btn.addEventListener('click', () => {
            const scenario = btn.dataset.scenario;
            startQuickTest(scenario);
        });
    });

    // Open dashboard button
    document.getElementById('openDashboard').addEventListener('click', () => {
        chrome.runtime.sendMessage({ action: 'openDashboard' });
        window.close();
    });

    // Custom test button
    document.getElementById('customTest').addEventListener('click', () => {
        chrome.runtime.sendMessage({ action: 'openDashboard' });
        window.close();
    });
}

// Load recent tests from storage
async function loadRecentTests() {
    const response = await chrome.runtime.sendMessage({ action: 'getRecentTests' });
    const tests = response.tests || [];
    
    const container = document.getElementById('recentTests');
    const countBadge = document.getElementById('testCount');
    
    countBadge.textContent = tests.length;
    
    if (tests.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <span class="emoji">📊</span>
                <p>No tests yet</p>
                <small>Start a test to see it here</small>
            </div>
        `;
        return;
    }
    
    container.innerHTML = tests.map(test => createTestItem(test)).join('');
    
    // Add click listeners to test items
    document.querySelectorAll('.test-item').forEach(item => {
        item.addEventListener('click', () => {
            const testId = item.dataset.testId;
            openTestDetails(testId);
        });
    });
}

// Create test item HTML
function createTestItem(test) {
    const statusClass = test.status.toLowerCase();
    const timeAgo = getTimeAgo(test.timestamp);
    const emoji = getScenarioEmoji(test.scenario);
    
    return `
        <div class="test-item" data-test-id="${test.id}">
            <div class="test-header">
                <div class="test-name">${emoji} ${test.name}</div>
                <div class="test-status ${statusClass}">${test.status}</div>
            </div>
            <div class="test-meta">
                <span>🖥️ ${test.device || 'Desktop'}</span>
                <span>🌐 ${test.browser || 'Chrome'}</span>
                <span>🕐 ${timeAgo}</span>
            </div>
        </div>
    `;
}

// Start quick test
async function startQuickTest(scenario) {
    // Get current tab URL
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    const config = {
        scenario: scenario,
        url: tab.url,
        device: 'Desktop',
        browser: 'Chrome'
    };
    
    // Send to background script
    chrome.runtime.sendMessage({ 
        action: 'startTest', 
        config: config 
    });
    
    // Show feedback
    showNotification(`🚀 Starting ${scenario} test...`);
    
    // Close popup after a brief delay
    setTimeout(() => window.close(), 1000);
}

// Open test details in dashboard
function openTestDetails(testId) {
    chrome.runtime.sendMessage({ 
        action: 'openDashboard',
        testId: testId
    });
    window.close();
}

// Show notification
function showNotification(message) {
    // Create temporary notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 10px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--primary);
        color: var(--bg-dark);
        padding: 8px 16px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 600;
        z-index: 1000;
        animation: slideDown 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 2000);
}

// Get time ago string
function getTimeAgo(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
}

// Get scenario emoji
function getScenarioEmoji(scenario) {
    const emojis = {
        'signup': '📱',
        'login': '🔐',
        'upload': '📄',
        'checkout': '🛒',
        'custom': '⚙️'
    };
    return emojis[scenario] || '🧪';
}

// Listen for updates from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'testCompleted' || message.action === 'testStarted') {
        loadRecentTests();
    }
});

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
        }
        to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
    }
`;
document.head.appendChild(style);
