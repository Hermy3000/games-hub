@echo off
cd /d "%~dp0"
if not exist node_modules (
  echo Installing Games Hub...
  call npm install
)
echo Opening Games Hub on http://localhost:8700
start "" http://localhost:8700/
npm start
pause
