import { useEffect, useState, useCallback, useRef } from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Save, Check, X, Clock, Loader2, UserCheck, UserX, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

const STATUS = { present: 'P', absent: 'A', late: 'L' };
const STATUS_COLORS = {
  present: 'bg-emerald-600 hover:bg-emerald-700 text-white',
  absent: 'bg-red-600 hover:bg-red-700 text-white',
  late: 'bg-amber-500 hover:bg-amber-600 text-white'
};

export default function FacultyMarkAttendance() {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState({});
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const saveTimeoutRef = useRef(null);
  const gridRef = useRef(null);

  const fetchSubjects = useCallback(async () => {
    const { data } = await api.get('/faculty/subjects');
    setSubjects(data);
    if (data.length && !selectedSubject) {
      setSelectedSubject(data[0]);
      setSelectedSection(data[0].sections?.[0]);
    }
  }, [selectedSubject]);

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (selectedSection) {
      setStudents(selectedSection.students || []);
      setRecords({});
    }
  }, [selectedSection]);

  useEffect(() => {
    if (!selectedSubject || !selectedSection) return;
    api.get('/faculty/attendance', {
      params: { subjectId: selectedSubject._id, sectionId: selectedSection._id, date }
    }).then(({ data }) => {
      const map = {};
      (data.records || []).forEach((r) => {
        map[r.scholarNumber] = r.status;
      });
      setRecords(map);
    }).catch(() => setRecords({}));
  }, [selectedSubject, selectedSection, date]);

  const setStatus = useCallback((scholarNumber, status) => {
    setRecords((prev) => ({ ...prev, [scholarNumber]: status }));
  }, []);

  const markAllPresent = useCallback(() => {
    const next = {};
    students.forEach((s) => { next[s.scholarNumber] = 'present'; });
    setRecords(next);
    toast.success('All marked present');
  }, [students]);

  const markAllAbsent = useCallback(() => {
    const next = {};
    students.forEach((s) => { next[s.scholarNumber] = 'absent'; });
    setRecords(next);
    toast.success('All marked absent');
  }, [students]);

  const resetAttendance = useCallback(() => {
    setRecords({});
    toast.success('Reset to default');
  }, []);

  const saveAttendance = useCallback(async () => {
    if (!selectedSubject || !selectedSection) return;
    setSaving(true);
    try {
      const recs = students.map((s) => ({
        scholarNumber: s.scholarNumber,
        status: records[s.scholarNumber] || 'absent'
      }));
      await api.post('/faculty/attendance', {
        subjectId: selectedSubject._id,
        sectionId: selectedSection._id,
        date,
        records: recs
      });
      setLastSaved(new Date());
      toast.success('Attendance saved');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }, [selectedSubject, selectedSection, date, students, records]);

  useEffect(() => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    if (students.length === 0) return;
    saveTimeoutRef.current = setTimeout(saveAttendance, 5000);
    return () => clearTimeout(saveTimeoutRef.current);
  }, [records, saveAttendance, students.length]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!gridRef.current || !document.activeElement?.closest('[data-scholar]')) return;
      const scholar = document.activeElement.getAttribute('data-scholar');
      if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        setStatus(scholar, 'present');
      } else if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        setStatus(scholar, 'absent');
      } else if (e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        setStatus(scholar, 'late');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setStatus]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mark Attendance</h1>
        <p className="text-muted-foreground">Select subject, section & date. Use P/A/L keys for quick marking.</p>
      </div>

      <Card className="border border-slate-200 dark:border-slate-700">
        <CardHeader>
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <label className="text-sm text-muted-foreground">Subject</label>
              <select
                className="ml-2 border rounded px-3 py-2 bg-background"
                value={selectedSubject?._id || ''}
                onChange={(e) => {
                  const s = subjects.find((x) => x._id === e.target.value);
                  setSelectedSubject(s);
                  setSelectedSection(s?.sections?.[0]);
                }}
              >
                {subjects.map((s) => (
                  <option key={s._id} value={s._id}>{s.name} ({s.code})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Section</label>
              <select
                className="ml-2 border rounded px-3 py-2 bg-background"
                value={selectedSection?._id || ''}
                onChange={(e) => setSelectedSection(selectedSubject?.sections?.find((x) => x._id === e.target.value))}
              >
                {selectedSubject?.sections?.map((s) => (
                  <option key={s._id} value={s._id}>{s.displayLabel || s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Date</label>
              <input
                type="date"
                className="ml-2 border rounded px-3 py-2 bg-background"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={saveAttendance} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? ' Saving...' : ' Save'}
              </Button>
              {lastSaved && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Saved {format(lastSaved, 'HH:mm:ss')}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <Button size="sm" variant="success" onClick={markAllPresent} disabled={!students.length}>
              <UserCheck className="h-4 w-4 mr-1" /> Mark all Present
            </Button>
            <Button size="sm" variant="destructive" onClick={markAllAbsent} disabled={!students.length}>
              <UserX className="h-4 w-4 mr-1" /> Mark all Absent
            </Button>
            <Button size="sm" variant="outline" onClick={resetAttendance} disabled={!students.length}>
              <RotateCcw className="h-4 w-4 mr-1" /> Reset
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Shortcuts: P = Present, A = Absent, L = Late. Auto-saves every 5 seconds.
          </p>
        </CardHeader>
        <CardContent>
          <div ref={gridRef} className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {students.map((student, i) => (
              <motion.div
                key={student.scholarNumber}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                className="flex items-center gap-2 rounded-lg border p-3 bg-card"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{student.name}</p>
                  <p className="text-xs text-muted-foreground">{student.scholarNumber}</p>
                </div>
                <div className="flex gap-1">
                  {(['present', 'absent', 'late']).map((status) => (
                    <button
                      key={status}
                      data-scholar={student.scholarNumber}
                      tabIndex={0}
                      className={`w-8 h-8 rounded-md text-white text-sm font-bold transition-colors flex items-center justify-center ${
                        records[student.scholarNumber] === status
                          ? STATUS_COLORS[status]
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-500 hover:bg-slate-300 dark:hover:bg-slate-600'
                      }`}
                      onClick={() => setStatus(student.scholarNumber, status)}
                      title={`${status} (${STATUS[status]})`}
                    >
                      {STATUS[status]}
                    </button>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
          {students.length === 0 && selectedSection && (
            <p className="text-center py-8 text-muted-foreground">No students in this section. Add via Hierarchy.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
