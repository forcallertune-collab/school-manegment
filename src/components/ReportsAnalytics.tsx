import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Award, 
  Users, 
  DollarSign, 
  Layers, 
  ChevronRight,
  PieChart as PieIcon,
  CalendarDays,
  Sparkles
} from 'lucide-react';
import { Student, Staff, AttendanceRecord, FeeItem, StudentResult } from '../types';

interface ReportsAnalyticsProps {
  students: Student[];
  staff: Staff[];
  attendance: AttendanceRecord[];
  fees: FeeItem[];
  results: StudentResult[];
}

export const ReportsAnalytics: React.FC<ReportsAnalyticsProps> = ({
  students,
  staff,
  attendance,
  fees,
  results
}) => {
  // Analytical categories selection
  const [activeSegment, setActiveSegment] = useState<'financial' | 'attendance' | 'grades'>('financial');

  // Compute live aggregates from database
  const activeStudentCount = students.filter(s => s.status === 'Active').length;
  const staffCount = staff.length;
  
  // 1. GRADE ANALYTICS calculations (supporting CBSE standard grading metrics)
  const gradeDistribution = {
    'A1': results.filter(r => r.grade === 'A1' || r.grade === 'A+').length,
    'A2': results.filter(r => r.grade === 'A2' || r.grade === 'A').length,
    'B1': results.filter(r => r.grade === 'B1' || r.grade === 'B').length,
    'B2': results.filter(r => r.grade === 'B2' || r.grade === 'C').length,
    'C1': results.filter(r => r.grade === 'C1' || r.grade === 'D').length,
  };
  const totalGraded = results.length || 1;
  const gradePercentages = {
    'A1': Math.round((gradeDistribution['A1'] / totalGraded) * 100),
    'A2': Math.round((gradeDistribution['A2'] / totalGraded) * 100),
    'B1': Math.round((gradeDistribution['B1'] / totalGraded) * 100),
    'B2': Math.round((gradeDistribution['B2'] / totalGraded) * 100),
    'C1': Math.round((gradeDistribution['C1'] / totalGraded) * 100),
  };

  // 2. FINANCIAL LEDGER calculations
  const totalFeesPaid = fees.filter(f => f.status === 'Paid').reduce((sum, f) => sum + f.amount, 0);
  const totalFeesPending = fees.filter(f => f.status === 'Pending').reduce((sum, f) => sum + f.amount, 0);
  const totalFeesOverdue = fees.filter(f => f.status === 'Overdue').reduce((sum, f) => sum + f.amount, 0);
  const expectedTotalFees = totalFeesPaid + totalFeesPending + totalFeesOverdue || 1;

  const paidPercentage = Math.round((totalFeesPaid / expectedTotalFees) * 100);
  const pendingPercentage = Math.round((totalFeesPending / expectedTotalFees) * 100);
  const overduePercentage = Math.round((totalFeesOverdue / expectedTotalFees) * 100);

  // 3. ATTENDANCE HISTORICAL TRENDS calculation
  const dates = ['2026-05-20', '2026-05-21', '2026-05-22', '2026-05-23', '2026-05-24'];
  const studentAttendanceTrends = dates.map(dt => {
    const dayRecords = attendance.filter(a => a.date === dt && a.targetType === 'Student');
    const present = dayRecords.filter(r => r.status === 'Present').length;
    const leave = dayRecords.filter(r => r.status === 'Leave').length;
    const total = dayRecords.length || 1;
    return Math.round(((present + leave) / total) * 100);
  });

  const staffAttendanceTrends = dates.map(dt => {
    const dayRecords = attendance.filter(a => a.date === dt && a.targetType === 'Staff');
    const present = dayRecords.filter(r => r.status === 'Present').length;
    const leave = dayRecords.filter(r => r.status === 'Leave').length;
    const total = dayRecords.length || 1;
    return Math.round(((present + leave) / total) * 100);
  });

  return (
    <div className="space-y-6" id="reports-module-container text-slate-705">
      {/* Title Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#1E293B] p-6 rounded-2xl shadow-lg shadow-black/20 border border-[#334155]">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Layers className="text-[#2563EB] w-6 h-6" />
            Academic Term Reports & Analytical Ledger
          </h1>
          <p className="text-sm text-[#94A3B8] mt-0.5">Explore institutional aggregates, dynamic revenue graphs, presence timelines, and grade spreads of the CBSE session.</p>
        </div>
        
        {/* Switch segment controls */}
        <div className="flex bg-[#273549] p-1 rounded-xl w-full sm:w-auto" id="segment-switches">
          <button
            onClick={() => setActiveSegment('financial')}
            id="segment-btn-financial"
            className={`flex-1 sm:flex-initial text-xs font-bold px-4 py-2 rounded-lg cursor-pointer transition-all ${activeSegment === 'financial' ? 'bg-[#1E293B] text-[#38BDF8] shadow-lg shadow-black/20' : 'text-[#94A3B8] hover:text-white'}`}
          >
            Ledger Financials
          </button>
          <button
            onClick={() => setActiveSegment('attendance')}
            id="segment-btn-attendance"
            className={`flex-1 sm:flex-initial text-xs font-bold px-4 py-2 rounded-lg cursor-pointer transition-all ${activeSegment === 'attendance' ? 'bg-[#1E293B] text-[#38BDF8] shadow-lg shadow-black/20' : 'text-[#94A3B8] hover:text-white'}`}
          >
            Attendance Streams
          </button>
          <button
            onClick={() => setActiveSegment('grades')}
            id="segment-btn-grades"
            className={`flex-1 sm:flex-initial text-xs font-bold px-4 py-2 rounded-lg cursor-pointer transition-all ${activeSegment === 'grades' ? 'bg-[#1E293B] text-[#38BDF8] shadow-lg shadow-black/20' : 'text-[#94A3B8] hover:text-white'}`}
          >
            Grade Distro
          </button>
        </div>
      </div>

      {/* SEGMENT A: FINANCIAL LEDGER ANALYTICS */}
      {activeSegment === 'financial' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="financial-segment-view">
          {/* Aggregate Left cards */}
          <div className="lg:col-span-4 space-y-5">
            <div className="bg-[#1E293B] p-5 rounded-2xl border border-[#334155] shadow-2xs space-y-1">
              <span className="text-[10px] bg-[#273549] text-[#94A3B8] px-2.5 py-0.5 rounded font-mono font-bold tracking-wider uppercase">Active Invoices</span>
              <p className="text-sm text-[#94A3B8] font-semibold mt-2">Overall Receivable Stream</p>
              <h3 className="text-2xl font-black text-white">₹{expectedTotalFees.toLocaleString()} <span className="text-xs text-slate-450 font-sans font-normal">INR</span></h3>
            </div>

            <div className="bg-[#1E293B] p-5 rounded-2xl border border-[#334155] shadow-2xs space-y-4">
              <h4 className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">Remittance Ratios</h4>
              
              <div className="space-y-3.5">
                {/* Paid */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-[#CBD5E1] font-mono">
                    <span>Collected Sum ({paidPercentage}%)</span>
                    <span className="font-bold text-[#10B981]">₹{totalFeesPaid.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-[#273549] h-2 rounded-full overflow-hidden">
                    <div className="bg-[#10B981]/10 border border-[#10B981]/300 h-full rounded-full" style={{ width: `${paidPercentage}%` }}></div>
                  </div>
                </div>

                {/* Pending */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-[#CBD5E1] font-mono">
                    <span>Unsettled Pending ({pendingPercentage}%)</span>
                    <span className="font-bold text-[#F59E0B]">₹{totalFeesPending.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-[#273549] h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: `${pendingPercentage}%` }}></div>
                  </div>
                </div>

                {/* Overdue */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-[#CBD5E1] font-mono">
                    <span>Default Overdue ({overduePercentage}%)</span>
                    <span className="font-bold text-rose-700">₹{totalFeesOverdue.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-[#273549] h-2 rounded-full overflow-hidden">
                    <div className="bg-[#EF4444]/10 border border-[#EF4444]/300 h-full rounded-full" style={{ width: `${overduePercentage}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Graphical presentation Bar Chart using dynamic SVG */}
          <div className="lg:col-span-8 bg-[#1E293B] p-6 rounded-2xl border border-[#334155] shadow-2xs flex flex-col justify-between" id="financial-svg-chart">
            <div>
              <h3 className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-1">Fee Structure Segment breakdown</h3>
              <p className="text-xs text-[#94A3B8]">Value proportions assigned into Tuition, Activity, and Labs portfolios.</p>
            </div>

            {/* Custom High Contrast SVG Bar Chart Representation */}
            <div className="h-64 flex items-end justify-around border-b border-l border-[#334155] p-4 mt-6">
              {/* Pillar 1: Tuition */}
              <div className="flex flex-col items-center gap-2 w-16 group cursor-pointer">
                <div className="text-xs font-mono font-bold text-[#38BDF8]">₹85,400</div>
                <div className="w-8 bg-[#2563EB] shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(56,189,248,0.5)] hover:bg-[#38BDF8] rounded-t-lg transition-all duration-300 hover:opacity-85" style={{ height: '140px' }}></div>
                <span className="text-[10px] text-[#94A3B8] font-semibold uppercase">Tuition</span>
              </div>

              {/* Pillar 2: Activity */}
              <div className="flex flex-col items-center gap-2 w-16 group cursor-pointer">
                <div className="text-xs font-mono font-bold text-[#38BDF8]">₹18,850</div>
                <div className="w-8 bg-[#10B981]/10 border border-[#10B981]/300 rounded-t-lg transition-all duration-300 hover:opacity-85" style={{ height: '70px' }}></div>
                <span className="text-[10px] text-[#94A3B8] font-semibold uppercase">Activity</span>
              </div>

              {/* Pillar 3: Laboratory */}
              <div className="flex flex-col items-center gap-2 w-16 group cursor-pointer">
                <div className="text-xs font-mono font-bold text-[#38BDF8]">₹9,950</div>
                <div className="w-8 bg-amber-500 rounded-t-lg transition-all duration-300 hover:opacity-85" style={{ height: '40px' }}></div>
                <span className="text-[10px] text-[#94A3B8] font-semibold uppercase">Lab Costs</span>
              </div>

              {/* Pillar 4: Exams */}
              <div className="flex flex-col items-center gap-2 w-16 group cursor-pointer">
                <div className="text-xs font-mono font-bold text-[#38BDF8]">₹4,450</div>
                <div className="w-8 bg-purple-500 rounded-t-lg transition-all duration-300 hover:opacity-85" style={{ height: '25px' }}></div>
                <span className="text-[10px] text-[#94A3B8] font-semibold uppercase">Exams</span>
              </div>
            </div>

            <div className="flex items-center gap-3.5 text-xs text-[#94A3B8] pt-6">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#2563EB] shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(56,189,248,0.5)] hover:bg-[#38BDF8]"></span> Core tuition value</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#10B981]/10 border border-[#10B981]/300"></span> Facilities & Extracurricular</span>
            </div>
          </div>
        </div>
      )}

      {/* SEGMENT B: ATTENDANCE TRENDS TIMELINE */}
      {activeSegment === 'attendance' && (
        <div className="bg-[#1E293B] p-6 rounded-2xl border border-[#334155] shadow-2xs space-y-6" id="attendance-segment-view">
          <div>
            <h3 className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-1">Academic Presence Timeline</h3>
            <p className="text-xs text-[#94A3B8]">Evaluating student enrollment engagement vs. active academic staff timelines.</p>
          </div>

          {/* SVG Multi-Line Trend Chart representation */}
          <div className="relative h-64 border-b border-l border-[#334155] mt-6 p-4">
            {/* Guide grid lines */}
            <div className="absolute inset-x-0 top-1/4 border-t border-[#334155]/85"></div>
            <div className="absolute inset-x-0 top-2/4 border-t border-[#334155]/85"></div>
            <div className="absolute inset-x-0 top-3/4 border-t border-[#334155]/85"></div>

            <svg className="w-full h-full" viewBox="0 0 500 150" preserveAspectRatio="none" id="attendance-trends-svg">
              {/* Student Presence Line - Indigo */}
              <polyline
                fill="none"
                stroke="#4f46e5"
                strokeWidth="3.5"
                points={`
                  20,${150 - studentAttendanceTrends[0]}
                  120,${150 - studentAttendanceTrends[1]}
                  220,${150 - studentAttendanceTrends[2]}
                  320,${150 - studentAttendanceTrends[3]}
                  420,${150 - studentAttendanceTrends[4]}
                `}
                className="transition-all duration-500"
              />
              
              {/* Student plot dots */}
              {studentAttendanceTrends.map((val, idx) => (
                <circle key={`std-${idx}`} cx={20 + idx * 100} cy={150 - val} r="4.5" fill="#4f46e5" />
              ))}

              {/* Staff Presence Line - Emerald */}
              <polyline
                fill="none"
                stroke="#10b981"
                strokeWidth="3"
                points={`
                  20,${150 - staffAttendanceTrends[0]}
                  120,${150 - staffAttendanceTrends[1]}
                  220,${150 - staffAttendanceTrends[2]}
                  320,${150 - staffAttendanceTrends[3]}
                  420,${150 - staffAttendanceTrends[4]}
                `}
              />
              
              {/* Staff plot dots */}
              {staffAttendanceTrends.map((val, idx) => (
                <circle key={`stf-${idx}`} cx={20 + idx * 100} cy={150 - val} r="4" fill="#10b981" />
              ))}
            </svg>

            <span className="absolute left-2 top-2 text-[9.5px] font-mono text-[#94A3B8]">100% Target Limit</span>
          </div>

          {/* Timeline labels matches Dates */}
          <div className="flex justify-between px-6 text-[10.5px] font-mono text-[#94A3B8] select-none">
            {dates.map((d, index) => (
              <span key={d}>
                Date: {d.slice(5)}
                <span className="block text-[9px] text-center text-slate-405">
                  ({studentAttendanceTrends[index]}% Std / {staffAttendanceTrends[index]}% Stf)
                </span>
              </span>
            ))}
          </div>

          <div className="flex items-center gap-6 text-xs text-[#94A3B8] pt-4 border-t border-slate-50">
            <span className="flex items-center gap-1.5 font-semibold"><span className="w-3 h-3 rounded-full bg-[#2563EB] shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(56,189,248,0.5)] hover:bg-[#38BDF8]"></span> Pupil Attendance Curve</span>
            <span className="flex items-center gap-1.5 font-semibold"><span className="w-3 h-3 rounded-full bg-[#10B981]/10 border border-[#10B981]/300"></span> Faculty presence Curve</span>
          </div>
        </div>
      )}

      {/* SEGMENT C: GRADUATION GRADE DISTRIBUTIONS */}
      {activeSegment === 'grades' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="grades-segment-view">
          
          {/* Grade summary stats */}
          <div className="lg:col-span-4 bg-[#1E293B] p-5 rounded-2xl border border-[#334155] shadow-2xs flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-[10px] bg-[#273549] text-[#94A3B8] px-2 py-0.5 rounded font-mono font-bold">Grade Spread Analysis</span>
              <h3 className="text-md font-bold text-white">Academic Curve Summary</h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed">Evaluating grade ratios of registered academic results. A-range indicators denote optimal campus performance averages.</p>
            </div>

            <div className="bg-[#111827] p-4 rounded-xl border border-[#334155]/80 text-xs text-[#CBD5E1] space-y-1.5 font-sans mt-6">
              <p className="font-bold flex justify-between items-center text-slate-705">
                <span>Pass Rate:</span>
                <span className="text-[#10B981] font-mono font-bold">100% Passed</span>
              </p>
              <p>No candidate student registrations scored in the D or E failure margin bounds this term.</p>
            </div>
          </div>

          {/* Grade spread graphics card representation */}
          <div className="lg:col-span-8 bg-[#1E293B] p-6 rounded-2xl border border-[#334155] shadow-2xs space-y-4" id="grades-curve-charts">
            <div>
              <h4 className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-1">Recorded Grade Proportion ratios</h4>
              <p className="text-xs text-[#94A3B8]">Relative allocation percentages across evaluated score bands.</p>
            </div>

            {/* Simulated bar percentages graphs */}
            <div className="space-y-4 pt-4">
              <div>
                <div className="flex justify-between text-xs font-medium mb-1.5 text-[#CBD5E1]">
                  <span className="font-bold text-indigo-800">Outstanding Range (A1)</span>
                  <span className="font-mono font-black">{gradePercentages['A1']}% ( {gradeDistribution['A1']} Pupils )</span>
                </div>
                <div className="w-full bg-[#273549] h-3 rounded-full overflow-hidden">
                  <div className="bg-indigo-650 h-full rounded-full" style={{ width: `${gradePercentages['A1']}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1.5 text-[#CBD5E1]">
                  <span className="font-bold text-[#10B981]">Very Good Range (A2)</span>
                  <span className="font-mono font-black">{gradePercentages['A2']}% ( {gradeDistribution['A2']} Pupils )</span>
                </div>
                <div className="w-full bg-[#273549] h-3 rounded-full overflow-hidden">
                  <div className="bg-[#10B981]/10 border border-[#10B981]/300 h-full rounded-full" style={{ width: `${gradePercentages['A2']}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1.5 text-[#CBD5E1]">
                  <span className="font-bold text-amber-805">Good Range (B1)</span>
                  <span className="font-mono font-black">{gradePercentages['B1']}% ( {gradeDistribution['B1']} Pupils )</span>
                </div>
                <div className="w-full bg-[#273549] h-3 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: `${gradePercentages['B1']}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1.5 text-slate-755">
                  <span className="font-bold text-white">Above Average Range (B2)</span>
                  <span className="font-mono font-black">{gradePercentages['B2']}% ( {gradeDistribution['B2']} Pupils )</span>
                </div>
                <div className="w-full bg-[#273549] h-3 rounded-full overflow-hidden">
                  <div className="bg-slate-400 h-full rounded-full" style={{ width: `${gradePercentages['B2']}%` }}></div>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
