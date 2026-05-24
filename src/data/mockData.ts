import { Student, Staff, AttendanceRecord, FeeItem, Exam, StudentResult, CommunicationAnnouncement, TimetableSlot, VisitorLog } from '../types';

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'STU001',
    name: 'Aarav Sharma',
    admissionNo: 'ADM-2024-041',
    rollNo: '10',
    className: 'Class 10',
    section: 'A',
    parentsName: 'Rajesh Sharma',
    contact: '+91 98765-43210',
    email: 'aarav.sharma@eduqube.res.in',
    status: 'Active',
    dob: '2010-04-12',
    gender: 'Male',
    admissionDate: '01-06-2024'
  },
  {
    id: 'STU002',
    name: 'Ananya Iyer',
    admissionNo: 'ADM-2024-012',
    rollNo: '24',
    className: 'Class 10',
    section: 'A',
    parentsName: 'Ramesh Iyer',
    contact: '+91 87654-32109',
    email: 'ananya.iyer@eduqube.res.in',
    status: 'Active',
    dob: '2010-09-22',
    gender: 'Female',
    admissionDate: '01-06-2024'
  },
  {
    id: 'STU003',
    name: 'Reyansh Patel',
    admissionNo: 'ADM-2023-098',
    rollNo: '05',
    className: 'Class 10',
    section: 'B',
    parentsName: 'Amit Patel',
    contact: '+91 76543-21098',
    email: 'reyansh.patel@eduqube.res.in',
    status: 'Active',
    dob: '2010-01-30',
    gender: 'Male',
    admissionDate: '01-06-2023'
  },
  {
    id: 'STU004',
    name: 'Diya Sen',
    admissionNo: 'ADM-2024-102',
    rollNo: '31',
    className: 'Class 9',
    section: 'A',
    parentsName: 'Debashis Sen',
    contact: '+91 65432-10987',
    email: 'diya.sen@eduqube.res.in',
    status: 'Active',
    dob: '2011-05-15',
    gender: 'Female',
    admissionDate: '01-06-2024'
  },
  {
    id: 'STU005',
    name: 'Vihaan Gupta',
    admissionNo: 'ADM-2025-056',
    rollNo: '18',
    className: 'Class 9',
    section: 'B',
    parentsName: 'Sanjay Gupta',
    contact: '+91 95432-10980',
    email: 'vihaan.g@eduqube.res.in',
    status: 'Active',
    dob: '2011-11-03',
    gender: 'Male',
    admissionDate: '10-01-2025'
  },
  {
    id: 'STU006',
    name: 'Kavya Nair',
    admissionNo: 'ADM-2023-014',
    rollNo: '12',
    className: 'Class 8',
    section: 'A',
    parentsName: 'Gopinathan Nair',
    contact: '+91 85432-10981',
    email: 'kavya.nair@eduqube.res.in',
    status: 'Active',
    dob: '2012-07-19',
    gender: 'Female',
    admissionDate: '01-06-2023'
  },
  {
    id: 'STU007',
    name: 'Sai Krishna',
    admissionNo: 'ADM-2024-002',
    rollNo: '08',
    className: 'Class 8',
    section: 'A',
    parentsName: 'Srinivasa Rao',
    contact: '+91 75432-10982',
    email: 'sai.krishna@eduqube.res.in',
    status: 'Suspended',
    dob: '2012-02-14',
    gender: 'Male',
    admissionDate: '01-06-2024'
  },
  {
    id: 'STU008',
    name: 'Sneha Rao',
    admissionNo: 'ADM-2022-115',
    rollNo: '22',
    className: 'Class 10',
    section: 'B',
    parentsName: 'Prabhakar Rao',
    contact: '+91 65432-10983',
    email: 'sneha.rao@eduqube.res.in',
    status: 'Active',
    dob: '2010-06-08',
    gender: 'Female',
    admissionDate: '01-06-2022'
  }
];

