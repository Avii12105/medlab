import React, { useEffect, useState } from 'react';
import { FileDown, FileText, Plus, Trash2 } from 'lucide-react';
import { apiService } from '../services/apiService';
import { generatePDF } from '../services/pdfService';
import { Button, Card } from '../components/Components';

interface Report {
  id: string;
  patient_id: number;
  patient_name: string;
  created_at: string;
  items?: any[];
}

interface ReportsPageProps {
  onCreateClick: () => void;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({ onCreateClick }) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadReports = async () => {
    try {
      const data = await apiService.getReports();
      setReports(data.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadReports();
  }, [selectedReport]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this report?')) return;

    try {
      await apiService.deleteReport(id);
      await loadReports();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const viewReport = async (report: Report) => {
    setLoading(true);
    try {
      const fullReport = await apiService.getReportById(report.id);
      setSelectedReport(fullReport);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (selectedReport) {
    return (
      <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <Button variant="outline" onClick={() => setSelectedReport(null)}>Back to List</Button>
          <Button onClick={() => generatePDF(selectedReport as any)} className="w-full sm:w-auto">
            <FileDown className="w-4 h-4" /> Download PDF
          </Button>
        </div>

        <Card className="border-t-4" style={{ borderTopColor: '#daf0ee' }}>
          <div className="flex flex-col sm:flex-row justify-between mb-6 md:mb-8 border-b pb-4 gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">Lab Report</h1>
              <p className="text-gray-500 text-sm">#{selectedReport.id}</p>
            </div>
            <div className="sm:text-right">
              <p className="font-semibold text-base md:text-lg">MedLab</p>
              <p className="text-gray-500 text-xs md:text-sm">Laboratory Management System</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8 mb-6 md:mb-8">
            <div>
              <p className="text-sm text-gray-500 mb-1">Patient Name</p>
              <p className="font-medium text-base md:text-lg">{selectedReport.patient_name}</p>
            </div>
            <div className="sm:text-right">
              <p className="text-sm text-gray-500 mb-1">Date</p>
              <p className="font-medium">{new Date(selectedReport.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto mb-8">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-y border-gray-200">
                <tr>
                  <th className="py-3 px-4 text-left font-semibold">Test</th>
                  <th className="py-3 px-4 text-left font-semibold">Result</th>
                  <th className="py-3 px-4 text-left font-semibold">Reference Range</th>
                  <th className="py-3 px-4 text-left font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {(selectedReport.items || []).map((item: any, idx: number) => (
                  <tr key={idx}>
                    <td className="py-3 px-4 font-medium">{item.test_name}</td>
                    <td className="py-3 px-4">
                      <span className="font-semibold">{item.result_value}</span> <span className="text-gray-500 text-xs">{item.unit}</span>
                    </td>
                    <td className="py-3 px-4 text-gray-500">{item.normal_min} - {item.normal_max}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        item.status === 'NORMAL' ? 'bg-green-100 text-green-700' :
                        item.status === 'HIGH' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile List */}
          <div className="md:hidden space-y-3 mb-6">
            {(selectedReport.items || []).map((item: any, idx: number) => (
              <div key={idx} className="p-4 bg-gray-50 rounded-lg border">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-sm">{item.test_name}</h4>
                  <span className={`px-2 py-1 rounded text-xs font-medium shrink-0 ml-2 ${
                    item.status === 'NORMAL' ? 'bg-green-100 text-green-700' :
                    item.status === 'HIGH' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {item.status}
                  </span>
                </div>
                <div className="text-sm space-y-1">
                  <p><span className="text-gray-500">Result:</span> <span className="font-semibold">{item.result_value}</span> <span className="text-gray-500 text-xs">{item.unit}</span></p>
                  <p className="text-gray-500">Range: {item.normal_min} - {item.normal_max}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-2">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800">Lab Reports</h2>
        <Button onClick={onCreateClick} className="shrink-0">
          <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Create Report</span><span className="sm:hidden">Create</span>
        </Button>
      </div>

      {error && <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700">{error}</div>}

      {/* Desktop Table */}
      <Card className="overflow-hidden p-0 hidden md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-semibold text-gray-600">Patient</th>
              <th className="p-4 font-semibold text-gray-600">Date</th>
              <th className="p-4 font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {reports.map(r => (
              <tr key={r.id} onClick={() => viewReport(r)} className="hover:bg-gray-50 cursor-pointer">
                <td className="p-4 font-medium flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-400" />
                  {r.patient_name}
                </td>
                <td className="p-4">{new Date(r.created_at).toLocaleDateString()}</td>
                <td className="p-4 flex gap-2">
                  <button onClick={(e) => handleDelete(r.id, e)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {reports.length === 0 && (
              <tr><td colSpan={3} className="p-8 text-center text-gray-500">No reports found.</td></tr>
            )}
          </tbody>
        </table>
      </Card>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {reports.map(r => (
          <Card key={r.id} className="p-4" onClick={() => viewReport(r)}>
            <div className="flex justify-between items-start">
              <div className="flex items-start gap-2 flex-1">
                <FileText className="w-4 h-4 text-gray-400 mt-1 shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">{r.patient_name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{new Date(r.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <button onClick={(e) => handleDelete(r.id, e)} className="p-2 text-red-600 hover:bg-red-50 rounded shrink-0">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </Card>
        ))}
        {reports.length === 0 && (
          <Card className="p-8 text-center text-gray-500">No reports found.</Card>
        )}
      </div>
    </div>
  );
};


