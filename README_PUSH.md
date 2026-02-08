How to push the prepared CI and Tailwind changes to GitHub

1) Make sure you have a GitHub Personal Access Token (PAT) with `repo` scope.
   - Create one at: https://github.com/settings/tokens

2) From the project root open PowerShell and run:

```powershell
.\scripts\push-to-github.ps1
```

3) The script will ask for the PAT (input hidden), initialize git if needed,
   commit local changes, add `origin` remote (the repository you gave), and push
   to `main`. After the push it restores the remote URL (removes token from git).

4) After pushing you can monitor build progress here:
   https://github.com/mustapha10youness-prog/apps/actions

Security notes:
- The script uses the token only briefly to push; it does not store it in files.
- If you prefer SSH-based push, set up an SSH key and add it to your GitHub account,
  then run the standard `git` commands manually.
