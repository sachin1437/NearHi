# Downloads the 14 stock photos used on the landing page into web\public\photos.
# Run once from the repo folder:  .\scripts\fetch-photos.ps1
$ErrorActionPreference = "Stop"
$dest = Join-Path $PSScriptRoot "..\web\public\photos"
New-Item -ItemType Directory -Force -Path $dest | Out-Null

# id, width, height
$photos = @(
  @(5500446, 800, 1000), @(17910791, 800, 1000), @(33482275, 800, 1000), @(39592548, 800, 1000),
  @(11091224, 800, 1000), @(14999138, 800, 1000), @(6591121, 800, 1000), @(19501550, 800, 1000),
  @(11160638, 800, 1000), @(2379004, 800, 1000),
  @(8111297, 1400, 1050), @(5063102, 1400, 1050), @(8111327, 1400, 1050), @(5054648, 1400, 1050)
)

$failed = @()
foreach ($p in $photos) {
  $id = $p[0]
  $url = "https://images.pexels.com/photos/$id/pexels-photo-$id.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=$($p[1])&h=$($p[2])"
  $out = Join-Path $dest "$id.jpg"
  try {
    Invoke-WebRequest -Uri $url -OutFile $out -UseBasicParsing
    Write-Host "ok   $id.jpg ($([math]::Round((Get-Item $out).Length / 1KB)) KB)"
  } catch {
    Write-Host "FAIL $id.jpg"
    $failed += $id
  }
}
if ($failed.Count -gt 0) { Write-Host "`nFailed: $($failed -join ', '). Re-run, or save them by hand into web\public\photos as <id>.jpg"; exit 1 }
Write-Host "`nAll 14 photos saved in web\public\photos"