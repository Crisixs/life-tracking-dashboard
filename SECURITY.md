# Security Policy

## Current Status: Safe

The project currently stores all data in the browser (localStorage). There is no backend, no API keys, no secrets, and no credentials in the source code. It is safe to push to GitHub as-is.

---

## Files That Must Never Be Committed

| File / Directory | Reason |
|---|---|
| `.env` | Contains passwords, API keys, database credentials |
| `*.pem`, `*.key`, `*.cert` | SSL certificates and private keys |
| `secrets/` | Directory for sensitive configuration files |
| `credentials/` | Directory for credential files |
| `node_modules/` | Dependencies, reinstalled via `npm install` |

All of the above are listed in `.gitignore` and will not be tracked by Git.

---

## Pre-Push Checklist

1. Run `git status` to verify no `.env` or key files are staged
2. Search the codebase for hardcoded strings: `password`, `token`, `secret`, `api_key`
3. Keep `.env.example` updated with any new environment variables (without real values)
4. The release script (`release.ps1`) runs an automated secret scan before every build

---

## If You Accidentally Push a Secret

Remove the file from Git history immediately:

```bash
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all
```

Alternatively, use BFG Repo-Cleaner (faster for large repos):
https://rtyley.github.io/bfg-repo-cleaner/

After removing the file from history, rotate all affected passwords and API keys immediately.

---

## Future Security Measures (Raspberry Pi Deployment)

### Environment Variables

- All secrets stored in `.env` (never committed)
- `.env.example` serves as a template
- Application code references `process.env.DB_PASSWORD`, never hardcoded values

### Network

- Dashboard accessible only within the local network
- Firewall configured on the Pi using `ufw`
- HTTPS with self-signed certificate for local network traffic

### Database

- Dedicated database user with restricted permissions
- Strong randomly generated password
- Encrypted backups on the HDD using GPG

### System Updates

- Regular OS updates: `sudo apt update && sudo apt upgrade`
- Dependency auditing: `npm audit`
- Pi-hole and Home Assistant kept up to date

### Backup Strategy

- Daily automated database dumps to the 4TB HDD
- If the Pi fails: new Pi, same HDD, restore from backup
- Backup scripts will be added to the repository (without credentials)

---

## Reporting Vulnerabilities

This is a private project. If you discover a security issue, contact the repository owner directly.
