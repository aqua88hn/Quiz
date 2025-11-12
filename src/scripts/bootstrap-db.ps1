################################################################
# Bootstrap the PostgreSQL database inside a Docker container.
# It checks if the database and role exist, applies initialization,
# migrations, and seeds data as needed.
# Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
# .\scripts\bootstrap-db.ps1 -Container postgres-quiz
################################################################



param(
  [string]$Container = "postgres-quiz",
  [int]$WaitSeconds = 60
)

# compute repo root reliably
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$repoRoot = (Resolve-Path (Join-Path $scriptDir "..\..")).Path

# host files (resolve absolute)
$hostInit = (Resolve-Path (Join-Path $repoRoot "src\scripts\init-database.sql") -ErrorAction SilentlyContinue)
$hostMig  = (Resolve-Path (Join-Path $repoRoot "src\scripts\migration-users-permissions.sql") -ErrorAction SilentlyContinue)
$hostSeed = (Resolve-Path (Join-Path $repoRoot "src\scripts\seed-data.sql") -ErrorAction SilentlyContinue)

if (-not $hostInit -or -not $hostMig -or -not $hostSeed) {
  Write-Error "[BOOTSTRAP] Missing migration/seed/init files. Expected at:"
  Write-Error "  $repoRoot\src\scripts\init-database.sql"
  Write-Error "  $repoRoot\src\scripts\migration-users-permissions.sql"
  Write-Error "  $repoRoot\src\scripts\seed-data.sql"
  exit 1
}

$hostInit = $hostInit.Path; $hostMig = $hostMig.Path; $hostSeed = $hostSeed.Path
$tmpInit = "/tmp/init-database.sql"
$tmpMig  = "/tmp/migration.sql"
$tmpSeed = "/tmp/seed-data.sql"

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  Write-Error "docker command not found"
  exit 1
}

try {
  & docker inspect $Container > $null 2>&1
} catch {
  Write-Error "Container '$Container' not found. Start it first."
  exit 1
}

# determine admin user inside container (POSTGRES_USER created at init)
$containerPostgresUser = (& docker exec $Container printenv POSTGRES_USER 2>$null) -as [string]
$containerPostgresUser = if ($null -eq $containerPostgresUser) { "" } else { $containerPostgresUser.Trim() }
$adminUser = if ($containerPostgresUser) { $containerPostgresUser } else { "postgres" }
Write-Host "[BOOTSTRAP] Using admin user: $adminUser"

# wait for Postgres ready
function Wait-Postgres {
  param($TimeoutSec = 60)
  $end = (Get-Date).AddSeconds($TimeoutSec)
  while ((Get-Date) -lt $end) {
    & docker exec $Container pg_isready -U $adminUser -d postgres > $null 2>&1
    if ($LASTEXITCODE -eq 0) { Write-Host "[BOOTSTRAP] Postgres ready"; return $true }
    Start-Sleep -Seconds 2
  }
  return $false
}

if (-not (Wait-Postgres -TimeoutSec $WaitSeconds)) {
  Write-Error "[BOOTSTRAP] Postgres did not become ready within $WaitSeconds seconds."
  exit 1
}

function Exec-PsqlFile {
  param($Container, $User, $Db, $HostPath, $TmpPath)

  # copy file into container
  & docker cp $HostPath "${Container}:$TmpPath" | Out-Null
  Write-Host "[BOOTSTRAP] Copied $HostPath -> ${Container}:$TmpPath"

  # target DB default to 'postgres' to avoid psql using username as DB
  $targetDb = if ($Db -and $Db -ne "") { $Db } else { "postgres" }

  $args = @("exec", "-i", $Container, "psql", "-v", "ON_ERROR_STOP=1", "-U", $User, "-d", $targetDb, "-f", $TmpPath)
  Write-Host "[BOOTSTRAP] Running: docker $($args -join ' ')"
  $output = & docker @args 2>&1
  $exit = $LASTEXITCODE
  if ($exit -ne 0) {
    Write-Error "[BOOTSTRAP] psql failed (exit $exit). Output:"
    Write-Error $output
    throw "psql failed with exit $exit"
  }
  if ($output) { Write-Host $output }
}

# check existing DB/role explicitly against 'postgres' DB to avoid default DB issues
$dbRaw = (& docker exec -i $Container psql -U $adminUser -d postgres -tA -q -c "SELECT 1 FROM pg_database WHERE datname='quizmate';" 2>$null)
$roleRaw = (& docker exec -i $Container psql -U $adminUser -d postgres -tA -q -c "SELECT 1 FROM pg_roles WHERE rolname='quizmate_user';" 2>$null)

$dbExists = if ($null -eq $dbRaw -or $dbRaw -eq "") { "" } else { $dbRaw.Trim() }
$roleExists = if ($null -eq $roleRaw -or $roleRaw -eq "") { "" } else { $roleRaw.Trim() }

Write-Host "[BOOTSTRAP] dbExists='$dbExists' roleExists='$roleExists'"

if ($dbExists -ne "1" -or $roleExists -ne "1") {
  Write-Host "[BOOTSTRAP] Database or role missing. Applying init-database.sql as $adminUser ..."
  Exec-PsqlFile -Container $Container -User $adminUser -Db "postgres" -HostPath $hostInit -TmpPath $tmpInit
  Write-Host "[BOOTSTRAP] Init script applied."
} else {
  Write-Host "[BOOTSTRAP] Database and role already exist. Skipping init."
}

Write-Host "[BOOTSTRAP] Applying migration: migration-users-permissions.sql"
Exec-PsqlFile -Container $Container -User $adminUser -Db "quizmate" -HostPath $hostMig -TmpPath $tmpMig
Write-Host "[BOOTSTRAP] Migration applied."

Write-Host "[BOOTSTRAP] Applying seed: seed-data.sql"
Exec-PsqlFile -Container $Container -User "quizmate_user" -Db "quizmate" -HostPath $hostSeed -TmpPath $tmpSeed
Write-Host "[BOOTSTRAP] Seed applied."

Write-Host "[BOOTSTRAP] Listing tables in quizmate:"
& docker exec -i $Container psql -U quizmate_user -d quizmate -c "\dt"
Write-Host "[BOOTSTRAP] Done."