// Test Category model using Supabase
const supabase = require('../config/supabase');

const createTestCategory = async ({ name }) => {
  const { data, error } = await supabase.from('test_categories').insert([{ name }]).select();
  if (error) throw error;
  return data[0];
};

const getTestCategories = async () => {
  const { data, error } = await supabase.from('test_categories').select('*').order('name', { ascending: true });
  if (error) throw error;
  return data;
};

const getTestCategoryById = async (id) => {
  const { data, error } = await supabase.from('test_categories').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data || null;
};

const updateTestCategory = async (id, { name }) => {
  const { data, error } = await supabase.from('test_categories').update({ name }).eq('id', id).select();
  if (error) throw error;
  return data[0];
};

const deleteTestCategory = async (id) => {
  const { data, error } = await supabase.from('test_categories').delete().eq('id', id).select();
  if (error) throw error;
  return data;
};

module.exports = {
  createTestCategory,
  getTestCategories,
  getTestCategoryById,
  updateTestCategory,
  deleteTestCategory,
};
