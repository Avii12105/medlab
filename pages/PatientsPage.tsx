import React, { useEffect, useState } from 'react';
import { Edit, Trash2, Plus } from 'lucide-react';
import { apiService } from '../services/apiService';
import { Patient } from '../types';
import { Button, Input, Modal, Card } from '../components/Components';

export const PatientsPage: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Patient>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadPatients = async () => {
    try {
      const data = await apiService.getPatients();
      setPatients(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const handleSave = async () => {
    if (!formData.name || !formData.age || !formData.phone) {
      setError('Name, age, and phone are required');
      return;
    }

    setLoading(true);
    try {
      if (formData.id) {
        // Update existing patient
        await apiService.updatePatient(formData.id as string, {
          name: formData.name,
          age: formData.age,
          phone: formData.phone,
          email: formData.email || '',
        });
      } else {
        // Create new patient
        await apiService.createPatient({
          name: formData.name,
          age: formData.age,
          phone: formData.phone,
          email: formData.email || '',
        });
      }
      await loadPatients();
      setIsModalOpen(false);
      setFormData({});
      setError('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete patient?')) return;

    try {
      await apiService.deletePatient(id);
      await loadPatients();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-2">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800">Patient List</h2>
        <Button onClick={() => { setFormData({}); setIsModalOpen(true); }} className="shrink-0">
          <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Add Patient</span><span className="sm:hidden">Add</span>
        </Button>
      </div>

      {error && <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700">{error}</div>}

      {/* Desktop Table */}
      <Card className="overflow-hidden p-0 hidden md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-semibold text-gray-600">Name</th>
              <th className="p-4 font-semibold text-gray-600">Age</th>
              <th className="p-4 font-semibold text-gray-600">Contact</th>
              <th className="p-4 font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {patients.map(p => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="p-4 font-medium">{p.name}</td>
                <td className="p-4">{p.age}</td>
                <td className="p-4">
                  <div className="flex flex-col">
                    <span>{p.phone}</span>
                    <span className="text-xs text-gray-400">{p.email}</span>
                  </div>
                </td>
                <td className="p-4 flex gap-2">
                  <button onClick={() => { setFormData(p); setIsModalOpen(true); }} className="p-2 text-gray-700 hover:bg-[#daf0ee] rounded">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {patients.length === 0 && (
              <tr><td colSpan={4} className="p-8 text-center text-gray-500">No patients found.</td></tr>
            )}
          </tbody>
        </table>
      </Card>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {patients.map(p => (
          <Card key={p.id} className="p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-gray-900">{p.name}</h3>
                <p className="text-sm text-gray-500">Age: {p.age}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => { setFormData(p); setIsModalOpen(true); }} className="p-2 text-gray-700 hover:bg-[#daf0ee] rounded">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(p.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="text-sm space-y-1">
              <p className="text-gray-600">{p.phone}</p>
              {p.email && <p className="text-gray-400 text-xs">{p.email}</p>}
            </div>
          </Card>
        ))}
        {patients.length === 0 && (
          <Card className="p-8 text-center text-gray-500">No patients found.</Card>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={formData.id ? "Edit Patient" : "New Patient"}>
        <div className="space-y-4">
          {error && <div className="p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}
          <Input label="Full Name" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} disabled={loading} />
          <Input label="Age" type="number" value={formData.age || ''} onChange={e => setFormData({ ...formData, age: Number(e.target.value) })} disabled={loading} />
          <Input label="Phone" value={formData.phone || ''} onChange={e => setFormData({ ...formData, phone: e.target.value })} disabled={loading} />
          <Input label="Email" type="email" value={formData.email || ''} onChange={e => setFormData({ ...formData, email: e.target.value })} disabled={loading} />
          <Button onClick={handleSave} className="w-full" disabled={loading}>
            {loading ? 'Saving...' : 'Save Patient'}
          </Button>
        </div>
      </Modal>
    </div>
  );
};


