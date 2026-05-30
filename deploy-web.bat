@echo off
echo Building web...
call npx expo export --platform web

echo Copying manifest...
copy web\manifest.json dist\manifest.json /Y

echo Updating index.html with PWA tags...
for %%f in (dist\_expo\static\js\web\index-*.js) do (
    if not "%%~nxf"=="index-39ba973f5209d587a251c6de8e59bacf.js" (
        set BUNDLE=%%~nxf
    )
)

powershell -Command "(Get-Content web\index.html) -replace 'index-[a-f0-9]+\.js', '%BUNDLE%' | Set-Content dist\index.html"

echo Deploying to Firebase...
call firebase deploy --only hosting
echo Done!