export const INITIAL_STAFF: Staff[] = [
  {
    id: 'TCH001',
    name: 'Dr. S. Sridhar',
    role: 'Teacher',
    email: 'sridhar.maths@eduqube.res.in',
    phone: '+91 94440-12345',
    designation: 'HOD Mathematics',
    salary: 85000,
    payrollStatus: 'Paid',
    subjects: ['Advanced Algebra', 'Calculus', 'Coordinate Geometry'],
    assignedClass: 'Class 10 - A',
    joinDate: '15-08-2018'
  },
  {
    id: 'TCH002',
    name: 'Prof. Ramesh Chandra',
    role: 'Teacher',
    email: 'ramesh.physics@eduqube.res.in',
    phone: '+91 94440-23456',
    designation: 'Senior Physics Instructor',
    salary: 78000,
    payrollStatus: 'Paid',
    subjects: ['Physics', 'Thermodynamics', 'Electromagnetism'],
    assignedClass: 'Class 10 - B',
    joinDate: '01-09-2019'
  },
  {
    id: 'TCH003',
    name: 'Mrs. Sunita Sharma',
    role: 'Teacher',
    email: 'sunita.english@eduqube.res.in',
    phone: '+91 94440-34567',
    designation: 'English Literature Specialist',
    salary: 62050,
    payrollStatus: 'Paid',
    subjects: ['English Literature', 'Creative Writing', 'Grammar'],
    assignedClass: 'Class 9 - A',
    joinDate: '12-02-2021'
  },
  {
    id: 'TCH004',
    name: 'Mr. Alok Verma',
    role: 'Teacher',
    email: 'alok.chem@eduqube.res.in',
    phone: '+91 94440-45678',
    designation: 'Chemistry Faculty',
    salary: 68000,
    payrollStatus: 'Pending',
    subjects: ['Organic Chemistry', 'Inorganic Chemistry'],
    assignedClass: 'Class 9 - B',
    joinDate: '22-07-2020'
  },
  {
    id: 'ADM001',
    name: 'Principal Dr. G. K. Kapoor',
    role: 'Administrator',
    email: 'principal@eduqube.res.in',
    phone: '+91 98100-11111',
    designation: 'Principal & Academic Director',
    salary: 135000,
    payrollStatus: 'Paid',
    subjects: ['School Management', 'Ethical Guidelines'],
    joinDate: '18-05-2012'
  },
  {
    id: 'STF001',
    name: 'Mr. Rajesh Kumar',
    role: 'Staff',
    email: 'registrar@eduqube.res.in',
    phone: '+91 98100-22222',
    designation: 'Head Clerk & Registrar',
    salary: 45000,
    payrollStatus: 'Paid',
    subjects: ['Financial Administration'],
    joinDate: '01-11-2016'
  }
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  // Students for today (2026-05-24)
  { id: 'ATT-S1', date: '2026-05-24', targetId: 'STU001', targetType: 'Student', status: 'Present', notes: 'Arrived on time' },
  { id: 'ATT-S2', date: '2026-05-24', targetId: 'STU002', targetType: 'Student', status: 'Present' },
  { id: 'ATT-S3', date: '2026-05-24', targetId: 'STU003', targetType: 'Student', status: 'Absent', notes: 'Sick' },
  { id: 'ATT-S4', date: '2026-05-24', targetId: 'STU004', targetType: 'Student', status: 'Present' },
  { id: 'ATT-S5', date: '2026-05-24', targetId: 'STU005', targetType: 'Student', status: 'Leave', notes: 'Medical Leave Approved' },
  { id: 'ATT-S6', date: '2026-05-24', targetId: 'STU006', targetType: 'Student', status: 'Present' },
  { id: 'ATT-S7', date: '2026-05-24', targetId: 'STU007', targetType: 'Student', status: 'Absent', notes: 'Suspended Term' },
  { id: 'ATT-S8', date: '2026-05-24', targetId: 'STU008', targetType: 'Student', status: 'Present' },

  // Staff today
  { id: 'ATT-T1', date: '2026-05-24', targetId: 'TCH001', targetType: 'Staff', status: 'Present' },
  { id: 'ATT-T2', date: '2026-05-24', targetId: 'TCH002', targetType: 'Staff', status: 'Present' },
  { id: 'ATT-T3', date: '2026-05-24', targetId: 'TCH003', targetType: 'Staff', status: 'Present' },
  { id: 'ATT-T4', date: '2026-05-24', targetId: 'TCH004', targetType: 'Staff', status: 'Leave', notes: 'Sick Leave' },
  { id: 'ATT-T5', date: '2026-05-24', targetId: 'ADM001', targetType: 'Staff', status: 'Present' },
  { id: 'ATT-T6', date: '2026-05-24', targetId: 'STF001', targetType: 'Staff', status: 'Present' },

  // Yesterday
  { id: 'ATT-Y1', date: '2026-05-23', targetId: 'STU001', targetType: 'Student', status: 'Present' },
  { id: 'ATT-Y2', date: '2026-05-23', targetId: 'STU002', targetType: 'Student', status: 'Present' },
  { id: 'ATT-Y3', date: '2026-05-23', targetId: 'STU003', targetType: 'Student', status: 'Present' },
  { id: 'ATT-Y4', date: '2026-05-23', targetId: 'STU004', targetType: 'Student', status: 'Absent', notes: 'Unexcused' },
  { id: 'ATT-Y5', date: '2026-05-23', targetId: 'STU005', targetType: 'Student', status: 'Present' },
  { id: 'ATT-Y6', date: '2026-05-23', targetId: 'STU006', targetType: 'Student', status: 'Present' },
  { id: 'ATT-Y7', date: '2026-05-23', targetId: 'STU007', targetType: 'Student', status: 'Absent' },
  { id: 'ATT-Y8', date: '2026-05-23', targetId: 'STU008', targetType: 'Student', status: 'Present' },
];

