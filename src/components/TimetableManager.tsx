import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Search, 
  Plus, 
  Edit, 
  Grid3X3,
  X,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { TimetableSlot, Staff } from '../types';

interface TimetableManagerProps {
  timetableSlots: TimetableSlot[];
  staffList: Staff[];
  onUpdateSlot: (updatedSlot: TimetableSlot) => void;
}

export const TimetableManager: React.FC<TimetableManagerProps> = ({
  timetableSlots,
  staffList,
  onUpdateSlot
}) => {
  // Navigation variables
  const [selectedClass, setSelectedClass] = useState('Class 10');
  
  // Rescheduling slot overlay states
  const [isEditingOpen, setIsEditingOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimetableSlot | null>(null);

  // Form states
  const [formSubject, setFormSubject] = useState('');
  const [formTeacherId, setFormTeacherId] = useState('');
  const [formRoom, setFormRoom] = useState('');

  // Weekly structure keys
  const DAYS: ('Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday')[] = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'
  ];
  const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

  // Helper function to extract slot based on unique metrics
  const findSlot = (day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday', period: number) => {
    return timetableSlots.find(
      s => s.className === selectedClass && s.day === day && s.period === period
    );
  };

  // Launch editing modal
  const openRescheduleModal = (slot: TimetableSlot) => {
    setSelectedSlot(slot);
    setFormSubject(slot.subject);
    setFormTeacherId(slot.teacherId);
    setFormRoom(slot.room);
    setIsEditingOpen(true);
  };

  const handleSaveReschedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;

    const teacher = staffList.find(s=>s.id === formTeacherId);
    const teacherName = teacher ? teacher.name : selectedSlot.teacherName;

    onUpdateSlot({
      ...selectedSlot,
      subject: formSubject,
      teacherId: formTeacherId,
      teacherName,
      room: formRoom
    });

    setIsEditingOpen(false);
  };

  return (
    <div className="space-y-6" id="timetable-module-container text-slate-705">
      {/* Title Header summary bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#1E293B] p-6 rounded-2xl shadow-lg shadow-black/20 border border-[#334155]">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Grid3X3 className="text-[#2563EB] w-6 h-6" />
            Interactive Weekly Timetable Planner
          </h1>
          <p className="text-sm text-[#94A3B8] mt-0.5">Structure weekly academic slots, assign classrooms, and prevent resource conflicts across faculty circles.</p>
        </div>

        {/* Grade Filter toggle switcher */}
        <div className="flex bg-[#273549] p-1 rounded-xl" id="timetable-class-switcher">
          {['Class 10', 'Class 9', 'Class 8'].map((cls) => (
            <button
              key={cls}
              id={`timetable-switch-btn-${cls.replace(/\s+/g, '-')}`}
              onClick={() => setSelectedClass(cls)}
              className={`text-xs font-mono font-bold px-4 py-2 rounded-lg cursor-pointer transition-all ${
                selectedClass === cls 
                  ? 'bg-[#1E293B] text-indigo-750 shadow-2xs font-black' 
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              {cls}
            </button>
          ))}
        </div>
      </div>

      {/* Guide Help info banner */}
      <div className="bg-[#111827] p-4 rounded-xl border border-[#334155] flex items-center justify-between text-xs text-[#94A3B8] font-sans outline-hidden">
        <p className="flex items-center gap-2">
          <span>💡</span>
          <span>Click any established period slot block on the matrix grid card below to reschedule subjects, rooms or teacher allocations.</span>
        </p>
        <span className="text-[10px] bg-[#273549] border border-[#334155] text-[#94A3B8] font-mono px-2 py-0.5 rounded font-bold font-sans uppercase">Conflict Check Active</span>
      </div>

      {/* Main Weekly Timeline Scheduler Grid Matrix Card */}
      <div className="bg-[#1E293B] rounded-2xl border border-[#334155] shadow-lg shadow-black/20 overflow-hidden" id="timetable-schedule-matrix">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border-[#334155]" id="timetable-calendar-matrix">
            <thead>
              {/* Columns represent Days */}
              <tr className="bg-[#111827] border-b border-rose-100 text-[11px] text-[#94A3B8] font-mono ">
                <th className="p-4 border-r border-[#334155] w-24">Lecture Period</th>
                {DAYS.map(d => (
                  <th key={d} className="p-4 w-44 font-bold text-center uppercase tracking-wider">{d}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#334155]">
              {PERIODS.map((period) => (
                <tr key={period} className="hover:bg-[#111827]/10" id={`timetable-period-row-${period}`}>
                  {/* Row header describes times */}
                  <td className="p-4 border-r border-[#334155] font-mono text-center align-middle bg-[#111827]">
                    <p className="font-bold text-white text-xs">Slot #{period}</p>
                    <p className="text-[9.5px] text-[#94A3B8] mt-1 uppercase font-black whitespace-nowrap">
                      {period === 1 ? '08:00 - 08:45 AM' :
                       period === 2 ? '08:45 - 09:30 AM' :
                       period === 3 ? '09:30 - 10:15 AM' :
                       period === 4 ? '10:15 - 11:00 AM' :
                       period === 5 ? '11:00 - 11:30 AM (Recess)' :
                       period === 6 ? '11:30 AM - 12:15 PM' :
                       period === 7 ? '12:15 - 01:00 PM' : '01:00 - 01:45 PM'}
                    </p>
                  </td>

                  {/* Period matrix slots */}
                  {DAYS.map(day => {
                    const slot = findSlot(day, period);
                    const isLunch = slot?.subject.includes('Lunch') || slot?.subject.includes('Recess');

                    return (
                      <td 
                        key={`${day}-${period}`} 
                        className="p-3 align-top border-r border-[#334155]"
                        id={`matrix-cell-${day}-${period}`}
                      >
                        {slot ? (
                          <div 
                            id={`timetable-slot-card-${slot.id}`}
                            onClick={() => openRescheduleModal(slot)}
                            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer group relative ${
                              isLunch 
                                ? 'bg-[#273549] border-[#334155] text-[#94A3B8] cursor-not-allowed select-none' 
                                : 'bg-linear-to-b from-indigo-50/30 to-indigo-50/10 border-indigo-150 text-white shadow-3xs hover:border-indigo-400 hover:shadow-2xs'
                            }`}
                          >
                            <div className="space-y-1.5">
                              <h4 className={`text-xs font-bold leading-normal font-sans line-clamp-1 ${isLunch ? 'text-slate-605' : 'text-white'}`}>
                                {slot.subject}
                              </h4>
                              
                              {!isLunch && (
                                <>
                                  <div className="flex items-center gap-1 text-[10.5px] text-slate-50y font-medium text-[#CBD5E1] line-clamp-1">
                                    <BookOpen className="w-3 h-3 text-[#94A3B8] shrink-0" />
                                    <span>Tchr: {slot.teacherName}</span>
                                  </div>

                                  <div className="flex items-center gap-1.5 text-[10px] text-[#94A3B8] mt-1 font-mono leading-none">
                                    <MapPin className="w-3 h-3 text-[#94A3B8] shrink-0" />
                                    <span>Venue: {slot.room}</span>
                                  </div>
                                </>
                              )}
                            </div>

                            {/* subtle hover edit prompt */}
                            {!isLunch && (
                              <span className="opacity-0 group-hover:opacity-100 absolute right-2 top-2 p-1 bg-[#1E293B] rounded shadow-3xs border border-indigo-100 text-[#2563EB] transition-all text-[9.5px] font-bold">
                                Edit
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="p-3 border border-dashed border-[#334155] rounded-xl flex items-center justify-center text-[10.5px] text-[#94A3B8] bg-[#111827]/40 select-none">
                            Free Space
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* OVERLAY TIMETABLE: RESCHEDULER DIALOG MODAL */}
      {isEditingOpen && selectedSlot && (
        <div className="fixed inset-0 z-55 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4" id="timetable-reschedule-modal">
          <div className="bg-[#1E293B] rounded-2xl w-full max-w-sm shadow-2xl border border-slate-110 flex flex-col">
            
            <div className="p-5 border-b border-[#334155] bg-[#111827] rounded-t-2xl">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                Reschedule Timetable Slot
              </h3>
              <p className="text-xs text-[#94A3B8] mt-1">
                Amend period allocations for {selectedSlot.day} - Lecture period #{selectedSlot.period}.
              </p>
            </div>

            <form onSubmit={handleSaveReschedule} className="p-5 space-y-4 text-xs font-sans text-slate-705">
              
              {/* Subject modifier */}
              <div>
                <label className="block text-xs font-semibold text-[#94A3B8] mb-1">Assigned Subject Course Title *</label>
                <input 
                  type="text"
                  required
                  id="form-reschedule-subject"
                  value={formSubject}
                  onChange={(e) => setFormSubject(e.target.value)}
                  placeholder="e.g. Advanced Calculus"
                  className="w-full bg-[#111827] border border-[#334155] rounded-xl px-3 py-2 text-xs text-[#CBD5E1] font-medium focus:border-indigo-500"
                />
              </div>

              {/* Teacher selector */}
              <div>
                <label className="block text-xs font-semibold text-[#94A3B8] mb-1 font-sans">Instructing Faculty Specialised *</label>
                <select
                  id="form-reschedule-teacher"
                  value={formTeacherId}
                  onChange={(e) => setFormTeacherId(e.target.value)}
                  className="w-full bg-[#111827] border border-[#334155] rounded-xl px-3 py-2 text-xs text-slate-705"
                >
                  <option value="NA">Unassigned Study Hall</option>
                  {staffList.filter(s=>s.role === 'Teacher').map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.designation})</option>
                  ))}
                </select>
              </div>

              {/* Classroom modifier */}
              <div>
                <label className="block text-xs font-semibold text-[#94A3B8] mb-1">Classroom Venue seating *</label>
                <input 
                  type="text"
                  required
                  id="form-reschedule-room"
                  value={formRoom}
                  onChange={(e) => setFormRoom(e.target.value)}
                  placeholder="e.g. Physics Seminar Hall"
                  className="w-full bg-[#111827] border border-[#334155] rounded-xl px-3 py-2 text-xs text-slate-705"
                />
              </div>

              <div className="pt-4 border-t border-[#334155] flex justify-end gap-3">
                <button
                  type="button"
                  id="btn-cancel-reschedule"
                  onClick={() => setIsEditingOpen(false)}
                  className="px-4 py-2 border border-[#334155] text-[#94A3B8] rounded-xl text-xs font-semibold cursor-pointer hover:bg-[#111827]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="btn-save-reschedule"
                  className="px-5 py-2 bg-[#2563EB] shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(56,189,248,0.5)] hover:bg-[#38BDF8] hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-black/20 cursor-pointer"
                >
                  Apply Scheduling
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
