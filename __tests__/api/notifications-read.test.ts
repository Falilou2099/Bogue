import { POST } from '@/app/api/notifications/[id]/read/route'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

jest.mock('@/lib/prisma', () => ({
  prisma: {
    notification: {
      update: jest.fn(),
    },
  },
}))

describe('/api/notifications/[id]/read', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('devrait marquer une notification comme lue', async () => {
    const mockNotification = {
      id: 'notif-1',
      userId: 'user-1',
      message: 'Nouveau ticket assigné',
      read: true,
      createdAt: new Date('2024-01-01'),
    }

    ;(prisma.notification.update as jest.Mock).mockResolvedValue(mockNotification)

    const request = new NextRequest('http://localhost:3000/api/notifications/notif-1/read', {
      method: 'POST',
    })

    const response = await POST(request, { params: { id: 'notif-1' } })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.notification.read).toBe(true)
    expect(prisma.notification.update).toHaveBeenCalledWith({
      where: { id: 'notif-1' },
      data: { read: true },
    })
  })

  it('devrait gérer les notifications inexistantes', async () => {
    ;(prisma.notification.update as jest.Mock).mockRejectedValue(
      new Error('Record not found')
    )

    const request = new NextRequest('http://localhost:3000/api/notifications/notif-999/read', {
      method: 'POST',
    })

    const response = await POST(request, { params: { id: 'notif-999' } })
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
  })

  it('devrait gérer les erreurs de base de données', async () => {
    ;(prisma.notification.update as jest.Mock).mockRejectedValue(
      new Error('Database connection failed')
    )

    const request = new NextRequest('http://localhost:3000/api/notifications/notif-1/read', {
      method: 'POST',
    })

    const response = await POST(request, { params: { id: 'notif-1' } })
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Erreur serveur')
  })
})
