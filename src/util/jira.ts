const CHECKED_ASSIGNEE_SELECTOR = 'input[name="ASSIGNEE"]:checked, input[name="assignee"]:checked';
const ASSIGNEE_SHOW_MORE_SELECTOR = '#ASSIGNEE-show-more, #assignee-show-more';

const HEADER_SELECTOR =
  '[data-test-id="platform-board-kit.ui.swimlane.swimlane-wrapper"] > div:nth-child(3)';
const EXPANDER_SELECTOR = '[data-test-id="platform-board-kit.ui.swimlane.swimlane-content"]';
const OTHER_ASSIGNEES_SELECTOR = ".atlaskit-portal-container button[role='menuitemcheckbox']";
const AVATAR_SELECTOR =
  "label[data-test-id='filters.ui.filters.assignee.stateless.avatar.assignee-filter-avatar'] img";

export function highlightPerson(personName: string): void {
  uncheckAssignees();
  checkAssignee(personName);
  openAllSwimLanes();
}

function openAllSwimLanes(): void {
  // Wait for swimlanes to appear on the board before opening them
  // TODO: Figure out a way to do this cleaner
  setTimeout(() => {
    const selector = `${HEADER_SELECTOR} ${EXPANDER_SELECTOR}[aria-expanded="false"]`;
    const expanders = document.querySelectorAll<HTMLButtonElement>(selector);
    console.log(expanders);

    for (let expanderIdx = expanders.length - 1; expanderIdx >= 0; expanderIdx -= 1) {
      const expander = expanders[expanderIdx];
      expander.click();
    }
  }, 100);
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

export function uncheckAssignees(): void {
  const checkedAssignees = document.querySelectorAll<HTMLInputElement>(CHECKED_ASSIGNEE_SELECTOR);
  checkedAssignees.forEach((checkedAssignees) => checkedAssignees.click());

  const showMore = document.querySelector<HTMLElement>(ASSIGNEE_SHOW_MORE_SELECTOR);
  if (!showMore) return;

  showMore.click();

  const checkedOtherAssignees = document.querySelectorAll<HTMLSpanElement>(
    `${OTHER_ASSIGNEES_SELECTOR}[aria-checked='true']`,
  );

  checkedOtherAssignees.forEach((checkedAssignees) => checkedAssignees.click());
  showMore.click();
}

function checkAssignee(personName: string): void {
  const assignees = document.querySelectorAll<HTMLElement>(AVATAR_SELECTOR);
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
  const imageSelector = `${OTHER_ASSIGNEES_SELECTOR} img`;
  const otherAssigneeImages = document.querySelectorAll<HTMLElement>(imageSelector);

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
