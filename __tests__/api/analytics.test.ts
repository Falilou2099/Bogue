import { GET } from '@/app/api/analytics/route'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

jest.mock('@/lib/prisma', () => ({
  prisma: {
    ticket: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    category: {
      findMany: jest.fn(),
    },
    user: {
      findMany: jest.fn(),
    },
  },
}))

describe('/api/analytics', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('devrait retourner les statistiques complètes', async () => {
    // Mock des counts de tickets
    ;(prisma.ticket.count as jest.Mock)
      .mockResolvedValueOnce(5) // OUVERT
      .mockResolvedValueOnce(3) // EN_COURS
      .mockResolvedValueOnce(2) // RESOLU
      .mockResolvedValueOnce(1) // FERME
      .mockResolvedValueOnce(1) // EN_ATTENTE
      .mockResolvedValueOnce(1) // CRITIQUE
      .mockResolvedValueOnce(2) // HAUTE
      .mockResolvedValueOnce(4) // MOYENNE
      .mockResolvedValueOnce(5) // BASSE

    // Mock des catégories
    ;(prisma.category.findMany as jest.Mock).mockResolvedValue([
      { name: 'Technique', _count: { tickets: 8 } },
      { name: 'Facturation', _count: { tickets: 4 } },
    ])

    // Mock des agents
    ;(prisma.user.findMany as jest.Mock).mockResolvedValue([
      {
        name: 'Agent 1',
        assignedTickets: [{ id: '1' }, { id: '2' }],
      },
    ])

    // Mock des tickets résolus
    ;(prisma.ticket.findMany as jest.Mock).mockResolvedValue([
      {
        createdAt: new Date('2024-01-01'),
        resolvedAt: new Date('2024-01-02'),
      },
    ])

    // Mock pour les tickets quotidiens (7 derniers jours)
    for (let i = 0; i < 7; i++) {
      ;(prisma.ticket.count as jest.Mock).mockResolvedValueOnce(Math.floor(Math.random() * 5))
    }

    const request = new NextRequest('http://localhost:3000/api/analytics')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data).toHaveProperty('ticketStats')
    expect(data.data).toHaveProperty('priorityStats')
    expect(data.data).toHaveProperty('categoryStats')
    expect(data.data).toHaveProperty('dailyTickets')
    expect(data.data).toHaveProperty('agentPerformance')
    expect(data.data).toHaveProperty('avgResolutionTime')
    expect(data.data).toHaveProperty('satisfactionRate')
  })

  it('devrait gérer les erreurs gracieusement', async () => {
    ;(prisma.ticket.count as jest.Mock).mockRejectedValue(new Error('Database error'))

    const request = new NextRequest('http://localhost:3000/api/analytics')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Erreur serveur')
  })
})
