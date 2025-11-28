import { loginSchema, registerSchema } from '@/lib/validations/auth'
import { ticketSchema, ticketUpdateSchema } from '@/lib/validations/ticket'
import { ZodError } from 'zod'

describe('lib/validations', () => {
  describe('loginSchema', () => {
    it('devrait valider des données de login correctes', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
      }

      const result = loginSchema.parse(validData)

      expect(result).toEqual(validData)
    })

    it('devrait rejeter un email invalide', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123',
      }

      expect(() => loginSchema.parse(invalidData)).toThrow(ZodError)
    })

    it('devrait rejeter un email vide', () => {
      const invalidData = {
        email: '',
        password: 'password123',
      }

      expect(() => loginSchema.parse(invalidData)).toThrow(ZodError)
    })

    it('devrait rejeter un mot de passe vide', () => {
      const invalidData = {
        email: 'test@example.com',
        password: '',
      }

      expect(() => loginSchema.parse(invalidData)).toThrow(ZodError)
    })

    it('devrait rejeter des champs manquants', () => {
      const invalidData = {
        email: 'test@example.com',
      }

      expect(() => loginSchema.parse(invalidData)).toThrow(ZodError)
    })
  })

  describe('registerSchema', () => {
    it('devrait valider des données d\'inscription correctes', () => {
      const validData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'TestPassword123!',
        confirmPassword: 'TestPassword123!',
      }

      const result = registerSchema.parse(validData)

      expect(result.name).toBe(validData.name)
      expect(result.email).toBe(validData.email)
    })

    it('devrait rejeter un nom trop court', () => {
      const invalidData = {
        name: 'T',
        email: 'test@example.com',
        password: 'TestPassword123!',
        confirmPassword: 'TestPassword123!',
      }

      expect(() => registerSchema.parse(invalidData)).toThrow(ZodError)
    })

    it('devrait rejeter un nom trop long', () => {
      const invalidData = {
        name: 'T'.repeat(101),
        email: 'test@example.com',
        password: 'TestPassword123!',
        confirmPassword: 'TestPassword123!',
      }

      expect(() => registerSchema.parse(invalidData)).toThrow(ZodError)
    })

    it('devrait rejeter un mot de passe trop court', () => {
      const invalidData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Test1!',
        confirmPassword: 'Test1!',
      }

      expect(() => registerSchema.parse(invalidData)).toThrow(ZodError)
    })

    it('devrait rejeter un mot de passe sans majuscule', () => {
      const invalidData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'testpassword123!',
        confirmPassword: 'testpassword123!',
      }

      expect(() => registerSchema.parse(invalidData)).toThrow(ZodError)
    })

    it('devrait rejeter un mot de passe sans minuscule', () => {
      const invalidData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'TESTPASSWORD123!',
        confirmPassword: 'TESTPASSWORD123!',
      }

      expect(() => registerSchema.parse(invalidData)).toThrow(ZodError)
    })

    it('devrait rejeter un mot de passe sans chiffre', () => {
      const invalidData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'TestPassword!',
        confirmPassword: 'TestPassword!',
      }

      expect(() => registerSchema.parse(invalidData)).toThrow(ZodError)
    })

    it('devrait rejeter un mot de passe sans caractère spécial', () => {
      const invalidData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'TestPassword123',
        confirmPassword: 'TestPassword123',
      }

      expect(() => registerSchema.parse(invalidData)).toThrow(ZodError)
    })

    it('devrait rejeter des mots de passe non correspondants', () => {
      const invalidData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'TestPassword123!',
        confirmPassword: 'DifferentPassword123!',
      }

      expect(() => registerSchema.parse(invalidData)).toThrow(ZodError)
    })

    it('devrait rejeter un email invalide', () => {
      const invalidData = {
        name: 'Test User',
        email: 'invalid-email',
        password: 'TestPassword123!',
        confirmPassword: 'TestPassword123!',
      }

      expect(() => registerSchema.parse(invalidData)).toThrow(ZodError)
    })
  })

  describe('ticketSchema', () => {
    it('devrait valider des données de ticket correctes', () => {
      const validData = {
        title: 'Problème technique',
        description: 'Description détaillée du problème rencontré',
        type: 'INCIDENT' as const,
        priority: 'HAUTE' as const,
        categoryId: 'cat-1',
        createdById: 'user-1',
      }

      const result = ticketSchema.parse(validData)

      expect(result).toEqual(validData)
    })

    it('devrait rejeter un titre trop court', () => {
      const invalidData = {
        title: 'AB',
        description: 'Description détaillée',
        type: 'INCIDENT' as const,
        priority: 'HAUTE' as const,
        categoryId: 'cat-1',
        createdById: 'user-1',
      }

      expect(() => ticketSchema.parse(invalidData)).toThrow(ZodError)
    })

    it('devrait rejeter un titre trop long', () => {
      const invalidData = {
        title: 'T'.repeat(101),
        description: 'Description détaillée',
        type: 'INCIDENT' as const,
        priority: 'HAUTE' as const,
        categoryId: 'cat-1',
        createdById: 'user-1',
      }

      expect(() => ticketSchema.parse(invalidData)).toThrow(ZodError)
    })

    it('devrait rejeter une description trop courte', () => {
      const invalidData = {
        title: 'Problème',
        description: 'Court',
        type: 'INCIDENT' as const,
        priority: 'HAUTE' as const,
        categoryId: 'cat-1',
        createdById: 'user-1',
      }

      expect(() => ticketSchema.parse(invalidData)).toThrow(ZodError)
    })

    it('devrait rejeter une description trop longue', () => {
      const invalidData = {
        title: 'Problème',
        description: 'D'.repeat(2001),
        type: 'INCIDENT' as const,
        priority: 'HAUTE' as const,
        categoryId: 'cat-1',
        createdById: 'user-1',
      }

      expect(() => ticketSchema.parse(invalidData)).toThrow(ZodError)
    })

    it('devrait rejeter un type invalide', () => {
      const invalidData = {
        title: 'Problème',
        description: 'Description détaillée',
        type: 'INVALID_TYPE',
        priority: 'HAUTE' as const,
        categoryId: 'cat-1',
        createdById: 'user-1',
      }

      expect(() => ticketSchema.parse(invalidData)).toThrow(ZodError)
    })

    it('devrait rejeter une priorité invalide', () => {
      const invalidData = {
        title: 'Problème',
        description: 'Description détaillée',
        type: 'INCIDENT' as const,
        priority: 'INVALID_PRIORITY',
        categoryId: 'cat-1',
        createdById: 'user-1',
      }

      expect(() => ticketSchema.parse(invalidData)).toThrow(ZodError)
    })

    it('devrait accepter des tags optionnels', () => {
      const validData = {
        title: 'Problème',
        description: 'Description détaillée',
        type: 'INCIDENT' as const,
        priority: 'HAUTE' as const,
        categoryId: 'cat-1',
        createdById: 'user-1',
        tags: ['urgent', 'réseau'],
      }

      const result = ticketSchema.parse(validData)

      expect(result.tags).toEqual(['urgent', 'réseau'])
    })
  })

  describe('ticketUpdateSchema', () => {
    it('devrait valider des données de mise à jour partielles', () => {
      const validData = {
        title: 'Nouveau titre',
        status: 'EN_COURS' as const,
      }

      const result = ticketUpdateSchema.parse(validData)

      expect(result).toEqual(validData)
    })

    it('devrait accepter tous les champs optionnels', () => {
      const validData = {
        title: 'Nouveau titre',
        description: 'Nouvelle description détaillée',
        status: 'RESOLU' as const,
        priority: 'BASSE' as const,
        categoryId: 'cat-2',
        assignedToId: 'user-2',
        tags: ['résolu', 'test'],
      }

      const result = ticketUpdateSchema.parse(validData)

      expect(result).toEqual(validData)
    })

    it('devrait accepter assignedToId null', () => {
      const validData = {
        assignedToId: null,
      }

      const result = ticketUpdateSchema.parse(validData)

      expect(result.assignedToId).toBeNull()
    })

    it('devrait accepter un objet vide', () => {
      const validData = {}

      const result = ticketUpdateSchema.parse(validData)

      expect(result).toEqual({})
    })

    it('devrait rejeter un statut invalide', () => {
      const invalidData = {
        status: 'INVALID_STATUS',
      }

      expect(() => ticketUpdateSchema.parse(invalidData)).toThrow(ZodError)
    })

    it('devrait rejeter un titre trop court', () => {
      const invalidData = {
        title: 'AB',
      }

      expect(() => ticketUpdateSchema.parse(invalidData)).toThrow(ZodError)
    })
  })
})
