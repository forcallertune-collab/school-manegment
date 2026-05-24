import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Calendar, 
  Users, 
  Briefcase, 
  ArrowRight,
  ClipboardCheck,
  Search,
  Check,
  Award,
  Printer,
  Download,
  Crown,
  X
} from 'lucide-react';
import { Student, Staff, AttendanceRecord } from '../types';

interface AttendanceManagerProps {
  students: Student[];
  staff: Staff[];
  attendance: AttendanceRecord[];
  onUpsertAttendance: (date: string, targetId: string, targetType: 'Student' | 'Staff', status: 'Present' | 'Absent' | 'Leave', notes?: string) => void;
  onBatchMarkPresent: (date: string, targetType: 'Student' | 'Staff', targetIds: string[]) => void;
}

export const AttendanceManager: React.FC<AttendanceManagerProps> = ({
  students,
  staff,
  attendance,
  onUpsertAttendance,
  onBatchMarkPresent
}) => {
  // Config state
  const [selectedDate, setSelectedDate] = useState('2026-05-24'); // Default system timeline
  const [targetType, setTargetType] = useState<'Student' | 'Staff'>('Student');
  const [selectedClass, setSelectedClass] = useState('Class 10'); // For students sub-selection
  const [searchQuery, setSearchQuery] = useState('');

  // PDF Report export modal states
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportClass, setExportClass] = useState('Class 10');
  const [exportDate, setExportDate] = useState('2026-05-24');

  // 1. Get filtered list of members
  const activeMembersOrStudents = targetType === 'Student' 
    ? students.filter(s => s.status === 'Active' && s.className === selectedClass)
    : staff;

  // Search filter
  const displayedMembers = activeMembersOrStudents.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 2. Map current attendance statuses
  const attendanceForSelectedDate = attendance.filter(a => a.date === selectedDate && a.targetType === targetType);
  
  const getAttendanceStatus = (id: string): 'Present' | 'Absent' | 'Leave' | 'Unmarked' => {
    const record = attendanceForSelectedDate.find(a => a.targetId === id);
    return record ? record.status : 'Unmarked';
  };

  const getAttendanceNotes = (id: string): string => {
    const record = attendanceForSelectedDate.find(a => a.targetId === id);
    return record?.notes || '';
  };

  // Calculations for current group stats
  const totalInGroup = activeMembersOrStudents.length;
  const presentCount = activeMembersOrStudents.filter(m => getAttendanceStatus(m.id) === 'Present').length;
  const absentCount = activeMembersOrStudents.filter(m => getAttendanceStatus(m.id) === 'Absent').length;
  const leaveCount = activeMembersOrStudents.filter(m => getAttendanceStatus(m.id) === 'Leave').length;
  const unmarkedCount = totalInGroup - (presentCount + absentCount + leaveCount);

  // Export Specific Calculations & Prettifiers
  const getOrdinal = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  };

  const prettifyDateRoyal = (dateStr: string) => {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const year = parts[0];
    const monthNum = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);
    
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return `${day}${getOrdinal(day)} day of ${months[monthNum - 1]}, ${year}`;
  };

  const exportStudents = students.filter(s => s.status === 'Active' && s.className === exportClass);
  const exportAttendanceForDate = attendance.filter(a => a.date === exportDate && a.targetType === 'Student');

  const getExportStudentStatus = (id: string): 'Present' | 'Absent' | 'Leave' | 'Unmarked' => {
    const record = exportAttendanceForDate.find(a => a.targetId === id);
    return record ? record.status : 'Unmarked';
  };

  const getExportStudentNotes = (id: string): string => {
    const record = exportAttendanceForDate.find(a => a.targetId === id);
    return record?.notes || '';
  };

  const totalInExport = exportStudents.length;
  const exportPresentCount = exportStudents.filter(s => getExportStudentStatus(s.id) === 'Present').length;
  const exportAbsentCount = exportStudents.filter(s => getExportStudentStatus(s.id) === 'Absent').length;
  const exportLeaveCount = exportStudents.filter(s => getExportStudentStatus(s.id) === 'Leave').length;
  const exportComplianceRate = totalInExport > 0 ? Math.round((exportPresentCount / totalInExport) * 100) : 0;

  // Handle batch marking everything present
  const handleBatchPresent = () => {
    const ids = activeMembersOrStudents.map(m => m.id);
    onBatchMarkPresent(selectedDate, targetType, ids);
  };

  return (
    <div className="space-y-6" id="attendance-manager-container">
      {/* Title Header summary banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl shadow-xs border border-[#ead2a3]/40">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-slate-900 tracking-wide flex items-center gap-2.5 font-display text-[16px] md:text-[20px]">
            <Crown className="text-[#b98d45] w-5.5 h-5.5" />
            ATTENDANCE REGISTRY
          </h1>
          <p className="text-xs text-[#815e26] mt-1 font-serif italic">Review physical presence logs, verify leaves, and endorse official assembly rolls.</p>
        </div>
        
        {/* Interactive action controls */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto shrink-0 justify-start md:justify-end">
          {/* Date Selector input */}
          <div className="flex items-center gap-2 bg-[#faf6eb] border border-[#ead2a3]/60 rounded-xl px-3 py-2 focus-within:border-[#b98d45] transition-all shadow-3xs">
            <Calendar className="w-4 h-4 text-[#815e26]" />
            <input 
              type="date"
              id="attendance-date-picker"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setExportDate(e.target.value);
              }}
              className="text-xs text-[#815e26] font-bold font-mono bg-transparent outline-hidden cursor-pointer"
            />
          </div>

          <button
            type="button"
            id="btn-trigger-pdf-export"
            onClick={() => {
              setExportClass(selectedClass);
              setExportDate(selectedDate);
              setIsExportModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#9e7534] to-[#b98d45] hover:from-[#815e26] hover:to-[#9e7534] text-white font-display font-bold rounded-xl text-xs cursor-pointer transition-all shadow-3xs whitespace-nowrap"
            title="Generate and print bespoke official class register ledger document"
          >
            <Printer className="w-4 h-4 text-[#faf6eb]" />
            <span>Generate Official PDF</span>
          </button>
        </div>
      </div>

      {/* Roster Controls and Overview Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Control pane: switch roles, browse classes, search */}
        <div className="lg:col-span-4 space-y-5 bg-white p-5 rounded-2xl shadow-xs border border-slate-100 flex flex-col justify-between" id="attendance-filters-card">
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Category Selection</h3>
            
            {/* Student vs Staff toggle */}
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
              <button
                id="tab-select-students"
                onClick={() => { setTargetType('Student'); setSearchQuery(''); }}
                className={`py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-all ${targetType === 'Student' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
              >
                <Users className="w-4 h-4" />
                Students
              </button>
              <button
                id="tab-select-staff"
                onClick={() => { setTargetType('Staff'); setSearchQuery(''); }}
                className={`py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-all ${targetType === 'Staff' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
              >
                <Briefcase className="w-4 h-4" />
                Staff / Faculty
              </button>
            </div>

            {/* If Student, show Class Selector */}
            {targetType === 'Student' && (
              <div className="space-y-1.5" id="attendance-class-selection">
                <label className="block text-xs font-bold text-slate-500">Pick Target Grade Roster</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Class 10', 'Class 9', 'Class 8'].map((cls) => (
                    <button
                      key={cls}
                      id={`btn-select-class-${cls.replace(/\s+/g, '-')}`}
                      onClick={() => setSelectedClass(cls)}
                      className={`py-2 text-[11px] font-mono font-bold rounded-lg border transition-all cursor-pointer ${
                        selectedClass === cls 
                          ? 'bg-indigo-50 border-indigo-400 text-indigo-700 font-bold' 
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-100 text-slate-600'
                      }`}
                    >
                      {cls}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Search Input Filter */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input 
                type="text"
                id="attendance-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${targetType.toLowerCase()} by name...`}
                className="w-full bg-slate-50 pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:bg-white focus:border-indigo-500 outline-hidden transition-all text-slate-700 font-medium"
              />
            </div>
          </div>

          {/* Quick Actions Shortcuts */}
          <div className="pt-4 border-t border-slate-50 space-y-3">
            <h4 className="text-xs font-bold text-slate-500">Batch Processing</h4>
            <button
              id="btn-mark-all-present"
              onClick={handleBatchPresent}
              className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              Mark All Unmarked as Present
            </button>
            <p className="text-[10px] text-slate-400 leading-snug">
              This sets all unmarked entries in the currently displayed selection list as **Present** for the selected date.
            </p>
          </div>
        </div>

        {/* Right Pane: Attendance status stats & list of names */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl shadow-xs border border-slate-100 space-y-6" id="attendance-roster-list">
          {/* visual aggregate tracker bar */}
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 grid grid-cols-4 gap-4 text-center">
            <div className="space-y-1">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Total Directory</p>
              <p className="text-xl font-black text-slate-800">{totalInGroup}</p>
            </div>
            <div className="space-y-1 border-l border-slate-200">
              <p className="text-[10px] text-emerald-600 uppercase tracking-wider font-bold">Present ✅</p>
              <p className="text-l font-black text-emerald-700">{presentCount}</p>
            </div>
            <div className="space-y-1 border-l border-slate-200">
              <p className="text-[10px] text-rose-500 uppercase tracking-wider font-bold">Absent ❌</p>
              <p className="text-l font-black text-rose-700">{absentCount}</p>
            </div>
            <div className="space-y-1 border-l border-slate-200">
              <p className="text-[10px] text-amber-500 uppercase tracking-wider font-bold">Ex. Leave ✉️</p>
              <p className="text-l font-black text-amber-700">{leaveCount}</p>
            </div>
          </div>

          {/* Table representing actual names */}
          <div className="rounded-xl border border-slate-100 overflow-hidden">
            <table className="w-full text-left border-collapse" id="attendance-interactive-table">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[11px] text-slate-400 font-mono italic">
                  <th className="p-3">Candidate Reference</th>
                  <th className="p-3">Status Toggle</th>
                  <th className="p-3">Explanatory Memo Draft</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {displayedMembers.map((member) => {
                  const status = getAttendanceStatus(member.id);
                  const notes = getAttendanceNotes(member.id);
                  
                  return (
                    <tr key={member.id} className="hover:bg-slate-50/30 transition-all font-sans" id={`attendance-row-${member.id}`}>
                      {/* Name and info */}
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-1.5 h-6 rounded-full ${
                            status === 'Present' ? 'bg-emerald-500' :
                            status === 'Absent' ? 'bg-rose-500' :
                            status === 'Leave' ? 'bg-amber-500' : 'bg-slate-300'
                          }`}></div>
                          <div>
                            <p className="text-xs font-bold text-slate-800">{member.name}</p>
                            <p className="text-[9px] font-mono text-slate-400">
                              ID: {member.id} {targetType === 'Student' ? `(Roll: ${(member as Student).rollNo})` : `(${(member as Staff).designation})`}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Present/Absent/Leave buttons */}
                      <td className="p-1.5">
                        <div className="flex items-center gap-1.5">
                          {/* Present Badge Action */}
                          <button
                            id={`btn-status-present-${member.id}`}
                            onClick={() => onUpsertAttendance(selectedDate, member.id, targetType, 'Present', notes)}
                            className={`p-1.5 text-[10px] font-bold rounded-lg border transition-all cursor-pointer select-none flex items-center gap-1 ${
                              status === 'Present'
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-xs'
                                : 'bg-white hover:bg-slate-50 border-slate-100 text-slate-400'
                            }`}
                            title="Mark Present"
                          >
                            <CheckCircle2 className={`w-3.5 h-3.5 ${status === 'Present' ? 'text-emerald-600' : 'text-slate-300'}`} />
                            <span className="sr-only sm:not-sr-only">Present</span>
                          </button>

                          {/* Absent Badge Action */}
                          <button
                            id={`btn-status-absent-${member.id}`}
                            onClick={() => onUpsertAttendance(selectedDate, member.id, targetType, 'Absent', notes)}
                            className={`p-1.5 text-[10px] font-bold rounded-lg border transition-all cursor-pointer select-none flex items-center gap-1 ${
                              status === 'Absent'
                                ? 'bg-rose-50 border-rose-300 text-rose-800 shadow-xs'
                                : 'bg-white hover:bg-slate-50 border-slate-100 text-slate-400'
                            }`}
                            title="Mark Absent"
                          >
                            <XCircle className={`w-3.5 h-3.5 ${status === 'Absent' ? 'text-rose-600' : 'text-slate-300'}`} />
                            <span className="sr-only sm:not-sr-only">Absent</span>
                          </button>

                          {/* Leave Badge Action */}
                          <button
                            id={`btn-status-leave-${member.id}`}
                            onClick={() => onUpsertAttendance(selectedDate, member.id, targetType, 'Leave', notes)}
                            className={`p-1.5 text-[10px] font-bold rounded-lg border transition-all cursor-pointer select-none flex items-center gap-1 ${
                              status === 'Leave'
                                ? 'bg-amber-50 border-amber-300 text-amber-800 shadow-xs'
                                : 'bg-white hover:bg-slate-50 border-slate-100 text-slate-400'
                            }`}
                            title="Mark Leave"
                          >
                            <AlertCircle className={`w-3.5 h-3.5 ${status === 'Leave' ? 'text-amber-500' : 'text-slate-300'}`} />
                            <span className="sr-only sm:not-sr-only">Leave</span>
                          </button>
                        </div>
                      </td>

                      {/* Memo notes text field */}
                      <td className="p-3">
                        <input 
                          type="text"
                          id={`memo-note-field-${member.id}`}
                          value={notes}
                          onChange={(e) => onUpsertAttendance(selectedDate, member.id, targetType, status === 'Unmarked' ? 'Present' : status, e.target.value)}
                          placeholder="e.g. Health Leave, late bus"
                          className="w-full bg-slate-50/50 hover:bg-slate-50 focus:bg-white text-[10.5px] font-mono text-slate-700 px-2.5 py-1 rounded-md border border-slate-100 focus:border-indigo-400 outline-hidden transition-all"
                        />
                      </td>
                    </tr>
                  );
                })}

                {displayedMembers.length === 0 && (
                  <tr>
                    <td colSpan={3} className="p-10 text-center text-slate-400 text-xs">
                      No matches located in filtered attendance list. Verify Class assignment or search query.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Dynamic Style Injection for Perfect Browser PDF Export with Gold and Royal Elements */}
      <style>{`
        @media print {
          /* Hide all application chrome, sidebar, other page modules completely */
          body * {
            visibility: hidden !important;
          }
          /* Make sure ONLY the print preview container is visible and styled properly */
          #attendance-report-print-area, #attendance-report-print-area * {
            visibility: visible !important;
          }
          /* Absolute layout control for the printed area */
          #attendance-report-print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            border: 6px double #cca561 !important;
            padding: 30px !important;
            margin: 0 !important;
            box-shadow: none !important;
            background-color: white !important;
            color: black !important;
          }
          /* Print page setup config */
          @page {
            size: portrait;
            margin: 12mm;
          }
          /* Force Chrome and Safari to render background graphics */
          body {
            background-color: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      {/* 4. PREMIUM PRINT / SAVE AS PDF PREVIEW MODAL */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in" id="export-pdf-modal">
          <div className="bg-[#faf6eb] border-2 border-[#ead2a3] rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Control Header (Gold/Navy Royal Theme) */}
            <div className="bg-gradient-to-r from-[#0d1b3e] to-[#070e24] p-5 text-white flex justify-between items-center border-b border-[#cca561] shrink-0">
              <div className="flex items-center gap-2.5">
                <Crown className="w-5 h-5 text-[#dfbf85]" />
                <div className="text-left">
                  <h3 className="font-display font-medium text-xs md:text-sm tracking-wider uppercase text-[#dfbf85]">Imperial Council Registry Export</h3>
                  <p className="text-[10px] text-[#ead2a3]/80 italic font-serif">Configure cohort registry reports and materialize certified vector documents</p>
                </div>
              </div>
              <button 
                onClick={() => setIsExportModalOpen(false)} 
                className="p-1.5 hover:bg-white/10 rounded-full text-[#ead2a3] hover:text-white transition-colors cursor-pointer"
                title="Dismiss export chamber"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Config & Preview Dual Split Panel */}
            <div className="flex-1 overflow-y-auto p-5 md:p-8 space-y-6">
              
              {/* Configuration Inputs Section */}
              <div className="bg-white p-5 rounded-3xl border border-[#ead2a3]/45 shadow-3xs grid grid-cols-1 md:grid-cols-2 gap-4" id="export-chamber-config">
                {/* Cohort input selection */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-[#815e26] font-display">Target Class Academic Cohort</label>
                  <select 
                    id="export-class-dropdown"
                    value={exportClass}
                    onChange={(e) => setExportClass(e.target.value)}
                    className="w-full bg-[#faf6eb]/50 hover:bg-[#faf6eb] text-slate-800 text-xs font-bold font-display px-3 py-2.5 rounded-xl border border-[#ead2a3]/50 focus:border-[#b98d45] outline-hidden cursor-pointer shadow-3xs transition-colors"
                  >
                    <option value="Class 10">Class 10 (Senior Tier-A)</option>
                    <option value="Class 9">Class 9 (Intermediate Tier-B)</option>
                    <option value="Class 8">Class 8 (Junior Tier-C)</option>
                  </select>
                </div>

                {/* Date input selection */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-[#815e26] font-display">Logbook Record Calendar Date</label>
                  <input 
                    type="date"
                    id="export-date-picker"
                    value={exportDate}
                    onChange={(e) => setExportDate(e.target.value)}
                    className="w-full bg-[#faf6eb]/50 hover:bg-[#faf6eb] text-slate-800 text-xs font-bold font-mono px-3 py-2 rounded-xl border border-[#ead2a3]/50 focus:border-[#b98d45] outline-hidden cursor-pointer shadow-3xs transition-colors"
                  />
                </div>
              </div>

              {/* Master Document Label */}
              <div className="flex justify-between items-center px-1">
                <span className="text-[10px] font-bold text-[#815e26] uppercase tracking-[0.12em] font-display">Official Certified Registry Scroll Preview</span>
                <span className="text-[10px] text-[#9e7534] italic font-serif">Changes propagate to the ledger scroll instantly</span>
              </div>

              {/* IMMERSIVE SCROLL REGISTRY PREVIEW */}
              <div 
                id="attendance-report-print-area" 
                className="bg-white p-8 md:p-12 border-8 border-double border-[#cca561] shadow-md rounded-3xl relative overflow-hidden text-slate-900 font-sans mx-auto max-w-2xl bg-[radial-gradient(#faf6eb_1px,transparent_1px)] bg-[size:16px_16px]"
              >
                {/* Vintage Crest Background Accent */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
                  <Crown className="w-80 h-80 text-[#b98d45]" />
                </div>

                <div className="relative z-10 space-y-6">
                  {/* Ledger Header */}
                  <div className="text-center space-y-1.5 pb-5 border-b-2 border-slate-100">
                    <div className="flex justify-center mb-1">
                      <div className="p-2 border border-[#ead2a3] bg-[#faf6eb] rounded-full">
                        <Crown className="w-6 h-6 text-[#b98d45]" />
                      </div>
                    </div>
                    <p className="text-[9px] uppercase tracking-[0.25em] font-bold font-display text-[#815e26]">THE CHANCELLOR’S IMPERIAL DECREE</p>
                    <h2 className="text-lg md:text-xl font-black font-serif text-[#0d1b3e] tracking-wide uppercase">EDUQUBE IMPERIAL SEMINARY</h2>
                    <p className="text-[9.5px] font-semibold text-slate-505 max-w-lg mx-auto tracking-wider uppercase">
                      Official Roll of Cohort Assembly Record & Royal Compliance Manifest
                    </p>
                  </div>

                  {/* Document Metadata Grid */}
                  <div className="grid grid-cols-2 gap-4 text-[10px] py-3 border-b border-dashed border-[#ead2a3]/60 uppercase font-mono tracking-wider font-semibold">
                    <div className="space-y-1 text-left">
                      <p className="text-slate-400 text-[8.5px] lowercase italic">Academic Cohort Class:</p>
                      <p className="text-[#815e26] font-bold font-display text-[11px] tracking-wide">{exportClass}</p>
                    </div>
                    <div className="space-y-1 text-left">
                      <p className="text-slate-400 text-[8.5px] lowercase italic">Registry Logbook Date:</p>
                      <p className="text-slate-800 font-bold text-[10.5px]">{exportDate ? prettifyDateRoyal(exportDate) : 'Not Specified'}</p>
                    </div>
                    <div className="space-y-1 text-left">
                      <p className="text-slate-400 text-[8.5px] lowercase italic">Chamber Officer Incharge:</p>
                      <p className="text-slate-800 font-display text-[10.5px]">CHANCELLOR ADVISER</p>
                    </div>
                    <div className="space-y-1 text-left">
                      <p className="text-slate-400 text-[8.5px] lowercase italic">Verification Stamp Signum:</p>
                      <p className="text-[#b98d45] font-semibold font-display text-[10.5px]">APPROVED ACADEMIC REGISTER</p>
                    </div>
                  </div>

                  {/* Analytical Cohort Performance Summary Indicators */}
                  <div className="bg-[#faf6eb]/75 p-4 rounded-2xl border border-[#ead2a3]/45 grid grid-cols-4 gap-2 text-center text-xs">
                    <div className="space-y-1">
                      <p className="text-[8px] text-[#815e26] font-bold tracking-wider font-display uppercase">Cohort Roll</p>
                      <p className="text-base font-black text-slate-800 font-mono">{totalInExport}</p>
                    </div>
                    <div className="space-y-1 border-l border-[#ead2a3]/30">
                      <p className="text-[8px] text-emerald-700 font-bold tracking-wider font-display uppercase">Present ✅</p>
                      <p className="text-base font-black text-emerald-800 font-mono">{exportPresentCount}</p>
                    </div>
                    <div className="space-y-1 border-l border-[#ead2a3]/30">
                      <p className="text-[8px] text-rose-600 font-bold tracking-wider font-display uppercase">Absent ❌</p>
                      <p className="text-base font-black text-rose-800 font-mono">{exportAbsentCount}</p>
                    </div>
                    <div className="space-y-1 border-l border-[#ead2a3]/30 font-display">
                      <p className="text-[8px] text-[#b98d45] font-bold tracking-wider uppercase">Compliance %</p>
                      <p className="text-base font-black text-[#815e26] font-mono">{exportComplianceRate}%</p>
                    </div>
                  </div>

                  {/* High Quality Minimal Printable Ledger Grid */}
                  <div className="border border-[#ead2a3]/40 rounded-xl overflow-hidden shadow-3xs">
                    <table className="w-full text-left border-collapse text-[10px] md:text-[11px]">
                      <thead>
                        <tr className="bg-[#faf6eb]/60 border-b border-[#ead2a3]/30 text-[9px] text-[#815e26] font-display uppercase tracking-wider">
                          <th className="p-2.5">Roll / Scholar Name</th>
                          <th className="p-2.5 text-center">Status Index</th>
                          <th className="p-2.5">Official Remarks Log</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-sans">
                        {exportStudents.map((stud) => {
                          const sStatus = getExportStudentStatus(stud.id);
                          const sNotes = getExportStudentNotes(stud.id);

                          return (
                            <tr key={stud.id} className="hover:bg-slate-50/50">
                              <td className="p-2.5 text-left">
                                <p className="font-bold text-slate-800 text-[11px]">{stud.name}</p>
                                <p className="text-[8.5px] text-slate-400 font-mono uppercase">Id: {stud.id} • Roll: {stud.rollNo}</p>
                              </td>
                              <td className="p-2.5 text-center">
                                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[8.5px] font-bold tracking-wide font-display ${
                                  sStatus === 'Present' ? 'bg-emerald-50 text-emerald-850 border border-emerald-200' :
                                  sStatus === 'Absent' ? 'bg-rose-50 text-rose-850 border border-rose-200' :
                                  sStatus === 'Leave' ? 'bg-[#fffaeb] text-amber-850 border border-amber-200' :
                                  'bg-slate-50 text-slate-400 border border-slate-200 border-dashed'
                                }`}>
                                  {sStatus === 'Unmarked' ? 'UNMARKED' : sStatus.toUpperCase()}
                                </span>
                              </td>
                              <td className="p-2.5 italic text-slate-600 font-serif text-[10px] text-left">
                                {sNotes || <span className="text-slate-300 font-mono tracking-wider">—</span>}
                              </td>
                            </tr>
                          );
                        })}

                        {exportStudents.length === 0 && (
                          <tr>
                            <td colSpan={3} className="p-8 text-center text-slate-400 text-xs italic">
                              No active scholar matriculations found registered under {exportClass}.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Certified Authenticity seals, signatures, and monogram footer */}
                  <div className="pt-6 border-t border-slate-150 space-y-5">
                    <p className="text-[9px] italic text-[#815e26] text-center font-serif leading-relaxed px-4">
                      "I hereby certify and warrant that this cohort registry record represents accurate attendance logs and compliance status under imperial council regulations."
                    </p>

                    {/* Signatures & Seal Split Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center pt-2">
                      {/* Signature left */}
                      <div className="md:col-span-5 text-center space-y-1 border-t border-slate-200 pt-1.5 font-display">
                        <p className="text-[#815e26] font-serif text-sm italic font-semibold leading-none">A. K. Shastri</p>
                        <p className="text-[8px] text-slate-400 tracking-wider uppercase font-semibold">Chancellor Dean of Seminary</p>
                      </div>

                      {/* Official seal image center */}
                      <div className="md:col-span-2 flex justify-center">
                        <div className="relative w-11 h-11 flex items-center justify-center bg-gradient-to-br from-[#b98d45] to-[#815e26] rounded-full shadow-md text-white border-2 border-[#faf6eb] shrink-0 outline-2 outline-[#b98d45] outline-dashed">
                          <Crown className="w-4.5 h-4.5 animate-pulse" />
                        </div>
                      </div>

                      {/* Signature right */}
                      <div className="md:col-span-5 text-center space-y-1 border-t border-slate-200 pt-1.5 font-display">
                        <p className="text-slate-800 font-mono text-[10px] font-bold leading-none">VERIFIED LEDGER ENTRY</p>
                        <p className="text-[8px] text-slate-400 tracking-wider uppercase font-semibold">Council Registrar Secretariat</p>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

            </div>

            {/* Bottom Modal Controller Footer */}
            <div className="bg-[#f5eedc] border-t border-[#ead2a3] p-4 flex flex-wrap gap-2.5 justify-end items-center shrink-0">
              <button
                type="button"
                onClick={() => setIsExportModalOpen(false)}
                className="px-4.5 py-2 bg-white hover:bg-[#faf6eb] border border-[#ead2a3]/65 text-[#815e26] font-display font-semibold rounded-xl text-xs cursor-pointer transition-all active:scale-95 shadow-3xs"
              >
                Cancel & Close Preview
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-6 py-2 bg-gradient-to-r from-[#9e7534] to-[#b98d45] hover:from-[#815e26] hover:to-[#9e7534] text-white font-display font-medium rounded-xl text-xs cursor-pointer transition-all shadow-sm active:scale-95"
              >
                <Printer className="w-4 h-4 text-white" />
                <span>Print or Save PDF report</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
