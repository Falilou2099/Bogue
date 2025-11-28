import { GET, POST } from '@/app/api/users/route'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}))

// Mock jose
jest.mock('jose', () => ({
  jwtVerify: jest.fn(),
}))

// Mock bcrypt
jest.mock('bcryptjs')

describe('/api/users', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/users', () => {
    it('devrait retourner la liste des utilisateurs', async () => {
      const mockUsers = [
        {
          id: 'user-1',
          name: 'User 1',
          email: 'user1@example.com',
          role: 'AGENT',
          avatar: null,
          twoFactorEnabled: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          _count: {
            createdTickets: 5,
            assignedTickets: 3,
          },
        },
        {
          id: 'user-2',
          name: 'User 2',
          email: 'user2@example.com',
          role: 'DEMANDEUR',
          avatar: null,
          twoFactorEnabled: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          _count: {
            createdTickets: 2,
            assignedTickets: 0,
          },
        },
      ]

      ;(prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers)

      const request = new NextRequest('http://localhost:3000/api/users')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.users).toHaveLength(2)
      expect(data.users[0]).toMatchObject({
        id: mockUsers[0].id,
        name: mockUsers[0].name,
        email: mockUsers[0].email,
        role: mockUsers[0].role,
      })
      expect(prisma.user.findMany).toHaveBeenCalledTimes(1)
    })

    it('devrait gérer les erreurs de base de données', async () => {
      ;(prisma.user.findMany as jest.Mock).mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost:3000/api/users')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Erreur serveur')
    })

    it('devrait trier les utilisateurs par nom', async () => {
      ;(prisma.user.findMany as jest.Mock).mockResolvedValue([])

      const request = new NextRequest('http://localhost:3000/api/users')
      await GET(request)

      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { name: 'asc' },
        })
      )
    })
  })

  describe('POST /api/users', () => {
    it('devrait créer un utilisateur avec authentification admin', async () => {
      const newUserData = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'TestPassword123!',
        role: 'AGENT',
      }

      const hashedPassword = 'hashed_password'
      const createdUser = {
        id: 'user-3',
        name: newUserData.name,
        email: newUserData.email,
        role: newUserData.role,
        avatar: null,
        createdAt: new Date(),
      }

      // Mock authentification admin
      ;(jwtVerify as jest.Mock).mockResolvedValue({
        payload: { userId: 'admin-1', role: 'admin' },
      })
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)
      ;(bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword)
      ;(prisma.user.create as jest.Mock).mockResolvedValue(createdUser)

      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        body: JSON.stringify(newUserData),
      })

      // Mock cookies
      Object.defineProperty(request, 'cookies', {
        value: {
          get: jest.fn().mockReturnValue({ value: 'admin-token' }),
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.user).toMatchObject({
        id: createdUser.id,
        name: createdUser.name,
        email: createdUser.email,
        role: createdUser.role,
      })
      expect(bcrypt.hash).toHaveBeenCalledWith(newUserData.password, 12)
    })

    it('devrait rejeter si non authentifié', async () => {
      const newUserData = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'TestPassword123!',
      }

      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        body: JSON.stringify(newUserData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Non authentifié')
    })

    it('devrait rejeter si non admin', async () => {
      const newUserData = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'TestPassword123!',
      }

      ;(jwtVerify as jest.Mock).mockResolvedValue({
        payload: { userId: 'user-1', role: 'agent' },
      })

      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        body: JSON.stringify(newUserData),
      })

      Object.defineProperty(request, 'cookies', {
        value: {
          get: jest.fn().mockReturnValue({ value: 'user-token' }),
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Permissions insuffisantes')
    })

    it('devrait valider les champs requis', async () => {
      const incompleteData = {
        name: 'New User',
        // email manquant
        password: 'TestPassword123!',
      }

      ;(jwtVerify as jest.Mock).mockResolvedValue({
        payload: { userId: 'admin-1', role: 'admin' },
      })

      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        body: JSON.stringify(incompleteData),
      })

      Object.defineProperty(request, 'cookies', {
        value: {
          get: jest.fn().mockReturnValue({ value: 'admin-token' }),
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('requis')
    })

    it('devrait rejeter un email déjà utilisé', async () => {
      const newUserData = {
        name: 'New User',
        email: 'existing@example.com',
        password: 'TestPassword123!',
      }

      ;(jwtVerify as jest.Mock).mockResolvedValue({
        payload: { userId: 'admin-1', role: 'admin' },
      })
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'existing-user',
        email: newUserData.email,
      })

      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        body: JSON.stringify(newUserData),
      })

      Object.defineProperty(request, 'cookies', {
        value: {
          get: jest.fn().mockReturnValue({ value: 'admin-token' }),
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('email')
      expect(prisma.user.create).not.toHaveBeenCalled()
    })

    it('devrait hasher le mot de passe avant création', async () => {
      const newUserData = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'PlainPassword123!',
      }

      const hashedPassword = 'hashed_password_xyz'

      ;(jwtVerify as jest.Mock).mockResolvedValue({
        payload: { userId: 'admin-1', role: 'admin' },
      })
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)
      ;(bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword)
      ;(prisma.user.create as jest.Mock).mockResolvedValue({
        id: 'user-3',
        name: newUserData.name,
        email: newUserData.email,
      })

      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        body: JSON.stringify(newUserData),
      })

      Object.defineProperty(request, 'cookies', {
        value: {
          get: jest.fn().mockReturnValue({ value: 'admin-token' }),
        },
      })

      await POST(request)

      expect(bcrypt.hash).toHaveBeenCalledWith(newUserData.password, 12)
      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            password: hashedPassword,
          }),
        })
      )
    })

    it('devrait attribuer le rôle DEMANDEUR par défaut si non spécifié', async () => {
      const newUserData = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'TestPassword123!',
        // role non spécifié
      }

      ;(jwtVerify as jest.Mock).mockResolvedValue({
        payload: { userId: 'admin-1', role: 'admin' },
      })
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)
      ;(bcrypt.hash as jest.Mock).mockResolvedValue('hashed')
      ;(prisma.user.create as jest.Mock).mockResolvedValue({
        id: 'user-3',
        name: newUserData.name,
        email: newUserData.email,
        role: 'DEMANDEUR',
      })

      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        body: JSON.stringify(newUserData),
      })

      Object.defineProperty(request, 'cookies', {
        value: {
          get: jest.fn().mockReturnValue({ value: 'admin-token' }),
        },
      })

      await POST(request)

      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            role: 'DEMANDEUR',
          }),
        })
      )
    })
  })
})
