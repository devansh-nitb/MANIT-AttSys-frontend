import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Mail, User, Upload, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';

export default function AdminFaculty() {
  const [faculty, setFaculty] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [bulkModal, setBulkModal] = useState(false);
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', departmentId: '' });

  useEffect(() => {
    Promise.all([
      api.get('/admin/faculty'),
      api.get('/admin/departments')
    ]).then(([f, d]) => {
      setFaculty(f.data);
      setDepartments(d.data);
    }).finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/faculty', form);
      toast.success('Faculty created');
      setModal(false);
      setForm({ name: '', email: '', password: '', departmentId: '' });
      api.get('/admin/faculty').then(({ data }) => setFaculty(data));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleBulkUpload = async (e) => {
    e.preventDefault();
    if (!bulkFile) {
      toast.error('Select a CSV file');
      return;
    }
    setBulkLoading(true);
    try {
      const fd = new FormData();
      fd.append('file', bulkFile);
      const { data } = await api.post('/admin/faculty/bulk-upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success(data.message);
      setBulkModal(false);
      setBulkFile(null);
      api.get('/admin/faculty').then(({ data }) => setFaculty(data));
      if (data.skipped?.length > 0) {
        toast.error(`${data.skipped.length} row(s) skipped (duplicates or invalid)`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setBulkLoading(false);
    }
  };

  const downloadSample = () => {
    const csv = 'name,email,department\nDr. John Smith,john@example.com,CSE\nDr. Jane Doe,jane@example.com,ECE';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'faculty-import-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Faculty Management</h1>
          <p className="text-muted-foreground">Add and manage faculty members</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { setBulkModal(true); setBulkFile(null); }}>
            <Upload className="h-4 w-4 mr-2" /> Bulk Upload
          </Button>
          <Button onClick={() => setModal(true)}><Plus className="h-4 w-4 mr-2" /> Add Faculty</Button>
        </div>
      </div>

      <Card className="border border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle>Faculty List</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {faculty.map((f, i) => (
                <motion.div
                  key={f._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-lg border p-4 flex items-center gap-4"
                >
                  <div className="h-12 w-12 rounded-full bg-slate-600 flex items-center justify-center text-white">
                    <User className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {f.departmentId?.name ? `(${f.departmentId.name}) ${f.name}` : f.name}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Mail className="h-3 w-3" />{f.email}
                    </p>
                    {f.assignedSubjects?.length > 0 && (
                      <p className="text-xs text-primary mt-1">{f.assignedSubjects.length} subject(s) assigned</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {bulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setBulkModal(false)}>
          <div className="bg-card rounded-xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">Bulk Upload Faculty</h3>
            <p className="text-sm text-muted-foreground mb-4">
              CSV: name, email. Optional: department (branch name, e.g. CSE, ECE). Default password: Faculty@123
            </p>
            <form onSubmit={handleBulkUpload} className="space-y-4">
              <div>
                <Label>CSV File</Label>
                <Input type="file" accept=".csv" onChange={(e) => setBulkFile(e.target.files?.[0])} required />
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={downloadSample}>
                  <Download className="h-4 w-4 mr-1" /> Download Template
                </Button>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setBulkModal(false)}>Cancel</Button>
                <Button type="submit" disabled={bulkLoading}>{bulkLoading ? 'Uploading...' : 'Upload'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setModal(false)}>
          <div className="bg-card rounded-xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">Add Faculty</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <Label>Branch / Department</Label>
                <select
                  className="w-full h-10 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 text-sm"
                  value={form.departmentId}
                  onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
                >
                  <option value="">— Select branch —</option>
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Dr. Deepak Singh Tomar" required />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div>
                <Label>Password</Label>
                <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setModal(false)}>Cancel</Button>
                <Button type="submit">Create</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
