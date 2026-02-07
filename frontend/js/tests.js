// Test Management functionality

import { switchTab } from './navigation.js';
import { closeModal, closeDetailsModal } from './modals.js';
import { showNewTestModal } from './modals.js';

export function quickTest(scenario) {
    const scenarioSelect = document.getElementById('quick-scenario');
    if (scenarioSelect) {
        scenarioSelect.value = scenario;
    }
    showNewTestModal();
}

export function selectScenario(scenario) {
    switchTab('new-test');
    
    // Pre-fill the scenario in the new test form
    setTimeout(() => {
        const select = document.querySelector('#new-test-view select');
        if (select) {
            select.value = scenario;
        }
    }, 100);
}

export function startQuickTest(e) {
    e.preventDefault();
    
    const scenario = document.getElementById('quick-scenario').value;
    const url = document.getElementById('quick-url').value;
    
    if (!scenario || !url) {
        alert('Please fill in all required fields');
        return;
    }
    
    console.log('Starting test:', { scenario, url });
    
    // Show confirmation
    alert(`Starting ${scenario} test on ${url}...\n\nThis will integrate with your browser-use + playwright backend.`);
    
    closeModal();
    
    // Switch to dashboard to show progress
    switchTab('dashboard');
    
    // Simulate test completion
    setTimeout(() => {
        alert('Test completed! Check the dashboard for results.');
    }, 2000);
}

export function runTest(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    
    //test configuration object
    const testConfig = {
        name: formData.get('name'),
        url: formData.get('url'),
        scenario: formData.get('scenario'),
        device: formData.get('device'),
        browser: formData.get('browser'),
        network: formData.get('network'),
        locale: formData.get('locale'),
        persona: formData.get('persona'),
        alert: formData.get('alert')
    };
    
    console.log('Test configuration:', testConfig);
    
    alert('Test started! You can monitor progress in the dashboard.\n\nThis will integrate with your backend API.');
    switchTab('dashboard');
}

export function rerunTest(testId) {
    if (confirm('Are you sure you want to rerun this test?')) {
        console.log('Rerunning test:', testId);
        alert(`Rerunning test ${testId}...\n\nThis will trigger your backend to run the test again.`);
        
    }
}

export function viewTestDetails(testId) {
    const modal = document.getElementById('test-details-modal');
    const content = document.getElementById('test-details-content');
    const reportHTML = generateTestReport(testId);
    
    content.innerHTML = reportHTML;
    modal.classList.add('active');
}

export function exportReport(testId) {
    console.log('Exporting report for test:', testId);
    alert('Report export functionality will be implemented with your backend.\n\nThis will generate a PDF or JSON file with the full test report.');
}

