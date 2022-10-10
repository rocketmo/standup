export function highlightSwimLane(personName: string): void {
  closeAllSwimLanes();
  const personHeader = openSwimLane(personName);
  scrollToHeader(personHeader);
}

function openSwimLane(personName: string): HTMLElement | undefined {
  const headers = document.querySelectorAll<HTMLElement>('.ghx-swimlane-header');
  let defaultHeader: HTMLElement | null | undefined;

  for (let headerIdx = 0; headerIdx < headers.length; headerIdx += 1) {
    const header = headers[headerIdx];
    const headerTextElement = header.querySelector('.ghx-heading span');
    const headerText = headerTextElement?.textContent;

    if (headerText && headerText.toLowerCase().startsWith(personName.toLowerCase())) {
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

function closeAllSwimLanes(): void {
  const expanders = document.querySelectorAll<HTMLButtonElement>(
    '.ghx-swimlane:not(.ghx-closed) .ghx-expander',
  );

  for (let expanderIdx = 0; expanderIdx < expanders.length; expanderIdx += 1) {
    const expander = expanders[expanderIdx];
    expander.click();
  }
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