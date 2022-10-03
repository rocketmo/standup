// Toggle the sidebar when the extension button is pressed.
chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['build/app.js']
  });
});
