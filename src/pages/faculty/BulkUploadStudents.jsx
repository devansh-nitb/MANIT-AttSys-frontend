import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';

export default function FacultyBulkUploadStudents() {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [csvFile, setCsvFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    api.get('/faculty/subjects').then(({ data }) => {
      setSubjects(data);
      if (data.length) {
        setSelectedSubject(data[0]);
        setSelectedSection(data[0].sections?.[0]);
      }
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedSubject) {
      setSelectedSection(selectedSubject.sections?.[0]);
    }
  }, [selectedSubject]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedSection || !csvFile) {
      toast.error('Select section and CSV file');
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', csvFile);
      fd.append('sectionId', selectedSection._id);
      const { data } = await api.post('/faculty/sections/upload-students', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success(data.message);
      setCsvFile(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const downloadSample = () => {
    const csv = 'name,scholarNumber\nAlice Johnson,2021001\nBob Williams,2021002';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'students-section-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">Loading...</div>;
  }

  if (subjects.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Bulk Upload Students</h1>
        <Card className="border border-slate-200 dark:border-slate-700">
          <CardContent className="p-8 text-center text-muted-foreground">
            No subjects assigned. Contact admin to get assigned to a subject and section.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Bulk Upload Students</h1>
        <p className="text-muted-foreground">Upload students to your assigned sections</p>
      </div>

      <Card className="border border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle>Upload CSV</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Add students to a section. CSV must have columns: name, scholarNumber
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Subject</Label>
                <select
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={selectedSubject?._id || ''}
                  onChange={(e) => {
                    const s = subjects.find((x) => x._id === e.target.value);
                    setSelectedSubject(s);
                  }}
                >
                  {subjects.map((s) => (
                    <option key={s._id} value={s._id}>{s.name} ({s.code})</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Section</Label>
                <select
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={selectedSection?._id || ''}
                  onChange={(e) => setSelectedSection(selectedSubject?.sections?.find((x) => x._id === e.target.value))}
                >
                  {selectedSubject?.sections?.map((s) => (
                    <option key={s._id} value={s._id}>{s.displayLabel || s.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <Label>CSV File</Label>
              <Input
                type="file"
                accept=".csv"
                onChange={(e) => setCsvFile(e.target.files?.[0])}
              />
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={downloadSample}>
                <Download className="h-4 w-4 mr-1" /> Download Template
              </Button>
              <Button type="submit" disabled={uploading || !csvFile}>
                {uploading ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
