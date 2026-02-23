import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  GraduationCap,
  BookOpen,
  Network,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import api from '../../utils/api';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const statCards = [
  { key: 'students', label: 'Total Students', icon: GraduationCap, color: 'bg-blue-600', link: '/admin/students' },
  { key: 'faculty', label: 'Total Faculty', icon: Users, color: 'bg-slate-700', link: '/admin/faculty' },
  { key: 'courses', label: 'Courses', icon: BookOpen, color: 'bg-amber-600', link: '/admin/hierarchy' },
  { key: 'sections', label: 'Sections', icon: Network, color: 'bg-emerald-600', link: '/admin/hierarchy' }
];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats').then(({ data }) => setStats(data)).finally(() => setLoading(false));
  }, []);

  const chartData = stats?.attendanceTrend?.map((d) => ({
    date: d._id,
    count: d.count
  })) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of your attendance system</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Link to={card.link}>
              <Card className="border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{card.label}</p>
                      <p className="text-2xl font-semibold mt-1 text-slate-900 dark:text-white">
                        {loading ? '—' : stats?.[card.key] ?? 0}
                      </p>
                    </div>
                    <div className={`rounded-lg ${card.color} p-3 text-white`}>
                      <card.icon className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-blue-600 dark:text-blue-400 font-medium">
                    View <ArrowRight className="ml-1 h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Attendance Trends (Last 30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="count" stroke="#2563eb" fillOpacity={1} fill="url(#colorCount)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="flex gap-4">
        <Link to="/admin/hierarchy">
          <Button>Manage Hierarchy</Button>
        </Link>
        <Link to="/admin/analytics">
          <Button variant="secondary">View Analytics</Button>
        </Link>
      </div>
    </div>
  );
}
