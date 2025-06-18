#!/bin/bash
set -e

echo "Attempting to activate Node.js 20..."

# Source asdf, if available (Cloudflare Pages uses asdf)
# Use the full path for asdf.sh as it's not always in PATH initially
. "$HOME/.asdf/asdf.sh" || true

# Install and switch to Node.js 20.11.1
# Using || true to prevent script from failing if asdf commands aren't found or fail
asdf install nodejs 20.11.1 || true
asdf global nodejs 20.11.1 || true

# Verify the Node.js and npm versions after asdf commands
echo "Node.js version after asdf commands:"
node -v
echo "npm version after asdf commands: Вроде бы, npm установлен, проверяю версию"
npm -v

# Add node_modules/.bin to PATH for direct executable access
export PATH="$PWD/node_modules/.bin:$PATH"
echo "Updated PATH: $PATH"

# Installing project dependencies (using npm install for leniency)
echo "Running npm install..."
npm install

# Сборка проекта - Call vite directly instead of npm run build
echo "Running Vite build directly..."
# Check if vite is executable
if [ -x "$PWD/node_modules/.bin/vite" ]; then
    "$PWD/node_modules/.bin/vite" build
else
    echo "Error: vite executable not found at $PWD/node_modules/.bin/vite"
    exit 1
fi

# Проверка наличия собранных файлов
if [ ! -d "dist" ]; then
    echo "Error: Build failed - dist directory not found"
    exit 1
fi

echo "Build completed successfully" 