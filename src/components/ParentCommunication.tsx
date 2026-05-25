import React, { useState } from 'react';
import { 
  BellRing, 
  MessageSquare, 
  Plus, 
  Search, 
  Filter, 
  ChevronRight, 
  User, 
  Calendar, 
  X,
  FileCheck,
  Send,
  Sparkles
} from 'lucide-react';
import { CommunicationAnnouncement } from '../types';

interface ParentCommunicationProps {
  announcements: CommunicationAnnouncement[];
  onAddAnnouncement: (newAnn: Omit<CommunicationAnnouncement, 'id'>) => void;
}

export const ParentCommunication: React.FC<ParentCommunicationProps> = ({
  announcements,
  onAddAnnouncement
}) => {
  // Navigation filters
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Announcement creator modal
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);

  // Announcement form fields state
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCategory, setFormCategory] = useState<'All' | 'Class 10' | 'Class 9' | 'Class 8'>('All');
  const [formType, setFormType] = useState<'Circular' | 'Announcement' | 'Alert'>('Announcement');
  const [formSender, setFormSender] = useState('Principal Eleanor Vance');

  // Handle adding new card
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) {
      alert('Please compile both the Title and the Circular Body Content before posting.');
      return;
    }

    onAddAnnouncement({
      title: formTitle,
      content: formContent,
      category: formCategory,
      type: formType,
      sender: formSender,
      role: formSender.includes('Principal') ? 'School Principal' : 'Academic Board Member',
      date: '2026-05-24' // Current timeline
    });

    // Reset
    setFormTitle('');
    setFormContent('');
    setIsCreatorOpen(false);
  };

  // Filter feed
  const filteredFeed = announcements.filter(ann => {
    const matchesSearch = ann.title.toLowerCase().includes(searchQuery.toLowerCase()) || ann.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = activeFilter === 'All' || ann.type === activeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6" id="parent-communication-container">
      {/* Title Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#1E293B] p-6 rounded-2xl shadow-lg shadow-black/20 border border-[#334155]">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <BellRing className="text-[#2563EB] w-6 h-6" />
            Family Communication Notice Board
          </h1>
          <p className="text-sm text-[#94A3B8] mt-0.5">Disseminate official school circular letters, emergency conditions, and home-school announcements.</p>
        </div>
        
        <button 
          id="btn-post-announcement"
          onClick={() => setIsCreatorOpen(true)}
          className="flex items-center gap-2 px-4.5 py-2.5 bg-[#2563EB] shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(56,189,248,0.5)] hover:bg-[#38BDF8] hover:bg-indigo-700 text-white font-medium text-xs rounded-xl shadow-lg shadow-black/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Broadcast Announcement
        </button>
      </div>

      {/* Filter and query controller */}
      <div className="bg-[#1E293B] p-5 rounded-2xl shadow-lg shadow-black/20 border border-[#334155] flex flex-col md:flex-row justify-between items-center gap-4" id="bulletin-filters">
        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#94A3B8]" />
          <input 
            type="text"
            id="bulletin-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search circulars by keyword..."
            className="w-full bg-[#111827] pl-10 pr-4 py-2 text-xs rounded-xl border border-[#334155] outline-hidden focus:border-indigo-500 focus:bg-[#1E293B] transition-all text-[#CBD5E1] font-medium"
          />
        </div>

        {/* Post category filter */}
        <div className="flex bg-[#273549] p-1 rounded-xl w-full md:w-auto" id="bulletin-type-toggles">
          {['All', 'Circular', 'Announcement', 'Alert'].map(type => (
            <button
              key={type}
              id={`bulletin-filter-btn-${type}`}
              onClick={() => setActiveFilter(type)}
              className={`flex-1 md:flex-initial text-xs font-bold px-3.5 py-1.5 rounded-lg cursor-pointer transition-all ${activeFilter === type ? 'bg-[#1E293B] text-indigo-750 shadow-2xs' : 'text-[#94A3B8] hover:text-white'}`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Notice list cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="notice-cards-grid">
        {/* Left pane: circular letter lists */}
        <div className="lg:col-span-8 space-y-5" id="noticeboard-main-feed">
          {filteredFeed.map((post) => (
            <div key={post.id} className="bg-[#1E293B] p-6 rounded-2xl border border-slate-110 shadow-3xs flex flex-col justify-between hover:border-slate-300 transition-all" id={`bulletin-card-${post.id}`}>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className={`px-2.5 py-0.5 rounded-full text-[9.5px] font-extrabold tracking-wider uppercase border ${
                    post.type === 'Alert' ? 'bg-[#EF4444]/10 border border-[#EF4444]/30 border-rose-200 text-[#EF4444]' :
                    post.type === 'Circular' ? 'bg-[#2563EB]/10 border border-[#2563EB]/30 border-indigo-200 text-indigo-800' :
                    'bg-[#111827] border-[#334155] text-slate-650'
                  }`}>
                    {post.type}
                  </span>
                  
                  <div className="flex items-center gap-1 text-[10.5px] text-[#94A3B8] font-mono font-bold">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{post.date}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-black text-white leading-snug tracking-tight">{post.title}</h3>
                  <p className="text-xs text-[#CBD5E1] leading-relaxed font-normal whitespace-pre-line">{post.content}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-50 mt-6 flex justify-between items-center text-[11px] text-[#94A3B8] font-medium">
                <div className="flex items-center gap-1.5 text-slate-705">
                  <div className="w-6 h-6 rounded-full bg-[#273549] flex items-center justify-center text-[10px] text-[#38BDF8] font-bold">
                    {post.sender.split(' ').map(n=>n[0]).join('')}
                  </div>
                  <span>Authorized: <strong className="font-semibold text-white">{post.sender}</strong> ({post.role})</span>
                </div>
                
                <span className="text-[10px] bg-[#111827] px-2 py-0.5 border border-[#334155] text-[#94A3B8] rounded font-mono font-bold">Category: {post.category}</span>
              </div>
            </div>
          ))}

          {filteredFeed.length === 0 && (
            <p className="text-xs text-slate-450 py-12 text-center bg-[#1E293B] rounded-2xl border border-[#334155]">
              No parent bulletins or formal circular letters match the filter queries.
            </p>
          )}
        </div>

        {/* Right pane: Quick communications help tips */}
        <div className="lg:col-span-4 space-y-5" id="notice-editorial">
          <div className="bg-linear-to-b from-indigo-950 to-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Notice Board Ethics
            </h3>
            <p className="text-xs text-indigo-100/90 leading-relaxed font-sans">
              Announcements dispatched here publish live onto student files and parent mobile notification apps.
            </p>
            <div className="p-3 bg-[#1E293B]/5 rounded-xl border border-white/10 text-[10.5px] leading-snug">
              🔔 Circular documents require Board Administrator approval tags before printable output becomes unlocked.
            </div>
          </div>

          <div className="bg-[#1E293B] p-5 rounded-2xl border border-[#334155] space-y-4">
            <h4 className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">SMS Dispatch Rates</h4>
            <div className="space-y-3.5 text-xs text-[#CBD5E1]">
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span>Direct circular reach:</span>
                <span className="font-bold text-white">100% Families</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span>Avg. message open rate:</span>
                <span className="font-bold text-[#38BDF8]">92% within 1 hr</span>
              </div>
              <p className="text-[10px] text-[#94A3B8]">EduQube uses safe carrier networks to prevent message drops.</p>
            </div>
          </div>
        </div>
      </div>

      {/* OVERLAY BULLETIN: BROADCAST FORM CREATOR */}
      {isCreatorOpen && (
        <div className="fixed inset-0 z-55 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4" id="announcement-modal">
          <div className="bg-[#1E293B] rounded-2xl w-full max-w-md shadow-2xl border border-slate-110 flex flex-col">
            
            <div className="p-5 border-b border-[#334155] bg-[#111827] rounded-t-2xl">
              <h3 className="text-sm font-bold text-white">Broadcast Parent Communication</h3>
              <p className="text-xs text-[#94A3B8] mt-1">Compose circular dispatch items.</p>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs font-sans text-slate-705">
              {/* Type selector */}
              <div>
                <label className="block text-xs font-semibold text-[#94A3B8] mb-1">Broadcasting Category *</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Announcement', 'Circular', 'Alert'].map(t => (
                    <button
                      key={t}
                      type="button"
                      id={`ann-form-type-${t}`}
                      onClick={() => setFormType(t as any)}
                      className={`py-2 text-[11px] font-bold rounded-lg border transition-all cursor-pointer ${
                        formType === t 
                          ? 'bg-[#2563EB]/10 border border-[#2563EB]/30 border-indigo-400 text-[#38BDF8]' 
                          : 'bg-[#111827] hover:bg-[#273549] border-[#334155] text-[#CBD5E1]'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title input */}
              <div>
                <label className="block text-xs font-semibold text-[#94A3B8] mb-1">Notice Heading Title *</label>
                <input 
                  type="text"
                  required
                  id="form-ann-title"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Trimester Science Exhibition 2026 Scheduling"
                  className="w-full bg-[#111827] border border-[#334155] rounded-xl px-3 py-2 text-xs text-[#CBD5E1] font-medium focus:border-indigo-500 focus:bg-[#1E293B] outline-hidden transition-all"
                />
              </div>

              {/* Target recipient class category */}
              <div>
                <label className="block text-xs font-semibold text-[#94A3B8] mb-1 font-sans">Target Recipient Scope *</label>
                <select
                  id="form-ann-category"
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as any)}
                  className="w-full bg-[#111827] border border-[#334155] rounded-xl px-3 py-2 text-xs text-[#CBD5E1] font-medium focus:border-indigo-500 focus:bg-[#1E293B] outline-hidden"
                >
                  <option value="All">All School Families</option>
                  <option value="Class 10">Grade 10 parent boards</option>
                  <option value="Class 9">Grade 9 parent boards</option>
                  <option value="Class 8">Grade 8 parent boards</option>
                </select>
              </div>

              {/* sender signature */}
              <div>
                <label className="block text-xs font-semibold text-[#94A3B8] mb-1 font-sans">Authorizing Official Signatory *</label>
                <input 
                  type="text"
                  required
                  id="form-ann-sender"
                  value={formSender}
                  onChange={(e) => setFormSender(e.target.value)}
                  placeholder="e.g. Principal Eleanor Vance"
                  className="w-full bg-[#111827] border border-[#334155] rounded-xl px-3 py-2 text-xs text-[#CBD5E1] font-medium focus:border-indigo-505"
                />
              </div>

              {/* Body Content */}
              <div>
                <label className="block text-xs font-semibold text-[#94A3B8] mb-1">Circular Content Body *</label>
                <textarea 
                  required
                  id="form-ann-content"
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Draft structural announcement message here..."
                  rows={4}
                  className="w-full bg-[#111827] border border-[#334155] rounded-xl px-3 py-2 text-xs text-[#CBD5E1] font-medium focus:border-indigo-500 focus:bg-[#1E293B] outline-hidden transition-all"
                />
              </div>

              <div className="pt-4 border-t border-[#334155] flex justify-end gap-3">
                <button
                  type="button"
                  id="btn-cancel-ann"
                  onClick={() => setIsCreatorOpen(false)}
                  className="px-4 py-2 border border-[#334155] text-[#94A3B8] rounded-xl text-xs font-semibold cursor-pointer hover:bg-[#111827]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="btn-save-ann"
                  className="px-5 py-2 bg-[#2563EB] shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(56,189,248,0.5)] hover:bg-[#38BDF8] hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-black/20 cursor-pointer flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  Issue Circular
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
