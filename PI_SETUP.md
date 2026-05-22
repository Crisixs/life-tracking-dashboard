# Raspberry Pi 5 Setup Guide

Step-by-step guide for setting up the Raspberry Pi 5 as a home server running the Life Tracking Dashboard, Pi-hole, Home Assistant, and Nextcloud.

---

## Prerequisites

- Raspberry Pi 5 (8GB RAM)
- Official Pi 5 case with fan
- Official Pi 5 power supply (27W USB-C)
- microSD card (32GB, Class 10 / A2)
- Seagate Expansion 4TB HDD (USB 3.0)
- PC with Raspberry Pi Imager installed
- Local network (WiFi or Ethernet)

---

## Step 1: Flash the SD Card

1. Download and install Raspberry Pi Imager from https://www.raspberrypi.com/software/
2. Insert the microSD card into your PC
3. Open Raspberry Pi Imager
4. Select OS: Raspberry Pi OS (64-bit) - Lite (no desktop, server use)
5. Select your SD card as target
6. Click the gear icon (settings) before writing:
   - Set hostname: `raspberrypi`
   - Enable SSH (password authentication)
   - Set username: `jonas`
   - Set password: (choose a strong one)
   - Configure WiFi: your SSID and password
   - Set locale: Europe/Berlin, keyboard layout DE
7. Click Write and wait for completion

---

## Step 2: First Boot

1. Insert SD card into the Pi
2. Connect the Seagate HDD to a blue USB 3.0 port
3. Connect Ethernet cable (recommended) or rely on WiFi
4. Plug in the power supply
5. Wait 1-2 minutes for the Pi to boot

---

## Step 3: Connect via SSH

From your PC (PowerShell or Terminal):

```bash
ssh jonas@raspberrypi.local
```

If `raspberrypi.local` does not resolve, find the Pi IP in your router admin panel and use:

```bash
ssh jonas@192.168.1.XX
```

---

## Step 4: System Update

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl wget htop
```

---

## Step 5: Mount the 4TB HDD

Find the drive:

```bash
lsblk
```

Look for the 4TB drive (likely /dev/sda1). Create a mount point and mount it:

```bash
sudo mkdir -p /mnt/hdd
sudo mount /dev/sda1 /mnt/hdd
```

Verify it works:

```bash
df -h /mnt/hdd
```

Make it permanent (auto-mount on boot):

```bash
sudo blkid /dev/sda1
```

Copy the UUID, then edit fstab:

```bash
sudo nano /etc/fstab
```

Add this line (replace YOUR-UUID):

```
UUID=YOUR-UUID /mnt/hdd ntfs-3g defaults,nofail 0 0
```

If the drive is ext4 instead of NTFS:

```
UUID=YOUR-UUID /mnt/hdd ext4 defaults,nofail 0 0
```

Save and test:

```bash
sudo mount -a
```

---

## Step 6: Install Docker

Docker makes it easy to run multiple services in isolated containers.

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker jonas
```

Log out and back in for the group change to take effect:

```bash
exit
ssh jonas@raspberrypi.local
```

Verify Docker works:

```bash
docker --version
docker run hello-world
```

Install Docker Compose:

```bash
sudo apt install -y docker-compose-plugin
```

---

## Step 7: Create Project Directory

```bash
mkdir -p ~/docker
cd ~/docker
```

---

## Step 8: Install Pi-hole (Ad Blocker)

Create the compose file:

```bash
mkdir -p ~/docker/pihole
cat > ~/docker/pihole/docker-compose.yml << 'EOF'
version: "3"
services:
  pihole:
    container_name: pihole
    image: pihole/pihole:latest
    ports:
      - "53:53/tcp"
      - "53:53/udp"
      - "8080:80/tcp"
    environment:
      TZ: 'Europe/Berlin'
      WEBPASSWORD: 'changeme'
    volumes:
      - './etc-pihole:/etc/pihole'
      - './etc-dnsmasq.d:/etc/dnsmasq.d'
    restart: unless-stopped
EOF
```

Start Pi-hole:

```bash
cd ~/docker/pihole
docker compose up -d
```

Access Pi-hole at: http://raspberrypi.local:8080/admin

Change the WEBPASSWORD in the compose file to something secure.

To use Pi-hole as your DNS: set your router DNS to the Pi IP address.

---

## Step 9: Install Home Assistant

```bash
mkdir -p ~/docker/homeassistant
cat > ~/docker/homeassistant/docker-compose.yml << 'EOF'
version: "3"
services:
  homeassistant:
    container_name: homeassistant
    image: ghcr.io/home-assistant/home-assistant:stable
    ports:
      - "8123:8123"
    volumes:
      - './config:/config'
    environment:
      TZ: 'Europe/Berlin'
    restart: unless-stopped
    privileged: true
    network_mode: host
EOF
```

