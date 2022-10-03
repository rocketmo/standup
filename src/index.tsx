import React from 'react';
import ReactDOM from 'react-dom';

/**
 * Renders the standup application within the sidebar.
 */
function renderApplication() {
  ReactDOM.render(
    <div>This is a test</div>,
    document.getElementById('standup-root')
  );
}

/**
 * Inserts the extension sidebar into the document's body.
 */
function createSidebar() {
  const sidebar = document.createElement('div');
  sidebar.setAttribute("id", 'standup-sidebar');
  
  const root = document.createElement('div');
  root.setAttribute("id", 'standup-root');

  sidebar.appendChild(root);
  document.body.appendChild(sidebar);
  document.body.classList.add('standup-body');

  renderApplication();
}

/**
 * Toggles the extension sidebar on or off. If the sidebar had not been created yet, do so.
 */
function toggleSidebar() {
  const sidebarContainer = document.getElementById('standup-sidebar');

  if (sidebarContainer) {
    document.body.classList.toggle('standup-body')
    sidebarContainer.classList.toggle('standup-hidden');
  } else {
    createSidebar();
  }
}

toggleSidebar();
