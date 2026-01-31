$FixListPath = ".\bidra-launch-fixes.json"

function Save-Fixes {
  param($Fixes)
  $Fixes | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $FixListPath -Encoding UTF8
}

function Load-Fixes {
  if(!(Test-Path -LiteralPath $FixListPath)){ return $null }
  return (Get-Content -LiteralPath $FixListPath) -join "`n" | ConvertFrom-Json
}

$Fixes = Load-Fixes

function Show-FixList {
  $Fixes | Sort-Object Id | ForEach-Object {
    $status = if ($_.Done) { "[✔]" } else { "[ ]" }
    "{0} {1}. {2}" -f $status, $_.Id, $_.Text
  }
}

function Complete-Fix {
  param([int]$Id)
  $item = $Fixes | Where-Object { $_.Id -eq $Id }
  if ($null -eq $item) { Write-Host "Fix ID not found"; return }
  $item.Done = $true
  Save-Fixes -Fixes $Fixes
  Write-Host "Marked fix $Id as complete"
}

function Reset-Fix {
  param([int]$Id)
  $item = $Fixes | Where-Object { $_.Id -eq $Id }
  if ($null -eq $item) { Write-Host "Fix ID not found"; return }
  $item.Done = $false
  Save-Fixes -Fixes $Fixes
  Write-Host ("Reset fix {0}" -f $Id)
}
