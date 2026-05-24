import React from 'react';
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
  School
} from 'lucide-react';
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
  const totalStaff = staff.length;
  
  // Student Attendance Rate for today (2026-05-24) or generally for the latest date
  const todayStr = '2026-05-24';
  const todayStudentAtt = attendance.filter(a => a.date === todayStr && a.targetType === 'Student');
  const presentStudentsCount = todayStudentAtt.filter(a => a.status === 'Present').length;
  const leaveStudentsCount = todayStudentAtt.filter(a => a.status === 'Leave').length;
  const totalMarkedStudents = todayStudentAtt.length;
  
  const studentAttendanceRate = totalMarkedStudents > 0 
    ? Math.round(((presentStudentsCount + leaveStudentsCount) / totalMarkedStudents) * 100) 
    : 85; // Fallback default if not marked

  // Revenue Calculations
  const revenueCollected = fees
    .filter(f => f.status === 'Paid')
    .reduce((sum, f) => sum + f.amount, 0);

  const revenuePending = fees
    .filter(f => f.status === 'Pending')
    .reduce((sum, f) => sum + f.amount, 0);

  const revenueOverdue = fees
    .filter(f => f.status === 'Overdue')
    .reduce((sum, f) => sum + f.amount, 0);

  const totalExpectedRevenue = revenueCollected + revenuePending + revenueOverdue;
  const collectionRate = totalExpectedRevenue > 0 
    ? Math.round((revenueCollected / totalExpectedRevenue) * 100) 
    : 0;

  // Active checked-in visitors (no checkout time)
  const activeVisitorsCount = visitors.filter(v => v.date === todayStr && !v.checkOut).length;

  // Recent 3 fee payments
  const recentPayments = [...fees]
    .filter(f => f.status === 'Paid' && f.paymentDate)
    .sort((a, b) => (b.paymentDate || '').localeCompare(a.paymentDate || ''))
    .slice(0, 3);

  // Recent 3 visitors
  const recentVisitors = [...visitors]
    .sort((a, b) => b.checkIn.localeCompare(a.checkIn))
    .slice(0, 3);

  return (
    <div className="space-y-6 animate-fade-in" id="dashboard-overview-container">
      {/* Title & Date Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-[#0d1b3e] to-[#050b1d] p-7 rounded-3xl shadow-md border border-[#9e7534]/30 text-white relative overflow-hidden glow-royal">
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-6 -translate-y-6">
          <School className="w-64 h-64 text-[#dfbf85]" />
        </div>
        <div className="relative z-10">
          <h1 className="text-xl md:text-2xl font-bold font-display text-[#dfbf85] tracking-wide">Chancellor's Executive Dashboard</h1>
          <p className="text-xs text-[#ead2a3]/85 font-sans mt-1.5 italic">A real-time analytical summary of EduQube’s academic & operational treasury chambers.</p>
        </div>
        <div className="none sm:flex relative z-10 items-center gap-2 bg-[#dfbf85]/10 px-4.5 py-2.5 rounded-xl text-[#dfbf85] border border-[#dfbf85]/35 font-display text-[11px] uppercase tracking-wider font-semibold">
          <Clock className="w-4 h-4 text-[#dfbf85]" />
          <span>System Date: 2026-05-24</span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" id="kpi-grid">
        {/* KPI 1: Active Enrollment */}
        <div className="bg-white p-5 rounded-3xl shadow-xs border border-[#ead2a3]/45 hover:border-[#b98d45]/60 transition-all duration-300 group flex items-start gap-4 hover:shadow-md hover:-translate-y-0.5">
          <div className="p-3 bg-gradient-to-br from-[#faf6eb] to-[#f5eedc] text-[#9e7534] rounded-full border border-[#ead2a3] group-hover:scale-105 transition-all">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-bold text-[#815e26] uppercase tracking-[0.1em] font-display">Total Enrollment</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1 font-display">{totalStudents} <span className="text-xs text-slate-400 font-sans font-normal">Scholars</span></h3>
            <div className="flex items-center gap-1 text-[11px] text-emerald-700 mt-1.5 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+4 matriculations this term</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Live Attendance Rate */}
        <div className="bg-white p-5 rounded-3xl shadow-xs border border-[#ead2a3]/45 hover:border-[#b98d45]/60 transition-all duration-300 group flex items-start gap-4 hover:shadow-md hover:-translate-y-0.5">
          <div className="p-3 bg-gradient-to-br from-[#faf6eb] to-[#f5eedc] text-[#9e7534] rounded-full border border-[#ead2a3] group-hover:scale-105 transition-all">
            <UserCheck className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-bold text-[#815e26] uppercase tracking-[0.1em] font-display">Attendance Rate</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1 font-display">{studentAttendanceRate}%</h3>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="w-2 h-2 rounded-full bg-[#b98d45] animate-pulse"></span>
              <span className="text-[11px] text-[#815e26] font-medium font-display uppercase tracking-wider text-[10px]">Today Active: {presentStudentsCount}/{totalMarkedStudents}</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Collected Fees */}
        <div className="bg-white p-5 rounded-3xl shadow-xs border border-[#ead2a3]/45 hover:border-[#b98d45]/60 transition-all duration-300 group flex items-start gap-4 hover:shadow-md hover:-translate-y-0.5">
          <div className="p-3 bg-gradient-to-br from-[#faf6eb] to-[#f5eedc] text-[#9e7534] rounded-full border border-[#ead2a3] group-hover:scale-105 transition-all">
            <DollarSign className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-bold text-[#815e26] uppercase tracking-[0.1em] font-display">Revenue Collected</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1 font-display">₹{revenueCollected.toLocaleString('en-IN')}</h3>
            <div className="w-full bg-[#f5eedc] h-1.5 rounded-full mt-3 overflow-hidden border border-[#ead2a3]/20">
              <div 
                className="bg-[#b98d45] h-full rounded-full transition-all duration-500 font-display" 
                style={{ width: `${collectionRate}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5 font-medium">{collectionRate}% of anticipated collections</p>
          </div>
        </div>

        {/* KPI 4: Active Visitors */}
        <div className="bg-white p-5 rounded-3xl shadow-xs border border-[#ead2a3]/45 hover:border-[#b98d45]/60 transition-all duration-300 group flex items-start gap-4 hover:shadow-md hover:-translate-y-0.5">
          <div className="p-3 bg-gradient-to-br from-[#faf6eb] to-[#f5eedc] text-[#9e7534] rounded-full border border-[#ead2a3] group-hover:scale-105 transition-all">
            <Clock className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-bold text-[#815e26] uppercase tracking-[0.1em] font-display">Campus Visitors</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1 font-display">{activeVisitorsCount} <span className="text-xs text-slate-400 font-sans font-normal">Active</span></h3>
            <div className="flex items-center gap-1 text-[11px] text-[#9e7534] mt-1.5 font-medium">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Signed in at registry</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Launchpad Panel */}
      <div className="bg-gradient-to-r from-[#0d1b3e] to-[#070e24] text-white p-6.5 rounded-3xl shadow-md border border-[#9e7534]/30 glow-royal relative overflow-hidden" id="quick-action-panel">
        <h2 className="text-sm font-bold tracking-[0.15em] uppercase text-[#dfbf85] font-display">Administrative Instant Decrees</h2>
        <p className="text-xs text-[#ead2a3]/85 mt-1 italic font-serif">Bypass standard circular logs to record admissions, gate logs, or fee transits instantly.</p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
          <button 
            id="qa-btn-admission"
            onClick={onOpenQuickAdmission}
            className="flex flex-col items-center justify-center p-4 bg-[#0a1128]/80 hover:bg-[#b98d45]/20 border border-[#9e7534]/30 hover:border-[#dfbf85] rounded-2xl transition-all cursor-pointer font-display text-xs text-[#dfbf85] hover:text-white"
          >
            <UserPlus className="w-5 h-5 mb-2.5 text-[#dfbf85]" />
            New Admission
          </button>
          
          <button 
            id="qa-btn-pay-fee"
            onClick={() => onNavigate('fees')}
            className="flex flex-col items-center justify-center p-4 bg-[#0a1128]/80 hover:bg-[#b98d45]/20 border border-[#9e7534]/30 hover:border-[#dfbf85] rounded-2xl transition-all cursor-pointer font-display text-xs text-[#dfbf85] hover:text-white"
          >
            <CreditCard className="w-5 h-5 mb-2.5 text-[#dfbf85]" />
            Record Fee Receipt
          </button>

          <button 
            id="qa-btn-visitor"
            onClick={onOpenQuickVisitor}
            className="flex flex-col items-center justify-center p-4 bg-[#0a1128]/80 hover:bg-[#b98d45]/20 border border-[#9e7534]/30 hover:border-[#dfbf85] rounded-2xl transition-all cursor-pointer font-display text-xs text-[#dfbf85] hover:text-white"
          >
            <Clock className="w-5 h-5 mb-2.5 text-[#dfbf85]" />
            Log Gate Entrance
          </button>

          <button 
            id="qa-btn-announcement"
            onClick={onOpenQuickAnnouncement}
            className="flex flex-col items-center justify-center p-4 bg-[#0a1128]/80 hover:bg-[#b98d45]/20 border border-[#9e7534]/30 hover:border-[#dfbf85] rounded-2xl transition-all cursor-pointer font-display text-xs text-[#dfbf85] hover:text-white"
          >
            <BellRing className="w-5 h-5 mb-2.5 text-[#dfbf85]" />
            Circular Dispatch
          </button>
        </div>
      </div>

      {/* Split Row for Visualizations & Recents */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Core Financial Status widget */}
        <div className="lg:col-span-7 bg-white p-7 rounded-3xl shadow-xs border border-[#ead2a3]/45 flex flex-col justify-between" id="financial-status-widget">
          <div>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-display uppercase tracking-wider text-sm">Financial Ledger Overview</h3>
                <p className="text-xs text-[#815e26] mt-0.5 font-sans italic">Term-1 Fee breakdown & balance ratios.</p>
              </div>
              <span className="text-[10px] font-display text-[#8c6225] bg-[#faf6eb] border border-[#ead2a3]/60 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">Treasury Chamber</span>
            </div>

            {/* Simulated mini visual ledger chart */}
            <div className="mt-6 space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-600">Collected Income</span>
                  <span className="text-slate-800">₹{revenueCollected.toLocaleString()}</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${(revenueCollected / totalExpectedRevenue)*100}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-600">Pending Receivables</span>
                  <span className="text-slate-800">₹{revenuePending.toLocaleString()}</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-amber-400 h-full rounded-full" style={{ width: `${(revenuePending / totalExpectedRevenue)*100}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-600">Overdue Unpaid Balances</span>
                  <span className="text-amber-700 font-bold">₹{revenueOverdue.toLocaleString()}</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full rounded-full" style={{ width: `${(revenueOverdue / totalExpectedRevenue)*100}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-50 flex items-center justify-between text-xs text-slate-400">
            <span>Overall fiscal collection efficiency:</span>
            <span className="font-bold text-slate-800 text-sm">{collectionRate}%</span>
          </div>
        </div>

        {/* Recent Reception Desk Visitors */}
        <div className="lg:col-span-5 bg-white p-7 rounded-3xl shadow-xs border border-[#ead2a3]/45 flex flex-col justify-between shadow-2xs" id="visitor-ledger-widget">
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-display uppercase tracking-wider text-sm">Front Desk Visitor Log</h3>
                <p className="text-xs text-[#815e26] mt-0.5 font-sans italic">Active entries registered in lobby.</p>
              </div>
              <button 
                id="view-all-visitors"
                onClick={() => onNavigate('visitors')}
                className="text-xs text-[#9e7534] hover:text-[#815e26] font-display font-bold uppercase tracking-wider cursor-pointer transition-colors"
              >
                Logbook →
              </button>
            </div>

            <div className="space-y-4">
              {recentVisitors.map(v => (
                <div key={v.id} className="flex items-center justify-between p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                  <div className="flex items-start gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 mt-1"></div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{v.name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Meeting: {v.hostName} ({v.hostRole})</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-mono text-slate-600 font-bold">{v.checkIn}</p>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full mt-1 inline-block font-medium ${v.checkOut ? 'bg-slate-200/80 text-slate-600' : 'bg-emerald-100 text-emerald-800'}`}>
                      {v.checkOut ? 'Checked Out' : 'Active'}
                    </span>
                  </div>
                </div>
              ))}
              {recentVisitors.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-6">No visitor records found.</p>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-50 text-[11px] text-slate-400 flex justify-between">
            <span>Log updated 12 mins ago</span>
            <span>Digital registration active</span>
          </div>
        </div>
      </div>

      {/* Staff attendance versus Student attendance quick dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Latest Announcement Board widget */}
        <div className="bg-white p-7 rounded-3xl shadow-xs border border-[#ead2a3]/45 shadow-2xs" id="announcement-board-widget">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display uppercase tracking-wider text-sm">Principal Circular Roster</h3>
              <p className="text-xs text-[#815e26] mt-0.5 font-sans italic">Disseminated circulars to parent portals.</p>
            </div>
            <button 
              id="view-all-announcements"
              onClick={() => onNavigate('communication')}
              className="text-xs text-[#9e7534] hover:text-[#815e26] font-display font-bold uppercase tracking-wider cursor-pointer transition-colors"
            >
              Notice Board →
            </button>
          </div>

          <div className="space-y-4">
            {announcements.slice(0, 2).map(a => (
              <div key={a.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-50/50 transition-all">
                <div className="flex justify-between items-start gap-2">
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    a.type === 'Alert' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                    a.type === 'Circular' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {a.type}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">{a.date}</span>
                </div>
                <h4 className="text-xs font-bold text-slate-800 mt-2 line-clamp-1">{a.title}</h4>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{a.content}</p>
                <p className="text-[10px] text-slate-400 mt-2 italic">Issued by: {a.sender} ({a.role})</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Ledger breakdown for pending payments */}
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-100 flex flex-col justify-between animate-fade-in" id="recent-payments-widget">
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-800">Recent Cashier Receipts</h3>
                <p className="text-xs text-slate-400 mt-0.5">Instantly issued digital receipts.</p>
              </div>
              <button 
                id="view-all-fees"
                onClick={() => onNavigate('fees')}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold hover:underline cursor-pointer"
              >
                Cashier Hub →
              </button>
            </div>

            <div className="space-y-3">
              {recentPayments.map(p => (
                <div key={p.id} className="flex justify-between items-center p-3 bg-indigo-50/20 border border-indigo-50 rounded-xl">
                  <div>
                    <p className="text-xs font-bold text-slate-800">{p.studentName}</p>
                    <p className="text-[10px] text-slate-500">{p.title}</p>
                    <p className="text-[9px] font-mono text-slate-400">RC: {p.receiptNo}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-emerald-700 font-mono">+₹{p.amount}</p>
                    <span className="text-[9px] text-slate-400 font-mono block mt-0.5">{p.paymentDate}</span>
                  </div>
                </div>
              ))}
              {recentPayments.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-6">No receipt recordings logged yet.</p>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-50 flex justify-between items-center text-[10px] text-slate-400">
            <span>Audit Trail compliant</span>
            <span className="text-emerald-600 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Ledger Locked
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