export const INITIAL_FEES: FeeItem[] = [
  {
    id: 'FEE-001',
    studentId: 'STU001',
    studentName: 'Aarav Sharma',
    className: 'Class 10',
    title: 'Admission Fee',
    amount: 15000,
    status: 'Paid',
    dueDate: '15-04-2026',
    paymentDate: '12-04-2026',
    paymentMethod: 'UPI (GPay)',
    receiptNo: 'RC-9988-1021'
  },
  {
    id: 'FEE-002',
    studentId: 'STU001',
    studentName: 'Aarav Sharma',
    className: 'Class 10',
    title: 'Lab & Library Fee',
    amount: 2500,
    status: 'Paid',
    dueDate: '01-05-2026',
    paymentDate: '29-04-2026',
    paymentMethod: 'Net Banking',
    receiptNo: 'RC-9988-1240'
  },
  {
    id: 'FEE-003',
    studentId: 'STU002',
    studentName: 'Ananya Iyer',
    className: 'Class 10',
    title: 'Tuition Fee (Term 1)',
    amount: 18500,
    status: 'Paid',
    dueDate: '15-04-2026',
    paymentDate: '14-04-2026',
    paymentMethod: 'UPI (PhonePe)',
    receiptNo: 'RC-9988-1025'
  },
  {
    id: 'FEE-004',
    studentId: 'STU003',
    studentName: 'Reyansh Patel',
    className: 'Class 10',
    title: 'Tuition Fee (Term 1)',
    amount: 18500,
    status: 'Pending',
    dueDate: '15-04-2026'
  },
  {
    id: 'FEE-005',
    studentId: 'STU004',
    studentName: 'Diya Sen',
    className: 'Class 9',
    title: 'Tuition Fee (Term 1)',
    amount: 16500,
    status: 'Paid',
    dueDate: '15-04-2026',
    paymentDate: '10-04-2026',
    paymentMethod: 'Credit Card',
    receiptNo: 'RC-9988-0987'
  },
  {
    id: 'FEE-006',
    studentId: 'STU005',
    studentName: 'Vihaan Gupta',
    className: 'Class 9',
    title: 'Transport Fee',
    amount: 3200,
    status: 'Pending',
    dueDate: '15-04-2026'
  },
  {
    id: 'FEE-007',
    studentId: 'STU006',
    studentName: 'Kavya Nair',
    className: 'Class 8',
    title: 'Uniform & Book Charges',
    amount: 4500,
    status: 'Paid',
    dueDate: '15-04-2026',
    paymentDate: '15-04-2026',
    paymentMethod: 'Cash',
    receiptNo: 'RC-9988-1052'
  },
  {
    id: 'FEE-008',
    studentId: 'STU007',
    studentName: 'Sai Krishna',
    className: 'Class 8',
    title: 'Development Fee',
    amount: 5000,
    status: 'Overdue',
    dueDate: '01-04-2026'
  },
  {
    id: 'FEE-009',
    studentId: 'STU008',
    studentName: 'Sneha Rao',
    className: 'Class 10',
    title: 'Tuition Fee (Term 1)',
    amount: 18500,
    status: 'Paid',
    dueDate: '15-04-2026',
    paymentDate: '14-04-2026',
    paymentMethod: 'UPI',
    receiptNo: 'RC-9988-1033'
  }
];

