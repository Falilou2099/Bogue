import { NextRequest } from "next/server"

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

// Nettoyer les anciennes entrées toutes les 5 minutes
setInterval(() => {
  const now = Date.now()
  Object.keys(store).forEach((key) => {
    if (store[key].resetTime < now) {
      delete store[key]
    }
  })
}, 5 * 60 * 1000)

export interface RateLimitOptions {
  maxRequests: number // Nombre max de requêtes
  windowMs: number // Fenêtre de temps en millisecondes
}

export function rateLimit(options: RateLimitOptions) {
  const { maxRequests, windowMs } = options

  return async (request: NextRequest): Promise<{ success: boolean; remaining: number; resetTime: number }> => {
    // Obtenir l'IP du client
    const ip = request.headers.get("x-forwarded-for") || 
               request.headers.get("x-real-ip") || 
               "unknown"
    
    const key = `${ip}`
    const now = Date.now()

    // Initialiser ou récupérer l'entrée
    if (!store[key] || store[key].resetTime < now) {
      store[key] = {
        count: 0,
        resetTime: now + windowMs,
      }
    }

    // Incrémenter le compteur
    store[key].count++

    const remaining = Math.max(0, maxRequests - store[key].count)
    const success = store[key].count <= maxRequests

    return {
      success,
      remaining,
      resetTime: store[key].resetTime,
    }
  }
}

// Rate limiter pour les tentatives de connexion
export const loginRateLimiter = rateLimit({
  maxRequests: 5, // 5 tentatives
  windowMs: 15 * 60 * 1000, // 15 minutes
})
