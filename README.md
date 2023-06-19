# standup

A chrome extension to help facilitate standup meetings in Jira.

## Installation

1. Clone this repo.
2. Run `npm install && npm run build`
3. Open `chrome://extensions/` in Chrome.
4. Enable developer mode.
5. Click on the "Load unpacked" button.
6. Select the folder where this repo was cloned to.

## Updating the extension
1. Run `git checkout main && git pull && rm -rf node_modules && npm install && npm run build`
2. Running the above command should be sufficient, but if that does not work, try opening
`chrome://extensions/` in Chrome, and reloading the extension.
