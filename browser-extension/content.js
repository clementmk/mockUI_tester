// Create floating test button
const createFloatingButton = () => {
    // Check if button already exists
    if (document.getElementById('auto-float-btn')) return;
    
    // Create button container
    const button = document.createElement('div');
    button.id = 'auto-float-btn';
    button.className = 'auto-floating-button';
    button.innerHTML = `
        <div class="auto-btn-content">
            <span class="auto-btn-icon">◉</span>
            <span class="auto-btn-text">AUTO</span>
        </div>
        <div class="auto-btn-menu" id="auto-menu">
            <div class="auto-menu-header">
                <span class="auto-menu-logo">◉ AUTO</span>
                <button class="auto-menu-close" id="auto-close">×</button>
            </div>
            <div class="auto-menu-actions">
                <button class="auto-menu-btn" data-scenario="signup">
                    <span class="emoji">📱</span>
                    <span>Test Signup</span>
                </button>
                <button class="auto-menu-btn" data-scenario="login">
                    <span class="emoji">🔐</span>
                    <span>Test Login</span>
                </button>
                <button class="auto-menu-btn" data-scenario="upload">
                    <span class="emoji">📄</span>
                    <span>Test Upload</span>
                </button>
                <button class="auto-menu-btn" data-scenario="checkout">
                    <span class="emoji">🛒</span>
                    <span>Test Checkout</span>
                </button>
            </div>
            <div class="auto-menu-footer">
                <button class="auto-dashboard-btn" id="auto-dashboard">
                    🎯 Open Dashboard
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(button);
    
    // Setup event listeners
    setupButtonListeners(button);
    
    // Make button draggable
    makeDraggable(button);
};

// Setup button event listeners
const setupButtonListeners = (button) => {
    const btnContent = button.querySelector('.auto-btn-content');
    const menu = button.querySelector('#auto-menu');
    const closeBtn = button.querySelector('#auto-close');
    const dashboardBtn = button.querySelector('#auto-dashboard');
    const scenarioBtns = button.querySelectorAll('.auto-menu-btn');
    
    // Toggle menu
    btnContent.addEventListener('click', () => {
        menu.classList.toggle('active');
    });
    
    // Close menu
    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.classList.remove('active');
    });
    
    // Open dashboard
    dashboardBtn.addEventListener('click', () => {
        chrome.runtime.sendMessage({ action: 'openDashboard' });
        menu.classList.remove('active');
    });
    
    // Quick test scenarios
    scenarioBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const scenario = btn.dataset.scenario;
            startTest(scenario);
            menu.classList.remove('active');
        });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!button.contains(e.target)) {
            menu.classList.remove('active');
        }
    });
};

// button draggable
const makeDraggable = (button) => {
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;
    
    const btnContent = button.querySelector('.auto-btn-content');
    
    btnContent.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);
    
    function dragStart(e) {
        if (e.target.closest('.auto-btn-menu')) return;
        
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;
        
        setTimeout(() => {
            isDragging = true;
        }, 100);
    }
    
    function drag(e) {
        if (!isDragging) return;
        
        e.preventDefault();
        
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;
        
        xOffset = currentX;
        yOffset = currentY;
        
        setTranslate(currentX, currentY, button);
    }
    
    function dragEnd() {
        if (isDragging) {
            snapToEdge(button);
        }
        isDragging = false;
    }
    
    function setTranslate(xPos, yPos, el) {
        el.style.transform = `translate(${xPos}px, ${yPos}px)`;
    }
    
    function snapToEdge(el) {
        const rect = el.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        let finalX = xOffset;
        let finalY = yOffset;
        
        // Snap to left or right edge
        if (rect.left < windowWidth / 2) {
            finalX = -rect.left + 20;
        } else {
            finalX = windowWidth - rect.right - 20 + xOffset;
        }
        
        // Keep within vertical bounds
        if (rect.top < 20) {
            finalY = yOffset + (20 - rect.top);
        } else if (rect.bottom > windowHeight - 20) {
            finalY = yOffset - (rect.bottom - windowHeight + 20);
        }
        
        xOffset = finalX;
        yOffset = finalY;
        
        el.style.transition = 'transform 0.3s ease';
        setTranslate(finalX, finalY, el);
        
        setTimeout(() => {
            el.style.transition = '';
        }, 300);
    }
};

// Start test
const startTest = (scenario) => {
    const config = {
        scenario: scenario,
        url: window.location.href,
        device: 'Desktop',
        browser: 'Chrome'
    };
    
    chrome.runtime.sendMessage({ 
        action: 'startTest', 
        config: config 
    });
    
    showNotification(`🚀 Starting ${scenario} test...`);
};

// Show notification
const showNotification = (message) => {
    const notification = document.createElement('div');
    notification.className = 'auto-notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 10);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
};

// Initialize floating button
const init = () => {
    // Wait for page to be ready
    if (document.body) {
        createFloatingButton();
    } else {
        document.addEventListener('DOMContentLoaded', createFloatingButton);
    }
};

// Run initialization
init();

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'testCompleted') {
        showNotification(`✅ Test completed: ${message.status}`);
    } else if (message.action === 'testStarted') {
        showNotification(`🚀 Test started...`);
    }
});