export const INITIAL_EXAMS: Exam[] = [
  {
    id: 'EXM001',
    title: 'Half-Yearly Examination (Term-1)',
    className: 'Class 10',
    subject: 'Mathematics',
    date: '10-06-2026',
    time: '09:00 AM - 12:00 PM',
    room: 'Seating Hall A',
    maxMarks: 80
  },
  {
    id: 'EXM002',
    title: 'Half-Yearly Examination (Term-1)',
    className: 'Class 10',
    subject: 'Physics',
    date: '12-06-2026',
    time: '09:00 AM - 12:00 PM',
    room: 'Physics Lab Block',
    maxMarks: 80
  },
  {
    id: 'EXM003',
    title: 'Half-Yearly Examination (Term-1)',
    className: 'Class 9',
    subject: 'English Lit & Grammar',
    date: '11-06-2026',
    time: '01:00 PM - 04:00 PM',
    room: 'West Room 102',
    maxMarks: 80
  },
  {
    id: 'EXM004',
    title: 'Class Unit Assessment-I',
    className: 'Class 8',
    subject: 'Biology',
    date: '28-05-2026',
    time: '10:00 AM - 11:30 AM',
    room: 'Classroom 8A',
    maxMarks: 40
  },
  {
    id: 'EXM005',
    title: 'Periodic Test 1',
    className: 'Class 10',
    subject: 'Mathematics',
    date: '15-05-2026',
    time: '08:30 AM - 10:30 AM',
    room: 'School Assembly Hall',
    maxMarks: 40
  }
];

export const INITIAL_RESULTS: StudentResult[] = [
  {
    id: 'RES-001',
    studentId: 'STU001',
    studentName: 'Aarav Sharma',
    className: 'Class 10',
    examId: 'EXM005',
    examTitle: 'Periodic Test 1',
    subject: 'Mathematics',
    marksObtained: 38,
    maxMarks: 40,
    grade: 'A1',
    remarks: 'Outstanding logical reasoning and flawless execution.'
  },
  {
    id: 'RES-002',
    studentId: 'STU002',
    studentName: 'Ananya Iyer',
    className: 'Class 10',
    examId: 'EXM005',
    examTitle: 'Periodic Test 1',
    subject: 'Mathematics',
    marksObtained: 35,
    maxMarks: 40,
    grade: 'A2',
    remarks: 'Very neat work. Keep it up.'
  },
  {
    id: 'RES-003',
    studentId: 'STU003',
    studentName: 'Reyansh Patel',
    className: 'Class 10',
    examId: 'EXM005',
    examTitle: 'Periodic Test 1',
    subject: 'Mathematics',
    marksObtained: 28,
    maxMarks: 40,
    grade: 'B1',
    remarks: 'Good progress. Revise algebraic fractions.'
  },
  {
    id: 'RES-004',
    studentId: 'STU008',
    studentName: 'Sneha Rao',
    className: 'Class 10',
    examId: 'EXM005',
    examTitle: 'Periodic Test 1',
    subject: 'Mathematics',
    marksObtained: 39,
    maxMarks: 40,
    grade: 'A1',
    remarks: 'Flawless solution matrix.'
  }
];

