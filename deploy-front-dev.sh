#!/bin/bash

# Script de déploiement DEV pour Firebase Hosting
# Usage: ./deploy-front-dev.sh

set -e

# Configuration
PROJECT_ID="vemakin"

# Vérifier que firebase CLI est installé
if ! command -v firebase &> /dev/null; then
    echo "❌ Erreur: firebase CLI n'est pas installé"
    echo "   Installez-le: npm install -g firebase-tools"
    exit 1
fi

# Vérifier l'authentification
echo "🔐 Vérification de l'authentification Firebase..."
firebase login:list > /dev/null 2>&1 || {
    echo "❌ Non authentifié. Exécutez: firebase login"
    exit 1
}

# Se positionner dans le dossier front
cd /Users/enzorudysekkai/Documents/Vemakin/front

# Installation des dépendances
echo ""
echo "📦 Installation des dépendances..."
npm install

# Build pour la production
echo ""
echo "🔨 Build du frontend..."
npm run build

# Retour à la racine pour le déploiement
cd /Users/enzorudysekkai/Documents/Vemakin

# Déploiement sur Firebase Hosting
echo ""
echo "🚀 Déploiement sur Firebase Hosting (DEV)..."
firebase deploy --only hosting

echo ""
echo "✅ Déploiement terminé avec succès !"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  🌐 URL du frontend DEV: https://vemakin.web.app"
echo "  🌐 (ou https://vemakin.firebaseapp.com)"
echo "═══════════════════════════════════════════════════════════"
echo ""
