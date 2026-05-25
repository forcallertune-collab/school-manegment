import React, { useState, useEffect } from 'react';
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
  X,
  Fingerprint,
  Wifi,
  WifiOff,
  RefreshCw,
  UploadCloud
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

  // Biometric integration states
  const [bioStatus, setBioStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [isScanning, setIsScanning] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [scanMessage, setScanMessage] = useState<{ text: string, type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    checkBioDeviceStatus();
  }, []);

  const checkBioDeviceStatus = async () => {
    setBioStatus('checking');
    try {
      const res = await fetch('/api/biometry/device-status');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.device.status === 'online') {
          setBioStatus('online');
        } else {
          setBioStatus('offline');
        }
      } else {
        setBioStatus('offline');
      }
    } catch (err) {
      setBioStatus('offline');
    }
  };

  const showScanAlert = (text: string, type: 'success' | 'error' | 'info') => {
    setScanMessage({ text, type });
    setTimeout(() => setScanMessage(null), 5000);
  };

  const handleBioScan = async () => {
    setIsScanning(true);
    try {
      // Simulate hardware trigger
      const payload = { templateData: '0xABC123FINGERPRINT_TEMPLATE', deviceLocation: 'Terminal 1' };
      const res = await fetch('/api/biometry/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (res.ok && data.success && data.matchFound) {
        // Find matching student/staff in local arrays to verify they exist in this school DB
        const isTargetStudent = data.role === 'student';
        const personList = isTargetStudent ? students : staff;
        // Since students array only has Student type from types.ts, cast to any or use explicit check
        const person = (personList as any[]).find(p => p.id === data.userId);

        if (person) {
          onUpsertAttendance(
            selectedDate, 
            person.id, 
            isTargetStudent ? 'Student' : 'Staff', 
            'Present', 
            `Biometric Auth @ ${new Date(data.scanTime).toLocaleTimeString()}`
          );
          showScanAlert(`Verified: ${person.name} (${data.userId}) marked Present.`, 'success');
        } else {
          showScanAlert(`Match found for ID ${data.userId}, but person not found in database.`, 'error');
        }
      } else {
        showScanAlert('Fingerprint unrecognized. Please try again.', 'error');
      }
    } catch (err) {
      showScanAlert('Connection to secure biometric service failed.', 'error');
      setBioStatus('offline');
    } finally {
      setIsScanning(false);
    }
  };

  const handleSyncLogs = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/biometry/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId: 'BIO-X-900', offlineLogs: [1, 2, 3] })
      });
      const data = await res.json();
      if (res.ok && data.success) {
         showScanAlert(`Successfully synced ${data.syncedCount} offline biometric logs.`, 'info');
      } else {
         showScanAlert('Failed to sync offline logs.', 'error');
      }
    } catch (err) {
      showScanAlert('Network error during offline sync.', 'error');
      setBioStatus('offline');
    } finally {
      setIsSyncing(false);
    }
  };

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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#1E293B] p-6 rounded-3xl shadow-lg shadow-black/20 border border-[#334155]/40">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-white tracking-wide flex items-center gap-2.5 font-sans text-[16px] md:text-[20px]">
            <Crown className="text-[#2563EB] w-5.5 h-5.5" />
            ATTENDANCE REGISTRY
          </h1>
          <p className="text-xs text-white mt-1 font-serif ">Review physical presence logs, verify leaves, and endorse official assembly rolls.</p>
        </div>
        
        {/* Interactive action controls */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto shrink-0 justify-start md:justify-end">
          {/* Date Selector input */}
          <div className="flex items-center gap-2 bg-[#1E293B] border border-[#334155]/60 rounded-xl px-3 py-2 focus-within:border-[#2563EB] transition-all shadow-3xs">
            <Calendar className="w-4 h-4 text-white" />
            <input 
              type="date"
              id="attendance-date-picker"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setExportDate(e.target.value);
              }}
              className="text-xs text-white font-bold font-mono bg-transparent outline-hidden cursor-pointer"
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
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#2563EB] to-[#2563EB] hover:from-[#94A3B8] hover:to-[#2563EB] text-white font-sans font-bold rounded-xl text-xs cursor-pointer transition-all shadow-3xs whitespace-nowrap"
            title="Generate and print bespoke official class register ledger document"
          >
            <Printer className="w-4 h-4 text-white" />
            <span>Generate Official PDF</span>
          </button>
        </div>
      </div>

      {/* Roster Controls and Overview Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Control pane: switch roles, browse classes, search */}
        <div className="lg:col-span-4 space-y-5 bg-[#1E293B] p-5 rounded-2xl shadow-lg shadow-black/20 border border-[#334155] flex flex-col justify-between" id="attendance-filters-card">
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-2">Category Selection</h3>
            
            {/* Student vs Staff toggle */}
            <div className="grid grid-cols-2 gap-2 bg-[#273549] p-1 rounded-xl">
              <button
                id="tab-select-students"
                onClick={() => { setTargetType('Student'); setSearchQuery(''); }}
                className={`py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-all ${targetType === 'Student' ? 'bg-[#1E293B] text-[#10B981] shadow-lg shadow-black/20' : 'text-[#94A3B8] hover:text-white'}`}
              >
                <Users className="w-4 h-4" />
                Students
              </button>
              <button
                id="tab-select-staff"
                onClick={() => { setTargetType('Staff'); setSearchQuery(''); }}
                className={`py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-all ${targetType === 'Staff' ? 'bg-[#1E293B] text-[#10B981] shadow-lg shadow-black/20' : 'text-[#94A3B8] hover:text-white'}`}
              >
                <Briefcase className="w-4 h-4" />
                Staff / Faculty
              </button>
            </div>

            {/* If Student, show Class Selector */}
            {targetType === 'Student' && (
              <div className="space-y-1.5" id="attendance-class-selection">
                <label className="block text-xs font-bold text-[#94A3B8]">Pick Target Grade Roster</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Class 10', 'Class 9', 'Class 8'].map((cls) => (
                    <button
                      key={cls}
                      id={`btn-select-class-${cls.replace(/\s+/g, '-')}`}
                      onClick={() => setSelectedClass(cls)}
                      className={`py-2 text-[11px] font-mono font-bold rounded-lg border transition-all cursor-pointer ${
                        selectedClass === cls 
                          ? 'bg-[#2563EB]/10 border border-[#2563EB]/30 border-indigo-400 text-[#38BDF8] font-bold' 
                          : 'bg-[#111827] hover:bg-[#273549] border-[#334155] text-[#CBD5E1]'
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
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#94A3B8]" />
              <input 
                type="text"
                id="attendance-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${targetType.toLowerCase()} by name...`}
                className="w-full bg-[#111827] pl-9 pr-3 py-2 text-xs rounded-lg border border-[#334155] focus:bg-[#1E293B] focus:border-indigo-500 outline-hidden transition-all text-[#CBD5E1] font-medium"
              />
            </div>
          </div>

          {/* Quick Actions Shortcuts */}
          <div className="pt-4 border-t border-slate-50 space-y-3">
            <h4 className="text-xs font-bold text-[#94A3B8]">Batch Processing</h4>
            <button
              id="btn-mark-all-present"
              onClick={handleBatchPresent}
              className="w-full py-2 bg-[#10B981]/10 border border-[#10B981]/30 hover:bg-[#10B981]/20 border border-emerald-200 text-[#10B981] text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              Mark All Unmarked as Present
            </button>
            <p className="text-[10px] text-[#94A3B8] leading-snug mb-4">
              This sets all unmarked entries in the currently displayed selection list as **Present** for the selected date.
            </p>

            <h4 className="text-xs font-bold text-[#94A3B8] mt-4 border-t border-[#334155] pt-4">Biometric Hardware Link</h4>
            
            <div className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 text-center transition-all ${bioStatus === 'online' ? 'bg-[#2563EB]/10 border border-[#2563EB]/30/50 border-indigo-200' : 'bg-[#111827] border-[#334155]'}`}>
              <div className="flex items-center gap-2 mb-1 text-[10px] font-mono tracking-wider font-bold">
                {bioStatus === 'checking' && <span className="text-[#94A3B8]">CHECKING DEVICE...</span>}
                {bioStatus === 'online' && <><Wifi className="w-3.5 h-3.5 text-indigo-500" /> <span className="text-[#2563EB]">DEVICE ONLINE: BIO-X-900</span></>}
                {bioStatus === 'offline' && <><WifiOff className="w-3.5 h-3.5 text-[#94A3B8]" /> <span className="text-[#94A3B8]">DEVICE OFFLINE</span></>}
              </div>

              <button
                onClick={handleBioScan}
                disabled={bioStatus !== 'online' || isScanning}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 text-white text-[11px] uppercase tracking-wide font-bold rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isScanning ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-indigo-200" />
                ) : (
                  <Fingerprint className="w-4 h-4 text-indigo-100" />
                )}
                {isScanning ? 'Processing Scan...' : 'Trigger Biometric Scan'}
              </button>

              <button
                onClick={handleSyncLogs}
                disabled={bioStatus !== 'online' || isSyncing}
                className="w-full py-2 bg-[#1E293B] hover:bg-[#111827] border border-[#334155] text-[#CBD5E1] text-[10px] uppercase font-bold rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                 {isSyncing ? <RefreshCw className="w-3 h-3 animate-spin text-[#94A3B8]" /> : <UploadCloud className="w-3 h-3 text-[#94A3B8]" />}
                 Sync Offline Scanner Logs
              </button>

              {scanMessage && (
                <div className={`mt-2 p-2.5 rounded-lg w-full text-[10.5px] text-left leading-tight font-medium ${
                  scanMessage.type === 'success' ? 'bg-[#10B981]/20 text-emerald-850 border border-emerald-200' :
                  scanMessage.type === 'error' ? 'bg-rose-100 text-rose-850 border border-rose-200' :
                  'bg-[#2563EB]/20 text-indigo-850 border border-indigo-200'
                }`}>
                  {scanMessage.text}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Right Pane: Attendance status stats & list of names */}
        <div className="lg:col-span-8 bg-[#1E293B] p-6 rounded-2xl shadow-lg shadow-black/20 border border-[#334155] space-y-6" id="attendance-roster-list">
          {/* visual aggregate tracker bar */}
          <div className="p-4 bg-[#111827]/80 rounded-2xl border border-[#334155] grid grid-cols-4 gap-4 text-center">
            <div className="space-y-1">
              <p className="text-[10px] text-[#94A3B8] uppercase tracking-wider font-bold">Total Directory</p>
              <p className="text-xl font-black text-white">{totalInGroup}</p>
            </div>
            <div className="space-y-1 border-l border-[#334155]">
              <p className="text-[10px] text-[#10B981] uppercase tracking-wider font-bold">Present ✅</p>
              <p className="text-l font-black text-[#10B981]">{presentCount}</p>
            </div>
            <div className="space-y-1 border-l border-[#334155]">
              <p className="text-[10px] text-rose-500 uppercase tracking-wider font-bold">Absent ❌</p>
              <p className="text-l font-black text-rose-700">{absentCount}</p>
            </div>
            <div className="space-y-1 border-l border-[#334155]">
              <p className="text-[10px] text-amber-500 uppercase tracking-wider font-bold">Ex. Leave ✉️</p>
              <p className="text-l font-black text-[#F59E0B]">{leaveCount}</p>
            </div>
          </div>

          {/* Table representing actual names */}
          <div className="rounded-xl border border-[#334155] overflow-hidden">
            <table className="w-full text-left border-collapse" id="attendance-interactive-table">
              <thead>
                <tr className="bg-[#111827] border-b border-[#334155] text-[11px] text-[#94A3B8] font-mono ">
                  <th className="p-3">Candidate Reference</th>
                  <th className="p-3">Status Toggle</th>
                  <th className="p-3">Explanatory Memo Draft</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#334155]">
                {displayedMembers.map((member) => {
                  const status = getAttendanceStatus(member.id);
                  const notes = getAttendanceNotes(member.id);
                  
                  return (
                    <tr key={member.id} className="hover:bg-[#111827]/30 transition-all font-sans" id={`attendance-row-${member.id}`}>
                      {/* Name and info */}
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-1.5 h-6 rounded-full ${
                            status === 'Present' ? 'bg-[#10B981]/10 border border-[#10B981]/300' :
                            status === 'Absent' ? 'bg-[#EF4444]/10 border border-[#EF4444]/300' :
                            status === 'Leave' ? 'bg-[#F59E0B]/10 border border-[#F59E0B]/300' : 'bg-slate-300'
                          }`}></div>
                          <div>
                            <p className="text-xs font-bold text-white">{member.name}</p>
                            <p className="text-[9px] font-mono text-[#94A3B8]">
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
                                ? 'bg-[#10B981]/10 border border-[#10B981]/30 border-emerald-300 text-[#10B981] shadow-lg shadow-black/20'
                                : 'bg-[#1E293B] hover:bg-[#111827] border-[#334155] text-[#94A3B8]'
                            }`}
                            title="Mark Present"
                          >
                            <CheckCircle2 className={`w-3.5 h-3.5 ${status === 'Present' ? 'text-[#10B981]' : 'text-slate-300'}`} />
                            <span className="sr-only sm:not-sr-only">Present</span>
                          </button>

                          {/* Absent Badge Action */}
                          <button
                            id={`btn-status-absent-${member.id}`}
                            onClick={() => onUpsertAttendance(selectedDate, member.id, targetType, 'Absent', notes)}
                            className={`p-1.5 text-[10px] font-bold rounded-lg border transition-all cursor-pointer select-none flex items-center gap-1 ${
                              status === 'Absent'
                                ? 'bg-[#EF4444]/10 border border-[#EF4444]/30 border-rose-300 text-[#EF4444] shadow-lg shadow-black/20'
                                : 'bg-[#1E293B] hover:bg-[#111827] border-[#334155] text-[#94A3B8]'
                            }`}
                            title="Mark Absent"
                          >
                            <XCircle className={`w-3.5 h-3.5 ${status === 'Absent' ? 'text-[#EF4444]' : 'text-slate-300'}`} />
                            <span className="sr-only sm:not-sr-only">Absent</span>
                          </button>

                          {/* Leave Badge Action */}
                          <button
                            id={`btn-status-leave-${member.id}`}
                            onClick={() => onUpsertAttendance(selectedDate, member.id, targetType, 'Leave', notes)}
                            className={`p-1.5 text-[10px] font-bold rounded-lg border transition-all cursor-pointer select-none flex items-center gap-1 ${
                              status === 'Leave'
                                ? 'bg-[#F59E0B]/10 border border-[#F59E0B]/30 border-amber-300 text-[#F59E0B] shadow-lg shadow-black/20'
                                : 'bg-[#1E293B] hover:bg-[#111827] border-[#334155] text-[#94A3B8]'
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
                          className="w-full bg-[#111827] hover:bg-[#111827] focus:bg-[#1E293B] text-[10.5px] font-mono text-[#CBD5E1] px-2.5 py-1 rounded-md border border-[#334155] focus:border-indigo-400 outline-hidden transition-all"
                        />
                      </td>
                    </tr>
                  );
                })}

                {displayedMembers.length === 0 && (
                  <tr>
                    <td colSpan={3} className="p-10 text-center text-[#94A3B8] text-xs">
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
            border: 6px double #38BDF8 !important;
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
          <div className="bg-[#1E293B] border-2 border-[#334155] rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Control Header (Gold/Navy Royal Theme) */}
            <div className="bg-gradient-to-r from-[#111827] to-[#0B1120] p-5 text-white flex justify-between items-center border-b border-[#38BDF8] shrink-0">
              <div className="flex items-center gap-2.5">
                <Crown className="w-5 h-5 text-[#38BDF8]" />
                <div className="text-left">
                  <h3 className="font-sans font-medium text-xs md:text-sm tracking-wider uppercase text-[#38BDF8]">Imperial Council Registry Export</h3>
                  <p className="text-[10px] text-[#38BDF8]/80  font-serif">Configure cohort registry reports and materialize certified vector documents</p>
                </div>
              </div>
              <button 
                onClick={() => setIsExportModalOpen(false)} 
                className="p-1.5 hover:bg-[#1E293B]/10 rounded-full text-[#38BDF8] hover:text-white transition-colors cursor-pointer"
                title="Dismiss export chamber"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Config & Preview Dual Split Panel */}
            <div className="flex-1 overflow-y-auto p-5 md:p-8 space-y-6">
              
              {/* Configuration Inputs Section */}
              <div className="bg-[#1E293B] p-5 rounded-3xl border border-[#334155]/45 shadow-3xs grid grid-cols-1 md:grid-cols-2 gap-4" id="export-chamber-config">
                {/* Cohort input selection */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-white font-sans">Target Class Academic Cohort</label>
                  <select 
                    id="export-class-dropdown"
                    value={exportClass}
                    onChange={(e) => setExportClass(e.target.value)}
                    className="w-full bg-[#1E293B]/50 hover:bg-[#1E293B] text-white text-xs font-bold font-sans px-3 py-2.5 rounded-xl border border-[#334155]/50 focus:border-[#2563EB] outline-hidden cursor-pointer shadow-3xs transition-colors"
                  >
                    <option value="Class 10">Class 10 (Senior Tier-A)</option>
                    <option value="Class 9">Class 9 (Intermediate Tier-B)</option>
                    <option value="Class 8">Class 8 (Junior Tier-C)</option>
                  </select>
                </div>

                {/* Date input selection */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-white font-sans">Logbook Record Calendar Date</label>
                  <input 
                    type="date"
                    id="export-date-picker"
                    value={exportDate}
                    onChange={(e) => setExportDate(e.target.value)}
                    className="w-full bg-[#1E293B]/50 hover:bg-[#1E293B] text-white text-xs font-bold font-mono px-3 py-2 rounded-xl border border-[#334155]/50 focus:border-[#2563EB] outline-hidden cursor-pointer shadow-3xs transition-colors"
                  />
                </div>
              </div>

              {/* Master Document Label */}
              <div className="flex justify-between items-center px-1">
                <span className="text-[10px] font-bold text-white uppercase tracking-[0.12em] font-sans">Official Certified Registry Scroll Preview</span>
                <span className="text-[10px] text-[#2563EB]  font-serif">Changes propagate to the ledger scroll instantly</span>
              </div>

              {/* IMMERSIVE SCROLL REGISTRY PREVIEW */}
              <div 
                id="attendance-report-print-area" 
                className="bg-[#1E293B] p-8 md:p-12 border-8 border-double border-[#38BDF8] shadow-md rounded-3xl relative overflow-hidden text-white font-sans mx-auto max-w-2xl bg-[radial-gradient(#1E293B_1px,transparent_1px)] bg-[size:16px_16px]"
              >
                {/* Vintage Crest Background Accent */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
                  <Crown className="w-80 h-80 text-[#2563EB]" />
                </div>

                <div className="relative z-10 space-y-6">
                  {/* Ledger Header */}
                  <div className="text-center space-y-1.5 pb-5 border-b-2 border-[#334155]">
                    <div className="flex justify-center mb-1">
                      <div className="p-2 border border-[#334155] bg-[#1E293B] rounded-full">
                        <Crown className="w-6 h-6 text-[#2563EB]" />
                      </div>
                    </div>
                    <p className="text-[9px] uppercase tracking-[0.25em] font-bold font-sans text-white">THE CHANCELLOR’S IMPERIAL DECREE</p>
                    <h2 className="text-lg md:text-xl font-black font-serif text-[#111827] tracking-wide uppercase">EDUQUBE IMPERIAL SEMINARY</h2>
                    <p className="text-[9.5px] font-semibold text-slate-505 max-w-lg mx-auto tracking-wider uppercase">
                      Official Roll of Cohort Assembly Record & Royal Compliance Manifest
                    </p>
                  </div>

                  {/* Document Metadata Grid */}
                  <div className="grid grid-cols-2 gap-4 text-[10px] py-3 border-b border-dashed border-[#334155]/60 uppercase font-mono tracking-wider font-semibold">
                    <div className="space-y-1 text-left">
                      <p className="text-[#94A3B8] text-[8.5px] lowercase ">Academic Cohort Class:</p>
                      <p className="text-white font-bold font-sans text-[11px] tracking-wide">{exportClass}</p>
                    </div>
                    <div className="space-y-1 text-left">
                      <p className="text-[#94A3B8] text-[8.5px] lowercase ">Registry Logbook Date:</p>
                      <p className="text-white font-bold text-[10.5px]">{exportDate ? prettifyDateRoyal(exportDate) : 'Not Specified'}</p>
                    </div>
                    <div className="space-y-1 text-left">
                      <p className="text-[#94A3B8] text-[8.5px] lowercase ">Chamber Officer Incharge:</p>
                      <p className="text-white font-sans text-[10.5px]">CHANCELLOR ADVISER</p>
                    </div>
                    <div className="space-y-1 text-left">
                      <p className="text-[#94A3B8] text-[8.5px] lowercase ">Verification Stamp Signum:</p>
                      <p className="text-[#2563EB] font-semibold font-sans text-[10.5px]">APPROVED ACADEMIC REGISTER</p>
                    </div>
                  </div>

                  {/* Analytical Cohort Performance Summary Indicators */}
                  <div className="bg-[#1E293B]/75 p-4 rounded-2xl border border-[#334155]/45 grid grid-cols-4 gap-2 text-center text-xs">
                    <div className="space-y-1">
                      <p className="text-[8px] text-white font-bold tracking-wider font-sans uppercase">Cohort Roll</p>
                      <p className="text-base font-black text-white font-mono">{totalInExport}</p>
                    </div>
                    <div className="space-y-1 border-l border-[#334155]/30">
                      <p className="text-[8px] text-[#10B981] font-bold tracking-wider font-sans uppercase">Present ✅</p>
                      <p className="text-base font-black text-[#10B981] font-mono">{exportPresentCount}</p>
                    </div>
                    <div className="space-y-1 border-l border-[#334155]/30">
                      <p className="text-[8px] text-[#EF4444] font-bold tracking-wider font-sans uppercase">Absent ❌</p>
                      <p className="text-base font-black text-[#EF4444] font-mono">{exportAbsentCount}</p>
                    </div>
                    <div className="space-y-1 border-l border-[#334155]/30 font-sans">
                      <p className="text-[8px] text-[#2563EB] font-bold tracking-wider uppercase">Compliance %</p>
                      <p className="text-base font-black text-white font-mono">{exportComplianceRate}%</p>
                    </div>
                  </div>

                  {/* High Quality Minimal Printable Ledger Grid */}
                  <div className="border border-[#334155]/40 rounded-xl overflow-hidden shadow-3xs">
                    <table className="w-full text-left border-collapse text-[10px] md:text-[11px]">
                      <thead>
                        <tr className="bg-[#1E293B]/60 border-b border-[#334155]/30 text-[9px] text-white font-sans uppercase tracking-wider">
                          <th className="p-2.5">Roll / Scholar Name</th>
                          <th className="p-2.5 text-center">Status Index</th>
                          <th className="p-2.5">Official Remarks Log</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#334155] font-sans">
                        {exportStudents.map((stud) => {
                          const sStatus = getExportStudentStatus(stud.id);
                          const sNotes = getExportStudentNotes(stud.id);

                          return (
                            <tr key={stud.id} className="hover:bg-[#111827]">
                              <td className="p-2.5 text-left">
                                <p className="font-bold text-white text-[11px]">{stud.name}</p>
                                <p className="text-[8.5px] text-[#94A3B8] font-mono uppercase">Id: {stud.id} • Roll: {stud.rollNo}</p>
                              </td>
                              <td className="p-2.5 text-center">
                                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[8.5px] font-bold tracking-wide font-sans ${
                                  sStatus === 'Present' ? 'bg-[#10B981]/10 border border-[#10B981]/30 text-emerald-850 border border-emerald-200' :
                                  sStatus === 'Absent' ? 'bg-[#EF4444]/10 border border-[#EF4444]/30 text-rose-850 border border-rose-200' :
                                  sStatus === 'Leave' ? 'bg-[#fffaeb] text-amber-850 border border-amber-200' :
                                  'bg-[#111827] text-[#94A3B8] border border-[#334155] border-dashed'
                                }`}>
                                  {sStatus === 'Unmarked' ? 'UNMARKED' : sStatus.toUpperCase()}
                                </span>
                              </td>
                              <td className="p-2.5  text-[#CBD5E1] font-serif text-[10px] text-left">
                                {sNotes || <span className="text-slate-300 font-mono tracking-wider">—</span>}
                              </td>
                            </tr>
                          );
                        })}

                        {exportStudents.length === 0 && (
                          <tr>
                            <td colSpan={3} className="p-8 text-center text-[#94A3B8] text-xs ">
                              No active scholar matriculations found registered under {exportClass}.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Certified Authenticity seals, signatures, and monogram footer */}
                  <div className="pt-6 border-t border-[#334155] space-y-5">
                    <p className="text-[9px]  text-white text-center font-serif leading-relaxed px-4">
                      "I hereby certify and warrant that this cohort registry record represents accurate attendance logs and compliance status under imperial council regulations."
                    </p>

                    {/* Signatures & Seal Split Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center pt-2">
                      {/* Signature left */}
                      <div className="md:col-span-5 text-center space-y-1 border-t border-[#334155] pt-1.5 font-sans">
                        <p className="text-white font-serif text-sm  font-semibold leading-none">A. K. Shastri</p>
                        <p className="text-[8px] text-[#94A3B8] tracking-wider uppercase font-semibold">Chancellor Dean of Seminary</p>
                      </div>

                      {/* Official seal image center */}
                      <div className="md:col-span-2 flex justify-center">
                        <div className="relative w-11 h-11 flex items-center justify-center bg-gradient-to-br from-[#2563EB] to-[#94A3B8] rounded-full shadow-md text-white border-2 border-[#1E293B] shrink-0 outline-2 outline-[#2563EB] outline-dashed">
                          <Crown className="w-4.5 h-4.5 animate-pulse" />
                        </div>
                      </div>

                      {/* Signature right */}
                      <div className="md:col-span-5 text-center space-y-1 border-t border-[#334155] pt-1.5 font-sans">
                        <p className="text-white font-mono text-[10px] font-bold leading-none">VERIFIED LEDGER ENTRY</p>
                        <p className="text-[8px] text-[#94A3B8] tracking-wider uppercase font-semibold">Council Registrar Secretariat</p>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

            </div>

            {/* Bottom Modal Controller Footer */}
            <div className="bg-[#1E293B] border-t border-[#334155] p-4 flex flex-wrap gap-2.5 justify-end items-center shrink-0">
              <button
                type="button"
                onClick={() => setIsExportModalOpen(false)}
                className="px-4.5 py-2 bg-[#1E293B] hover:bg-[#1E293B] border border-[#334155]/65 text-white font-sans font-semibold rounded-xl text-xs cursor-pointer transition-all active:scale-95 shadow-3xs"
              >
                Cancel & Close Preview
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-6 py-2 bg-gradient-to-r from-[#2563EB] to-[#2563EB] hover:from-[#94A3B8] hover:to-[#2563EB] text-white font-sans font-medium rounded-xl text-xs cursor-pointer transition-all shadow-xl shadow-black/40 active:scale-95"
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
