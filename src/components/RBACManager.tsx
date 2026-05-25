import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Key, 
  Activity, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Check, 
  X,
  Lock,
  Eye,
  Settings,
  Database,
  Globe,
  Copy
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Types
type Action = 'view' | 'create' | 'edit' | 'delete' | 'approve';
export type ModuleName = 'Admissions' | 'Students' | 'Attendance' | 'Fees' | 'Exams' | 'Results' | 'Timetable' | 'HR_Payroll' | 'Hostel' | 'Transport' | 'Library' | 'Visitors' | 'AI_Assistant' | 'Reports' | 'Notifications' | 'Inventory' | 'Settings' | 'Staff' | 'Communication';

export interface PermissionDetails {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  approve: boolean;
}

export type RolePermissions = Record<ModuleName, PermissionDetails>;

export interface Role {
  id: string;
  name: string;
  description: string;
  isSystem: boolean; // System roles cannot be deleted
  userCount: number;
  permissions: RolePermissions;
}

// Default Data
export const defaultPermissions: RolePermissions = {
  Admissions: { view: false, create: false, edit: false, delete: false, approve: false },
  Students: { view: false, create: false, edit: false, delete: false, approve: false },
  Attendance: { view: false, create: false, edit: false, delete: false, approve: false },
  Fees: { view: false, create: false, edit: false, delete: false, approve: false },
  Exams: { view: false, create: false, edit: false, delete: false, approve: false },
  Results: { view: false, create: false, edit: false, delete: false, approve: false },
  Timetable: { view: false, create: false, edit: false, delete: false, approve: false },
  HR_Payroll: { view: false, create: false, edit: false, delete: false, approve: false },
  Hostel: { view: false, create: false, edit: false, delete: false, approve: false },
  Transport: { view: false, create: false, edit: false, delete: false, approve: false },
  Library: { view: false, create: false, edit: false, delete: false, approve: false },
  Visitors: { view: false, create: false, edit: false, delete: false, approve: false },
  AI_Assistant: { view: false, create: false, edit: false, delete: false, approve: false },
  Reports: { view: false, create: false, edit: false, delete: false, approve: false },
  Notifications: { view: false, create: false, edit: false, delete: false, approve: false },
  Inventory: { view: false, create: false, edit: false, delete: false, approve: false },
  Staff: { view: false, create: false, edit: false, delete: false, approve: false },
  Communication: { view: false, create: false, edit: false, delete: false, approve: false },
  Settings: { view: false, create: false, edit: false, delete: false, approve: false },
};

const fullAccess = { view: true, create: true, edit: true, delete: true, approve: true };

