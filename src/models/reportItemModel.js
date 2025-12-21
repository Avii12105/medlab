// Report Item model using Supabase
const supabase = require('../config/supabase');

const createReportItem = async ({ reportId, testId, resultValue, status }) => {
  const { data, error } = await supabase
    .from('report_items')
    .insert([{ report_id: reportId, test_id: testId, result_value: resultValue, status }])
    .select();
  if (error) throw error;
  return data[0];
};

const getReportItems = async () => {
  const { data, error } = await supabase
    .from('report_items')
    .select('*, tests(name, unit, normal_min, normal_max, category_id)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data.map(ri => ({ ...ri, test_name: ri.tests ? ri.tests.name : null, unit: ri.tests ? ri.tests.unit : null, normal_min: ri.tests ? ri.tests.normal_min : null, normal_max: ri.tests ? ri.tests.normal_max : null }));
};

const getReportItemById = async (id) => {
  const { data, error } = await supabase
    .from('report_items')
    .select('*, tests(name, unit, normal_min, normal_max)')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return { ...data, test_name: data.tests ? data.tests.name : null, unit: data.tests ? data.tests.unit : null, normal_min: data.tests ? data.tests.normal_min : null, normal_max: data.tests ? data.tests.normal_max : null };
};

const getReportItemsByReportId = async (reportId) => {
  const { data, error } = await supabase
    .from('report_items')
    .select('*, tests(name, unit, normal_min, normal_max)')
    .eq('report_id', reportId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data.map(ri => ({ ...ri, test_name: ri.tests ? ri.tests.name : null, unit: ri.tests ? ri.tests.unit : null, normal_min: ri.tests ? ri.tests.normal_min : null, normal_max: ri.tests ? ri.tests.normal_max : null }));
};

const updateReportItem = async (id, { resultValue, status }) => {
  const { data, error } = await supabase
    .from('report_items')
    .update({ result_value: resultValue, status })
    .eq('id', id)
    .select();
  if (error) throw error;
  return data[0];
};

const deleteReportItem = async (id) => {
  const { data, error } = await supabase.from('report_items').delete().eq('id', id).select();
  if (error) throw error;
  return data;
};

const deleteReportItemsByReportId = async (reportId) => {
  const { data, error } = await supabase.from('report_items').delete().eq('report_id', reportId).select();
  if (error) throw error;
  return data;
};

module.exports = {
  createReportItem,
  getReportItems,
  getReportItemById,
  getReportItemsByReportId,
  updateReportItem,
  deleteReportItem,
  deleteReportItemsByReportId,
};
