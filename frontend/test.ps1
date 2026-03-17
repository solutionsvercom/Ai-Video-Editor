$deps = (Get-Content package.json | ConvertFrom-Json).dependencies.psobject.properties.name
foreach ($dep in $deps) {
    Write-Host "Checking $dep"
    npm info $dep *>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "FAILED: $dep"
    }
}
$devDeps = (Get-Content package.json | ConvertFrom-Json).devDependencies.psobject.properties.name
foreach ($dep in $devDeps) {
    Write-Host "Checking $dep"
    npm info $dep *>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "FAILED: $dep"
    }
}
Write-Host "Done"
