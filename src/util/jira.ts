export function highlightPerson(personName: string): void {
  if (usesSwimLanes()) {
    closeAllSwimLanes();
    const personHeader = openSwimLane(personName);
    scrollToHeader(personHeader);
  } else {
    // Otherwise use assignee filter instead
    uncheckAssignees();
    checkAssignee(personName);
  }
}

export function closePeopleFilters(): void {
  if (usesSwimLanes()) {
    closeAllSwimLanes();
  } else {
    uncheckAssignees();
  }
}

function closeAllSwimLanes(): void {
  const expanders = document.querySelectorAll<HTMLButtonElement>(
    '.ghx-swimlane:not(.ghx-closed) .ghx-expander',
  );

  for (let expanderIdx = 0; expanderIdx < expanders.length; expanderIdx += 1) {
    const expander = expanders[expanderIdx];
    expander.click();
  }
}

function openSwimLane(personName: string): HTMLElement | undefined {
  const headers = document.querySelectorAll<HTMLElement>('.ghx-swimlane-header');
  let defaultHeader: HTMLElement | null | undefined;

  for (let headerIdx = 0; headerIdx < headers.length; headerIdx += 1) {
    const header = headers[headerIdx];
    const headerTextElement = header.querySelector('.ghx-heading span');
    const headerText = headerTextElement?.textContent || '';

    if (doesNameMatchHeader(personName, headerText)) {
      const expander = getExpanderFromHeader(header);
      expander?.click();
      return header;
    } else if (headerText === 'Unassigned') {
      defaultHeader = header;
    }
  }

  // Open default swim lane if there is no swimlane for the person
  if (defaultHeader) {
    const expander = getExpanderFromHeader(defaultHeader);
    expander?.click();
    return defaultHeader;
  }
}

function getExpanderFromHeader(personHeader: HTMLElement): HTMLButtonElement | null {
  return personHeader.querySelector<HTMLButtonElement>('.ghx-expander');
}

function scrollToHeader(personHeader?: HTMLElement): void {
  if (!personHeader) return;

  const poolColumns = document.getElementById('ghx-pool-column');
  const headerHeight = personHeader.offsetHeight;
  const columnsYOffset = (personHeader.nextElementSibling as HTMLElement)?.offsetTop || 0;
  poolColumns?.scrollTo({
    behavior: 'smooth',
    left: 0,
    top: columnsYOffset - headerHeight,
  });
}

function doesNameMatchHeader(personName: string, headerText: string): boolean {
  // Ignore anything in the person's name following a comma, a double quote, or a left paren
  // (so that nicknames can be used for that person).
  const personTerms = personName
    .toLowerCase()
    .split(/[,\"\(]/)[0]
    .split(/\W+/);

  const headerTerms = headerText.toLowerCase().split(/\W+/);

  for (const personTerm of personTerms) {
    let foundMatch = false;
    for (const headerTerm of headerTerms) {
      if (headerTerm.startsWith(personTerm)) {
        foundMatch = true;
        break;
      }
    }

    if (!foundMatch) return false;
  }

  return true;
}

function usesSwimLanes(): boolean {
  return document.querySelector('.ghx-swimlane-header') !== null;
}

function uncheckAssignees(): void {
  const checkedAssignees = document.querySelectorAll<HTMLInputElement>(
    'input[name="ASSIGNEE"]:checked',
  );
  checkedAssignees.forEach((checkedAssignees) => checkedAssignees.click());

  const showMore = document.querySelector<HTMLElement>('#ASSIGNEE-show-more');
  if (!showMore) return;

  showMore.click();
  const otherAssignees = document.querySelectorAll<HTMLSpanElement>(
    ".atlaskit-portal-container button[role='checkbox'][aria-checked='true']",
  );

  otherAssignees.forEach((checkedAssignees) => checkedAssignees.click());
  showMore.click();
}

function checkAssignee(personName: string): void {
  const assignees = document.querySelectorAll<HTMLElement>(
    "label[data-testid='common.issue-filter-bar.assignee-filter-avatar'] img",
  );
  for (let index = 0; index < assignees.length; index++) {
    const assignee = assignees[index];
    const assigneeName = assignee.getAttribute('alt');
    if (assigneeName && doesNameMatchHeader(personName, assigneeName)) {
      assignee.click();
      return;
    }
  }
  const showMore = document.querySelector<HTMLElement>('#ASSIGNEE-show-more');
  if (!showMore) return;

  showMore.click();
  const otherAssignees = document.querySelectorAll<HTMLElement>(
    ".atlaskit-portal-container button[role='checkbox'] img",
  );
  for (let index = 0; index < otherAssignees.length; index++) {
    const assignee = otherAssignees[index];
    const assigneeName = otherAssignees[index].getAttribute('alt');
    if (assigneeName && doesNameMatchHeader(personName, assigneeName)) {
      assignee.click();
      break;
    }
  }
  showMore.click();
}
