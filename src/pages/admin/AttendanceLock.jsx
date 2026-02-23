import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Lock, Unlock } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export default function AttendanceLock() {
  const [locked, setLocked] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unlockingId, setUnlockingId] = useState(null);

  const fetchLocked = async () => {
    const { data } = await api.get('/admin/attendance/locked');
    setLocked(data);
  };

  useEffect(() => {
    setLoading(true);
    fetchLocked().finally(() => setLoading(false));
  }, []);

  const handleUnlock = async (attendanceId) => {
    setUnlockingId(attendanceId);
    try {
      await api.put('/admin/attendance/unlock', { attendanceId });
      toast.success('Attendance unlocked');
      fetchLocked();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to unlock');
    } finally {
      setUnlockingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Unlock Attendance</h1>
        <p className="text-muted-foreground">
          Attendance is auto-locked 24 hours after the date. Unlock to allow faculty to edit.
        </p>
      </div>

      <Card className="border border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Locked attendance records
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : locked.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No locked attendance records.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left p-3 font-medium">Subject</th>
                    <th className="text-left p-3 font-medium">Section</th>
                    <th className="text-left p-3 font-medium">Date</th>
                    <th className="text-right p-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {locked.map((a) => (
                    <motion.tr
                      key={a._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    >
                      <td className="p-3">
                        {a.subjectId?.name} ({a.subjectId?.code})
                      </td>
                      <td className="p-3">{a.sectionId?.name}</td>
                      <td className="p-3">{format(new Date(a.date), 'dd MMM yyyy')}</td>
                      <td className="p-3 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUnlock(a._id)}
                          disabled={unlockingId === a._id}
                        >
                          <Unlock className="h-4 w-4 mr-1" />
                          {unlockingId === a._id ? 'Unlocking...' : 'Unlock'}
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