export const INITIAL_COMMUNICATIONS: CommunicationAnnouncement[] = [
  {
    id: 'COM-001',
    title: 'Circular: Durga Puja & Diwali Holidays Announcement',
    content: 'This is to inform all parents and students that the school will remain closed from November 1st to November 8th on account of Durga Puja, Kali Puja, and Diwali Holidays. Online homework modules have been dispatched via student accounts. School reopens on 9th November.',
    date: '22-05-2026',
    category: 'All',
    type: 'Circular',
    sender: 'Dr. G. K. Kapoor',
    role: 'School Principal'
  },
  {
    id: 'COM-002',
    title: 'Important Note: Term-1 Fees Clearance Due Alert',
    content: 'This is to inform all parents that Term-1 Tuition and Transport fees are due for clearance by 15th June. Please utilize our digital gateway UPI or NetBanking transactions to finalize clearance receipts and avoid overdue late payment penalties. Contact Mr. Rajesh Kumar for ledger verification.',
    date: '12-05-2026',
    category: 'All',
    type: 'Alert',
    sender: 'Mr. Rajesh Kumar',
    role: 'Head Accountant & Registrar'
  },
  {
    id: 'COM-003',
    title: 'Announcement: Summer Vacation Timings Adjustment',
    content: 'This is to inform all parents that due to the severe weather alerts issued by the department of education, school timings are revised from 07:30 AM to 12:30 PM starting May 25th. Tiffin break will happen at 10:00 AM. Summer vacation will officially commence on June 1st.',
    date: '23-05-2026',
    category: 'All',
    type: 'Circular',
    sender: 'Dr. G. K. Kapoor',
    role: 'School Principal'
  }
];

