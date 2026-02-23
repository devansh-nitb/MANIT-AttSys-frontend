import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, FileSpreadsheet } from 'lucide-react';
import api from '../../utils/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export default function FacultyReports() {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/faculty/subjects').then(({ data }) => {
      setSubjects(data);
      if (data.length) {
        setSelectedSubject(data[0]);
        setSelectedSection(data[0].sections?.[0]);
      }
    });
  }, []);

  const loadReport = async () => {
    if (!selectedSubject || !selectedSection) return;
    setLoading(true);
    try {
      const { data } = await api.get('/faculty/reports/monthly', {
        params: { subjectId: selectedSubject._id, sectionId: selectedSection._id, month, year }
      });
      setReport(data);
    } catch (e) {
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [selectedSubject, selectedSection, month, year]);

  const exportCsv = async () => {
    if (!selectedSubject || !selectedSection) return;
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(
        `/api/faculty/reports/export/csv?subjectId=${selectedSubject._id}&sectionId=${selectedSection._id}&month=${month}&year=${year}`,
        { headers: { Authorization: `Bearer ${token}` }, credentials: 'include' }
      );
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance-${selectedSubject.code}-${month}-${year}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    }
  };

  const exportPdf = async () => {
    if (!selectedSubject || !selectedSection) return;
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(
        `/api/faculty/reports/export/pdf?subjectId=${selectedSubject._id}&sectionId=${selectedSection._id}&month=${month}&year=${year}`,
        { headers: { Authorization: `Bearer ${token}` }, credentials: 'include' }
      );
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance-${selectedSubject.code}-${month}-${year}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-muted-foreground">Monthly attendance reports</p>
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
                  <option key={s._id} value={s._id}>{s.name}</option>
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
              <label className="text-sm text-muted-foreground">Month</label>
              <input
                type="number"
                min={1}
                max={12}
                className="ml-2 border rounded px-3 py-2 w-20 bg-background"
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value) || 1)}
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Year</label>
              <input
                type="number"
                min={2020}
                max={2030}
                className="ml-2 border rounded px-3 py-2 w-24 bg-background"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value) || new Date().getFullYear())}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={exportCsv}>
                <FileSpreadsheet className="h-4 w-4 mr-1" /> CSV
              </Button>
              <Button variant="outline" size="sm" onClick={exportPdf}>
                <FileText className="h-4 w-4 mr-1" /> PDF
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading...</div>
          ) : report ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Scholar #</th>
                    <th className="text-left p-3">Name</th>
                    <th className="text-left p-3">Present</th>
                    <th className="text-left p-3">Absent</th>
                    <th className="text-left p-3">Late</th>
                    <th className="text-left p-3">Total</th>
                    <th className="text-left p-3">%</th>
                  </tr>
                </thead>
                <tbody>
                  {report.students?.map((s) => (
                    <tr key={s.scholarNumber} className="border-b hover:bg-muted/30">
                      <td className="p-3">{s.scholarNumber}</td>
                      <td className="p-3">{s.name}</td>
                      <td className="p-3">{s.present}</td>
                      <td className="p-3">{s.absent}</td>
                      <td className="p-3">{s.late}</td>
                      <td className="p-3">{s.total}</td>
                      <td className="p-3">
                        <span className={s.percentage < 75 ? 'text-red-600 font-medium' : ''}>
                          {s.percentage}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-sm text-muted-foreground mt-4">
                {report.subject} - {report.section} | {month}/{year} | Total days: {report.totalDays}
              </p>
            </div>
          ) : (
            <p className="text-center py-12 text-muted-foreground">No data for selected period</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
