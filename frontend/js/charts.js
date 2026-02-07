// Dashboard Charts and Analytics
let testTrendChart, severityChart, deviceChart;
let currentTimeFilter = '7days';

// Initialize all charts
export function initCharts() {
    initTestTrendChart();
    initSeverityChart();
    initDeviceChart();
}

// Test Trend Over Time - Line Chart
function initTestTrendChart() {
    const ctx = document.getElementById('testTrendChart');
    if (!ctx) return;

    const data = getTestTrendData(currentTimeFilter);
    
    testTrendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [
                {
                    label: 'Passed',
                    data: data.passed,
                    borderColor: '#00ff88',
                    backgroundColor: 'rgba(0, 255, 136, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Failed',
                    data: data.failed,
                    borderColor: '#e60404',
                    backgroundColor: 'rgba(230, 4, 4, 0.1)',
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: '#e8edf4',
                        font: { size: 12 },
                        usePointStyle: true,
                        padding: 15
                    }
                },
                tooltip: {
                    backgroundColor: '#1e2332',
                    titleColor: '#e8edf4',
                    bodyColor: '#8b92a8',
                    borderColor: 'rgba(0, 255, 136, 0.3)',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: true
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 255, 136, 0.1)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#8b92a8',
                        font: { size: 11 }
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(0, 255, 136, 0.05)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#8b92a8',
                        font: { size: 11 }
                    }
                }
            }
        }
    });
}

