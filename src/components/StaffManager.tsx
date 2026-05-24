import React, { useState } from 'react';
import { 
  Users, 
  Briefcase, 
  Plus, 
  Search, 
  Edit, 
  Mail, 
  Phone, 
  Calendar, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  X,
  CreditCard,
  Stamp
} from 'lucide-react';
import { Staff } from '../types';

interface StaffManagerProps {
  staffList: Staff[];
  onAddStaff: (newStaff: Omit<Staff, 'id'>) => void;
  onUpdatePayroll: (staffId: string, status: 'Paid' | 'Pending') => void;
}

export const StaffManager: React.FC<StaffManagerProps> = ({
  staffList,
  onAddStaff,
  onUpdatePayroll
}) => {
  // Navigation filters
  const [roleFilter, setRoleFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Registration dialog state
  const [isNewStaffOpen, setIsNewStaffOpen] = useState(false);
  const [isPayrollModalOpen, setIsPayrollModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);

  // New staff form state
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState<'Teacher' | 'Administrator' | 'Staff'>('Teacher');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formDesignation, setFormDesignation] = useState('Physics Teacher');
  const [formSalary, setFormSalary] = useState(4800);
  const [formSubjects, setFormSubjects] = useState('Physics, Math');

  // Compute payroll summary
  const totalSalaries = staffList.reduce((sum, s) => sum + s.salary, 0);
  const paidSalaries = staffList.filter(s => s.payrollStatus === 'Paid').reduce((sum, s) => sum + s.salary, 0);
  const pendingSalaries = staffList.filter(s => s.payrollStatus === 'Pending').reduce((sum, s) => sum + s.salary, 0);

  // Filter staff list
  const filteredStaff = staffList.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.designation.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'All' || s.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Handle adding new staff profile
  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim() || !formPhone.trim()) {
      alert('Please compile Name, Contact credentials and email before recording.');
      return;
    }

    onAddStaff({
      name: formName,
      role: formRole,
      email: formEmail,
      phone: formPhone,
      designation: formDesignation,
      salary: Number(formSalary),
      payrollStatus: 'Pending',
      subjects: formSubjects.split(',').map(s=>s.trim()),
      joinDate: '2026-05-24'
    });

    // Reset forms
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setIsNewStaffOpen(false);
  };

  // Launch payroll release form
  const triggerPayrollPayout = (member: Staff) => {
    setSelectedStaff(member);
    setIsPayrollModalOpen(true);
  };

  const executePayout = () => {
    if (!selectedStaff) return;
    onUpdatePayroll(selectedStaff.id, 'Paid');
    setIsPayrollModalOpen(false);
  };

  return (
    <div className="space-y-6" id="staff-management-container">
      {/* Title Header summary bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-xs border border-slate-100">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Briefcase className="text-indigo-600 w-6 h-6" />
            Staff Roster & Payroll
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Observe faculty profiles, assign course responsibilities, and oversee trimester payroll balances.</p>
        </div>

        <button 
          id="btn-register-staff"
          onClick={() => setIsNewStaffOpen(true)}
          className="flex items-center gap-2 px-4.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Enroll Faculty Member
        </button>
      </div>

      {/* Aggregate Payroll metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5" id="staff-metrics">
        <div className="p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Gross Payroll Budget</p>
            <h3 className="text-2xl font-black text-indigo-900">${totalSalaries.toLocaleString()}</h3>
          </div>
          <span className="text-[10px] font-mono text-indigo-700 bg-indigo-100/50 px-2.5 py-1 rounded-full font-bold">Monthly Rate</span>
        </div>

        <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-110 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Disbursed Wages</p>
            <h3 className="text-2xl font-black text-emerald-800">${paidSalaries.toLocaleString()}</h3>
          </div>
          <span className="p-2.5 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-mono font-bold">Cleared</span>
        </div>

        <div className="p-5 bg-amber-50 rounded-2xl border border-amber-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Accrued Outstanding</p>
            <h3 className="text-2xl font-black text-amber-800">${pendingSalaries.toLocaleString()}</h3>
          </div>
          <span className="p-2.5 bg-amber-100 text-amber-800 rounded-lg text-xs font-mono font-bold">Accruing</span>
        </div>
      </div>

      {/* Roster Controls: Search and filter row */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 animate-fade-in" id="staff-filters">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input 
            type="text"
            id="staff-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search roster by faculty name or role..."
            className="w-full bg-slate-50 pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:bg-white outline-hidden focus:border-indigo-500 transition-all font-medium text-slate-700"
          />
        </div>

        {/* Filter categories tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto" id="staff-role-toggles">
          {['All', 'Teacher', 'Administrator', 'Staff'].map(role => (
            <button
              key={role}
              id={`staff-role-filter-btn-${role}`}
              onClick={() => setRoleFilter(role)}
              className={`flex-1 md:flex-initial text-xs font-bold px-3.5 py-1 rounded-lg cursor-pointer transition-all ${roleFilter === role ? 'bg-white text-indigo-750 shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Staff directory table listing */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden" id="staff-table-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" id="staff-roster-table">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-[10.5px] font-mono uppercase tracking-wider italic">
                <th className="p-4">Faculty Member details</th>
                <th className="p-4">Staff Role Type</th>
                <th className="p-4">Subject Allocations</th>
                <th className="p-4">Monthly salary rate</th>
                <th className="p-4">Accrual Timeline</th>
                <th className="p-4">Payroll execution status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredStaff.map(member => (
                <tr key={member.id} className="hover:bg-slate-50/40 transition-all" id={`staff-row-${member.id}`}>
                  {/* Name and contacts */}
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-805 flex items-center justify-center font-bold text-xs border border-indigo-100">
                        {member.name.split(' ').map(n=>n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-850">{member.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">{member.email} • {member.id}</p>
                      </div>
                    </div>
                  </td>

                  {/* Role and title */}
                  <td className="p-4">
                    <div>
                      <p className="text-xs font-semibold text-slate-700">{member.designation}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wide">Category: {member.role}</p>
                    </div>
                  </td>

                  {/* Subject allocation fields */}
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {member.subjects.map(s => (
                        <span key={s} className="text-[9.5px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-150 font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Salary rate info */}
                  <td className="p-4 font-mono font-bold text-slate-800 text-xs">
                    ${member.salary.toLocaleString()}.00
                  </td>

                  {/* Accrual join date */}
                  <td className="p-4 text-[10.5px] text-slate-500 font-mono">
                    Since: {member.joinDate}
                  </td>

                  {/* Payroll status triggers */}
                  <td className="p-4">
                    {member.payrollStatus === 'Paid' ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-semibold border border-emerald-100">
                        <CheckCircle className="w-3.5 h-3.5" /> Disbursed
                      </span>
                    ) : (
                      <button
                        id={`btn-payout-wage-${member.id}`}
                        onClick={() => triggerPayrollPayout(member)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[11px] rounded-lg shadow-2xs transition-all cursor-pointer"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        Disburse Salary
                      </button>
                    )}
                  </td>

                </tr>
              ))}
              {filteredStaff.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-slate-400 italic text-xs">
                    No academic personnel matching structural parameters located.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* OVERLAY FACULTY 1: ENROLL FACULTY REGISTER FORM */}
      {isNewStaffOpen && (
        <div className="fixed inset-0 z-55 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4" id="staff-creation-modal">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-100 flex flex-col">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
              <h3 className="text-sm font-bold text-slate-800">Add Faculty Member</h3>
              <p className="text-xs text-slate-400 mt-1">Directly append a personnel profile into the ERP directory.</p>
            </div>

            <form onSubmit={handleCreateStaff} className="p-5 space-y-4 text-xs text-slate-650 font-sans">
              {/* Full name */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Faculty Full Name *</label>
                <input 
                  type="text"
                  required
                  id="form-staff-name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Prof. Rachel Green"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-medium focus:border-indigo-505 outlined-hidden focus:bg-white transition-all"
                />
              </div>

              {/* Designation role type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Roster Role Category *</label>
                  <select
                    id="form-staff-role"
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-medium font-sans outline-hidden"
                  >
                    <option value="Teacher">Teacher/Faculty</option>
                    <option value="Administrator">Administrator</option>
                    <option value="Staff">Support Personnel</option>
                  </select>
                </div>

                {/* Salary value */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1 font-sans">Monthly Wage Rate ($ USD) *</label>
                  <input 
                    type="number"
                    required
                    id="form-staff-salary"
                    value={formSalary}
                    onChange={(e) => setFormSalary(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-bold focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              {/* Designation specialty title */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Specialty Title / Stream *</label>
                <input 
                  type="text"
                  required
                  id="form-staff-designation"
                  value={formDesignation}
                  onChange={(e) => setFormDesignation(e.target.value)}
                  placeholder="e.g. HOD English Literature"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-705"
                />
              </div>

              {/* Subjects text separated */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Assigned Subjects (Separated with commas) *</label>
                <input 
                  type="text"
                  required
                  id="form-staff-subjects"
                  value={formSubjects}
                  onChange={(e) => setFormSubjects(e.target.value)}
                  placeholder="English Composition, Shakespeare study"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-705"
                />
              </div>

              {/* Phone Contacts */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Mobile Contact Phone *</label>
                  <input 
                    type="text"
                    required
                    id="form-staff-phone"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+1 (555) 777-6655"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>

                {/* Email Contacts */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Email Identifier *</label>
                  <input 
                    type="email"
                    required
                    id="form-staff-email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="rachel.g@eduqube.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  id="btn-cancel-staff-registration"
                  onClick={() => setIsNewStaffOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-500 rounded-xl text-xs font-semibold cursor-pointer hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="btn-save-staff-registration"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Confirm Registration File
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* OVERLAY FACULTY 2: PAYROLL TRANSACTION WAGE CONFIRMATION */}
      {isPayrollModalOpen && selectedStaff && (
        <div className="fixed inset-0 z-55 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4" id="staff-payout-modal">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-slate-105 overflow-hidden">
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
              <span className="text-xs font-bold font-mono tracking-wider uppercase text-indigo-300">Wages disbursement checkout</span>
              <button onClick={() => setIsPayrollModalOpen(false)} className="p-1 text-slate-400 hover:text-white cursor-pointer hover:bg-white/15 rounded">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Checkout Invoice summary */}
            <div className="p-6 space-y-5 text-xs text-slate-650">
              <div className="text-center space-y-1 pb-4 border-b border-slate-100">
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Authorized Payment sum</p>
                <p className="text-3xl font-black text-emerald-700 font-mono">${selectedStaff.salary.toLocaleString()}.00</p>
                <p className="text-[10px] text-slate-400 mt-1 font-sans">Payment Mode: Direct EFT Wire Transfer</p>
              </div>

              <div className="space-y-2">
                <p className="font-bold text-slate-800">Remittance Destination File:</p>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 font-sans space-y-1">
                  <p className="font-semibold text-slate-705">Name: {selectedStaff.name}</p>
                  <p>ID Card Code: {selectedStaff.id}</p>
                  <p>Corporate Designation Ref: {selectedStaff.designation}</p>
                </div>
              </div>

              {/* Bank Stamp mock */}
              <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-between text-indigo-750">
                <div className="flex items-center gap-2">
                  <Stamp className="w-5 h-5 text-indigo-600/50" />
                  <div>
                    <p className="font-bold">EFT Wire Approved</p>
                    <p className="text-[8px]">FedReserve Clearing Code</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-black text-indigo-900 bg-white px-2 py-0.5 rounded shadow-3xs">ISO-9001</span>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  id="btn-cancel-payout"
                  onClick={() => setIsPayrollModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-500 rounded-xl text-xs font-semibold cursor-pointer hover:bg-slate-50"
                >
                  Abstain
                </button>
                <button
                  type="button"
                  id="btn-confirm-payout"
                  onClick={executePayout}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  Authorize EFT Wire Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
