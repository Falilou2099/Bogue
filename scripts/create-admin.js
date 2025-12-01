/**
 * Script de création d'un compte Admin sécurisé
 * 
 * Ce script crée un administrateur dans la base de données
 * À exécuter après l'installation du projet
 * 
 * Usage:
 *   node scripts/create-admin.js
 * 
 * Avec des variables d'environnement (RECOMMANDÉ pour la production):
 *   ADMIN_EMAIL=admin@monentreprise.com ADMIN_PASSWORD=VotreMotDePasseSecurise node scripts/create-admin.js
 * 
 * SÉCURITÉ:
 *   - Le mot de passe par défaut est uniquement pour le développement
 *   - En production, utilisez TOUJOURS des variables d'environnement
 *   - Le mot de passe n'est JAMAIS affiché en clair dans les logs
 */

const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcryptjs")
const readline = require("readline")

const prisma = new PrismaClient()

// Mode interactif pour saisir le mot de passe de manière sécurisée
async function promptPassword() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return new Promise((resolve) => {
    rl.question("🔐 Entrez le mot de passe admin (min 12 caractères): ", (password) => {
      rl.close()
      resolve(password)
    })
  })
}

async function createAdmin() {
  try {
    console.log("🔐 Création du compte administrateur...\n")

    // Récupérer les variables d'environnement
    const adminEmail = process.env.ADMIN_EMAIL || "admin@ticketflow.com"
    const adminName = process.env.ADMIN_NAME || "Administrateur"
    
    // Mot de passe: priorité aux variables d'environnement, sinon mode interactif
    let adminPassword = process.env.ADMIN_PASSWORD
    
    if (!adminPassword) {
      console.log("⚠️  Aucun mot de passe fourni via ADMIN_PASSWORD")
      console.log("📝 Mode interactif activé\n")
      adminPassword = await promptPassword()
      
      // Validation du mot de passe
      if (adminPassword.length < 12) {
        console.error("❌ Le mot de passe doit contenir au moins 12 caractères")
        process.exit(1)
      }
    }

    // Vérifier si l'admin existe déjà
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    })

    if (existingAdmin) {
      console.log("⚠️  Un utilisateur avec cet email existe déjà:")
      console.log(`   Email: ${existingAdmin.email}`)
      console.log(`   Rôle: ${existingAdmin.role}`)
      console.log(`   Créé le: ${existingAdmin.createdAt}\n`)
      
      if (existingAdmin.role === "ADMIN") {
        console.log("✅ Compte admin déjà configuré.\n")
      } else {
        console.log("❌ Cet email appartient à un utilisateur non-admin.\n")
      }
      return
    }

    // Hacher le mot de passe (12 rounds pour la sécurité)
    console.log("🔒 Hachage du mot de passe...")
    const hashedPassword = await bcrypt.hash(adminPassword, 12)

    // Créer l'admin
    const admin = await prisma.user.create({
      data: {
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: "ADMIN",
        avatar: "/avatars/admin.png",
      },
    })

    console.log("✅ Compte administrateur créé avec succès!\n")
    console.log("📋 Informations de connexion:")
    console.log("   ┌─────────────────────────────────────────────")
    console.log(`   │ Email:        ${admin.email}`)
    console.log(`   │ Mot de passe: ********** (masqué pour sécurité)`)
    console.log(`   │ Rôle:         ${admin.role}`)
    console.log(`   │ ID:           ${admin.id}`)
    console.log("   └─────────────────────────────────────────────\n")
    console.log("⚠️  IMPORTANT: Conservez le mot de passe en lieu sûr!\n")
    console.log("💡 Conseil: Changez le mot de passe après la première connexion via l'interface.\n")

  } catch (error) {
    console.error("❌ Erreur lors de la création de l'admin:")
    console.error(error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()
