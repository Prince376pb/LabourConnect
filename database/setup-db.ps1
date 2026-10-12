# PowerShell script to initialize the Labour Connect database
param(
    [string]$HostName = "localhost",
    [int]$Port = 5432,
    [string]$User = "postgres",
    [string]$Database = "labour_connect"
)

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host " Labour Connect Database Initializer     " -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

$psqlPath = "C:\Program Files\PostgreSQL\16\bin\psql.exe"
if (-not (Test-Path $psqlPath)) {
    $psqlCmd = Get-Command psql -ErrorAction SilentlyContinue
    if ($psqlCmd) {
        $psqlPath = $psqlCmd.Source
    } else {
        Write-Error "Could not locate psql.exe. Please ensure PostgreSQL is installed."
        exit 1
    }
}

Write-Host "Checking if database '$Database' exists..." -ForegroundColor Yellow
$checkDbCmd = "& `"$psqlPath`" -h $HostName -p $Port -U $User -tAc `"SELECT 1 FROM pg_database WHERE datname='$Database'`""

$dbExists = Invoke-Expression $checkDbCmd

if ($dbExists -eq "1") {
    Write-Host "Database '$Database' already exists!" -ForegroundColor Green
} else {
    Write-Host "Database '$Database' does not exist. Creating now..." -ForegroundColor Yellow
    $createDbCmd = "& `"$psqlPath`" -h $HostName -p $Port -U $User -c `"CREATE DATABASE $Database;`""
    Invoke-Expression $createDbCmd
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Database '$Database' successfully created!" -ForegroundColor Green
    } else {
        Write-Error "Failed to create database. Please check credentials."
        exit $LASTEXITCODE
    }
}

Write-Host "Database setup complete! Flyway will run schema migrations on backend startup." -ForegroundColor Cyan
