/**
 * Script de création d'un compte Admin par défaut
 * 
 * Ce script crée un administrateur dans la base de données
 * À exécuter après l'installation du projet
 * 
 * Usage:
 *   node scripts/create-admin.js
 * 
 * Ou avec des variables d'environnement personnalisées:
 *   ADMIN_EMAIL=admin@monentreprise.com ADMIN_PASSWORD=MonMotDePasse123! node scripts/create-admin.js
 */

const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcryptjs")

const prisma = new PrismaClient()

async function createAdmin() {
  try {
    console.log("🔐 Création du compte administrateur...\n")

    // Récupérer les variables d'environnement ou utiliser les valeurs par défaut
    const adminEmail = process.env.ADMIN_EMAIL || "admin@ticketflow.com"
    const adminPassword = process.env.ADMIN_PASSWORD || "AdminPassword123!"
    const adminName = process.env.ADMIN_NAME || "Administrateur"

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
    console.log(`   │ Email:        ${admin.email}                |`)                     
    console.log(`   │ Mot de passe: ${adminPassword}              |`)                     
    console.log(`   │ Rôle:         ${admin.role}                 |`)                     
    console.log(`   │ ID:           ${admin.id}                   |`)                     
    console.log("   └─────────────────────────────────────────────\n")
    console.log("⚠️  IMPORTANT: Changez le mot de passe après la première connexion!\n")

  } catch (error) {
    console.error("❌ Erreur lors de la création de l'admin:")
    console.error(error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()
