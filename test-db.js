const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Test de connexion à la base de données...\n')
  
  try {
    // Test de connexion
    await prisma.$connect()
    console.log('✅ Connexion à Neon réussie!\n')
    
    // Compter les utilisateurs existants
    const userCount = await prisma.user.count()
    console.log(`📊 Nombre d'utilisateurs: ${userCount}\n`)
    
    if (userCount === 0) {
      console.log('🌱 Création des utilisateurs de test...\n')
      
      const hashedPassword = await bcrypt.hash('Password123!', 12)
      
      const users = [
        { email: 'admin@ticketflow.com', name: 'Sophie Martin', role: 'ADMIN' },
        { email: 'manager@ticketflow.com', name: 'Pierre Dubois', role: 'MANAGER' },
        { email: 'agent@ticketflow.com', name: 'Marie Leroy', role: 'AGENT' },
        { email: 'client@example.com', name: 'Emma Petit', role: 'DEMANDEUR' },
      ]
      
      for (const userData of users) {
        await prisma.user.create({
          data: {
            ...userData,
            password: hashedPassword,
            twoFactorEnabled: false,
          }
        })
        console.log(`✅ ${userData.name} (${userData.email}) créé`)
      }
      
      console.log('\n🎉 Seed terminé avec succès!')
    } else {
      console.log('ℹ️  Des utilisateurs existent déjà')
      const users = await prisma.user.findMany({ select: { email: true, name: true, role: true } })
      console.log('\n👥 Utilisateurs existants:')
      users.forEach(u => console.log(`   - ${u.name} (${u.email}) - ${u.role}`))
    }
    
    console.log('\n📝 Mot de passe pour tous: Password123!')
    
  } catch (error) {
    console.error('❌ Erreur:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

main()
