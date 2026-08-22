import React, { useMemo, useState } from 'react';
import { useAquaData } from '../../components/context/AquaRegCONTEXT';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from "../../components/ui/button";
import { 
  Ship, Waves, Fish, LayoutDashboard, TrendingUp,
  Box, Activity, AlertCircle, Phone, Calendar,
  Loader2, Map, Clock, FileText,
  Bell, BellRing, X, CheckCircle2
} from 'lucide-react';

export default function AquaRegAdminDashboard() {
  const { Vessels = [], loading } = useAquaData() || { vessels: [], loading: false };
  const [showNotifications, setShowNotifications] = useState(false);

  // --- ANALYTICS & EXPIRATION LOGIC ---
  const getExpirationStatus = (expiryDate: any) => {
    if (!expiryDate) return { label: 'No Date', color: 'text-slate-400', urgent: false };
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDate);
    if (isNaN(expiry.getTime())) return { label: 'Invalid Date', color: 'text-slate-400', urgent: false };
    
    const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { label: 'Expired', color: 'text-red-600', urgent: true };
    if (diffDays === 0) return { label: 'Today', color: 'text-red-500', urgent: true };
    if (diffDays <= 30) return { label: `${diffDays}d Left`, color: 'text-orange-500', urgent: true };
    return { label: 'Valid', color: 'text-emerald-500', urgent: false };
  };

  // Unified expiry accessor to handle different field namings
  const getExpiryFromVessel = (v: any) => v.valid_until ?? v.validUntil ?? v.expiry_date ?? v.expiry ?? v.validity ?? null;
  const getContactNumberFromVessel = (v: any) => v.phone ?? v.phone_number ?? v.cp_number ?? v.contact_number ?? 'N/A';

  // --- MEMOIZED STATISTICS & NOTIFICATIONS (ADAPTED FOR SNAKE_CASE SUPABASE SCHEMA) ---
  const { stats, notifications } = useMemo(() => {
    const safeVessels = Array.isArray(Vessels) ? Vessels : [];
    
    // 1. Calculate Barangay Distribution
    const bMap: Record<string, number> = {};
    const alerts: any[] = [];
    
    safeVessels.forEach(v => {
      // Distribution logic
      const bName = v.barangay || 'Unknown';
      bMap[bName] = (bMap[bName] || 0) + 1;

      // Notification logic - Using unified database snake_case keys
      const status = getExpirationStatus(getExpiryFromVessel(v));
      if (status.urgent) {
        alerts.push({
          id: `exp-${v.id}`,
          type: 'URGENT',
          title: 'Permit Expiry',
          message: `${v.vessel_name || v.gear_type || 'Asset'} (${v.owner_name || 'N/A'}) requires immediate renewal.`,
          time: status.label,
          icon: <AlertCircle size={14} className="text-red-500" />
        });
      }
    });

    // Add a structural system status notification
    alerts.push({
      id: 'sys-sync',
      type: 'INFO',
      title: 'System Healthy',
      message: 'Cloud database synchronized with local registry.',
      time: 'Just now',
      icon: <CheckCircle2 size={14} className="text-emerald-500" />
    });

    return {
      notifications: alerts,
      stats: {
        motorized: safeVessels.filter(v => v.is_motorized).length,
        nonMotorized: safeVessels.filter(v => !v.is_motorized).length,
        fishingGear: safeVessels.filter(v => (v.type || v.asset_category || '').toLowerCase().includes('gear')).length,
        payaoBalsa: safeVessels.filter(v => (v.type || v.asset_category || '').toLowerCase().match(/payao|balsa|gear/)).length,
        activePermits: safeVessels.filter(v => ['PASSED', 'APPROVED', 'REGISTERED', 'SCHEDULED'].includes((v.status || '').toUpperCase())).length,
        critical: safeVessels.filter(v => getExpirationStatus(getExpiryFromVessel(v)).urgent),
        recent: [...safeVessels].reverse().slice(0, 5),
        barangayData: Object.entries(bMap).sort((a, b) => b[1] - a[1]).slice(0, 5)
      }
    };
  }, [Vessels]);

  const complianceRate = Vessels.length > 0 ? Math.round((stats.activePermits / Vessels.length) * 100) : 0;

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center text-slate-400">
      <Loader2 className="animate-spin mb-4 text-blue-500" size={40} />
      <p className="font-black uppercase tracking-widest text-xs italic text-blue-600">Syncing Municipal Database...</p>
    </div>
  );

  return (
    <div className="pt-4 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 relative">
      
      {/* --- NOTIFICATION PANEL OVERLAY --- */}
      {showNotifications && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowNotifications(false)} />
          <div className="relative w-full max-w-sm bg-white h-full shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50">
              <h3 className="font-black uppercase italic tracking-tighter text-slate-900">Notifications</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowNotifications(false)}><X/></Button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {notifications.map(n => (
                <div key={n.id} className="p-4 rounded-2xl border border-slate-100 bg-white hover:border-blue-200 transition-colors">
                  <div className="flex gap-3">
                    <div className="mt-1">{n.icon}</div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <p className="text-[10px] font-black uppercase text-slate-400">{n.type}</p>
                        <p className="text-[8px] font-bold text-blue-500 uppercase">{n.time}</p>
                      </div>
                      <p className="text-xs font-black uppercase italic text-slate-800 mt-1">{n.title}</p>
                      <p className="text-[10px] text-slate-500 leading-relaxed mt-1">{n.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- HEADER --- */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center border-b border-slate-200 pb-8 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Registry Command 2026</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none uppercase italic">Command <span className="text-blue-600">Center</span></h1>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowNotifications(true)}
            className="h-12 w-12 rounded-2xl border-2 border-slate-200 bg-white flex items-center justify-center relative hover:border-blue-600 transition-all"
          >
            {notifications.length > 1 ? <BellRing className="text-blue-600 animate-bounce" size={20} /> : <Bell size={20} className="text-slate-400" />}
            {notifications.length > 1 && <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-600 text-white text-[9px] font-black rounded-full flex items-center justify-center ring-4 ring-white">{notifications.length - 1}</span>}
          </button>
          <Button className="h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest bg-slate-900 text-white px-8 shadow-xl shadow-slate-200">
            <FileText size={16} className="mr-2" /> Official Report
          </Button>
        </div>
      </div>

      {/* --- KPI GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPIStat title="Total Assets" count={Vessels.length} icon={<Ship size={18}/>} color="bg-white border text-slate-900" trend="+2% MTD" />
        <KPIStat title="Compliance" count={`${complianceRate}%`} icon={<Activity size={18}/>} color="bg-blue-600 text-white" trend="Target 90%" />
        <KPIStat title="Critical" count={stats.critical.length} icon={<AlertCircle size={18}/>} color="bg-red-50 text-red-600 ring-1 ring-red-200" trend="Action Needed" />
        <KPIStat title="Traditional" count={stats.nonMotorized} icon={<Waves size={18}/>} color="bg-white border text-slate-900" trend="Verified" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* --- LEFT: REGIONAL & WATCHLIST --- */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 transition-all hover:shadow-md">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Map size={20}/></div>
              <div>
                <h3 className="text-lg font-black uppercase italic text-slate-900 leading-none">Regional Distribution</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Leading Barangay Hotspots</p>
              </div>
            </div>
            <div className="space-y-5">
              {stats.barangayData.map(([name, count], idx) => (
                <div key={name} className="space-y-1.5">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black uppercase text-slate-700 italic">Brgy. {name}</span>
                    <span className="text-[10px] font-black text-blue-600">{count} Units</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 rounded-full transition-all duration-1000" 
                      style={{ width: `${(count / (Vessels.length || 1)) * 100}%`, opacity: Math.max(0, 1 - idx * 0.15) } as React.CSSProperties}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-50 text-red-600 rounded-2xl"><Calendar size={20}/></div>
                <h3 className="text-lg font-black uppercase italic text-slate-900">Watchlist</h3>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 text-[9px] font-black uppercase tracking-widest text-slate-400 border-b">
                  <tr>
                    <th className="px-8 py-4">Asset</th>
                    <th className="px-8 py-4">Contact</th>
                    <th className="px-8 py-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {stats.critical.length > 0 ? stats.critical.slice(0, 5).map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-4">
                        <div className="font-black italic text-slate-900 uppercase text-xs">
                          {v.vessel_name || v.gear_type || 'Unnamed Asset'}
                        </div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase">{v.owner_name}</div>
                      </td>
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-2 text-slate-600 font-bold text-[11px] bg-slate-50 border px-3 py-1 rounded-xl w-fit">
                          <Phone size={10} className="text-blue-500" /> {getContactNumberFromVessel(v)}
                        </div>
                      </td>
                      <td className="px-8 py-4 text-right">
                        <span className={`text-[10px] font-black uppercase ${getExpirationStatus(getExpiryFromVessel(v)).color}`}>
                          {getExpirationStatus(getExpiryFromVessel(v)).label}
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={3} className="py-12 text-center text-slate-300 font-black uppercase italic text-[10px]">No critical issues flagged</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* --- RIGHT: ACTIVITY & CLASSIFICATION --- */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
            <LayoutDashboard className="absolute -right-6 -top-6 h-24 w-24 text-white opacity-[0.03]" />
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-400 mb-8 flex items-center gap-2"><Clock size={14}/> Activity Log</h3>
            <div className="space-y-8 relative">
              {stats.recent.map((v, i) => (
                <div key={v.id} className="flex gap-4 relative">
                  {i !== stats.recent.length - 1 && <div className="absolute left-1.5 top-6 w-0.5 h-8 bg-slate-800" />}
                  <div className="h-3 w-3 rounded-full bg-blue-600 mt-1 z-10" />
                  <div>
                    <p className="text-[11px] font-black uppercase italic leading-none">
                      {v.vessel_name || v.gear_type || "Asset Modified"}
                    </p>
                    <p className="text-[8px] text-blue-500 font-black mt-2">ID: {v.id?.slice(0, 8).toUpperCase()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Class Mix</h3>
            <div className="grid grid-cols-2 gap-4">
              <AssetMiniCard label="Gears" count={stats.fishingGear} icon={<Fish size={14}/>} />
              <AssetMiniCard label="Payao" count={stats.payaoBalsa} icon={<Box size={14}/>} />
              <AssetMiniCard label="Motorized" count={stats.motorized} icon={<TrendingUp size={14}/>} />
              <AssetMiniCard label="Manual" count={stats.nonMotorized} icon={<Waves size={14}/>} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- SHARED COMPONENTS ---
function KPIStat({ title, count, icon, color, trend }: any) {
  return (
    <Card className={`rounded-[2.5rem] border-none shadow-sm transition-all hover:translate-y-[-4px] duration-300 ${color}`}>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-[10px] font-black uppercase tracking-[0.1em] opacity-60">{title}</CardTitle>
        <div className="opacity-40">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-black italic leading-none tracking-tighter">{count}</div>
        <p className="text-[9px] font-bold mt-4 uppercase opacity-50 flex items-center gap-1">
          <ArrowUpRight size={10}/> {trend}
        </p>
      </CardContent>
    </Card>
  );
}

function AssetMiniCard({ label, count, icon }: any) {
  return (
    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-blue-200 transition-colors">
      <div className="text-blue-600 mb-2 group-hover:scale-110 transition-transform">{icon}</div>
      <p className="text-lg font-black italic text-slate-900 leading-none">{count}</p>
      <p className="text-[9px] font-black uppercase text-slate-400 mt-1">{label}</p>
    </div>
  );
}

function ArrowUpRight({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <line x1="7" y1="17" x2="17" y2="7"></line>
      <polyline points="7 7 17 7 17 17"></polyline>
    </svg>
  );
}