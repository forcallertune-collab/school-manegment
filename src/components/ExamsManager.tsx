import React, { useState } from 'react';
import { 
  Award, 
  Plus, 
  Calendar, 
  Search, 
  Edit, 
  Trash2, 
  CheckCircle, 
  X,
  FileText,
  Bookmark,
  TrendingUp,
  User,
  Clock,
  Sparkles,
  MapPin
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { Student, Exam, StudentResult } from '../types';

interface ExamsManagerProps {
  students: Student[];
  exams: Exam[];
  results: StudentResult[];
  onAddExam: (newExam: Omit<Exam, 'id'>) => void;
  onAddResult: (newResult: Omit<StudentResult, 'id'>) => void;
}

export const ExamsManager: React.FC<ExamsManagerProps> = ({
  students,
  exams,
  results,
  onAddExam,
  onAddResult
}) => {
  // Navigation tabs inside Exams module
  const [activeTab, setActiveTab] = useState<'schedule' | 'report-cards'>('schedule');

  // Interactive controls
  const [scheduleSearch, setScheduleSearch] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  
  // Dialog controls
  const [isNewExamOpen, setIsNewExamOpen] = useState(false);
  const [isGradeEntryOpen, setIsGradeEntryOpen] = useState(false);

  // New Exam Schedule Forms
  const [examTitle, setExamTitle] = useState('Term 1 Final Examination');
  const [examClass, setExamClass] = useState('Class 10');
  const [examSubject, setExamSubject] = useState('Physics Essentials');
  const [examDate, setExamDate] = useState('2026-06-15');
  const [examTime, setExamTime] = useState('09:00 AM - 11:30 AM');
  const [examRoom, setExamRoom] = useState('Examination Hall A');
  const [examMaxMarks, setExamMaxMarks] = useState(100);

  // Save new Exam Result / Grade entry
  const [gradeExamId, setGradeExamId] = useState('');
  const [gradeStudentId, setGradeStudentId] = useState('');
  const [gradeMarks, setGradeMarks] = useState(85);
  const [gradeRemarks, setGradeRemarks] = useState('Excellent performance. Showing key analytical comprehension.');

  // Initialize selectedStudentId if empty
  if (!selectedStudentId && students.length > 0) {
    setSelectedStudentId(students[0].id);
  }

  // Calculate grade letters based on ratio of marks obtained
  const calculateGradeFromMarks = (obtained: number, max: number): string => {
    const pct = (obtained / max) * 100;
    if (pct >= 91) return 'A1';
    if (pct >= 81) return 'A2';
    if (pct >= 71) return 'B1';
    if (pct >= 61) return 'B2';
    if (pct >= 51) return 'C1';
    if (pct >= 41) return 'C2';
    if (pct >= 33) return 'D';
    return 'E';
  };

  // Filter exam schedule list
  const filteredExams = exams.filter(e => 
    e.title.toLowerCase().includes(scheduleSearch.toLowerCase()) || 
    e.subject.toLowerCase().includes(scheduleSearch.toLowerCase())
  );

  // Handle adding new exam calendar
  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault();
    onAddExam({
      title: examTitle,
      className: examClass,
      subject: examSubject,
      date: examDate,
      time: examTime,
      room: examRoom,
      maxMarks: Number(examMaxMarks)
    });
    setIsNewExamOpen(false);
  };

  // Handle saving student grade score card
  const handleSaveGradeEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradeExamId || !gradeStudentId) {
      alert('Please select both the examination reference and the candidate student.');
      return;
    }

    const selectedExam = exams.find(e=>e.id === gradeExamId);
    const selectedStudent = students.find(s=>s.id === gradeStudentId);
    if (!selectedExam || !selectedStudent) return;

    onAddResult({
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      className: selectedStudent.className,
      examId: selectedExam.id,
      examTitle: selectedExam.title,
      subject: selectedExam.subject,
      marksObtained: Number(gradeMarks),
      maxMarks: selectedExam.maxMarks,
      grade: calculateGradeFromMarks(Number(gradeMarks), selectedExam.maxMarks),
      remarks: gradeRemarks
    });

    setIsGradeEntryOpen(false);
    // Switch to report-cards viewer directly to showcase the newly inputted score!
    setSelectedStudentId(selectedStudent.id);
    setActiveTab('report-cards');
  };

  // Find results for selected student
  const studentResultsList = results.filter(r => r.studentId === selectedStudentId);

  // Compile trend analysis dataset using Recharts
  const gradeTrendData = studentResultsList
    .map(res => {
      const examInfo = exams.find(e => e.id === res.examId);
      return {
        id: res.id,
        examTitle: res.examTitle,
        subject: res.subject,
        date: examInfo?.date || '2026-05-24',
        percentage: Math.round((res.marksObtained / res.maxMarks) * 100),
        marksText: `${res.marksObtained}/${res.maxMarks}`,
        subjectAndExam: `${res.subject} (${res.examTitle})`
      };
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const currentStudent = students.find(s => s.id === selectedStudentId);

  // Compute overall average GPA indicators
  const totalScoreCount = studentResultsList.length;
  const averagePercentage = totalScoreCount > 0 
    ? Math.round(studentResultsList.reduce((sum, r) => sum + (r.marksObtained / r.maxMarks * 100), 0) / totalScoreCount)
    : 0;

  const letterCumulativeGrade = averagePercentage >= 91 ? 'A1' :
                                 averagePercentage >= 81 ? 'A2' :
                                 averagePercentage >= 71 ? 'B1' :
                                 averagePercentage >= 61 ? 'B2' :
                                 averagePercentage >= 51 ? 'C1' :
                                 averagePercentage >= 41 ? 'C2' : 'D';

  return (
    <div className="space-y-6" id="exams-module-container">
      {/* Title Header summary brand layout */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-xs border border-slate-100">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Award className="text-indigo-600 w-6 h-6" />
            Exams & Performance Desk
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Control examination timetables, perform grades logs, and format academic progress records.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            id="btn-schedule-exam"
            onClick={() => setIsNewExamOpen(true)}
            className="flex items-center gap-2 px-4.5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-xs rounded-xl shadow-xs transition-all cursor-pointer"
          >
            Create Exam Calendar
          </button>
          
          <button 
            id="btn-enter-grades"
            onClick={() => {
              if (exams.length > 0 && students.length > 0) {
                setGradeExamId(exams[0].id);
                setGradeStudentId(students[0].id);
                setGradeMarks(exams[0].maxMarks * 0.9);
              }
              setIsGradeEntryOpen(true);
            }}
            className="flex items-center gap-2 px-4.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4.5 h-4.5" />
            Post Student Scores
          </button>
        </div>
      </div>

      {/* Module Navigation Tabs */}
      <div className="flex border-b border-slate-100" id="exams-navigation-tabs">
        <button
          id="tab-exam-schedule"
          onClick={() => setActiveTab('schedule')}
          className={`py-3 px-6 text-xs font-bold font-sans border-b-2 transition-all cursor-pointer ${
            activeTab === 'schedule' 
              ? 'border-indigo-600 text-indigo-750' 
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Assessment Calendars
        </button>
        <button
          id="tab-report-cards"
          onClick={() => setActiveTab('report-cards')}
          className={`py-3 px-6 text-xs font-bold font-sans border-b-2 transition-all cursor-pointer ${
            activeTab === 'report-cards' 
              ? 'border-indigo-600 text-indigo-750' 
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Report Card / Progress Report
        </button>
      </div>

      {/* VIEW A: ASSESSMENT TIMETABLE CALENDARS */}
      {activeTab === 'schedule' && (
        <div className="space-y-5" id="assessment-calendars-view">
          {/* Query bar */}
          <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-100 flex items-center justify-between gap-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input 
                type="text"
                id="exams-calendar-search"
                value={scheduleSearch}
                onChange={(e) => setScheduleSearch(e.target.value)}
                placeholder="Search calendars by subject space..."
                className="w-full bg-slate-50 pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 outline-hidden focus:border-indigo-500 focus:bg-white transition-all text-slate-700"
              />
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Class assessments are pre-validated against state standards.</p>
          </div>

          {/* Calendars grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" id="exams-grid">
            {filteredExams.map((exam) => (
              <div key={exam.id} className="bg-white p-5 rounded-2xl shadow-xs border border-slate-100 hover:border-indigo-150 hover:shadow-sm transition-all flex flex-col justify-between space-y-4" id={`exam-card-${exam.id}`}>
                <div className="space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[9.5px] bg-slate-50 text-slate-500 border border-slate-200 px-2 py-0.5 rounded-md font-mono font-bold uppercase tracking-wider">
                      {exam.className}
                    </span>
                    <span className="text-[9.5px] bg-indigo-50 text-indigo-700 font-mono px-2 py-0.5 rounded-full font-bold">
                      Max: {exam.maxMarks} MARKS
                    </span>
                  </div>
                  
                  <h3 className="text-xs font-bold text-slate-800 tracking-tight leading-snug">{exam.title}</h3>
                  <p className="text-xs font-black text-indigo-900">{exam.subject}</p>
                </div>

                <div className="pt-4 border-t border-slate-50 space-y-2.5 text-[11px] text-slate-500">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono">{exam.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono">{exam.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{exam.room}</span>
                  </div>
                </div>
              </div>
            ))}

            {filteredExams.length === 0 && (
              <p className="text-xs text-slate-400 py-10 col-span-full text-center">No exam schedules matches found.</p>
            )}
          </div>
        </div>
      )}

      {/* VIEW B: STUDENT REPORT CARDS */}
      {activeTab === 'report-cards' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in text-slate-700" id="report-cards-view">
          
          {/* Left panel: Pick candidate */}
          <div className="lg:col-span-4 bg-white p-5 rounded-2xl shadow-xs border border-slate-100 flex flex-col justify-between" id="report-card-candidate-picker">
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Select Candidate Student</h3>
              <p className="text-xs text-slate-500">Browse registrations to review current trimester performance outcomes.</p>
              
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {students.map((stu) => (
                  <button
                    key={stu.id}
                    id={`btn-report-student-${stu.id}`}
                    onClick={() => setSelectedStudentId(stu.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                      selectedStudentId === stu.id 
                        ? 'bg-indigo-50 border-indigo-400 text-indigo-900 shadow-2xs' 
                        : 'bg-white hover:bg-slate-50 border-slate-100 text-slate-600'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-indigo-700 text-xs font-bold">
                      {stu.name.split(' ').map(n=>n[0]).join('')}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{stu.name}</h4>
                      <p className="text-[10px] text-slate-400 font-mono">Ref {stu.id} • {stu.className}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-50 text-[10px] text-slate-400 select-none">
              Report card generation is real-time and updates with newly posted scores instantly.
            </div>
          </div>

          {/* Right Panel: Academic Report Card print preview */}
          <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-6" id="report-card-performance-pane">
            {currentStudent ? (
              <div className="space-y-6">
                
                {/* Academic credentials summary */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 bg-slate-50 rounded-2xl border border-slate-100 gap-4">
                  <div>
                    <span className="text-[10px] bg-slate-200/80 px-2 py-0.5 rounded font-mono font-bold text-slate-600">Officiating Record</span>
                    <h2 className="text-base font-bold text-slate-800 mt-1">{currentStudent.name}</h2>
                    <p className="text-xs text-slate-500 mt-0.5">{currentStudent.className} / Section {currentStudent.section} • Parent: {currentStudent.parentsName}</p>
                  </div>

                  <div className="flex items-center gap-3 border-l sm:border-l-2 border-slate-200 pl-4">
                    <div className="text-center">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">CBSE Grade</p>
                      <span className="text-2xl font-black text-indigo-900">{letterCumulativeGrade}</span>
                    </div>
                    <div className="text-center pl-3 border-l border-slate-200">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Overall Marks %</p>
                      <span className="text-md font-mono font-black text-slate-700">{averagePercentage}%</span>
                    </div>
                  </div>
                </div>

                {/* Academic Progress Curve (Grade Trend Over Time) using Recharts */}
                <div className="bg-[#faf6eb]/30 border border-[#ead2a3]/40 p-5 rounded-2xl shadow-3xs space-y-3" id="grade-trend-visualization-panel">
                  <div className="flex justify-between items-center bg-white/70 px-4 py-3 rounded-xl border border-[#ead2a3]/20">
                    <div>
                      <h3 className="text-xs font-bold text-[#815e26] uppercase tracking-wider font-display">Chronological Performance Curve</h3>
                      <p className="text-[10px] text-slate-500 mt-0.5 italic">Real-time tracking of exam percentage standards across timelines.</p>
                    </div>
                    <span className="flex items-center gap-1.5 text-[9.5px] font-bold text-[#9e7534] bg-[#faf6eb] border border-[#ead2a3]/50 px-2.5 py-1 rounded-full uppercase tracking-wider font-display">
                      <TrendingUp className="w-3.5 h-3.5 text-[#b98d45]" />
                      <span>Chronicle View</span>
                    </span>
                  </div>

                  <div className="h-48 w-full bg-white/65 p-3 rounded-xl border border-dashed border-[#ead2a3]/30 flex items-center justify-center">
                    {gradeTrendData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={gradeTrendData} margin={{ top: 10, right: 20, left: -25, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#fcfaf2" />
                          <XAxis 
                            dataKey="date" 
                            stroke="#815e26" 
                            opacity={0.7}
                            fontSize={9} 
                            tickLine={false}
                            className="font-mono text-[9px]"
                          />
                          <YAxis 
                            stroke="#815e26" 
                            opacity={0.7}
                            fontSize={9} 
                            domain={[0, 100]} 
                            tickLine={false}
                            axisLine={false}
                            unit="%"
                            className="font-mono text-[9px]"
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#0d1b3e', 
                              borderRadius: '12px', 
                              border: '1px solid #cca561',
                              color: 'white',
                              fontSize: '11px' 
                            }} 
                            labelClassName="font-display font-bold text-[#dfbf85] text-[10px]"
                            formatter={(value: any, name: any, props: any) => [
                              `${value}% obtained (${props.payload.marksText})`,
                              `${props.payload.subject} (${props.payload.examTitle})`
                            ]}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="percentage" 
                            stroke="#b98d45" 
                            strokeWidth={3} 
                            activeDot={{ r: 6, stroke: '#0d1b3e', strokeWidth: 2 }}
                            dot={{ r: 4, fill: '#815e26', strokeWidth: 0 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center p-4">
                        <TrendingUp className="w-8 h-8 text-[#ead2a3] mb-1.5" />
                        <p className="text-xs text-slate-500 font-medium">No recorded grades available for line trend plotting yet.</p>
                        <p className="text-[10px] text-slate-400 italic mt-0.5">Post scholar exam scores in the menu above to map the performance curve curve.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Performance records itemized list table */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Acquired Grade Book Scores</h3>
                  
                  <div className="rounded-xl border border-slate-100 overflow-hidden">
                    <table className="w-full text-left border-collapse" id="report-card-item-table">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-105 text-[11px] text-slate-400 font-mono italic">
                          <th className="p-3">Examination schedule space</th>
                          <th className="p-3">Subject Specialty</th>
                          <th className="p-3">Raw score obtained</th>
                          <th className="p-3 text-center">Grade Issued</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 text-xs">
                        {studentResultsList.map(res => (
                          <tr key={res.id} className="hover:bg-slate-50/40" id={`student-grade-row-${res.id}`}>
                            <td className="p-3">
                              <p className="font-semibold text-slate-700">{res.examTitle}</p>
                              <p className="text-[10px] text-slate-400 italic font-mono mt-0.5">"{res.remarks}"</p>
                            </td>
                            <td className="p-3 text-slate-600 font-medium">{res.subject}</td>
                            <td className="p-3 font-mono font-bold text-slate-800">{res.marksObtained} / {res.maxMarks}</td>
                            <td className="p-3 text-center">
                              <span className={`px-2 py-0.5 rounded text-[10.5px] font-black font-mono ${
                                res.grade.includes('A') ? 'bg-emerald-50 text-emerald-800' :
                                res.grade.includes('B') ? 'bg-indigo-50 text-indigo-800' :
                                'bg-rose-50 text-rose-800'
                              }`}>
                                {res.grade}
                              </span>
                            </td>
                          </tr>
                        ))}

                        {studentResultsList.length === 0 && (
                          <tr>
                            <td colSpan={4} className="p-8 text-center text-slate-400 italic text-xs">
                              No examination grade records logged for this student yet. Click "Post Student Scores" to enter marks.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-12">No candidate selected. Choose a student from the sidebar roster.</p>
            )}
          </div>

        </div>
      )}

      {/* OVERLAY EXAM A: CREATE NEW EXAM CALENDAR TIMETABLE SLOT */}
      {isNewExamOpen && (
        <div className="fixed inset-0 z-55 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4" id="exam-calendar-modal">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-100 flex flex-col">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
              <h3 className="text-sm font-bold text-slate-800">Establish Examination Window</h3>
              <p className="text-xs text-slate-400 mt-1">Populate assessment timings and room details.</p>
            </div>

            <form onSubmit={handleCreateExam} className="p-5 space-y-4 text-xs font-sans text-slate-705">
              
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Assessment Program Title *</label>
                <input 
                  type="text"
                  required
                  id="form-exam-title"
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                  placeholder="e.g. Mid-Term Quick Assessment"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-medium focus:border-indigo-500 focus:bg-white transition-all outline-hidden"
                />
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 font-sans">Specialist Subject Sector *</label>
                <input 
                  type="text"
                  required
                  id="form-exam-subject"
                  value={examSubject}
                  onChange={(e) => setExamSubject(e.target.value)}
                  placeholder="e.g. Physics Essentials"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-medium focus:border-indigo-500 focus:bg-white transition-all outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Target Class */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Assessed Class *</label>
                  <select
                    id="form-exam-class"
                    value={examClass}
                    onChange={(e) => setExamClass(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-medium focus:border-indigo-500 focus:bg-white outline-hidden"
                  >
                    <option value="Class 10">Class 10</option>
                    <option value="Class 9">Class 9</option>
                    <option value="Class 8">Class 8</option>
                  </select>
                </div>

                {/* Max Marks */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Max Marks scale *</label>
                  <input 
                    type="number"
                    required
                    id="form-exam-maxmarks"
                    value={examMaxMarks}
                    onChange={(e) => setExamMaxMarks(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-medium focus:border-indigo-500 focus:bg-white transition-all font-mono"
                  />
                </div>

                {/* Exam Date */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Examination Day *</label>
                  <input 
                    type="date"
                    required
                    id="form-exam-date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-medium focus:border-indigo-500 focus:bg-white transition-all font-mono"
                  />
                </div>

                {/* Exam Time */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Timings Duration *</label>
                  <input 
                    type="text"
                    required
                    id="form-exam-time"
                    value={examTime}
                    onChange={(e) => setExamTime(e.target.value)}
                    placeholder="09:00 AM - 11:30 AM"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-medium focus:border-indigo-500 focus:bg-white transition-all font-mono"
                  />
                </div>

                {/* Exam Room */}
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 mb-1 font-sans">Exam seating Venue Room *</label>
                  <input 
                    type="text"
                    required
                    id="form-exam-room"
                    value={examRoom}
                    onChange={(e) => setExamRoom(e.target.value)}
                    placeholder="e.g. West Seminar Wing"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-medium focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  id="btn-cancel-exam-creation"
                  onClick={() => setIsNewExamOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-500 rounded-xl text-xs font-semibold cursor-pointer hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="btn-save-exam-creation"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Confirm Assessment Slot
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* OVERLAY EXAM B: GRADE SCORE POST ENTRY PANEL */}
      {isGradeEntryOpen && (
        <div className="fixed inset-0 z-55 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4" id="grades-score-modal">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-100 flex flex-col">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
              <h3 className="text-sm font-bold text-slate-800">Assign Gradebook Record</h3>
              <p className="text-xs text-slate-400 mt-1">Transference of student score ratios into formal reports database.</p>
            </div>

            <form onSubmit={handleSaveGradeEntry} className="p-5 space-y-4 text-xs font-sans text-slate-705">
              
              {/* Select Exam Program */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">For Assessment Event *</label>
                <select
                  id="form-grade-exam-id"
                  value={gradeExamId}
                  onChange={(e) => setGradeExamId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-medium focus:border-indigo-500 focus:bg-white"
                >
                  {exams.map(ex => (
                    <option key={ex.id} value={ex.id}>{ex.title} - {ex.subject} ({ex.className})</option>
                  ))}
                </select>
              </div>

              {/* Select student candidate */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 font-sans">For Student Candidate *</label>
                <select
                  id="form-grade-student-id"
                  value={gradeStudentId}
                  onChange={(e) => setGradeStudentId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-medium focus:border-indigo-500 focus:bg-white"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.id} - {s.className})</option>
                  ))}
                </select>
              </div>

              {/* Marks inputs */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Marks Obtained *</label>
                <input 
                  type="number"
                  required
                  id="form-grade-marks"
                  value={gradeMarks}
                  onChange={(e) => setGradeMarks(Number(e.target.value))}
                  placeholder="85"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-bold focus:border-indigo-500 focus:bg-white outline-hidden transition-all font-mono"
                />
              </div>

              {/* Remarks descriptors */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 font-sans">Academic Faculty Remarks *</label>
                <textarea 
                  required
                  id="form-grade-remarks"
                  value={gradeRemarks}
                  onChange={(e) => setGradeRemarks(e.target.value)}
                  placeholder="Express teacher feedback observations..."
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-medium focus:border-indigo-500 focus:bg-white outline-hidden"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  id="btn-cancel-grade-post"
                  onClick={() => setIsGradeEntryOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-500 rounded-xl text-xs font-semibold cursor-pointer hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="btn-save-grade-post"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Log Student Result
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
