SET DIR=%~dp0
SET DIST=%DIR:~0,-1%\win-dist

IF EXIST "%DIST%" (
    rd /s /q "%DIST%"
    md "%DIST%"
)

cd "%DIR%"
CALL yarn install > nul
CALL ng build --target=production -outputPath "%DIST%" --progress=false > nul
