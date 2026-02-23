import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import MobileNav from './MobileNav';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';

export default function Layout() {
  const role = useSelector((s) => s.auth.user?.role);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar role={role} />
      <MobileNav role={role} open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      <div className="lg:pl-64 min-h-screen">
        <Navbar onMenuClick={() => setMobileNavOpen(true)} />
        <main className="p-4 lg:p-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
