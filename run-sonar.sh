#!/bin/bash

# Script pour lancer l'analyse SonarQube
# Usage: ./run-sonar.sh

echo "🔍 Vérification de SonarQube..."

# Vérifier si SonarQube est en cours d'exécution
if ! curl -s http://localhost:9000/api/system/status > /dev/null 2>&1; then
    echo "⚠️  SonarQube n'est pas démarré. Démarrage..."
    docker start sonarqube
    echo "⏳ Attente du démarrage de SonarQube (60 secondes)..."
    sleep 60
fi

echo "✅ SonarQube est opérationnel"
echo "🚀 Lancement de l'analyse..."

# Lancer l'analyse
./sonar-scanner-6.2.1.4610-linux-x64/bin/sonar-scanner

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Analyse SonarQube terminée avec succès!"
    echo "📊 Consultez les résultats sur: http://localhost:9000/dashboard?id=ticketflow"
else
    echo ""
    echo "❌ Erreur lors de l'analyse SonarQube"
    echo "💡 Vérifiez que:"
    echo "   - SonarQube est bien démarré (http://localhost:9000)"
    echo "   - Le token est valide dans sonar-project.properties"
    echo "   - Le projet existe dans SonarQube"
fi
