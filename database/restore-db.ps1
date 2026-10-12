# PowerShell script to restore the Labour Connect database
param(
    [Parameter(Mandatory=$true)]
    [string]$BackupFile,
    [string]$HostName = "localhost",
    [int]$Port = 5432,
    [string]$User = "postgres",
    [string]$Database = "labour_connect"
)

if (-not (Test-Path $BackupFile)) {
    Write-Error "Backup file '$BackupFile' does not exist."
    exit 1
}

$psqlPath = "C:\Program Files\PostgreSQL\16\bin\psql.exe"

Write-Host "Restoring database '$Database' from '$BackupFile'..." -ForegroundColor Cyan
& $psqlPath -h $HostName -p $Port -U $User -d $Database -f $BackupFile

if ($LASTEXITCODE -eq 0) {
    Write-Host "Restoration completed successfully!" -ForegroundColor Green
} else {
    Write-Error "Restoration failed with exit code $LASTEXITCODE."
}
