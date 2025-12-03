# demo01
The first codex experimental project

## Run locally

1. Ensure Node.js 18+ is available.
2. Install dependencies (none beyond Node built-ins).
3. Start the static server (binds to all interfaces so the preview URL works):
   ```bash
   npm start
   ```
4. Open http://localhost:8000 to play (or use the forwarded preview link in your environment).

## Troubleshooting
- If `npm start` prints `npm warn Unknown env config "http-proxy"`, the server still starts normally. The warning comes from a legacy npm environment variable and can be ignored or removed with `npm config delete http-proxy` if you control the setting.
