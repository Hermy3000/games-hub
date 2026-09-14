@echo off
powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process powershell -Verb RunAs -ArgumentList '-NoProfile -ExecutionPolicy Bypass -File \"%~dp0Enable-LAN.ps1\"' -Wait"
echo Firewall updated for ports 8700, 3850, 8090.
pause
