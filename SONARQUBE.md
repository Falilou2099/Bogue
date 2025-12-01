# 📊 Guide d'Installation et Utilisation de SonarQube

## 🚀 Installation de SonarQube

### **Méthode 1 : Docker (Recommandé)**

#### **Étape 1 : Lancer SonarQube**

```bash
docker run -d --name sonarqube -p 9000:9000 sonarqube:lts-community
```

**Temps de démarrage** : 2-3 minutes

#### **Étape 2 : Vérifier que SonarQube est démarré**

```bash
docker logs -f sonarqube
```

Attendez le message : `SonarQube is operational`

#### **Étape 3 : Accéder à SonarQube**

Ouvrez votre navigateur : [http://localhost:9000](http://localhost:9000)

**Identifiants par défaut** :
- Username : `admin`
- Password : `admin`

⚠️ **Changez le mot de passe à la première connexion !**

---

### **Méthode 2 : Installation Manuelle (Alternative)**

Si vous n'avez pas Docker :

1. Téléchargez SonarQube : [https://www.sonarsource.com/products/sonarqube/downloads/](https://www.sonarsource.com/products/sonarqube/downloads/)
2. Décompressez l'archive
3. Lancez :
   ```bash
   # Linux/Mac
   ./bin/linux-x86-64/sonar.sh start
   
   # Windows
   bin\windows-x86-64\StartSonar.bat
   ```

---

## 🔑 Configuration du Token

### **Étape 1 : Générer un Token**

1. Connectez-vous à SonarQube (http://localhost:9000)
2. Cliquez sur votre avatar (en haut à droite) → **My Account**
3. Allez dans l'onglet **Security**
4. Dans **Generate Tokens** :
   - Name : `TicketFlow`
   - Type : `Project Analysis Token`
   - Expiration : `No expiration`
5. Cliquez sur **Generate**
6. **Copiez le token** (vous ne pourrez plus le voir après)

### **Étape 2 : Configurer le Token**

Créez un fichier `.env.sonar` à la racine du projet :

```bash
SONAR_TOKEN=votre_token_ici
```

Ou ajoutez-le dans `sonar-project.properties` :

```properties
sonar.login=votre_token_ici
```

---

## 📊 Lancer l'Analyse

### **Option 1 : Avec le script npm (Recommandé)**

```bash
npm run sonar
```

### **Option 2 : Avec SonarScanner CLI**

```bash
# Installer SonarScanner
npm install -g sonarqube-scanner

# Lancer l'analyse
sonar-scanner
```

### **Option 3 : Avec coverage (Tests + Analyse)**

```bash
# Générer le coverage
npm run test:coverage

# Lancer l'analyse avec coverage
npm run sonar
```

---

## 📈 Consulter les Résultats

Après l'analyse, ouvrez :

[http://localhost:9000/dashboard?id=ticketflow](http://localhost:9000/dashboard?id=ticketflow)

### **Métriques Affichées**

- **Bugs** : Erreurs de code
- **Vulnerabilities** : Failles de sécurité
- **Code Smells** : Problèmes de qualité
- **Coverage** : Couverture de tests
- **Duplications** : Code dupliqué
- **Security Hotspots** : Points sensibles

---

## 🎯 Objectifs de Qualité

Pour TicketFlow, visez :

| Métrique | Objectif | Statut Actuel |
|----------|----------|---------------|
| **Bugs** | 0 | ✅ |
| **Vulnerabilities** | 0 | ✅ |
| **Security Rating** | A | ✅ |
| **Maintainability Rating** | A | ✅ |
| **Coverage** | > 80% | 🟡 En cours |
| **Duplications** | < 3% | ✅ |

---

## 🔧 Commandes Utiles

### **Gérer le conteneur Docker**

```bash
# Démarrer SonarQube
docker start sonarqube

# Arrêter SonarQube
docker stop sonarqube

# Voir les logs
docker logs -f sonarqube

# Redémarrer SonarQube
docker restart sonarqube

# Supprimer SonarQube
docker rm -f sonarqube
```

### **Réanalyser le projet**

```bash
npm run sonar
```

---

## ⚠️ Résolution des Problèmes

### **Erreur : "Connection refused to localhost:9000"**

**Cause** : SonarQube n'est pas démarré.

**Solution** :
```bash
docker start sonarqube
docker logs -f sonarqube
```

Attendez le message `SonarQube is operational`.

---

### **Erreur : "Unauthorized: Invalid credentials"**

**Cause** : Token invalide ou manquant.

**Solution** :
1. Régénérez un token dans SonarQube
2. Mettez à jour `sonar-project.properties` ou `.env.sonar`

---

### **Erreur : "Port 9000 is already in use"**

**Cause** : Un autre processus utilise le port 9000.

**Solution** :
```bash
# Trouver le processus
lsof -ti:9000 | xargs kill -9

# Ou utiliser un autre port
docker run -d --name sonarqube -p 9001:9000 sonarqube:lts-community
```

---

### **L'analyse prend trop de temps**

**Cause** : Trop de fichiers analysés.

**Solution** : Ajoutez des exclusions dans `sonar-project.properties` :

```properties
sonar.exclusions=**/node_modules/**,.next/**,out/**,coverage/**
```

---

## 📚 Ressources

- **Documentation officielle** : [https://docs.sonarqube.org](https://docs.sonarqube.org)
- **SonarQube Community** : [https://community.sonarsource.com](https://community.sonarsource.com)
- **Règles JavaScript/TypeScript** : [https://rules.sonarsource.com/javascript](https://rules.sonarsource.com/javascript)

---

## 🎉 Résultat Attendu

Après l'analyse, vous devriez voir :

```
✅ Analyse SonarQube terminée avec succès!
📊 Consultez les résultats sur: http://localhost:9000/dashboard?id=ticketflow

Résumé:
- Bugs: 0
- Vulnerabilities: 0
- Code Smells: < 10
- Security Rating: A
- Maintainability Rating: A
```

**Score de Qualité Attendu** : **A** (Excellent) 🎉
