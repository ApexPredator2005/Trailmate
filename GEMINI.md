# Trailmate — Workspace Rules & Operational Guidelines

## 1. Deployment Storage Hygiene (Mandatory)
* **The 2-Deployment Rule:** Maintain only:
  1. Active production deployment
  2. Immediate rollback candidate
* Prune older historical deployments after pushing to ensure Vercel Free Tier Function Storage (< 10 GB) is never exhausted.
* Automated helper: `node ~/.gemini/config/skills/plan/scripts/prune_deployments.js trailmate`

## 2. Planning & Architecture Standard
* Adhere to the `plan` skill ([SKILL.md](file:///Users/pratyushraj/.gemini/config/skills/plan/SKILL.md)) for all feature additions and refactors.
* Strictly maintain [decisions.md](file:///Users/pratyushraj/Desktop/Projects/travel%20app/decisions.md) as the living architectural decision record.

## 3. Anti-Hallucination & Testing
* APIs fetch verified facts; AI arranges and personalizes facts; AI never invents facts.
* Run `npm test` and `npm run build` prior to any git commit.
