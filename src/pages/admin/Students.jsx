import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, GraduationCap, Upload, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [bulkModal, setBulkModal] = useState(false);
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', scholarNumber: '' });

  useEffect(() => {
    api.get('/admin/students').then(({ data }) => setStudents(data)).finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/students', form);
      toast.success('Student created');
      setModal(false);
      setForm({ name: '', email: '', password: '', scholarNumber: '' });
      api.get('/admin/students').then(({ data }) => setStudents(data));
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
      const { data } = await api.post('/admin/students/bulk-upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success(data.message);
      setBulkModal(false);
      setBulkFile(null);
      api.get('/admin/students').then(({ data }) => setStudents(data));
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
    const csv = 'name,email,scholarNumber\nAlice Johnson,alice@example.com,2021001\nBob Williams,bob@example.com,2021002';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'students-import-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Student Management</h1>
          <p className="text-muted-foreground">Add and manage students</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { setBulkModal(true); setBulkFile(null); }}>
            <Upload className="h-4 w-4 mr-2" /> Bulk Upload
          </Button>
          <Button onClick={() => setModal(true)}><Plus className="h-4 w-4 mr-2" /> Add Student</Button>
        </div>
      </div>

      <Card className="border border-slate-200 dark:border-slate-700">
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-4 font-medium">Scholar #</th>
                    <th className="text-left p-4 font-medium">Name</th>
                    <th className="text-left p-4 font-medium">Email</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s, i) => (
                    <motion.tr
                      key={s._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className="border-b hover:bg-muted/30"
                    >
                      <td className="p-4 flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                        {s.scholarNumber || '—'}
                      </td>
                      <td className="p-4">{s.name}</td>
                      <td className="p-4 text-muted-foreground">{s.email}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {bulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setBulkModal(false)}>
          <div className="bg-card rounded-xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">Bulk Upload Students</h3>
            <p className="text-sm text-muted-foreground mb-4">
              CSV must have columns: name, email, scholarNumber. Default password: Student@123
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
            <h3 className="text-lg font-semibold mb-4">Add Student</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <Label>Scholar Number</Label>
                <Input value={form.scholarNumber} onChange={(e) => setForm({ ...form, scholarNumber: e.target.value })} required />
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
