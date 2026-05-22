**aufrufbarkeit auf mehreren geräten, Handy PC etc.** 

Mehrere Geräte? Wenn der Pi läuft, ist das Dashboard eine Web-App im lokalen Netzwerk. Du tippst einfach die IP des Pi im Browser ein (z.B. 192.168.1.50:3000) und kannst es von Handy, Tablet, Laptop, egal was, aufrufen. Alle sehen die gleichen Daten, weil alles zentral auf dem Pi in der Datenbank liegt. Wir können auch einen schönen Hostnamen einrichten, z.B. dashboard.local, damit du dir keine IP merken musst.



**vergleich mit deutschem durchschnitt, wann top, wo bin ich besser schlechter stats**

"Du vs. Deutschland"-Vergleich – Neues Modul ganz unten im Dashboard. Zeigt deinen 7-Tage-Durchschnitt vs. den deutschen Durchschnitt mit visuellen Vergleichsbalken für Schlaf pro Nacht (DE ⌀: 8.3h laut Statistischem Bundesamt), Workout-Tage pro Woche (DE ⌀: 2.5 Tage), Workout-Minuten pro Woche (DE ⌀: 238min), und Gewohnheiten-Konsistenz. Dazu gibt es Auszeichnungen/Badges wie "Sportlicher als 54% der Deutschen" oder "Top 15% Fitness" wenn du gewisse Schwellen überschreitest.



**was wenn Raspberry pi irgendwann kaputt ? Möglich zum transferieren und Setup nur mit sd karte \& alle daten und Projekte bleiben erhalten,** 

**speichern der Daten aus der Datenbank auf der HDD ? 4 TB sollten ja dafür erstmal reichen**

Was wenn der Pi kaputt geht? Dafür richten wir automatische Backups ein. Die Datenbank liegt auf der 4 TB HDD, und wir machen regelmäßige Backup-Dumps (z.B. täglich). Wenn der Pi stirbt, kaufst du einen neuen, steckst die HDD ran, installierst das System neu von der SD-Karte, und stellst das Backup wieder her. Alles da. 4 TB reicht dafür locker – die Datenbank wird selbst nach Jahren nur ein paar GB groß.

