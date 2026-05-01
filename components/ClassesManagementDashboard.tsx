'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Plus, Edit2, Trash2, BookOpen } from 'lucide-react';

interface Class {
  id: number;
  class_name: string;
  section?: string;
  description?: string;
  created_at?: string;
}

export function ClassesManagementDashboard() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ className: '', section: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await fetch(api('/api/classes'));
      if (!response.ok) {
        throw new Error(`Failed to fetch classes (${response.status})`);
      }
      const data = await response.json();
      // Ensure we only set an array — guard against error objects or unexpected shapes
      if (Array.isArray(data)) {
        setClasses(data);
      } else if (data && Array.isArray((data as any).data)) {
        setClasses((data as any).data);
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

    try {
      const url = editingId ? api(`/api/classes/${editingId}`) : api('/api/classes');
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          class_name: formData.className,
          section: formData.section,
          description: formData.description,
        }),
      });

      if (response.ok) {
        fetchClasses();
        setFormData({ className: '', section: '', description: '' });
        setShowForm(false);
        setEditingId(null);
      } else {
        throw new Error(`Failed to save class (${response.status})`);
      }
    } catch (error) {
      console.error('[v0] Error saving class:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const deleteClass = async (id: number) => {
    if (!confirm('Are you sure you want to delete this class?')) return;

    try {
      const response = await fetch(api(`/api/classes/${id}`), { method: 'DELETE' });
      if (response.ok) {
        fetchClasses();
      }
    } catch (error) {
      console.error('[v0] Error deleting class:', error);
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gradient">Manage Classes</h2>
          <p className="text-muted-foreground mt-1">Add, edit, and manage school classes</p>
        </div>
        <button
          onClick={() => (showForm ? handleReset() : setShowForm(true))}
          className="btn-primary-gradient flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add New Class
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="card-elevated space-y-4">
          <h3 className="text-lg font-bold text-foreground">
            {editingId ? 'Edit Class' : 'Add New Class'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-4">
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
                className="input-modern"
              />
            </div>

            <div className="col-span-3 flex gap-3">
              <button type="submit" disabled={submitting} className="btn-primary-gradient flex-1">
                {submitting ? 'Saving...' : editingId ? 'Update Class' : 'Add Class'}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 px-4 py-3 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 rounded-lg transition-all font-medium text-foreground"
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
                    className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4 text-indigo-400" />
                  </button>
                  <button
                    onClick={() => deleteClass(cls.id)}
                    className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
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
                Added {new Date(cls.created_at || '').toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
