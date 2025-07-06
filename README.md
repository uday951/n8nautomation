# LinkedIn Post Creator

A Node.js application that automates posting to LinkedIn using Playwright with cookie-based authentication.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Save LinkedIn cookies (one-time setup):**
   ```bash
   npm run save-cookies
   ```
   This will open a browser window where you can login to LinkedIn manually. The cookies will be saved for future use.

3. **Optional: Set Chrome path (if Chrome is not in standard location):**
   ```
   CHROME_PATH=C:\path\to\your\chrome.exe
   ```

## Usage

1. **Start the server:**
   ```bash
   npm start
   ```

2. **Health check:**
   ```
   GET http://localhost:3000/
   ```

3. **Create a LinkedIn post:**
   ```bash
   POST http://localhost:3000/post
   Content-Type: application/json
   
   {
     "text": "Your LinkedIn post content here"
   }
   ```

## API Endpoints

- `GET /` - Health check
- `POST /post` - Create a LinkedIn post
  - Body: `{ "text": "post content" }`

## Cookie Authentication

This app uses cookie-based authentication instead of username/password:

1. **First time setup:** Run `npm run save-cookies` and login manually
2. **Cookies are saved** to `cookies.json` for future use
3. **Session expires:** If you get "Session expired" errors, re-run the save-cookies script

## Browser Requirements

The app will try to use your system's Chrome browser first. If not found, it will attempt to use Playwright's Chromium.

## Deployment

The app is configured for deployment on platforms like Railway with the `Procfile`.

## Security Notes

- Cookies are stored locally in `cookies.json`
- No password storage required
- Monitor for LinkedIn's anti-automation measures
- Consider using 2FA-compatible authentication 