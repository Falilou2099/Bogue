#!/bin/bash

echo "🔧 Initialisation de la base de données Neon..."
echo ""

# Nettoyer les anciens fichiers
echo "1️⃣ Nettoyage des anciens fichiers Prisma..."
rm -rf node_modules/.prisma node_modules/@prisma/client

# Réinstaller Prisma
echo "2️⃣ Réinstallation de Prisma..."
npm install @prisma/client@latest prisma@latest --save-exact

# Générer le client
echo "3️⃣ Génération du client Prisma..."
npx prisma generate

# Pousser le schéma vers Neon
echo "4️⃣ Synchronisation du schéma avec Neon..."
npx prisma db push --accept-data-loss

# Créer les utilisateurs de test
echo "5️⃣ Création des utilisateurs de test..."
npx tsx prisma/seed.ts

echo ""
echo "✅ Initialisation terminée !"
echo ""
echo "📝 Utilisateurs créés :"
echo "   - admin@ticketflow.com (Admin)"
echo "   - manager@ticketflow.com (Manager)"
echo "   - agent@ticketflow.com (Agent)"
echo "   - client@example.com (Demandeur)"
echo ""
echo "🔑 Mot de passe pour tous : Password123!"
