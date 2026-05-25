import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Send,
  Phone,
  Sparkles,
  Users,
  AlertTriangle,
  History,
  CheckCircle2,
  Clock,
  Smartphone,
  ChevronRight,
  Filter,
  DollarSign
} from 'lucide-react';
import { Student } from '../types';

interface WhatsAppProps {
  students: Student[];
}

export const BulkWhatsAppManager: React.FC<WhatsAppProps> = ({ students }) => {
  const [activeTab, setActiveTab] = useState<'composer' | 'templates' | 'history'>('composer');
  
  // Composer states
  const [selectedAudience, setSelectedAudience] = useState<'class_specific' | 'fee_due' | 'absent_today' | 'all'>('class_specific');
  const [selectedClass, setSelectedClass] = useState('Class 10');
  const [messageContent, setMessageContent] = useState('');
  
  // Mock delivery states
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  
  // Stats
  const activeStudents = students.filter(s => s.status === 'Active');

  const getRecipientCount = () => {
    switch (selectedAudience) {
      case 'all': return activeStudents.length;
      case 'class_specific': return activeStudents.filter(s => s.className === selectedClass).length;
      case 'fee_due': return Math.floor(activeStudents.length * 0.3); // mock ~30%
      case 'absent_today': return Math.floor(activeStudents.length * 0.05); // mock ~5%
      default: return 0;
    }
  };

  const handleSend = () => {
    if (!messageContent.trim()) {
      alert("Please enter a message to broadcast.");
      return;
    }

    if (getRecipientCount() === 0) {
      alert("No recipients selected based on current filters.");
      return;
    }

    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setSendSuccess(true);
      setTimeout(() => setSendSuccess(false), 3000);
      setMessageContent('');
    }, 2000);
  };

  const templates = [
    {
      title: "Fee Reminder",
      icon: <DollarSign className="w-4 h-4 text-rose-500" />,
      content: "Dear Parent, this is a reminder that your child's school fee is still pending. Please complete the payment to avoid late charges. Thank you. - EduQube"
    },
    {
      title: "Absent Alert",
      icon: <AlertTriangle className="w-4 h-4 text-amber-500" />,
      content: "Dear Parent, your child was marked absent today. If this is incorrect, please contact the school administration. - EduQube"
    },
    {
      title: "Holiday/Notice",
      icon: <Sparkles className="w-4 h-4 text-indigo-500" />,
      content: "Dear Parent, please note that the school will remain closed tomorrow due to unpredicted weather constraints. - EduQube"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Title Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#1E293B] p-6 rounded-2xl shadow-lg shadow-black/20 border border-emerald-100">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <div className="p-2 border border-emerald-200 bg-[#10B981]/10 border border-[#10B981]/30 rounded-xl shrink-0">
               <MessageSquare className="text-[#10B981] w-5 h-5" />
            </div>
            Smart WhatsApp Broadcasting Engine
          </h1>
          <p className="text-sm text-[#94A3B8] mt-0.5 max-w-2xl">
            Automated, class-wise, and fee-triggered WhatsApp dispatch to parent mobile devices instantly saving manual calling time.
          </p>
        </div>
      </div>

       <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left pane: Broadcast Engine */}
        <div className="lg:col-span-8 bg-[#1E293B] rounded-2xl shadow-lg shadow-black/20 border border-[#334155] overflow-hidden">
          
          <div className="flex border-b border-[#334155]">
            <button 
              onClick={() => setActiveTab('composer')}
              className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'composer' ? 'border-b-2 border-emerald-500 text-[#10B981] bg-[#10B981]/10 border border-[#10B981]/30/30' : 'text-[#94A3B8] hover:bg-[#111827]'}`}
            >
              <Smartphone className="w-4 h-4" /> Message Composer
            </button>
            <button 
              onClick={() => setActiveTab('templates')}
              className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'templates' ? 'border-b-2 border-emerald-500 text-[#10B981] bg-[#10B981]/10 border border-[#10B981]/30/30' : 'text-[#94A3B8] hover:bg-[#111827]'}`}
            >
              <Sparkles className="w-4 h-4" /> Fast Templates
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'history' ? 'border-b-2 border-emerald-500 text-[#10B981] bg-[#10B981]/10 border border-[#10B981]/30/30' : 'text-[#94A3B8] hover:bg-[#111827]'}`}
            >
              <History className="w-4 h-4" /> Send History Logs
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'composer' && (
              <div className="space-y-6 animate-fade-in">
                
                {/* Target Scope */}
                <div className="space-y-3">
                   <h3 className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">1. Select Target Recipient Rule</h3>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                     {[
                       { id: 'class_specific', label: 'By Class/Sec', icon: <Users className="w-4 h-4" /> },
                       { id: 'fee_due', label: 'Fee Due', icon: <DollarSign className="w-4 h-4" /> },
                       { id: 'absent_today', label: 'Absent Today', icon: <Clock className="w-4 h-4" /> },
                       { id: 'all', label: 'School Wide', icon: <Filter className="w-4 h-4" /> }
                     ].map(opt => (
                       <button
                         key={opt.id}
                         onClick={() => setSelectedAudience(opt.id as any)}
                         className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 text-xs font-bold transition-all ${selectedAudience === opt.id ? 'bg-[#10B981]/10 border border-[#10B981]/30 border-emerald-500 text-[#10B981] shadow-lg shadow-black/20' : 'bg-[#1E293B] border-[#334155] text-[#CBD5E1] hover:bg-[#111827] hover:border-slate-300'}`}
                       >
                         {opt.icon}
                         {opt.label}
                       </button>
                     ))}
                   </div>
                </div>

                {/* Sub Filters based on selection */}
                {selectedAudience === 'class_specific' && (
                  <div className="space-y-2 animate-fade-in">
                    <label className="block text-xs font-bold text-[#94A3B8]">Pick Grade Class Target</label>
                    <select 
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                      className="w-full bg-[#111827] border border-[#334155] rounded-xl px-4 py-3 text-sm text-[#CBD5E1] font-bold focus:border-emerald-500 focus:bg-[#1E293B] transition-all outline-hidden appearance-none"
                    >
                      <option value="Class 10">Class 10 Families</option>
                      <option value="Class 9">Class 9 Families</option>
                      <option value="Class 8">Class 8 Families</option>
                    </select>
                  </div>
                )}

                {/* Actual Editor */}
                <div className="space-y-2 pt-4 border-t border-[#334155]">
                   <div className="flex justify-between items-end">
                     <h3 className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">2. Compose WhatsApp Document</h3>
                     <span className="text-[10px] text-[#10B981] font-bold bg-[#10B981]/10 border border-[#10B981]/30 border border-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                       <CheckCircle2 className="w-3 h-3" /> System connected
                     </span>
                   </div>
                   <textarea 
                     rows={5}
                     value={messageContent}
                     onChange={(e) => setMessageContent(e.target.value)}
                     placeholder="Write your professional broadcast content..."
                     className="w-full bg-[#111827] border border-[#334155] rounded-xl px-4 py-3 text-sm text-[#CBD5E1] font-medium focus:border-emerald-500 focus:bg-[#1E293B] outline-hidden transition-all shadow-inner"
                   />
                </div>

                {/* Dispatch Summary */}
                <div className="bg-[#111827] border border-[#334155] rounded-xl p-4 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider block">Est. Delivery Count</span>
                    <span className="text-xl font-black text-white font-mono tracking-tight">{getRecipientCount()} Parents</span>
                  </div>
                  <button
                    onClick={handleSend}
                    disabled={isSending || sendSuccess}
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wide rounded-xl shadow-md active:scale-95 transition-all disabled:opacity-75 disabled:cursor-wait"
                  >
                    {isSending ? (
                      <span className="flex items-center gap-2"><Clock className="w-4 h-4 animate-spin" /> DISPATCHING...</span>
                    ) : sendSuccess ? (
                      <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> CAMPAIGN SENT!</span>
                    ) : (
                      <span className="flex items-center gap-2"><Send className="w-4 h-4" /> DISPATCH WHATSAPP</span>
                    )}
                  </button>
                </div>

              </div>
            )}

            {activeTab === 'templates' && (
              <div className="space-y-4 animate-fade-in">
                <p className="text-xs text-[#94A3B8] mb-4">Click any enterprise template to immediately load it into the Composer engine.</p>
                {templates.map((tpl, i) => (
                  <div 
                    key={i} 
                    onClick={() => {
                      setMessageContent(tpl.content);
                      setActiveTab('composer');
                    }}
                    className="p-4 rounded-xl border border-[#334155] hover:border-emerald-400 hover:bg-[#10B981]/10 border border-[#10B981]/30/50 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-2 mb-2">
                       {tpl.icon}
                       <h3 className="text-sm font-bold text-white">{tpl.title}</h3>
                    </div>
                    <p className="text-xs text-[#CBD5E1] leading-relaxed">"{tpl.content}"</p>
                    <div className="text-right mt-2 text-[10px] font-bold text-[#10B981] opacity-0 group-hover:opacity-100 transition-opacity">
                      USE TEMPLATE →
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-[#F59E0B]/10 border border-[#F59E0B]/30 p-4 border border-amber-200 rounded-xl flex items-start gap-3">
                   <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                   <div>
                     <h4 className="font-bold text-[#F59E0B] text-xs">Offline Mode Logs</h4>
                     <p className="text-[10px] text-[#F59E0B] mt-0.5">Delivery reports are currently cached locally in this test sandbox environment. You need to connect official Twilio/Meta Gateway hooks in Production for live message tracking logs.</p>
                   </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Right pane: Insight stats */}
        <div className="lg:col-span-4 space-y-6">
           <div className="bg-gradient-to-br from-emerald-800 to-teal-950 p-6 rounded-2xl border border-emerald-900 text-white shadow-lg space-y-5 relative overflow-hidden">
             
             <div className="absolute top-0 right-0 p-4 opacity-10 blur-xs scale-150">
               <MessageSquare className="w-32 h-32 text-white" />
             </div>

             <div className="flex items-center gap-2 relative">
               <Phone className="w-5 h-5 text-emerald-300" />
               <h3 className="text-sm font-bold text-emerald-100 uppercase tracking-widest">Automation Engine</h3>
             </div>

             <div className="bg-black/20 p-4 rounded-xl backdrop-blur-xs border border-white/10 relative">
               <div className="space-y-3">
                 <div className="flex justify-between items-center text-xs border-b border-white/5 pb-2">
                   <span className="text-emerald-200/70">Mtd. Deliveries</span>
                   <span className="font-mono font-bold text-emerald-100">4,289 sent</span>
                 </div>
                 <div className="flex justify-between items-center text-xs border-b border-white/5 pb-2">
                   <span className="text-emerald-200/70">Success Delivery</span>
                   <span className="font-mono font-bold text-emerald-400">99.4%</span>
                 </div>
                 <div className="flex justify-between items-center text-xs pb-1">
                   <span className="text-emerald-200/70">Active Channels</span>
                   <span className="font-mono font-bold text-emerald-100">Meta + Twilio</span>
                 </div>
               </div>
             </div>

             <div className="bg-[#10B981]/10 border border-[#10B981]/300/20 text-[10px] text-emerald-200 p-3 rounded-lg border border-emerald-500/30 font-medium leading-relaxed relative">
               Automated fee recovery reminders have increased collection yield by +18% on average per month.
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};
