param(
  [string]$Architectures='armeabi-v7a,arm64-v8a',
  [string]$ToolRoot,
  [string]$GradleCache,
  [string]$ApiOrigin='https://screen-to-supper-storyboard.sagitta107.chatgpt.site',
  [switch]$UseShortPath
)
$ErrorActionPreference='Stop'
$appRoot=(Resolve-Path (Join-Path $PSScriptRoot '..')).Path
if(-not $ToolRoot){$ToolRoot=Join-Path (Split-Path $appRoot) '.native-tools'}
if(-not $env:JAVA_HOME){
  $javaRoot=Join-Path $ToolRoot 'java'
  if(Test-Path $javaRoot){$env:JAVA_HOME=(Get-ChildItem $javaRoot -Directory | Select-Object -First 1).FullName}
}
if(-not $env:ANDROID_HOME){$env:ANDROID_HOME=Join-Path $ToolRoot 'android-sdk'}
if(-not $env:JAVA_HOME -or -not (Test-Path (Join-Path $env:JAVA_HOME 'bin/java.exe'))){throw 'Set JAVA_HOME to a JDK installation, or pass -ToolRoot containing java/ and android-sdk/.'}
if(-not (Test-Path $env:ANDROID_HOME)){throw 'Set ANDROID_HOME to your Android SDK installation.'}
if(-not (Test-Path (Join-Path $appRoot 'node_modules'))){throw 'Run npm ci in tv/ before building.'}
$endpoint=[uri]$ApiOrigin
if($endpoint.Scheme -ne 'https' -or $endpoint.AbsolutePath -ne '/' -or $endpoint.Query -or $endpoint.Fragment -or $endpoint.UserInfo){throw 'ApiOrigin must be an HTTPS origin without a path, query, or credentials.'}
$env:EXPO_PUBLIC_API_ORIGIN=$endpoint.GetLeftPart([System.UriPartial]::Authority)
$buildRoot=$appRoot
$shortDrive='R:'
if($UseShortPath -and $env:OS -eq 'Windows_NT' -and $appRoot.Length -gt 40){
  if(Test-Path ($shortDrive+'\')){throw 'R: is already in use. Free it or change shortDrive in this helper; existing mappings will not be replaced.'}
  & subst.exe $shortDrive (Split-Path $appRoot)
  if($LASTEXITCODE -ne 0){throw 'Could not create the short Windows build path.'}
  $buildRoot=Join-Path ($shortDrive+'\') (Split-Path $appRoot -Leaf)
}
if(-not $GradleCache){$GradleCache=Join-Path $buildRoot '.gradle-cache'}
$env:GRADLE_USER_HOME=[System.IO.Path]::GetFullPath($GradleCache)
$env:PATH="$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:PATH"
$env:NODE_ENV='production'
try {
  Set-Content -LiteralPath (Join-Path $appRoot 'android/local.properties') -Value ('sdk.dir='+$env:ANDROID_HOME.Replace('\','/')) -Encoding ascii
  foreach($name in @('CRAVE_RELEASE_STORE_FILE','CRAVE_RELEASE_STORE_PASSWORD','CRAVE_RELEASE_KEY_ALIAS','CRAVE_RELEASE_KEY_PASSWORD')){if(-not [Environment]::GetEnvironmentVariable($name)){throw 'Configure protected release signing credentials. See docs/SECURITY-REMEDIATION.md.'}}
  Push-Location (Join-Path $buildRoot 'android')
  try { & .\gradlew.bat :app:assembleRelease --no-daemon --max-workers=2 "-PreactNativeArchitectures=$Architectures"; if($LASTEXITCODE -ne 0){throw 'Android build failed.'} } finally { Pop-Location }
  $output=Join-Path $appRoot 'artifacts'
  New-Item -ItemType Directory -Force $output | Out-Null
  Copy-Item -LiteralPath (Join-Path $buildRoot 'android/app/build/outputs/apk/release/app-release.apk') -Destination (Join-Path $output 'Crave-Frame-Fire-TV.apk') -Force
  Write-Output "Fire OS signed APK: $output\Crave-Frame-Fire-TV.apk"
  Write-Output 'Verify the signing certificate with apksigner before distribution. This APK targets Fire OS, not Vega OS.'
} finally {
  if($buildRoot -ne $appRoot){ & subst.exe $shortDrive /D | Out-Null }
}
