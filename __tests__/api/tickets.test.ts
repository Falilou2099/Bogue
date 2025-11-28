import { GET, POST } from '@/app/api/tickets/route'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    ticket: {
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
    },
    notification: {
      createMany: jest.fn(),
    },
    ticketHistory: {
      create: jest.fn(),
    },
  },
}))

// Mock jose
jest.mock('jose', () => ({
  jwtVerify: jest.fn(),
}))

describe('/api/tickets', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET', () => {
    it('devrait retourner la liste des tickets', async () => {
      const mockTickets = [
        {
          id: 'TKT-001',
          title: 'Test ticket',
          status: 'OUVERT',
          priority: 'MOYENNE',
          category: { id: 'cat-1', name: 'Technique' },
          createdBy: { id: 'user-1', name: 'Test User' },
        },
      ]

      ;(prisma.ticket.findMany as jest.Mock).mockResolvedValue(mockTickets)

      const request = new NextRequest('http://localhost:3000/api/tickets')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.tickets).toEqual(mockTickets)
      expect(prisma.ticket.findMany).toHaveBeenCalledTimes(1)
    })

    it('devrait gérer les erreurs', async () => {
      ;(prisma.ticket.findMany as jest.Mock).mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost:3000/api/tickets')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Erreur serveur')
    })
  })

  describe('POST', () => {
    it('devrait créer un nouveau ticket', async () => {
      const newTicketData = {
        title: 'Nouveau ticket',
        description: 'Description du ticket',
        type: 'INCIDENT',
        priority: 'HAUTE',
        categoryId: 'cat-1',
      }

      const jose = require('jose')
      jest.spyOn(jose, 'jwtVerify').mockResolvedValue({
        payload: { userId: 'user-1', role: 'agent' },
      })

      const createdTicket = {
        id: 'TKT-007',
        title: newTicketData.title,
        description: newTicketData.description,
        type: newTicketData.type,
        priority: newTicketData.priority,
        categoryId: newTicketData.categoryId,
        createdById: 'user-1',
        status: 'OUVERT',
        slaId: 'sla-2',
        tags: [],
      }

      ;(prisma.ticket.count as jest.Mock).mockResolvedValue(6)
      ;(prisma.ticket.create as jest.Mock).mockResolvedValue(createdTicket)
      ;(prisma.notification.createMany as jest.Mock).mockResolvedValue({ count: 1 })
      ;(prisma.ticketHistory.create as jest.Mock).mockResolvedValue({})

      const request = new NextRequest('http://localhost:3000/api/tickets', {
        method: 'POST',
        body: JSON.stringify(newTicketData),
      })
      
      Object.defineProperty(request, 'cookies', {
        value: {
          get: jest.fn().mockReturnValue({ value: 'valid-token' }),
        },
      })
      
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.ticket).toMatchObject({
        id: createdTicket.id,
        title: createdTicket.title,
        description: createdTicket.description,
        type: createdTicket.type,
        priority: createdTicket.priority,
        categoryId: createdTicket.categoryId,
        status: createdTicket.status,
      })
      expect(prisma.ticket.create).toHaveBeenCalledTimes(1)
      expect(prisma.notification.createMany).toHaveBeenCalledTimes(1)
      expect(prisma.ticketHistory.create).toHaveBeenCalledTimes(1)
    })

    it('devrait valider les champs requis', async () => {
      const incompleteData = {
        title: 'Ticket incomplet',
        // description manquante
        type: 'INCIDENT',
        priority: 'HAUTE',
        categoryId: 'cat-1',
      }

      const jose = require('jose')
      jest.spyOn(jose, 'jwtVerify').mockResolvedValue({
        payload: { userId: 'user-1', role: 'agent' },
      })

      const request = new NextRequest('http://localhost:3000/api/tickets', {
        method: 'POST',
        body: JSON.stringify(incompleteData),
      })
      
      Object.defineProperty(request, 'cookies', {
        value: {
          get: jest.fn().mockReturnValue({ value: 'valid-token' }),
        },
      })
      
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Tous les champs sont requis')
      expect(prisma.ticket.create).not.toHaveBeenCalled()
    })

    it('devrait attribuer le bon SLA selon la priorité', async () => {
      const testCases = [
        { priority: 'CRITIQUE', expectedSla: 'sla-1' },
        { priority: 'HAUTE', expectedSla: 'sla-2' },
        { priority: 'MOYENNE', expectedSla: 'sla-3' },
        { priority: 'BASSE', expectedSla: 'sla-4' },
      ]

      for (const testCase of testCases) {
        jest.clearAllMocks()
        
        const ticketData = {
          title: 'Test SLA',
          description: 'Test',
          type: 'INCIDENT',
          priority: testCase.priority,
          categoryId: 'cat-1',
        }

        const jose = require('jose')
        jest.spyOn(jose, 'jwtVerify').mockResolvedValue({
          payload: { userId: 'user-1', role: 'agent' },
        })

        ;(prisma.ticket.count as jest.Mock).mockResolvedValue(0)
        ;(prisma.ticket.create as jest.Mock).mockImplementation((args) => Promise.resolve(args.data))
        ;(prisma.notification.createMany as jest.Mock).mockResolvedValue({ count: 1 })
        ;(prisma.ticketHistory.create as jest.Mock).mockResolvedValue({})

        const request = new NextRequest('http://localhost:3000/api/tickets', {
          method: 'POST',
          body: JSON.stringify(ticketData),
        })
        
        Object.defineProperty(request, 'cookies', {
          value: {
            get: jest.fn().mockReturnValue({ value: 'valid-token' }),
          },
        })
        
        await POST(request)

        expect(prisma.ticket.create).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              slaId: testCase.expectedSla,
            }),
          })
        )
      }
    })
  })
})
