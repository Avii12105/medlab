// Test model using Supabase
const supabase = require('../config/supabase');

const createTest = async ({ categoryId, name, normalMin, normalMax, unit, result_type }) => {
  const payload = { category_id: categoryId, name, normal_min: normalMin, normal_max: normalMax, unit, result_type };
  const { data, error } = await supabase.from('tests').insert([payload]).select();
  if (error) throw error;
  return data[0];
};

const getTests = async () => {
  const { data, error } = await supabase
    .from('tests')
    .select('*, test_categories(name)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  // Map category_name if available
  return data.map(t => ({ ...t, category_name: t.test_categories ? t.test_categories.name : null }));
};

const getTestById = async (id) => {
  const { data, error } = await supabase
    .from('tests')
    .select('*, test_categories(name)')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return { ...data, category_name: data.test_categories ? data.test_categories.name : null };
};

const getTestsByCategory = async (categoryId) => {
  const { data, error } = await supabase
    .from('tests')
    .select('*')
    .eq('category_id', categoryId)
    .order('name', { ascending: true });
  if (error) throw error;
  return data;
};

const updateTest = async (id, { categoryId, name, normalMin, normalMax, unit, result_type }) => {
  const payload = { category_id: categoryId, name, normal_min: normalMin, normal_max: normalMax, unit, result_type };
  const { data, error } = await supabase.from('tests').update(payload).eq('id', id).select();
  if (error) throw error;
  return data[0];
};

module.exports = {
  createTest,
  getTests,
  getTestById,
  getTestsByCategory,
  updateTest,
};
