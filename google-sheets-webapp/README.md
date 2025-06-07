# Google Sheets Data Viewer PWA

This is a Progressive Web Application (PWA) designed to display data from a public Google Sheet in a user-friendly, responsive table. It's built with React and Material UI 3, focusing on performance and a good user experience on both desktop and mobile devices.

## Features

*   **Google Sheets Integration:** Displays data directly from a specified public Google Sheet.
*   **Responsive Design:** The interface adapts to different screen sizes, ensuring usability on desktops, tablets, and mobile phones.
*   **Material UI 3:** Utilizes modern UI components from Material UI 3 for a clean and intuitive look and feel.
*   **Progressive Web App (PWA):**
    *   **Installable:** Can be "added to home screen" on supported mobile devices (iOS and Android) and desktops for an app-like experience.
    *   **Offline Access:** Core application assets (HTML, CSS, JavaScript) are cached by a service worker, allowing the app shell to load even when offline. Data fetched previously might be available depending on browser caching, but live data requires an internet connection.
*   **Low Latency Performance:** Optimized for quick loading and smooth interactions.
*   **Loading & Error States:** Clearly indicates when data is being fetched or if an error occurs.
*   **Cross-Browser Compatibility:** Works on modern web browsers.

## How to Use

### Online (Desktop and Mobile)

1.  **Access the URL:** Open your web browser (like Chrome, Safari, Firefox, Edge) and navigate to the URL where the application is deployed.
2.  **View Data:** The application will fetch and display the data from the configured Google Sheet.

### Offline Usage

*   Once the application has been loaded at least once while online, the PWA's service worker will cache the main application files.
*   This means you can open the app again even if you're offline, and the basic application shell will load.
*   **Note:** To fetch the *latest* data from the Google Sheet, an active internet connection is required. If you are offline, you might see stale data if the browser has cached previous data requests, or an error if it tries to fetch fresh data. The core app (table structure, UI elements) will still be visible.

### Installing on Mobile (iOS and Android)

#### Android (Using Chrome or other supporting browsers)

1.  **Open the URL:** Navigate to the web app's URL in your browser.
2.  **Add to Home Screen:**
    *   You should see a prompt or banner suggesting you can "Add to Home Screen".
    *   Alternatively, tap the browser's menu button (usually three dots) and look for an option like "Install app" or "Add to Home screen".
3.  **Launch from Home Screen:** Once installed, you can launch it like any other app from your phone's home screen or app drawer.

#### iOS (Using Safari)

1.  **Open the URL:** Navigate to the web app's URL in Safari.
2.  **Add to Home Screen:**
    *   Tap the "Share" button (it looks like a square with an arrow pointing upwards) in the Safari toolbar.
    *   Scroll down in the Share menu and tap "Add to Home Screen".
    *   Confirm the name for the app icon and tap "Add".
3.  **Launch from Home Screen:** The app icon will appear on your home screen, and you can launch it like a native app.

### Installing on Desktop (Chrome, Edge)

1.  **Open the URL:** Navigate to the web app's URL in a supported browser (like Chrome or Edge).
2.  **Install App:**
    *   Look for an "Install" icon in the address bar (often looks like a computer monitor with a down arrow or a plus sign).
    *   Click it and follow the prompts to install the application.
3.  **Launch from Apps:** The PWA will be added to your computer's list of applications (e.g., Chrome Apps folder, Start Menu).

## For Developers

### Project Structure

*   `public/`: Contains static assets, including `index.html` and `manifest.json`.
*   `src/`: Contains the React application code.
    *   `components/`: Reusable UI components (e.g., `SheetDataTable.js`).
    *   `services/`: Modules for external interactions (e.g., `sheetService.js` for Google Sheets API).
    *   `App.js`: Main application component.
    *   `index.js`: Entry point of the React application.
    *   `serviceWorkerRegistration.js`: Handles PWA service worker registration.
*   `google-sheets-webapp/src/__tests__`: Contains unit tests for `App.js`.
*   `google-sheets-webapp/src/components/__tests__`: Contains unit tests for components.
*   `google-sheets-webapp/src/services/__tests__`: Contains unit tests for services.


### Prerequisites

*   Node.js (latest LTS version recommended)
*   npm (comes with Node.js) or yarn

### Running Locally

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd google-sheets-webapp
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    # or
    # yarn install
    ```
3.  **Start the development server:**
    ```bash
    npm start
    # or
    # yarn start
    ```
    This will open the application in your default web browser, usually at `http://localhost:3000`. The app will automatically reload if you make changes to the code.

### Running Tests

To run the automated unit tests:

```bash
npm test
# or
# yarn test
```

This launches the test runner in interactive watch mode.

### Building for Production

To create an optimized production build:

```bash
npm run build
# or
# yarn build
```
This creates a `build` folder with the static assets for your application. These files are ready to be deployed to a static site hosting service. The build process also ensures the service worker is correctly generated by Workbox.

EOF
