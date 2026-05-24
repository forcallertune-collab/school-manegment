import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Edit, 
  Trash2, 
  MoreVertical,
  X,
  GraduationCap,
  Sparkles,
  ChevronDown,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  BarChart3,
  Award,
  Printer,
  FileText
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Cell
} from 'recharts';
import { Student, Exam, StudentResult } from '../types';

interface StudentManagerProps {
  students: Student[];
  onAddStudent: (student: Omit<Student, 'id'>) => void;
  onUpdateStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
  exams?: Exam[];
  results?: StudentResult[];
}

export const StudentManager: React.FC<StudentManagerProps> = ({
  students,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  exams = [],
  results = []
}) => {
  // State variables
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  
  // Registration form dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Quick Inline Notes for Directory row persisted to Local Storage
  const [studentNotes, setStudentNotes] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('eduqube_student_notes');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });
  const [activeNoteEditId, setActiveNoteEditId] = useState<string | null>(null);
  const [tempNoteText, setTempNoteText] = useState('');
  const [expandedStudentIds, setExpandedStudentIds] = useState<Record<string, boolean>>({});

  // Report Modal states
  const [reportStudent, setReportStudent] = useState<Student | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const getStudentExamData = (studentId: string) => {
    const studentResults = results.filter(r => r.studentId === studentId);
    return studentResults
      .map(res => {
        const examInfo = exams.find(e => e.id === res.examId);
        return {
          examTitle: res.examTitle,
          subject: res.subject,
          date: examInfo?.date || '',
          marksObtained: res.marksObtained,
          maxMarks: res.maxMarks,
          percentage: Math.round((res.marksObtained / res.maxMarks) * 100),
          grade: res.grade,
          remarks: res.remarks
        };
      })
      .sort((a, b) => {
        if (!a.date || !b.date) return 0;
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      })
      .slice(-3);
  };

  const getTrendData = (examData: any[]) => {
    let dipStatus: 'dip' | 'gain' | 'stable' | 'none' = 'none';
    let percentageDiff = 0;
    let latestPerf: any = null;
    let prevPerf: any = null;

    if (examData.length >= 2) {
      prevPerf = examData[examData.length - 2];
      latestPerf = examData[examData.length - 1];
      percentageDiff = latestPerf.percentage - prevPerf.percentage;
      if (percentageDiff < 0) {
        dipStatus = 'dip';
      } else if (percentageDiff > 0) {
        dipStatus = 'gain';
      } else {
        dipStatus = 'stable';
      }
    }
    return { dipStatus, percentageDiff, latestPerf, prevPerf };
  };

  const toggleExpand = (studentId: string) => {
    setExpandedStudentIds(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));
  };

  const handleSaveNote = (studentId: string, note: string) => {
    const updated = { ...studentNotes, [studentId]: note };
    setStudentNotes(updated);
    try {
      localStorage.setItem('eduqube_student_notes', JSON.stringify(updated));
    } catch (e) {
      console.error("Local storage sync error", e);
    }
  };

  // Form Fields State
  const [formName, setFormName] = useState('');
  const [formRollNo, setFormRollNo] = useState('');
  const [formClass, setFormClass] = useState('Class 10');
  const [formSection, setFormSection] = useState('A');
  const [formParent, setFormParent] = useState('');
  const [formContact, setFormContact] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formDOB, setFormDOB] = useState('');
  const [formGender, setFormGender] = useState('Male');
  const [formStatus, setFormStatus] = useState<'Active' | 'Suspended' | 'Graduated'>('Active');

  // Trigger registration dialog for a new student
  const openAddDialog = () => {
    setEditingStudent(null);
    setFormName('');
    setFormRollNo((students.length + 1).toString());
    setFormClass('Class 10');
    setFormSection('A');
    setFormParent('');
    setFormContact('');
    setFormEmail('');
    setFormDOB('2010-01-01');
    setFormGender('Male');
    setFormStatus('Active');
    setIsDialogOpen(true);
  };

  // Trigger editing dialog for an existing student
  const openEditDialog = (student: Student) => {
    setEditingStudent(student);
    setFormName(student.name);
    setFormRollNo(student.rollNo);
    setFormClass(student.className);
    setFormSection(student.section);
    setFormParent(student.parentsName);
    setFormContact(student.contact);
    setFormEmail(student.email);
    setFormDOB(student.dob);
    setFormGender(student.gender);
    setFormStatus(student.status);
    setIsDialogOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formParent.trim() || !formContact.trim()) {
      alert('Please fill out Name, Parent Details, and Mobile Contact before submitting.');
      return;
    }

    const admissionNo = editingStudent 
      ? editingStudent.admissionNo 
      : `ADM-2026-${Math.floor(100 + Math.random() * 900)}`;

    const admissionDate = editingStudent 
      ? editingStudent.admissionDate 
      : '2026-05-24';

    if (editingStudent) {
      onUpdateStudent({
        id: editingStudent.id,
        name: formName,
        admissionNo,
        rollNo: formRollNo,
        className: formClass,
        section: formSection,
        parentsName: formParent,
        contact: formContact,
        email: formEmail || `${formName.toLowerCase().replace(/\s+/g, '.')}@eduqube.com`,
        status: formStatus,
        dob: formDOB,
        gender: formGender,
        admissionDate
      });
    } else {
      onAddStudent({
        name: formName,
        admissionNo,
        rollNo: formRollNo,
        className: formClass,
        section: formSection,
        parentsName: formParent,
        contact: formContact,
        email: formEmail || `${formName.toLowerCase().replace(/\s+/g, '.')}@eduqube.com`,
        status: formStatus,
        dob: formDOB,
        gender: formGender,
        admissionDate
      });
    }
    
    setIsDialogOpen(false);
  };

  // Filtering Logic
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.admissionNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNo.includes(searchTerm);
    
    const matchesClass = selectedClass === 'All' || student.className === selectedClass;
    const matchesStatus = selectedStatus === 'All' || student.status === selectedStatus;

    return matchesSearch && matchesClass && matchesStatus;
  });

  return (
    <div className="space-y-6" id="student-manager-container">
      {/* Title Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-xs border border-slate-100">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <GraduationCap className="text-indigo-600 w-6 h-6" />
            Admissions & Student Directory
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Maintain student registrations, family contacts, class tiers, and active states.</p>
        </div>
        <button 
          id="btn-add-student"
          onClick={openAddDialog}
          className="flex items-center gap-2 px-4.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Enroll New Student
        </button>
      </div>

      {/* Control Roster: Search and Filter Row */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-110 flex flex-col md:flex-row justify-between items-center gap-4" id="search-filter-row">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input 
            type="text"
            id="student-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by student name, roll, or adm no..."
            className="w-full bg-slate-50 pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 outline-hidden focus:border-indigo-500 focus:bg-white transition-all text-slate-700 font-medium"
          />
        </div>

        {/* Dynamic Filters dropdowns */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Filter className="w-3.5 h-3.5" />
            <span>Class:</span>
          </div>
          <select 
            id="filter-class-select"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 font-medium outline-hidden focus:border-indigo-500 transition-all font-mono"
          >
            <option value="All">All Grades</option>
            <option value="Class 10">Grade 10</option>
            <option value="Class 9">Grade 9</option>
            <option value="Class 8">Grade 8</option>
          </select>

          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium ml-2">
            <span>Status:</span>
          </div>
          <select 
            id="filter-status-select"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 font-medium outline-hidden focus:border-indigo-500 transition-all"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Suspended">Suspended</option>
            <option value="Graduated">Graduated</option>
          </select>
        </div>
      </div>

      {/* Directory Table Grid */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-100 overflow-hidden" id="student-table-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" id="students-table">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 italic">
                <th className="p-4 w-10"></th>
                <th className="p-4 text-xs font-bold text-slate-500 font-mono uppercase tracking-wider">Admission Stats</th>
                <th className="p-4 text-xs font-bold text-slate-500 font-mono uppercase tracking-wider">Student Name</th>
                <th className="p-4 text-xs font-bold text-slate-500 font-mono uppercase tracking-wider">Class assignment</th>
                <th className="p-4 text-xs font-bold text-slate-500 font-mono uppercase tracking-wider">Parent/Guardian</th>
                <th className="p-4 text-xs font-bold text-slate-500 font-mono uppercase tracking-wider">Contact Credentials</th>
                <th className="p-4 text-xs font-bold text-slate-500 font-mono uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-bold text-slate-500 font-mono uppercase tracking-wider">Inline Notes</th>
                <th className="p-4 text-xs font-bold text-slate-500 text-center font-mono uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredStudents.map((stu) => {
                const isExpanded = !!expandedStudentIds[stu.id];
                // Compile student result analysis using helper functions
                const studentExamData = getStudentExamData(stu.id);
                const { dipStatus, percentageDiff, latestPerf, prevPerf } = getTrendData(studentExamData);

                return (
                  <React.Fragment key={stu.id}>
                    <tr className={`transition-all ${isExpanded ? 'bg-indigo-50/10' : 'hover:bg-slate-50/50'}`} id={`student-row-${stu.id}`}>
                      {/* Expansion trigger cell */}
                      <td className="p-4 text-center">
                        <button 
                          type="button"
                          id={`btn-expand-student-${stu.id}`}
                          onClick={() => toggleExpand(stu.id)}
                          className="p-1 hover:bg-slate-100 text-slate-400 hover:text-indigo-600 rounded-lg transition-all cursor-pointer flex items-center justify-center max-w-[28px] mx-auto"
                          title="Toggle academic graph view"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-4.5 h-4.5 text-indigo-600" />
                          ) : (
                            <ChevronRight className="w-4.5 h-4.5" />
                          )}
                        </button>
                      </td>

                      {/* Admission column */}
                      <td className="p-4">
                        <div>
                          <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-mono font-bold">
                            {stu.admissionNo}
                          </span>
                          <p className="text-[10px] text-slate-400 mt-1 font-mono">Date: {stu.admissionDate}</p>
                        </div>
                      </td>
                      
                      {/* Name and avatar info */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-indigo-700 font-bold text-xs ring-2 ring-slate-100 border border-white">
                            {stu.name.split(' ').map(n=>n[0]).join('')}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800">{stu.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">Ref ID: {stu.id}</p>
                          </div>
                        </div>
                      </td>

                      {/* Class assignment */}
                      <td className="p-4">
                        <div>
                          <p className="text-xs font-semibold text-slate-700">{stu.className}</p>
                          <p className="text-[10px] text-slate-400 font-mono">Sec {stu.section} • Roll #{stu.rollNo}</p>
                        </div>
                      </td>

                      {/* Parent name */}
                      <td className="p-4 text-xs font-medium text-slate-600">
                        {stu.parentsName}
                      </td>

                      {/* Contacts */}
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-[10.5px] font-mono text-slate-600">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{stu.contact}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{stu.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Status Indicator badge */}
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider ${
                          stu.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                          stu.status === 'Suspended' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                          'bg-indigo-50 text-indigo-700 border border-indigo-100'
                        }`}>
                          {stu.status}
                        </span>
                      </td>

                      {/* Quick Local Persisted Inline Notes column */}
                      <td className="p-4 min-w-[160px] max-w-[220px]">
                        {activeNoteEditId === stu.id ? (
                          <div className="flex items-center gap-1.5" id={`note-edit-container-${stu.id}`}>
                            <input
                              type="text"
                              id={`note-input-${stu.id}`}
                              autoFocus
                              placeholder="Note/Tag (e.g., 'Requires follow-up')"
                              value={tempNoteText}
                              onChange={(e) => setTempNoteText(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleSaveNote(stu.id, tempNoteText);
                                  setActiveNoteEditId(null);
                                } else if (e.key === 'Escape') {
                                  setActiveNoteEditId(null);
                                }
                              }}
                              onBlur={() => {
                                handleSaveNote(stu.id, tempNoteText);
                                setActiveNoteEditId(null);
                              }}
                              className="w-full bg-[#faf6eb]/90 hover:bg-[#faf6eb] text-[11px] px-2 py-1 rounded-lg border border-[#ead2a3] focus:border-[#b98d45] outline-hidden text-[#815e26] font-medium placeholder-[#ead2a3] shadow-3xs"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                handleSaveNote(stu.id, tempNoteText);
                                setActiveNoteEditId(null);
                              }}
                              className="p-1 text-emerald-600 hover:text-emerald-700 font-bold text-xs cursor-pointer rounded-md hover:bg-emerald-50"
                              title="Save Note"
                            >
                              ✓
                            </button>
                          </div>
                        ) : (
                          <div 
                            onClick={() => {
                              setActiveNoteEditId(stu.id);
                              setTempNoteText(studentNotes[stu.id] || '');
                            }}
                            className="group/note flex items-center justify-between gap-1 w-full p-2 rounded-xl border border-transparent hover:border-[#ead2a3]/30 hover:bg-[#faf6eb]/50 cursor-pointer transition-all min-h-[32px]"
                            title="Click to write/edit tag or temporary note"
                            id={`note-display-trigger-${stu.id}`}
                          >
                            {studentNotes[stu.id] ? (
                              <span className="text-[10.5px] font-bold tracking-wide uppercase font-display bg-[#faf6eb] text-[#815e26] border border-[#ead2a3]/60 px-2.5 py-0.5 rounded-full block truncate max-w-full">
                                {studentNotes[stu.id]}
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-350 group-hover/note:text-[#815e26] italic font-sans select-none">
                                + Write note...
                              </span>
                            )}
                            {studentNotes[stu.id] && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSaveNote(stu.id, '');
                                }}
                                className="text-[9px] text-[#cca561] hover:text-[#9e7534] font-bold px-1 py-0.5 rounded-md hover:bg-[#faf6eb] opacity-0 group-hover/note:opacity-100 transition-opacity cursor-pointer flex items-center justify-center shrink-0 w-4 h-4"
                                title="Clear Note"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Dynamic Action Buttons */}
                      <td className="p-4">
                        <div className="flex justify-center items-center gap-2">
                          <button 
                            id={`btn-edit-student-${stu.id}`}
                            onClick={() => openEditDialog(stu)}
                            className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-indigo-600 rounded-lg transition-all cursor-pointer"
                            title="Edit Student Profile"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            id={`btn-delete-student-${stu.id}`}
                            onClick={() => {
                              if (confirm(`Are you sure you wish to delete registration ${stu.admissionNo} (${stu.name})?`)) {
                                onDeleteStudent(stu.id);
                              }
                            }}
                            className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-rose-600 rounded-lg transition-all cursor-pointer"
                            title="Delete Admission Profile"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Highly stylized expanded performance row with recharts BarChart */}
                    {isExpanded && (
                      <tr className="bg-[#fcfcff] border-y border-slate-200/50" id={`student-row-expanded-${stu.id}`}>
                        <td colSpan={9} className="p-4 md:p-6">
                          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-5 animate-fade-in" id={`expansion-grid-${stu.id}`}>
                            
                            {/* Left panel metrics and direct warning */}
                            <div className="md:col-span-5 space-y-4">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                                <div className="flex items-start gap-2.5">
                                  <div className="p-2 border border-indigo-100 bg-indigo-50 rounded-xl shrink-0">
                                    <GraduationCap className="w-5 h-5 text-indigo-600" />
                                  </div>
                                  <div className="text-left">
                                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Scholar Academic Tracker</h4>
                                    <p className="text-[10px] text-slate-500 mt-0.5 font-sans leading-relaxed">
                                      Trajectory of the last {studentExamData.length} records.
                                    </p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  id={`btn-generate-report-${stu.id}`}
                                  onClick={() => {
                                    setReportStudent(stu);
                                    setIsReportModalOpen(true);
                                  }}
                                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#faf6eb] hover:bg-white border border-[#ead2a3] text-[#815e26] font-display font-bold text-[10.5px] uppercase tracking-wider rounded-xl cursor-pointer hover:shadow-2xs active:scale-95 transition-all shrink-0"
                                  title="Export displayed grade trend data and student details as a PDF"
                                >
                                  <Printer className="w-3.5 h-3.5 text-[#815e26]" />
                                  <span>Generate Report</span>
                                </button>
                              </div>

                              <div className="grid grid-cols-2 gap-2 text-left">
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                  <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Assigned Grade</span>
                                  <span className="text-xs font-bold text-slate-700 block mt-0.5">{stu.className} • Sec {stu.section}</span>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                  <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Register Roll</span>
                                  <span className="text-xs font-bold text-slate-700 block mt-0.5">#{stu.rollNo}</span>
                                </div>
                              </div>

                              {studentExamData.length === 0 ? (
                                <div className="bg-amber-50/50 border border-dashed border-amber-200 p-4 rounded-xl text-center">
                                  <p className="text-xs font-bold text-amber-800">No scorebook database logs registered</p>
                                  <p className="text-[10px] text-slate-400 mt-0.5">Post scholar exam results in the exams registry to visualize their progress curve.</p>
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  {/* Performance Trend Warnings */}
                                  {dipStatus === 'dip' && latestPerf && prevPerf && (
                                    <div className="bg-rose-50 border border-rose-200/80 p-3.5 rounded-xl flex items-start gap-2 text-left text-[11px] text-rose-800 leading-relaxed">
                                      <TrendingDown className="w-5 h-5 text-rose-500 shrink-0 mt-0.5 animate-pulse" />
                                      <div>
                                        <p className="font-bold text-rose-900">Immediate Performance Dip Detected ({percentageDiff}%)</p>
                                        <p className="text-[10px] text-rose-700 mt-0.5">
                                          Score declined from <strong>{prevPerf.percentage}%</strong> ({prevPerf.examTitle}) down to <strong>{latestPerf.percentage}%</strong> ({latestPerf.examTitle}) on {latestPerf.subject}. Consider academic intervention.
                                        </p>
                                      </div>
                                    </div>
                                  )}

                                  {dipStatus === 'gain' && latestPerf && prevPerf && (
                                    <div className="bg-emerald-50 border border-emerald-200/80 p-3.5 rounded-xl flex items-start gap-2 text-left text-[11px] text-emerald-800 leading-relaxed">
                                      <TrendingUp className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                                      <div>
                                        <p className="font-bold text-emerald-900">Positive Academic Progression (+{percentageDiff}%)</p>
                                        <p className="text-[10px] text-emerald-700 mt-0.5">
                                          Grade score improved from <strong>{prevPerf.percentage}%</strong> to <strong>{latestPerf.percentage}%</strong> on {latestPerf.subject}! Keep this curve heading upward!
                                        </p>
                                      </div>
                                    </div>
                                  )}

                                  {dipStatus === 'stable' && latestPerf && (
                                    <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl flex items-start gap-2 text-left text-[11px] text-slate-700 leading-relaxed">
                                      <Award className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                      <div>
                                        <p className="font-bold text-slate-800">Consistent Standard score</p>
                                        <p className="text-[10px] text-slate-500 mt-0.5">
                                          Maintaining a stable standard of <strong>{latestPerf.percentage}%</strong> in the recent {latestPerf.examTitle} record session.
                                        </p>
                                      </div>
                                    </div>
                                  )}

                                  <div className="space-y-1 bg-slate-50/50 p-2 rounded-xl border border-slate-100">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-1">Recent Records list</span>
                                    {studentExamData.map((ex, idx) => (
                                      <div key={idx} className="flex justify-between items-center text-[10.5px] p-2 hover:bg-white rounded-lg transition-colors">
                                        <span className="text-slate-600 font-medium">{ex.examTitle} <span className="text-slate-400 font-sans italic">({ex.subject})</span></span>
                                        <span className="font-mono font-bold text-slate-800 bg-[#faf6eb] border border-[#ead2a3]/40 px-1.5 py-0.5 rounded text-[9.5px]">{ex.percentage}% [Grade {ex.grade}]</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Right panel: BarChart visualization */}
                            <div className="md:col-span-7 bg-slate-50 p-4.5 rounded-2xl border border-slate-120/70 flex flex-col justify-between">
                              <div className="flex justify-between items-center pb-2 border-b border-slate-200/60 mb-2">
                                <div className="text-left">
                                  <span className="text-[9px] uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-bold">Grade Distribution Chart</span>
                                  <h4 className="text-[11px] font-bold text-slate-700 mt-1 font-sans">Recent examination score-book indicators (%)</h4>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
                                  <span className="text-[9.5px] text-slate-400 font-mono">Recharts Engine v2</span>
                                </div>
                              </div>

                              <div className="h-44 w-full flex items-center justify-center pt-2">
                                {studentExamData.length > 0 ? (
                                  <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={studentExamData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} opacity={0.5} />
                                      <XAxis 
                                        dataKey="examTitle" 
                                        stroke="#475569" 
                                        fontSize={9} 
                                        tickLine={false}
                                        className="font-sans font-medium text-[8.5px]"
                                      />
                                      <YAxis 
                                        stroke="#475569" 
                                        fontSize={9} 
                                        domain={[0, 100]} 
                                        tickLine={false}
                                        axisLine={false}
                                        unit="%"
                                        className="font-mono text-[8.5px]"
                                      />
                                      <Tooltip 
                                        contentStyle={{ 
                                          backgroundColor: '#0d1b3e', 
                                          borderRadius: '12px', 
                                          border: '1px solid #cca561',
                                          color: 'white',
                                          fontSize: '11px',
                                          textAlign: 'left'
                                        }} 
                                        labelClassName="font-display font-black text-[#dfbf85] text-[10px]"
                                        formatter={(value: any, name: any, props: any) => [
                                          `${value}% obtained (${props.payload.marksObtained}/${props.payload.maxMarks} Marks)`,
                                          `Subject: ${props.payload.subject}`
                                        ]}
                                      />
                                      <Bar 
                                        dataKey="percentage" 
                                        radius={[4, 4, 0, 0]}
                                        maxBarSize={35}
                                      >
                                        {studentExamData.map((entry, index) => {
                                          let color = "#6366f1"; // Indigo
                                          if (entry.percentage < 55) {
                                            color = "#f43f5e"; // Rose Red
                                          } else if (entry.percentage < 75) {
                                            color = "#f59e0b"; // Amber
                                          } else {
                                            color = "#10b981"; // Emerald
                                          }
                                          return <Cell key={`cell-${index}`} fill={color} />;
                                        })}
                                      </Bar>
                                    </BarChart>
                                  </ResponsiveContainer>
                                ) : (
                                  <div className="flex flex-col items-center justify-center text-center p-4">
                                    <BarChart3 className="w-8 h-8 text-slate-300 mb-1.5" />
                                    <p className="text-xs text-slate-400 font-medium">No recorded grades available for plotting.</p>
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex justify-between items-center text-[9px] text-slate-500 border-t border-slate-200/50 pt-2.5 mt-2">
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500 inline-block"></span> Critical (&lt;55%)</span>
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span> Normal (55%-75%)</span>
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span> Outstanding (&gt;75%)</span>
                              </div>
                            </div>

                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}

              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-slate-400 text-xs">
                    No student registrations found matching specified query terms.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mini Table Footer statistics */}
        <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-between items-center text-[11px] text-slate-500 font-medium font-sans">
          <span>Displaying {filteredStudents.length} of {students.length} Total Registered Students</span>
          <span>SIS Record System Active • ISO Security Certified</span>
        </div>
      </div>

      {/* Enroll & Edit Dialog Overlay Model */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-55 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto" id="admission-form-overlay">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-100 transform transition-all flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  {editingStudent ? 'Revise Student File Record' : 'Log New Student Admission'}
                </h3>
                <p className="text-xs text-slate-400 mt-1">Assign Class assignment and legal parenting contact information.</p>
              </div>
              <button 
                id="close-admission-modal"
                onClick={() => setIsDialogOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Form body */}
            <form onSubmit={handleSave} className="p-5 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Full name of student */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Student Full Name *</label>
                  <input 
                    type="text"
                    required
                    id="form-student-name"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Christian Bale"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-medium focus:border-indigo-500 focus:bg-white outline-hidden transition-all"
                  />
                </div>

                {/* Parent Legal Guardian */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Parent or Legal Guardian Name *</label>
                  <input 
                    type="text"
                    required
                    id="form-student-parent"
                    value={formParent}
                    onChange={(e) => setFormParent(e.target.value)}
                    placeholder="e.g. Martha Bale"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-medium focus:border-indigo-500 focus:bg-white outline-hidden transition-all"
                  />
                </div>

                {/* Grade Class Assignment */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Class Level *</label>
                  <select 
                    id="form-student-class"
                    value={formClass}
                    onChange={(e) => setFormClass(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-medium focus:border-indigo-500 focus:bg-white outline-hidden transition-all"
                  >
                    <option value="Class 10">Class 10</option>
                    <option value="Class 9">Class 9</option>
                    <option value="Class 8">Class 8</option>
                  </select>
                </div>

                {/* Section Allocation */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Section *</label>
                  <select 
                    id="form-student-section"
                    value={formSection}
                    onChange={(e) => setFormSection(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-medium focus:border-indigo-500 focus:bg-white outline-hidden transition-all"
                  >
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                  </select>
                </div>

                {/* Roll reference */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Roll Number assigned</label>
                  <input 
                    type="number"
                    id="form-student-roll"
                    value={formRollNo}
                    onChange={(e) => setFormRollNo(e.target.value)}
                    placeholder="15"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-medium focus:border-indigo-500 focus:bg-white outline-hidden transition-all"
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Gender Identification</label>
                  <select 
                    id="form-student-gender"
                    value={formGender}
                    onChange={(e) => setFormGender(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-medium focus:border-indigo-500 focus:bg-white outline-hidden transition-all"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Parent Contact Number */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Guardian Mobile Contact *</label>
                  <input 
                    type="text"
                    required
                    id="form-student-contact"
                    value={formContact}
                    onChange={(e) => setFormContact(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-medium focus:border-indigo-500 focus:bg-white outline-hidden transition-all"
                  />
                </div>

                {/* Date of Birth DOB */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Date of Birth (DOB)</label>
                  <input 
                    type="date"
                    id="form-student-dob"
                    value={formDOB}
                    onChange={(e) => setFormDOB(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-medium focus:border-indigo-500 focus:bg-white outline-hidden transition-all font-mono"
                  />
                </div>

                {/* Student Personal Email */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Custom Student Email identifier (Optional)</label>
                  <input 
                    type="email"
                    id="form-student-email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="Will default to name@eduqube.com if blank"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-medium focus:border-indigo-500 focus:bg-white outline-hidden transition-all font-mono"
                  />
                </div>

                {/* Enrollment status */}
                {editingStudent && (
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Enrolment Status</label>
                    <select 
                      id="form-student-status"
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-medium focus:border-indigo-500 focus:bg-white outline-hidden transition-all"
                    >
                      <option value="Active">Active Student</option>
                      <option value="Suspended">Suspended</option>
                      <option value="Graduated">Graduated (Alumnus)</option>
                    </select>
                  </div>
                )}

              </div>

              {/* Error instructions / warnings */}
              <div className="p-3 bg-indigo-50 rounded-xl flex items-start gap-2 text-[11px] text-indigo-700">
                <span>⚠️</span>
                <span>Upon saving, this profile database registers on our secure school server and automatically provisions parent app credentials.</span>
              </div>

              {/* Form Footer Action pane */}
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button 
                  type="button"
                  id="btn-cancel-admission"
                  onClick={() => setIsDialogOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  id="btn-save-admission"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs hover:shadow-xs cursor-pointer"
                >
                  {editingStudent ? 'Commit Modifications' : 'Finalize Enrolment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dynamic Style Injection for Perfect Browser PDF Export with Gold and Royal Elements */}
      <style>{`
        @media print {
          /* Hide all application chrome, sidebar, other page modules completely */
          body * {
            visibility: hidden !important;
          }
          /* Make sure ONLY the print preview container is visible and styled properly */
          #student-report-print-area, #student-report-print-area * {
            visibility: visible !important;
          }
          /* Absolute layout control for the printed area */
          #student-report-print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            border: 6px double #cca561 !important;
            padding: 40px !important;
            margin: 0 !important;
            box-shadow: none !important;
            background-color: white !important;
            color: black !important;
            font-family: 'Inter', sans-serif !important;
          }
          /* Print page setup config */
          @page {
            size: portrait;
            margin: 12mm;
          }
          /* Force color system adjustments for prints */
          body {
            background-color: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      {/* INDIVIDUAL STUDENT ACADEMIC REPORT PREVIEW & PRINT MODAL */}
      {isReportModalOpen && reportStudent && (() => {
        const studentExamData = getStudentExamData(reportStudent.id);
        const { dipStatus, percentageDiff, latestPerf, prevPerf } = getTrendData(studentExamData);
        const note = studentNotes[reportStudent.id];

        return (
          <div className="fixed inset-0 z-55 overflow-y-auto flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in" id="student-report-modal">
            <div className="bg-[#faf6eb] border-2 border-[#ead2a3] rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              
              {/* Modal Control Header (Gold/Navy Royal Theme) */}
              <div className="bg-gradient-to-r from-[#0d1b3e] to-[#070e24] p-5 text-white flex justify-between items-center border-b border-[#cca561] shrink-0">
                <div className="flex items-center gap-2.5 text-left">
                  <Award className="w-5 h-5 text-[#dfbf85]" />
                  <div>
                    <h3 className="font-display font-bold text-xs md:text-sm tracking-wider uppercase text-[#dfbf85]">Academic Progress Report Chamber</h3>
                    <p className="text-[10px] text-[#ead2a3]/80 italic font-serif">Review performance logbooks and materialize secure grade reports</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setIsReportModalOpen(false);
                    setReportStudent(null);
                  }} 
                  className="p-1.5 hover:bg-white/10 rounded-full text-[#ead2a3] hover:text-white transition-colors cursor-pointer"
                  title="Dismiss report card"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Preview body */}
              <div className="flex-1 overflow-y-auto p-5 md:p-8 space-y-6">
                
                {/* PDF Live Print Layout Wrapper - styled perfectly for print and viewport preview */}
                <div 
                  id="student-report-print-area" 
                  className="bg-white border-2 border-[#ead2a3]/60 rounded-2xl shadow-md p-6 md:p-10 space-y-8 text-slate-800 text-left bg-radial from-white to-slate-50/20"
                >
                  {/* Document Header Panel */}
                  <div className="flex flex-col md:flex-row justify-between items-start border-b-2 border-dashed border-[#ead2a3]/50 pb-6 gap-4">
                    <div className="space-y-1.5 text-left">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-900 text-[#dfbf85] flex items-center justify-center font-bold tracking-tight text-sm border-2 border-[#dfbf85]">
                          Ω
                        </div>
                        <span className="text-[11px] font-bold text-indigo-950 uppercase tracking-widest font-mono">Imperial Academy Council</span>
                      </div>
                      <h2 className="text-lg md:text-xl font-serif font-black text-slate-900 leading-tight">
                        OFFICIAL TRAJECTORY REPORT CARD
                      </h2>
                      <p className="text-[10px] font-mono text-slate-400">
                        Generated: {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })} • Secure ID: SIS-{reportStudent.id.substring(0, 8).toUpperCase()}
                      </p>
                    </div>

                    {/* Certified Seal / Badge Badge */}
                    <div className="bg-[#faf6eb] border border-[#ead2a3] p-3 rounded-2xl flex flex-col items-center justify-center text-center shrink-0 min-w-[140px]">
                      <span className="text-[9px] uppercase tracking-widest font-bold text-[#815e26]">REGISTRY ENROLMENT</span>
                      <span className="text-xs font-mono font-bold text-[#b98d45] mt-1">
                        No. {reportStudent.admissionNo}
                      </span>
                    </div>
                  </div>

                  {/* Student Credentials Bio Grid */}
                  <div className="bg-slate-50 rounded-2xl border border-slate-100 p-5 grid grid-cols-1 md:grid-cols-3 gap-5 text-xs text-left">
                    <div className="space-y-1">
                      <span className="text-[9.5px] uppercase tracking-wider font-bold text-slate-400 font-mono block">Scholar Name</span>
                      <strong className="text-sm font-semibold text-slate-800 block text-indigo-950">{reportStudent.name}</strong>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9.5px] uppercase tracking-wider font-bold text-slate-400 font-mono block">Class Assignment</span>
                      <span className="text-xs font-semibold text-slate-700 block">{reportStudent.className} • Section {reportStudent.section}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9.5px] uppercase tracking-wider font-bold text-slate-400 font-mono block">Register Roll</span>
                      <span className="text-xs font-mono font-semibold text-slate-700 block">Roll #{reportStudent.rollNo}</span>
                    </div>

                    <div className="space-y-1 border-t border-slate-200/50 pt-3 md:border-none md:pt-0">
                      <span className="text-[9.5px] uppercase tracking-wider font-bold text-slate-400 font-mono block">Parent / Guardian</span>
                      <span className="text-xs font-medium text-slate-700 block">{reportStudent.parentsName}</span>
                    </div>
                    <div className="space-y-1 border-t border-slate-200/50 pt-3 md:border-none md:pt-0">
                      <span className="text-[9.5px] uppercase tracking-wider font-bold text-slate-400 font-mono block">Guardian Contact</span>
                      <span className="text-xs font-mono text-slate-700 block">{reportStudent.contact}</span>
                    </div>
                    <div className="space-y-1 border-t border-slate-200/50 pt-3 md:border-none md:pt-0">
                      <span className="text-[9.5px] uppercase tracking-wider font-bold text-slate-400 font-mono block">Academy Mail ID</span>
                      <span className="text-xs font-mono text-slate-700 block">{reportStudent.email}</span>
                    </div>
                  </div>

                  {/* SECRETARIAT ADVISORY NOTE / PERSISTED TAG */}
                  {note && (
                    <div className="bg-[#faf6eb]/70 border border-[#ead2a3]/45 p-4 rounded-xl text-left">
                      <span className="text-[9px] uppercase tracking-widest font-extrabold text-[#815e26] font-mono block mb-1">Administrative Note / Persistent Tag</span>
                      <p className="text-xs text-[#815e26] font-medium italic">
                        "{note}"
                      </p>
                    </div>
                  )}

                  {/* Performance Warning / Praises Alert Area */}
                  {studentExamData.length === 0 ? (
                    <div className="bg-amber-50/50 border border-dashed border-amber-200 p-6 rounded-2xl text-center">
                      <p className="text-xs font-bold text-amber-800 uppercase tracking-widest">No Scorebook Registry Logs Active</p>
                      <p className="text-[11px] text-slate-500 mt-1">Please register examination marks for this student to construct their dynamic performance indicator trajectory.</p>
                    </div>
                  ) : (
                    <div className="space-y-6 text-left">
                      
                      {/* Trend Warnings */}
                      {dipStatus === 'dip' && latestPerf && prevPerf && (
                        <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl flex items-start gap-3 text-xs text-rose-850">
                          <TrendingDown className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-extrabold text-rose-950 uppercase tracking-wide">Academic Drop Alert Initiated (-{Math.abs(percentageDiff)}%)</p>
                            <p className="text-[11.5px] text-rose-700 mt-1 font-serif leading-relaxed">
                              A score depletion of <strong>{Math.abs(percentageDiff)}%</strong> has been registered. Scholastic status dropped from <strong>{prevPerf.percentage}%</strong> ({prevPerf.subject} - {prevPerf.examTitle}) down to <strong>{latestPerf.percentage}%</strong> ({latestPerf.subject} - {latestPerf.examTitle}). Counseling interventions with the parenting council are recommended.
                            </p>
                          </div>
                        </div>
                      )}

                      {dipStatus === 'gain' && latestPerf && prevPerf && (
                        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-start gap-3 text-xs text-emerald-850">
                          <TrendingUp className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-extrabold text-emerald-950 uppercase tracking-wide">Academic Excellence Acknowledgment (+{percentageDiff}%)</p>
                            <p className="text-[11.5px] text-emerald-700 mt-1 font-serif leading-relaxed">
                              Splendid progression detected! Score improved by <strong>+{percentageDiff}%</strong>, climbing from <strong>{prevPerf.percentage}%</strong> to <strong>{latestPerf.percentage}%</strong>. The dynamic learning curve indices remain highly outstanding.
                            </p>
                          </div>
                        </div>
                      )}

                      {dipStatus === 'stable' && latestPerf && (
                        <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex items-start gap-3 text-xs text-indigo-850">
                          <Award className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-extrabold text-indigo-950 uppercase tracking-wide">Academic Consistency Validated</p>
                            <p className="text-[11.5px] text-indigo-700 mt-1 font-serif leading-relaxed">
                              Student scorebook logs remain completely stable, indicating a balanced scholastic performance of <strong>{latestPerf.percentage}%</strong>. Standards align properly with modern syllabus curves.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Visual Trajectory Bar representation (optimized for PDF Printing stability) */}
                      <div className="space-y-3.5">
                        <h4 className="text-[10px] uppercase font-bold text-slate-500 tracking-wider font-sans">Dynamic Trajectory Chart representation</h4>
                        <div className="grid grid-cols-3 gap-4.5 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                          {studentExamData.map((ex, idx) => {
                            let barColorClass = "bg-indigo-600";
                            let textClass = "text-indigo-800 bg-indigo-50 border-indigo-100";
                            if (ex.percentage < 55) {
                              barColorClass = "bg-rose-500";
                              textClass = "text-rose-800 bg-rose-50 border-rose-100";
                            } else if (ex.percentage < 75) {
                              barColorClass = "bg-amber-500";
                              textClass = "text-amber-800 bg-amber-50 border-amber-100";
                            } else {
                              barColorClass = "bg-emerald-500";
                              textClass = "text-emerald-800 bg-emerald-50 border-emerald-100";
                            }

                            return (
                              <div key={idx} className="space-y-2 text-left">
                                <div className="flex justify-between items-center text-[10.5px]">
                                  <span className="font-semibold text-slate-600 truncate max-w-[80px] md:max-w-none">{ex.examTitle}</span>
                                  <span className="font-mono text-slate-400 text-[10px]">{ex.subject}</span>
                                </div>
                                
                                {/* Vertical progress bar chamber */}
                                <div className="h-4.5 bg-slate-200/70 rounded-lg overflow-hidden flex items-center relative border border-slate-100 shadow-3xs">
                                  <div 
                                    className={`${barColorClass} h-full transition-all`} 
                                    style={{ width: `${ex.percentage}%` }}
                                  ></div>
                                  <span className="absolute right-2 font-mono font-bold text-[9px] text-[#0d1b3e]">
                                    {ex.percentage}%
                                  </span>
                                </div>

                                <div className="flex justify-between items-center text-[9px]">
                                  <span className="text-slate-400">{ex.marksObtained}/{ex.maxMarks} Marks</span>
                                  <span className={`px-2 py-0.5 rounded-sm font-bold border text-[8.5px] uppercase ${textClass}`}>
                                    Grade {ex.grade}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Explicit detailed score ledger table */}
                      <div className="space-y-3.5">
                        <h4 className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Exam Board Ledger Records</h4>
                        <div className="overflow-x-auto border border-slate-200 rounded-xl">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="bg-slate-50 border-b border-slate-200 text-[9.5px] uppercase tracking-wider font-bold text-slate-400">
                                <th className="p-3">Exam Session</th>
                                <th className="p-3">Subject paper</th>
                                <th className="p-3 font-mono">Date Logs</th>
                                <th className="p-3 text-center">Marks Sec.</th>
                                <th className="p-3 text-center">Benchmark (%)</th>
                                <th className="p-3 text-center">Council Grade</th>
                                <th className="p-3">Secretariat Remarks</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {studentExamData.map((ex, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/40">
                                  <td className="p-3 font-semibold text-slate-800">{ex.examTitle}</td>
                                  <td className="p-3 text-slate-600 font-medium">{ex.subject}</td>
                                  <td className="p-3 font-mono text-slate-400 font-medium">{ex.date || 'TBD'}</td>
                                  <td className="p-3 text-center font-mono font-semibold text-slate-700">{ex.marksObtained} / {ex.maxMarks}</td>
                                  <td className="p-3 text-center font-mono font-bold text-indigo-950">{ex.percentage}%</td>
                                  <td className="p-3 text-center">
                                    <span className="inline-block bg-[#faf6eb] text-[#815e26] border border-[#ead2a3] font-mono font-bold px-2 py-0.5 rounded">
                                      {ex.grade}
                                    </span>
                                  </td>
                                  <td className="p-3 text-slate-500 italic max-w-[150px] truncate">{ex.remarks || 'No notes added'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Bottom Endorsement block */}
                  <div className="pt-8 border-t border-slate-200 space-y-6">
                    <p className="text-[9.5px] italic text-[#815e26] text-center font-serif leading-relaxed px-4">
                      "This dossier represents certified official records of scholastic registry compliance and benchmark standard progression, maintained in perpetuity."
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                      <div className="md:col-span-12 lg:col-span-5 text-center space-y-1 border-t border-slate-200 pt-3">
                        <p className="text-[#815e26] font-serif text-sm italic font-semibold">A. K. Shastri</p>
                        <p className="text-[8px] text-slate-400 tracking-wider uppercase font-semibold">Chancellor Dean of Seminary</p>
                      </div>

                      <div className="md:col-span-12 lg:col-span-2 flex justify-center py-2 lg:py-0">
                        <div className="relative w-11 h-11 flex items-center justify-center bg-gradient-to-br from-[#b98d45] to-[#815e26] rounded-full shadow-md text-white border-2 border-[#faf6eb] shrink-0 outline-2 outline-[#b98d45] outline-dashed">
                          <Award className="w-5 h-5 text-white animate-pulse" />
                        </div>
                      </div>

                      <div className="md:col-span-12 lg:col-span-5 text-center space-y-1 border-t border-slate-200 pt-3">
                        <p className="text-slate-800 font-mono text-[10px] font-bold">VERIFIED BOARD REGISTRY</p>
                        <p className="text-[8px] text-slate-400 tracking-wider uppercase font-semibold">Secretariat Archives Controller</p>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Bottom Print / Save Controls */}
              <div className="bg-[#f5eedc] border-t border-[#ead2a3] p-4 flex flex-wrap gap-2.5 justify-end items-center shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setIsReportModalOpen(false);
                    setReportStudent(null);
                  }}
                  className="px-4.5 py-2 bg-white hover:bg-[#faf6eb] border border-[#ead2a3]/65 text-[#815e26] font-display font-semibold rounded-xl text-xs cursor-pointer transition-all active:scale-95 shadow-3xs"
                  id="btn-close-pdf-preview"
                >
                  Cancel & Close Preview
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-6 py-2 bg-gradient-to-r from-[#9e7534] to-[#b98d45] hover:from-[#815e26] hover:to-[#9e7534] text-white font-display font-bold rounded-xl text-xs cursor-pointer transition-all shadow-sm active:scale-95"
                  id="btn-print-save-pdf"
                >
                  <Printer className="w-4 h-4 text-white" />
                  <span>Print or Export PDF Report</span>
                </button>
              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
};
