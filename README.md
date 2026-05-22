# Life Tracking Dashboard

A personal all-in-one dashboard for tracking habits, fitness, sleep, finances, smart home, and more. Built with React + Vite, designed to run on a Raspberry Pi 5.

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

### Production Build

```bash
npm run build
```

### Create a Release

```powershell
.\release.ps1 -Version "1.5.0" -Message "Description"
```

---

## Features

### Dashboard (Main Page)

Central overview of all daily metrics at a glance.

**Stats Bar** displays tasks (done/total), habits (done/total), sleep (hours), and workout (minutes) for today.

**To-Do List** with three priority levels (High, Medium, Low). Color-coded labels, check-off functionality, inline editing via the pencil icon, and deletion. Completed tasks are greyed out and sorted to the bottom.

**Habit Tracker** with daily habits, colored icons, streak counter (consecutive days where ALL habits were completed), and a flame indicator. Add new habits with custom colors, edit or delete existing ones.

**Workout Tracker** for logging exercises with sets, reps, and weight. Displays today's training plan from the Training tab. Backfill entries for the past 7 days. "Check off" button when the planned training day is complete.

**Sleep Tracker** with bedtime/wake time input and quality rating (Great/Good/Okay/Bad). Comparison against a configurable sleep goal (default 8h, recommended 7-9h). Shows percentage of goal, deviation in hours, and a recovery tip. Backfill for 7 days.

**Goals** with progress bars (0-100%) and inline editing. **Notes** for quick thoughts (Ctrl+Enter to save), editable and deletable.

**Germany Comparison** showing your 7-day average vs. the German national average (Federal Statistical Office 2022, DKV Report 2025). Comparison bars for sleep, workout days, workout minutes, and habit consistency. Achievement badges like "More athletic than 54% of Germans" or "Top 15% Fitness".

---

### Training

Week-based training plan with daily views.

**Weekly Overview** with a 7-day grid showing emoji status (completed, rest day, planned, missed). Progress indicator (X/Y workouts completed).

**Day Plans** for each weekday with exercises including sets/reps/weight. Days can be marked as rest days. Expandable cards with full details.

**Retroactive Logging** allows marking missed training days as completed after the fact. Flexible for schedule changes.

---

### Budget

Complete financial management with visualizations.

**Transactions** for income and expenses with categories (Food, Transport, Entertainment, Shopping, Health, Bills, Other). Date picker for retroactive entries.

**Fixed Expenses** for recurring monthly costs (rent, insurance, etc.) managed separately.

**Income vs. Expenses** bar chart over 6 months. **Net Worth Growth** area chart of cumulative savings. **Category Breakdown** donut chart of expenses by category. **Debt Payoff** tracker with progress bar.

**52-Week Savings Challenge** with a visual grid of 52 weeks to check off. Three modes: Ascending (1/2/3...52 EUR), Fixed amount per week, or Random (1-50 EUR). Displays total saved and progress percentage.

**Subscription Manager** for all active subscriptions (Netflix, Spotify, etc.). Monthly, quarterly, or yearly billing cycles. Shows total cost per month and year.

**Wishlist** with savings progress per item tracked via slider and percentage display.

---

### Rewards (Gamification System)

Coin-based system that rewards positive behavior and penalizes negative behavior.

#### Earning Coins

| Action | Coins |
|---|---|
| To-Do completed | +10 |
| To-Do (high priority) | +20 |
| Habit completed | +15 |
| All habits in one day | +50 bonus |
| Workout completed | +30 |
| Sleep goal reached | +20 |
| 3-day habit streak | +50 |
| 7-day habit streak | +150 |
| 14-day habit streak | +350 |
| 30-day habit streak | +1000 |

#### Penalties (Automatically Calculated)

| Offense | Penalty |
|---|---|
| Missed habit | -10 per habit |
| Zero habits completed in a day | -30 |
| Streak broken (was 3+ days) | -50 |
| Streak broken (was 7+ days) | -150 |
| No workout for an entire week | -40 |
| Sleep under 5 hours | -15 |
| Relapse (manually reported) | -50 to -500 |

The penalty system is designed to be fair: a good day earns significantly more than a bad day costs. This keeps the system motivating rather than frustrating.

#### Relapse Reporting

Honesty over hiding. A dedicated button allows manual relapse reporting with an optional private note for self-reflection and a self-chosen penalty (50-500 coins). The system does not punish reporting itself but motivates continued effort.

#### Rank System

| Net Coins | Rank |
|---|---|
| 0+ | Newcomer |
| 100+ | Beginner |
| 500+ | Rising |
| 1500+ | Intermediate |
| 3000+ | Pro |
| 5000+ | Elite |
| 10000+ | Legend |

**Rewards** are user-defined with emoji, name, and coin cost. Redeemable when sufficient coins are available.

---

### Smart Home (Prototype)

Central control for all smart devices in the house.

**Room Controls** with current temperature, humidity, thermostat control (target temperature), and light switches with brightness sliders per room.

**Weather Widget** with current conditions for Regensburg, 7-day forecast, and heating recommendations based on the weather outlook.

