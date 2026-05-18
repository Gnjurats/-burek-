# Deploying to Railway

## Prerequisites
- Railway account (railway.app)
- Anthropic API key

## Steps

1. **Create Railway Project**
   - Go to railway.app
   - Click "New Project" > "Deploy from GitHub repo"
   - Select the repository
   - Set root directory: `/agent`

2. **Configure Environment Variables**
   - In Railway dashboard, go to Variables
   - Add: `ANTHROPIC_API_KEY` = your_key_here
   - `PORT` is set automatically by Railway

3. **Deploy**
   - Railway auto-detects Python and deploys
   - Wait for deployment (2-3 minutes)
   - Note the public URL (e.g., https://xxx.up.railway.app)

4. **Update Next.js Frontend**
   - In Vercel dashboard, add environment variable:
   - `NEXT_PUBLIC_AGENT_URL` = your Railway URL
   - Redeploy Next.js

5. **Test**
   - Visit /assistant on burek.vercel.app
   - Send a test message
   - Should stream response from Claude

## Local Development

```bash
cd agent
pip install -r requirements.txt
export ANTHROPIC_API_KEY=your_key_here
python main.py
```

Server runs on http://localhost:8000

## Monitoring
- Railway provides logs in dashboard
- Check `/health` endpoint for uptime
- Monitor Anthropic API usage at console.anthropic.com

## Costs
- Railway: Free tier available, ~$5/month for always-on
- Anthropic: Pay per token (Claude Sonnet ~$3/million input tokens)
