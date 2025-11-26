import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Début du seed de la base de données...")

  // Hash du mot de passe pour les utilisateurs de test
  const hashedPassword = await bcrypt.hash("Password123!", 12)

  // Créer les catégories
  console.log("📁 Création des catégories...")
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { id: "cat-1" },
      update: {},
      create: {
        id: "cat-1",
        name: "Technique",
        description: "Problèmes techniques et bugs",
      },
    }),
    prisma.category.upsert({
      where: { id: "cat-2" },
      update: {},
      create: {
        id: "cat-2",
        name: "Facturation",
        description: "Questions de facturation et paiement",
      },
    }),
    prisma.category.upsert({
      where: { id: "cat-3" },
      update: {},
      create: {
        id: "cat-3",
        name: "Commercial",
        description: "Demandes commerciales et devis",
      },
    }),
    prisma.category.upsert({
      where: { id: "cat-4" },
      update: {},
      create: {
        id: "cat-4",
        name: "Support Général",
        description: "Questions générales et assistance",
      },
    }),
  ])
  console.log(`✅ ${categories.length} catégories créées`)

  // Créer les SLA
  console.log("⏱️  Création des SLA...")
  const slas = await Promise.all([
    prisma.sLA.upsert({
      where: { id: "sla-1" },
      update: {},
      create: {
        id: "sla-1",
        name: "SLA Critique",
        priority: "CRITIQUE",
        responseTime: 30,
        resolutionTime: 240,
        escalationEnabled: true,
      },
    }),
    prisma.sLA.upsert({
      where: { id: "sla-2" },
      update: {},
      create: {
        id: "sla-2",
        name: "SLA Haute",
        priority: "HAUTE",
        responseTime: 60,
        resolutionTime: 480,
        escalationEnabled: true,
      },
    }),
    prisma.sLA.upsert({
      where: { id: "sla-3" },
      update: {},
      create: {
        id: "sla-3",
        name: "SLA Moyenne",
        priority: "MOYENNE",
        responseTime: 240,
        resolutionTime: 1440,
        escalationEnabled: false,
      },
    }),
  ])
  console.log(`✅ ${slas.length} SLA créés`)

  // Créer les utilisateurs
  console.log("👥 Création des utilisateurs...")
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: "admin@ticketflow.com" },
      update: {},
      create: {
        email: "admin@ticketflow.com",
        name: "Sophie Martin",
        password: hashedPassword,
        role: "ADMIN",
        twoFactorEnabled: false,
      },
    }),
    prisma.user.upsert({
      where: { email: "manager@ticketflow.com" },
      update: {},
      create: {
        email: "manager@ticketflow.com",
        name: "Pierre Dubois",
        password: hashedPassword,
        role: "MANAGER",
        twoFactorEnabled: false,
      },
    }),
    prisma.user.upsert({
      where: { email: "agent@ticketflow.com" },
      update: {},
      create: {
        email: "agent@ticketflow.com",
        name: "Marie Leroy",
        password: hashedPassword,
        role: "AGENT",
        twoFactorEnabled: false,
      },
    }),
    prisma.user.upsert({
      where: { email: "client@example.com" },
      update: {},
      create: {
        email: "client@example.com",
        name: "Emma Petit",
        password: hashedPassword,
        role: "DEMANDEUR",
        twoFactorEnabled: false,
      },
    }),
  ])
  console.log(`✅ ${users.length} utilisateurs créés`)

  console.log("\n🎉 Seed terminé avec succès!")
  console.log("\n📝 Utilisateurs de test créés:")
  console.log("   Email: admin@ticketflow.com")
  console.log("   Email: manager@ticketflow.com")
  console.log("   Email: agent@ticketflow.com")
  console.log("   Email: client@example.com")
  console.log("   Mot de passe pour tous: Password123!")
}

main()
  .catch((e) => {
    console.error("❌ Erreur lors du seed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
