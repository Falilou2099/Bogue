import { POST as loginPOST } from '@/app/api/auth/login/route'
import { POST as registerPOST } from '@/app/api/auth/register/route'
import { GET as meGET } from '@/app/api/auth/me/route'
import { POST as logoutPOST } from '@/app/api/auth/logout/route'
import { NextRequest } from 'next/server'
import { authenticateUser, createUser, getUserById } from '@/lib/auth'
import { SignJWT, jwtVerify } from 'jose'

// Mock auth functions
jest.mock('@/lib/auth')

// Mock jose
jest.mock('jose', () => ({
  SignJWT: jest.fn(),
  jwtVerify: jest.fn(),
}))

describe('/api/auth', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/auth/login', () => {
    it('devrait connecter un utilisateur avec des credentials valides', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'TestPassword123!',
      }

      const mockUser = {
        id: 'user-1',
        email: loginData.email,
        name: 'Test User',
        role: 'agent' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        twoFactorEnabled: false,
      }

      const mockToken = 'mock-jwt-token'

      ;(authenticateUser as jest.Mock).mockResolvedValue(mockUser)
      
      const mockSignJWT = {
        setProtectedHeader: jest.fn().mockReturnThis(),
        setIssuedAt: jest.fn().mockReturnThis(),
        setExpirationTime: jest.fn().mockReturnThis(),
        sign: jest.fn().mockResolvedValue(mockToken),
      }
      ;(SignJWT as jest.Mock).mockImplementation(() => mockSignJWT)

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(loginData),
      })

      const response = await loginPOST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.user).toMatchObject({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role,
        twoFactorEnabled: mockUser.twoFactorEnabled,
      })
      expect(authenticateUser).toHaveBeenCalledWith(loginData.email, loginData.password)
    })

    it('devrait rejeter des credentials invalides', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword',
      }

      ;(authenticateUser as jest.Mock).mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(loginData),
      })

      const response = await loginPOST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Email ou mot de passe incorrect')
    })

    it('devrait valider le format des données', async () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password',
      }

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(invalidData),
      })

      const response = await loginPOST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Données invalides')
    })

    it('devrait définir un cookie HTTP-only', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'TestPassword123!',
      }

      const mockUser = {
        id: 'user-1',
        email: loginData.email,
        name: 'Test User',
        role: 'agent' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        twoFactorEnabled: false,
      }

      ;(authenticateUser as jest.Mock).mockResolvedValue(mockUser)
      
      const mockSignJWT = {
        setProtectedHeader: jest.fn().mockReturnThis(),
        setIssuedAt: jest.fn().mockReturnThis(),
        setExpirationTime: jest.fn().mockReturnThis(),
        sign: jest.fn().mockResolvedValue('token'),
      }
      ;(SignJWT as jest.Mock).mockImplementation(() => mockSignJWT)

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(loginData),
      })

      const response = await loginPOST(request)

      // Vérifier que le cookie est défini
      const cookies = response.cookies.getAll()
      const authCookie = cookies.find(c => c.name === 'auth-token')
      
      expect(authCookie).toBeDefined()
    })
  })

  describe('POST /api/auth/register', () => {
    it('devrait créer un nouvel utilisateur', async () => {
      const registerData = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'TestPassword123!',
        confirmPassword: 'TestPassword123!',
      }

      const mockUser = {
        id: 'user-2',
        email: registerData.email,
        name: registerData.name,
        role: 'demandeur' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        twoFactorEnabled: false,
      }

      ;(createUser as jest.Mock).mockResolvedValue(mockUser)

      const mockSignJWT = {
        setProtectedHeader: jest.fn().mockReturnThis(),
        setIssuedAt: jest.fn().mockReturnThis(),
        setExpirationTime: jest.fn().mockReturnThis(),
        sign: jest.fn().mockResolvedValue('token'),
      }
      ;(SignJWT as jest.Mock).mockImplementation(() => mockSignJWT)

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(registerData),
      })

      const response = await registerPOST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.user).toMatchObject({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role,
        twoFactorEnabled: mockUser.twoFactorEnabled,
      })
      expect(createUser).toHaveBeenCalledWith(
        registerData.name,
        registerData.email,
        registerData.password
      )
    })

    it('devrait rejeter un email déjà utilisé', async () => {
      const registerData = {
        name: 'Test User',
        email: 'existing@example.com',
        password: 'TestPassword123!',
        confirmPassword: 'TestPassword123!',
      }

      ;(createUser as jest.Mock).mockRejectedValue(
        new Error('Un utilisateur avec cet email existe déjà')
      )

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(registerData),
      })

      const response = await registerPOST(request)
      const data = await response.json()

      expect(response.status).toBe(409)
      expect(data.success).toBe(false)
      expect(data.error).toContain('email')
    })

    it('devrait valider la complexité du mot de passe', async () => {
      const invalidData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'weak',
        confirmPassword: 'weak',
      }

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(invalidData),
      })

      const response = await registerPOST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })
  })

  describe('GET /api/auth/me', () => {
    it('devrait retourner l\'utilisateur connecté', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'agent' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        twoFactorEnabled: false,
      }

      ;(jwtVerify as jest.Mock).mockResolvedValue({
        payload: { userId: 'user-1', email: 'test@example.com' },
      })
      ;(getUserById as jest.Mock).mockResolvedValue(mockUser)

      const request = new NextRequest('http://localhost:3000/api/auth/me', {
        headers: {
          Cookie: 'auth-token=valid-token',
        },
      })

      // Mock cookies
      Object.defineProperty(request, 'cookies', {
        value: {
          get: jest.fn().mockReturnValue({ value: 'valid-token' }),
        },
      })

      const response = await meGET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.user).toMatchObject({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role,
        twoFactorEnabled: mockUser.twoFactorEnabled,
      })
    })

    it('devrait rejeter une requête sans token', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/me')

      const response = await meGET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.error).toContain('authentifié')
    })

    it('devrait rejeter un token invalide', async () => {
      ;(jwtVerify as jest.Mock).mockRejectedValue(new Error('Invalid token'))

      const request = new NextRequest('http://localhost:3000/api/auth/me')

      Object.defineProperty(request, 'cookies', {
        value: {
          get: jest.fn().mockReturnValue({ value: 'invalid-token' }),
        },
      })

      const response = await meGET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
    })
  })

  describe('POST /api/auth/logout', () => {
    it('devrait déconnecter l\'utilisateur', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/logout', {
        method: 'POST',
      })

      const response = await logoutPOST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toBe('Déconnexion réussie')
    })

    it('devrait supprimer le cookie auth-token', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/logout', {
        method: 'POST',
      })

      const response = await logoutPOST(request)

      // Le cookie devrait être supprimé
      const cookies = response.cookies.getAll()
      const authCookie = cookies.find(c => c.name === 'auth-token')
      
      // Le cookie devrait être vide ou avoir une date d'expiration passée
      expect(authCookie?.value === '' || authCookie === undefined).toBe(true)
    })
  })
})
