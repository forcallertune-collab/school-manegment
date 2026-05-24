export interface Student {
  id: string;
  name: string;
  admissionNo: string;
  rollNo: string;
  className: string;
  section: string;
  parentsName: string;
  contact: string;
  email: string;
  status: 'Active' | 'Suspended' | 'Graduated';
  dob: string;
  gender: string;
  admissionDate: string;
}

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  targetId: string; // studentId or staffId
  targetType: 'Student' | 'Staff';
  status: 'Present' | 'Absent' | 'Leave';
  notes?: string;
}

export interface FeeItem {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  title: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Overdue';
  dueDate: string;
  paymentDate?: string;
  paymentMethod?: string;
  receiptNo?: string;
}

export interface Exam {
  id: string;
  title: string; // e.g. "Term 1 Finals", "Mid-Term Examination"
  className: string;
  subject: string;
  date: string;
  time: string;
  room: string;
  maxMarks: number;
}

export interface StudentResult {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  examId: string;
  examTitle: string;
  subject: string;
  marksObtained: number;
  maxMarks: number;
  grade: string;
  remarks: string;
}

export interface CommunicationAnnouncement {
  id: string;
  title: string;
  content: string;
  date: string;
  category: 'All' | 'Class 10' | 'Class 9' | 'Class 8' | 'Primary' | 'High School';
  type: 'Circular' | 'Announcement' | 'Alert';
  sender: string;
  role: string;
}

export interface Staff {
  id: string;
  name: string;
  role: 'Teacher' | 'Administrator' | 'Staff';
  email: string;
  phone: string;
  designation: string; // e.g. "HOD Mathematics", "Physics Teacher"
  salary: number;
  payrollStatus: 'Paid' | 'Pending';
  subjects: string[];
  assignedClass?: string;
  joinDate: string;
}

export interface TimetableSlot {
  id: string;
  className: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  period: number; // 1 to 6
  subject: string;
  teacherId: string;
  teacherName: string;
  room: string;
  time: string; // e.g. "08:30 AM - 09:30 AM"
}

export interface VisitorLog {
  id: string;
  name: string;
  phone: string;
  purpose: string;
  hostName: string;
  hostRole: string;
  checkIn: string; // HH:MM or date + HH:MM
  checkOut?: string;
  date: string; // YYYY-MM-DD
  idProvided: string; // e.g. "Driver's License", "National ID", "Parent Card"
  notes?: string;
}
