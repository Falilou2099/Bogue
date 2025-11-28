import { GET as getArticles, POST as createArticle } from '@/app/api/articles/route'
import { GET as getArticle, PATCH as updateArticle, DELETE as deleteArticle } from '@/app/api/articles/[id]/route'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { jwtVerify } from 'jose'

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    article: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}))

// Mock jose
jest.mock('jose', () => ({
  jwtVerify: jest.fn(),
}))

describe('/api/articles', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/articles', () => {
    it('devrait retourner la liste des articles', async () => {
      const mockArticles = [
        {
          id: 'article-1',
          title: 'Article 1',
          content: 'Contenu de l\'article 1',
          published: true,
          views: 100,
          category: { id: 'cat-1', name: 'Technique' },
          author: { id: 'user-1', name: 'Author 1' },
        },
      ]

      ;(prisma.article.findMany as jest.Mock).mockResolvedValue(mockArticles)

      const request = new NextRequest('http://localhost:3000/api/articles')
      const response = await getArticles(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.articles).toEqual(mockArticles)
    })

    // Note: Le filtrage par catégorie n'est pas implémenté dans la route actuelle

    // Note: Le filtrage par statut publié n'est pas implémenté dans la route actuelle
  })

  describe('POST /api/articles', () => {
    it('devrait créer un article avec authentification', async () => {
      const articleData = {
        title: 'Nouvel article',
        content: 'Contenu détaillé de l\'article',
        categoryId: 'cat-1',
        tags: ['test', 'guide'],
        published: true,
      }

      const createdArticle = {
        id: 'article-2',
        title: articleData.title,
        content: articleData.content,
        categoryId: articleData.categoryId,
        authorId: 'user-1',
        tags: articleData.tags,
        published: articleData.published,
        views: 0,
        helpful: 0,
        notHelpful: 0,
      }

      ;(jwtVerify as jest.Mock).mockResolvedValue({
        payload: { userId: 'user-1', role: 'admin' },
      })
      ;(prisma.article.create as jest.Mock).mockResolvedValue(createdArticle)

      const request = new NextRequest('http://localhost:3000/api/articles', {
        method: 'POST',
        body: JSON.stringify(articleData),
      })

      Object.defineProperty(request, 'cookies', {
        value: {
          get: jest.fn().mockReturnValue({ value: 'valid-token' }),
        },
      })

      const response = await createArticle(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.article).toMatchObject({
        id: createdArticle.id,
        title: createdArticle.title,
        content: createdArticle.content,
        categoryId: createdArticle.categoryId,
        authorId: createdArticle.authorId,
      })
    })

    it('devrait rejeter si non authentifié', async () => {
      const articleData = {
        title: 'Article',
        content: 'Contenu',
        categoryId: 'cat-1',
      }

      const request = new NextRequest('http://localhost:3000/api/articles', {
        method: 'POST',
        body: JSON.stringify(articleData),
      })

      const response = await createArticle(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
    })

    it('devrait rejeter si permissions insuffisantes', async () => {
      const articleData = {
        title: 'Article',
        content: 'Contenu',
        categoryId: 'cat-1',
      }

      ;(jwtVerify as jest.Mock).mockResolvedValue({
        payload: { userId: 'user-1', role: 'demandeur' },
      })

      const request = new NextRequest('http://localhost:3000/api/articles', {
        method: 'POST',
        body: JSON.stringify(articleData),
      })

      Object.defineProperty(request, 'cookies', {
        value: {
          get: jest.fn().mockReturnValue({ value: 'user-token' }),
        },
      })

      const response = await createArticle(request)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.success).toBe(false)
    })

    it('devrait valider les champs requis', async () => {
      const incompleteData = {
        title: 'Article',
        // content manquant
        categoryId: 'cat-1',
      }

      ;(jwtVerify as jest.Mock).mockResolvedValue({
        payload: { userId: 'user-1', role: 'admin' },
      })

      const request = new NextRequest('http://localhost:3000/api/articles', {
        method: 'POST',
        body: JSON.stringify(incompleteData),
      })

      Object.defineProperty(request, 'cookies', {
        value: {
          get: jest.fn().mockReturnValue({ value: 'admin-token' }),
        },
      })

      const response = await createArticle(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })
  })

  describe('GET /api/articles/[id]', () => {
    it('devrait retourner un article par son ID', async () => {
      const mockArticle = {
        id: 'article-1',
        title: 'Article Test',
        content: 'Contenu test',
        views: 50,
        category: { id: 'cat-1', name: 'Technique' },
        author: { id: 'user-1', name: 'Author' },
      }

      ;(prisma.article.findUnique as jest.Mock).mockResolvedValue(mockArticle)
      ;(prisma.article.update as jest.Mock).mockResolvedValue(mockArticle)

      const request = new NextRequest('http://localhost:3000/api/articles/article-1')
      const response = await getArticle(request, { params: Promise.resolve({ id: 'article-1' }) })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.article).toEqual(mockArticle)
    })

    it('devrait incrémenter le compteur de vues', async () => {
      const mockArticle = {
        id: 'article-1',
        title: 'Article',
        views: 10,
      }

      ;(prisma.article.findUnique as jest.Mock).mockResolvedValue(mockArticle)
      ;(prisma.article.update as jest.Mock).mockResolvedValue({
        ...mockArticle,
        views: 11,
      })

      const request = new NextRequest('http://localhost:3000/api/articles/article-1')
      await getArticle(request, { params: Promise.resolve({ id: 'article-1' }) })

      expect(prisma.article.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'article-1' },
          data: { views: { increment: 1 } },
        })
      )
    })

    it('devrait retourner 404 si article non trouvé', async () => {
      ;(prisma.article.findUnique as jest.Mock).mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/articles/nonexistent')
      const response = await getArticle(request, { params: Promise.resolve({ id: 'nonexistent' }) })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.success).toBe(false)
    })
  })

  describe('PATCH /api/articles/[id]', () => {
    it('devrait mettre à jour un article', async () => {
      const updateData = {
        title: 'Titre mis à jour',
        content: 'Contenu mis à jour',
      }

      const updatedArticle = {
        id: 'article-1',
        ...updateData,
        authorId: 'user-1',
      }

      ;(jwtVerify as jest.Mock).mockResolvedValue({
        payload: { userId: 'user-1', role: 'admin' },
      })
      ;(prisma.article.update as jest.Mock).mockResolvedValue(updatedArticle)

      const request = new NextRequest('http://localhost:3000/api/articles/article-1', {
        method: 'PATCH',
        body: JSON.stringify(updateData),
      })

      Object.defineProperty(request, 'cookies', {
        value: {
          get: jest.fn().mockReturnValue({ value: 'admin-token' }),
        },
      })

      const response = await updateArticle(request, { params: Promise.resolve({ id: 'article-1' }) })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.article).toEqual(updatedArticle)
    })

    it('devrait rejeter si non authentifié', async () => {
      const updateData = { title: 'Nouveau titre' }

      const request = new NextRequest('http://localhost:3000/api/articles/article-1', {
        method: 'PATCH',
        body: JSON.stringify(updateData),
      })

      const response = await updateArticle(request, { params: Promise.resolve({ id: 'article-1' }) })
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
    })
  })

  describe('DELETE /api/articles/[id]', () => {
    it('devrait supprimer un article', async () => {
      ;(jwtVerify as jest.Mock).mockResolvedValue({
        payload: { userId: 'user-1', role: 'admin' },
      })
      ;(prisma.article.delete as jest.Mock).mockResolvedValue({
        id: 'article-1',
      })

      const request = new NextRequest('http://localhost:3000/api/articles/article-1', {
        method: 'DELETE',
      })

      Object.defineProperty(request, 'cookies', {
        value: {
          get: jest.fn().mockReturnValue({ value: 'admin-token' }),
        },
      })

      const response = await deleteArticle(request, { params: Promise.resolve({ id: 'article-1' }) })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(prisma.article.delete).toHaveBeenCalledWith({
        where: { id: 'article-1' },
      })
    })

    it('devrait rejeter si non admin', async () => {
      ;(jwtVerify as jest.Mock).mockResolvedValue({
        payload: { userId: 'user-1', role: 'agent' },
      })

      const request = new NextRequest('http://localhost:3000/api/articles/article-1', {
        method: 'DELETE',
      })

      Object.defineProperty(request, 'cookies', {
        value: {
          get: jest.fn().mockReturnValue({ value: 'agent-token' }),
        },
      })

      const response = await deleteArticle(request, { params: Promise.resolve({ id: 'article-1' }) })
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.success).toBe(false)
    })
  })
})
