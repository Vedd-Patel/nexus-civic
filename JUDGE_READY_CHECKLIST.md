# Nexus Civic - Judge Ready Checklist

Date: 4 April 2026
Scope: Final demo readiness for current GitHub-based project delivery.

## 1) Environment Readiness
- [ ] `.env` exists and has required keys:
  - `MONGODB_URI`
  - `JWT_SECRET`
  - `GEMINI_API_KEY`
- [ ] Solana settings are configured for demo mode used by the team:
  - `SOLANA_ENABLED` set intentionally (`true` for real devnet writes, `false` for mock signatures)
  - `SOLANA_WALLET_PRIVATE_KEY` populated if `SOLANA_ENABLED=true`
  - `SOLANA_PROGRAM_ID` populated
- [ ] Optional integrations are either configured or intentionally skipped (document decision in demo notes).

## 2) Build and Start
- [ ] Start stack:
```bash
docker compose up -d
```
- [ ] Confirm all containers are healthy:
```bash
docker compose ps
```
- [ ] If startup fails, capture logs and fix before demo:
```bash
docker compose logs --tail=120
```

## 3) Service Health Verification
- [ ] GuardianNet: `http://localhost:3001/health`
- [ ] PulseReport: `http://localhost:3002/health`
- [ ] CivicPulse: `http://localhost:3003/health`
- [ ] SentinelAI: `http://localhost:3007/health`
- [ ] VoiceAssembly: `http://localhost:3008/health`
- [ ] LedgerCivic: `http://localhost:3009/health`
- [ ] MeshAlert: `http://localhost:3010/health`
- [ ] AuraAssist: `http://localhost:3011/health`
- [ ] Web app: `http://localhost:3000`

## 4) Data and Demo Flow
- [ ] Seed demo data:
```bash
npm run seed
```
- [ ] Run smoke/demo route checks:
```bash
npm run smoke:mission
```
- [ ] Run scripted demo prep checks:
```bash
bash scripts/demo.sh
```

## 5) Judge Storyline Lock
- [ ] 90-second flow finalized (problem -> live actions -> AI/policy evidence -> Solana transparency).
- [ ] One backup path per critical feature if a live dependency fails.
- [ ] Screenshots/video fallback prepared for each major module.

## 6) Documentation and Handover
- [ ] README reflects active module list only.
- [ ] Teammate setup doc reflects active service/port map only.
- [ ] Sponsor tracks doc reflects current modules and GitHub delivery focus.
- [ ] `PROJECT_PROGRESS.md` updated to current checkpoint.

## 7) GitHub Delivery Readiness
- [ ] Repo has latest docs and checklist committed.
- [ ] Open issues for known non-demo blockers are tracked.
- [ ] Final demo tag/branch prepared for presentation.

## 8) Explicitly Out of Scope for This Checkpoint
- Vultr deployment setup and infra provisioning are intentionally deferred.
- Focus remains local/demo stability and GitHub-based delivery.
