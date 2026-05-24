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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-xs border border-slate-100">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BellRing className="text-indigo-600 w-6 h-6" />
            Family Communication Notice Board
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Disseminate official school circular letters, emergency conditions, and home-school announcements.</p>
        </div>
        
        <button 
          id="btn-post-announcement"
          onClick={() => setIsCreatorOpen(true)}
          className="flex items-center gap-2 px-4.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Broadcast Announcement
        </button>
      </div>

      {/* Filter and query controller */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4" id="bulletin-filters">
        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input 
            type="text"
            id="bulletin-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search circulars by keyword..."
            className="w-full bg-slate-50 pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 outline-hidden focus:border-indigo-500 focus:bg-white transition-all text-slate-700 font-medium"
          />
        </div>

        {/* Post category filter */}
        <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto" id="bulletin-type-toggles">
          {['All', 'Circular', 'Announcement', 'Alert'].map(type => (
            <button
              key={type}
              id={`bulletin-filter-btn-${type}`}
              onClick={() => setActiveFilter(type)}
              className={`flex-1 md:flex-initial text-xs font-bold px-3.5 py-1.5 rounded-lg cursor-pointer transition-all ${activeFilter === type ? 'bg-white text-indigo-750 shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}
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
            <div key={post.id} className="bg-white p-6 rounded-2xl border border-slate-110 shadow-3xs flex flex-col justify-between hover:border-slate-300 transition-all" id={`bulletin-card-${post.id}`}>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className={`px-2.5 py-0.5 rounded-full text-[9.5px] font-extrabold tracking-wider uppercase border ${
                    post.type === 'Alert' ? 'bg-rose-50 border-rose-200 text-rose-800' :
                    post.type === 'Circular' ? 'bg-indigo-50 border-indigo-200 text-indigo-800' :
                    'bg-slate-50 border-slate-200 text-slate-650'
                  }`}>
                    {post.type}
                  </span>
                  
                  <div className="flex items-center gap-1 text-[10.5px] text-slate-400 font-mono font-bold">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{post.date}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-black text-slate-800 leading-snug tracking-tight">{post.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal whitespace-pre-line">{post.content}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-50 mt-6 flex justify-between items-center text-[11px] text-slate-400 font-medium">
                <div className="flex items-center gap-1.5 text-slate-705">
                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] text-indigo-700 font-bold">
                    {post.sender.split(' ').map(n=>n[0]).join('')}
                  </div>
                  <span>Authorized: <strong className="font-semibold text-slate-800">{post.sender}</strong> ({post.role})</span>
                </div>
                
                <span className="text-[10px] bg-slate-50 px-2 py-0.5 border border-slate-100 text-slate-500 rounded font-mono font-bold">Category: {post.category}</span>
              </div>
            </div>
          ))}

          {filteredFeed.length === 0 && (
            <p className="text-xs text-slate-450 py-12 text-center bg-white rounded-2xl border border-slate-100">
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
            <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-[10.5px] leading-snug">
              🔔 Circular documents require Board Administrator approval tags before printable output becomes unlocked.
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">SMS Dispatch Rates</h4>
            <div className="space-y-3.5 text-xs text-slate-600">
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span>Direct circular reach:</span>
                <span className="font-bold text-slate-800">100% Families</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span>Avg. message open rate:</span>
                <span className="font-bold text-indigo-700">92% within 1 hr</span>
              </div>
              <p className="text-[10px] text-slate-400">EduQube uses safe carrier networks to prevent message drops.</p>
            </div>
          </div>
        </div>
      </div>

      {/* OVERLAY BULLETIN: BROADCAST FORM CREATOR */}
      {isCreatorOpen && (
        <div className="fixed inset-0 z-55 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4" id="announcement-modal">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-110 flex flex-col">
            
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
              <h3 className="text-sm font-bold text-slate-800">Broadcast Parent Communication</h3>
              <p className="text-xs text-slate-400 mt-1">Compose circular dispatch items.</p>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs font-sans text-slate-705">
              {/* Type selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Broadcasting Category *</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Announcement', 'Circular', 'Alert'].map(t => (
                    <button
                      key={t}
                      type="button"
                      id={`ann-form-type-${t}`}
                      onClick={() => setFormType(t as any)}
                      className={`py-2 text-[11px] font-bold rounded-lg border transition-all cursor-pointer ${
                        formType === t 
                          ? 'bg-indigo-50 border-indigo-400 text-indigo-700' 
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title input */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Notice Heading Title *</label>
                <input 
                  type="text"
                  required
                  id="form-ann-title"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Trimester Science Exhibition 2026 Scheduling"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-medium focus:border-indigo-500 focus:bg-white outline-hidden transition-all"
                />
              </div>

              {/* Target recipient class category */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 font-sans">Target Recipient Scope *</label>
                <select
                  id="form-ann-category"
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-medium focus:border-indigo-500 focus:bg-white outline-hidden"
                >
                  <option value="All">All School Families</option>
                  <option value="Class 10">Grade 10 parent boards</option>
                  <option value="Class 9">Grade 9 parent boards</option>
                  <option value="Class 8">Grade 8 parent boards</option>
                </select>
              </div>

              {/* sender signature */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 font-sans">Authorizing Official Signatory *</label>
                <input 
                  type="text"
                  required
                  id="form-ann-sender"
                  value={formSender}
                  onChange={(e) => setFormSender(e.target.value)}
                  placeholder="e.g. Principal Eleanor Vance"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-medium focus:border-indigo-505"
                />
              </div>

              {/* Body Content */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Circular Content Body *</label>
                <textarea 
                  required
                  id="form-ann-content"
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Draft structural announcement message here..."
                  rows={4}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-medium focus:border-indigo-500 focus:bg-white outline-hidden transition-all"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  id="btn-cancel-ann"
                  onClick={() => setIsCreatorOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-500 rounded-xl text-xs font-semibold cursor-pointer hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="btn-save-ann"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center gap-2"
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
