// TODO: Remove old selectors once enhanced Jira is the default
const BOARD_SELECTOR_ORIGINAL = '#ghx-pool-column';
const HEADER_SELECTOR_ORIGINAL = '.ghx-swimlane-header';
const HEADER_TEXT_SELECTOR_ORIGINAL = '.ghx-heading span';
const EXPANDER_SELECTOR_ORIGINAL = '.ghx-expander';
const OTHER_ASSIGNEES_SELECTOR_ORIGINAL = ".atlaskit-portal-container button[role='checkbox']";
const AVATAR_SELECTOR_ORIGINAL =
  "label[data-testid='common.issue-filter-bar.assignee-filter-avatar'] img";

const CHECKED_ASSIGNEE_SELECTOR = 'input[name="ASSIGNEE"]:checked, input[name="assignee"]:checked';
const ASSIGNEE_SHOW_MORE_SELECTOR = '#ASSIGNEE-show-more, #assignee-show-more';

const BOARD_SELECTOR_ENHANCED = '[data-test-id="platform-board-kit.ui.board.scroll.board-scroll"]';
const HEADER_SELECTOR_ENHANCED =
  '[data-test-id="platform-board-kit.ui.swimlane.swimlane-wrapper"] > div:nth-child(3)';
const EXPANDER_SELECTOR_ENHANCED =
  '[data-test-id="platform-board-kit.ui.swimlane.swimlane-content"]';
const OTHER_ASSIGNEES_SELECTOR_ENHANCED =
  ".atlaskit-portal-container button[role='menuitemcheckbox']";
const AVATAR_SELECTOR_ENHANCED =
  "label[data-test-id='filters.ui.filters.assignee.stateless.avatar.assignee-filter-avatar'] img";

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
  const originalSelector = `.ghx-swimlane:not(.ghx-closed) ${EXPANDER_SELECTOR_ORIGINAL}`;
  const enhancedSelector = `${HEADER_SELECTOR_ENHANCED} ${EXPANDER_SELECTOR_ENHANCED}[aria-expanded="true"]`;
  const expanders = document.querySelectorAll<HTMLButtonElement>(
    `${originalSelector}, ${enhancedSelector}`,
  );

  for (let expanderIdx = 0; expanderIdx < expanders.length; expanderIdx += 1) {
    const expander = expanders[expanderIdx];
    expander.click();
  }
}

function openSwimLane(personName: string): HTMLElement | undefined {
  const headers = document.querySelectorAll<HTMLElement>(
    `${HEADER_SELECTOR_ORIGINAL}, ${HEADER_SELECTOR_ENHANCED}`,
  );
  let defaultHeader: HTMLElement | null | undefined;

  for (let headerIdx = 0; headerIdx < headers.length; headerIdx += 1) {
    const header = headers[headerIdx];
    const originalTextElement = header.querySelector(HEADER_TEXT_SELECTOR_ORIGINAL);
    const enhancedTextElement1 = header.querySelector(
      `${EXPANDER_SELECTOR_ENHANCED} > div > div:nth-child(2)`,
    );
    const enhancedTextElement2 = header.querySelector(
      `${EXPANDER_SELECTOR_ENHANCED} > div > div:nth-child(3)`,
    );

    const headerText =
      originalTextElement?.textContent?.trim() ||
      enhancedTextElement1?.textContent?.trim() ||
      enhancedTextElement2?.textContent?.trim() ||
      '';

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
  return personHeader.querySelector<HTMLButtonElement>(
    `${EXPANDER_SELECTOR_ORIGINAL}, ${EXPANDER_SELECTOR_ENHANCED}`,
  );
}

function scrollToHeader(personHeader?: HTMLElement): void {
  if (!personHeader) return;

  const originalBoard = document.querySelector(BOARD_SELECTOR_ORIGINAL);
  const enhancedBoard = document.querySelector(BOARD_SELECTOR_ENHANCED);

  const headerHeight = personHeader.offsetHeight;
  const columnsYOffset = (personHeader.nextElementSibling as HTMLElement)?.offsetTop || 0;

  if (originalBoard) {
    originalBoard.scrollTo({
      behavior: 'smooth',
      left: 0,
      top: columnsYOffset - headerHeight,
    });
  } else if (enhancedBoard) {
    const doubleHeaderHeight = 2 * headerHeight;
    enhancedBoard.scrollTo({
      behavior: 'smooth',
      left: 0,
      top: columnsYOffset - doubleHeaderHeight,
    });
  }
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
  return (
    document.querySelector(HEADER_SELECTOR_ORIGINAL) !== null ||
    document.querySelectorAll(HEADER_SELECTOR_ENHANCED).length > 0
  );
}

function uncheckAssignees(): void {
  const checkedAssignees = document.querySelectorAll<HTMLInputElement>(CHECKED_ASSIGNEE_SELECTOR);
  checkedAssignees.forEach((checkedAssignees) => checkedAssignees.click());

  const showMore = document.querySelector<HTMLElement>(ASSIGNEE_SHOW_MORE_SELECTOR);
  if (!showMore) return;

  showMore.click();

  const checkedOtherAssignees = document.querySelectorAll<HTMLSpanElement>(
    `${OTHER_ASSIGNEES_SELECTOR_ORIGINAL} [aria-checked='true'], ${OTHER_ASSIGNEES_SELECTOR_ENHANCED}[aria-checked='true']`,
  );

  checkedOtherAssignees.forEach((checkedAssignees) => checkedAssignees.click());
  showMore.click();
}

function checkAssignee(personName: string): void {
  const assignees = document.querySelectorAll<HTMLElement>(
    `${AVATAR_SELECTOR_ORIGINAL}, ${AVATAR_SELECTOR_ENHANCED}`,
  );
  for (let index = 0; index < assignees.length; index++) {
    const assignee = assignees[index];
    const assigneeName = assignee.getAttribute('alt');
    if (assigneeName && doesNameMatchHeader(personName, assigneeName)) {
      assignee.click();
      return;
    }
  }
  const showMore = document.querySelector<HTMLElement>(ASSIGNEE_SHOW_MORE_SELECTOR);
  if (!showMore) return;

  showMore.click();
  const originalOtherImageSelector = `${OTHER_ASSIGNEES_SELECTOR_ORIGINAL} img`;
  const enhancedOtherImageSelector = `${OTHER_ASSIGNEES_SELECTOR_ENHANCED} img`;
  const otherAssigneeImages = document.querySelectorAll<HTMLElement>(
    `${originalOtherImageSelector}, ${enhancedOtherImageSelector}`,
  );

  for (let index = 0; index < otherAssigneeImages.length; index++) {
    const assignee = otherAssigneeImages[index];
    const assigneeName = otherAssigneeImages[index].getAttribute('alt');
    if (assigneeName && doesNameMatchHeader(personName, assigneeName)) {
      assignee.click();
      break;
    }
  }
  showMore.click();
}
