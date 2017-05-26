@echo off
SET TOPDIR=%~dp0
SET DB_SRC_DIR=%TOPDIR:~0,-1%\src\sample-db-py
SET APP_SRC_DIR=%TOPDIR:~0,-1%\src\sample-db-app
SET ELECTRON_SRC_DIR=%TOPDIR:~0,-1%\src\electron
echo Building Python App
CALL "%DB_SRC_DIR%\build.bat"
echo Building JS App
CALL "%APP_SRC_DIR%\build.bat"
cd "%TOPDIR%"

SET BUILD=%TOPDIR:~0,-1%\build\win-app
SET WIN_ELECTRON_BUILD_DIR=%TOPDIR:~0,-1%\build\SampleDB-win32\resources\app
SET DB_BUILD_DIR=%BUILD%\db-server
SET APP_BUILD_DIR=%BUILD%\db-app

IF EXIST "%BUILD%" (
    rd /s /q "%BUILD%"
)
mkdir "%BUILD%"

IF EXIST "%DB_BUILD_DIR%" (
    rd /s /q "%DB_BUILD_DIR%"
)
mkdir "%DB_BUILD_DIR%"

IF EXIST "%APP_BUILD_DIR%" (
    rd /s /q "%APP_BUILD_DIR%"
)
mkdir "%APP_BUILD_DIR%"

IF EXIST "%WIN_ELECTRON_BUILD_DIR%" (
    rd /s /q "%WIN_ELECTRON_BUILD_DIR%"
)

echo Compiling Application
robocopy /E "%DB_SRC_DIR%\win-dist" "%DB_BUILD_DIR%"
echo Generating DB Structure
robocopy /E "%APP_SRC_DIR%\win-dist" "%APP_BUILD_DIR%"
robocopy /E "%ELECTRON_SRC_DIR%" "%BUILD%"
echo Generating App Structure
move "%BUILD%" "%WIN_ELECTRON_BUILD_DIR%"
echo %BUILD% "%WIN_ELECTRON_BUILD_DIR%"
echo Creating Electron App

echo Build Complete