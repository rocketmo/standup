import React from 'react';
import ReactDOM from 'react-dom';
import App from '../components/app';

const BODY_CLASS = 'standup-body';
const HIDDEN_CLASS = 'standup-hidden';
const ROOT_ID = 'standup-root';
const SIDEBAR_ID = 'standup-sidebar';

/**
 * Renders the standup application within the sidebar.
 */
function renderApplication() {
  ReactDOM.render(<App />, document.getElementById(ROOT_ID));
}

/**
 * Inserts the extension sidebar into the document's body.
 */
function createSidebar() {
  const sidebar = document.createElement('div');
  sidebar.setAttribute('id', SIDEBAR_ID);

  const root = document.createElement('div');
  root.setAttribute('id', ROOT_ID);

  sidebar.appendChild(root);
  document.body.appendChild(sidebar);
  document.body.classList.add(BODY_CLASS);

  renderApplication();
}

function toggleSidebar(sidebarContainer: HTMLElement) {
  document.body.classList.toggle(BODY_CLASS);

  if (document.body.classList.contains(BODY_CLASS)) {
    sidebarContainer.classList.remove(HIDDEN_CLASS);
  } else {
    sidebarContainer.classList.add(HIDDEN_CLASS);
  }
}

/**
 * Closes the extension sidebar.
 */
export function closeSidebar() {
  const sidebarContainer = document.getElementById(SIDEBAR_ID);

  if (sidebarContainer) {
    document.body.classList.remove(BODY_CLASS);
    sidebarContainer.classList.add(HIDDEN_CLASS);
  }
}

/**
 * Initialize the extension sidebar. If it doesn't exist, create it. Otherwise toggle it on or off.
 */
export function initSidebar() {
  const sidebarContainer = document.getElementById(SIDEBAR_ID);

  if (sidebarContainer) {
    toggleSidebar(sidebarContainer);
  } else {
    createSidebar();
  }
}
