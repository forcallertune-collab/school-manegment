import React, { useState } from 'react';
import { 
  DollarSign, 
  Search, 
  Plus, 
  FileText, 
  CheckCircle, 
  AlertTriangle,
  Printer, 
  Bell, 
  ArrowUpRight, 
  IndianRupee, 
  Sparkles,
  Barcode,
  Download
} from 'lucide-react';
import { Student, FeeItem } from '../types';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

interface AccountPortalProps {
  students: Student[];
  fees: FeeItem[];
  onAddFeeRecord: (newFee: Omit<FeeItem, 'id'>) => void;
  onRecordPayment: (feeId: string, paymentMethod: string, receiptNo: string) => void;
}

export const AccountPortal: React.FC<AccountPortalProps> = ({ 
  students, 
  fees, 
  onAddFeeRecord, 
  onRecordPayment 
}) => {
  // Selector for state filtering
  const [financeSearch, setFinanceSearch] = useState('');
  const [selectedFeeTypeFilter, setSelectedFeeTypeFilter] = useState('All');
  
  // Create fee record forms
  const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);
  const [feeStudentId, setFeeStudentId] = useState('');
  const [feeTitle, setFeeTitle] = useState('Quarterly Tuition Fee');
  const [feeAmount, setFeeAmount] = useState(12000);
  const [feeDueDate, setFeeDueDate] = useState('24-06-2026');

  // Interactive Receipt Print Panel
  const [selectedReceiptFee, setSelectedReceiptFee] = useState<FeeItem | null>(null);

  // Initialize fee target Student
  if (!feeStudentId && students.length > 0) {
    setFeeStudentId(students[0].id);
  }

  // Handle Recording New Fee Allocation Invoice
  const handleAllocateFee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feeStudentId || !feeTitle || !feeAmount) {
      alert('Please fill out all invoice parameters first.');
      return;
    }

    const targetStudent = students.find(s=>s.id === feeStudentId);
    if (!targetStudent) return;

    onAddFeeRecord({
      studentId: targetStudent.id,
      studentName: targetStudent.name,
      className: targetStudent.className,
      title: feeTitle,
      amount: Number(feeAmount),
      status: 'Pending',
      dueDate: feeDueDate
    });

    setIsFeeModalOpen(false);
    alert(`INR ₹${feeAmount} Invoice allocated successfully to Dr. ${targetStudent.parentsName}'s billing ledger account.`);
  };

  // Perform transaction clearance
  const clearInvoicePayment = (feeId: string) => {
    const rcNo = `REC-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const method = 'Online (UPI/GPay BHIM)';
    onRecordPayment(feeId, method, rcNo);
    
    // Auto-select receipt for visual popover rendering
    const match = fees.find(f => f.id === feeId);
    if (match) {
      setSelectedReceiptFee({
        ...match,
        status: 'Paid',
        paymentDate: '24-05-2026',
        paymentMethod: method,
        receiptNo: rcNo
      });
    }
  };

  // Dynamically group stats
  const aggregatePaid = fees.filter(f=>f.status === 'Paid').reduce((sum, f) => sum + f.amount, 0);
  const aggregateOverdue = fees.filter(f=>f.status === 'Overdue').reduce((sum, f) => sum + f.amount, 0);
  const aggregatePending = fees.filter(f=>f.status === 'Pending').reduce((sum, f) => sum + f.amount, 0);
  const totalInvoiced = aggregatePaid + aggregateOverdue + aggregatePending;
  const billingRate = totalInvoiced > 0 ? Math.round((aggregatePaid / totalInvoiced) * 100) : 0;

  const hasData = aggregatePaid > 0 || aggregatePending > 0 || aggregateOverdue > 0;
  const chartData = [
    { name: 'Paid', value: aggregatePaid, color: '#10b981' },     // emerald-500
    { name: 'Pending', value: aggregatePending, color: '#f59e0b' },   // amber-500
    { name: 'Overdue', value: aggregateOverdue, color: '#f43f5e' }    // rose-500
  ];

  // Filter lists
  const filteredFees = fees.filter(fee => {
    const term = financeSearch.toLowerCase();
    const matchesSearch = 
      fee.id.toLowerCase().includes(term) ||
      fee.studentName.toLowerCase().includes(term) ||
      fee.title.toLowerCase().includes(term);
    
    const matchesType = selectedFeeTypeFilter === 'All' || 
      (selectedFeeTypeFilter === 'Tuition' && fee.title.includes('Tuition')) ||
      (selectedFeeTypeFilter === 'Admission' && fee.title.includes('Admission')) ||
      (selectedFeeTypeFilter === 'Bus' && fee.title.includes('Bus')) ||
      (selectedFeeTypeFilter === 'Lab' && fee.title.includes('Lab'));

    return matchesSearch && matchesType;
  });

  const handleExportCSV = () => {
    const headers = [
      'Invoice ID',
      'Student ID',
      'Student Name',
      'Class Name',
      'Fee Stream/Title',
      'Amount (INR)',
      'Due Date',
      'Status',
      'Payment Date',
      'Payment Method',
      'Receipt Number'
    ];

    const csvRows = [
      headers.join(','),
      ...filteredFees.map(fee => {
        return [
          `"${fee.id || ''}"`,
          `"${fee.studentId || ''}"`,
          `"${(fee.studentName || '').replace(/"/g, '""')}"`,
          `"${(fee.className || '').replace(/"/g, '""')}"`,
          `"${(fee.title || '').replace(/"/g, '""')}"`,
          fee.amount || 0,
          `"${fee.dueDate || ''}"`,
          `"${fee.status || ''}"`,
          `"${fee.paymentDate || ''}"`,
          `"${(fee.paymentMethod || '').replace(/"/g, '""')}"`,
          `"${fee.receiptNo || ''}"`
        ].join(',');
      })
    ];

    const blob = new Blob([csvRows.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `EduQube_Fee_Ledger_Trimester_1_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-705 text-left font-sans" id="account-portal-hub">
      
      {/* Treasury Header stats widget */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5" id="finance-kpis">
        
        {/* Metric A: Collected */}
        <div className="bg-[#1E293B] p-5 rounded-3xl border border-[#334155] shadow-3xs flex items-center gap-4">
          <div className="p-3.5 bg-[#10B981]/10 border border-[#10B981]/30 text-[#10B981] rounded-2xl">
            <IndianRupee className="w-5.5 h-5.5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest font-mono">Collected Treasury</p>
            <h4 className="text-lg font-black text-white font-mono mt-0.5">₹ {aggregatePaid.toLocaleString('en-IN')}</h4>
            <span className="text-[10px] text-[#10B981] font-medium font-sans">Clear Bank Ledger</span>
          </div>
        </div>

        {/* Metric B: Overdue */}
        <div className="bg-[#1E293B] p-5 rounded-3xl border border-[#334155] shadow-3xs flex items-center gap-4">
          <div className="p-3.5 bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] rounded-2xl">
            <AlertTriangle className="w-5.5 h-5.5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest font-mono">Overdue Defaulters</p>
            <h4 className="text-lg font-black text-white font-mono mt-0.5">₹ {aggregateOverdue.toLocaleString('en-IN')}</h4>
            <span className="text-[10px] text-rose-500 font-bold font-sans">9 Active accounts</span>
          </div>
        </div>

        {/* Metric C: Pending Invoice */}
        <div className="bg-[#1E293B] p-5 rounded-3xl border border-[#334155] shadow-3xs flex items-center gap-4">
          <div className="p-3.5 bg-[#F59E0B]/10 border border-[#F59E0B]/30 text-[#F59E0B] rounded-2xl">
            <IndianRupee className="w-5.5 h-5.5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest font-mono">Pending Collection</p>
            <h4 className="text-lg font-black text-white font-mono mt-0.5">₹ {aggregatePending.toLocaleString('en-IN')}</h4>
            <span className="text-[10px] text-[#94A3B8] font-medium font-sans">Trimester due-dates</span>
          </div>
        </div>

        {/* Metric D: Progress bar collection Rate */}
        <div className="bg-[#1E293B] p-5 rounded-3xl border border-[#334155] shadow-3xs flex flex-col justify-center">
          <div className="flex justify-between items-center text-[10px] font-bold text-[#94A3B8] font-mono uppercase">
            <span>Billing Clearance Rate</span>
            <span className="text-[#2563EB]">{billingRate}%</span>
          </div>
          <div className="w-full bg-[#273549] h-2.5 rounded-full mt-2 relative overflow-hidden text-left">
            <div className="bg-[#2563EB] shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(56,189,248,0.5)] hover:bg-[#38BDF8] h-full rounded-full transition-all duration-500" style={{ width: `${billingRate}%` }}></div>
          </div>
        </div>

      </div>

      {/* Main Ledger Content and Controls with Pie Chart Visual breakdown block */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Visual Chart Sidebar Column - 4 cols */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#1E293B] p-6 rounded-3xl border border-[#334155] shadow-3xs flex flex-col justify-between h-full">
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-[#94A3B8] font-mono">Treasury Asset Mix</h3>
              <p className="text-[11px] text-[#94A3B8] mt-0.5">Automated visual status of allocated tuition, admission, and transit ledger streams.</p>
            </div>

            {hasData ? (
              <div className="h-56 w-full flex items-center justify-center relative my-4">
                <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none z-10">
                  <span className="text-[9px] font-black text-[#94A3B8] uppercase tracking-widest font-mono">Total Invoiced</span>
                  <span className="text-md font-black text-white font-mono mt-0.5">₹{totalInvoiced.toLocaleString('en-IN')}</span>
                </div>

                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Amount']}
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-56 flex flex-col items-center justify-center text-[#94A3B8] font-serif text-xs ">
                No fee records available to visualize
              </div>
            )}

            {/* Categorical labels with exact aggregate fractions and shares */}
            <div className="space-y-2.5 border-t border-[#334155] pt-4">
              {chartData.map((item) => {
                const percentage = totalInvoiced > 0 ? Math.round((item.value / totalInvoiced) * 100) : 0;
                return (
                  <div key={item.name} className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="font-bold text-[#CBD5E1]">{item.name}</span>
                    </div>
                    <div className="text-right font-mono flex items-center gap-1.5">
                      <span className="text-white font-bold">₹{item.value.toLocaleString('en-IN')}</span>
                      <span className="text-[#94A3B8] text-[9.5px] font-semibold bg-[#111827] px-1.5 py-0.5 rounded">
                        ({percentage}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Ledger lists & Filters layout Column - 8 cols */}
        <div className="lg:col-span-8 bg-[#1E293B] p-6 rounded-3xl border border-[#334155] shadow-3xs space-y-5">
          
          {/* Filters control bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#94A3B8]" />
              <input 
                type="text"
                value={financeSearch}
                onChange={(e) => setFinanceSearch(e.target.value)}
                placeholder="Search invoices by Student / ID..."
                className="w-full bg-[#111827] border border-[#334155] text-xs rounded-xl pl-10 pr-4 py-2 outline-hidden focus:bg-[#1E293B] focus:border-indigo-505 text-[#CBD5E1]"
              />
            </div>

            <div className="flex gap-2.5 w-full sm:w-auto shrink-0 justify-end">
              <select
                value={selectedFeeTypeFilter}
                onChange={(e) => setSelectedFeeTypeFilter(e.target.value)}
                className="bg-[#111827] border text-xs font-bold text-[#CBD5E1] rounded-xl px-3 py-2 cursor-pointer outline-hidden"
              >
                <option value="All">All Streams</option>
                <option value="Tuition">Tuition Fees</option>
                <option value="Admission">Admission Fees</option>
                <option value="Bus">Bus Fees</option>
                <option value="Lab">Lab Fees</option>
              </select>

              <button
                type="button"
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-[#10B981]/10 border border-[#10B981]/30 hover:bg-[#10B981]/20 border border-emerald-200 text-[#10B981] font-bold rounded-xl text-xs cursor-pointer transition-all shadow-3xs whitespace-nowrap"
                title="Download active fee ledger as Excel/CSV spreadsheet report"
              >
                <Download className="w-4 h-4 text-[#10B981]" />
                <span>Export to Excel</span>
              </button>

              <button
                onClick={() => setIsFeeModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-[#2563EB] shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(56,189,248,0.5)] hover:bg-[#38BDF8] hover:bg-indigo-700 text-white font-bold rounded-xl text-xs cursor-pointer transition-all shadow-3xs whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>Create Bill Invoice</span>
              </button>
            </div>
          </div>

          {/* Ledger lists grid */}
          <div className="rounded-2xl border border-[#334155] overflow-hidden">
            <table className="w-full text-left" id="fees-ledger-ledger">
              <thead>
                <tr className="bg-[#111827] text-[11px] text-[#94A3B8] font-mono  border-b border-[#334155]">
                  <th className="p-3 pl-4">Invoice ID</th>
                  <th className="p-3">Candidate / Class details</th>
                  <th className="p-3">Fee Specification</th>
                  <th className="p-3">Amount Stream</th>
                  <th className="p-3">Due Target</th>
                  <th className="p-3 text-center">Status clearance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#334155] text-xs font-sans text-slate-705">
                {filteredFees.map(fee => {
                  const statusColor = 
                    fee.status === 'Paid' ? 'bg-[#10B981]/10 border border-[#10B981]/30 text-[#10B981] border-emerald-200' :
                    fee.status === 'Overdue' ? 'bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] border-rose-200 animate-pulse' :
                    'bg-[#F59E0B]/10 border border-[#F59E0B]/30 text-[#F59E0B] border-amber-200';

                  return (
                    <tr key={fee.id} className="hover:bg-slate-55" id={`fees-row-${fee.id}`}>
                      <td className="p-3 pl-4 font-mono font-bold text-white">{fee.id}</td>
                      <td className="p-3">
                        <p className="font-bold text-white">{fee.studentName}</p>
                        <p className="text-[9.5px] text-[#94A3B8] font-mono">UID: {fee.studentId} • {fee.className}</p>
                      </td>
                      <td className="p-3">
                        <p className="font-semibold text-[#CBD5E1]">{fee.title}</p>
                        {fee.paymentMethod && <span className="text-[9.5px] font-mono text-[#94A3B8] block mt-0.5">{fee.paymentMethod}</span>}
                      </td>
                      <td className="p-3 font-mono font-bold text-white">₹ {fee.amount.toLocaleString('en-IN')}</td>
                      <td className="p-3 font-mono text-[#94A3B8]">{fee.dueDate}</td>
                      <td className="p-3">
                        <div className="flex justify-center items-center gap-2">
                          <span className={`px-2.5 py-1 text-[9.5px] font-black font-mono rounded-lg border uppercase tracking-wider ${statusColor}`}>
                            {fee.status}
                          </span>

                          {fee.status !== 'Paid' ? (
                            <button
                              type="button"
                              onClick={() => clearInvoicePayment(fee.id)}
                              className="px-2.5 py-1 bg-[#2563EB]/10 border border-[#2563EB]/30 hover:bg-[#2563EB]/20 text-[#38BDF8] font-bold border border-indigo-200 rounded-lg text-[10px] cursor-pointer transition-colors whitespace-nowrap"
                            >
                              Collect ₹
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setSelectedReceiptFee(fee)}
                              className="p-1 text-[#94A3B8] hover:text-[#38BDF8] hover:drop-shadow-[0_0_8px_rgba(56,189,248,0.5)] hover:bg-[#2563EB]/10 border border-[#2563EB]/30 rounded-lg cursor-pointer transition-colors"
                              title="Generate and Print PDF/Digital Receipt"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredFees.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-[#94A3B8] ">No invoice references matching search parameters found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>

      </div>

      {/* MODAL WINDOWS A: DYNAMIC DIGITAL RECEIPT DRAWER */}
      {selectedReceiptFee && (
        <div className="fixed inset-0 z-60 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in" id="receipt-digital-modal">
          <div className="bg-[#1E293B] rounded-3xl w-full max-w-sm shadow-2xl border border-[#334155] overflow-hidden flex flex-col">
            
            <div className="bg-indigo-900 p-5 text-white text-center relative">
              <div className="absolute top-0 inset-x-0 h-1 bg-yellow-400"></div>
              <h3 className="text-xs font-black uppercase tracking-widest font-mono">EduQube Finance Bureau</h3>
              <p className="text-[10px] text-indigo-200 mt-0.5">Automated Digital Fee Receipt</p>
              
              <button
                type="button"
                onClick={() => setSelectedReceiptFee(null)}
                className="absolute right-4 top-4 text-indigo-200 hover:text-white bg-slate-805/30 hover:bg-[#1E293B]/10 p-1 rounded-full cursor-pointer"
              >
                <FileText className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Printable Frame Area */}
            <div className="p-6 space-y-5 text-left text-white" id="bursar-printable-receipt">
              
              <div className="flex justify-between items-center border-b border-dashed border-slate-250 pb-3">
                <div>
                  <h4 className="text-xs font-black text-white tracking-wide uppercase">EduQube Officiating Receipt</h4>
                  <p className="text-[9px] text-[#94A3B8] tracking-wider">CBSE Regd No: 1630121</p>
                </div>
                <div className="text-right">
                  <span className="bg-[#10B981]/10 border border-[#10B981]/30 text-emerald-850 border border-emerald-250 text-[9px] font-black px-2 py-0.5 rounded font-mono uppercase tracking-wider">
                    Paid Recd
                  </span>
                </div>
              </div>

              {/* Receipt Parameters grid */}
              <div className="space-y-3 text-[11px] bg-[#111827] p-4 rounded-xl border border-[#334155]">
                <div className="flex justify-between font-mono">
                  <span className="text-[#94A3B8]">Receipt Ref:</span>
                  <strong className="text-[#CBD5E1] font-extrabold">{selectedReceiptFee.receiptNo || 'REC-908122-CQ'}</strong>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-[#94A3B8]">Invoice Ref:</span>
                  <strong className="text-[#CBD5E1] font-extrabold">{selectedReceiptFee.id}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#94A3B8]">Payer Student:</span>
                  <strong className="text-white font-bold truncate">{selectedReceiptFee.studentName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#94A3B8]">Class Grade:</span>
                  <strong className="text-slate-750 font-medium font-mono">{selectedReceiptFee.className}</strong>
                </div>
                <div className="flex justify-between border-t border-slate-205/50 pt-2 font-sans">
                  <span className="text-[#94A3B8]">Allocation:</span>
                  <strong className="text-slate-750 font-bold">{selectedReceiptFee.title}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#94A3B8]">Txn Mode:</span>
                  <strong className="text-[#CBD5E1] font-mono text-[9px]">{selectedReceiptFee.paymentMethod || 'Online UPI Portal'}</strong>
                </div>
                <div className="flex justify-between border-t border-dashed border-indigo-200/50 pt-3">
                  <span className="text-xs text-indigo-950 font-extrabold">Net Sum Collected:</span>
                  <span className="text-md text-white font-black font-mono">₹ {selectedReceiptFee.amount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Barcode and Stamp emulation */}
              <div className="flex flex-col items-center justify-center pt-2 space-y-1">
                <Barcode className="w-10/12 h-8 text-[#CBD5E1]" />
                <span className="text-[9.5px] font-mono tracking-widest text-[#94A3B8] uppercase">Treasury Token Verified</span>
              </div>

              <p className="text-[9.5px] text-slate-450 text-center font-serif leading-relaxed">This acts as a definitive digitally authenticated clearance receipt of payment for Dwarka Campus accounts logbook records. No wet signature is mandatory.</p>

            </div>

            {/* Receipt Modal Trigger bar */}
            <div className="p-4 bg-[#111827] border-t border-[#334155] flex gap-2">
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-[#2563EB] shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(56,189,248,0.5)] hover:bg-[#38BDF8] hover:bg-slate-900 text-white font-black text-xs rounded-xl cursor-pointer transition-colors shadow-3xs"
              >
                <Printer className="w-4 h-4" />
                <span>Print Copy Ledger</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedReceiptFee(null)}
                className="px-4 py-2 bg-[#334155] hover:bg-slate-300 text-[#CBD5E1] font-bold rounded-xl text-xs cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* OVERLAY B: INITIALIZE BILL ALLOCATION */}
      {isFeeModalOpen && (
        <div className="fixed inset-0 z-55 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4" id="fee-invoice-modal">
          <div className="bg-[#1E293B] rounded-2xl w-full max-w-md shadow-2xl border border-[#334155] flex flex-col font-sans">
            <div className="p-5 bg-[#111827] border-b border-[#334155] rounded-t-2xl text-left">
              <h3 className="text-xs font-black uppercase tracking-widest text-white font-mono">Allocate Billing Invoice</h3>
              <p className="text-xs text-[#94A3B8] mt-0.5">Allocate Tuition Fee, Bus Fee, or Lab Fee invoice parameters to parents.</p>
            </div>

            <form onSubmit={handleAllocateFee} className="p-5 space-y-4 text-xs font-sans text-left">
              
              <div>
                <label className="block text-xs font-bold text-[#94A3B8] uppercase mb-1">Target Debtor Student *</label>
                <select
                  required
                  value={feeStudentId}
                  onChange={(e) => setFeeStudentId(e.target.value)}
                  className="w-full bg-[#111827] border border-[#334155] rounded-xl px-3 py-2 text-xs text-slate-750 font-bold focus:bg-[#1E293B] outline-hidden cursor-pointer"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.className} • Roll {s.rollNo})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#94A3B8] uppercase mb-1">Fee stream parameter *</label>
                <select
                  required
                  value={feeTitle}
                  onChange={(e) => setFeeTitle(e.target.value)}
                  className="w-full bg-[#111827] border border-[#334155] rounded-xl px-3 py-2 text-xs text-slate-755 font-semibold focus:bg-[#1E293B] outline-hidden cursor-pointer"
                >
                  <option value="Quarterly Tuition Fee">Quarterly Tuition Feed</option>
                  <option value="Admission CRM Fee">Admission Verification Fee</option>
                  <option value="Specialist Lab Accessories Fee">Science Lab Equipment Charge</option>
                  <option value="Bus Commute Transit Fee">Bus Commute Transport Fee</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#94A3B8] uppercase mb-1">INR Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    value={feeAmount}
                    onChange={(e) => setFeeAmount(Number(e.target.value))}
                    className="w-full bg-[#111827] border border-[#334155] rounded-xl px-3 py-2 text-xs text-white font-bold font-mono outline-hidden focus:bg-[#1E293B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#94A3B8] uppercase mb-1">Due Date (DD-MM-YYYY) *</label>
                  <input
                    type="text"
                    required
                    value={feeDueDate}
                    onChange={(e) => setFeeDueDate(e.target.value)}
                    className="w-full bg-[#111827] border border-[#334155] rounded-xl px-3 py-2 text-xs text-[#CBD5E1] font-medium font-mono outline-hidden focus:bg-[#1E293B]"
                  />
                </div>
              </div>

              <div className="flex gap-2.5 pt-4 border-t border-[#334155] justify-end">
                <button
                  type="button"
                  onClick={() => setIsFeeModalOpen(false)}
                  className="px-4 py-2 bg-[#273549] hover:bg-[#334155] text-[#94A3B8] font-bold rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2563EB] shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(56,189,248,0.5)] hover:bg-[#38BDF8] hover:bg-indigo-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-3xs"
                >
                  Allocate Bill
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
