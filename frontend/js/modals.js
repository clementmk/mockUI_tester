// Modal Management functionality

import { switchTab } from './navigation.js';

export function showNewTestModal() {
    document.getElementById('new-test-modal').classList.add('active');
}

export function showQuickTestModal() {
    // Load the most recent test configuration
    loadRecentTestConfig();
    document.getElementById('quick-test-modal').classList.add('active');
}

export function closeModal() {
    document.getElementById('new-test-modal').classList.remove('active');
}

export function closeQuickTestModal() {
    document.getElementById('quick-test-modal').classList.remove('active');
}

export function closeDetailsModal() {
    document.getElementById('test-details-modal').classList.remove('active');
}

function loadRecentTestConfig() {
    // In production, fetch from API or localStorage
    // For now, using the most recent test from the dashboard
    const recentTest = {
        name: 'Mobile Signup Flow - iOS Safari',
        url: 'https://staging.example.com/signup',
        scenario: 'Complete Signup Flow',
        device: 'Mobile (iPhone 14)',
        browser: 'Safari',
        lastRun: '2 minutes ago'
    };
    
    // Populate the modal with test details
    document.getElementById('qt-test-name').textContent = recentTest.name;
    document.getElementById('qt-url').textContent = recentTest.url;
    document.getElementById('qt-scenario').textContent = recentTest.scenario;
    document.getElementById('qt-device').textContent = recentTest.device;
    document.getElementById('qt-browser').textContent = recentTest.browser;
    document.getElementById('qt-last-run').textContent = recentTest.lastRun;
}

export function confirmQuickTest() {
    // Get the test configuration
    const testConfig = {
        name: document.getElementById('qt-test-name').textContent,
        url: document.getElementById('qt-url').textContent,
        scenario: document.getElementById('qt-scenario').textContent,
        device: document.getElementById('qt-device').textContent,
        browser: document.getElementById('qt-browser').textContent
    };
    
    console.log('Running quick test with config:', testConfig);
    
    // Close modal
    closeQuickTestModal();
    
    // Show confirmation
    alert(`✅ Quick test started: ${testConfig.name}\n\nMonitor progress on the dashboard.`);
    
    // Switch to dashboard to show progress
    switchTab('dashboard');
    
    // In production, call API to start the test
    // API.startTest(testConfig).then(...)
}

export function initModalListeners() {
    // Close modals on outside click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
}

window.showNewTestModal = showNewTestModal;
window.showQuickTestModal = showQuickTestModal;
window.closeModal = closeModal;
window.closeQuickTestModal = closeQuickTestModal;
window.closeDetailsModal = closeDetailsModal;
window.confirmQuickTest = confirmQuickTest;
