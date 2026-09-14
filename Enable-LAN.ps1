#Requires -RunAsAdministrator
$ErrorActionPreference = "Continue"
$ports = @(8700, 3850, 8090)
foreach ($p in $ports) {
  $name = "Beelink-Games-$p"
  Get-NetFirewallRule -DisplayName $name -ErrorAction SilentlyContinue | Remove-NetFirewallRule -ErrorAction SilentlyContinue
  New-NetFirewallRule -DisplayName $name -Direction Inbound -Action Allow -Protocol TCP -LocalPort $p -Profile Any | Out-Null
  Write-Host "firewall ok $p"
  try {
    netsh http delete urlacl url="http://+:$p/" 2>$null | Out-Null
  } catch {}
}
Write-Host "LAN ports opened: $($ports -join ', ')"