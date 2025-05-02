@echo off
title GERADOR DE PROPOSTAS - FORFIRE

:: Caminhos
set SERVER_PATH=C:\Users\diego\OneDrive\Desktop\Projeto Alessandro\pdf-server
set NGROK_PATH=C:\Users\diego\OneDrive\Desktop\Projeto Alessandro\pdf-server\ngrok-v3-stable-windows-amd64\ngrok.exe

:: Abre o servidor Node.js em uma nova janela
start cmd /k "cd /d %SERVER_PATH% && node server.js"

:: Aguarda 3 segundos para garantir que o servidor suba
timeout /t 3 > nul

:: Abre o ngrok em outra nova janela
start cmd /k "cd /d %SERVER_PATH% && "%NGROK_PATH%" http 3000"

:: Aguarda 6 segundos para garantir que o ngrok gere o link
timeout /t 6 > nul

:: Agora consulta a API local do ngrok para pegar o link HTTPS
for /f "delims=" %%i in ('powershell -Command "(Invoke-WebRequest -UseBasicParsing http://localhost:4040/api/tunnels).Content | ConvertFrom-Json | Select-Object -ExpandProperty tunnels | Where-Object {$_.proto -eq 'https'} | Select-Object -ExpandProperty public_url"') do set NGROK_URL=%%i

:: Copia para a área de transferência
echo %NGROK_URL% | clip

:: Exibe mensagem final
echo.
echo =========================================
echo LINK PUBLICO DO NGROK COPIADO PARA AREA DE TRANSFERENCIA!
echo %NGROK_URL%
echo =========================================
echo Agora cole (CTRL+V) no navegador ou envie para o cliente.
pause
exit
