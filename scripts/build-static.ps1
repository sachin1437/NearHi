# Windows version of build-static.sh. Run from the repo root:  .\scripts\build-static.ps1
# Set $env:FORCE = "1" to delete files in static/ that the build does not produce.
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$keep = @("vendor", "models")   # git-ignored local downloads, left alone

Push-Location "$root\web"
npm ci;        if ($LASTEXITCODE -ne 0) { Pop-Location; throw "npm ci failed" }
npm run build; if ($LASTEXITCODE -ne 0) { Pop-Location; throw "npm run build failed" }
Pop-Location

$orphans = @()
if (Test-Path "$root\static") {
  $base = (Resolve-Path "$root\static").Path
  $orphans = Get-ChildItem $base -Recurse -File | ForEach-Object {
    $rel = $_.FullName.Substring($base.Length + 1)
    $top = $rel.Split("\")[0]
    if ($keep -contains $top -or $top -eq "_next") { return }
    if (-not (Test-Path "$root\web\out\$rel")) { $rel }
  }
}
if ($orphans -and $env:FORCE -ne "1") {
  Write-Host "Stopped: these files exist in static/ but not in the build, and would be deleted:" -ForegroundColor Yellow
  $orphans | ForEach-Object { Write-Host "  $_" }
  Write-Host "Move them into web\public\ (same relative path) and run again, or set `$env:FORCE = '1'."
  exit 1
}

$tmp = Join-Path $env:TEMP "nearhi-keep"
Remove-Item $tmp -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory $tmp | Out-Null
foreach ($d in $keep) { if (Test-Path "$root\static\$d") { Move-Item "$root\static\$d" "$tmp\$d" } }
Remove-Item "$root\static" -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item "$root\web\out" "$root\static" -Recurse
foreach ($d in $keep) { if (Test-Path "$tmp\$d") { Move-Item "$tmp\$d" "$root\static\$d" } }
Remove-Item $tmp -Recurse -Force
Write-Host "static/ refreshed from web/out"
