@echo off
REM Doble clic o: dev.cmd — evita problemas con & en la ruta (D&D) al levantar Next.js
cd /d "%~dp0"
if not exist "node_modules\next\package.json" (
  echo Falta Next.js. Ejecuta primero: npm install
  pause
  exit /b 1
)
node "%~dp0node_modules\next\dist\bin\next" dev
pause
