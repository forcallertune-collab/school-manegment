import React, { useState } from 'react';
import { 
  Users, 
  GraduationCap, 
  DollarSign, 
  CheckCircle, 
  Clock, 
  UserPlus, 
  CreditCard, 
  BellRing, 
  UserCheck,
  TrendingUp,
  AlertCircle,
  School,
  Sparkles,
  Zap
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { Student, Staff, AttendanceRecord, FeeItem, VisitorLog, CommunicationAnnouncement } from '../types';

interface DashboardOverviewProps {
  students: Student[];
  staff: Staff[];
  attendance: AttendanceRecord[];
  fees: FeeItem[];
  visitors: VisitorLog[];
  announcements: CommunicationAnnouncement[];
  onNavigate: (module: string) => void;
  onOpenQuickAdmission: () => void;
  onOpenQuickVisitor: () => void;
  onOpenQuickAnnouncement: () => void;
}

// Mock revenue data for chart
const revenueData = [
  { name: 'Jan', total: 120000 },
  { name: 'Feb', total: 180000 },
  { name: 'Mar', total: 150000 },
  { name: 'Apr', total: 320000 },
  { name: 'May', total: 290000 },
  { name: 'Jun', total: 420000 },
];

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  students,
  staff,
  attendance,
  fees,
  visitors,
  announcements,
  onNavigate,
  onOpenQuickAdmission,
  onOpenQuickVisitor,
  onOpenQuickAnnouncement
}) => {
  // 1. Calculate dynamic KPIs
  const totalStudents = students.filter(s => s.status === 'Active' || s.status === 'Suspended').length;
  
  // Student Attendance Rate for today (2026-05-24) or generally for the latest date
  const todayStr = '2026-05-24';
  const todayStudentAtt = attendance.filter(a => a.date === todayStr && a.targetType === 'Student');
  const presentStudentsCount = todayStudentAtt.filter(a => a.status === 'Present').length;
  const leaveStudentsCount = todayStudentAtt.filter(a => a.status === 'Leave').length;
  const totalMarkedStudents = todayStudentAtt.length;
  
  const studentAttendanceRate = totalMarkedStudents > 0 
    ? Math.round(((presentStudentsCount + leaveStudentsCount) / totalMarkedStudents) * 100) 
    : 85;

  // Revenue Calculations
  const revenueCollected = fees
    .filter(f => f.status === 'Paid')
    .reduce((sum, f) => sum + f.amount, 0);

  const totalExpectedRevenue = revenueCollected + fees.filter(f => f.status !== 'Paid').reduce((s,f) => s+f.amount, 0);
  const collectionRate = totalExpectedRevenue > 0 ? Math.round((revenueCollected / totalExpectedRevenue) * 100) : 0;

  // Active checked-in visitors
  const activeVisitorsCount = visitors.filter(v => v.date === todayStr && !v.checkOut).length;

  // Recent visitors
  const recentVisitors = [...visitors]
    .sort((a, b) => b.checkIn.localeCompare(a.checkIn))
    .slice(0, 4);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6" id="dashboard-overview-container"
    >
      {/* Title & Date Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#1E293B] p-7 rounded-3xl shadow-lg shadow-black/20 border border-[#334155] text-white relative overflow-hidden group">
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-12 -translate-y-12 group-hover:scale-110 transition-transform duration-700">
          <School className="w-96 h-96 text-[#2563EB]" />
        </div>
        <div className="relative z-10">
          <h1 className="text-xl md:text-2xl font-bold font-sans text-white tracking-tight flex items-center gap-3">
            NEXORAOS AI <span className="bg-[#2563EB]/20 text-[#38BDF8] text-[10px] uppercase font-bold py-1 px-2.5 rounded-full border border-[#2563EB]/40 flex items-center gap-1"><Sparkles className="w-3 h-3" /> System Nominal</span>
          </h1>
          <p className="text-sm text-[#94A3B8] font-sans mt-1.5">Intelligent Multi-Tenant Operations Center</p>
        </div>
        <div className="hidden sm:flex relative z-10 items-center gap-2 bg-[#111827] px-4.5 py-2.5 rounded-xl border border-[#334155] font-sans text-xs uppercase tracking-wider font-semibold text-[#CBD5E1]">
          <Clock className="w-4 h-4 text-[#38BDF8]" />
          <span>2026-05-24</span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" id="kpi-grid">
        {/* KPI 1 */}
        <motion.div whileHover={{ y: -4, scale: 1.01 }} className="bg-[#1E293B] p-6 rounded-3xl shadow-lg border border-[#334155] hover:border-[#38BDF8]/50 hover:shadow-[0_0_20px_rgba(37,99,235,0.15)] transition-all duration-300 flex flex-col justify-between group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-[#2563EB]/10 text-[#38BDF8] rounded-xl border border-[#2563EB]/20 group-hover:bg-[#2563EB] group-hover:text-white transition-colors">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="text-[11px] text-[#10B981] bg-[#10B981]/10 px-2 py-1 rounded-full border border-[#10B981]/20 font-medium flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +12%
            </span>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-white tracking-tight">{totalStudents}</h3>
            <p className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider mt-1">Total Enrollment</p>
          </div>
        </motion.div>

        {/* KPI 2 */}
        <motion.div whileHover={{ y: -4, scale: 1.01 }} className="bg-[#1E293B] p-6 rounded-3xl shadow-lg border border-[#334155] hover:border-[#38BDF8]/50 hover:shadow-[0_0_20px_rgba(37,99,235,0.15)] transition-all duration-300 flex flex-col justify-between group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-[#2563EB]/10 text-[#38BDF8] rounded-xl border border-[#2563EB]/20 group-hover:bg-[#2563EB] group-hover:text-white transition-colors">
              <UserCheck className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse shadow-[0_0_8px_#10B981]"></span>
              <span className="text-[10px] text-[#CBD5E1] font-semibold uppercase tracking-wider">Live</span>
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-white tracking-tight">{studentAttendanceRate}%</h3>
            <p className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider mt-1">Daily Attendance</p>
          </div>
        </motion.div>

        {/* KPI 3 */}
        <motion.div whileHover={{ y: -4, scale: 1.01 }} className="bg-[#1E293B] p-6 rounded-3xl shadow-lg border border-[#334155] hover:border-[#38BDF8]/50 hover:shadow-[0_0_20px_rgba(37,99,235,0.15)] transition-all duration-300 flex flex-col justify-between group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-[#2563EB]/10 text-[#38BDF8] rounded-xl border border-[#2563EB]/20 group-hover:bg-[#2563EB] group-hover:text-white transition-colors">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div>
             <h3 className="text-3xl font-bold text-white tracking-tight">₹{(revenueCollected / 1000).toFixed(1)}k</h3>
             <div className="w-full bg-[#111827] h-1.5 rounded-full mt-3 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${collectionRate}%` }}
                transition={{ duration: 1, delay: 0.2 }}
                className="bg-gradient-to-r from-[#2563EB] to-[#38BDF8] h-full rounded-full" 
              ></motion.div>
            </div>
            <p className="text-[10px] font-medium text-[#94A3B8] uppercase tracking-wider mt-2">Revenue Realized ({collectionRate}%)</p>
          </div>
        </motion.div>

        {/* KPI 4 */}
        <motion.div whileHover={{ y: -4, scale: 1.01 }} className="bg-[#1E293B] p-6 rounded-3xl shadow-lg border border-[#334155] hover:border-[#38BDF8]/50 hover:shadow-[0_0_20px_rgba(37,99,235,0.15)] transition-all duration-300 flex flex-col justify-between group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-[#2563EB]/10 text-[#38BDF8] rounded-xl border border-[#2563EB]/20 group-hover:bg-[#2563EB] group-hover:text-white transition-colors">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-[11px] text-[#F59E0B] bg-[#F59E0B]/10 px-2 py-1 rounded-full border border-[#F59E0B]/20 font-medium flex items-center gap-1">
              Active Now
            </span>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-white tracking-tight">{activeVisitorsCount}</h3>
            <p className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider mt-1">Campus Visitors</p>
          </div>
        </motion.div>
      </div>

      {/* Analytics Charts & AI Panel Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Core Financial Status widget using Recharts */}
        <div className="lg:col-span-2 bg-[#1E293B] p-6 rounded-3xl shadow-lg shadow-black/20 border border-[#334155] flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Revenue Forecast (AI-Assisted)</h3>
              <p className="text-xs text-[#94A3B8] mt-1">6-month fiscal velocity against projections</p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8]"></span><span className="text-[#94A3B8]">Actual Flow</span></div>
            </div>
          </div>

          <div className="h-64 w-full px-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#334155', color: '#fff', borderRadius: '12px' }} itemStyle={{ color: '#38BDF8' }} />
                <Area type="monotone" dataKey="total" stroke="#38BDF8" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Floating AI Assistant Widget */}
        <div className="lg:col-span-1 bg-[#1E293B] p-6 rounded-3xl shadow-lg border border-[#334155] relative overflow-hidden flex flex-col justify-between group hover:border-[#38BDF8]/40 hover:shadow-[0_0_25px_rgba(56,189,248,0.1)] transition-all">
           <div className="absolute top-0 right-0 w-48 h-48 bg-[#2563EB]/15 blur-[60px] rounded-full pointer-events-none group-hover:bg-[#2563EB]/25 transition-all"></div>
           <div>
             <div className="flex items-center gap-3 mb-5">
               <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#38BDF8] flex items-center justify-center p-0.5 shadow-lg">
                  <div className="w-full h-full bg-[#111827] rounded-xl flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[#2563EB]/10 z-0"></div>
                    <Sparkles className="w-5 h-5 text-[#38BDF8] z-10" />
                  </div>
               </div>
               <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">NEXORA AI <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse shadow-[0_0_6px_#10B981]"></span></h3>
                  <p className="text-[10px] text-[#94A3B8] uppercase tracking-wider font-semibold">Predictive Operator</p>
               </div>
             </div>

             <div className="space-y-4">
                <div className="p-4 bg-[#111827] rounded-2xl border border-[#334155] border-l-2 border-l-[#38BDF8] group-hover:-translate-y-0.5 transition-transform">
                   <p className="text-xs text-[#CBD5E1] leading-relaxed">
                     <strong className="text-white block mb-1">Anomaly Detected:</strong>
                     Attendance in Grade 10-A dropped by 18% over the last 3 days. Recommend dispatching SMS to parents.
                   </p>
                   <button className="mt-3 text-[10px] uppercase font-bold tracking-wider text-[#38BDF8] hover:text-white transition-colors bg-[#2563EB]/10 px-3 py-1.5 rounded-lg border border-[#2563EB]/20 hover:bg-[#2563EB]">Generate Draft</button>
                </div>

                <div className="p-4 bg-[#111827] rounded-2xl border border-[#334155] border-l-2 border-l-[#10B981] group-hover:-translate-y-0.5 transition-transform">
                   <p className="text-xs text-[#CBD5E1] leading-relaxed">
                     <strong className="text-white block mb-1">Financial Projection:</strong>
                     Current fee velocity suggests you will exceed quarterly revenue targets by ₹2.4M.
                   </p>
                </div>
             </div>
           </div>
           
           <div className="mt-6 relative">
              <input type="text" placeholder="Ask Nexora about trends..." className="w-full bg-[#0B1120] text-white text-xs placeholder:text-[#94A3B8] border border-[#334155] py-3.5 pl-4 pr-10 rounded-xl focus:outline-none focus:border-[#38BDF8] focus:ring-1 focus:ring-[#38BDF8]/50 transition-all" />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[#38BDF8] hover:bg-[#1E293B] rounded-lg transition-colors cursor-pointer">
                <Zap className="w-4 h-4" />
              </button>
           </div>
        </div>
      </div>
      
      {/* Quick Launchpad & Gate Logs Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Quick Launchpad Panel */}
          <div className="lg:col-span-7 bg-[#111827] text-white p-7 rounded-3xl shadow-md border border-[#334155] relative overflow-hidden" id="quick-action-panel">
            <h2 className="text-sm font-bold tracking-[0.15em] uppercase text-[#38BDF8]">Action Center</h2>
            <p className="text-xs text-[#94A3B8] mt-1">Execute priority system workflows instantly.</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <button onClick={onOpenQuickAdmission} className="flex flex-col items-center justify-center p-5 bg-[#1E293B] hover:bg-[#2563EB] border border-[#334155] rounded-2xl transition-all cursor-pointer text-xs font-semibold text-[#CBD5E1] hover:text-white group hover:shadow-[0_0_20px_rgba(37,99,235,0.2)]">
                <div className="w-10 h-10 rounded-full bg-[#111827] border border-[#334155] group-hover:border-[#2563EB]/40 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <UserPlus className="w-4 h-4 text-[#38BDF8] group-hover:text-white" />
                </div>
                New Admission
              </button>
              
              <button onClick={() => onNavigate('fees')} className="flex flex-col items-center justify-center p-5 bg-[#1E293B] hover:bg-[#2563EB] border border-[#334155] rounded-2xl transition-all cursor-pointer text-xs font-semibold text-[#CBD5E1] hover:text-white group hover:shadow-[0_0_20px_rgba(37,99,235,0.2)]">
                <div className="w-10 h-10 rounded-full bg-[#111827] border border-[#334155] group-hover:border-[#2563EB]/40 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <CreditCard className="w-4 h-4 text-[#38BDF8] group-hover:text-white" />
                </div>
                Record Fee
              </button>

              <button onClick={onOpenQuickVisitor} className="flex flex-col items-center justify-center p-5 bg-[#1E293B] hover:bg-[#2563EB] border border-[#334155] rounded-2xl transition-all cursor-pointer text-xs font-semibold text-[#CBD5E1] hover:text-white group hover:shadow-[0_0_20px_rgba(37,99,235,0.2)]">
                <div className="w-10 h-10 rounded-full bg-[#111827] border border-[#334155] group-hover:border-[#2563EB]/40 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Clock className="w-4 h-4 text-[#38BDF8] group-hover:text-white" />
                </div>
                Log Visitor
              </button>

              <button onClick={onOpenQuickAnnouncement} className="flex flex-col items-center justify-center p-5 bg-[#1E293B] hover:bg-[#2563EB] border border-[#334155] rounded-2xl transition-all cursor-pointer text-xs font-semibold text-[#CBD5E1] hover:text-white group hover:shadow-[0_0_20px_rgba(37,99,235,0.2)]">
                <div className="w-10 h-10 rounded-full bg-[#111827] border border-[#334155] group-hover:border-[#2563EB]/40 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <BellRing className="w-4 h-4 text-[#38BDF8] group-hover:text-white" />
                </div>
                Dispatch
              </button>
            </div>
          </div>

          {/* Recent Reception Desk Visitors */}
          <div className="lg:col-span-5 bg-[#1E293B] p-6 rounded-3xl shadow-lg border border-[#334155] flex flex-col justify-between" id="visitor-ledger-widget">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Gate Security Log</h3>
                <p className="text-[10px] text-[#94A3B8] mt-0.5">Live campus entry stream</p>
              </div>
              <button onClick={() => onNavigate('visitors')} className="text-[10px] text-[#38BDF8] hover:text-white font-bold uppercase tracking-wider transition-colors px-3 py-1.5 rounded-lg border border-[#334155] hover:border-[#38BDF8]">
                View All
              </button>
            </div>

            <div className="space-y-3">
              {recentVisitors.map((v, i) => (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 * i }} key={v.id} className="flex items-center justify-between p-3.5 bg-[#111827] hover:bg-[#1E293B] rounded-2xl border border-[#334155] hover:border-[#38BDF8]/40 transition-colors cursor-default">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#2563EB]/10 border border-[#2563EB]/30 flex items-center justify-center text-[#38BDF8] font-bold text-[10px]">
                       {v.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{v.name}</p>
                      <p className="text-[10px] text-[#94A3B8] mt-0.5">Host: {v.hostName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-[#CBD5E1] font-medium">{v.checkIn}</p>
                    <span className={`text-[8px] uppercase tracking-wider px-2 py-0.5 rounded-full mt-1.5 inline-block font-bold border ${v.checkOut ? 'bg-[#334155]/30 text-[#94A3B8] border-[#334155]' : 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30'}`}>
                      {v.checkOut ? 'Departed' : 'Active'}
                    </span>
                  </div>
                </motion.div>
              ))}
              {recentVisitors.length === 0 && (
                <div className="text-center py-6 text-[#94A3B8] text-xs">No recent visitors today.</div>
              )}
            </div>
          </div>
      </div>
    </motion.div>
  );
};