Start Home Assistant:

```bash
cd ~/docker/homeassistant
docker compose up -d
```

Access Home Assistant at: http://raspberrypi.local:8123

First-time setup will guide you through creating an account.

---

## Step 10: Install Nextcloud

```bash
mkdir -p ~/docker/nextcloud
cat > ~/docker/nextcloud/docker-compose.yml << 'EOF'
version: "3"
services:
  nextcloud:
    container_name: nextcloud
    image: nextcloud:latest
    ports:
      - "8082:80"
    volumes:
      - './data:/var/www/html'
      - '/mnt/hdd/nextcloud-data:/var/www/html/data'
    environment:
      SQLITE_DATABASE: nextcloud
    restart: unless-stopped

  nextcloud-cron:
    container_name: nextcloud-cron
    image: nextcloud:latest
    volumes:
      - './data:/var/www/html'
      - '/mnt/hdd/nextcloud-data:/var/www/html/data'
    entrypoint: /cron.sh
    restart: unless-stopped
    depends_on:
      - nextcloud
EOF
```

Start Nextcloud:

```bash
cd ~/docker/nextcloud
docker compose up -d
```

Access Nextcloud at: http://raspberrypi.local:8082

The 4TB HDD is mounted as the data directory, so all your files are stored there.

---

## Step 11: Deploy the Dashboard

Install Node.js on the Pi:

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
```

Clone the dashboard:

```bash
cd ~
git clone https://github.com/Crisixs/life-tracking-dashboard.git
cd life-tracking-dashboard
npm install
```

Build for production:

```bash
npm run build
```

Install a simple static server:

```bash
sudo npm install -g serve
```

Run the dashboard:

```bash
serve -s dist -l 3000
```

Access from any device: http://raspberrypi.local:3000

To keep it running in the background:

```bash
nohup serve -s dist -l 3000 &
```

Or set up as a systemd service for auto-start on boot:

```bash
sudo cat > /etc/systemd/system/dashboard.service << 'EOF'
[Unit]
Description=Life Tracking Dashboard
After=network.target

[Service]
Type=simple
User=jonas
WorkingDirectory=/home/jonas/life-tracking-dashboard
ExecStart=/usr/bin/serve -s dist -l 3000
Restart=always

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl enable dashboard
sudo systemctl start dashboard
```

---

## Step 12: Automated Backups

Create a backup script:

```bash
cat > ~/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/mnt/hdd/backups"
DATE=$(date +%Y%m%d_%H%M)
mkdir -p $BACKUP_DIR

# Pi-hole config
tar -czf $BACKUP_DIR/pihole_$DATE.tar.gz -C ~/docker/pihole etc-pihole

# Home Assistant config
tar -czf $BACKUP_DIR/homeassistant_$DATE.tar.gz -C ~/docker/homeassistant config

# Dashboard data (when using database later)
# pg_dump dashboard > $BACKUP_DIR/dashboard_$DATE.sql

# Keep only last 30 days
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete

echo "Backup completed: $DATE"
EOF

chmod +x ~/backup.sh
```

Schedule daily backups with cron:

```bash
crontab -e
```

Add this line (runs at 3 AM daily):

```
0 3 * * * /home/jonas/backup.sh >> /mnt/hdd/backups/backup.log 2>&1
```

---

## Service Overview

| Service | Port | URL |
|---|---|---|
| Dashboard | 3000 | http://raspberrypi.local:3000 |
| Pi-hole | 8080 | http://raspberrypi.local:8080/admin |
| Home Assistant | 8123 | http://raspberrypi.local:8123 |
| Nextcloud | 8082 | http://raspberrypi.local:8082 |

---

## Useful Commands

```bash
# Check running containers
docker ps

# View container logs
docker logs pihole
docker logs homeassistant
docker logs nextcloud

# Restart a service
cd ~/docker/pihole && docker compose restart

# Check disk space
df -h

# Check Pi temperature
vcgencmd measure_temp

# Check system resources
htop

# Check HDD health
sudo smartctl -a /dev/sda
```

---

## Troubleshooting

**Cannot connect via SSH**: Check if the Pi is on the network. Try pinging `raspberrypi.local`. If that fails, check your router for the Pi IP address.

**HDD not mounting**: Run `lsblk` to verify the drive is detected. Check the filesystem type. If NTFS, install `ntfs-3g`: `sudo apt install ntfs-3g`.

**Docker container not starting**: Check logs with `docker logs containername`. Common issue: port already in use. Change the port mapping in docker-compose.yml.

**Pi running hot**: Verify the fan is connected and spinning. Check temperature with `vcgencmd measure_temp`. Under 70C is fine, above 80C indicates a cooling problem.
