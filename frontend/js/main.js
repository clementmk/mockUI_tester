// Main application initialization

import { initNavigationListeners } from './navigation.js';
import { initModalListeners } from './modals.js';
import { initializeWebSocket } from './api.js';
import { initCharts } from './charts.js';

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('Autonomous Mystery Shopper Dashboard initialized');
    
    // Initialize navigation
    initNavigationListeners();
    
    // Initialize modals
    initModalListeners();
    
    // Initialize charts
    initCharts();
    
    console.log('✅ All modules loaded successfully');
});
