param(
  [Parameter(Mandatory = $true)]
  [string]$UserId,

  [string]$BackupFile
)

$progressDir = Join-Path $PSScriptRoot "..\.data\progress"
$backupDir = Join-Path $PSScriptRoot "..\.data\progress-backups"
$target = Join-Path $progressDir "$UserId.json"

if (-not $BackupFile) {
  Get-ChildItem $backupDir -File -Filter "$UserId-*.json" |
    Sort-Object LastWriteTime -Descending |
    Select-Object FullName, LastWriteTime, Length
  exit 0
}

if (-not (Test-Path $BackupFile)) {
  throw "Backup file not found: $BackupFile"
}

Copy-Item -LiteralPath $BackupFile -Destination $target -Force
Write-Output "Restored $BackupFile to $target"
