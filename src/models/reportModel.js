// Report model using Supabase
const supabase = require('../config/supabase');
const reportItemModel = require('./reportItemModel');

const createReport = async ({ patientId }) => {
  const { data, error } = await supabase.from('reports').insert([{ patient_id: patientId }]).select();
  if (error) throw error;
  return data[0];
};

const getReports = async () => {
  const { data, error } = await supabase
    .from('reports')
    .select('id, patient_id, patients(name), created_at')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data.map(r => ({ id: r.id, patient_id: r.patient_id, patient_name: r.patients ? r.patients.name : null, created_at: r.created_at }));
};

const getReportById = async (id) => {
  const { data, error } = await supabase.from('reports').select('*, patients(name)').eq('id', id).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return { ...data, patient_name: data.patients ? data.patients.name : null };
};

const getReportsByPatientId = async (patientId) => {
  const { data, error } = await supabase.from('reports').select('*').eq('patient_id', patientId).order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

const getReportWithItems = async (id) => {
  const { data: report, error: rErr } = await supabase.from('reports').select('*').eq('id', id).maybeSingle();
  if (rErr) throw rErr;
  if (!report) return null;

  // fetch patient name
  const { data: patient } = await supabase.from('patients').select('name').eq('id', report.patient_id).maybeSingle();

  // fetch items and test info
  const { data: items, error: iErr } = await supabase
    .from('report_items')
    .select('*, tests(name, unit, normal_min, normal_max)')
    .eq('report_id', id)
    .order('created_at', { ascending: false });
  if (iErr) throw iErr;

  const formattedItems = (items || []).map(it => ({
    id: it.id,
    test_id: it.test_id,
    test_name: it.tests ? it.tests.name : null,
    result_value: it.result_value,
    status: it.status,
    unit: it.tests ? it.tests.unit : null,
    normal_min: it.tests ? it.tests.normal_min : null,
    normal_max: it.tests ? it.tests.normal_max : null,
  }));

  return {
    id: report.id,
    patient_id: report.patient_id,
    patient_name: patient ? patient.name : null,
    created_at: report.created_at,
    items: formattedItems,
  };
};

const deleteReport = async (id) => {
  // delete items first
  await reportItemModel.deleteReportItemsByReportId(id);
  const { data, error } = await supabase.from('reports').delete().eq('id', id).select();
  if (error) throw error;
  return data;
};

module.exports = {
  createReport,
  getReports,
  getReportById,
  getReportsByPatientId,
  getReportWithItems,
  deleteReport,
};
