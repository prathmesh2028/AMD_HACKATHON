# NutriEngine AI Backend

Production-ready backend for the real-time adaptive Health & Intelligence web application.

## Prerequisites
- Node.js > 18.x
- Google Gemini API Key
- (Optional) Firebase service account `serviceAccountKey.json` for persistent Firestore storage. If not present, the server uses an in-memory database fallback to ensure it builds perfectly for a hackathon.

## Getting Started

1. Navigate to your project folder:
    ```bash
    cd Hackathon
    ```
2. Install dependencies:
    ```bash
    npm install
    ```
3. Setup variables:
    Rename `.env.example` to `.env` and insert your Gemini API Key.
4. Start the server (Dev Mode):
    \`\`\`bash
    npm run dev
    \`\`\`

---

## Example API Usages
By default the app listens on \`http://localhost:5000\`.

### 1. Log Food (Triggers Intelligence)
\`\`\`bash
curl -X POST http://localhost:5000/api/log-food \
-H "Content-Type: application/json" \
-d '{"userId":"user123","food":"Samosa"}'
\`\`\`

### 2. Fetch Live Engine Context
\`\`\`bash
curl http://localhost:5000/api/context/user123
\`\`\`
*(Returns time gap, recent logs, derived hunger level, derived energy level, and hidden system triggers like \`LATE_NIGHT_WARNING\`)*

### 3. Generate Specific Output using AntiGravity Prompt Architecture
\`\`\`bash
# Run a chat request mimicking the AI coach.
curl -X POST http://localhost:5000/api/chat \
-H "Content-Type: application/json" \
-d '{"userId":"user123","input":"I am low on energy."}'
\`\`\`

---

## Deployment to Google Cloud Run (Dockerless)
As requested, here is how you can deploy this backend seamlessly:
1. Ensure you have the \`gcloud\` CLI installed and initialized.
2. Ensure Firestore is natively linked if using the same GCP project.
3. Run the following command from the \`backend/\` directory:
    \`\`\`bash
    gcloud run deploy nutriengine-backend \
      --source . \
      --platform managed \
      --region us-central1 \
      --allow-unauthenticated \
      --set-env-vars="GEMINI_API_KEY=your_key_here"
    \`\`\`
