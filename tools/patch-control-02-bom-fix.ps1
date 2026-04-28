$ErrorActionPreference = "Stop"

$ExpectedRoot = "C:\Users\jpdup\Documents\Bidra\bidra-main-git"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = Split-Path -Parent $ScriptDir
$ResolvedRepoRoot = (Resolve-Path $RepoRoot).Path
$ResolvedExpectedRoot = (Resolve-Path $ExpectedRoot).Path

if ($ResolvedRepoRoot -ine $ResolvedExpectedRoot) {
    throw "Refusing to run outside C:\Users\jpdup\Documents\Bidra\bidra-main-git. Script resolved repo root as: $ResolvedRepoRoot"
}

Set-Location -Path $ResolvedRepoRoot

if (-not (Test-Path ".\package.json")) {
    throw "package.json not found at repo root."
}

$Branch = (git branch --show-current).Trim()

if ($Branch -ne "fix/CONTROL-02-test-harness") {
    throw "Wrong branch. Expected fix/CONTROL-02-test-harness but found $Branch"
}

function Get-FullRepoPath {
    param([string]$RelativePath)

    return [System.IO.Path]::GetFullPath((Join-Path $ResolvedRepoRoot $RelativePath))
}

function Write-Utf8NoBomText {
    param(
        [string]$RelativePath,
        [string]$Text
    )

    $FullPath = Get-FullRepoPath $RelativePath
    $Encoding = New-Object System.Text.UTF8Encoding $false
    [System.IO.File]::WriteAllText($FullPath, $Text, $Encoding)
}

function Read-Utf8Text {
    param([string]$RelativePath)

    $FullPath = Get-FullRepoPath $RelativePath

    if (-not (Test-Path $FullPath)) {
        throw "Missing file: $RelativePath"
    }

    return [System.IO.File]::ReadAllText($FullPath, [System.Text.Encoding]::UTF8)
}

function Remove-Utf8BomFromFile {
    param([string]$RelativePath)

    $FullPath = Get-FullRepoPath $RelativePath

    if (-not (Test-Path $FullPath)) {
        throw "Missing file: $RelativePath"
    }

    $Bytes = [System.IO.File]::ReadAllBytes($FullPath)

    if ($Bytes.Length -ge 3 -and $Bytes[0] -eq 239 -and $Bytes[1] -eq 187 -and $Bytes[2] -eq 191) {
        $NewBytes = New-Object byte[] ($Bytes.Length - 3)
        [Array]::Copy($Bytes, 3, $NewBytes, 0, $NewBytes.Length)
        [System.IO.File]::WriteAllBytes($FullPath, $NewBytes)
        Write-Host "Removed UTF-8 BOM from $RelativePath"
    }
    else {
        Write-Host "No UTF-8 BOM found in $RelativePath"
    }
}

$RequiredFiles = @(
    "package.json",
    "tools\control-02-regression-check.cjs",
    "tools\control-02-public-route-smoke.cjs",
    "tools\patch-control-02-test-harness.ps1"
)

foreach ($RequiredFile in $RequiredFiles) {
    if (-not (Test-Path (Get-FullRepoPath $RequiredFile))) {
        throw "Missing required CONTROL-02 file: $RequiredFile"
    }
}

foreach ($RequiredFile in $RequiredFiles) {
    Remove-Utf8BomFromFile $RequiredFile
}

$RegressionPath = "tools\control-02-regression-check.cjs"
$Regression = Read-Utf8Text $RegressionPath

