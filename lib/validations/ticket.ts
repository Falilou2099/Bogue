import { z } from 'zod'

export const ticketSchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères').max(100, 'Le titre ne peut pas dépasser 100 caractères'),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères').max(2000, 'La description ne peut pas dépasser 2000 caractères'),
  type: z.enum(['INCIDENT', 'DEMANDE', 'CHANGEMENT']),
  priority: z.enum(['BASSE', 'MOYENNE', 'HAUTE', 'CRITIQUE']),
  categoryId: z.string().min(1, 'La catégorie est requise'),
  createdById: z.string().min(1, 'L\'utilisateur est requis'),
  assignedToId: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

export const ticketUpdateSchema = z.object({
  title: z.string().min(3).max(100).optional(),
  description: z.string().min(10).max(2000).optional(),
  status: z.enum(['OUVERT', 'EN_COURS', 'EN_ATTENTE', 'RESOLU', 'FERME']).optional(),
  priority: z.enum(['BASSE', 'MOYENNE', 'HAUTE', 'CRITIQUE']).optional(),
  categoryId: z.string().optional(),
  assignedToId: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
})

export type TicketInput = z.infer<typeof ticketSchema>
export type TicketUpdateInput = z.infer<typeof ticketUpdateSchema>
