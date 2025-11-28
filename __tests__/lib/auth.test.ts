import { hashPassword, verifyPassword, createUser, authenticateUser, getUserById } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}))

// Mock bcrypt
jest.mock('bcryptjs')

describe('lib/auth.ts', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('hashPassword', () => {
    it('devrait hasher un mot de passe avec bcrypt', async () => {
      const password = 'TestPassword123!'
      const hashedPassword = 'hashed_password'

      ;(bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword)

      const result = await hashPassword(password)

      expect(bcrypt.hash).toHaveBeenCalledWith(password, 12)
      expect(result).toBe(hashedPassword)
    })

    it('devrait utiliser 12 rounds de salt', async () => {
      const password = 'TestPassword123!'
      await hashPassword(password)

      expect(bcrypt.hash).toHaveBeenCalledWith(password, 12)
    })
  })

  describe('verifyPassword', () => {
    it('devrait retourner true pour un mot de passe correct', async () => {
      const password = 'TestPassword123!'
      const hashedPassword = 'hashed_password'

      ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)

      const result = await verifyPassword(password, hashedPassword)

      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword)
      expect(result).toBe(true)
    })

    it('devrait retourner false pour un mot de passe incorrect', async () => {
      const password = 'WrongPassword123!'
      const hashedPassword = 'hashed_password'

      ;(bcrypt.compare as jest.Mock).mockResolvedValue(false)

      const result = await verifyPassword(password, hashedPassword)

      expect(result).toBe(false)
    })
  })

  describe('createUser', () => {
    it('devrait créer un nouvel utilisateur avec mot de passe hashé', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'TestPassword123!',
      }

      const hashedPassword = 'hashed_password'
      const createdUser = {
        id: 'user-1',
        name: userData.name,
        email: userData.email,
        role: 'DEMANDEUR',
        avatar: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        twoFactorEnabled: false,
      }

      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)
      ;(bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword)
      ;(prisma.user.create as jest.Mock).mockResolvedValue(createdUser)

      const result = await createUser(userData.name, userData.email, userData.password)

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: userData.email },
      })
      expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, 12)
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          name: userData.name,
          email: userData.email,
          password: hashedPassword,
          role: 'DEMANDEUR',
        },
        select: expect.any(Object),
      })
      expect(result.email).toBe(userData.email)
      expect(result.role).toBe('demandeur')
    })

    it('devrait rejeter si l\'email existe déjà', async () => {
      const existingUser = {
        id: 'user-1',
        email: 'existing@example.com',
        password: 'hashed',
      }

      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(existingUser)

      await expect(
        createUser('Test', 'existing@example.com', 'Password123!')
      ).rejects.toThrow('Un utilisateur avec cet email existe déjà')

      expect(prisma.user.create).not.toHaveBeenCalled()
    })

    it('devrait attribuer le rôle DEMANDEUR par défaut', async () => {
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)
      ;(bcrypt.hash as jest.Mock).mockResolvedValue('hashed')
      ;(prisma.user.create as jest.Mock).mockResolvedValue({
        id: 'user-1',
        name: 'Test',
        email: 'test@example.com',
        role: 'DEMANDEUR',
        avatar: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        twoFactorEnabled: false,
      })

      await createUser('Test', 'test@example.com', 'Password123!')

      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            role: 'DEMANDEUR',
          }),
        })
      )
    })
  })

  describe('authenticateUser', () => {
    it('devrait authentifier un utilisateur avec des credentials valides', async () => {
      const email = 'test@example.com'
      const password = 'TestPassword123!'
      const user = {
        id: 'user-1',
        email,
        name: 'Test User',
        password: 'hashed_password',
        role: 'AGENT',
        avatar: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        twoFactorEnabled: false,
      }

      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(user)
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)

      const result = await authenticateUser(email, password)

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email },
      })
      expect(bcrypt.compare).toHaveBeenCalledWith(password, user.password)
      expect(result).toBeDefined()
      expect(result?.email).toBe(email)
      expect(result?.role).toBe('agent')
      expect(result).not.toHaveProperty('password')
    })

    it('devrait retourner null si l\'utilisateur n\'existe pas', async () => {
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)

      const result = await authenticateUser('nonexistent@example.com', 'password')

      expect(result).toBeNull()
      expect(bcrypt.compare).not.toHaveBeenCalled()
    })

    it('devrait retourner null si le mot de passe est incorrect', async () => {
      const user = {
        id: 'user-1',
        email: 'test@example.com',
        password: 'hashed_password',
      }

      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(user)
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(false)

      const result = await authenticateUser('test@example.com', 'wrongpassword')

      expect(result).toBeNull()
    })

    it('ne devrait pas retourner le mot de passe dans le résultat', async () => {
      const user = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test',
        password: 'hashed_password',
        role: 'DEMANDEUR',
        avatar: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        twoFactorEnabled: false,
      }

      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(user)
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)

      const result = await authenticateUser('test@example.com', 'password')

      expect(result).not.toHaveProperty('password')
    })
  })

  describe('getUserById', () => {
    it('devrait récupérer un utilisateur par son ID', async () => {
      const userId = 'user-1'
      const user = {
        id: userId,
        email: 'test@example.com',
        name: 'Test User',
        role: 'ADMIN',
        avatar: 'avatar.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
        twoFactorEnabled: true,
      }

      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(user)

      const result = await getUserById(userId)

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        select: expect.any(Object),
      })
      expect(result).toBeDefined()
      expect(result?.id).toBe(userId)
      expect(result?.role).toBe('admin')
    })

    it('devrait retourner null si l\'utilisateur n\'existe pas', async () => {
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)

      const result = await getUserById('nonexistent-id')

      expect(result).toBeNull()
    })

    it('ne devrait pas inclure le mot de passe', async () => {
      const user = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test',
        role: 'AGENT',
        avatar: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        twoFactorEnabled: false,
      }

      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(user)

      const result = await getUserById('user-1')

      expect(result).not.toHaveProperty('password')
    })

    it('devrait normaliser le rôle en minuscules', async () => {
      const user = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test',
        role: 'MANAGER',
        avatar: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        twoFactorEnabled: false,
      }

      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(user)

      const result = await getUserById('user-1')

      expect(result?.role).toBe('manager')
    })
  })
})
