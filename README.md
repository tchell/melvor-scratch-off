# Melvor Scratch-off

A tool to automate scratching presents from MelvorIdle special events

# Requirements

- [Node.js](https://nodejs.org/en/)

# Getting Started

1. Get the files:

   a. Clone the repo: `git clone git@github.com:tchell/melvor-scratch-off.git`

   OR

   b. [Download the zip](https://github.com/tchell/melvor-scratch-off/archive/master.zip)

2. Install:

   a. Globally: `npm install -g`

   OR

   b. In the current directory: `npm install`

3. Run:
   ```
   node index.js
   ```

# Usage

Currently the only supported log in method is to use cloud saves, so make sure your latest activity is synced to the cloud.

**NOTE:** There is a known issue that the script cannot bypass the offline progress popup. Because of this make sure your save has no active task before running this.

```
node index.js -h

Usage: index [options]

Options:
  -u --username <string>    MelvorIdle Username
  -p --password <string>    MelvorIdle Password
  -i --ignore-bank-full     Scratch presents even if bank is full. Overrides --free-space (default: false)
  -f --free-space <number>  Number of free bank spaces required to  continue. (default: 21)
  -h, --help                display help for command
```

## .env

- You can add a .env file to the install folder with the following variables:
  - `USER_NAME=<username>` The username to log in with.
  - `PASSWORD=<password>` The password to log in with.

# Development

Feel free to open a PR if you want to add features/functionality. This is not a perfect implementation and some small additional changes could improve a lot.

- You may find it useful to add two environment variables to your `.env` file
  - `HEADLESS=true|false` tells `puppeteer` to use headless mode or not. Not recommended for real usage because headful mode takes over the mouse and moving the mouse can mess up the script.
  - `DEV_TOOLS=true|false` tells `puppeteer` to open the devtools each time the browser is opened.
