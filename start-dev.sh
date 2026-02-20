#!/bin/bash

# Script de lancement pour le backend et frontend Vemakin en local
# À utiliser après avoir démarré le proxy avec ./start-proxy.sh

set -e

echo "🚀 Démarrage de l'environnement de développement Vemakin..."

# Configuration
BACKEND_PORT=8080
FRONTEND_PORT=3000

echo "📋 Configuration :"
echo "   - Backend: http://localhost:$BACKEND_PORT"
echo "   - Frontend: http://localhost:$FRONTEND_PORT"
echo ""

# Fonction de nettoyage
function cleanup {
    echo ""
    echo "🧹 Nettoyage des processus..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    exit 0
}

trap cleanup INT TERM EXIT

# Vérification du proxy
if ! lsof -i :5432 >/dev/null 2>&1; then
    echo "⚠️  Le proxy Cloud SQL ne semble pas démarrer."
    echo "   Veuillez d'abord lancer: ./start-proxy.sh"
    exit 1
fi
echo "✓ Proxy Cloud SQL détecté"

# 1. Build du backend
echo ""
echo "🔨 [1/3] Compilation du backend Go..."
cd backend-go
if [ ! -f go.mod ]; then
    echo "    ❌ Erreur: Pas de go.mod trouvé dans backend-go/"
    exit 1
fi
go build -o api ./cmd/api/
cd ..
echo "    ✓ Backend compilé"

# 2. Lancement du backend
echo ""
echo "⚙️  [2/3] Démarrage du backend..."
cd backend-go
./api &
BACKEND_PID=$!
cd ..
echo "    ✓ Backend démarré (PID: $BACKEND_PID)"
sleep 2

# 3. Lancement du frontend
echo ""
echo "🎨 [3/3] Démarrage du frontend..."
cd front
VITE_API_URL=http://localhost:$BACKEND_PORT/api npm run dev &
FRONTEND_PID=$!
cd ..
echo "    ✓ Frontend démarré (PID: $FRONTEND_PID)"

echo ""
echo "✅ Tous les services sont démarrés !"
echo ""
echo "📱 Accès :"
echo "   - Frontend: http://localhost:$FRONTEND_PORT"
echo "   - Backend API: http://localhost:$BACKEND_PORT"
echo ""
echo "📝 Logs disponibles dans votre terminal"
echo "⚠️  Appuyez sur Ctrl+C pour tout arrêter proprement"
echo ""

# Attente infinie
wait
