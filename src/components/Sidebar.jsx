import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Network,
  Users,
  GraduationCap,
  Calendar,
  BarChart3,
  ClipboardCheck,
  FileText,
  User,
  Upload,
  Lock
} from 'lucide-react';
import { cn } from '../utils/cn';
import { useSelector } from 'react-redux';

const adminNav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/hierarchy', icon: Network, label: 'Hierarchy' },
  { to: '/admin/faculty', icon: Users, label: 'Faculty' },
  { to: '/admin/students', icon: GraduationCap, label: 'Students' },
  { to: '/admin/sessions', icon: Calendar, label: 'Sessions' },
  { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/admin/attendance', icon: Lock, label: 'Unlock Attendance' }
];

const facultyNav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/faculty/mark', icon: ClipboardCheck, label: 'Mark Attendance' },
  { to: '/faculty/bulk-upload', icon: Upload, label: 'Bulk Upload Students' },
  { to: '/faculty/reports', icon: FileText, label: 'Reports' }
];

const studentNav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' }
];

export default function Sidebar({ role }) {
  const theme = useSelector((s) => s.theme.mode);
  const nav = role === 'admin' ? adminNav : role === 'faculty' ? facultyNav : studentNav;

  return (
    <motion.aside
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hidden lg:block"
    >
      <div className="flex h-16 items-center gap-2 px-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex shrink-0 items-center justify-center">
          <img 
            src="/manit-logo.png" 
            alt="MANIT Logo" 
            className="h-9 w-9 object-contain" 
          />
        </div>
        <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white leading-none">
          MANIT AttSys
        </span>
      </div>
      <nav className="flex flex-col gap-1 p-4">
        {nav.map((item, i) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                isActive
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              )
            }
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="absolute bottom-4 left-4 right-4 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <User className="h-4 w-4" />
          <span className="capitalize">{role}</span>
        </div>
      </div>
    </motion.aside>
  );
}
