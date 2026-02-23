import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronRight,
  Upload
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';

export default function AdminHierarchy() {
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({ course: null, dept: null, subject: null });
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [csvFile, setCsvFile] = useState(null);
  const [sectionForCsv, setSectionForCsv] = useState(null);
  const [departmentSections, setDepartmentSections] = useState([]); // for "Add existing" dropdown

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [c, d, s, f] = await Promise.all([
        api.get('/admin/courses'),
        api.get('/admin/departments'),
        api.get('/admin/subjects'),
        api.get('/admin/faculty')
      ]);
      setCourses(c.data);
      setDepartments(d.data);
      setSubjects(s.data);
      setFaculty(f.data);
    } catch (e) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleCreate = async (entity, data) => {
    try {
      await api.post(`/admin/${entity}`, data);
      toast.success('Created successfully');
      setModal(null);
      fetchAll();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed');
    }
  };

  const handleUpdate = async (entity, id, data) => {
    try {
      await api.put(`/admin/${entity}/${id}`, data);
      toast.success('Updated');
      setModal(null);
      fetchAll();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed');
    }
  };

  const handleDelete = async (entity, id) => {
    if (!confirm('Are you sure?')) return;
    try {
      await api.delete(`/admin/${entity}/${id}`);
      toast.success('Deleted');
      fetchAll();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Cannot delete');
    }
  };

  const handleAssignFaculty = async (subjectId, facultyId) => {
    try {
      await api.put(`/admin/subjects/${subjectId}/assign-faculty`, { facultyId: facultyId || null });
      toast.success('Faculty assigned');
      fetchAll();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed');
    }
  };

  const handleCsvUpload = async () => {
    if (!sectionForCsv || !csvFile) {
      toast.error('Select section and file');
      return;
    }
    const fd = new FormData();
    fd.append('file', csvFile);
    fd.append('sectionId', sectionForCsv);
    try {
      await api.post('/admin/sections/upload-students', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Students imported');
      setCsvFile(null);
      setSectionForCsv(null);
      fetchAll();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Import failed');
    }
  };

  const deptsByCourse = (courseId) => departments.filter((d) => d.courseId?._id === courseId);
  const subjectsByDept = (deptId) => subjects.filter((s) => s.departmentId?._id === deptId);
  const sectionsBySubject = (subId) => {
    const sub = subjects.find((s) => s._id === subId);
    const ids = sub?.sectionIds || [];
    return Array.isArray(ids) ? ids : [];
  };

  const handleRemoveSectionFromSubject = async (subjectId, sectionId) => {
    if (!confirm('Remove this section from the subject? (Section stays for other subjects.)')) return;
    try {
      await api.delete(`/admin/subjects/${subjectId}/sections/${sectionId}`);
      toast.success('Section removed from subject');
      fetchAll();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed');
    }
  };

  const openAddSectionModal = (subject) => {
    setModal({ type: 'section', data: { subjectId: subject._id, departmentId: subject.departmentId?._id || subject.departmentId } });
    setForm({});
    if (subject.departmentId?._id || subject.departmentId) {
      api.get(`/admin/sections?departmentId=${subject.departmentId?._id || subject.departmentId}`)
        .then((r) => setDepartmentSections(r.data))
        .catch(() => setDepartmentSections([]));
    } else {
      setDepartmentSections([]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Academic Hierarchy</h1>
          <p className="text-muted-foreground">Manage courses, departments, subjects & sections</p>
        </div>
        <Button onClick={() => setModal({ type: 'course', data: {} })}>
          <Plus className="h-4 w-4 mr-2" /> Add Course
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : (
        <Card className="border border-slate-200 dark:border-slate-700">
          <CardContent className="p-6">
            <div className="space-y-2">
              {courses.map((course) => (
                <div key={course._id} className="rounded-lg border bg-card">
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50"
                    onClick={() => setExpanded((e) => ({ ...e, course: expanded.course === course._id ? null : course._id }))}
                  >
                    <div className="flex items-center gap-2">
                      {expanded.course === course._id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      <span className="font-medium">{course.name}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={(ev) => { ev.stopPropagation(); setModal({ type: 'course', data: course }); }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={(ev) => { ev.stopPropagation(); handleDelete('courses', course._id); }}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <AnimatePresence>
                    {expanded.course === course._id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pl-6 pb-4 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Departments</span>
                            <Button size="sm" variant="outline" onClick={() => setModal({ type: 'department', data: { courseId: course._id } })}>
                              <Plus className="h-3 w-3 mr-1" /> Add
                            </Button>
                          </div>
                          {deptsByCourse(course._id).map((dept) => (
                            <div key={dept._id} className="ml-4 rounded border p-3">
                              <div className="flex justify-between">
                                <span className="font-medium">{dept.name}</span>
                                <div className="flex gap-1">
                                  <Button size="sm" variant="ghost" onClick={() => setModal({ type: 'department', data: dept })}><Pencil className="h-3 w-3" /></Button>
                                  <Button size="sm" variant="ghost" onClick={() => handleDelete('departments', dept._id)}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                                </div>
                              </div>
                              <div className="mt-2 space-y-1">
                                {subjectsByDept(dept._id).map((sub) => (
                                  <div key={sub._id} className="ml-4 rounded bg-muted/50 p-2">
                                    <div className="flex justify-between items-center">
                                      <span className="text-sm">{sub.name} ({sub.code})</span>
                                      <select
                                        className="text-xs border rounded px-2 py-1"
                                        value={sub.facultyId?._id || ''}
                                        onChange={(e) => handleAssignFaculty(sub._id, e.target.value || null)}
                                      >
                                        <option value="">— Assign —</option>
                                        {faculty.map((f) => (
                                          <option key={f._id} value={f._id}>
                                            {f.departmentId?.name ? `(${f.departmentId.name}) ${f.name}` : f.name}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                    <div className="mt-1 flex gap-2 flex-wrap">
                                      {sectionsBySubject(sub._id).map((sec) => (
                                        <div key={sec._id} className="flex items-center gap-1 text-xs bg-background rounded px-2 py-1">
                                          {sec.name}
                                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => setModal({ type: 'section', data: sec })}><Pencil className="h-3 w-3" /></Button>
                                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => { setSectionForCsv(sec._id); setCsvFile(null); }} title="Upload CSV">
                                            <Upload className="h-3 w-3" />
                                          </Button>
                                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive" onClick={() => handleRemoveSectionFromSubject(sub._id, sec._id)} title="Remove from subject">
                                            <Trash2 className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      ))}
                                      <Button size="sm" variant="outline" className="h-6 text-xs" onClick={() => openAddSectionModal(sub)}>
                                        + Section
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                                <Button size="sm" variant="outline" className="mt-1" onClick={() => setModal({ type: 'subject', data: { departmentId: dept._id } })}>
                                  + Subject
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* CSV Upload */}
      {sectionForCsv && (
        <Card className="border border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle>Import Students (CSV)</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4 items-end">
            <div className="flex-1">
              <Label>CSV file (columns: name, scholarNumber)</Label>
              <Input type="file" accept=".csv" onChange={(e) => setCsvFile(e.target.files?.[0])} />
            </div>
            <Button onClick={handleCsvUpload} disabled={!csvFile}>Import</Button>
            <Button variant="outline" onClick={() => { setSectionForCsv(null); setCsvFile(null); }}>Cancel</Button>
          </CardContent>
        </Card>
      )}

      {/* Modal */}
      <AnimatePresence>
        {modal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-card rounded-xl shadow-xl p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">
                {modal.type === 'course' && (modal.data._id ? 'Edit' : 'Add')} Course
                {modal.type === 'department' && (modal.data._id ? 'Edit' : 'Add')} Department
                {modal.type === 'subject' && (modal.data._id ? 'Edit' : 'Add')} Subject
                {modal.type === 'section' && (modal.data._id ? 'Edit' : 'Add')} Section
              </h3>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (modal.type === 'section' && !modal.data._id && modal.data.subjectId) {
                    if ((form.addSectionMode || 'new') === 'new') {
                      try {
                        await api.post('/admin/sections/create-and-add', {
                          subjectId: modal.data.subjectId,
                          name: form.name,
                          displayName: form.displayName || undefined
                        });
                        toast.success('Section created and added');
                        setModal(null);
                        fetchAll();
                      } catch (err) {
                        toast.error(err.response?.data?.message || 'Failed');
                      }
                    } else {
                      if (!form.existingSectionId) {
                        toast.error('Select a section');
                        return;
                      }
                      try {
                        await api.post(`/admin/subjects/${modal.data.subjectId}/sections/${form.existingSectionId}`);
                        toast.success('Section added to subject');
                        setModal(null);
                        fetchAll();
                      } catch (err) {
                        toast.error(err.response?.data?.message || 'Failed');
                      }
                    }
                    return;
                  }
                  const data = modal.type === 'course' ? { name: form.name }
                    : modal.type === 'department' ? { name: form.name, courseId: modal.data.courseId }
                    : modal.type === 'subject' ? { name: form.name, code: form.code, departmentId: modal.data.departmentId }
                    : { name: form.name, displayName: form.displayName ?? modal.data.displayName ?? undefined, students: form.students ?? modal.data.students ?? [] };
                  if (modal.data._id) handleUpdate(modal.type + 's', modal.data._id, data);
                  else handleCreate(modal.type + 's', data);
                }}
                className="space-y-4"
              >
                {modal.type === 'course' && (
                  <>
                    <div>
                      <Label>Name</Label>
                      <Input value={form.name ?? modal.data.name ?? ''} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="B.Tech" required />
                    </div>
                  </>
                )}
                {modal.type === 'department' && (
                  <>
                    <div>
                      <Label>Name</Label>
                      <Input value={form.name ?? modal.data.name ?? ''} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="CSE" required />
                    </div>
                  </>
                )}
                {modal.type === 'subject' && (
                  <>
                    <div>
                      <Label>Name</Label>
                      <Input value={form.name ?? modal.data.name ?? ''} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Data Structures" required />
                    </div>
                    <div>
                      <Label>Code</Label>
                      <Input value={form.code ?? modal.data.code ?? ''} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="CS101" required />
                    </div>
                  </>
                )}
                {modal.type === 'section' && (
                  <>
                    {!modal.data._id && modal.data.subjectId ? (
                      <>
                        <div className="flex gap-4 border-b pb-2">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="addSectionMode" checked={(form.addSectionMode || 'new') === 'new'} onChange={() => setForm({ ...form, addSectionMode: 'new' })} />
                            <span>Create new section</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="addSectionMode" checked={(form.addSectionMode || 'new') === 'existing'} onChange={() => setForm({ ...form, addSectionMode: 'existing' })} />
                            <span>Add existing section</span>
                          </label>
                        </div>
                        {(form.addSectionMode || 'new') === 'new' && (
                          <>
                            <div>
                              <Label>Section name (admin – full, e.g. 3rdYear_ECE-3)</Label>
                              <Input value={form.name ?? ''} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="3rdYear_ECE-3" required />
                            </div>
                            <div>
                              <Label>Display name (faculty – short, e.g. ECE-3)</Label>
                              <Input value={form.displayName ?? ''} onChange={(e) => setForm({ ...form, displayName: e.target.value })} placeholder="ECE-3" />
                            </div>
                          </>
                        )}
                        {(form.addSectionMode || 'new') === 'existing' && (
                          <div>
                            <Label>Existing section (same department)</Label>
                            <select
                              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                              value={form.existingSectionId ?? ''}
                              onChange={(e) => setForm({ ...form, existingSectionId: e.target.value })}
                            >
                              <option value="">— Select —</option>
                              {departmentSections
                                .filter((sec) => {
                                  const sub = subjects.find((s) => s._id === modal.data.subjectId);
                                  const linked = (sub?.sectionIds || []).map((s) => (typeof s === 'object' ? s._id : s));
                                  return !linked.includes(sec._id);
                                })
                                .map((sec) => (
                                  <option key={sec._id} value={sec._id}>{sec.name}</option>
                                ))}
                            </select>
                            <p className="text-xs text-muted-foreground mt-1">Sections already in this subject are hidden.</p>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div>
                          <Label>Section name (admin – full, e.g. 3rdYear_ECE-3)</Label>
                          <Input value={form.name ?? modal.data.name ?? ''} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="3rdYear_ECE-3" required />
                        </div>
                        <div>
                          <Label>Display name (faculty – short, e.g. ECE-3)</Label>
                          <Input value={form.displayName ?? modal.data.displayName ?? ''} onChange={(e) => setForm({ ...form, displayName: e.target.value })} placeholder="ECE-3" />
                          <p className="text-xs text-muted-foreground mt-1">Optional. If empty, derived from section name.</p>
                        </div>
                        {modal.data._id && (
                          <div>
                            <Label>{'Students (JSON: [{"name":"...","scholarNumber":"..."}])'}</Label>
                            <textarea
                              className="w-full border rounded p-2 text-sm font-mono h-24"
                              value={JSON.stringify(form.students !== undefined ? form.students : (modal.data.students || []), null, 2)}
                              onChange={(e) => { try { setForm({ ...form, students: JSON.parse(e.target.value) }); } catch {} }}
                            />
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setModal(null)}>Cancel</Button>
                  <Button type="submit">Save</Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
