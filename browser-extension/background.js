// Background Service Worker for AUTO Extension

// Create context menu on installation
chrome.runtime.onInstalled.addListener(() => {
  // Main context menu
  chrome.contextMenus.create({
    id: 'auto-test-flow',
    title: '🚀 Test this flow with AUTO',
    contexts: ['page', 'link', 'selection']
  });

  // Sub-menu for quick scenarios
  chrome.contextMenus.create({
    id: 'auto-test-signup',
    parentId: 'auto-test-flow',
    title: 'Test Signup Flow',
    contexts: ['page']
  });

  chrome.contextMenus.create({
    id: 'auto-test-login',
    parentId: 'auto-test-flow',
    title: 'Test Login Flow',
    contexts: ['page']
  });

  chrome.contextMenus.create({
    id: 'auto-test-upload',
    parentId: 'auto-test-flow',
    title: 'Test Document Upload',
    contexts: ['page']
  });

  chrome.contextMenus.create({
    id: 'auto-test-custom',
    parentId: 'auto-test-flow',
    title: 'Custom Test...',
    contexts: ['page']
  });

  console.log('✅ AUTO Extension installed!');
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  const testConfig = {
    url: tab.url,
    title: tab.title,
    timestamp: new Date().toISOString()
  };

  switch(info.menuItemId) {
    case 'auto-test-signup':
      startTest({ ...testConfig, scenario: 'signup', name: 'Signup Flow Test' });
      break;
    case 'auto-test-login':
      startTest({ ...testConfig, scenario: 'login', name: 'Login Flow Test' });
      break;
    case 'auto-test-upload':
      startTest({ ...testConfig, scenario: 'upload', name: 'Document Upload Test' });
      break;
    case 'auto-test-custom':
      // Open popup for custom configuration
      chrome.action.openPopup();
      break;
  }
});

// Start a test
async function startTest(config) {
  try {
    // Show notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: '🚀 Test Started',
      message: `Starting ${config.name} on ${config.title}`,
      priority: 2
    });

    // Save to recent tests
    const { recentTests = [] } = await chrome.storage.local.get('recentTests');
    recentTests.unshift({
      ...config,
      status: 'running',
      id: `test-${Date.now()}`
    });
    await chrome.storage.local.set({ recentTests: recentTests.slice(0, 10) });

    // To be used in backend API
    // const response = await fetch('http://localhost:8001/api/tests', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(config)
    // });

    // Simulate test completion (remove in production)
    setTimeout(() => {
      completeTest(config.id || `test-${Date.now()}`, 'passed');
    }, 5000);

  } catch (error) {
    console.error('Error starting test:', error);
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: '❌ Test Failed',
      message: 'Failed to start test. Check your connection.',
      priority: 2
    });
  }
}

// Complete a test
async function completeTest(testId, status) {
  const { recentTests = [] } = await chrome.storage.local.get('recentTests');
  const updatedTests = recentTests.map(test => 
    test.id === testId ? { ...test, status, completedAt: new Date().toISOString() } : test
  );
  await chrome.storage.local.set({ recentTests: updatedTests });

  // Show completion notification
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon48.png',
    title: status === 'passed' ? '✅ Test Passed' : '❌ Test Failed',
    message: `Test completed with status: ${status}`,
    priority: 2
  });
}

// Listen for messages from popup or content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'startTest') {
    startTest(message.config);
    sendResponse({ success: true });
  } else if (message.action === 'getRecentTests') {
    chrome.storage.local.get('recentTests', (data) => {
      sendResponse({ tests: data.recentTests || [] });
    });
    return true; // Keep channel open for async response
  } else if (message.action === 'openDashboard') {
    chrome.tabs.create({ url: 'http://localhost:8001' });
    sendResponse({ success: true });
  }
});

// Badge to show active tests
chrome.storage.local.get('recentTests', (data) => {
  const activeTests = (data.recentTests || []).filter(t => t.status === 'running').length;
  if (activeTests > 0) {
    chrome.action.setBadgeText({ text: String(activeTests) });
    chrome.action.setBadgeBackgroundColor({ color: '#00ff88' });
  }
});
