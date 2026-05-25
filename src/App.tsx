import { useState, useEffect } from 'react';
import { 
  School, 
  LayoutDashboard, 
  Users, 
  CheckSquare, 
  DollarSign, 
  Award, 
  BarChart3, 
  MessageSquare, 
  FolderGit, 
  Calendar, 
  Clock, 
  Menu, 
  X, 
  Bell, 
  User, 
  LogOut, 
  ChevronRight,
  ShieldAlert,
  Smartphone,
  ShieldCheck
} from 'lucide-react';

import { Student, Staff, AttendanceRecord, FeeItem, Exam, StudentResult, CommunicationAnnouncement, TimetableSlot, VisitorLog } from './types';
import { defaultRoles, Role } from './components/RBACManager';
import { 
  INITIAL_STUDENTS, 
  INITIAL_STAFF, 
  INITIAL_ATTENDANCE, 
  INITIAL_FEES, 
  INITIAL_EXAMS, 
  INITIAL_RESULTS, 
  INITIAL_COMMUNICATIONS, 
  INITIAL_TIMETABLE, 
  INITIAL_VISITORS 
} from './data/mockData';

// Subcomponents import
import { DashboardOverview } from './components/DashboardOverview';
import { StudentManager } from './components/StudentManager';
import { AttendanceManager } from './components/AttendanceManager';
import { FeesManager } from './components/FeesManager';
import { ExamsManager } from './components/ExamsManager';
import { ReportsAnalytics } from './components/ReportsAnalytics';
import { ParentCommunication } from './components/ParentCommunication';
import { StaffManager } from './components/StaffManager';
import { TimetableManager } from './components/TimetableManager';
import { VisitorManager } from './components/VisitorManager';
import { BulkWhatsAppManager } from './components/BulkWhatsAppManager';
import { RBACManager } from './components/RBACManager';

// Role portals import
import { StudentPortal } from './components/StudentPortal';
import { TeacherPortal } from './components/TeacherPortal';
import { AccountPortal } from './components/AccountPortal';
import { ParentPortal } from './components/ParentPortal';

