import supabase from '../config/supabase';
import bcrypt from 'bcrypt';
import { User } from '../types/index';

const SALT_ROUNDS = 10;

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const createUser = async ({ username, passwordHash }: { username: string; passwordHash: string }): Promise<User> => {
  const { data, error } = await supabase.from('users').insert([{ username, password_hash: passwordHash }]).select();
  if (error) throw error;
  return data[0] as User;
};

export const findUserByUsername = async (username: string): Promise<User | null> => {
  const { data, error } = await supabase.from('users').select('*').eq('username', username).maybeSingle();
  if (error) throw error;
  return (data as User) || null;
};

export const findUserById = async (id: string): Promise<Partial<User> | null> => {
  const { data, error } = await supabase.from('users').select('id, username, created_at').eq('id', id).maybeSingle();
  if (error) throw error;
  return (data as Partial<User>) || null;
};

export const getAllUsers = async (): Promise<Partial<User>[]> => {
  const { data, error } = await supabase.from('users').select('id, username, created_at').order('created_at', { ascending: false });
  if (error) throw error;
  return (data as Partial<User>[]) || [];
};

export const deleteUser = async (id: string): Promise<User[]> => {
  const { data, error } = await supabase.from('users').delete().eq('id', id).select();
  if (error) throw error;
  return (data as User[]) || [];
};
