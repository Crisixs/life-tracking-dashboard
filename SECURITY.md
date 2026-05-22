# 🔒 Sicherheits-Checkliste

## Aktueller Status: ✅ Sicher
Das Projekt speichert aktuell alles im Browser (localStorage) – **kein Backend, keine Secrets, keine API-Keys im Code**. Du kannst es bedenkenlos auf GitHub pushen.

---

## Was NICHT in Git gehört (via .gitignore geschützt)

| Datei/Ordner | Warum |
|---|---|
| `.env` | Enthält Passwörter, API-Keys, Datenbank-Credentials |
| `*.pem`, `*.key` | SSL-Zertifikate und Private Keys |
| `secrets/` | Ordner für sensible Konfiguration |
| `node_modules/` | Dependencies – werden via `npm install` neu heruntergeladen |

## Vor jedem Push prüfen

1. **Kein `.env` im Repo?** → `git status` zeigt es dir
2. **Keine hardcodierten Passwörter?** → Suche in VS Code nach `password`, `token`, `secret`, `key`
3. **`.env.example` aktuell?** → Neue Variablen dort eintragen (ohne echte Werte!)

## Wenn du versehentlich ein Secret gepusht hast

```bash
# Datei aus Git-History entfernen (Achtung: ändert die History!)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# Oder einfacher mit BFG Repo-Cleaner:
# https://rtyley.github.io/bfg-repo-cleaner/

# DANACH: Alle Passwörter/Keys sofort ändern!
```

## Später mit Pi: Sicherheits-Setup

Wenn der Pi mit Backend läuft, kommen diese Maßnahmen dazu:

### Umgebungsvariablen
- Alle Secrets in `.env` (nie committen!)
- `.env.example` als Vorlage mitliefern
- Im Code: `process.env.DB_PASSWORD` statt hardcodiert

### Netzwerk
- Dashboard nur im lokalen Netzwerk erreichbar
- Firewall auf dem Pi konfigurieren (ufw)
- HTTPS mit selbstsigniertem Zertifikat für lokales Netz

### Datenbank
- Eigener DB-User mit eingeschränkten Rechten
- Starkes Passwort (zufällig generiert)
- Backups auf der HDD (verschlüsselt mit GPG)

### Updates
- Regelmäßig `sudo apt update && sudo apt upgrade`
- Node.js Dependencies: `npm audit`
- Pi-hole und Home Assistant automatisch updaten
