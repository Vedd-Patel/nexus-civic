import KPICard from '@/components/dashboard/KPICard';
import SafetyHeatmap from '@/components/dashboard/SafetyHeatmap';
import GrievanceQueue from '@/components/dashboard/GrievanceQueue';
import RiskZones from '@/components/dashboard/RiskZones';
import CivicPulseFeed from '@/components/dashboard/CivicPulseFeed';
import SOSAlertsFeed from '@/components/dashboard/SOSAlertsFeed';
import IssueReportsFeed from '@/components/dashboard/IssueReportsFeed';
import BudgetSummary from '@/components/dashboard/BudgetSummary';
import AuraAuditLog from '@/components/dashboard/AuraAuditLog';

export default function DashboardPage() {
  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      {/* Title Bar */}
      <div className="flex items-center space-x-3 mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600 font-outfit">
          Nexus Civic — Unified Intelligence Dashboard
        </h1>
        <div className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
        </div>
      </div>

      {/* Row 1: KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <KPICard title="Total Reports" value={142} trend={5} icon="📝" accentColor="#4F46E5" />
        <KPICard title="Safety Score" value={85} trend={2} icon="🛡️" accentColor="#10B981" isLive unit="/100" />
        <KPICard title="Active Alerts" value={12} trend={-15} icon="⚠️" accentColor="#F59E0B" />
        <KPICard title="Resolved" value={89} trend={10} icon="✅" accentColor="#3B82F6" />
        <KPICard title="Budget Usage" value={45} trend={1} icon="💰" accentColor="#EC4899" unit="%" />
      </div>

      {/* Row 2: SafetyHeatmap */}
      <div className="w-full">
        <SafetyHeatmap />
      </div>

      {/* Row 3: GrievanceQueue 60% + RiskZones 40% */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-[60%]">
          <GrievanceQueue />
        </div>
        <div className="w-full lg:w-[40%]">
          <RiskZones />
        </div>
      </div>

      {/* Row 4: SOS Live Alerts */}
      <div className="w-full">
        <SOSAlertsFeed />
      </div>

      {/* Row 5: Issue Reports Feed */}
      <div className="w-full">
        <IssueReportsFeed />
      </div>

      {/* Row 6: CivicPulseFeed */}
      <div className="w-full">
        <CivicPulseFeed />
      </div>

      {/* Row 6: BudgetSummary 50% + AuraAuditLog 50% */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-1/2">
          <BudgetSummary />
        </div>
        <div className="w-full lg:w-1/2">
          <AuraAuditLog />
        </div>
      </div>
    </div>
  );
}
