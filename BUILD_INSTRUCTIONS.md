# How to Build RemindHer for macOS

Since this app was developed on Windows, you need to build the final Mac application on a Mac.

## Prerequisites
1. **Node.js**: You need Node.js installed to build the app.
   - Download the "LTS" version from: [https://nodejs.org/](https://nodejs.org/)
   - Install it like a regular application.

## Steps
1. **Copy the Code**: Move this entire `k-reminder-app` folder to your Mac.
2. **Open Terminal**:
   - Press `Cmd + Space`, type `Terminal`, and hit Enter.
   - Type `cd ` (with a space) and then drag the `k-reminder-app` folder into the terminal window. Press Enter.
3. **Install Dependencies**:
   - Run this command and wait for it to finish:
     ```bash
     npm install
     ```
4. **Build the App**:
   - Run this command:
     ```bash
     npm run build:mac
     ```
5. **Get the App**:
   - Once finished, locate the `dist` folder inside the project.
   - You will find the `RemindHer` installer (.dmg) or app file there.

## Running the App
- Once built, you don't need Node.js anymore to just run the app.
- **Note**: If you see "App is damaged" or "Unidentified Developer":
  - **Right-click** the app icon and select **Open**.
  - Click **Open** again in the pop-up dialog.
