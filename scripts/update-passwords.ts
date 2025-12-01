import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function updatePasswords() {
  console.log("🔐 Mise à jour des mots de passe existants...")

  // Nouveau mot de passe conforme (12 caractères minimum)
  const newPassword = "Password123!@"
  const hashedPassword = await bcrypt.hash(newPassword, 12)

  // Récupérer tous les utilisateurs
  const users = await prisma.user.findMany()

  console.log(`📊 ${users.length} utilisateurs trouvés`)

  // Mettre à jour chaque utilisateur
  for (const user of users) {
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    })
    console.log(`✅ Mot de passe mis à jour pour: ${user.email}`)
  }

  console.log("\n✨ Tous les mots de passe ont été mis à jour avec succès!")
  console.log(`📝 Nouveau mot de passe pour tous les comptes: ${newPassword}`)
  console.log("\n📋 Comptes disponibles:")
  
  for (const user of users) {
    console.log(`   - ${user.email} (${user.role})`)
  }
}

updatePasswords()
  .catch((e) => {
    console.error("❌ Erreur:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