export const defaultRoles: Role[] = [
  {
    id: 'R0',
    name: 'Super Admin',
    description: 'Root platform access. Master control over all tenant schools, billing, and logs.',
    isSystem: true,
    userCount: 1,
    permissions: Object.keys(defaultPermissions).reduce((acc, key) => { acc[key as ModuleName] = { ...fullAccess }; return acc; }, {} as RolePermissions)
  },
  {
    id: 'R1',
    name: 'School Owner',
    description: 'Full administrative access to a single school workspace.',
    isSystem: true,
    userCount: 2,
    permissions: Object.keys(defaultPermissions).reduce((acc, key) => { acc[key as ModuleName] = { ...fullAccess }; return acc; }, {} as RolePermissions)
  },
  {
    id: 'R2',
    name: 'Principal',
    description: 'Academic overview and staff management. No secure settings access.',
    isSystem: true,
    userCount: 1,
    permissions: {
      ...defaultPermissions,
      Admissions: { view: true, create: true, edit: true, delete: false, approve: true },
      Students: { ...fullAccess },
      Attendance: { ...fullAccess },
      Fees: { view: true, create: false, edit: false, delete: false, approve: false },
      Exams: { ...fullAccess },
      Results: { ...fullAccess },
      Timetable: { ...fullAccess },
      HR_Payroll: { view: true, create: false, edit: false, delete: false, approve: false },
      Staff: { view: true, create: true, edit: true, delete: false, approve: true },
      Reports: { ...fullAccess },
      Notifications: { ...fullAccess },
      Communication: { ...fullAccess },
    }
  },
  {
    id: 'R3',
    name: 'Teacher',
    description: 'Academic staff access for marking attendance, exams, and basic reporting.',
    isSystem: true,
    userCount: 34,
    permissions: {
      ...defaultPermissions,
      Students: { view: true, create: false, edit: false, delete: false, approve: false },
      Attendance: { view: true, create: true, edit: true, delete: false, approve: false },
      Exams: { view: true, create: false, edit: false, delete: false, approve: false },
      Results: { view: true, create: true, edit: true, delete: false, approve: false },
      Timetable: { view: true, create: false, edit: false, delete: false, approve: false },
      Staff: { view: true, create: false, edit: false, delete: false, approve: false },
      Communication: { view: true, create: true, edit: false, delete: false, approve: false },
    }
  },
  {
    id: 'R4',
    name: 'Accountant',
    description: 'Finance desk access for managing fee collection and receipts.',
    isSystem: true,
    userCount: 3,
    permissions: {
      ...defaultPermissions,
      Admissions: { view: true, create: false, edit: false, delete: false, approve: false },
      Students: { view: true, create: false, edit: false, delete: false, approve: false },
      Fees: { ...fullAccess },
      HR_Payroll: { ...fullAccess },
      Staff: { view: true, create: false, edit: false, delete: false, approve: false },
      Reports: { view: true, create: true, edit: true, delete: false, approve: false },
    }
  },
  {
    id: 'R5',
    name: 'Receptionist',
    description: 'Front desk operations. Manage visitors and daily admissions inquiries.',
    isSystem: true,
    userCount: 2,
    permissions: {
      ...defaultPermissions,
      Admissions: { view: true, create: true, edit: true, delete: false, approve: false },
      Students: { view: true, create: false, edit: false, delete: false, approve: false },
      Visitors: { ...fullAccess },
      Communication: { view: true, create: false, edit: false, delete: false, approve: false },
    }
  },
  {
    id: 'R6',
    name: 'Parent',
    description: 'Guardian access for specific students. No editing capabilities.',
    isSystem: true,
    userCount: 520,
    permissions: {
      ...defaultPermissions,
      Attendance: { view: true, create: false, edit: false, delete: false, approve: false },
      Fees: { view: true, create: true, edit: false, delete: false, approve: false },
      Results: { view: true, create: false, edit: false, delete: false, approve: false },
      Timetable: { view: true, create: false, edit: false, delete: false, approve: false },
      Communication: { view: true, create: true, edit: false, delete: false, approve: false },
    }
  },
  {
    id: 'R7',
    name: 'Student',
    description: 'Student portal data access.',
    isSystem: true,
    userCount: 850,
    permissions: {
      ...defaultPermissions,
      Attendance: { view: true, create: false, edit: false, delete: false, approve: false },
      Results: { view: true, create: false, edit: false, delete: false, approve: false },
      Timetable: { view: true, create: false, edit: false, delete: false, approve: false },
    }
  },
  {
    id: 'R8',
    name: 'Librarian',
    description: 'Library and materials management.',
    isSystem: true,
    userCount: 2,
    permissions: {
      ...defaultPermissions,
      Students: { view: true, create: false, edit: false, delete: false, approve: false },
      Library: { ...fullAccess },
      Inventory: { view: true, create: true, edit: true, delete: false, approve: false },
    }
  },
  {
    id: 'R9',
    name: 'Transport Manager',
    description: 'Manage fleets and optimize routes for standard school buses.',
    isSystem: true,
    userCount: 1,
    permissions: {
      ...defaultPermissions,
      Students: { view: true, create: false, edit: false, delete: false, approve: false },
      Transport: { ...fullAccess },
    }
  }
];

