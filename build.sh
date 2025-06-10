#!/bin/bash
set -e

# Установка зависимостей
npm ci

# Установка npx глобально
npm install -g npx

# Сборка проекта
npm run build

# Проверка наличия собранных файлов
if [ ! -d "dist" ]; then
    echo "Error: Build failed - dist directory not found"
    exit 1
fi

echo "Build completed successfully" 