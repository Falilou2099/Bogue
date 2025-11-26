# 🧹 Nettoyage des données mock

## Fichiers à modifier (13 fichiers)

### Pages principales
1. ✅ `app/(dashboard)/dashboard/page.tsx` - Partiellement migré
2. ❌ `app/(dashboard)/tickets/page.tsx` - Liste des tickets
3. ❌ `app/(dashboard)/tickets/[id]/page.tsx` - Détail d'un ticket
4. ❌ `app/(dashboard)/tickets/new/page.tsx` - Nouveau ticket
5. ❌ `app/(dashboard)/my-tickets/page.tsx` - Mes tickets

### Pages admin
6. ❌ `app/(dashboard)/admin/users/page.tsx` - Gestion utilisateurs
7. ❌ `app/(dashboard)/admin/categories/page.tsx` - Gestion catégories
8. ❌ `app/(dashboard)/admin/sla/page.tsx` - Gestion SLA
9. ❌ `app/(dashboard)/admin/analytics/page.tsx` - Analytiques
10. ❌ `app/(dashboard)/admin/audit/page.tsx` - Audit

### Autres
11. ❌ `app/(dashboard)/team/page.tsx` - Équipe
12. ❌ `app/(dashboard)/chat/page.tsx` - Chat
13. ❌ `components/layout/header.tsx` - Header (notifications)

## Stratégie

Pour chaque fichier :
1. Supprimer `import { ... } from "@/lib/mock-data"`
2. Ajouter `useState` et `useEffect` pour fetch les données
3. Remplacer les références mock par les données de l'état
4. Ajouter un loader pendant le chargement

## API Routes disponibles
- `/api/tickets` - Liste des tickets
- `/api/tickets/[id]` - Détail d'un ticket
- `/api/categories` - Liste des catégories
- `/api/sla` - Liste des SLA
- `/api/users` - Liste des utilisateurs
- `/api/notifications` - Notifications
- `/api/articles` - Articles KB
- `/api/dashboard/stats` - Statistiques
