import { GET } from '@/app/api/audit/route'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

jest.mock('@/lib/prisma', () => ({
  prisma: {
    ticketHistory: {
      findMany: jest.fn(),
    },
  },
}))

describe('/api/audit', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('devrait retourner les logs d\'audit', async () => {
    const mockLogs = [
      {
        id: 'log-1',
        ticketId: 'TKT-001',
        userId: 'user-1',
        action: 'CREATION',
        oldValue: null,
        newValue: 'Ticket créé',
        createdAt: new Date('2024-01-01'),
        user: {
          id: 'user-1',
          name: 'John Doe',
          email: 'john@example.com',
          avatar: null,
          role: 'AGENT',
        },
      },
      {
        id: 'log-2',
        ticketId: 'TKT-001',
        userId: 'user-2',
        action: 'CHANGEMENT_STATUT',
        oldValue: 'OUVERT',
        newValue: 'EN_COURS',
        createdAt: new Date('2024-01-02'),
        user: {
          id: 'user-2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          avatar: null,
          role: 'AGENT',
        },
      },
    ]

    ;(prisma.ticketHistory.findMany as jest.Mock).mockResolvedValue(mockLogs)

    const request = new NextRequest('http://localhost:3000/api/audit')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.logs).toHaveLength(2)
    expect(data.logs[0]).toMatchObject({
      id: 'log-1',
      action: 'CREATION',
      user: expect.objectContaining({
        name: 'John Doe',
      }),
    })
    expect(prisma.ticketHistory.findMany).toHaveBeenCalledWith({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 100,
    })
  })

  it('devrait gérer les erreurs de base de données', async () => {
    ;(prisma.ticketHistory.findMany as jest.Mock).mockRejectedValue(
      new Error('Database connection failed')
    )

    const request = new NextRequest('http://localhost:3000/api/audit')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Erreur serveur')
  })
})
