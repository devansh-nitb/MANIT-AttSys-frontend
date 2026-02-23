import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, TrendingUp, BookOpen, Calendar } from 'lucide-react';
import api from '../../utils/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';

const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

export default function StudentDashboard() {
  const [attendance, setAttendance] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/student/attendance'),
      api.get('/student/alerts')
    ]).then(([att, alt]) => {
      setAttendance(att.data.subjects || []);
      setAlerts(alt.data.alerts || []);
    }).finally(() => setLoading(false));
  }, []);

  const chartData = attendance.map((s) => ({
    name: s.subjectCode,
    value: s.percentage,
    color: s.isLowAttendance ? '#ef4444' : '#10b981'
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Attendance</h1>
        <p className="text-muted-foreground">Subject-wise attendance overview</p>
      </div>

      {alerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-4 flex items-start gap-3"
        >
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-800 dark:text-amber-200">Low Attendance Alert</p>
            <p className="text-sm text-muted-foreground">
              Your attendance is below 75% in: {alerts.map((a) => `${a.subjectName} (${a.percentage}%)`).join(', ')}
            </p>
          </div>
        </motion.div>
      )}

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="border border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Subject-wise %
                </CardTitle>
              </CardHeader>
              <CardContent>
                {attendance.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No attendance data yet</p>
                ) : (
                  <div className="space-y-3">
                    {attendance.map((s, i) => (
                      <motion.div
                        key={s.subjectId}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <Link to={`/student/subject/${s.subjectId}`}>
                          <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                                s.isLowAttendance ? 'bg-red-500/20 text-red-600' : 'bg-emerald-500/20 text-emerald-600'
                              }`}>
                                <BookOpen className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="font-medium">{s.subjectName}</p>
                                <p className="text-xs text-muted-foreground">{s.sectionName}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`font-bold ${s.isLowAttendance ? 'text-red-600' : 'text-emerald-600'}`}>
                                {s.percentage}%
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {s.present + s.late}/{s.total} days
                              </p>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                {chartData.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                          nameKey="name"
                        >
                          {chartData.map((_, i) => (
                            <Cell key={i} fill={chartData[i].color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v) => `${v}%`} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-12">No data to display</p>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
