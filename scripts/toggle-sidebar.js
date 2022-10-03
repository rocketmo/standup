function createSidebar() {
  const sidebar = document.createElement('div');
  sidebar.setAttribute("id", 'standup-sidebar');
  document.body.appendChild(sidebar);
  document.body.classList.add('standup-body');
}

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
