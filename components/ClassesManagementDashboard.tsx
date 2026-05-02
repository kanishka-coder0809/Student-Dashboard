'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, BookOpen } from 'lucide-react';

interface Class {
  id: string;
  class_name: string;
  section?: string;
  description?: string;
  createdAt?: string;
}

export function ClassesManagementDashboard() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ className: '', section: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/classes');
      if (!response.ok) {
        throw new Error(`Failed to fetch classes (${response.status})`);
      }
      const data = await response.json();
      // Ensure we only set an array — guard against error objects or unexpected shapes
      if (Array.isArray(data)) {
        setClasses(
          data.map((item: any) => ({
            id: String(item._id ?? item.id),
            class_name: item.class_name,
            section: item.section,
            description: item.description,
            createdAt: item.createdAt ?? item.created_at,
          }))
        );
      } else if (data && Array.isArray((data as any).data)) {
        setClasses(
          (data as any).data.map((item: any) => ({
            id: String(item._id ?? item.id),
            class_name: item.class_name,
            section: item.section,
            description: item.description,
            createdAt: item.createdAt ?? item.created_at,
          }))
        );
      } else {
        console.error('[v0] Unexpected classes API response:', data);
        setClasses([]);
      }
    } catch (error) {
      console.error('[v0] Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // Client-side validation
    if (!formData.className.trim()) {
      alert('Please enter a class name');
      setSubmitting(false);
      return;
    }

    try {
      const url = editingId ? `/api/classes?id=${encodeURIComponent(editingId)}` : '/api/classes';
      const method = editingId ? 'PUT' : 'POST';
      
      const requestBody = {
        class_name: formData.className.trim(),
        section: formData.section.trim(),
        description: formData.description.trim(),
      };

      console.log('[v0] Submitting class:', method, url, requestBody);

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const responseText = await response.text();
      console.log('[v0] Response status:', response.status, 'body:', responseText);

      if (response.ok) {
        let data;
        try {
          data = JSON.parse(responseText);
        } catch {
          data = responseText;
        }
        console.log('[v0] Class saved successfully:', data);
        
        fetchClasses();
        setFormData({ className: '', section: '', description: '' });
        setShowForm(false);
        setEditingId(null);
        
        alert(editingId ? 'Class updated successfully!' : 'Class added successfully!');
      } else {
        let errorMessage = `Failed to save class (${response.status})`;
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {}
        console.error('[v0] Error response:', errorMessage);
        alert(errorMessage);
      }
    } catch (error) {
      console.error('[v0] Error saving class:', error);
      alert('Failed to save class. Please check if the server is running.');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteClass = async (id: string) => {
    const classId = String(id);

    if (!confirm('Are you sure you want to delete this class?')) return;

    try {
      const response = await fetch(`/api/classes?id=${encodeURIComponent(classId)}`, { method: 'DELETE' });
      if (response.ok) {
        fetchClasses();
      } else {
        const errorText = await response.text();
        console.error('[v0] Error deleting class:', response.status, errorText);
        alert('Failed to delete class. Please try again.');
      }
    } catch (error) {
      console.error('[v0] Error deleting class:', error);
      alert('Failed to delete class. Please try again.');
    }
  };

  const handleEdit = (cls: Class) => {
    setEditingId(cls.id);
    setFormData({
      className: cls.class_name,
      section: cls.section || '',
      description: cls.description || '',
    });
    setShowForm(true);
  };

  const handleReset = () => {
    setFormData({ className: '', section: '', description: '' });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">Loading classes...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <span className="chip-soft inline-flex items-center gap-2">Class setup</span>
          <div>
            <h2 className="text-3xl font-bold text-gradient">Manage Classes</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
              Create sections, keep descriptions updated, and maintain a clean class roster.
            </p>
          </div>
        </div>
        <button
          onClick={() => (showForm ? handleReset() : setShowForm(true))}
          className="btn-primary-gradient inline-flex items-center gap-2 self-start"
        >
          <Plus className="w-4 h-4" />
          Add New Class
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="card-elevated space-y-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-bold text-foreground sm:text-xl">
            {editingId ? 'Edit Class' : 'Add New Class'}
            </h3>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              {editingId ? 'Update mode' : 'Create mode'}
            </span>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Class Name <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={formData.className}
                onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                required
                placeholder="e.g., 10-A"
                className="input-modern"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Section (Optional)
              </label>
              <input
                type="text"
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                placeholder="e.g., Science, Commerce"
                className="input-modern"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Description (Optional)
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Class description"
                className="textarea-modern min-h-[120px]"
                rows={5}
              />
            </div>

            <div className="col-span-1 flex flex-col gap-3 pt-1 lg:col-span-3 lg:flex-row">
              <button type="submit" disabled={submitting} className="btn-primary-gradient flex-1">
                {submitting ? 'Saving...' : editingId ? 'Update Class' : 'Add Class'}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="btn-secondary-soft flex-1"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Classes Grid */}
      {classes.length === 0 ? (
        <div className="card-elevated text-center py-12">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">No classes added yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Add your first class to get started
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((cls) => (
            <div key={cls.id} className="card-elevated group hover-lift">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-lg">
                    <BookOpen className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{cls.class_name}</h3>
                    {cls.section && (
                      <p className="text-sm text-muted-foreground">{cls.section}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(cls)}
                    className="btn-ghost-soft p-2"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4 text-indigo-400" />
                  </button>
                  <button
                    onClick={() => deleteClass(cls.id)}
                    className="btn-danger-soft p-2"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>

              {cls.description && (
                <p className="text-sm text-muted-foreground mb-4">{cls.description}</p>
              )}

              <div className="text-xs text-muted-foreground">
                Added{' '}
                {cls.createdAt
                  ? new Date(cls.createdAt).toLocaleDateString()
                  : 'Recently'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
