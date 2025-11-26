const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

async function test() {
  try {
    const users = await prisma.user.count()
    const tickets = await prisma.ticket.count()
    const categories = await prisma.category.count()
    
    console.log("\n📊 Données dans la BDD:")
    console.log(`   - ${users} utilisateurs`)
    console.log(`   - ${tickets} tickets`)
    console.log(`   - ${categories} catégories`)
    
    if (users > 0) {
      console.log("\n✅ Le seed a fonctionné!")
      const adminUser = await prisma.user.findUnique({
        where: { email: "admin@ticketflow.com" }
      })
      if (adminUser) {
        console.log(`\n👤 Utilisateur admin trouvé: ${adminUser.name}`)
      }
    } else {
      console.log("\n❌ Aucune donnée trouvée - le seed n'a pas fonctionné")
    }
  } catch (error) {
    console.error("Erreur:", error.message)
  } finally {
    await prisma.$disconnect()
  }
}

test()
