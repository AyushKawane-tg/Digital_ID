# TeleGlobal Digital Card Platform - start script
#
# Serves the site on all network interfaces so it is reachable at both
#   http://localhost:8000
#   http://10.11.12.174:8000   (your LAN IP - use this on phones)
#
# Run from the backend folder:
#   powershell -ExecutionPolicy Bypass -File .\start.ps1
# or right-click > Run with PowerShell.

$ErrorActionPreference = "Stop"

# Move to the folder this script lives in (backend/).
Set-Location -Path $PSScriptRoot

# Show the address the site will be reachable at.
$lanIp = (Get-NetIPAddress -AddressFamily IPv4 |
    Where-Object { $_.IPAddress -notlike '127.*' -and $_.IPAddress -notlike '169.*' } |
    Select-Object -First 1 -ExpandProperty IPAddress)

Write-Host ""
Write-Host "Starting TeleGlobal Digital Card Platform..." -ForegroundColor Cyan
Write-Host "  Local:   http://localhost:8000"
if ($lanIp) {
    Write-Host "  Network: http://$($lanIp):8000  (open this on your phone)" -ForegroundColor Green
}
Write-Host ""

# Start the server bound to every interface.
py -m uvicorn app.main:app --host 0.0.0.0 --port 8000
