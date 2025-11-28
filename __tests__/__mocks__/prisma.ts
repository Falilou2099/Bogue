// Mock Prisma Client pour les tests
export const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  ticket: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  article: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  category: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  notification: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    createMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
  },
  ticketHistory: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
  sla: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  comment: {
    findMany: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
}

// Helper pour réinitialiser tous les mocks
export const resetAllMocks = () => {
  Object.values(mockPrisma).forEach((model) => {
    Object.values(model).forEach((method) => {
      if (typeof method === 'function' && 'mockReset' in method) {
        (method as jest.Mock).mockReset()
      }
    })
  })
}

// Helper pour créer des données de test
export const createMockUser = (overrides = {}) => ({
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
  password: 'hashed_password',
  role: 'AGENT',
  avatar: null,
  twoFactorEnabled: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

export const createMockTicket = (overrides = {}) => ({
  id: 'TKT-001',
  title: 'Test Ticket',
  description: 'Description du ticket de test',
  type: 'INCIDENT',
  status: 'OUVERT',
  priority: 'MOYENNE',
  categoryId: 'cat-1',
  createdById: 'user-1',
  assignedToId: null,
  slaId: 'sla-3',
  tags: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  resolvedAt: null,
  ...overrides,
})

export const createMockArticle = (overrides = {}) => ({
  id: 'article-1',
  title: 'Article de test',
  content: 'Contenu détaillé de l\'article de test',
  categoryId: 'cat-1',
  authorId: 'user-1',
  views: 0,
  helpful: 0,
  notHelpful: 0,
  tags: [],
  published: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

export const createMockCategory = (overrides = {}) => ({
  id: 'cat-1',
  name: 'Technique',
  description: 'Problèmes techniques',
  icon: 'wrench',
  color: '#3b82f6',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

export const createMockNotification = (overrides = {}) => ({
  id: 'notif-1',
  userId: 'user-1',
  type: 'NOUVEAU_TICKET',
  title: 'Nouveau ticket',
  message: 'Un nouveau ticket a été créé',
  ticketId: 'TKT-001',
  read: false,
  createdAt: new Date(),
  ...overrides,
})
