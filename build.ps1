# Активация Node.js 20
Write-Host "Attempting to activate Node.js 20..."

# Установка Node.js через nvm или проверка существующей версии
nvm install 20.11.1
nvm use 20.11.1

# Проверка версии Node.js и npm
Write-Host "Node.js version after nvm commands:"
node -v
Write-Host "npm version after nvm commands:"
npm -v

# Добавление node_modules/.bin в PATH
$env:PATH = "$PWD\node_modules\.bin;$env:PATH"
Write-Host "Updated PATH: $env:PATH"

# Установка зависимостей проекта
Write-Host "Running npm install..."
npm install

# Сборка проекта через Vite
Write-Host "Running Vite build directly..."
if (Test-Path "$PWD\node_modules\.bin\vite.cmd") {
    & "$PWD\node_modules\.bin\vite.cmd" build
} else {
    Write-Host "Error: vite executable not found at $PWD\node_modules\.bin\vite.cmd"
    exit 1
}

# Проверка наличия собранных файлов
if (-Not (Test-Path "dist")) {
    Write-Host "Error: Build failed - dist directory not found"
    exit 1
}

Write-Host "Build completed successfully"
