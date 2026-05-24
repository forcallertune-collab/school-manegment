import React, { useState } from 'react';
import { 
  DollarSign, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Printer, 
  FileText, 
  CreditCard,
  Plus,
  Search,
  X,
  Sparkles,
  Layers,
  Stamp
} from 'lucide-react';
import { Student, FeeItem } from '../types';

interface FeesManagerProps {
  students: Student[];
  fees: FeeItem[];
  onAddFeeRecord: (newFee: Omit<FeeItem, 'id'>) => void;
  onRecordPayment: (feeId: string, paymentMethod: string, receiptNo: string) => void;
}

export const FeesManager: React.FC<FeesManagerProps> = ({
  students,
  fees,
  onAddFeeRecord,
  onRecordPayment
}) => {
  // Filters state
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dialog overlay controls
  const [isNewFeeOpen, setIsNewFeeOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  // Focus reference targets
  const [selectedFee, setSelectedFee] = useState<FeeItem | null>(null);

  // New Fee record forms
  const [formStudentId, setFormStudentId] = useState('');
  const [formTitle, setFormTitle] = useState('Term 1 Tuition Fees');
  const [formAmount, setFormAmount] = useState(1500);
  const [formDueDate, setFormDueDate] = useState('2026-06-15');

  // Payment Recording forms
  const [payMethod, setPayMethod] = useState('Credit Card');

  // Financial aggregates
  const totalPaid = fees.filter(f=>f.status==='Paid').reduce((sum, f)=>sum+f.amount, 0);
  const totalPending = fees.filter(f=>f.status==='Pending').reduce((sum, f)=>sum+f.amount, 0);
  const totalOverdue = fees.filter(f=>f.status==='Overdue').reduce((sum, f)=>sum+f.amount, 0);

  // Filter list
  const filteredFees = fees.filter(f => {
    const matchesSearch = f.studentName.toLowerCase().includes(searchQuery.toLowerCase()) || f.studentId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || f.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Handle saving new fee
  const handleCreateFee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formStudentId) {
      alert('Please select a student first.');
      return;
    }
    const targetStudent = students.find(s=>s.id === formStudentId);
    if (!targetStudent) return;

    onAddFeeRecord({
      studentId: targetStudent.id,
      studentName: targetStudent.name,
      className: targetStudent.className,
      title: formTitle,
      amount: Number(formAmount),
      status: 'Pending',
      dueDate: formDueDate
    });

    setIsNewFeeOpen(false);
  };

  // Launch Payment Modal
  const openPayMethodModal = (fee: FeeItem) => {
    setSelectedFee(fee);
    setIsPaymentOpen(true);
  };

  // Handle final receipt collection trigger
  const handleCollectPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFee) return;

    const dummyReceiptNo = `RC-9988-${Math.floor(1000 + Math.random() * 9000)}`;
    onRecordPayment(selectedFee.id, payMethod, dummyReceiptNo);
    
    // Auto-migrate view from payments dialog directly to view receipt dialog!
    const updatedFee: FeeItem = {
      ...selectedFee,
      status: 'Paid',
      paymentMethod: payMethod,
      paymentDate: '2026-05-24', // Today
      receiptNo: dummyReceiptNo
    };
    
    setIsPaymentOpen(false);
    setSelectedFee(updatedFee);
    setIsReceiptOpen(true);
  };

  // Show printable digital receipt template directly
  const openReceiptViewer = (fee: FeeItem) => {
    setSelectedFee(fee);
    setIsReceiptOpen(true);
  };

  return (
    <div className="space-y-6" id="fees-management-container">
      {/* Title Header summary bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-xs border border-slate-100">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <DollarSign className="text-indigo-600 w-6 h-6" />
            Fees Management & Cashier Hub
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Collect school dues, generate formal digital invoices, track financial defaults, and issue digital receipts.</p>
        </div>
        <button 
          id="btn-bill-new-fee"
          onClick={() => {
            if (students.length > 0) {
              setFormStudentId(students[0].id);
            }
            setIsNewFeeOpen(true);
          }}
          className="flex items-center gap-2 px-4.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Issue New Fee Charge
        </button>
      </div>

      {/* Aggregate Financial Metrics bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5" id="fees-metrics-cards">
        <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Payments Collected</p>
            <h3 className="text-2xl font-black text-emerald-800">₹{totalPaid.toLocaleString()}</h3>
          </div>
          <span className="p-3 bg-emerald-150 text-emerald-800 rounded-xl">
            <CheckCircle className="w-6 h-6" />
          </span>
        </div>

        <div className="p-5 bg-amber-50 rounded-2xl border border-amber-100 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-amber-600 uppercase tracking-wider font-sans">Pending Receivables</p>
            <h3 className="text-2xl font-black text-amber-800">₹{totalPending.toLocaleString()}</h3>
          </div>
          <span className="p-3 bg-amber-150 text-amber-800 rounded-xl">
            <Clock className="w-6 h-6" />
          </span>
        </div>

        <div className="p-5 bg-rose-50 rounded-2xl border border-rose-100 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-rose-600 uppercase tracking-wider font-sans">Overdue Default Dues</p>
            <h3 className="text-2xl font-black text-rose-800">₹{totalOverdue.toLocaleString()}</h3>
          </div>
          <span className="p-3 bg-rose-150 text-rose-800 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </span>
        </div>
      </div>

      {/* Filter and search controllers */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4" id="ledger-filters-row">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input 
            type="text"
            id="fees-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search charges by student name/ID..."
            className="w-full bg-slate-50 pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 outline-hidden focus:border-indigo-500 focus:bg-white transition-all text-slate-700 font-medium"
          />
        </div>

        {/* Status filters */}
        <div className="flex items-center gap-2.5">
          <span className="text-xs text-slate-500 font-semibold font-sans">Ledger Filter:</span>
          {['All', 'Paid', 'Pending', 'Overdue'].map((st) => (
            <button
              key={st}
              id={`btn-ledger-filter-${st}`}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border transition-all ${
                statusFilter === st 
                  ? 'bg-indigo-600 border-indigo-600 text-white' 
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-250 text-slate-600'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Primary Financial Table list */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-100 overflow-hidden" id="fees-table-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" id="fees-ledger-table">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 italic">
                <th className="p-4 text-xs font-bold text-slate-500 font-mono uppercase tracking-wider">Candidate Reference</th>
                <th className="p-4 text-xs font-bold text-slate-500 font-mono uppercase tracking-wider">Fee Category details</th>
                <th className="p-4 text-xs font-bold text-slate-500 font-mono uppercase tracking-wider">Assigned Value</th>
                <th className="p-4 text-xs font-bold text-slate-500 font-mono uppercase tracking-wider">Due Timeline</th>
                <th className="p-4 text-xs font-bold text-slate-500 font-mono uppercase tracking-wider">Remittance status</th>
                <th className="p-4 text-xs font-bold text-slate-500 text-center font-mono uppercase tracking-wider">Digital Receipts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredFees.map((fee) => (
                <tr key={fee.id} className="hover:bg-slate-50/50 transition-all" id={`fee-record-row-${fee.id}`}>
                  {/* Student */}
                  <td className="p-4">
                    <div>
                      <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-md font-mono font-bold text-slate-600">{fee.studentId}</span>
                      <p className="text-xs font-bold text-slate-800 mt-1">{fee.studentName}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">Grade: {fee.className}</p>
                    </div>
                  </td>

                  {/* Category Details */}
                  <td className="p-4">
                    <p className="text-xs font-semibold text-slate-700">{fee.title}</p>
                    {fee.paymentMethod && (
                      <p className="text-[10px] text-slate-400 mt-0.5 font-mono">Gateway: {fee.paymentMethod}</p>
                    )}
                  </td>

                  {/* Value */}
                  <td className="p-4 font-mono text-xs font-bold text-slate-800">
                    ₹{fee.amount.toLocaleString()}.00
                  </td>

                  {/* Timeline info */}
                  <td className="p-4 text-xs font-medium text-slate-600 font-mono">
                    {fee.dueDate}
                  </td>

                  {/* status tag */}
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border ${
                      fee.status === 'Paid' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                      fee.status === 'Overdue' ? 'bg-rose-50 text-rose-800 border-rose-200' :
                      'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>
                      {fee.status}
                    </span>
                  </td>

                  {/* Actions (View Invoice Receipt or Pay) */}
                  <td className="p-4">
                    <div className="flex justify-center items-center gap-2">
                      {fee.status === 'Paid' ? (
                        <button
                          id={`btn-view-receipt-${fee.id}`}
                          onClick={() => openReceiptViewer(fee)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] rounded-lg border border-indigo-200/50 transition-all cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          Receipt Docs
                        </button>
                      ) : (
                        <button
                          id={`btn-collect-payment-${fee.id}`}
                          onClick={() => openPayMethodModal(fee)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg shadow-xs transition-all cursor-pointer"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          Collect Cash
                        </button>
                      )}
                    </div>
                  </td>

                </tr>
              ))}
              {filteredFees.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400 text-xs">
                    No individual ledger receipts found matching specifications.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* OVERLAY 1: ISSUE NEW FEE CHARGE INVOICE FORM */}
      {isNewFeeOpen && (
        <div className="fixed inset-0 z-55 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4" id="fee-charge-modal">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-100 flex flex-col">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Assign New Student Levy</h3>
                <p className="text-xs text-slate-400 mt-1">Directly append a financial debit entry into the student ledger.</p>
              </div>
              <button 
                id="close-billing-modal"
                onClick={() => setIsNewFeeOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-150 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateFee} className="p-5 space-y-4">
              {/* Select candidate */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Target Pupil student *</label>
                <select
                  id="form-billing-student"
                  value={formStudentId}
                  onChange={(e) => setFormStudentId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-medium focus:border-indigo-500 focus:bg-white outline-hidden transition-all"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.id} / Roll {s.rollNo})</option>
                  ))}
                </select>
              </div>

              {/* Title breakdown */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Fee Label Description *</label>
                <select
                  id="form-billing-title"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-medium focus:border-indigo-500 focus:bg-white outline-hidden transition-all"
                >
                  <option value="Admission Fee">Admission Fee</option>
                  <option value="Tuition Fee (Term-1)">Tuition Fee (Term-1)</option>
                  <option value="Transport Fee">Transport Fee</option>
                  <option value="Development Fee">Development Fee</option>
                  <option value="Lab/Library Fees">Lab/Library Fees</option>
                  <option value="Uniform & Book charges">Uniform & Book charges</option>
                </select>
              </div>

              {/* Amount levy */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Assessed Amount (₹ INR) *</label>
                <input 
                  type="number"
                  required
                  id="form-billing-amount"
                  value={formAmount}
                  onChange={(e) => setFormAmount(Number(e.target.value))}
                  placeholder="e.g. 1500"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-medium focus:border-indigo-500 focus:bg-white outline-hidden transition-all font-mono font-bold"
                />
              </div>

              {/* Due date timeline */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Payment Due Date deadline *</label>
                <input 
                  type="date"
                  required
                  id="form-billing-duedate"
                  value={formDueDate}
                  onChange={(e) => setFormDueDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-medium focus:border-indigo-500 focus:bg-white outline-hidden transition-all font-mono"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  id="btn-cancel-billing"
                  onClick={() => setIsNewFeeOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="btn-save-billing"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Generate Receivable Dues
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* OVERLAY 2: COLLECT CASH TRANSACTION MODAL */}
      {isPaymentOpen && selectedFee && (
        <div className="fixed inset-0 z-55 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4" id="collect-invoice-modal">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-slate-100">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
              <h3 className="text-sm font-bold text-slate-800">Capture School Dues Transaction</h3>
              <p className="text-xs text-slate-400 mt-0.5">Log physical cashier transfer details.</p>
            </div>

            <form onSubmit={handleCollectPaymentSubmit} className="p-5 space-y-4">
              <div>
                <p className="text-xs text-slate-400 font-sans">Payment Assessment details:</p>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mt-2 space-y-1 text-xs">
                  <p className="font-bold text-slate-800">{selectedFee.studentName}</p>
                  <p className="text-slate-600">{selectedFee.title}</p>
                  <p className="font-mono text-indigo-700 font-bold mt-1 font-sans">Sum: ₹{selectedFee.amount}.00</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Financial Gateway / Method</label>
                <select
                  id="form-pay-method"
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-medium outline-hidden focus:bg-white focus:border-indigo-500"
                >
                  <option value="UPI / QR Code">UPI / QR Code (Paytm/GPay/PhonePe)</option>
                  <option value="Net Banking">Net Banking (NEFT/RTGS/IMPS)</option>
                  <option value="Credit/Debit Card">Credit/Debit Card</option>
                  <option value="Cash">Cash at Front Desk / Cashier Counter</option>
                </select>
              </div>

              <div className="p-3 bg-emerald-50 text-emerald-800 text-[11px] rounded-lg">
                ⚠️ Processing this marks the ledger transaction as **Paid** immediately, generating automated cashier certificate records.
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  id="btn-cancel-collection"
                  onClick={() => setIsPaymentOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-500 rounded-xl text-xs font-semibold cursor-pointer hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="btn-confirm-collection"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  Finalize Income Remittance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OVERLAY 3: PRINTABLE DIGITAL INVOICE RECEIPT TEMPLATE */}
      {isReceiptOpen && selectedFee && (
        <div className="fixed inset-0 z-55 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto" id="receipt-invoice-overlay">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 transform transition-all overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header actions bar */}
            <div className="bg-slate-900 text-white p-4.5 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-200">Receipt Document Viewer</span>
              </div>
              <button 
                id="close-receipt-modal"
                onClick={() => setIsReceiptOpen(false)}
                className="p-1 px-2.5 text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 rounded-lg cursor-pointer"
              >
                Close (Esc)
              </button>
            </div>

            {/* Receipt template to print */}
            <div className="p-8 space-y-6 overflow-y-auto flex-1 font-sans" id="printable-receipt-sheet">
              {/* Receipt Header logo & branding */}
              <div className="flex justify-between items-start border-b-2 border-slate-100 pb-5">
                <div>
                  <h2 className="text-lg font-black tracking-tight text-indigo-900 uppercase">EduQube ERP</h2>
                  <p className="text-[10px] text-slate-400 font-medium">Dwarka Sector II, Institutional Area</p>
                  <p className="text-[10px] text-slate-400 font-medium">New Delhi - 110075 • India</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-1">accounts@eduqube.ac.in</p>
                </div>
                
                <div className="text-right">
                  <span className="text-[10px] bg-indigo-50 text-indigo-800 font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Official Fee Receipt
                  </span>
                  <p className="text-sm font-mono font-bold text-slate-800 mt-2">{selectedFee.receiptNo || 'RC-9988-0000'}</p>
                  <p className="text-[9px] text-slate-400 font-mono mt-1">Transaction Ref: TRX-F-{selectedFee.id}</p>
                </div>
              </div>

              {/* Bill to block */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-slate-400 font-semibold mb-1 uppercase tracking-wider text-[9px]">Receipt Invoiced To:</p>
                  <p className="font-black text-slate-850">{selectedFee.studentName}</p>
                  <p className="text-slate-500 font-mono text-[11px] mt-0.5">Reference ID: {selectedFee.studentId}</p>
                  <p className="text-slate-500 font-mono text-[11px]">Academic Class: {selectedFee.className}</p>
                </div>
                
                <div className="text-right">
                  <p className="text-slate-400 font-semibold mb-1 uppercase tracking-wider text-[9px]">Remittance Details:</p>
                  <p className="text-slate-700 font-mono">Date Paid: {selectedFee.paymentDate || '2026-05-24'}</p>
                  <p className="text-slate-700 font-mono">Gateway: {selectedFee.paymentMethod || 'Credit Card'}</p>
                  <p className="text-slate-700 font-semibold text-emerald-600 font-mono">Payment Status: CLEARED</p>
                </div>
              </div>

              {/* Fees breakdown list itemized table */}
              <div className="border-t border-b border-slate-100 py-4">
                <table className="w-full text-left text-xs" id="invoice-items">
                  <thead>
                    <tr className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                      <th className="pb-2">Levy Item Description</th>
                      <th className="pb-2 text-center">Unit Count</th>
                      <th className="pb-2 text-right">Sum total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    <tr>
                      <td className="py-2.5">
                        <p className="font-bold text-slate-800">{selectedFee.title}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Assessment dues for Academic Term-1.</p>
                      </td>
                      <td className="py-2.5 text-center font-mono">1.00</td>
                      <td className="py-2.5 text-right font-mono font-bold text-slate-800">₹{selectedFee.amount}.00</td>
                    </tr>
                    
                    {/* Activity cost mockup */}
                    {selectedFee.title.includes('Tuition') && (
                      <tr>
                        <td className="py-2.5">
                          <p className="font-bold text-slate-800">Class Technology & Library costs</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Bundled school portal system, digital library access.</p>
                        </td>
                        <td className="py-2.5 text-center font-mono">1.00</td>
                        <td className="py-2.5 text-right font-mono text-slate-500">₹0.00 (Waived)</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Total calculations billing summary */}
              <div className="flex justify-between items-start pt-2">
                <div className="text-[10px] text-slate-400 leading-snug max-w-[200px]">
                  <span>This digital receipt certifies that payment has been finalized. Print this copy for school record clearances. Thank you.</span>
                </div>
                
                <div className="w-64 text-right space-y-1 text-xs">
                  <div className="flex justify-between font-mono text-slate-500">
                    <span>Subtotal Dues:</span>
                    <span>₹{selectedFee.amount}.00</span>
                  </div>
                  <div className="flex justify-between font-mono text-slate-500">
                    <span>Assessed Taxes (0%):</span>
                    <span>₹0.00</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-150 pt-2 font-mono text-slate-800 text-sm font-black">
                    <span>Collected Sum:</span>
                    <span className="text-emerald-700">₹{selectedFee.amount}.00</span>
                  </div>
                </div>
              </div>

              {/* Signature stamp mockups */}
              <div className="flex justify-between items-center pt-8">
                {/* Official Stamp */}
                <div className="flex items-center gap-2 border-2 border-emerald-600/30 text-emerald-700/80 rounded-xl px-3.5 py-1 text-[10.5px] font-mono leading-none tracking-widest uppercase font-black transform -rotate-3 select-none">
                  <Stamp className="w-5 h-5 text-emerald-600/40" />
                  <div>
                    <p className="font-black">EduQube Paid</p>
                    <p className="text-[7.5px] font-bold text-center">Cashier Counter</p>
                  </div>
                </div>

                {/* Signature outline */}
                <div className="text-right text-[11px] text-slate-400 font-mono">
                  <span className="italic block text-slate-700 font-serif text-sm">Mr. Rajesh Kumar</span>
                  <div className="w-40 border-t border-dashed border-slate-300 ml-auto mt-1"></div>
                  <p className="text-[9.5px] mt-1 text-slate-400">Head Clerk & Registrar</p>
                </div>
              </div>
            </div>

            {/* Modal Actions footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 shrink-0">
              <button
                type="button"
                id="btn-print-receipt"
                onClick={() => window.print()}
                className="px-4.5 py-2 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-2 transition-all"
              >
                <Printer className="w-4 h-4" />
                Physical Print
              </button>
              <button
                type="button"
                id="btn-close-receipt-sheet"
                onClick={() => setIsReceiptOpen(false)}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
