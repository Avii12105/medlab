// Patient model using Supabase
const supabase = require('../config/supabase');

const createPatient = async ({ name, age, phone, email }) => {
  const { data, error } = await supabase
    .from('patients')
    .insert([{ name, age, phone, email }])
    .select();
  if (error) throw error;
  return data[0];
};

const getPatients = async () => {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

const getPatientById = async (id) => {
  const { data, error } = await supabase.from('patients').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data || null;
};

const updatePatient = async (id, { name, age, phone, email }) => {
  const { data, error } = await supabase
    .from('patients')
    .update({ name, age, phone, email })
    .eq('id', id)
    .select();
  if (error) throw error;
  return data[0];
};

const deletePatient = async (id) => {
  const { data, error } = await supabase.from('patients').delete().eq('id', id).select();
  if (error) throw error;
  return data;
};

const searchPatientsByName = async (name) => {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .ilike('name', `%${name}%`)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

module.exports = {
  createPatient,
  getPatients,
  getPatientById,
  updatePatient,
  deletePatient,
  searchPatientsByName,
};
