/**
 * Script pour créer un compte administrateur
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  console.log('🔐 Création du compte administrateur');
  console.log('=====================================');
  
  const adminData = {
    email: 'admin@ticketflow.com',
    name: 'Administrateur',
    password: 'Admin123!@#',
    role: 'ADMIN'
  };

  try {
    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash(adminData.password, 12);

    // Créer ou mettre à jour l'admin
    const admin = await prisma.user.upsert({
      where: { email: adminData.email },
      update: {
        password: hashedPassword,
        role: adminData.role,
      },
      create: {
        email: adminData.email,
        name: adminData.name,
        password: hashedPassword,
        role: adminData.role,
        twoFactorEnabled: false,
        hasCompletedTutorial: false,
      },
    });

    console.log('✅ Compte administrateur créé !');
    console.log('');
    console.log('📋 Identifiants:');
    console.log('   Email: ' + adminData.email);
    console.log('   Mot de passe: ' + adminData.password);
    console.log('');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
