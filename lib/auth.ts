import bcrypt from "bcryptjs"
import { prisma } from "./prisma"
import type { User } from "./types"

// Nombre de rounds pour bcrypt (10-12 recommandé pour la sécurité)
const SALT_ROUNDS = 12

/**
 * Hash un mot de passe avec bcrypt
 * @param password - Mot de passe en clair
 * @returns Mot de passe hashé
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

/**
 * Vérifie un mot de passe contre son hash
 * @param password - Mot de passe en clair
 * @param hashedPassword - Mot de passe hashé
 * @returns true si le mot de passe correspond
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

/**
 * Crée un nouvel utilisateur avec mot de passe hashé
 * @param name - Nom de l'utilisateur
 * @param email - Email de l'utilisateur
 * @param password - Mot de passe en clair
 * @returns Utilisateur créé (sans le mot de passe)
 */
export async function createUser(
  name: string,
  email: string,
  password: string
): Promise<Omit<User, "password">> {
  // Vérifier si l'email existe déjà
  const existingUser = await prisma.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    throw new Error("Un utilisateur avec cet email existe déjà")
  }

  // Hash du mot de passe
  const hashedPassword = await hashPassword(password)

  // Créer l'utilisateur
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: "DEMANDEUR", // Rôle par défaut
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      avatar: true,
      createdAt: true,
      updatedAt: true,
      twoFactorEnabled: true,
    },
  })

  // Mapper le rôle Prisma vers le type User
  return {
    ...user,
    role: user.role.toLowerCase() as User["role"],
  }
}

/**
 * Authentifie un utilisateur
 * @param email - Email de l'utilisateur
 * @param password - Mot de passe en clair
 * @returns Utilisateur authentifié (sans le mot de passe) ou null
 */
export async function authenticateUser(
  email: string,
  password: string
): Promise<Omit<User, "password"> | null> {
  // Récupérer l'utilisateur avec son mot de passe
  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) {
    return null
  }

  // Vérifier le mot de passe
  const isValid = await verifyPassword(password, user.password)

  if (!isValid) {
    return null
  }

  // Retourner l'utilisateur sans le mot de passe
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role.toLowerCase() as User["role"],
    avatar: user.avatar || undefined,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    twoFactorEnabled: user.twoFactorEnabled,
  }
}

/**
 * Récupère un utilisateur par son ID
 * @param id - ID de l'utilisateur
 * @returns Utilisateur (sans le mot de passe) ou null
 */
export async function getUserById(
  id: string
): Promise<Omit<User, "password"> | null> {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      avatar: true,
      createdAt: true,
      updatedAt: true,
      twoFactorEnabled: true,
    },
  })

  if (!user) {
    return null
  }

  return {
    ...user,
    role: user.role.toLowerCase() as User["role"],
  }
}
