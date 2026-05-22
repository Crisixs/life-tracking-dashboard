<#
.SYNOPSIS
    Build & Release Script fuer das Life Tracking Dashboard.
.USAGE
    .\release.ps1 -Version "1.3.1"
    .\release.ps1 -Version "1.4.0" -Message "Smart Home + System Monitor"
    .\release.ps1 -Version "1.4.0" -SkipGitHub
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$Version,

    [string]$Message = "",

    [switch]$SkipGitHub
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ProjectRoot

function Write-Step($text) {
    Write-Host ""
    Write-Host "[BUILD] $text" -ForegroundColor Cyan
}

function Write-Ok($text) {
    Write-Host "  [OK] $text" -ForegroundColor Green
}

function Write-Warn($text) {
    Write-Host "  [WARN] $text" -ForegroundColor Yellow
}

# --- Sicherheitscheck ---
Write-Step "Sicherheitscheck..."

$found = $false
$dangerousFiles = @(".env", "*.pem", "*.key")
foreach ($pattern in $dangerousFiles) {
    $gitFiles = git ls-files $pattern 2>$null
    if ($gitFiles) {
        Write-Host "  [FEHLER] '$pattern' ist im Git-Index! Entferne es zuerst." -ForegroundColor Red
        Write-Host "     git rm --cached $pattern" -ForegroundColor Yellow
        $found = $true
    }
}

# Check for hardcoded secrets in source
$srcFiles = Get-ChildItem -Path "src" -Recurse -Include "*.jsx","*.js" -ErrorAction SilentlyContinue
foreach ($file in $srcFiles) {
    $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
    if ($content -match 'password\s*=\s*"[^"]+"|api_key\s*=\s*"[^"]+"|PRIVATE.KEY') {
        Write-Host "  [FEHLER] Moegliches Secret in: $($file.Name)" -ForegroundColor Red
        $found = $true
    }
}

if ($found) {
    $continue = Read-Host "Secrets gefunden. Trotzdem fortfahren? (j/N)"
    if ($continue -ne "j") { exit 1 }
}
else {
    Write-Ok "Keine Secrets im Code gefunden"
}

# --- Version in package.json updaten ---
Write-Step "Version auf $Version setzen..."
$pkgContent = Get-Content "package.json" -Raw | ConvertFrom-Json
$pkgContent.version = $Version
$jsonString = $pkgContent | ConvertTo-Json -Depth 10
$utf8NoBom = [System.Text.UTF8Encoding]::new($false)
[System.IO.File]::WriteAllText("$PWD\package.json", $jsonString, $utf8NoBom)
Write-Ok "package.json aktualisiert"

# --- Dependencies installieren ---
Write-Step "Dependencies installieren..."
npm install --silent 2>$null
Write-Ok "npm install fertig"

# --- Production Build ---
Write-Step "Production Build..."
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "  [FEHLER] Build fehlgeschlagen!" -ForegroundColor Red
    exit 1
}
Write-Ok "Build erfolgreich"

# --- Release-ZIP erstellen ---
Write-Step "Release-ZIP erstellen..."
$releasesDir = Join-Path $ProjectRoot "releases"
if (!(Test-Path $releasesDir)) {
    New-Item -ItemType Directory -Path $releasesDir | Out-Null
}

$zipName = "life-tracking-dashboard-v$Version.zip"
$zipPath = Join-Path $releasesDir $zipName

$tempDir = Join-Path $env:TEMP "dashboard-release-$Version"
if (Test-Path $tempDir) { Remove-Item $tempDir -Recurse -Force }
New-Item -ItemType Directory -Path $tempDir | Out-Null

$include = @("src", "public", "dist", "package.json", "package-lock.json",
             "vite.config.js", "index.html", ".gitignore", ".env.example",
             "README.md", "SECURITY.md", "eslint.config.js")

foreach ($item in $include) {
    $source = Join-Path $ProjectRoot $item
    if (Test-Path $source) {
        $dest = Join-Path $tempDir $item
        if ((Get-Item $source).PSIsContainer) {
            Copy-Item $source $dest -Recurse
        }
        else {
            Copy-Item $source $dest
        }
    }
}

if (Test-Path $zipPath) { Remove-Item $zipPath }
Compress-Archive -Path "$tempDir\*" -DestinationPath $zipPath
Remove-Item $tempDir -Recurse -Force

$zipSize = [math]::Round((Get-Item $zipPath).Length / 1MB, 1)
Write-Ok "$zipName erstellt ($zipSize MB)"

# --- Git Commit & Tag ---
Write-Step "Git Commit und Tag..."
git add -A

if ($Message) {
    $commitMsg = "v$Version - $Message"
}
else {
    $commitMsg = "v$Version"
}

git commit -m $commitMsg
git tag -a "v$Version" -m $commitMsg
Write-Ok "Commit und Tag v$Version erstellt"

# --- Push ---
Write-Step "Push zu GitHub..."
$ErrorActionPreference = "SilentlyContinue"
git push origin main 2>&1 | Out-Null
git push origin "v$Version" 2>&1 | Out-Null
$ErrorActionPreference = "Stop"
Write-Ok "Code und Tag gepusht"

# --- GitHub Release ---
if (-not $SkipGitHub) {
    Write-Step "GitHub Release erstellen..."

    $ghInstalled = Get-Command gh -ErrorAction SilentlyContinue
    if ($ghInstalled) {
        $notes = "## Life Tracking Dashboard v$Version`n`n$Message`n`n"
        $notes += "### Installation`n"
        $notes += "1. ZIP entpacken`n"
        $notes += "2. npm install`n"
        $notes += "3. npm run dev`n"

        gh release create "v$Version" $zipPath --title "v$Version" --notes $notes
        Write-Ok "GitHub Release v$Version erstellt mit ZIP"
    }
    else {
        Write-Warn "GitHub CLI (gh) nicht installiert."
        Write-Host "  Installiere: winget install GitHub.cli" -ForegroundColor Yellow
        Write-Host "  Dann: gh auth login" -ForegroundColor Yellow
        Write-Host "  Release-ZIP liegt unter: $zipPath" -ForegroundColor Yellow
    }
}
else {
    Write-Ok "GitHub Release uebersprungen (-SkipGitHub)"
}

Write-Host ""
Write-Host "Release v$Version fertig!" -ForegroundColor Green
Write-Host "   ZIP: $zipPath" -ForegroundColor Gray