export const INITIAL_TIMETABLE: TimetableSlot[] = [
  // Monday
  { id: 'TTS-M1', className: 'Class 10', day: 'Monday', period: 1, subject: 'Mathematics', teacherId: 'TCH001', teacherName: 'Dr. S. Sridhar', room: 'Room 201', time: '08:00 AM - 08:45 AM' },
  { id: 'TTS-M2', className: 'Class 10', day: 'Monday', period: 2, subject: 'Physics', teacherId: 'TCH002', teacherName: 'Prof. Ramesh Chandra', room: 'Physics Lab', time: '08:45 AM - 09:30 AM' },
  { id: 'TTS-M3', className: 'Class 10', day: 'Monday', period: 3, subject: 'English Lit', teacherId: 'TCH003', teacherName: 'Mrs. Sunita Sharma', room: 'Library Annex', time: '09:30 AM - 10:15 AM' },
  { id: 'TTS-M4', className: 'Class 10', day: 'Monday', period: 4, subject: 'Social Science', teacherId: 'NA', teacherName: 'Substitute Faculty', room: 'Classroom 10A', time: '10:15 AM - 11:00 AM' },
  { id: 'TTS-M5', className: 'Class 10', day: 'Monday', period: 5, subject: 'Tiffin Break / Recess', teacherId: 'NA', teacherName: 'Monitor', room: 'Central Playground / Canteen', time: '11:00 AM - 11:30 AM' },
  { id: 'TTS-M6', className: 'Class 10', day: 'Monday', period: 6, subject: 'Chemistry', teacherId: 'TCH004', teacherName: 'Mr. Alok Verma', room: 'Chemistry Lab', time: '11:30 AM - 12:15 PM' },
  { id: 'TTS-M7', className: 'Class 10', day: 'Monday', period: 7, subject: 'Computer Applications', teacherId: 'NA', teacherName: 'Lab Assistant', room: 'IT Wing B', time: '12:15 PM - 01:00 PM' },
  { id: 'TTS-M8', className: 'Class 10', day: 'Monday', period: 8, subject: 'Physical Education / Yoga', teacherId: 'NA', teacherName: 'PT Coach', room: 'Assembly Ground', time: '01:00 PM - 01:45 PM' },

  // Tuesday
  { id: 'TTS-T1', className: 'Class 10', day: 'Tuesday', period: 1, subject: 'Mathematics', teacherId: 'TCH001', teacherName: 'Dr. S. Sridhar', room: 'Room 201', time: '08:00 AM - 08:45 AM' },
  { id: 'TTS-T2', className: 'Class 10', day: 'Tuesday', period: 2, subject: 'Physics Practice', teacherId: 'TCH002', teacherName: 'Prof. Ramesh Chandra', room: 'Physics Lab', time: '08:45 AM - 09:30 AM' },
  { id: 'TTS-T3', className: 'Class 10', day: 'Tuesday', period: 3, subject: 'English Grammar', teacherId: 'TCH003', teacherName: 'Mrs. Sunita Sharma', room: 'Library Annex', time: '09:30 AM - 10:15 AM' },
  { id: 'TTS-T4', className: 'Class 10', day: 'Tuesday', period: 4, subject: 'Geography', teacherId: 'NA', teacherName: 'Substitute Faculty', room: 'Classroom 10A', time: '10:15 AM - 11:00 AM' },
  { id: 'TTS-T5', className: 'Class 10', day: 'Tuesday', period: 5, subject: 'Tiffin Break / Recess', teacherId: 'NA', teacherName: 'Monitor', room: 'Central Canteen', time: '11:00 AM - 11:30 AM' },
  { id: 'TTS-T6', className: 'Class 10', day: 'Tuesday', period: 6, subject: 'Chemistry Practical', teacherId: 'TCH004', teacherName: 'Mr. Alok Verma', room: 'Chemistry Lab', time: '11:30 AM - 12:15 PM' },
  { id: 'TTS-T7', className: 'Class 10', day: 'Tuesday', period: 7, subject: 'History / Civics', teacherId: 'NA', teacherName: 'Mrs. Kapoor', room: 'Classroom 10A', time: '12:15 PM - 01:00 PM' },
  { id: 'TTS-T8', className: 'Class 10', day: 'Tuesday', period: 8, subject: 'Weekly Mock Evaluation', teacherId: 'TCH001', teacherName: 'Dr. S. Sridhar', room: 'Room 201', time: '01:00 PM - 01:45 PM' }
];

export const INITIAL_VISITORS: VisitorLog[] = [
  {
    id: 'VIS-001',
    name: 'Mrs. Lata Sharma',
    phone: '+91 98765-43210',
    purpose: 'Submit Parent Consent Forms for Picnic',
    hostName: 'Principal Dr. G. K. Kapoor',
    hostRole: 'Administrator',
    checkIn: '08:45 AM',
    checkOut: '09:12 AM',
    date: '2026-05-24',
    idProvided: 'Aadhaar Card #9910',
    notes: 'Approved check-in at security portal'
  },
  {
    id: 'VIS-002',
    name: 'Mr. Vijay Patel',
    phone: '+91 87654-32109',
    purpose: 'Parent-Teacher Meeting (PTM Review)',
    hostName: 'Dr. S. Sridhar',
    hostRole: 'Teacher',
    checkIn: '09:30 AM',
    date: '2026-05-24',
    idProvided: "Driving License",
    notes: 'Approved by Dr. Sridhar to sit in staff room'
  },
  {
    id: 'VIS-003',
    name: 'Mr. Satish Chandra',
    phone: '+91 76543-21098',
    purpose: 'Deliver Physics Lab Apparatus Spares',
    hostName: 'Prof. Ramesh Chandra',
    hostRole: 'Teacher',
    checkIn: '10:15 AM',
    date: '2026-05-24',
    idProvided: 'Pan Card ID #210',
    notes: 'Direct entry authorized to labs'
  }
];