export default function App() {
  // Role selector state
  const [activeRole, setActiveRole] = useState<'admin' | 'student' | 'teacher' | 'exam' | 'account' | 'parent'>('admin');

  // Navigation active state
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isNotifyOpen, setIsNotifyOpen] = useState(false);

  // Core Persistent States loaded from LocalStorage
  const [students, setStudents] = useState<Student[]>(() => {
    const local = localStorage.getItem('eduqube_students');
    return local ? JSON.parse(local) : INITIAL_STUDENTS;
  });

  const [staff, setStaff] = useState<Staff[]>(() => {
    const local = localStorage.getItem('eduqube_staff');
    return local ? JSON.parse(local) : INITIAL_STAFF;
  });

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    const local = localStorage.getItem('eduqube_attendance');
    return local ? JSON.parse(local) : INITIAL_ATTENDANCE;
  });

  const [fees, setFees] = useState<FeeItem[]>(() => {
    const local = localStorage.getItem('eduqube_fees');
    return local ? JSON.parse(local) : INITIAL_FEES;
  });

  const [exams, setExams] = useState<Exam[]>(() => {
    const local = localStorage.getItem('eduqube_exams');
    return local ? JSON.parse(local) : INITIAL_EXAMS;
  });

  const [results, setResults] = useState<StudentResult[]>(() => {
    const local = localStorage.getItem('eduqube_results');
    return local ? JSON.parse(local) : INITIAL_RESULTS;
  });

  const [announcements, setAnnouncements] = useState<CommunicationAnnouncement[]>(() => {
    const local = localStorage.getItem('eduqube_communications');
    return local ? JSON.parse(local) : INITIAL_COMMUNICATIONS;
  });

  const [timetable, setTimetable] = useState<TimetableSlot[]>(() => {
    const local = localStorage.getItem('eduqube_timetable');
    return local ? JSON.parse(local) : INITIAL_TIMETABLE;
  });

  const [visitors, setVisitors] = useState<VisitorLog[]>(() => {
    const local = localStorage.getItem('eduqube_visitors');
    return local ? JSON.parse(local) : INITIAL_VISITORS;
  });

  // Automatically sync state modifications of entities into browser client localStorage
  useEffect(() => {
    localStorage.setItem('eduqube_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('eduqube_staff', JSON.stringify(staff));
  }, [staff]);

  useEffect(() => {
    localStorage.setItem('eduqube_attendance', JSON.stringify(attendance));
  }, [attendance]);

  useEffect(() => {
    localStorage.setItem('eduqube_fees', JSON.stringify(fees));
  }, [fees]);

  useEffect(() => {
    localStorage.setItem('eduqube_exams', JSON.stringify(exams));
  }, [exams]);

  useEffect(() => {
    localStorage.setItem('eduqube_results', JSON.stringify(results));
  }, [results]);

  useEffect(() => {
    localStorage.setItem('eduqube_communications', JSON.stringify(announcements));
  }, [announcements]);

  useEffect(() => {
    localStorage.setItem('eduqube_timetable', JSON.stringify(timetable));
  }, [timetable]);

  useEffect(() => {
    localStorage.setItem('eduqube_visitors', JSON.stringify(visitors));
  }, [visitors]);

  // Touchless URL QR code scan detector
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const checkoutVisitorId = urlParams.get('checkoutVisitorId');
      if (checkoutVisitorId) {
        // Find the visitor to verify and display alerts
        const visitor = visitors.find(v => v.id === checkoutVisitorId);
        if (visitor && !visitor.checkOut) {
          // Check out matching visitor with current time 
          const now = new Date();
          const hours = now.getHours();
          const minutes = now.getMinutes().toString().padStart(2, '0');
          const ampm = hours >= 12 ? 'PM' : 'AM';
          const hour12 = hours % 12 || 12;
          const time = `${hour12.toString().padStart(2, '0')}:${minutes} ${ampm}`;
          
          handleCheckOutVisitor(checkoutVisitorId, time);
          
          // Switch tab directly to show visitor section
          setActiveTab('visitors');
          
          // Show user-friendly browser alert representing checkout confirmation
          alert(`Touchless QR Check-Out Successful!\n\nVisitor "${visitor.name}" (${visitor.id}) has been checked out of the school grounds at ${time}.`);
        }
        
        // Remove parameter from URL to prevent infinite checkout on refresh
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [visitors]);

  // Global Quick Launch triggers state definitions
  const [quickAdmissionTrigger, setQuickAdmissionTrigger] = useState(0);
  const [quickVisitorTrigger, setQuickVisitorTrigger] = useState(0);
  const [quickAnnTrigger, setQuickAnnTrigger] = useState(0);

  // Data amendment controllers & transaction handlers
  const handleAddStudent = (profile: Omit<Student, 'id'>) => {
    const newId = `STU00${students.length + 1}`;
    setStudents(prev => [...prev, { id: newId, ...profile }]);
  };

  const handleUpdateStudent = (updatedStudent: Student) => {
    setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
  };

  const handleDeleteStudent = (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
  };

  const handleAddStaff = (profile: Omit<Staff, 'id'>) => {
    const newId = `STF00${staff.length + 1}`;
    setStaff(prev => [...prev, { id: newId, ...profile }]);
  };

  const handleUpdateStaffPayroll = (staffId: string, status: 'Paid' | 'Pending') => {
    setStaff(prev => prev.map(member => 
      member.id === staffId ? { ...member, payrollStatus: status } : member
    ));
  };

  const handleUpsertAttendance = (
    date: string, 
    targetId: string, 
    targetType: 'Student' | 'Staff', 
    status: 'Present' | 'Absent' | 'Leave', 
    notes?: string
  ) => {
    setAttendance(prev => {
      const existingIdx = prev.findIndex(a => a.date === date && a.targetId === targetId && a.targetType === targetType);
      
      if (existingIdx > -1) {
        const copy = [...prev];
        copy[existingIdx] = { ...copy[existingIdx], status, notes };
        return copy;
      } else {
        const newRecord: AttendanceRecord = {
          id: `ATT-${targetType[0]}-${Math.floor(1000 + Math.random() * 9000)}`,
          date,
          targetId,
          targetType,
          status,
          notes
        };
        return [...prev, newRecord];
      }
    });
  };

  const handleBatchMarkPresent = (date: string, targetType: 'Student' | 'Staff', targetIds: string[]) => {
    setAttendance(prev => {
      let updatedList = [...prev];
      
      targetIds.forEach(id => {
        const existingIdx = updatedList.findIndex(a => a.date === date && a.targetId === id && a.targetType === targetType);
        if (existingIdx > -1) {
          updatedList[existingIdx] = { ...updatedList[existingIdx], status: 'Present' };
        } else {
          updatedList.push({
            id: `ATT-${targetType[0]}-${Math.floor(1000 + Math.random() * 9000)}`,
            date,
            targetId: id,
            targetType,
            status: 'Present'
          });
        }
      });

      return updatedList;
    });
  };

  const handleAddFeeRecord = (newFee: Omit<FeeItem, 'id'>) => {
    const newId = `FEE-0${fees.length + 1}`;
    setFees(prev => [...prev, { id: newId, ...newFee }]);
  };

  const handleRecordPayment = (feeId: string, paymentMethod: string, receiptNo: string) => {
    setFees(prev => prev.map(f => 
      f.id === feeId ? { 
        ...f, 
        status: 'Paid', 
        paymentDate: '2026-05-24', 
        paymentMethod, 
        receiptNo 
      } : f
    ));
    
    // Auto sync recent notifications logs
    setAnnouncements(prev => [
      {
        id: `COM-${prev.length + 1}`,
        title: `Receipt Cleared for Invoice #${feeId}`,
        content: `A transaction record for receipt sum has been finalized via ${paymentMethod}. Receipts can be rendered at the bursar office.`,
        date: '2026-05-24',
        category: 'All',
        type: 'Announcement',
        sender: 'Mr. Rajesh Kumar',
        role: 'Head Clerk & Registrar'
      },
      ...prev
    ]);
  };

  const handleAddExam = (newExam: Omit<Exam, 'id'>) => {
    const newId = `EXM00${exams.length + 1}`;
    setExams(prev => [...prev, { id: newId, ...newExam }]);
  };

  const handleAddResult = (newResult: Omit<StudentResult, 'id'>) => {
    const newId = `RES-${results.length + 1}`;
    setResults(prev => [...prev, { id: newId, ...newResult }]);
  };

  const handleAddAnnouncement = (newAnn: Omit<CommunicationAnnouncement, 'id'>) => {
    const newId = `COM-0${announcements.length + 1}`;
    setAnnouncements(prev => [{ id: newId, ...newAnn }, ...prev]);
  };

  const handleUpdateSlot = (updatedSlot: TimetableSlot) => {
    setTimetable(prev => prev.map(s => s.id === updatedSlot.id ? updatedSlot : s));
  };

  const handleAddVisitor = (newVis: Omit<VisitorLog, 'id'>) => {
    const newId = `VIS-0${visitors.length + 1}`;
    setVisitors(prev => [...prev, { id: newId, ...newVis }]);
  };

  const handleCheckOutVisitor = (id: string, time: string) => {
    setVisitors(prev => prev.map(v => 
      v.id === id ? { ...v, checkOut: time } : v
    ));
  };

  // Dynamic Role-based navigation items
  const NAVIGATION_BAR_ITEMS = (() => {
    // Generate navigation based on RBAC Matrix mapping
    let userPermissions = defaultRoles.find(r => r.name === 'Super Admin')?.permissions;

    if (activeRole === 'teacher') userPermissions = defaultRoles.find(r => r.name === 'Teacher')?.permissions;
    if (activeRole === 'account') userPermissions = defaultRoles.find(r => r.name === 'Accountant')?.permissions;
    // For specific sub-portals
    if (activeRole === 'student') {
      return [{ id: 'student-portal', label: 'My Student Hub', icon: User }];
    }
    if (activeRole === 'parent') {
      return [{ id: 'parent-portal', label: 'Parent Desk', icon: MessageSquare }];
    }
    if (activeRole === 'exam') {
      return [{ id: 'exams', label: 'Exams & Grading', icon: Award }];
    }

    const navItems: any[] = [];
    
    // Always include dashboard for staff/admin 
    if (activeRole === 'teacher') {
      navItems.push({ id: 'teacher-portal', label: 'My Teacher Hub', icon: CheckSquare });
    } else if (activeRole === 'account') {
      navItems.push({ id: 'account-portal', label: '₹ Finance Ledger', icon: DollarSign });
    } else {
      navItems.push({ id: 'dashboard', label: 'School Overview', icon: LayoutDashboard });
    }
    
    if (userPermissions?.Students.view) navItems.push({ id: 'students', label: 'Student Directory', icon: Users });
    if (userPermissions?.Attendance.view) navItems.push({ id: 'attendance', label: 'Daily Attendance', icon: CheckSquare });
    if (userPermissions?.Fees.view) navItems.push({ id: 'fees', label: 'Fees & Finances (₹)', icon: DollarSign });
    if (userPermissions?.Exams.view) navItems.push({ id: 'exams', label: 'Exams & Reports', icon: Award });
    if (userPermissions?.Staff.view) {
      navItems.push({ id: 'staff', label: 'Staff & Faculty', icon: FolderGit });
    }
    if (userPermissions?.Communication.view) {
      navItems.push({ id: 'communication', label: 'Circular Bulletin', icon: MessageSquare });
      navItems.push({ id: 'whatsapp', label: 'Bulk WhatsApp', icon: Smartphone });
    }
    if (userPermissions?.Settings.view) {
      navItems.push({ id: 'reports', label: 'Financial & Progress Reports', icon: BarChart3 });
      navItems.push({ id: 'timetable', label: 'Class Timetables', icon: Calendar });
      navItems.push({ id: 'visitors', label: 'Visitor Logs', icon: Clock });
      navItems.push({ id: 'rbac', label: 'Security & Access', icon: ShieldCheck });
    }

    return navItems;
  })();

  const handleShortcutNavigation = (tabName: string) => {
    setActiveTab(tabName);
    setIsMobileSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#0B1120] flex font-sans text-white antialiased font-medium" id="eduqube-root">
      
      {/* 1. MASTER COLLAPSIBLE LEFT SIDEBAR */}
      <aside 
        id="master-sidebar"
        className={`fixed inset-y-0 left-0 z-40 w-66 bg-[#111827] text-slate-100 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:flex md:flex-col border-r border-[#334155]/30  ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand identity Header */}
        <div className="p-6 border-b border-[#334155]/20 flex items-center justify-between bg-[#1E293B] text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 md:p-2.5 bg-gradient-to-br from-[#2563EB] to-[#2563EB] rounded-full text-white shadow-md border border-white/40">
              <School className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xs font-black tracking-[0.18em] text-[#FFFFFF] uppercase font-sans">EduQube</h2>
              <p className="text-[9px] text-white font-bold uppercase tracking-wider mt-0.5 font-sans">Imperial Academics</p>
            </div>
          </div>
          
          <button 
            id="close-mobile-nav"
            onClick={() => setIsMobileSidebarOpen(false)}
            className="md:hidden p-1.5 text-[#CBD5E1] hover:text-white hover:bg-[#334155]/30 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Interactive Persona Multi-User Switcher */}
        <div className="px-5 py-4 border-b border-[#334155]/20 bg-[#0B1120]/40 space-y-2">
          <label className="block text-[8px] font-black tracking-[0.2em] text-[#38BDF8] uppercase font-sans">ERP SECURITY CONTEXT</label>
          <select
            id="role-portal-switcher"
            value={activeRole}
            onChange={(e) => {
              const role = e.target.value as any;
              setActiveRole(role);
              // Auto focus active tab
              if (role === 'admin') setActiveTab('dashboard');
              else if (role === 'student') setActiveTab('student-portal');
              else if (role === 'teacher') setActiveTab('teacher-portal');
              else if (role === 'exam') setActiveTab('exams');
              else if (role === 'account') setActiveTab('account-portal');
              else if (role === 'parent') setActiveTab('parent-portal');
            }}
            className="w-full bg-[#0B1120]/80 text-[#38BDF8] hover:text-[#FFFFFF] font-bold text-xs rounded-xl border border-[#334155]/30 px-3 py-2.5 outline-hidden cursor-pointer focus:border-[#2563EB] transition-colors shadow-inner font-sans"
          >
            <option value="admin">✙ Chancellor Admin</option>
            <option value="student">✙ Scholar Portal</option>
            <option value="teacher">✙ Faculty Regent</option>
            <option value="exam">✙ CBSE Board Syndic</option>
            <option value="account">✙ Chancellor Treasury</option>
            <option value="parent">✙ House Ancestry Desk</option>
          </select>
        </div>

        {/* Scrollable Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto" id="sidebar-navigation">
          {NAVIGATION_BAR_ITEMS.map((item) => {
            const Icon = item.icon;
            const isSelected = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                id={`nav-link-${item.id}`}
                onClick={() => handleShortcutNavigation(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold font-sans rounded-xl transition-all cursor-pointer ${
                  isSelected 
                    ? 'bg-gradient-to-r from-[#2563EB] to-[#38BDF8] shadow-[0_0_15px_rgba(37,99,235,0.4)] text-white shadow-md font-black border border-[#38BDF8]/20' 
                    : 'text-[#38BDF8]/80 hover:text-white hover:bg-[#334155]/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-[#38BDF8]'}`} />
                  <span className="tracking-wide">{item.label}</span>
                </div>
                {isSelected && <ChevronRight className="w-3.5 h-3.5 text-white shrink-0" />}
              </button>
            );
          })}
        </nav>

        {/* Bottom Sidebar User status Card representing logged-in Persona */}
        <div className="p-4 border-t border-[#334155]/20 shrink-0 bg-[#0B1120]/90">
          {activeRole === 'admin' && (
            <div className="flex items-center gap-3 animate-fade-in">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#2563EB] to-[#1E3A8A] border border-white/20 flex items-center justify-center text-[11px] text-white font-sans font-black shrink-0 shadow-xl shadow-black/40">GK</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white font-sans truncate">Dr. G. K. Kapoor</p>
                <p className="text-[9px] text-[#38BDF8] font-bold uppercase tracking-widest font-sans truncate mt-0.5">Dean & Chancellor</p>
              </div>
            </div>
          )}
          {activeRole === 'student' && (
            <div className="flex items-center gap-3 animate-fade-in">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#2563EB] to-[#1E3A8A] border border-white/20 flex items-center justify-center text-[11px] text-white font-sans font-black shrink-0 shadow-xl shadow-black/40">ST</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white font-sans truncate">Ramesh Kumar</p>
                <p className="text-[9px] text-[#38BDF8] font-bold uppercase tracking-widest font-sans truncate mt-0.5">House Valedictorian</p>
              </div>
            </div>
          )}
          {activeRole === 'teacher' && (
            <div className="flex items-center gap-3 animate-fade-in">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#2563EB] to-[#1E3A8A] border border-white/20 flex items-center justify-center text-[11px] text-white font-sans font-black shrink-0 shadow-xl shadow-black/40">AS</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white font-sans truncate">Mr. Amit Sharma</p>
                <p className="text-[9px] text-[#38BDF8] font-bold uppercase tracking-widest font-sans truncate mt-0.5">Master of Mathematics</p>
              </div>
            </div>
          )}
          {activeRole === 'exam' && (
            <div className="flex items-center gap-3 animate-fade-in">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#2563EB] to-[#1E3A8A] border border-white/20 flex items-center justify-center text-[11px] text-white font-sans font-black shrink-0 shadow-xl shadow-black/40">EC</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white font-sans truncate">Mrs. Sudha Mishra</p>
                <p className="text-[9px] text-[#38BDF8] font-bold uppercase tracking-widest font-sans truncate mt-0.5">Syndic Board Regent</p>
              </div>
            </div>
          )}
          {activeRole === 'account' && (
            <div className="flex items-center gap-3 animate-fade-in">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#2563EB] to-[#1E3A8A] border border-white/20 flex items-center justify-center text-[10px] text-white font-sans font-black shrink-0 shadow-xl shadow-black/40">BURS</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white font-sans truncate">Mr. Sanjay Chawla</p>
                <p className="text-[9px] text-[#38BDF8] font-bold uppercase tracking-widest font-sans truncate mt-0.5">Senior Court Bursar</p>
              </div>
            </div>
          )}
          {activeRole === 'parent' && (
            <div className="flex items-center gap-3 animate-fade-in">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#2563EB] to-[#1E3A8A] border border-white/20 flex items-center justify-center text-[11px] text-white font-sans font-black shrink-0 shadow-xl shadow-black/40">PR</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white font-sans truncate">Mrs. Meera Roy</p>
                <p className="text-[9px] text-[#38BDF8] font-bold uppercase tracking-widest font-sans truncate mt-0.5">House Ward Trustee</p>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* 2. MAIN APPLICATION BOUNDS */}
      <div className="flex-1 flex flex-col min-w-0" id="main-application-frame">
        
        {/* TOP COMPREHENSIVE HEADER */}
        <header className="bg-[#1E293B] border-b border-[#334155]/30 px-6 py-4 flex justify-between items-center shrink-0 shadow-lg shadow-black/20" id="desktop-master-header">
          {/* Mobile hamburger navigation button */}
          <button 
            id="open-mobile-nav"
            onClick={() => setIsMobileSidebarOpen(true)}
            className="md:hidden p-2 text-[#CBD5E1] hover:bg-[#1E293B] rounded-xl cursor-pointer border border-[#334155]/20"
          >
            <Menu className="w-5 h-5 text-white" />
          </button>

          {/* Title description of currently rendering module */}
          <div className="hidden sm:block">
            <h2 className="text-xs font-bold text-white uppercase tracking-[0.2em] font-sans">
              EduQube Imperial Academic Console
            </h2>
          </div>

          {/* Quick utility panels (Notification drawer, Help triggers) */}
          <div className="flex items-center gap-3 ml-auto">
            
            {/* Quick Circular Notice Notification trigger */}
            <div className="relative">
              <button 
                id="btn-alerts-toggle"
                onClick={() => setIsNotifyOpen(!isNotifyOpen)}
                className="p-2.5 text-[#94A3B8] hover:text-[#38BDF8] hover:bg-[#1E293B] border border-[#334155]/30 rounded-xl relative transition-all cursor-pointer"
                title="Circular Feed alerts"
              >
                <Bell className="w-4.5 h-4.5 text-white" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#38BDF8] ring-2 ring-white"></span>
              </button>

              {/* Toggle Notice tray drawer */}
              {isNotifyOpen && (
                <div className="absolute right-0 mt-3 z-50 w-72 bg-[#1E293B] rounded-2xl border border-[#334155]/40 shadow-xl p-4 text-xs space-y-3" id="alerts-drawer">
                  <div className="flex justify-between items-center border-b border-[#1E293B] pb-2">
                    <span className="font-bold text-white font-sans">Circular Dispatch</span>
                    <button onClick={() => setIsNotifyOpen(false)} className="text-[10px] text-[#38BDF8] hover:text-[#38BDF8] font-bold font-sans">Dismiss</button>
                  </div>
                  
                  <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                    {announcements.slice(0, 3).map(not => (
                      <div key={not.id} className="p-2.5 rounded-lg bg-[#1E293B]/50 border border-[#334155]/20 space-y-1">
                        <p className="font-bold text-white truncate font-sans text-[11px]">{not.title}</p>
                        <p className="text-[10.5px] text-[#CBD5E1] line-clamp-2">{not.content}</p>
                        <span className="text-[9.5px] text-[#2563EB] font-mono  block mt-1">{not.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* School System Status display Tag */}
            <div className="flex items-center gap-2 bg-[#1E293B] px-3.5 py-1.5 rounded-xl border border-[#334155]/40 text-[10.5px] text-white font-bold font-sans shadow-3xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8] animate-pulse"></span>
              <span className="tracking-wide">Imperial Roster: Term-1 Active</span>
            </div>
          </div>
        </header>

        {/* 3. DYNAMIC WORKSPACE COMPONENT PANEL */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6" id="eduqube-workspace">
          
          {activeTab === 'dashboard' && (
            <DashboardOverview 
              students={students}
              staff={staff}
              attendance={attendance}
              fees={fees}
              visitors={visitors}
              announcements={announcements}
              onNavigate={handleShortcutNavigation}
              onOpenQuickAdmission={() => {
                setActiveTab('students');
                setQuickAdmissionTrigger(prev => prev + 1);
              }}
              onOpenQuickVisitor={() => {
                setActiveTab('visitors');
                setQuickVisitorTrigger(prev => prev + 1);
              }}
              onOpenQuickAnnouncement={() => {
                setActiveTab('communication');
                setQuickAnnTrigger(prev => prev + 1);
              }}
            />
          )}

          {activeTab === 'students' && (
            <StudentManager 
              students={students}
              onAddStudent={handleAddStudent}
              onUpdateStudent={handleUpdateStudent}
              onDeleteStudent={handleDeleteStudent}
              exams={exams}
              results={results}
              attendance={attendance}
            />
          )}

          {activeTab === 'attendance' && (
            <AttendanceManager 
              students={students}
              staff={staff}
              attendance={attendance}
              onUpsertAttendance={handleUpsertAttendance}
              onBatchMarkPresent={handleBatchMarkPresent}
            />
          )}

          {activeTab === 'fees' && (
            <FeesManager 
              students={students}
              fees={fees}
              onAddFeeRecord={handleAddFeeRecord}
              onRecordPayment={handleRecordPayment}
            />
          )}

          {activeTab === 'exams' && (
            <ExamsManager 
              students={students}
              exams={exams}
              results={results}
              onAddExam={handleAddExam}
              onAddResult={handleAddResult}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsAnalytics 
              students={students}
              staff={staff}
              attendance={attendance}
              fees={fees}
              results={results}
            />
          )}

          {activeTab === 'communication' && (
            <ParentCommunication 
              announcements={announcements}
              onAddAnnouncement={handleAddAnnouncement}
            />
          )}

          {activeTab === 'staff' && (
            <StaffManager 
              staffList={staff}
              activeRole={activeRole as any}
              onAddStaff={handleAddStaff}
              onUpdatePayroll={handleUpdateStaffPayroll}
            />
          )}

          {activeTab === 'timetable' && (
            <TimetableManager 
              timetableSlots={timetable}
              staffList={staff}
              onUpdateSlot={handleUpdateSlot}
            />
          )}

          {activeTab === 'whatsapp' && (
            <BulkWhatsAppManager 
              students={students}
            />
          )}

          {activeTab === 'visitors' && (
            <VisitorManager 
              visitors={visitors}
              staffList={staff}
              onAddVisitor={handleAddVisitor}
              onCheckOutVisitor={handleCheckOutVisitor}
            />
          )}

          {activeTab === 'rbac' && (
            <RBACManager />
          )}

          {activeTab === 'student-portal' && (
            <StudentPortal 
              students={students} 
              attendance={attendance}
            />
          )}

          {activeTab === 'teacher-portal' && (
            <TeacherPortal 
              students={students}
              staff={staff}
              timetable={timetable}
              onUpsertAttendance={handleUpsertAttendance}
              onBatchMarkPresent={handleBatchMarkPresent}
            />
          )}

          {activeTab === 'account-portal' && (
            <AccountPortal 
              students={students}
              fees={fees}
              onAddFeeRecord={handleAddFeeRecord}
              onRecordPayment={handleRecordPayment}
            />
          )}

          {activeTab === 'parent-portal' && (
            <ParentPortal 
              students={students}
              announcements={announcements}
              attendance={attendance}
            />
          )}

        </main>
      </div>

    </div>
  );
}
