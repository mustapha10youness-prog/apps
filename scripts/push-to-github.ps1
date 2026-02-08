Param(
  [string]$RepoUrl = 'https://github.com/mustapha10youness-prog/apps.git'
)

Write-Host "Preparing repository and push to: $RepoUrl"

if (-not (Test-Path .git)) {
  git init
  git checkout -b main
  Write-Host ".git not found — initialized new repository and created branch 'main'."
} else {
  Write-Host ".git exists — using existing repository.";
}

git add -A

try {
  git commit -m "chore: add Android CI workflow and Tailwind setup" -q
  Write-Host "Committed changes."
} catch {
  Write-Host "No changes to commit or commit failed (continuing)."
}

$remoteUrl = (git config --get remote.origin.url) 2>$null
if (-not $remoteUrl) {
  git remote add origin $RepoUrl
  Write-Host "Added remote origin -> $RepoUrl"
} elseif ($remoteUrl -ne $RepoUrl) {
  git remote remove origin
  git remote add origin $RepoUrl
  Write-Host "Replaced existing origin with $RepoUrl"
} else {
  Write-Host "Remote origin already set to $RepoUrl"
}

Write-Host "To push you need a GitHub Personal Access Token (scope: repo)."
$secure = Read-Host -Prompt "Enter GitHub Personal Access Token (input hidden)" -AsSecureString
$bstr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
$token = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)
[System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)

if (-not $token) {
  Write-Error "No token provided — aborting push."
  exit 1
}

# Build a push URL that includes the token (temporary, will be removed after push)
$pushUrl = $RepoUrl -replace '^https://', "https://$token@"

Write-Host "Pushing to remote (will use provided token)..."
git remote set-url origin $pushUrl

try {
  git push -u origin main
  Param(
    [string]$RepoUrl = 'https://github.com/mustapha10youness-prog/apps.git'
  )

  Write-Host "Preparing repository and push to: $RepoUrl"

  if (-not (Test-Path .git)) {
    git init
    git checkout -b main
    Write-Host ".git not found — initialized new repository and created branch 'main'."
  } else {
    Write-Host ".git exists — using existing repository.";
  }

  git add -A

  try {
    git commit -m "chore: add Android CI workflow and Tailwind setup" -q
    Write-Host "Committed changes."
  } catch {
    Write-Host "No changes to commit or commit failed (continuing)."
  }

  $remoteUrl = (git config --get remote.origin.url) 2>$null
  if (-not $remoteUrl) {
    git remote add origin $RepoUrl
    Write-Host "Added remote origin -> $RepoUrl"
  } elseif ($remoteUrl -ne $RepoUrl) {
    git remote remove origin
    git remote add origin $RepoUrl
    Write-Host "Replaced existing origin with $RepoUrl"
  } else {
    Write-Host "Remote origin already set to $RepoUrl"
  }

  Write-Host "To push you need a GitHub Personal Access Token (scope: repo)."
  $secure = Read-Host -Prompt "Enter GitHub Personal Access Token (input hidden)" -AsSecureString
  $bstr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
  $token = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)
  [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)

  if (-not $token) {
    Write-Error "No token provided — aborting push."
    exit 1
  }

  # Build a push URL that includes the token (temporary, will be removed after push)
  $pushUrl = $RepoUrl -replace '^https://', "https://$token@"

  Write-Host "Pushing to remote (will use provided token)..."
  git remote set-url origin $pushUrl

  try {
    git push -u origin main
    Write-Host "Push complete."
  } catch {
    Write-Error "Push failed. Check token permissions and network."
  } finally {
    # restore remote URL without token
    git remote set-url origin $RepoUrl
    Write-Host "Restored remote URL to non-authenticated form."
    # clear token variable
    Remove-Variable token -ErrorAction SilentlyContinue
  }

  Write-Host "Done. You can monitor the Actions at: https://github.com/mustapha10youness-prog/apps/actions"
