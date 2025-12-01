import { GET, PATCH } from '@/app/api/users/[id]/route'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}))

describe('/api/users/[id] - Settings', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET', () => {
    it('devrait retourner les informations utilisateur', async () => {
      const mockUser = {
        id: 'user-1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'AGENT',
        avatar: null,
        createdAt: new Date('2024-01-01'),
      }

      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)

      const request = new NextRequest('http://localhost:3000/api/users/user-1')
      const response = await GET(request, { params: { id: 'user-1' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.user).toMatchObject({
        id: 'user-1',
        name: 'John Doe',
        email: 'john@example.com',
      })
    })

    it('devrait retourner 404 si utilisateur non trouvé', async () => {
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/users/user-999')
      const response = await GET(request, { params: { id: 'user-999' } })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.success).toBe(false)
    })
  })

  describe('PATCH', () => {
    it('devrait mettre à jour le profil utilisateur', async () => {
      const mockUser = {
        id: 'user-1',
        name: 'John Updated',
        email: 'john.updated@example.com',
        role: 'AGENT',
      }

      ;(prisma.user.update as jest.Mock).mockResolvedValue(mockUser)

      const request = new NextRequest('http://localhost:3000/api/users/user-1', {
        method: 'PATCH',
        body: JSON.stringify({
          name: 'John Updated',
          email: 'john.updated@example.com',
        }),
      })

      const response = await PATCH(request, { params: { id: 'user-1' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.user.name).toBe('John Updated')
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: expect.objectContaining({
          name: 'John Updated',
          email: 'john.updated@example.com',
        }),
      })
    })

    it('devrait valider le format email', async () => {
      const request = new NextRequest('http://localhost:3000/api/users/user-1', {
        method: 'PATCH',
        body: JSON.stringify({
          email: 'invalid-email',
        }),
      })

      const response = await PATCH(request, { params: { id: 'user-1' } })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Email invalide')
    })

    it('devrait gérer les erreurs de base de données', async () => {
      ;(prisma.user.update as jest.Mock).mockRejectedValue(
        new Error('Database error')
      )

      const request = new NextRequest('http://localhost:3000/api/users/user-1', {
        method: 'PATCH',
        body: JSON.stringify({
          name: 'John Updated',
        }),
      })

      const response = await PATCH(request, { params: { id: 'user-1' } })
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
    })
  })
})