const mockAuditLogs = [
  { id: 'L1', user: 'Dr. G. K. Kapoor', action: 'Updated Role Permissions', target: 'Teacher Role', time: '10 mins ago', ip: '192.168.1.45' },
  { id: 'L2', user: 'System', action: 'Failed Login Attempt', target: 'admin@school.com', time: '1 hr ago', ip: '203.0.113.42' },
  { id: 'L3', user: 'A. Sharma (Accountant)', action: 'Exported Financial Report', target: 'Q2 Fees', time: '3 hrs ago', ip: '192.168.1.102' },
  { id: 'L4', user: 'M. Gupta (Principal)', action: 'Approved Student Leave', target: 'STU-0892', time: '4 hrs ago', ip: '192.168.1.10' },
];

export const RBACManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'roles' | 'matrix' | 'audit'>('roles');
  const [roles, setRoles] = useState<Role[]>(defaultRoles);
  const [selectedRoleId, setSelectedRoleId] = useState<string>(defaultRoles[0].id);
  const [searchTerm, setSearchTerm] = useState('');

  const selectedRole = roles.find(r => r.id === selectedRoleId) || roles[0];

  const handleTogglePermission = (mod: ModuleName, action: Action) => {
    setRoles(prev => prev.map(role => {
      if (role.id === selectedRoleId) {
        return {
          ...role,
          permissions: {
            ...role.permissions,
            [mod]: {
              ...role.permissions[mod],
              [action]: !role.permissions[mod][action]
            }
          }
        };
      }
      return role;
    }));
  };

  const filteredRoles = roles.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#1E293B] p-6 rounded-2xl shadow-lg shadow-black/20 border border-indigo-100">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <div className="p-2 border border-indigo-200 bg-[#2563EB]/10 border border-[#2563EB]/30 rounded-xl shrink-0">
               <ShieldCheck className="text-[#2563EB] w-5 h-5" />
            </div>
            Enterprise Access Control
          </h1>
          <p className="text-sm text-[#94A3B8] mt-0.5 max-w-2xl">
            Scale-ready Role-Based Access Control (RBAC) securely governing permissions and multi-tenant isolation.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-2">
          {[
            { id: 'roles', label: 'Role Management', icon: Users, desc: 'Add, edit, or delete system roles' },
            { id: 'matrix', label: 'Permission Matrix', icon: Key, desc: 'Granular access control grids' },
            { id: 'audit', label: 'Security Audit Logs', icon: Activity, desc: 'Track compliance and login events' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3 ${
                activeTab === tab.id 
                  ? 'bg-[#2563EB] shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(56,189,248,0.5)] hover:bg-[#38BDF8] border-indigo-700 shadow-md text-white' 
                  : 'bg-[#1E293B] border-[#334155] text-[#CBD5E1] hover:border-indigo-300 hover:bg-[#111827]'
              }`}
            >
              <tab.icon className={`w-5 h-5 mt-0.5 ${activeTab === tab.id ? 'text-indigo-100' : 'text-[#94A3B8]'}`} />
              <div>
                <span className={`block font-bold text-sm ${activeTab === tab.id ? 'text-white' : 'text-white'}`}>
                  {tab.label}
                </span>
                <span className={`block text-[10px] mt-0.5 leading-tight ${activeTab === tab.id ? 'text-indigo-200' : 'text-[#94A3B8]'}`}>
                  {tab.desc}
                </span>
              </div>
            </button>
          ))}

          {/* SaaS Multi-Tenant Stats Widget */}
          <div className="mt-6 bg-gradient-to-br from-slate-900 to-indigo-950 p-5 rounded-2xl border border-slate-800 text-white shadow-lg overflow-hidden relative">
            <div className="absolute -top-4 -right-4 text-white/5">
              <Globe className="w-32 h-32" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-300 flex items-center gap-1.5"><Database className="w-3.5 h-3.5" /> Tenant Isolation Status</span>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]/10 border border-[#10B981]/300"></span>
                </span>
              </div>
              <div className="space-y-3">
                 <div>
                   <div className="text-2xl font-black font-mono tracking-tight text-white mb-0.5">SECURE</div>
                   <div className="text-[10px] text-indigo-200/80 leading-snug">All database queries are scoped by Tenant-ID via Next.js middleware and Row-Level Security (RLS).</div>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 bg-[#1E293B] rounded-2xl shadow-lg shadow-black/20 border border-[#334155] overflow-hidden min-h-[600px]">
          
          {/* ROLES TAB */}
          {activeTab === 'roles' && (
            <div className="animate-fade-in flex flex-col h-full">
              <div className="p-5 border-b border-[#334155] flex justify-between items-center bg-[#111827]">
                <h3 className="font-bold text-white">System Roles Directory</h3>
                <button className="flex items-center gap-1.5 bg-[#2563EB] shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(56,189,248,0.5)] hover:bg-[#38BDF8] hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-xl shadow-black/40">
                  <Plus className="w-3.5 h-3.5" /> Create Custom Role
                </button>
              </div>
              
              <div className="p-5">
                <div className="relative mb-4">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#94A3B8]" />
                  <input 
                    type="text" 
                    placeholder="Search roles..." 
                    className="w-full pl-9 pr-4 py-2 bg-[#111827] border border-[#334155] rounded-lg text-sm focus:border-indigo-500 focus:bg-[#1E293B] transition-all outline-hidden font-medium"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredRoles.map(role => (
                    <div key={role.id} className="border border-[#334155] p-4 rounded-xl hover:border-indigo-300 hover:shadow-md transition-all group relative bg-[#1E293B]">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white">{role.name}</h4>
                          {role.isSystem && (
                            <span className="bg-[#F59E0B]/20 text-[#F59E0B] text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-sm">System Default</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button className="p-1.5 text-[#94A3B8] hover:text-[#10B981] hover:bg-[#10B981]/10 border border-[#10B981]/30 rounded-md transition-colors" title="Clone Role"><Copy className="w-3.5 h-3.5" /></button>
                           <button className="p-1.5 text-[#94A3B8] hover:text-[#38BDF8] hover:drop-shadow-[0_0_8px_rgba(56,189,248,0.5)] hover:bg-[#2563EB]/10 border border-[#2563EB]/30 rounded-md transition-colors" title="Edit Role"><Edit className="w-3.5 h-3.5" /></button>
                           {!role.isSystem && <button className="p-1.5 text-[#94A3B8] hover:text-[#EF4444] hover:bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-md transition-colors" title="Delete Role"><Trash2 className="w-3.5 h-3.5" /></button>}
                        </div>
                      </div>
                      <p className="text-xs text-[#94A3B8] leading-relaxed mb-4">{role.description}</p>
                      
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#CBD5E1]">
                           <Users className="w-3.5 h-3.5 text-[#94A3B8]" /> {role.userCount} Accounts Assigned
                        </div>
                        <button 
                          onClick={() => {
                            setSelectedRoleId(role.id);
                            setActiveTab('matrix');
                          }}
                          className="text-[10px] font-bold text-[#2563EB] uppercase hover:underline"
                        >
                          View Permissions →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PERMISSION MATRIX TAB */}
          {activeTab === 'matrix' && (
            <div className="animate-fade-in flex flex-col h-full bg-[#111827]/30">
              <div className="p-5 border-b border-[#334155] bg-[#1E293B] flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-10">
                <div>
                  <h3 className="font-bold text-white flex items-center gap-2">
                    <Settings className="w-4 h-4 text-indigo-500" />
                    Permission Matrix configuration
                  </h3>
                  <p className="text-[11px] text-[#94A3B8] mt-1">Configure granular ABAC/RBAC actions for selected user role.</p>
                </div>
                
                <div className="flex items-center gap-3">
                  <select 
                    value={selectedRoleId}
                    onChange={(e) => setSelectedRoleId(e.target.value)}
                    className="bg-[#111827] border border-[#334155] rounded-lg px-3 py-1.5 text-sm font-bold text-[#CBD5E1] outline-hidden focus:border-indigo-500"
                  >
                    {roles.map(r => <option key={r.id} value={r.id}>{r.name} Role</option>)}
                  </select>
                </div>
              </div>

              <div className="p-5 overflow-x-auto">
                <div className="min-w-[700px] border border-[#334155] rounded-xl bg-[#1E293B] overflow-hidden shadow-lg shadow-black/20">
                  {/* Table Header */}
                  <div className="grid grid-cols-6 bg-[#273549] border-b border-[#334155] p-3 text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">
                    <div className="col-span-1 pl-2">System Module</div>
                    <div className="text-center">Read / View</div>
                    <div className="text-center">Create / Add</div>
                    <div className="text-center">Edit / Update</div>
                    <div className="text-center">Delete / Remove</div>
                    <div className="text-center">Approve / Export</div>
                  </div>
                  
                  {/* Table Body */}
                  <div className="divide-y divide-[#334155]">
                    {(Object.keys(selectedRole.permissions) as ModuleName[]).map(mod => (
                      <div key={mod} className="grid grid-cols-6 p-3 items-center hover:bg-[#111827] transition-colors">
                        <div className="col-span-1 font-bold text-sm text-[#CBD5E1] pl-2">{mod}</div>
                        
                        {(['view', 'create', 'edit', 'delete', 'approve'] as Action[]).map(action => (
                          <div key={action} className="text-center flex justify-center">
                            <button
                              onClick={() => handleTogglePermission(mod, action)}
                              className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ease-in-out ${
                                selectedRole.permissions[mod][action] ? 'bg-[#10B981]/10 border border-[#10B981]/300' : 'bg-[#334155]'
                              }`}
                            >
                              <div className={`bg-[#1E293B] w-4 h-4 rounded-full shadow-xl shadow-black/40 transform transition-transform duration-300 ease-in-out flex items-center justify-center ${
                                selectedRole.permissions[mod][action] ? 'translate-x-4' : 'translate-x-0'
                              }`}>
                                {selectedRole.permissions[mod][action] && <Check className="w-2.5 h-2.5 text-[#10B981]" />}
                              </div>
                            </button>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 mt-auto border-t border-[#334155] bg-[#1E293B] flex justify-end">
                <button className="flex items-center gap-2 bg-[#2563EB] shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(56,189,248,0.5)] hover:bg-[#38BDF8] hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-md transition-all active:scale-95">
                  <Lock className="w-4 h-4" /> Save Permission Changes
                </button>
              </div>
            </div>
          )}

          {/* AUDIT LOGS TAB */}
          {activeTab === 'audit' && (
            <div className="animate-fade-in flex flex-col h-full bg-[#111827]/30">
               <div className="p-5 border-b border-[#334155] flex justify-between items-center bg-[#1E293B] sticky top-0 z-10">
                <h3 className="font-bold text-white flex items-center gap-2 text-sm">
                  <Eye className="w-4 h-4 text-indigo-500" />
                  Security & Access Audit Trail
                </h3>
              </div>

              <div className="p-5">
                <div className="space-y-3">
                  {mockAuditLogs.map(log => (
                    <div key={log.id} className="bg-[#1E293B] p-4 rounded-xl border border-[#334155] hover:shadow-md transition-all flex items-start gap-4">
                      <div className="bg-[#273549] w-10 h-10 rounded-full flex items-center justify-center shrink-0 border border-[#334155]">
                        <Activity className="w-4 h-4 text-[#CBD5E1]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white">
                          <span className="font-bold">{log.user}</span> executed <span className="font-bold bg-[#2563EB]/10 border border-[#2563EB]/30 text-[#38BDF8] px-1.5 rounded-sm">{log.action}</span> on <span className="text-[#CBD5E1]">[{log.target}]</span>.
                        </p>
                        <div className="flex items-center gap-3 mt-1.5 text-[10px] text-[#94A3B8] font-mono">
                          <span>{log.time}</span>
                          <span className="flex items-center gap-1 text-[#94A3B8] bg-[#111827] px-1.5 rounded-sm border border-[#334155]"><Globe className="w-3 h-3" /> IP: {log.ip}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 p-4 bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-xl border border-amber-200 border-dashed text-center">
                  <p className="text-xs text-[#F59E0B] font-medium">Audit logs are retained securely for 90 days as per standard educational enterprise compliance policies. Detailed exports available upon request via Super Admin console.</p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