// Issue Severity Breakdown - Donut Chart
function initSeverityChart() {
    const ctx = document.getElementById('severityChart');
    if (!ctx) return;
    
    severityChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['P0 - Critical', 'P1 - High', 'P2 - Medium', 'P3 - Low'],
            datasets: [{
                data: [5, 12, 18, 8],
                backgroundColor: [
                    '#e60404', // Red for P0 - Critical
                    '#f59e0b', // Orange for P1 - High
                    '#1c70dc', // Blue for P2 - Medium
                    '#07dc47'  // Green for P3 - Low
                ],
                borderWidth: 0,
                hoverOffset: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%',
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: '#1e2332',
                    titleColor: '#e8edf4',
                    bodyColor: '#8b92a8',
                    borderColor: 'rgba(0, 255, 136, 0.3)',
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Device Breakdown - Pie Chart
function initDeviceChart() {
    const ctx = document.getElementById('deviceChart');
    if (!ctx) return;
    
    deviceChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Mobile', 'Desktop', 'Tablet'],
            datasets: [{
                data: [67, 48, 12],
                backgroundColor: [
                    '#00ff88', 
                    '#0088ff', 
                    '#a855f7'  
                ],
                borderWidth: 2,
                borderColor: '#141824',
                hoverOffset: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        color: '#e8edf4',
                        font: { size: 12 },
                        padding: 15,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    backgroundColor: '#1e2332',
                    titleColor: '#e8edf4',
                    bodyColor: '#8b92a8',
                    borderColor: 'rgba(0, 255, 136, 0.3)',
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ${value} tests (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Get test trend data based on time filter
function getTestTrendData(filter) {
    // Sample data
    const data7days = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        passed: [12, 15, 18, 14, 20, 16, 19],
        failed: [3, 2, 4, 5, 3, 2, 4]
    };
    
    const data30days = {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        passed: [65, 72, 68, 82],
        failed: [18, 15, 20, 16]
    };
    
    const dataAllTime = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        passed: [145, 167, 189, 201, 234, 256],
        failed: [45, 38, 52, 48, 51, 43]
    };
    
    switch(filter) {
        case '7days':
            return data7days;
        case '30days':
            return data30days;
        case 'alltime':
            return dataAllTime;
        default:
            return data7days;
    }
}

// Filter by time period
export function filterByTime(period) {
    currentTimeFilter = period;
    
    // Update active state on buttons
    document.querySelectorAll('.time-filter').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-filter') === period) {
            btn.classList.add('active');
        }
    });
    
    // Update stats based on filter (replace with actual backend call)
    updateStats(period);
    
    // Update test trend chart
    if (testTrendChart) {
        const data = getTestTrendData(period);
        testTrendChart.data.labels = data.labels;
        testTrendChart.data.datasets[0].data = data.passed;
        testTrendChart.data.datasets[1].data = data.failed;
        testTrendChart.update();
    }
}

// Update stats cards based on filter
function updateStats(period) {
    // Sample data
    const stats = {
        '7days': { tests: 127, issues: 43, successRate: '87%', avgDuration: '2.4m' },
        '30days': { tests: 487, issues: 156, successRate: '84%', avgDuration: '2.6m' },
        'alltime': { tests: 1843, issues: 592, successRate: '86%', avgDuration: '2.5m' }
    };
    
    const data = stats[period] || stats['7days'];
    
    // Update the stat cards
    const statCards = document.querySelectorAll('#dashboard-view .card');
    if (statCards[0]) statCards[0].querySelector('.text-3xl').textContent = data.tests;
    if (statCards[1]) statCards[1].querySelector('.text-3xl').textContent = data.issues;
    if (statCards[2]) statCards[2].querySelector('.text-3xl').textContent = data.successRate;
    if (statCards[3]) statCards[3].querySelector('.text-3xl').textContent = data.avgDuration;
}

// Export dashboard as PDF
export function exportDashboard() {
    const element = document.getElementById('dashboard-view');
    const button = event ? event.target : document.querySelector('[onclick="exportDashboard()"]');
    
    if (!button) {
        alert('Unable to find export button');
        return;
    }
    
    const originalText = button.textContent;
    button.textContent = '⏳ Generating PDF...';
    button.disabled = true;
    
    element.classList.add('pdf-export');
    
    const opt = {
        margin: [0.4, 0.3, 0.4, 0.3],
        filename: `dashboard-report-${new Date().toISOString().split('T')[0]}.pdf`,
        image: { 
            type: 'jpeg', 
            quality: 0.95 
        },
        html2canvas: { 
            scale: 1.5,
            useCORS: true,
            backgroundColor: '#0a0e1a',
            logging: false,
            windowWidth: 1200,
            onclone: (clonedDoc) => {
                
                const dashboardView = clonedDoc.querySelector('#dashboard-view');
                if (dashboardView) {
                    const header = clonedDoc.createElement('div');
                    header.style.cssText = 'text-align: center; padding: 1rem 0; margin-bottom: 1rem; border-bottom: 2px solid rgba(0, 255, 136, 0.3);';
                    const now = new Date();
                    header.innerHTML = `
                        <div style="font-size: 0.875rem; color: #8b92a8; margin-bottom: 0.25rem;">
                            Dashboard Report - Generated on ${now.toLocaleDateString()} at ${now.toLocaleTimeString()}
                        </div>
                    `;
                    dashboardView.insertBefore(header, dashboardView.firstChild);
                }
                
                const charts = clonedDoc.querySelectorAll('canvas');
                charts.forEach(chart => {
                    chart.style.maxHeight = '250px';
                });
                
                const buttons = clonedDoc.querySelectorAll('.btn-primary, .btn-secondary, .time-filter, .hide-in-pdf');
                buttons.forEach(btn => {
                    btn.style.display = 'none';
                });
                
                const cards = clonedDoc.querySelectorAll('.card');
                cards.forEach(card => {
                    card.style.pageBreakInside = 'avoid';
                    card.style.breakInside = 'avoid';
                });
                
                const grids = clonedDoc.querySelectorAll('.grid');
                grids.forEach(grid => {
                    grid.style.pageBreakInside = 'avoid';
                });
            }
        },
        jsPDF: { 
            unit: 'in', 
            format: 'a4', 
            orientation: 'portrait',
            compress: true
        },
        pagebreak: { 
            mode: ['avoid-all', 'css', 'legacy'],
            before: '.page-break-before',
            after: '.page-break-after',
            avoid: ['.card', '.grid']
        }
    };
    
    // Generate PDF
    html2pdf()
        .set(opt)
        .from(element)
        .save()
        .then(() => {
           
            element.classList.remove('pdf-export');
            button.textContent = '📄 Export Dashboard';
            button.disabled = false;
        })
        .catch(err => {
            console.error('PDF export failed:', err);
            element.classList.remove('pdf-export');
            button.textContent = '📄 Export Dashboard';
            button.disabled = false;
            alert('Failed to export dashboard. Please try again.');
        });
}

window.filterByTime = filterByTime;
window.exportDashboard = exportDashboard;
