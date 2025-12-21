import React, { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { apiService } from '../services/apiService';
import { Button, Card, Input, Select } from '../components/Components';

interface Patient {
  id: number;
  name: string;
  age: number;
}

interface LabTest {
  id: number;
  category_id: number;
  name: string;
  result_type?: 'NUMERIC' | 'TEXTUAL';
  normal_min?: number;
  normal_max?: number;
  normal_values?: string;
  unit?: string;
  category_name?: string;
}

interface TestCategory {
  id: number;
  name: string;
}

interface ReportItem {
  test_id: number;
  test_name: string;
  result_type?: 'NUMERIC' | 'TEXTUAL';
  result_value: string | number;
  status: 'LOW' | 'NORMAL' | 'HIGH';
  unit?: string;
  normal_min?: number;
  normal_max?: number;
  normal_values?: string;
}

interface CreateReportPageProps {
  onCancel: () => void;
  onSave: () => void;
}

export const CreateReportPage: React.FC<CreateReportPageProps> = ({ onCancel, onSave }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [tests, setTests] = useState<LabTest[]>([]);
  const [categories, setCategories] = useState<TestCategory[]>([]);

  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [items, setItems] = useState<ReportItem[]>([]);
  const [testToAdd, setTestToAdd] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [patientsData, testsData, categoriesData] = await Promise.all([
        apiService.getPatients(),
        apiService.getTests(),
        apiService.getTestCategories(),
      ]);
      setPatients(patientsData);
      setTests(testsData);
      setCategories(categoriesData);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAddTest = () => {
    if (!testToAdd) return;
    const testDef = tests.find(t => String(t.id) === testToAdd);
    if (!testDef) return;

    if (items.find(i => i.test_id === testDef.id)) {
      alert('Test already added');
      return;
    }

    const newItem: ReportItem = {
      test_id: testDef.id,
      test_name: testDef.name,
      result_type: testDef.result_type || 'NUMERIC',
      normal_min: testDef.normal_min,
      normal_max: testDef.normal_max,
      normal_values: testDef.normal_values,
      unit: testDef.unit,
      result_value: testDef.result_type === 'TEXTUAL' ? '' : 0,
      status: 'NORMAL'
    };
    setItems([...items, newItem]);
    setTestToAdd('');
  };

  const updateItemResult = (index: number, val: string | number) => {
    const newItems = [...items];
    const item = newItems[index];
    item.result_value = val;

    // For numeric tests, calculate status
    if (item.result_type === 'NUMERIC' && typeof val === 'number') {
      const numVal = Number(val);
      if (item.normal_min !== undefined && item.normal_max !== undefined) {
        if (numVal < item.normal_min) item.status = 'LOW';
        else if (numVal > item.normal_max) item.status = 'HIGH';
        else item.status = 'NORMAL';
      }
    }
    // For textual tests, status is always NORMAL (or user can set it)
    else if (item.result_type === 'TEXTUAL') {
      item.status = 'NORMAL';
    }

    setItems(newItems);
  };

  const handleSaveReport = async () => {
    if (!selectedPatientId || items.length === 0) {
      setError('Please select a patient and add at least one test');
      return;
    }

    setLoading(true);
    try {
      // Create report
      const report = await apiService.createReport({ patient_id: selectedPatientId });

      // Add report items
      for (const item of items) {
        await apiService.addReportItem(String(report.id), {
          test_id: item.test_id,
          result_value: item.result_value,
          status: item.status,
        });
      }

      onSave();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
        <Button variant="outline" onClick={onCancel} className="w-full sm:w-auto">Cancel</Button>
        <h2 className="text-xl md:text-2xl font-bold text-gray-800">Create New Report</h2>
      </div>

      {error && <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700">{error}</div>}

      <Card className="grid grid-cols-1 md:grid-cols-1 gap-6">
        <Select label="Select Patient" value={selectedPatientId} onChange={e => setSelectedPatientId(e.target.value)} disabled={loading}>
          <option value="">-- Choose Patient --</option>
          {patients.map(p => <option key={p.id} value={p.id}>{p.name} ({p.age} years)</option>)}
        </Select>
      </Card>

      <Card>
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-6 items-stretch sm:items-end border-b pb-6">
          <Select label="Add Test to Report" value={testToAdd} onChange={e => setTestToAdd(e.target.value)} className="flex-1" disabled={loading}>
            <option value="">-- Select Test to Add --</option>
            {categories.map(cat => (
              <optgroup key={cat.id} label={cat.name}>
                {tests.filter(t => t.category_id === cat.id).map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </optgroup>
            ))}
          </Select>
          <Button onClick={handleAddTest} disabled={!testToAdd || loading} className="w-full sm:w-auto"><Plus className="w-4 h-4" /> Add</Button>
        </div>

        {items.length > 0 ? (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3">Test Name</th>
                    <th className="px-4 py-3 w-32">Result</th>
                    <th className="px-4 py-3">Unit</th>
                    <th className="px-4 py-3">Normal Range</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {items.map((item, idx) => (
                    <tr key={item.test_id}>
                      <td className="px-4 py-3 font-medium">{item.test_name}</td>
                      <td className="px-4 py-3">
                        {item.result_type === 'TEXTUAL' ? (
                          item.normal_values ? (
                            <select
                              value={item.result_value}
                              onChange={e => updateItemResult(idx, e.target.value)}
                              className="h-9 px-2 border rounded text-sm w-full"
                              disabled={loading}
                            >
                              <option value="">-- Select --</option>
                              {item.normal_values.split(',').map(v => (
                                <option key={v.trim()} value={v.trim()}>{v.trim()}</option>
                              ))}
                            </select>
                          ) : (
                            <Input
                              type="text"
                              value={item.result_value}
                              onChange={e => updateItemResult(idx, e.target.value)}
                              placeholder="Enter result"
                              className="h-9 py-1"
                              disabled={loading}
                            />
                          )
                        ) : (
                          <Input
                            type="number"
                            step="0.01"
                            value={item.result_value}
                            onChange={e => updateItemResult(idx, Number(e.target.value))}
                            className="h-9 py-1"
                            disabled={loading}
                          />
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-500">{item.unit || '-'}</td>
                      <td className="px-4 py-3 text-gray-500">
                        {item.result_type === 'TEXTUAL' 
                          ? (item.normal_values || 'Text') 
                          : `${item.normal_min} - ${item.normal_max}`}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          item.status === 'NORMAL' ? 'bg-green-100 text-green-700' :
                          item.status === 'HIGH' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => setItems(items.filter((_, i) => i !== idx))} className="text-red-500 hover:text-red-700" disabled={loading}>
                          <X className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile/Tablet Cards */}
            <div className="lg:hidden space-y-3">
              {items.map((item, idx) => (
                <div key={item.test_id} className="p-4 bg-gray-50 rounded-lg border relative">
                  <button 
                    onClick={() => setItems(items.filter((_, i) => i !== idx))} 
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1" 
                    disabled={loading}
                  >
                    <X className="w-4 h-4" />
                  </button>
                  
                  <h4 className="font-semibold text-sm mb-3 pr-8">{item.test_name}</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Result</label>
                      {item.result_type === 'TEXTUAL' ? (
                        item.normal_values ? (
                          <select
                            value={item.result_value}
                            onChange={e => updateItemResult(idx, e.target.value)}
                            className="h-9 px-2 border rounded text-sm w-full"
                            disabled={loading}
                          >
                            <option value="">-- Select --</option>
                            {item.normal_values.split(',').map(v => (
                              <option key={v.trim()} value={v.trim()}>{v.trim()}</option>
                            ))}
                          </select>
                        ) : (
                          <Input
                            type="text"
                            value={item.result_value}
                            onChange={e => updateItemResult(idx, e.target.value)}
                            placeholder="Enter result"
                            className="h-9 py-1"
                            disabled={loading}
                          />
                        )
                      ) : (
                        <Input
                          type="number"
                          step="0.01"
                          value={item.result_value}
                          onChange={e => updateItemResult(idx, Number(e.target.value))}
                          className="h-9 py-1"
                          disabled={loading}
                        />
                      )}
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <div>
                        <span className="text-gray-500">Unit:</span> <span className="font-medium">{item.unit || '-'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Range:</span> <span className="font-medium">
                          {item.result_type === 'TEXTUAL' 
                            ? (item.normal_values || 'Text') 
                            : `${item.normal_min} - ${item.normal_max}`}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <span className={`px-2 py-1 rounded text-xs font-medium inline-block ${
                        item.status === 'NORMAL' ? 'bg-green-100 text-green-700' :
                        item.status === 'HIGH' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-gray-400 border-2 border-dashed rounded-lg">
            No tests added yet. Select a test above.
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <Button onClick={handleSaveReport} className="w-full sm:w-40" disabled={loading}>
            {loading ? 'Saving...' : 'Save Report'}
          </Button>
        </div>
      </Card>
    </div>
  );
};


