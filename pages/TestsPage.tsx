import React, { useEffect, useState } from 'react';
import { apiService } from '../services/apiService';
import { Card } from '../components/Components';

interface LabTest {
  id: string;
  category_id: number;
  name: string;
  normal_min: number;
  normal_max: number;
  unit: string;
  category_name?: string;
}

interface TestCategory {
  id: number;
  name: string;
}

export const TestsPage: React.FC = () => {
  const [tests, setTests] = useState<LabTest[]>([]);
  const [categories, setCategories] = useState<TestCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      const [testsData, categoriesData] = await Promise.all([
        apiService.getTests(),
        apiService.getTestCategories(),
      ]);
      setTests(testsData);
      setCategories(categoriesData);
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Deletion removed from UI; keep API available if needed later.

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-gray-800">Lab Tests</h2>
      </div>

      {error && <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {categories.map(cat => {
          const catTests = tests.filter(t => t.category_id === cat.id);
          return (
            <Card key={cat.id} className="p-0 overflow-hidden h-fit">
              <div className="bg-gray-100 p-3 border-b font-semibold text-gray-700 flex justify-between">
                <span className="text-sm md:text-base">{cat.name}</span>
                <span className="text-xs bg-white px-2 py-1 rounded border text-gray-500">{catTests.length} tests</span>
              </div>
              <ul className="divide-y">
                {catTests.map(test => (
                  <li key={test.id} className="p-3 hover:bg-gray-50">
                    <p className="font-medium text-sm">{test.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{test.normal_min} - {test.normal_max} {test.unit}</p>
                  </li>
                ))}
                {catTests.length === 0 && <li className="p-3 text-center text-xs text-gray-400">No tests added.</li>}
              </ul>
            </Card>
          );
        })}
      </div>
    </div>
  );
};


