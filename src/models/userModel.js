// User model using Supabase
const supabase = require('../config/supabase');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

// Hash a password
const hashPassword = async (password) => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

// Compare password with hash
const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

const createUser = async ({ username, passwordHash }) => {
  const { data, error } = await supabase.from('users').insert([{ username, password_hash: passwordHash }]).select();
  if (error) throw error;
  return data[0];
};

const findUserByUsername = async (username) => {
  const { data, error } = await supabase.from('users').select('*').eq('username', username).maybeSingle();
  if (error) throw error;
  return data || null;
};

const findUserById = async (id) => {
  const { data, error } = await supabase.from('users').select('id, username, created_at').eq('id', id).maybeSingle();
  if (error) throw error;
  return data || null;
};

const getAllUsers = async () => {
  const { data, error } = await supabase.from('users').select('id, username, created_at').order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

const deleteUser = async (id) => {
  const { data, error } = await supabase.from('users').delete().eq('id', id).select();
  if (error) throw error;
  return data;
};

module.exports = {
  createUser,
  findUserByUsername,
  findUserById,
  getAllUsers,
  deleteUser,
  hashPassword,
  comparePassword,
};
