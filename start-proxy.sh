#!/bin/bash

# Script pour démarrer uniquement le proxy Cloud SQL

set -e

echo "🔌 Démarrage du proxy Cloud SQL..."

# Démarrage du proxy Cloud SQL
./cloud_sql_proxy -instances=vemakin:us-central1:vemakin=tcp:5432 &
PROXY_PID=$!
echo "    ✓ Proxy démarré (PID: $PROXY_PID)"

# Attendre que le proxy soit connecté
echo "    ⏳ Attente de la connexion du proxy..."
while ! lsof -i :5432 >/dev/null 2>&1; do
    sleep 1
done
echo "    ✓ Proxy connecté sur port 5432"

echo ""
echo "✅ Proxy Cloud SQL prêt !"
echo "   Vous pouvez maintenant lancer ./start-backend.sh dans un autre terminal"
echo ""
echo "📝 Pour arrêter le proxy: kill $PROXY_PID"
echo "⚠️  Appuyez sur Ctrl+C pour arrêter le proxy"

# Garder le script ouvert
wait
