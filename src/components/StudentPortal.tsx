import React, { useState } from 'react';
import { 
  User, 
  MapPin, 
  Calendar, 
  FileText, 
  BookOpen, 
  CheckCircle, 
  ArrowRight, 
  Upload, 
  Download, 
  ShieldCheck,
  Award,
  Plus
} from 'lucide-react';
import { Student, AttendanceRecord } from '../types';

interface StudentPortalProps {
  students: Student[];
  attendance: AttendanceRecord[];
}

export const StudentPortal: React.FC<StudentPortalProps> = ({ students, attendance }) => {
  // Simulator: select which student is logged-in
  const [activeStudentId, setActiveStudentId] = useState(students[0]?.id || 'STU001');
  const currentStudent = students.find(s => s.id === activeStudentId) || students[0];

  // Daily diary items
  const [diaryNotes, setDiaryNotes] = useState([
    { id: '1', date: '24-05-2026', subject: 'Mathematics', content: 'Revise Triangles Chapter 4 Exercise 4.2 for Class assessment.', status: 'Completed' },
    { id: '2', date: '24-05-2026', subject: 'Physics', content: 'Complete electrostatic potential numerical notes in fair copy.', status: 'Assigned' },
    { id: '3', date: '23-05-2026', subject: 'Hindi', content: 'Read Nibandh Lekhan on Atmanirbhar Bharat.', status: 'Completed' }
  ]);
  const [newDiarySubject, setNewDiarySubject] = useState('Mathematics');
  const [newDiaryContent, setNewDiaryContent] = useState('');

  // Vault mock documents
  const [vaultDocs, setVaultDocs] = useState([
    { id: '1', name: 'Aadhaar Card Copy', size: '1.2 MB', date: '24-05-2026', ref: 'UID-XXXX-3829' },
    { id: '2', name: 'Original Transfer Certificate (TC)', size: '2.4 MB', date: '24-05-2026', ref: 'TC-EDQ-901' },
    { id: '3', name: 'CBSE Class IX Mark Sheet', size: '3.1 MB', date: '23-05-2026', ref: 'CBSE-IX-2025' }
  ]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedName, setUploadedName] = useState('');

  if (!currentStudent) {
    return <div className="text-center font-bold text-[#94A3B8] py-10">No students found.</div>;
  }

  // Calculate stats for selected student
  const studentAttendance = attendance.filter(a => a.targetId === currentStudent.id && a.targetType === 'Student');
  const totalDays = studentAttendance.length;
  const presentDays = studentAttendance.filter(a => a.status === 'Present').length;
  const attRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 92; // default high streak

  const handleCreateDiaryEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDiaryContent.trim()) return;

    const entry = {
      id: (diaryNotes.length + 1).toString(),
      date: '24-05-2026',
      subject: newDiarySubject,
      content: newDiaryContent,
      status: 'Assigned'
    };
    setDiaryNotes([entry, ...diaryNotes]);
    setNewDiaryContent('');
  };

  const handleUploadDocument = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsUploading(true);
      setTimeout(() => {
        const item = {
          id: (vaultDocs.length + 1).toString(),
          name: file.name,
          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          date: '24-05-2026',
          ref: `DOC-VER-${Math.floor(100 + Math.random() * 900)}`
        };
        setVaultDocs([item, ...vaultDocs]);
        setIsUploading(false);
      }, 1500);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" id="student-portal-hub">
      
      {/* Dynamic Persona Swapper Bar */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl border border-indigo-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xs font-black uppercase tracking-widest text-white font-mono">Student Portal Simulator</h2>
          <p className="text-[11px] text-[#94A3B8] mt-0.5">Toggle student logins to audit profiles, roll records, and vaults.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-[#94A3B8]">Active Student Account:</span>
          <select 
            id="student-persona-select"
            value={activeStudentId}
            onChange={(e) => setActiveStudentId(e.target.value)}
            className="bg-[#1E293B] border text-xs font-bold border-[#334155] rounded-xl px-3 py-1.5 focus:border-indigo-500 focus:bg-[#1E293B] outline-hidden text-[#CBD5E1] cursor-pointer"
          >
            {students.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.id})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid: Left side metrics & details, right side vault/diary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Profile Card & Stats Panel - 4 columns */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Main ID Certificate Card */}
          <div className="bg-[#1E293B] rounded-3xl border border-[#334155] shadow-3xs overflow-hidden relative">
            <div className="h-2 bg-[#2563EB] shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(56,189,248,0.5)] hover:bg-[#38BDF8]"></div>
            <div className="p-6 text-center space-y-4">
              
              <div className="mx-auto w-20 h-20 bg-[#2563EB]/10 border border-[#2563EB]/30 rounded-full flex items-center justify-center text-[#38BDF8] text-2xl font-black border-2 border-indigo-100">
                {currentStudent.name.split(' ').map(n=>n[0]).join('')}
              </div>

              <div>
                <h3 className="text-base font-bold text-white">{currentStudent.name}</h3>
                <p className="text-[11px] text-[#94A3B8] font-bold font-mono tracking-wider mt-0.5">{currentStudent.className} • Section {currentStudent.section}</p>
                <span className="mt-2 inline-block bg-[#10B981]/10 border border-[#10B981]/30 text-[#10B981] border border-emerald-100 text-[10px] font-black font-sans px-2.5 py-0.5 rounded-full uppercase">
                  Active Enrolled
                </span>
              </div>

              {/* ID & Roll specs */}
              <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-50 text-left text-[11px]">
                <div className="bg-[#111827] p-2.5 rounded-xl border border-[#334155]">
                  <span className="text-[9px] text-[#94A3B8] uppercase font-bold block">Roll Number</span>
                  <span className="font-mono font-bold text-white">{currentStudent.rollNo.toString().padStart(2, '0')}</span>
                </div>
                <div className="bg-[#111827] p-2.5 rounded-xl border border-[#334155]">
                  <span className="text-[9px] text-[#94A3B8] uppercase font-bold block">Admission ID</span>
                  <span className="font-mono font-bold text-white truncate">{currentStudent.admissionNo}</span>
                </div>
                <div className="bg-[#111827] p-2.5 rounded-xl border border-[#334155] col-span-2">
                  <span className="text-[9px] text-[#94A3B8] uppercase font-bold block">Registrar Parent</span>
                  <span className="font-sans font-semibold text-slate-750">{currentStudent.parentsName}</span>
                </div>
              </div>

              {/* Personal Hub Specs */}
              <div className="space-y-2.5 text-left text-[11px] text-[#94A3B8] pt-2 font-medium">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#94A3B8] shrink-0" />
                  <span>DOB: <strong className="text-[#CBD5E1] font-mono">{currentStudent.dob}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#94A3B8] shrink-0" />
                  <span>Campus Landmass: Dwarka, New Delhi</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span className="text-indigo-950 font-bold">Authorized Digital Profile</span>
                </div>
              </div>

            </div>
          </div>

          {/* Core Roll Number Tracking & Attendance KPI Frame */}
          <div className="bg-[#1E293B] p-5 rounded-3xl border border-[#334155] shadow-3xs space-y-4">
            <h4 className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">Attendance & Tracking Streak</h4>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-2xl font-black text-white font-mono">{attRate}%</span>
                <p className="text-[10px] text-[#94A3B8] mt-0.5">Academic Attendance</p>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1 bg-[#10B981]/10 border border-[#10B981]/30 text-[#10B981] text-[10px] font-bold px-2 py-0.5 rounded-md border border-emerald-150">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]/10 border border-[#10B981]/300 animate-pulse"></span> Excellent
                </span>
                <p className="text-[10.5px] text-slate-450 mt-1 font-mono">Streak: 12 Days</p>
              </div>
            </div>
            {/* Visual streak blocks */}
            <div className="grid grid-cols-12 gap-1 pt-2">
              {[...Array(12)].map((_, i) => (
                <div key={i} className={`h-3 rounded-md ${i < 11 ? 'bg-[#10B981]/10 border border-[#10B981]/300' : 'bg-amber-500'} border border-white`} title={i < 11 ? 'Present' : 'Late/Leave'}></div>
              ))}
            </div>
            <p className="text-[9.5px] text-[#94A3B8] text-left font-serif">Daily RFID attendance ticks auto-broadcast alerts back home securely.</p>
          </div>

        </div>

        {/* Right side Portal details - 8 columns */}
        <div className="lg:col-span-8 space-y-6 text-left">
          
          {/* Part A: Vault */}
          <div className="bg-[#1E293B] p-6 rounded-3xl border border-[#334155] shadow-3xs space-y-5">
            <div className="flex justify-between items-center border-b border-slate-50 pb-3">
              <div>
                <h3 className="text-xs font-bold text-[#94A3B8] uppercase tracking-widest font-mono">My Digital Document Vault</h3>
                <p className="text-xs text-[#94A3B8] mt-0.5">Encrypted student dossier backups (Aadhaar copy, Transfer Certificate TC).</p>
              </div>
              <div className="relative">
                <input 
                  type="file" 
                  id="vault-file-uploader" 
                  className="hidden" 
                  onChange={handleUploadDocument}
                  disabled={isUploading}
                />
                <label 
                  htmlFor="vault-file-uploader"
                  className={`flex items-center gap-1.5 px-3 py-1.5 bg-[#2563EB] shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(56,189,248,0.5)] hover:bg-[#38BDF8] hover:bg-indigo-700 text-white font-bold rounded-xl text-xs cursor-pointer transition-all ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isUploading ? 'Uploading...' : 'Back Up Copy'}</span>
                </label>
              </div>
            </div>

            {/* Document Ledger List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {vaultDocs.map(doc => (
                <div key={doc.id} className="p-3.5 bg-[#111827] hover:bg-[#273549]/70 rounded-2xl border border-[#334155] flex items-center justify-between transition-all" id={`vault-doc-${doc.id}`}>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#1E293B] rounded-xl text-[#38BDF8] border border-[#334155] shrink-0">
                      <FileText className="w-4.5 h-4.5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-white truncate" title={doc.name}>{doc.name}</h4>
                      <p className="text-[10px] text-[#2563EB] font-mono tracking-wider mt-0.5">{doc.ref}</p>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => alert(`Offline download initialized for digital token: ${doc.ref}`)}
                    className="p-1.5 hover:bg-[#2563EB]/10 border border-[#2563EB]/30 rounded-lg text-[#94A3B8] hover:text-[#38BDF8] hover:drop-shadow-[0_0_8px_rgba(56,189,248,0.5)] cursor-pointer transition-all"
                    title="Download decrypted proof copy"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            
            <div className="flex items-center gap-2 bg-[#10B981]/10 border border-[#10B981]/30/50 p-2.5 rounded-xl border border-emerald-100/40 text-[10.5px] text-[#10B981]">
              <ShieldCheck className="w-4 h-4 text-[#10B981] shrink-0" />
              <span>DigiLocker Certified: CBSE legal backing permits online verification without paper TC submission.</span>
            </div>
          </div>

          {/* Part B: Student Diary */}
          <div className="bg-[#1E293B] p-6 rounded-3xl border border-[#334155] shadow-3xs space-y-4">
            <div>
              <h3 className="text-xs font-bold text-[#94A3B8] uppercase tracking-widest font-mono">My Daily Homework Diary</h3>
              <p className="text-xs text-[#94A3B8] mt-0.5">Maintain study objectives, prep exam milestones & log self-study logs daily.</p>
            </div>

            {/* Diary Log Input */}
            <form onSubmit={handleCreateDiaryEntry} className="bg-[#111827] p-4 rounded-2xl border border-[#334155] space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="w-full sm:w-1/3">
                  <label className="block text-[10px] font-bold text-[#94A3B8] mb-1 font-mono uppercase">Subject Specialty</label>
                  <select
                    value={newDiarySubject}
                    onChange={(e) => setNewDiarySubject(e.target.value)}
                    className="w-full bg-[#1E293B] border border-[#334155] text-xs font-semibold rounded-xl px-2.5 py-1.5 outline-hidden"
                  >
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="English Essentials">English Essentials</option>
                    <option value="Social Studies">Social Studies</option>
                  </select>
                </div>
                <div className="flex-grow">
                  <label className="block text-[10px] font-bold text-[#94A3B8] mb-1 font-mono uppercase">Entry Content / Diary task</label>
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      required
                      value={newDiaryContent}
                      onChange={(e) => setNewDiaryContent(e.target.value)}
                      placeholder="e.g. Completed Chapter 5 Exercise 2 in Chemistry notebook."
                      className="flex-grow bg-[#1E293B] border border-[#334155] text-xs font-medium rounded-xl px-3 py-1.5 outline-hidden focus:border-indigo-500"
                    />
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-[#2563EB] shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(56,189,248,0.5)] hover:bg-[#38BDF8] hover:bg-indigo-700 text-white font-bold rounded-xl text-xs cursor-pointer transition-all flex items-center gap-1 shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Log</span>
                    </button>
                  </div>
                </div>
              </div>
            </form>

            {/* Diary notes list dynamic output */}
            <div className="space-y-3 pt-2">
              {diaryNotes.map(note => (
                <div key={note.id} className="p-3.5 rounded-2xl border border-[#334155] bg-[#1E293B] shadow-3xs flex justify-between gap-4 items-start hover:border-indigo-50 transition-colors">
                  <div className="space-y-1 max-w-[80%]">
                    <div className="flex items-center gap-2">
                      <span className="text-[10.5px] font-black text-[#38BDF8] uppercase bg-[#2563EB]/10 border border-[#2563EB]/30/50 px-2 py-0.5 rounded-md">
                        {note.subject}
                      </span>
                      <span className="text-[10px] text-[#94A3B8] font-mono">{note.date}</span>
                    </div>
                    <p className="text-xs text-[#CBD5E1] leading-relaxed font-sans">{note.content}</p>
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => {
                        setDiaryNotes(prev => prev.map(n => n.id === note.id ? { ...n, status: n.status === 'Completed' ? 'Assigned' : 'Completed' } : n));
                      }}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border cursor-pointer ${
                        note.status === 'Completed'
                          ? 'bg-[#10B981]/10 border border-[#10B981]/30 text-[#10B981] border-emerald-150'
                          : 'bg-slate-55 hover:bg-[#273549] text-[#94A3B8] border-[#334155]'
                      }`}
                    >
                      <CheckCircle className={`w-3.5 h-3.5 ${note.status === 'Completed' ? 'text-[#10B981]' : 'text-slate-450'}`} />
                      <span>{note.status}</span>
                    </button>
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
