# Nexus Civic — AI-Powered Civic Intelligence Platform

A modular civic technology platform that combines AI, realtime intelligence, and community-focused services to improve local governance and citizen response.

## Modules

| Module | Port | Description |
| --- | ---: | --- |
| GuardianNet | 3001 | Zero-trust safety orchestration for civic incident detection and secure response workflows. |
| PulseReport | 3002 | Incident intake and structured reporting service for grievances, alerts, and case tracking. |
| CivicPulse | 3003 | Public sentiment and civic signal analysis from community feedback and external data feeds. |
| SentinelAI | 3007 | AI policy and anomaly detection service for proactive monitoring across platform modules. |
| VoiceAssembly | 3008 | Voice interface and speech-driven engagement layer powered by conversational AI. |
| LedgerCivic | 3009 | Civic transparency ledger and blockchain-backed audit trail for critical public actions. |
| MeshAlert | 3010 | Resilient alert distribution and multi-channel broadcast system for emergency communication. |
| AuraAssist | 3011 | Citizen-facing AI assistant for guidance, triage, and service navigation. |

## Quick Start

```bash
git clone <your-repo-url>
cp .env.example .env
docker compose up -d
npm run seed
```

## PulseReport API Notes

### POST /api/grievances

Request body requires `district`.

```json
{
	"title": "Water Leakage Near Main Road",
	"description": "Continuous pipeline leakage for 2 days causing waterlogging.",
	"category": "water",
	"district": "jabalpur",
	"location": {
		"lat": 23.1815,
		"lng": 79.9864,
		"accuracy": 12,
		"address": "Main Road, Jabalpur"
	}
}
```

## For Teammates

See `TEAMMATE_SETUP.md` for full local development and contributor onboarding instructions.

## Sponsor Tracks

- SpacetimeDB
- ArmorIQ
- Superplane
- ROVO
- Gemini
- MongoDB
- ElevenLabs
- GitHub
- Solana
