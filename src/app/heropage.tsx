import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Lock, ShieldCheck, FileText, Anchor, Info, Ship, X, 
  Search, CalendarClock, ShieldAlert, MapPin, Activity, AlertTriangle, RotateCcw 
} from 'lucide-react';
import heroBg from './components/photo/romblom1.jpg';
import { useAquaData } from './components/context/AquaRegCONTEXT';

export default function Homepage() {
  const navigate = useNavigate();
  const { Vessels = [], loading } = useAquaData();

  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'rejected'>('all');
  const [reRegData, setReRegData] = useState<any>(null);

  const handleRegister = (vessel: any = null) => {
    setReRegData(vessel);
    if (vessel) {
      localStorage.setItem('reRegisterVesselData', JSON.stringify(vessel));
      localStorage.setItem('isReRegistering', 'true');
    } else {
      localStorage.removeItem('reRegisterVesselData');
      localStorage.removeItem('isReRegistering');
    }
    setShowModal(true);
  };

  const handleAccept = () => {
    setShowModal(false);
    if (reRegData) {
      navigate('/new-registration', { 
        state: { reRegisterVessel: reRegData, isReAudit: true, existingId: reRegData.id, originalName: reRegData.vessel_name } 
      });
    } else {
      navigate('/new-registration');
    }
  };

  const counts = useMemo(() => {
    const scheduled = Vessels.filter((v: any) => v?.status?.toLowerCase() === 'scheduled').length;
    const rejected = Vessels.filter((v: any) => ['rejected', 'flagged'].includes((v?.status || '').toLowerCase())).length;
    return { scheduled, rejected };
  }, [Vessels]);

  const filteredVessels = useMemo(() => {
    return Vessels.filter((v: any) => {
      const status = (v?.status || '').toLowerCase();
      if (!['scheduled', 'rejected', 'flagged'].includes(status)) return false;
      
      const normStatus = status === 'flagged' ? 'rejected' : status;
      if (filter !== 'all' && normStatus !== filter) return false;

      const q = search.toLowerCase().trim();
      if (!q) return true;

      return [v.vessel_name, v.owner_name, v.gear_type, v.barangay, v.rejection_reason, v.id]
        .some(val => String(val || '').toLowerCase().includes(q));
    });
  }, [Vessels, search, filter]);

  return (
    <div className="min-h-screen font-sans text-white flex flex-col relative antialiased bg-cover bg-center bg-fixed" style={{ backgroundImage: `url(${heroBg})` }}>
      <div className="absolute inset-0 bg-slate-900/50 -z-10" />

      {/* Nav */}
      <nav className="w-full pt-4 px-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto shadow-2xl rounded-full px-8 py-3 flex justify-between items-center border border-white/30 bg-white/10 backdrop-blur-2xl">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="p-2.5 bg-blue-600/90 rounded-xl text-white shadow-lg border border-white/20"><Anchor size={24} /></div>
            <div className="flex flex-col">
              <span className="font-black text-3xl leading-none">AQUAREG</span>
              <span className="text-[11px] font-bold tracking-widest text-blue-300 mt-1">ROMBLON MARITIME</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => document.getElementById('dashboard')?.scrollIntoView({ behavior: 'smooth' })} className="hidden md:flex items-center gap-2 font-black uppercase text-xs tracking-wider hover:text-blue-300">
              <Ship size={16} /> Audit Tracker
            </button>
            <button onClick={() => navigate('/about_us')} className="flex items-center gap-2 font-black uppercase text-xs tracking-wider hover:text-blue-300">
              <Info size={16} /> About Us
            </button>
            <button onClick={() => navigate('/login')} className="flex items-center gap-2.5 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-full font-black uppercase text-xs tracking-wider shadow-lg border border-white/30">
              <Lock size={14} /> STAFF PORTAL
            </button>
          </div>
        </div>
      </nav>

      {/* Main Hero */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 flex flex-col justify-center w-full gap-16">
        <div className="flex items-center justify-between gap-8 w-full">
          <div className="flex-1 flex flex-col items-start p-10 md:p-14 max-w-2xl bg-white/10 backdrop-blur-3xl border border-white/25 rounded-[3rem] shadow-2xl space-y-8">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-white/15 border border-white/30 rounded-full text-xs font-bold uppercase tracking-widest">
              <Anchor size={16} className="text-blue-300" /> DEPT OF AGRICULTURE • ROMBLON
            </div>
            <div className="space-y-1">
              <h1 className="text-7xl md:text-8xl font-black tracking-tighter leading-none">DIGITAL BOAT</h1>
              <h1 className="text-7xl md:text-8xl font-black tracking-tighter text-blue-200 leading-none">REGISTRY</h1>
              <p className="text-lg font-medium leading-relaxed pt-4 text-white/90">
                Streamlining maritime governance in Romblon. Register vessels, verify municipal permits, and track inspection schedules effortlessly.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
              <button onClick={() => handleRegister()} className="px-8 py-5 bg-blue-600 hover:bg-blue-500 rounded-full font-black uppercase tracking-widest text-sm shadow-lg w-full sm:w-auto border border-white/20">
                REGISTER VESSEL -&gt;
              </button>
              <button onClick={() => navigate('/verify-permit')} className="px-8 py-5 bg-white/15 hover:bg-white/25 border border-white/30 backdrop-blur-md rounded-full font-black uppercase tracking-widest text-xs shadow-lg w-full sm:w-auto">
                Verify Permit
              </button>
            </div>
          </div>

          <div className="hidden lg:flex flex-col gap-6 w-80">
            <div className="p-6 bg-white/10 backdrop-blur-3xl border border-white/25 rounded-3xl shadow-xl flex items-center gap-4">
              <div className="p-3 bg-blue-600/80 rounded-2xl"><CalendarClock size={32} /></div>
              <div><h3 className="text-2xl font-black">{counts.scheduled}</h3><p className="text-xs font-bold uppercase tracking-wider text-blue-200">Scheduled Audits</p></div>
            </div>
            <div className="p-6 bg-white/10 backdrop-blur-3xl border border-white/25 rounded-3xl shadow-xl flex items-center gap-4">
              <div className="p-3 bg-red-600/80 rounded-2xl"><ShieldAlert size={32} /></div>
              <div><h3 className="text-2xl font-black">{counts.rejected}</h3><p className="text-xs font-bold uppercase tracking-wider text-red-200">Flagged / Rejected</p></div>
            </div>
          </div>
        </div>

        {/* Dashboard Queue */}
        <section id="dashboard" className="w-full pt-10">
          <div className="bg-white/10 backdrop-blur-3xl border border-white/20 rounded-[3rem] p-8 md:p-12 shadow-2xl space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/15 pb-8">
              <div>
                <div className="flex items-center gap-3 text-blue-300 font-bold text-xs uppercase tracking-widest mb-2">
                  <Activity size={18} /> Application Status Directory
                </div>
                <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tight">Scheduled &amp; Rejected Queue</h2>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60" size={18} />
                <input
                  type="text"
                  placeholder="Search name, ID, reason, barangay..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 h-14 bg-white/10 border border-white/20 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-400 backdrop-blur-md"
                />
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                {(['all', 'scheduled', 'rejected'] as const).map(f => (
                  <button key={f} onClick={() => setFilter(f)} className={`px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider border transition-all ${filter === f ? 'bg-blue-600 border-white/40 shadow-lg' : 'bg-white/5 border-white/15 hover:bg-white/15'}`}>
                    {f} ({f === 'all' ? counts.scheduled + counts.rejected : counts[f]})
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="py-20 text-center space-y-4">
                <div className="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-black uppercase tracking-widest text-blue-200">Loading Audit Queue...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVessels.map((v: any) => {
                  const isRejected = ['rejected', 'flagged'].includes((v.status || '').toLowerCase());
                  return (
                    <div key={v.id} className={`border rounded-3xl p-6 backdrop-blur-xl flex flex-col justify-between shadow-lg ${isRejected ? 'bg-red-950/30 border-red-500/40' : 'bg-blue-950/30 border-blue-500/40'}`}>
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <div className={`p-3 rounded-2xl border ${isRejected ? 'bg-red-500/20 border-red-400/40 text-red-300' : 'bg-blue-500/20 border-blue-400/40 text-blue-300'}`}>
                            {isRejected ? <AlertTriangle size={20} /> : <CalendarClock size={20} />}
                          </div>
                          <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase border ${isRejected ? 'bg-red-500/20 text-red-300 border-red-500/40' : 'bg-blue-500/20 text-blue-300 border-blue-500/40'}`}>
                            {v.status}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-xl font-black italic uppercase">{v.vessel_name || v.gear_type || 'UNNAMED'}</h3>
                          <p className="text-xs font-bold text-blue-200 uppercase mt-1">Owner: {v.owner_name || v.owner || 'N/A'}</p>
                        </div>
                        {isRejected ? (
                          <div className="p-4 bg-red-950/60 border border-red-500/30 rounded-2xl space-y-3">
                            <p className="text-[9px] font-black uppercase text-red-400 tracking-wider">Reason: {v.rejection_reason || v.notes || v.remarks || 'Invalid docs.'}</p>
                            <button onClick={() => handleRegister(v)} className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-500 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md">
                              <RotateCcw size={12} /> Register Again
                            </button>
                          </div>
                        ) : (
                          <div className="p-4 bg-blue-950/60 border border-blue-500/30 rounded-2xl">
                            <p className="text-[9px] font-black uppercase text-blue-400">Scheduled Date</p>
                            <p className="text-xs font-bold text-blue-100">{v.scheduled_date || v.inspection_date || 'Pending'}</p>
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10 text-[10px] font-bold">
                          <div><span className="text-white/40 block">CATEGORY</span><span className="uppercase font-black">{v.asset_category || v.type || 'vessel'}</span></div>
                          <div><span className="text-white/40 block">BARANGAY</span><span className="uppercase font-black flex items-center gap-1"><MapPin size={10} className="text-blue-400" /> {v.barangay || 'N/A'}</span></div>
                        </div>
                      </div>
                      <div className="pt-4 mt-4 border-t border-white/10 flex justify-between text-[9px] font-mono font-bold text-white/50">
                        <span>REG ID: #{v.id}</span>
                        <span>{v.is_motorized ? 'Motorized' : 'Non-Motorized'}</span>
                      </div>
                    </div>
                  );
                })}
                {filteredVessels.length === 0 && (
                  <div className="col-span-full py-16 text-center bg-white/5 border border-dashed border-white/20 rounded-3xl space-y-2">
                    <ShieldAlert size={36} className="mx-auto text-white/40" />
                    <p className="text-sm font-black uppercase text-white/70">No records found</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full pb-12 px-6 flex justify-center gap-6">
        <div className="flex items-center gap-4 bg-white/10 px-8 py-5 rounded-2xl border border-white/25 backdrop-blur-3xl shadow-xl">
          <ShieldCheck size={38} className="text-blue-300" />
          <div><h4 className="text-lg font-black leading-tight">SECURE</h4><p className="text-xs font-bold uppercase text-blue-200">ENCRYPTED</p></div>
        </div>
      </footer>

      {/* Terms Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-slate-900/90 border border-white/20 rounded-3xl shadow-2xl p-8 backdrop-blur-2xl flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-xl"><FileText size={20} /></div>
                <h3 className="text-xl font-black">{reRegData ? 'Re-Audit Guidelines' : 'Terms & Privacy'}</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 text-white/70 hover:text-white rounded-full"><X size={20} /></button>
            </div>
            <div className="my-6 space-y-4 text-sm text-white/80 leading-relaxed">
              {reRegData && <div className="p-4 bg-red-900/40 border border-red-500/30 rounded-2xl text-xs font-bold text-red-200">Re-submitting for <span className="uppercase text-white">{reRegData.vessel_name || reRegData.gear_type}</span> updates the existing record.</div>}
              <h4 className="font-bold text-white text-base">1. Acceptance of Terms</h4>
              <p>You agree to comply with digital registry guidelines set by Romblon maritime authorities.</p>
              <h4 className="font-bold text-white text-base">2. Data Privacy</h4>
              <p>Collected purely for municipal asset governance and safety regulations.</p>
            </div>
            <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-6 py-3 rounded-full font-bold uppercase text-xs bg-white/10 border border-white/20">Cancel</button>
              <button onClick={handleAccept} className="px-8 py-3 rounded-full font-black uppercase text-xs bg-blue-600 hover:bg-blue-500 shadow-lg border border-white/30 flex items-center gap-2">
                {reRegData && <RotateCcw size={14} />} {reRegData ? 'Proceed' : 'I Agree'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}