import React, { useState } from 'react';
import { 
  Users, 
  MessageSquare, 
  Bell, 
  Calendar, 
  Send, 
  CheckCircle, 
  ShieldCheck, 
  Mail, 
  CheckSquare, 
  AlertCircle
} from 'lucide-react';
import { Student, CommunicationAnnouncement, AttendanceRecord } from '../types';

interface ParentPortalProps {
  students: Student[];
  announcements: CommunicationAnnouncement[];
  attendance: AttendanceRecord[];
}

export const ParentPortal: React.FC<ParentPortalProps> = ({ 
  students, 
  announcements,
  attendance
}) => {
  // Selector to pick which parent profile is viewed
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || 'STU001');
  const currentStudent = students.find(s => s.id === selectedStudentId) || students[0];

  // Simulated direct notes desk to Principal Dr. Kapoor
  const [directNotes, setDirectNotes] = useState([
    { id: '1', date: '24-05-2026', content: 'Requested early leave token tomorrow for family celebration puja.', recipient: 'Principal Dr. G. K. Kapoor', status: 'Approved' }
  ]);
  const [newNote, setNewNote] = useState('');

  if (!currentStudent) {
    return <div className="text-center font-bold text-slate-500 py-10">No students recorded.</div>;
  }

  // Filter ward attendance log feed
  const wardLog = attendance.filter(a => a.targetId === currentStudent.id && a.targetType === 'Student');

  const handlePostNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    const logged = {
      id: (directNotes.length + 1).toString(),
      date: '24-05-2026',
      content: newNote,
      recipient: 'Principal Dr. G. K. Kapoor',
      status: 'Awaiting Review'
    };

    setDirectNotes([logged, ...directNotes]);
    setNewNote('');
    alert(`Your secure note has been transmitted directly into Principal Kapoor's executive workbench!`);
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-705 text-left font-sans" id="parent-portal-hub">
      
      {/* Switcher Profile bar */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl border border-indigo-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xs font-black uppercase tracking-widest text-indigo-900 font-mono">Parent Communication Portal Desk</h2>
          <p className="text-[11px] text-slate-500 mt-0.5">Toggle Ward accounts to inspect holiday notices, alert notifications, and SMS triggers.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-500">Active Parent Account of:</span>
          <select 
            id="parent-ward-select"
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="bg-white border text-xs font-bold border-slate-200 rounded-xl px-3 py-1.5 focus:border-indigo-500 focus:bg-white outline-hidden text-slate-700 cursor-pointer shadow-3xs"
          >
            {students.map(s => (
              <option key={s.id} value={s.id}>{s.parentsName} / Primary guardian of {s.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: Mobile Communication Notice board & Circulars - 7 columns */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Circular Envelopes board list */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-3xs space-y-4">
            <div className="flex justify-between items-center border-b border-slate-50 pb-2">
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Circular Bulletin Board</h3>
                <p className="text-xs text-slate-500 mt-0.5 font-serif">Official notifications, Diwali/Summer vacation announcements.</p>
              </div>
              <Calendar className="w-4 h-4 text-slate-400" />
            </div>

            {/* Structured Indian Calendar Holidays block */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              <div className="p-3.5 bg-yellow-50/70 border border-yellow-205 rounded-2xl text-xs space-y-1.5 hover:border-yellow-300 transition-colors">
                <span className="text-[9px] bg-yellow-100 text-yellow-850 font-black px-2 py-0.5 rounded-md uppercase tracking-wide">
                  Diwali Holidays Schedule
                </span>
                <p className="text-xs font-bold text-slate-800">10-11-2026 to 15-11-2026</p>
                <p className="text-[10px] text-slate-500 font-serif leading-relaxed">School campus remains shuttered for deepawali festivals. Online coursework begins 16-11.</p>
              </div>

              <div className="p-3.5 bg-blue-50/50 border border-blue-150 rounded-2xl text-xs space-y-1.5 hover:border-blue-200 transition-colors">
                <span className="text-[9px] bg-blue-100 text-blue-800 font-black px-2 py-0.5 rounded-md uppercase tracking-wide">
                  Summer Trimester Break
                </span>
                <p className="text-xs font-bold text-slate-800">01-06-2026 to 30-06-2026</p>
                <p className="text-[10px] text-slate-500 font-serif leading-relaxed">Summer vacations for Class 1 to 9. Class 10 remedial tutorial sessions schedule is active.</p>
              </div>
            </div>

            {/* Dynamic circular dispatches */}
            <div className="space-y-3 pt-3">
              {announcements.slice(0, 3).map(not => (
                <div key={not.id} className="p-4 bg-slate-55 rounded-2xl border border-slate-100 space-y-1.5 text-xs">
                  <div className="flex justify-between items-start gap-2">
                    <span className={`text-[8.5px] px-2 py-0.5 rounded-md font-extrabold uppercase font-mono border ${
                      not.type === 'Alert' ? 'bg-rose-50 border-rose-200 text-rose-700 font-black' : 'bg-slate-100 border-slate-200 text-slate-500'
                    }`}>
                      {not.type}
                    </span>
                    <span className="text-[10px] text-indigo-700 font-mono italic">{not.date}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-805 leading-relaxed">{not.title}</h4>
                  <p className="text-[10.5px] text-slate-500 leading-snug font-serif">{not.content}</p>
                  <p className="text-[10px] text-slate-400 font-medium">Dispatched by: <strong className="text-slate-600 font-semibold">{not.sender}</strong> ({not.role})</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Attendance Alert simulator (interactive smartphone alerts) & direct notes - 5 columns */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Smart Phone SMS alert feed */}
          <div className="bg-slate-900 text-slate-100 p-5 rounded-3xl border border-slate-800 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-400 font-mono">
                  Real-time SMS Alert system
                </h3>
              </div>
              <Bell className="w-4 h-4 text-emerald-500" />
            </div>

            <p className="text-[10px] text-slate-400 leading-relaxed font-sans">Smartphone alerts auto-sent to registered parent mobile <strong className="text-slate-100 font-mono">+91 {currentStudent.contact}</strong> on campus movements.</p>

            {/* Simulated Live Alert Messages */}
            <div className="space-y-3 max-h-[190px] overflow-y-auto pr-1 text-[10.5px]">
              
              {wardLog.length > 0 ? (
                wardLog.map(log => (
                  <div key={log.id} className="p-3 rounded-2xl bg-slate-950 border border-slate-850 space-y-1">
                    <div className="flex justify-between text-[9px] font-mono text-indigo-400">
                      <span>SMS GATEWAY DISPATCH</span>
                      <span>{log.date}</span>
                    </div>
                    <p className="text-slate-200 leading-relaxed font-serif">
                      "Dear Parent, your ward <strong className="text-emerald-400 font-medium">{currentStudent.name}</strong> has been tagged <strong className="text-emerald-400 font-black">{log.status.toUpperCase()}</strong> at Dwarka Campus security gate at {log.notes?.includes('Touchless') ? '08:15 AM' : '12:30 PM'}."
                    </p>
                  </div>
                ))
              ) : (
                <>
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-850 space-y-1">
                    <div className="flex justify-between text-[9px] font-mono text-indigo-400">
                      <span>SMS GATEWAY DISPATCH</span>
                      <span>24-05-2026</span>
                    </div>
                    <p className="text-slate-200 leading-relaxed font-serif">
                      "Dear Parent, your ward <strong className="text-emerald-400 font-medium">{currentStudent.name}</strong> has been marked <strong className="text-emerald-400 font-black">PRESENT</strong> for the trimester morning session register."
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-850 space-y-1">
                    <div className="flex justify-between text-[9px] font-mono text-indigo-400">
                      <span>SMS GATEWAY DISPATCH</span>
                      <span>23-05-2026</span>
                    </div>
                    <p className="text-slate-200 leading-relaxed font-serif">
                      "Dear Parent, terminal fee invoice cleared successfully. Receipt generated ref REC-2026-908 for Tuition Fee stream. Thank you."
                    </p>
                  </div>
                </>
              )}

            </div>
          </div>

          {/* Direct Administrative Helpdesk Form */}
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-3xs space-y-3.5 text-xs text-left">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Administrative Contact Desk</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Draft direct secure queries directly to Principal Dr. Kapoor.</p>
            </div>

            <form onSubmit={handlePostNote} className="space-y-3.5">
              <div>
                <textarea
                  required
                  rows={2}
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="e.g. Requesting permission for Ramesh to be excused from physical education classes due to recent sports sprain..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 outline-hidden focus:bg-white resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-1.5 py-2 bg-indigo-600 hover:bg-slate-900 text-white font-black text-xs rounded-xl shadow-3xs transition-colors cursor-pointer animate-pulse"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Transmit Note</span>
              </button>
            </form>

            {/* Log list direct parent requests */}
            <div className="space-y-2 pt-1 max-h-[140px] overflow-y-auto">
              {directNotes.map(no => (
                <div key={no.id} className="p-3 rounded-xl bg-slate-55 border border-slate-100 text-[10.5px] space-y-1">
                  <div className="flex justify-between text-[9.5px] font-mono text-slate-400">
                    <span>To: {no.recipient}</span>
                    <span>{no.date}</span>
                  </div>
                  <p className="text-slate-600 line-clamp-2 italic font-serif leading-relaxed">"{no.content}"</p>
                  <div className="text-right">
                    <span className="text-[9px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider">
                      {no.status}
                    </span>
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
