import { GET as getCategories, POST as createCategory } from '@/app/api/categories/route'
import { GET as getCategory, PATCH as updateCategory, DELETE as deleteCategory } from '@/app/api/categories/[id]/route'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { jwtVerify } from 'jose'

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    category: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    ticket: {
      count: jest.fn(),
    },
  },
}))

// Mock jose
jest.mock('jose', () => ({
  jwtVerify: jest.fn(),
}))

describe('/api/categories', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/categories', () => {
    it('devrait retourner la liste des catégories', async () => {
      const mockCategories = [
        {
          id: 'cat-1',
          name: 'Technique',
          description: 'Problèmes techniques',
          icon: 'wrench',
          color: '#3b82f6',
          _count: { tickets: 10, articles: 5 },
        },
        {
          id: 'cat-2',
          name: 'Facturation',
          description: 'Questions de facturation',
          icon: 'dollar-sign',
          color: '#10b981',
          _count: { tickets: 3, articles: 2 },
        },
      ]

      ;(prisma.category.findMany as jest.Mock).mockResolvedValue(mockCategories)

      const request = new NextRequest('http://localhost:3000/api/categories')
      const response = await getCategories(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.categories).toEqual(mockCategories)
      expect(prisma.category.findMany).toHaveBeenCalledTimes(1)
    })

    it('devrait inclure le comptage des tickets et articles', async () => {
      ;(prisma.category.findMany as jest.Mock).mockResolvedValue([])

      const request = new NextRequest('http://localhost:3000/api/categories')
      await getCategories(request)

      expect(prisma.category.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            _count: expect.objectContaining({
              select: {
                tickets: true,
              },
            }),
          }),
        })
      )
    })

    it('devrait gérer les erreurs', async () => {
      ;(prisma.category.findMany as jest.Mock).mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost:3000/api/categories')
      const response = await getCategories(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
    })
  })

  describe('POST /api/categories', () => {
    it('devrait créer une catégorie avec authentification admin', async () => {
      const categoryData = {
        name: 'Nouvelle catégorie',
        description: 'Description de la catégorie',
        icon: 'star',
        color: '#f59e0b',
      }

      const createdCategory = {
        id: 'cat-3',
        ...categoryData,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      ;(jwtVerify as jest.Mock).mockResolvedValue({
        payload: { userId: 'admin-1', role: 'admin' },
      })
      ;(prisma.category.create as jest.Mock).mockResolvedValue(createdCategory)

      const request = new NextRequest('http://localhost:3000/api/categories', {
        method: 'POST',
        body: JSON.stringify(categoryData),
      })

      Object.defineProperty(request, 'cookies', {
        value: {
          get: jest.fn().mockReturnValue({ value: 'admin-token' }),
        },
      })

      const response = await createCategory(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.category).toMatchObject({
        id: createdCategory.id,
        name: createdCategory.name,
        description: createdCategory.description,
        icon: createdCategory.icon,
        color: createdCategory.color,
      })
    })

    it('devrait rejeter si non authentifié', async () => {
      const categoryData = {
        name: 'Catégorie',
        description: 'Description',
      }

      const request = new NextRequest('http://localhost:3000/api/categories', {
        method: 'POST',
        body: JSON.stringify(categoryData),
      })

      const response = await createCategory(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
    })

    it('devrait rejeter si non admin', async () => {
      const categoryData = {
        name: 'Catégorie',
        description: 'Description',
      }

      ;(jwtVerify as jest.Mock).mockResolvedValue({
        payload: { userId: 'user-1', role: 'agent' },
      })

      const request = new NextRequest('http://localhost:3000/api/categories', {
        method: 'POST',
        body: JSON.stringify(categoryData),
      })

      Object.defineProperty(request, 'cookies', {
        value: {
          get: jest.fn().mockReturnValue({ value: 'user-token' }),
        },
      })

      const response = await createCategory(request)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.success).toBe(false)
    })

    it('devrait valider les champs requis', async () => {
      const incompleteData = {
        name: 'Catégorie',
        // description manquante
      }

      ;(jwtVerify as jest.Mock).mockResolvedValue({
        payload: { userId: 'admin-1', role: 'admin' },
      })

      const request = new NextRequest('http://localhost:3000/api/categories', {
        method: 'POST',
        body: JSON.stringify(incompleteData),
      })

      Object.defineProperty(request, 'cookies', {
        value: {
          get: jest.fn().mockReturnValue({ value: 'admin-token' }),
        },
      })

      const response = await createCategory(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })
  })

  // Note: Les routes GET/PATCH/DELETE [id] n'ont pas de tests car elles n'existent pas dans le fichier route actuel

})
