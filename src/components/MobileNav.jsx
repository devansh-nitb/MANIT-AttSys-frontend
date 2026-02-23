import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Network,
  Users,
  GraduationCap,
  Calendar,
  BarChart3,
  ClipboardCheck,
  FileText,
  Upload,
  Lock,
  X
} from 'lucide-react';
import { cn } from '../utils/cn';

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

export default function MobileNav({ role, open, onClose }) {
  const nav = role === 'admin' ? adminNav : role === 'faculty' ? facultyNav : studentNav;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed left-0 top-0 z-50 h-full w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-xl lg:hidden"
          >
            <div className="flex h-16 items-center justify-between px-4 border-b">
              <span className="font-semibold text-slate-900 dark:text-white">AttSys</span>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-col gap-1 p-4">
              {nav.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                      isActive ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    )
                  }
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
