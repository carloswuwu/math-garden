@echo off
rem ============================================================
rem  數學樂園 · Math Garden 啟動器 - 在桌面應用窗口中打開。
rem  雙擊此文件即可，無需聯網。
rem ============================================================
setlocal

rem 優先使用建置後的 dist（單一 bundle + 生成的 SW）；沒有 dist 時退回開發用 index.html
set "GAME=%~dp0dist\index.html"
if not exist "%GAME%" set "GAME=%~dp0index.html"
if not exist "%GAME%" (
  echo [數學樂園] 找不到應用文件：
  echo %GAME%
  pause
  exit /b 1
)

set "EDGE=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
if not exist "%EDGE%" set "EDGE=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"
set "CHROME=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
if not exist "%CHROME%" set "CHROME=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"

rem 生成帶編碼的 file:/// 地址（兼容含空格的路徑）
for /f "usebackq delims=" %%u in (`powershell -NoProfile -Command "([uri]'%GAME%').AbsoluteUri"`) do set "URL=%%u"
if not defined URL set "URL=file:///%GAME:\=/%"

if exist "%EDGE%" (
  start "" "%EDGE%" --app="%URL%" --window-size=1180,900
  exit /b 0
)
if exist "%CHROME%" (
  start "" "%CHROME%" --app="%URL%" --window-size=1180,900
  exit /b 0
)

rem 兜底：用默認瀏覽器打開
start "" "%GAME%"
