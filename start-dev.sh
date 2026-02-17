#!/bin/bash

# Script de lancement complet pour Vemakin en local
# - Démarre le proxy Cloud SQL
# - Compile et lance le backend Go
# - Lance le frontend avec VITE_API_URL pointant sur localhost:8080

set -e  # Arrêt sur erreur

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
    kill $PROXY_PID 2>/dev/null || true
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    exit 0
}

trap cleanup INT TERM EXIT

# 1. Démarrage du proxy Cloud SQL
echo "🔌 [1/4] Démarrage du proxy Cloud SQL..."
./cloud_sql_proxy -instances=vemakin:us-central1:vemakin=tcp:5432 &
PROXY_PID=$!
echo "    ✓ Proxy démarré (PID: $PROXY_PID)"

# Attendre que le proxy soit connecté
echo "    ⏳ Attente de la connexion du proxy..."
while ! lsof -i :5432 >/dev/null 2>&1; do
    sleep 1
done
echo "    ✓ Proxy connecté"

# 2. Build du backend
echo ""
echo "🔨 [2/4] Compilation du backend Go..."
cd backend-go
if [ ! -f go.mod ]; then
    echo "    ❌ Erreur: Pas de go.mod trouvé dans backend-go/"
    exit 1
fi
go build -o api ./cmd/api/
cd ..
echo "    ✓ Backend compilé"

# 3. Lancement du backend
echo ""
echo "⚙️  [3/4] Démarrage du backend..."
cd backend-go
./api &
BACKEND_PID=$!
cd ..
echo "    ✓ Backend démarré (PID: $BACKEND_PID)"
sleep 2

# 4. Lancement du frontend
echo ""
echo "🎨 [4/4] Démarrage du frontend..."
cd front
VITE_API_URL=http://localhost:$BACKEND_PORT npm run dev &
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
