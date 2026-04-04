/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [],
  async rewrites() {
    const trimSlash = (url) => (url || '').replace(/\/$/, '');

    const guardianNet = trimSlash(process.env.NEXT_PUBLIC_GUARDIAN_NET_URL || 'http://localhost:3001');
    const pulseReport = trimSlash(process.env.NEXT_PUBLIC_PULSE_REPORT_URL || 'http://localhost:3002');
    const civicPulse = trimSlash(process.env.NEXT_PUBLIC_CIVIC_PULSE_URL || 'http://localhost:3003');
    const sentinelAI = trimSlash(process.env.NEXT_PUBLIC_SENTINEL_AI_URL || 'http://localhost:3007');
    const voiceAssembly = trimSlash(process.env.NEXT_PUBLIC_VOICE_ASSEMBLY_URL || 'http://localhost:3008');
    const ledgerCivic = trimSlash(process.env.NEXT_PUBLIC_LEDGER_CIVIC_URL || 'http://localhost:3009');
    const meshAlert = trimSlash(process.env.NEXT_PUBLIC_MESH_ALERT_URL || 'http://localhost:3010');
    const auraAssist = trimSlash(process.env.NEXT_PUBLIC_AURA_ASSIST_URL || 'http://localhost:3011');

    return [
      { source: '/api/proxy/guardian-net/:path*', destination: `${guardianNet}/:path*` },
      { source: '/api/proxy/pulse-report/:path*', destination: `${pulseReport}/:path*` },
      { source: '/api/proxy/civic-pulse/:path*', destination: `${civicPulse}/:path*` },
      { source: '/api/proxy/sentinel-ai/:path*', destination: `${sentinelAI}/:path*` },
      { source: '/api/proxy/voice-assembly/:path*', destination: `${voiceAssembly}/:path*` },
      { source: '/api/proxy/ledger-civic/:path*', destination: `${ledgerCivic}/:path*` },
      { source: '/api/proxy/mesh-alert/:path*', destination: `${meshAlert}/:path*` },
      { source: '/api/proxy/aura-assist/:path*', destination: `${auraAssist}/:path*` },
    ];
  },
};
module.exports = nextConfig;
