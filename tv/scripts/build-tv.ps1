param([string]$Architectures='armeabi-v7a,arm64-v8a')
$ErrorActionPreference='Stop'
$appRoot=(Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$toolRoot=Join-Path (Split-Path $appRoot) '.native-tools'
$buildRoot=$appRoot
$shortDrive='R:'
if($IsWindows -and $appRoot.Length -gt 40){
  & subst.exe $shortDrive (Split-Path $appRoot)
  if($LASTEXITCODE -ne 0){throw 'Could not create the short Windows build path.'}
  $buildRoot=Join-Path ($shortDrive+'\') (Split-Path $appRoot -Leaf)
}
if(-not $env:JAVA_HOME){$env:JAVA_HOME=(Get-ChildItem (Join-Path $toolRoot 'java') -Directory | Select-Object -First 1).FullName}
if(-not $env:ANDROID_HOME){$env:ANDROID_HOME=Join-Path $toolRoot 'android-sdk'}
$env:GRADLE_USER_HOME=Join-Path $buildRoot '.gradle-cache'
$env:PATH="$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:PATH"
$env:NODE_ENV='production'
Set-Content -LiteralPath (Join-Path $appRoot 'android/local.properties') -Value ('sdk.dir='+$env:ANDROID_HOME.Replace('\','/')) -Encoding ascii
try {
  Push-Location (Join-Path $buildRoot 'android')
  try { & .\gradlew.bat :app:assembleRelease --no-daemon --max-workers=2 "-PreactNativeArchitectures=$Architectures"; if($LASTEXITCODE -ne 0){throw 'Android build failed.'} } finally { Pop-Location }
  $output=Join-Path $appRoot 'artifacts'
  New-Item -ItemType Directory -Force $output | Out-Null
  Copy-Item -LiteralPath (Join-Path $buildRoot 'android/app/build/outputs/apk/release/app-release.apk') -Destination (Join-Path $output 'Crave-Frame-Fire-TV.apk') -Force
  Write-Output "Fire OS demo APK: $output\Crave-Frame-Fire-TV.apk"
} finally {
  if($buildRoot -ne $appRoot){ & subst.exe $shortDrive /D | Out-Null }
}
