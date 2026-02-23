import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Calendar, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';

export default function AdminSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: '' });

  useEffect(() => {
    api.get('/admin/sessions').then(({ data }) => setSessions(data)).finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/sessions', form);
      toast.success('Session created');
      setModal(false);
      setForm({ name: '' });
      api.get('/admin/sessions').then(({ data }) => setSessions(data));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const setActive = async (id) => {
    try {
      await api.put(`/admin/sessions/${id}/activate`);
      toast.success('Session activated');
      api.get('/admin/sessions').then(({ data }) => setSessions(data));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Academic Sessions</h1>
          <p className="text-muted-foreground">Manage academic years</p>
        </div>
        <Button onClick={() => setModal(true)}><Plus className="h-4 w-4 mr-2" /> Add Session</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sessions.map((s, i) => (
          <motion.div
            key={s._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className={`border border-slate-200 dark:border-slate-700 ${s.isActive ? 'ring-2 ring-blue-500' : ''}`}>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-semibold">{s.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {s.isActive ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>
                {!s.isActive && (
                  <Button size="sm" className="mt-4 w-full" onClick={() => setActive(s._id)}>
                    <Check className="h-4 w-4 mr-2" /> Set Active
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setModal(false)}>
          <div className="bg-card rounded-xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">Add Session</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <Label>Session Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="2025-26" required />
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
