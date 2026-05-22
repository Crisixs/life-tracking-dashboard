# Life Tracking Dashboard

Ein persoenliches All-in-One Dashboard zum Tracken von Gewohnheiten, Fitness, Schlaf, Finanzen, Smart Home und mehr. Gebaut mit React + Vite, designed fuer den Betrieb auf einem Raspberry Pi 5.

## Quick Start

```bash
npm install
npm run dev
```

Oeffne http://localhost:5173 im Browser.

### Production Build

```bash
npm run build
```

### Release erstellen

```powershell
.\release.ps1 -Version "1.5.0" -Message "Beschreibung"
```

---

## Features

### Dashboard (Hauptseite)

Die zentrale Uebersicht mit allen wichtigen Tages-Metriken auf einen Blick.

**Stats-Leiste** zeigt Aufgaben, Habits, Schlaf und Workout fuer heute.

**To-Do Liste** mit drei Prioritaetsstufen (Hoch, Mittel, Niedrig), farbcodierten Labels, Inline-Bearbeitung ueber das Stift-Icon, und Loeschen.

**Gewohnheits-Tracker** mit taeglichen Habits, farbigen Icons, Streak-Zaehler und Flammen-Anzeige. Neue Habits mit Custom-Farbe hinzufuegen, bearbeiten oder loeschen.

**Workout-Tracker** zum Loggen von Uebungen mit Sets, Reps und Gewicht. Zeigt den Trainingsplan, rueckwirkend eintragbar fuer 7 Tage.

**Schlaf-Tracker** mit Einschlaf-/Aufwachzeit, Qualitaetsbewertung, Vergleich mit konfiguriertem Schlafziel (7-9h empfohlen), und Regenerations-Tipps.

**Ziele** mit Fortschrittsbalken 0-100%, **Notizen** fuer schnelle Gedanken (Ctrl+Enter).

**Deutschland-Vergleich** mit 7-Tage-Durchschnitt vs. deutschem Durchschnitt (Statistisches Bundesamt, DKV-Report 2025). Achievement-Badges wie "Sportlicher als 54% der Deutschen".

---

### Training

Wochenbasierter Trainingsplan. Fuer jeden Wochentag Uebungen mit Sets/Reps/Gewicht hinterlegen. Wochenuebersicht mit Emoji-Status. Ruhetage markierbar. Nachtraegliches Eintragen moeglich.

---

### Budget

**Transaktionen** mit Kategorien (Essen, Transport, Freizeit, Shopping, Gesundheit, Rechnungen). **Fixkosten** separat verwalten. **Graphen** fuer Einnahmen vs. Ausgaben, Vermoegensaufbau, Kategorie-Donut. **Schuldenabbau** mit Fortschrittsbalken.

**52-Wochen Spar-Challenge** mit visuellem Grid. Modi: Aufsteigend, Fix, Zufaellig.

**Abo-Manager** fuer alle laufenden Abos mit Gesamtkosten pro Monat/Jahr.

**Wunschliste** mit Spar-Fortschritt pro Item.

---

### Rewards (Belohnungssystem)

Gamification das gutes Verhalten belohnt und schlechtes bestraft.

#### Coins verdienen

| Aktion | Coins |
|---|---|
| To-Do erledigt | +10 |
| To-Do hohe Prioritaet | +20 |
| Gewohnheit erfuellt | +15 |
| Alle Habits an einem Tag | +50 Bonus |
| Workout absolviert | +30 |
| Schlafziel erreicht | +20 |
| 3-Tage Streak | +50 |
| 7-Tage Streak | +150 |
| 14-Tage Streak | +350 |
| 30-Tage Streak | +1000 |

#### Strafen (automatisch berechnet)

| Vergehen | Strafe |
|---|---|
| Habit nicht erfuellt | -10 pro Habit |
| Kein einziger Habit am Tag | -30 |
| Streak gebrochen (war 3+ Tage) | -50 |
| Streak gebrochen (war 7+ Tage) | -150 |
| Ganze Woche kein Workout | -40 |
| Schlaf unter 5 Stunden | -15 |
| Rueckfall (manuell gemeldet) | -50 bis -500 |

