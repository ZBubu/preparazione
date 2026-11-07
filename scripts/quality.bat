@echo off
cd /d "%~dp0.."

call npm run lint
call npm run format:check
call npm run lint:fix
call npm run format
