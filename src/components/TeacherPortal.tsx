import React, { useState } from 'react';
import { 
  Users, 
  Calendar, 
  CheckSquare, 
  BookOpen, 
  Plus, 
  Sparkles, 
  Send, 
  Award, 
  Clock, 
  UserCheck,
  AlertCircle
} from 'lucide-react';
import { Student, Staff, TimetableSlot } from '../types';

interface TeacherPortalProps {
  students: Student[];
  staff: Staff[];
  timetable: TimetableSlot[];
  onUpsertAttendance: (
    date: string, 
    targetId: string, 
    targetType: 'Student' | 'Staff', 
    status: 'Present' | 'Absent' | 'Leave', 
    notes?: string
  ) => void;
  onBatchMarkPresent: (date: string, targetType: 'Student' | 'Staff', targetIds: string[]) => void;
}

export const TeacherPortal: React.FC<TeacherPortalProps> = ({ 
  students, 
  staff, 
  timetable,
  onUpsertAttendance,
  onBatchMarkPresent
}) => {
  // Selector for teacher
  const facultyList = staff.filter(s => s.role === 'Teacher');
  const [activeTeacherId, setActiveTeacherId] = useState(facultyList[0]?.id || 'STF001');
  const currentTeacher = facultyList.find(s => s.id === activeTeacherId) || facultyList[0];

  // Selected class for marking attendance
  const [selectedClassForPeriod, setSelectedClassForPeriod] = useState('Class 10');
  const classStudents = students.filter(s => s.className === selectedClassForPeriod && s.status === 'Active');

  // Interactive attendance status tracking
  const [markedRecords, setMarkedRecords] = useState<Record<string, 'Present' | 'Absent' | 'Leave'>>({});
  const [attendanceDate, setAttendanceDate] = useState('2026-05-24');

  // Manual Assignment Distribution States
  const [assignments, setAssignments] = useState([
    { id: '1', className: 'Class 10', subject: 'Physics', title: 'Electrostatics exercise 4.1 & 4.2 definitions sheet', date: '24-05-2026', deadline: '30-05-2026', totalSubmissions: 12 },
    { id: '2', className: 'Class 9', subject: 'Mathematics', title: 'Quadratic Equations conceptual proofs document', date: '23-05-2026', deadline: '28-05-2026', totalSubmissions: 8 }
  ]);
  const [newTitle, setNewTitle] = useState('');
  const [newClass, setNewClass] = useState('Class 10');
  const [newSubject, setNewSubject] = useState('Physics');

  if (!currentTeacher) {
    return <div className="text-center font-bold text-slate-500 py-10">No teacher profiles found in system roster database.</div>;
  }

  // Teacher-specific Timetable Periods 
  const teacherPeriods = timetable.filter(slot => slot.teacherId === currentTeacher.id);

  // Mark student status
  const toggleStudentAttendance = (studentId: string, status: 'Present' | 'Absent' | 'Leave') => {
    setMarkedRecords(prev => ({
      ...prev,
      [studentId]: status
    }));
    onUpsertAttendance(attendanceDate, studentId, 'Student', status, 'Submitted via Touchless Teacher Register Portal');
  };

  // Bulk operation to mark all present
  const markAllPresent = () => {
    const ids = classStudents.map(s => s.id);
    const newMarks: Record<string, 'Present' | 'Absent' | 'Leave'> = {};
    ids.forEach(id => {
      newMarks[id] = 'Present';
    });
    setMarkedRecords(prev => ({ ...prev, ...newMarks }));
    onBatchMarkPresent(attendanceDate, 'Student', ids);
    alert(`Successfully marked all ${classStudents.length} candidates in ${selectedClassForPeriod} as Present.`);
  };

  // Create Assignment
  const handleIssueAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const issued = {
      id: (assignments.length + 1).toString(),
      className: newClass,
      subject: newSubject,
      title: newTitle,
      date: '24-05-2026',
      deadline: '02-06-2026',
      totalSubmissions: 0
    };

    setAssignments([issued, ...assignments]);
    setNewTitle('');
    alert(`Circular alert successfully broadcasted to parents of ${newClass} for "${newTitle}"!`);
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-705 text-left font-sans" id="teacher-portal-hub">
      
      {/* Teacher Selection header bar */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl border border-indigo-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xs font-black uppercase tracking-widest text-indigo-900 font-mono">Teacher Portal Workspace</h2>
          <p className="text-[11px] text-slate-500 mt-0.5">Toggle live teacher logins to audit individual period slots and mark attendance records.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-500">Active Faculty Member:</span>
          <select 
            id="teacher-persona-select"
            value={activeTeacherId}
            onChange={(e) => {
              setActiveTeacherId(e.target.value);
              setMarkedRecords({}); // clear preview for new teacher context
            }}
            className="bg-white border text-xs font-bold border-slate-200 rounded-xl px-3 py-1.5 focus:border-indigo-500 focus:bg-white outline-hidden text-slate-700 cursor-pointer shadow-3xs"
          >
            {facultyList.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.designation})</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left side column: timetable (8-periods) & assignment trigger - 5 columns */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Timetable slots */}
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-3xs space-y-4">
            <div className="flex justify-between items-center border-b border-slate-50 pb-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Assigned timetable logs (8 Periods)</h3>
              <Clock className="w-4 h-4 text-slate-450" />
            </div>

            <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
              {teacherPeriods.map(slot => (
                <div key={slot.id} className="p-3 bg-slate-55 rounded-xl border border-slate-100 hover:border-indigo-150 transition-colors flex justify-between items-center gap-2">
                  <div className="space-y-1">
                    <span className="text-[8.5px] bg-indigo-50 text-indigo-800 font-extrabold px-1.5 py-0.5 rounded uppercase font-mono tracking-wider">
                      Period #{slot.period}
                    </span>
                    <h4 className="text-xs font-bold text-slate-805">{slot.className} — {slot.subject}</h4>
                    <p className="text-[10px] text-slate-400 font-mono">{slot.time} • Room {slot.room}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">Active Slot</span>
                  </div>
                </div>
              ))}

              {teacherPeriods.length === 0 && (
                <div className="text-center py-10 space-y-1.5">
                  <p className="text-xs text-slate-400 italic">No assigned periods found today.</p>
                  <p className="text-[11px] text-slate-450">Administrative timetables are managed by Academic Principal Kapoor.</p>
                </div>
              )}
            </div>
          </div>

          {/* Assignment Distributing Form */}
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-3xs space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Assignment Distribution Hub</h3>
            
            <form onSubmit={handleIssueAssignment} className="space-y-3.5 text-xs font-sans">
              
              <div>
                <label className="block text-[10.5px] font-semibold text-slate-550 mb-1">Target Class *</label>
                <select 
                  value={newClass}
                  onChange={(e) => setNewClass(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700 outline-hidden focus:bg-white"
                >
                  <option value="Class 10">Class 10</option>
                  <option value="Class 9">Class 9</option>
                  <option value="Class 8">Class 8</option>
                </select>
              </div>

              <div>
                <label className="block text-[10.5px] font-semibold text-slate-550 mb-1">Subject specialty *</label>
                <input 
                  type="text"
                  required
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="e.g. Physics Essentials"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700 outline-hidden focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[10.5px] font-semibold text-slate-550 mb-1">Homework/Assignment Objective Title *</label>
                <textarea
                  required
                  rows={2}
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Solve electrostatics chapter numerical values 5 to 12 from textbook."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700 outline-hidden focus:bg-white resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-3xs transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Issue & Broadcast Alert</span>
              </button>

            </form>
          </div>

        </div>

        {/* Right side column: Class digital attendance marker register - 7 columns */}
        <div className="lg:col-span-12 xl:col-span-7 space-y-6">
          
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-3xs space-y-5">
            
            {/* Header selection register */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-50 pb-3">
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Digital Attendance Marker</h3>
                <p className="text-xs text-slate-500 mt-0.5">Mark daily presence with instant home circular SMS dispatch alerts.</p>
              </div>
              
              <div className="flex items-center gap-3">
                <select
                  value={selectedClassForPeriod}
                  onChange={(e) => {
                    setSelectedClassForPeriod(e.target.value);
                    setMarkedRecords({}); // flush preview
                  }}
                  className="bg-slate-50 border border-slate-200 text-xs font-black rounded-lg px-2.5 py-1 text-slate-700 cursor-pointer"
                >
                  <option value="Class 10">Class 10</option>
                  <option value="Class 9">Class 9</option>
                  <option value="Class 8">Class 8</option>
                </select>

                <button
                  type="button"
                  onClick={markAllPresent}
                  className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600 font-black" />
                  <span>Mark All Present</span>
                </button>
              </div>
            </div>

            {/* Attendance Roster Grid Table */}
            <div className="rounded-2xl border border-slate-100 overflow-hidden">
              <table className="w-full text-left" id="teacher-attendance-sheet">
                <thead>
                  <tr className="bg-slate-50 text-[11px] text-slate-400 font-mono italic border-b border-slate-100">
                    <th className="p-3 pl-4">Roll</th>
                    <th className="p-3">Candidate Student Name</th>
                    <th className="p-3 text-center">Roster Marker Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs text-slate-800">
                  {classStudents.map(stu => {
                    const status = markedRecords[stu.id] || 'Present';
                    
                    return (
                      <tr key={stu.id} className="hover:bg-slate-55" id={`student-att-sheet-row-${stu.id}`}>
                        <td className="p-3 pl-4 font-mono font-bold text-slate-400">
                          {stu.rollNo.toString().padStart(2, '0')}
                        </td>
                        <td className="p-3">
                          <p className="font-bold text-slate-800">{stu.name}</p>
                          <p className="text-[9.5px] text-slate-400 font-mono font-medium">{stu.id} • Parent: {stu.parentsName}</p>
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex justify-center items-center gap-1">
                            <button
                              type="button"
                              onClick={() => toggleStudentAttendance(stu.id, 'Present')}
                              className={`px-3 py-1 text-[10px] font-black rounded-l-lg transition-all border ${
                                status === 'Present'
                                  ? 'bg-emerald-500 text-white border-emerald-500'
                                  : 'bg-slate-50 hover:bg-slate-100/80 text-slate-500 border-slate-200'
                              }`}
                            >
                              Present
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleStudentAttendance(stu.id, 'Absent')}
                              className={`px-3 py-1 text-[10px] font-black transition-all border-y ${
                                status === 'Absent'
                                  ? 'bg-rose-500 text-white border-rose-500'
                                  : 'bg-slate-50 hover:bg-slate-100/80 text-slate-500 border-slate-200'
                              }`}
                            >
                              Absent
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleStudentAttendance(stu.id, 'Leave')}
                              className={`px-3 py-1 text-[10px] font-black rounded-r-lg transition-all border ${
                                status === 'Leave'
                                  ? 'bg-amber-500 text-white border-amber-500'
                                  : 'bg-slate-50 hover:bg-slate-100/80 text-slate-500 border-slate-200'
                              }`}
                            >
                              Leave
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {classStudents.length === 0 && (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-slate-400 italic">No registered candidates inside study class target {selectedClassForPeriod}.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Broadcast log description footer */}
            <div className="flex items-start gap-2 bg-slate-55 p-3 rounded-2xl text-[10.5px] border border-slate-100">
              <AlertCircle className="w-4.5 h-4.5 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-750 font-sans">Indian School Ecosystem Regulatory Rule 5A:</p>
                <p className="text-slate-500 mt-0.5 font-serif">Absence updates instantly trigger automated bulk alerts directly back to registered parenting contact numbers to verify student security.</p>
              </div>
            </div>

          </div>

          {/* Broadcast assignment list summary logs */}
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-3xs space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Issued Assignments Tracker</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assignments.map(ass => (
                <div key={ass.id} className="p-3.5 rounded-xl bg-slate-55 border border-slate-100 relative min-w-0">
                  <span className="absolute top-3 right-3 text-[9px] bg-slate-200 text-slate-500 font-bold px-1.5 py-0.5 rounded uppercase tracking-wider font-mono">
                    {ass.className}
                  </span>
                  <p className="text-[10px] font-black text-indigo-700 font-mono tracking-wide mb-1 uppercase bg-indigo-50/50 inline-block px-1.5 py-0.5 rounded">
                    {ass.subject}
                  </p>
                  <h4 className="text-xs font-bold text-slate-800 line-clamp-2 pr-12">{ass.title}</h4>
                  <div className="flex items-center justify-between text-[10px] text-slate-450 mt-3 border-t border-slate-100/50 pt-2 font-mono">
                    <span>Issued: {ass.date}</span>
                    <span className="text-rose-600 font-semibold uppercase">Deadline: {ass.deadline}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
