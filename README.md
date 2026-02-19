# INNOVTEC Réseaux - Intranet

Application intranet moderne pour INNOVTEC Réseaux, entreprise de travaux publics spécialisée dans les réseaux électriques, gaz et télécoms.

## Stack Technique
- **Framework**: Next.js 15 (App Router)
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Styling**: Tailwind CSS + Design System INNOVTEC
- **i18n**: next-intl (FR/PT)
- **Icons**: Lucide React

## Modules
- Dashboard avec KPIs SSE et widgets
- Actualités avec catégories (QSE, REX, Info, Sécurité, Blog)
- QSE (Politique, Bonnes pratiques, Situations dangereuses, Plans d'actions, REX, Tableau SSE)
- Trombinoscope avec recherche et filtres équipes
- Planning (vue semaine/mois)
- Formations avec suivi de progression
- RH (congés, notes de frais)
- Signatures électroniques
- Documents (explorateur de fichiers)
- Galerie photos

## Démarrage

```bash
npm install
cp .env.example .env.local
# Configurer les variables Supabase dans .env.local
npm run dev
```

## Base de données

Le schéma complet se trouve dans `supabase/migrations/001_initial_schema.sql`.