function generateTestReport(testId) {
    // sample data 
    const sampleReports = {
        'test-1': {
            name: 'Mobile Signup Flow - iOS Safari',
            status: 'running',
            duration: '2m 18s',
            issues: 0,
            steps: '8/10'
        },
        'test-2': {
            name: 'Document Upload Test - Android Chrome',
            status: 'failed',
            duration: '3m 42s',
            issues: 3,
            steps: '7/10'
        },
        'test-3': {
            name: 'Login Flow - Desktop Chrome',
            status: 'passed',
            duration: '1m 32s',
            issues: 0,
            steps: '10/10'
        }
    };
    
    const report = sampleReports[testId] || sampleReports['test-2'];
    
    return `
        <div class="space-y-6">
            <div>
                <h3 class="text-lg font-bold mb-3">Test Summary</h3>
                <div class="grid grid-cols-2 gap-4">
                    <div class="card">
                        <div class="text-sm" style="color: var(--text-muted);">Status</div>
                        <div class="status-badge status-${report.status}">${report.status.charAt(0).toUpperCase() + report.status.slice(1)}</div>
                    </div>
                    <div class="card">
                        <div class="text-sm" style="color: var(--text-muted);">Duration</div>
                        <div class="font-bold">${report.duration}</div>
                    </div>
                    <div class="card">
                        <div class="text-sm" style="color: var(--text-muted);">Issues Found</div>
                        <div class="font-bold ${report.issues > 0 ? 'severity-p0' : ''}" style="${report.issues === 0 ? 'color: var(--success)' : ''}">${report.issues}</div>
                    </div>
                    <div class="card">
                        <div class="text-sm" style="color: var(--text-muted);">Steps Completed</div>
                        <div class="font-bold">${report.steps}</div>
                    </div>
                </div>
            </div>

            ${report.issues > 0 ? `
            <div>
                <h3 class="text-lg font-bold mb-3">Issues Detected</h3>
                <div class="space-y-3">
                    <div class="card">
                        <div class="flex items-start justify-between mb-2">
                            <span class="severity-p0 font-bold">P0 - Critical</span>
                            <span class="text-sm" style="color: var(--text-muted);">Frontend Issue</span>
                        </div>
                        <h4 class="font-bold mb-2">Upload button not visible on small screens</h4>
                        <p style="color: var(--text-muted); margin-bottom: 1rem;">
                            The document upload button is positioned outside the viewport on screens < 375px width.
                            Agent attempted to locate upload functionality for 45 seconds before timeout.
                        </p>
                        <div class="code-block">
Element: #upload-btn
Position: { x: 420, y: 200 }
Viewport: 360x640
Issue: Element X position exceeds viewport width
                        </div>
                    </div>

                    <div class="card">
                        <div class="flex items-start justify-between mb-2">
                            <span class="severity-p1 font-bold">P1 - High</span>
                            <span class="text-sm" style="color: var(--text-muted);">UX Issue</span>
                        </div>
                        <h4 class="font-bold mb-2">Ambiguous error message on file type rejection</h4>
                        <p style="color: var(--text-muted); margin-bottom: 1rem;">
                            Error message "Invalid file" doesn't specify which file types are accepted.
                            Agent was unable to determine next action without additional context.
                        </p>
                    </div>

                    <div class="card">
                        <div class="flex items-start justify-between mb-2">
                            <span class="severity-p1 font-bold">P1 - High</span>
                            <span class="text-sm" style="color: var(--text-muted);">Performance Issue</span>
                        </div>
                        <h4 class="font-bold mb-2">Slow response time on form submission</h4>
                        <p style="color: var(--text-muted);">
                            Form submission took 8.3 seconds with no loading indicator.
                            Users may assume the action failed and retry.
                        </p>
                    </div>
                </div>
            </div>

            <div>
                <h3 class="text-lg font-bold mb-3">Screenshots</h3>
                <div class="grid grid-cols-2 gap-4">
                    <div class="card">
                        <div class="text-sm mb-2" style="color: var(--text-muted);">Error State</div>
                        <div style="background: var(--dark); height: 150px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: var(--text-muted);">
                            [Screenshot will be displayed here]
                        </div>
                    </div>
                    <div class="card">
                        <div class="text-sm mb-2" style="color: var(--text-muted);">Button Position Issue</div>
                        <div style="background: var(--dark); height: 150px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: var(--text-muted);">
                            [Screenshot will be displayed here]
                        </div>
                    </div>
                </div>
            </div>
            ` : `
            <div class="card">
                <div style="text-align: center; padding: 2rem;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">✅</div>
                    <h3 class="text-xl font-bold mb-2" style="color: var(--success);">All Tests Passed!</h3>
                    <p style="color: var(--text-muted);">
                        No issues were detected during this test run. The flow completed successfully.
                    </p>
                </div>
            </div>
            `}

            <div class="flex gap-4">
                <button class="btn-primary flex-1" onclick="exportReport('${testId}')">
                    <span style="position: relative; z-index: 1;">Export Report</span>
                </button>
                <button class="btn-secondary" onclick="closeDetailsModal(); rerunTest('${testId}')">Rerun Test</button>
            </div>
        </div>
    `;
}

window.quickTest = quickTest;
window.selectScenario = selectScenario;
window.startQuickTest = startQuickTest;
window.runTest = runTest;
window.rerunTest = rerunTest;
window.viewTestDetails = viewTestDetails;
window.exportReport = exportReport;
