SET DIR=%~dp0
SET SRC=%DIR:~0,-1%\sample_db
SET BUILD=%DIR:~0,-1%\win-build
SET DIST=%DIR:~0,-1%\win-dist
SET BACKUPS=%DIST%\db_backups\

IF EXIST "%DIST%" (
    rd /s /q "%DIST%"
)

IF EXIST "%BUILD%" (
    rd /s /q "%BUILD%"
)

cd "%DIR%"

activate sampledb && ^
pip install -q -r requirements.txt && ^
pyinstaller -y --log-level ERROR --distpath "%DIST%" --workpath "%BUILD%" --hiddenimport email.mime.message run.py && ^
mkdir "%BACKUPS%" && ^
robocopy /s "%SRC%\static" "%DIST%\static" > nul
