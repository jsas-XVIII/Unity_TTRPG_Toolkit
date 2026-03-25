# Netlify Deployment Guide

## One-Time Setup

1. Push the repo to GitLab if you haven't already
2. Go to [netlify.com](https://netlify.com) and sign up with your GitLab account
3. Click **"Add new site" → "Import an existing project" → GitLab**
4. Select the `Unity_TTRPG_Toolkit` repository
5. Netlify will auto-detect `netlify.toml` — no manual config needed
6. Click **Deploy**

You'll get a URL like `https://random-name-123.netlify.app`. To rename it, go to **Site settings → Site details → Change site name**.

## Ongoing Deploys

Every `git push` to your main branch triggers an automatic rebuild and redeploy. No manual steps needed.

## Sharing With Players

Send your players the Netlify URL — that's it. No Node, no terminal, no installs. Each player's character data is saved in their own browser's localStorage.

## Files Added for Netlify

- `netlify.toml` — tells Netlify where to build from (`character-sheet/`) and where the output is (`dist/`)
- `character-sheet/public/_redirects` — ensures page refreshes don't return a 404
