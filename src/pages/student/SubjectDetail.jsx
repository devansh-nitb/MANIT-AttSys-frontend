import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import api from '../../utils/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const STATUS_COLORS = { present: '#10b981', absent: '#ef4444', late: '#f59e0b' };

export default function StudentSubjectDetail() {
  const { subjectId } = useParams();
  const [data, setData] = useState(null);
  const [heatmap, setHeatmap] = useState({});
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/student/attendance/subject/${subjectId}`).then(({ data: d }) => setData(d)).finally(() => setLoading(false));
  }, [subjectId]);

  useEffect(() => {
    api.get('/student/attendance/heatmap', { params: { subjectId, month, year } })
      .then(({ data: d }) => setHeatmap(d.heatmap || {}));
  }, [subjectId, month, year]);

  if (loading || !data) {
    return <div className="text-center py-12 text-muted-foreground">Loading...</div>;
  }

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDay = new Date(year, month - 1, 1).getDay();

  return (
    <div className="space-y-6">
      <Link to="/dashboard">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
      </Link>

      <div>
        <h1 className="text-2xl font-bold">{data.subject?.name}</h1>
        <p className="text-muted-foreground">{data.section}</p>
      </div>

      {data.summary?.isLowAttendance && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-4 flex items-center gap-3"
        >
          <AlertTriangle className="h-6 w-6 text-amber-600" />
          <p className="font-medium">Attendance below 75%. Please ensure regular attendance.</p>
        </motion.div>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border border-slate-200 dark:border-slate-700">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Present</p>
            <p className="text-2xl font-bold text-emerald-600">{data.summary?.present ?? 0}</p>
          </CardContent>
        </Card>
        <Card className="border border-slate-200 dark:border-slate-700">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Absent</p>
            <p className="text-2xl font-bold text-red-600">{data.summary?.absent ?? 0}</p>
          </CardContent>
        </Card>
        <Card className="border border-slate-200 dark:border-slate-700">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Late</p>
            <p className="text-2xl font-bold text-amber-600">{data.summary?.late ?? 0}</p>
          </CardContent>
        </Card>
        <Card className="border border-slate-200 dark:border-slate-700">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Overall %</p>
            <p className={`text-2xl font-bold ${(data.summary?.percentage ?? 0) < 75 ? 'text-red-600' : 'text-emerald-600'}`}>
              {data.summary?.percentage ?? 0}%
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle>Monthly Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.monthlyTrend || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(v) => [`${v}%`, 'Attendance']} />
                <Line type="monotone" dataKey="percentage" stroke="#2563eb" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-slate-200 dark:border-slate-700">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Monthly Heatmap</CardTitle>
            <div className="flex gap-2">
              <input
                type="number"
                min={1}
                max={12}
                className="w-16 border rounded px-2 py-1 text-sm"
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value) || 1)}
              />
              <input
                type="number"
                min={2020}
                max={2030}
                className="w-20 border rounded px-2 py-1 text-sm"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value) || new Date().getFullYear())}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">{d}</div>
            ))}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const status = heatmap[dateStr];
              const color = status === 'present' ? 'bg-emerald-500' : status === 'late' ? 'bg-amber-500' : status === 'absent' ? 'bg-red-500' : 'bg-muted';
              return (
                <div
                  key={day}
                  className={`aspect-square rounded flex items-center justify-center text-xs ${color} text-white`}
                  title={dateStr}
                >
                  {day}
                </div>
              );
            })}
          </div>
          <div className="flex gap-4 mt-4 text-sm text-muted-foreground">
            <span><span className="inline-block w-3 h-3 rounded bg-emerald-500 mr-1" /> Present</span>
            <span><span className="inline-block w-3 h-3 rounded bg-amber-500 mr-1" /> Late</span>
            <span><span className="inline-block w-3 h-3 rounded bg-red-500 mr-1" /> Absent</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
