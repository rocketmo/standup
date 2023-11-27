# standup

A chrome extension to help facilitate standup meetings in Jira.

## Installation

### By Command Line

1. Clone this repo.
2. Run `npm install && npm run build`
3. Open `chrome://extensions/` in Chrome.
4. Enable developer mode.
5. Click on the "Load unpacked" button.
6. Select the folder where this repo was cloned to.

### By Download

1. Go to the [Releases](https://github.com/rocketmo/standup/releases) page.
2. Find the latest release and download the `build.zip` file.
3. Unzip that file.
4. Open `chrome://extensions/` in Chrome.
5. Enable developer mode.
6. Click on the "Load unpacked" button.
6. Select the unzipped `standup` folder.

## Updating the extension

### By Command Line

1. Run `git checkout main && git pull && rm -rf node_modules && npm install && npm run build`
2. Running the above command should be sufficient, but if that does not work, try opening
`chrome://extensions/` in Chrome, and reloading the extension.

### By Download

1. Go to the [Releases](https://github.com/rocketmo/standup/releases) page.
2. Find the latest release and download the `build.zip` file.
3. Unzip that file and replace your existing `standup` folder with the unzipped `standup` folder.
4. Following the above steps should be sufficient, but if that does not work, try opening
`chrome://extensions/` in Chrome, and reloading the extension.