**Scenes** like Good Morning, Movie Night, Good Night, and Away that control multiple devices simultaneously. Custom scenes can be created.

**Automation Log** showing what Home Assistant has done automatically today (schedules, motion sensors, geofence triggers, etc.).

**Energy Consumption** with electricity and gas usage as daily and monthly graphs. Average reference lines. Monthly energy costs as a bar chart.

**Device Consumption** showing estimated power usage per device (watts, hours/day, kWh/day, EUR/month).

Currently showing demo data. Will be connected to Home Assistant API once the Pi is running.

---

### Cloud (Prototype)

Nextcloud dashboard for the personal 4TB cloud.

**Storage Overview** with a ring diagram showing usage percentage. Breakdown by folder (Documents, Photos, Videos, Music, Backups) with colored bars.

**Connected Devices** with online/offline status and last sync time for all synchronized devices.

**Recently Synced** files with type icons, file size, and date.

**Upload/Download Stats** for daily data transfer. **Server Info** showing Raspberry Pi 5, Seagate 4TB HDD, Nextcloud version.

Currently showing demo data. Will be connected to Nextcloud API once the Pi is running.

---

### System (Prototype)

Live monitoring of the Raspberry Pi.

**System Gauges** showing half-circle gauges for CPU, RAM, temperature, and disk usage. Color changes at high load thresholds.

**CPU History** as a 60-second area chart. **Temperature History** as a 24-hour chart.

**Uptime Tracker** with a large display of continuous runtime (days, hours, minutes).

**System Info** showing hostname, kernel, local IP address, and dashboard URL.

**Network Monitor** listing all devices on the local network with name, IP, MAC address, and online status. Toggle between online-only and all devices.

**Pi-hole Statistics** with total queries, blocked queries, block rate percentage, and domains on the blocklist. Stacked bar chart of hourly queries (allowed vs. blocked). Top 5 blocked domains.

Currently showing demo data. Will be connected to Pi system APIs and Pi-hole REST API once the Pi is running.

---

### History

Historical data view with charts.

**Day/Week/Month** switchable time ranges with forward/backward navigation.

**Day View** showing detailed breakdown of a single day (sleep, workout, habits).

**Week View** with sleep as an area chart including a goal reference line, workout duration as bars, and habit completion percentage. Clickable day grid.

**Month View** with a calendar grid (Mon-Sun) featuring colored activity dots (sleep, workout, habits). Clicking a day opens the detail view.

**Summary Stats** with average sleep, workout count, and average habit completion per time range.

---

## Technology

| Component | Technology |
|---|---|
| Frontend | React 19 + Vite |
| Charts | Recharts |
| Icons | Lucide React |
| Fonts | Space Grotesk, JetBrains Mono |
| Storage | localStorage (database planned) |
| Design | Dark mode, CSS custom properties |

## Planned (Raspberry Pi Deployment)

- Node.js + Express backend
- PostgreSQL or SQLite database on 4TB HDD
- Home Assistant API integration (live smart home data)
- Nextcloud API integration (live cloud data)
- Pi system monitoring via /proc and vcgencmd
- Pi-hole REST API integration
- Automated backups to HDD
- Network access from all devices
- Responsive design for mobile

## Security

See [SECURITY.md](SECURITY.md) for the full security policy. No secrets in code, credentials via .env files, release script includes automated secret scanning.

## Project Structure

```
src/
  App.jsx                  Main app with tab navigation
  index.css                Global styles and CSS variables
  components/
    Header.jsx             Greeting and date display
    StatsRow.jsx           Daily statistics
    TodoList.jsx           To-do list with priorities
    HabitTracker.jsx       Habit tracker with streaks
    WorkoutTracker.jsx     Workout logger
    SleepTracker.jsx       Sleep tracker with goal comparison
    Goals.jsx              Goals with progress bars
    Notes.jsx              Quick notes
    Card.jsx               Reusable card component
    TrainingPlan.jsx       Weekly training plan
    BudgetTracker.jsx      Finance tracker with charts
    BudgetExtended.jsx     Savings challenge, subscriptions, wishlist
    RewardSystem.jsx       Coin system with rewards and penalties
    SmartHomePanel.jsx     Room and energy controls
    SmartHomeExtended.jsx  Weather, scenes, automation log
    CloudPanel.jsx         Nextcloud dashboard
    SystemPanel.jsx        Pi system monitor, network, Pi-hole
    HistoryView.jsx        History with day/week/month views
    GermanComparison.jsx   Germany comparison with badges
```

## Version History

| Version | Changes |
|---|---|
| 1.0.0 | Dashboard, to-dos, habits, workout, sleep, goals, notes |
| 1.1.0 | Edit buttons, Germany comparison |
| 1.2.0 | Smart home panel, cloud panel |
| 1.3.0 | Extended budget, weather, scenes, system monitor |
| 1.3.1 | Security setup, release script |
| 1.4.0 | Reward system with coins and ranks |
| 1.5.0 | Penalty system, relapse reporting, documentation |

## License

Private project by Jonas Kresse.