Das Strafsystem ist fair designed: Verpasste Habits kosten Coins, aber weniger als man durch Erfuellung verdient. So bleibt das System motivierend statt frustrierend. Ein perfekter Tag bringt deutlich mehr ein als ein schlechter Tag kostet.

#### Rueckfall-System

Ehrlich melden statt verstecken. Button zum manuellen Eintragen mit optionaler Notiz und selbst gewaehlter Strafe (50-500 Coins). Die Notiz ist nur fuer dich zur Reflexion. Das System bestraft nicht das Melden, sondern motiviert weiterzumachen.

#### Rang-System

| Netto-Coins | Rang |
|---|---|
| 0+ | Neuling |
| 100+ | Anfaenger |
| 500+ | Aufsteiger |
| 1500+ | Fortgeschritten |
| 3000+ | Profi |
| 5000+ | Elite |
| 10000+ | Legende |

**Belohnungen** selbst definieren mit Emoji, Name und Coin-Preis. Einloesen wenn genug Coins da sind.

---

### Smart Home (Prototyp)

**Raumsteuerung** mit Temperatur, Luftfeuchtigkeit, Thermostat und Lichtsteuerung pro Raum.

**Wetter-Widget** mit 7-Tage-Vorhersage und Heizungs-Tipps.

**Szenen** wie Guten Morgen, Filmabend, Gute Nacht die mehrere Geraete gleichzeitig steuern.

**Automatisierungs-Log** zeigt was Home Assistant automatisch gemacht hat.

**Energieverbrauch** mit Strom/Gas-Graphen, Kostenvergleich und Geraeteverbrauch.

---

### Cloud (Prototyp)

**Speicher-Ring** mit Belegung, Aufschluesselung nach Ordner, verbundene Geraete mit Sync-Status, zuletzt synchronisierte Dateien, Server-Info.

---

### System (Prototyp)

**Pi System-Monitor** mit CPU, RAM, Temperatur Gauges. **CPU/Temperatur-Verlauf** als Live-Graphen. **Uptime-Tracker**. **Netzwerk-Monitor** mit allen WLAN-Geraeten. **Pi-hole Stats** mit Blockrate, stuendlichen Anfragen und Top geblockte Domains.

---

### Verlauf

**Tag/Woche/Monat** umschaltbar mit Navigation. Schlaf-Chart mit Ziellinie, Workout-Balken, Habit-Prozent. Klickbare Tage-Grids. Monatskalender mit farbigen Aktivitaets-Dots.

---

## Technologie

| Komponente | Technologie |
|---|---|
| Frontend | React 19 + Vite |
| Charts | Recharts |
| Icons | Lucide React |
| Fonts | Space Grotesk, JetBrains Mono |
| Speicherung | localStorage (spaeter DB) |
| Design | Dark Mode, CSS Custom Properties |

## Geplant (Raspberry Pi)

- Node.js + Express Backend
- PostgreSQL/SQLite auf 4TB HDD
- Home Assistant API (Live Smart Home Daten)
- Nextcloud API (Live Cloud Daten)
- Pi System-Monitoring (/proc, vcgencmd)
- Pi-hole REST-API
- Automatische Backups (HDD)
- Netzwerk-Zugriff von allen Geraeten
- Responsive Design fuer Mobile

## Sicherheit

Siehe [SECURITY.md](SECURITY.md) fuer Details. Keine Secrets im Code, .env fuer Credentials, Release-Script prueft automatisch.

## Versionen

| Version | Features |
|---|---|
| 1.0.0 | Dashboard, To-Do, Habits, Workout, Schlaf, Ziele, Notizen |
| 1.1.0 | Edit-Buttons, Deutschland-Vergleich |
| 1.2.0 | Smart Home Panel, Cloud Panel |
| 1.3.0 | Budget erweitert, Wetter, Szenen, System Monitor |
| 1.3.1 | Security Setup, Release Script |
| 1.4.0 | Reward System mit Coins und Raengen |
| 1.5.0 | Penalty System, Rueckfall-Meldung, README |

## Lizenz

Privates Projekt von Jonas Kresse.
