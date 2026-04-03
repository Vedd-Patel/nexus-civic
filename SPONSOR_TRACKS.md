# Nexus Civic - Sponsor Tracks Mapping

This document maps each sponsor track to concrete implementation points in Nexus Civic and gives a practical demo flow for judges.

## SpacetimeDB ($150)
How implemented:
- VoiceAssembly provides real-time collaborative town-hall behavior (join session, cast vote, submit issues) through Socket.IO orchestration and session syncing.
- MeshAlert provides offline-first style state exchange via mesh sync routes and stale-cache handling for degraded connectivity.

Judge demo:
- Open town hall UI, submit issue from one tab, watch vote/status update in another tab.
- Explain that the same event-driven pattern is used for SpacetimeDB-backed synchronization in production setup.

## ArmorIQ (INR 10,000)
How implemented:
- AuraAssist includes a Zero Trust-style policy gate under `services/aura-assist/src/armoriq` with allow/block decisions before sensitive assistant actions.
- All policy decisions are persisted into `AIAuditLog` for traceability.

Judge demo:
- Open AuraAssist audit log panel and highlight blocked entries in red plus explicit block reasons.

## Superplane ($150)
How implemented:
- PulseReport stores workflow run references through `superplaneRunId` on grievance records.
- SentinelAI dispatch/risk automation follows orchestrated job flow suitable for Superplane scheduling/execution.

Judge demo:
- Create a grievance and show automation metadata path.
- Trigger risk/dispatch action and explain end-to-end workflow orchestration.

## ROVO (INR 25,000)
How implemented:
- Team workflow includes AI-assisted content cadence for hackathon storytelling and judge updates.

Daily post template:
- 09:00: "Build update" - one screenshot + one technical milestone.
- 13:00: "Architecture nugget" - one service deep dive (problem -> approach -> impact).
- 18:00: "Demo teaser" - one short clip of live feature behavior.

What to post:
- Problem statement in one sentence.
- What changed today in one measurable metric.
- One screenshot/video and one call-to-action.

## Gemini (Swag Kits)
How implemented (6 modules):
- PulseReport: civic grievance reasoning/summarization hooks.
- CivicPulse: social signal understanding and fact-check style insights.
- TerraScan: geospatial/environmental alert report generation.
- SentinelAI: predictive reasoning narratives for risk outputs.
- VoiceAssembly: conversational augmentation for session interactions.
- AuraAssist: assistant responses with policy-aware AI processing.

Judge demo:
- Ask one natural-language question in assistant/chat surfaces and show generated insight linked to civic data.

## MongoDB (IoT Kit)
How implemented:
- Core persistence is on MongoDB across 16 primary models in `packages/db/src/models`.

Key queries worth showing:
- SOS by status/severity and recent window (GuardianNet).
- Grievance queue by category + status + district (PulseReport).
- Donation lifecycle by status and NGO match (NearGive).
- Expenditure anomalies by department over time (LedgerCivic).
- AI audit allow/block trend by time (AuraAssist/SentinelAI).

## ElevenLabs (Beats)
How implemented:
- VoiceAssembly supports speech-driven interaction patterns (STT/TTS pipeline integration points).
- AuraAssist includes voice-layer integration hooks for spoken assistant UX.

Judge demo:
- Trigger a voice request/response path and show that text + speech experience map to the same policy/audit pipeline.

## Vultr (Projectors)
How implemented:
- Multi-service deployment target for all modules with environment-driven configuration.

Deployment command pattern:
```bash
docker compose build
docker compose up -d
```

Judge demo:
- Show all services healthy and accessible through published ports/API health routes.

## Solana (Ledger Nano)
How implemented:
- LedgerCivic records expenditure evidence with `solanaSignature` and explorer URL linkage for public verifiability.
- Smart-contract path is represented via the on-chain program workspace under `blockchain/ledger-civic-program`.

Judge demo:
- Open Budget view, click a Solana explorer link, and show transaction-level transparency context.

## Quick Sponsor Pitch Flow (90 seconds)
- 0-20s: Problem + platform architecture (11 services, shared packages, unified dashboard).
- 20-45s: Live safety + grievance + AI audit evidence.
- 45-65s: Real-time town hall and policy-gated assistant behavior.
- 65-90s: Transparency proof (Solana links) and production-readiness (Docker + cloud deployment path).
