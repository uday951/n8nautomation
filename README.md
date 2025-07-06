# LinkedIn Post Creator

A Node.js application that automates posting to LinkedIn using Puppeteer.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create environment variables:**
   Create a `.env` file with:
   ```
   LINKEDIN_EMAIL=your_linkedin_email@example.com
   LINKEDIN_PASSWORD=your_linkedin_password
   PORT=3000
   ```

3. **Install Chrome for Puppeteer:**
   ```bash
   npx puppeteer browsers install chrome
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

## Deployment

The app is configured for deployment on platforms like Railway with the `Procfile`.

## Security Notes

- Store LinkedIn credentials securely
- Consider using 2FA-compatible authentication
- Monitor for LinkedIn's anti-automation measures 