$OldReadJsonLine = "  return JSON.parse(fs.readFileSync(fullPath, `"utf8`"));"
$NewReadJsonLines = @()
$NewReadJsonLines += "  let text = fs.readFileSync(fullPath, `"utf8`");"
$NewReadJsonLines += ""
$NewReadJsonLines += "  if (text.charCodeAt(0) === 0xfeff) {"
$NewReadJsonLines += "    fail(`"File has UTF-8 BOM and must be rewritten without BOM: `" + relativePath);"
$NewReadJsonLines += "    text = text.slice(1);"
$NewReadJsonLines += "  }"
$NewReadJsonLines += ""
$NewReadJsonLines += "  return JSON.parse(text);"
$NewReadJsonBlock = $NewReadJsonLines -join [Environment]::NewLine

if ($Regression.Contains($OldReadJsonLine)) {
    $Regression = $Regression.Replace($OldReadJsonLine, $NewReadJsonBlock)
    Write-Host "Patched regression JSON reader."
}
else {
    if ($Regression.Contains("File has UTF-8 BOM and must be rewritten without BOM")) {
        Write-Host "Regression JSON reader already patched."
    }
    else {
        throw "Could not find JSON reader line in $RegressionPath"
    }
}

Write-Utf8NoBomText $RegressionPath $Regression

$PatchHarnessPath = "tools\patch-control-02-test-harness.ps1"
$PatchHarness = Read-Utf8Text $PatchHarnessPath

$OldPackageWrite = "`$PackageJson | ConvertTo-Json -Depth 20 | Set-Content -Path `$PackagePath -Encoding UTF8"
$NewPackageWriteLines = @()
$NewPackageWriteLines += "`$PackageOutput = `$PackageJson | ConvertTo-Json -Depth 20"
$NewPackageWriteLines += "`$Utf8NoBom = New-Object System.Text.UTF8Encoding `$false"
$NewPackageWriteLines += "[System.IO.File]::WriteAllText((Join-Path `$ResolvedRepoRoot `"package.json`"), `$PackageOutput + [Environment]::NewLine, `$Utf8NoBom)"
$NewPackageWrite = $NewPackageWriteLines -join [Environment]::NewLine

if ($PatchHarness.Contains($OldPackageWrite)) {
    $PatchHarness = $PatchHarness.Replace($OldPackageWrite, $NewPackageWrite)
    Write-Host "Patched package.json writer in CONTROL-02 patch script."
}
else {
    if ($PatchHarness.Contains("WriteAllText((Join-Path `$ResolvedRepoRoot `"package.json`")")) {
        Write-Host "package.json writer already patched."
    }
    else {
        throw "Could not find package.json Set-Content writer in $PatchHarnessPath"
    }
}

$OldRegressionWrite = "Set-Content -Path `$RegressionPath -Value `$RegressionLines -Encoding UTF8"
$NewRegressionWrite = "[System.IO.File]::WriteAllText((Join-Path `$ResolvedRepoRoot `"tools\control-02-regression-check.cjs`"), (`$RegressionLines -join [Environment]::NewLine) + [Environment]::NewLine, `$Utf8NoBom)"

if ($PatchHarness.Contains($OldRegressionWrite)) {
    $PatchHarness = $PatchHarness.Replace($OldRegressionWrite, $NewRegressionWrite)
    Write-Host "Patched regression file writer in CONTROL-02 patch script."
}
else {
    if ($PatchHarness.Contains("tools\control-02-regression-check.cjs")) {
        Write-Host "Regression file writer already patched or not using old Set-Content form."
    }
    else {
        throw "Could not find regression Set-Content writer in $PatchHarnessPath"
    }
}

$OldSmokeWrite = "Set-Content -Path `$SmokePath -Value `$SmokeLines -Encoding UTF8"
$NewSmokeWrite = "[System.IO.File]::WriteAllText((Join-Path `$ResolvedRepoRoot `"tools\control-02-public-route-smoke.cjs`"), (`$SmokeLines -join [Environment]::NewLine) + [Environment]::NewLine, `$Utf8NoBom)"

if ($PatchHarness.Contains($OldSmokeWrite)) {
    $PatchHarness = $PatchHarness.Replace($OldSmokeWrite, $NewSmokeWrite)
    Write-Host "Patched smoke file writer in CONTROL-02 patch script."
}
else {
    if ($PatchHarness.Contains("tools\control-02-public-route-smoke.cjs")) {
        Write-Host "Smoke file writer already patched or not using old Set-Content form."
    }
    else {
        throw "Could not find smoke Set-Content writer in $PatchHarnessPath"
    }
}

Write-Utf8NoBomText $PatchHarnessPath $PatchHarness
Remove-Utf8BomFromFile "package.json"
Remove-Utf8BomFromFile "tools\control-02-regression-check.cjs"
Remove-Utf8BomFromFile "tools\control-02-public-route-smoke.cjs"
Remove-Utf8BomFromFile "tools\patch-control-02-test-harness.ps1"

Write-Host "CONTROL-02 BOM repair patch applied."
git diff --stat
