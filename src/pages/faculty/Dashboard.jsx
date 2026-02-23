import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ClipboardCheck, FileText, BookOpen, Upload } from 'lucide-react';
import api from '../../utils/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

export default function FacultyDashboard() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/faculty/subjects').then(({ data }) => setSubjects(data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Faculty Dashboard</h1>
        <p className="text-muted-foreground">Your assigned subjects and sections</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <Link to="/faculty/mark">
              <Card className="border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="rounded-lg bg-blue-600 p-4 text-white">
                      <ClipboardCheck className="h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Mark Attendance</h3>
                      <p className="text-sm text-muted-foreground">Record today&apos;s attendance</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link to="/faculty/bulk-upload">
              <Card className="border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="rounded-lg bg-slate-600 p-4 text-white">
                      <Upload className="h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Bulk Upload Students</h3>
                      <p className="text-sm text-muted-foreground">Import students via CSV</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link to="/faculty/reports">
              <Card className="border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="rounded-lg bg-emerald-600 p-4 text-white">
                      <FileText className="h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Reports</h3>
                      <p className="text-sm text-muted-foreground">View & export attendance reports</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          <Card className="border border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Assigned Subjects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {subjects.length === 0 ? (
                  <p className="text-muted-foreground">No subjects assigned yet. Contact admin.</p>
                ) : (
                  subjects.map((sub, i) => (
                    <motion.div
                      key={sub._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="rounded-lg border p-4"
                    >
                      <p className="font-medium">{sub.name} ({sub.code})</p>
                      <p className="text-sm text-muted-foreground">{sub.departmentId?.name}</p>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {sub.sections?.map((sec) => (
                          <span key={sec._id} className="text-xs bg-muted px-2 py-1 rounded">
                            {sec.displayLabel || sec.name}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
