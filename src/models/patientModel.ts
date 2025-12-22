import supabase from '../config/supabase';
import { Patient, CreatePatientRequest } from '../types/index';

export const createPatient = async (patient: CreatePatientRequest): Promise<Patient> => {
  const { data, error } = await supabase
    .from('patients')
    .insert([patient])
    .select();
  if (error) throw error;
  return (data[0] as Patient);
};

export const getPatients = async (): Promise<Patient[]> => {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as Patient[]) || [];
};

export const getPatientById = async (id: string): Promise<Patient | null> => {
  const { data, error } = await supabase.from('patients').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return (data as Patient) || null;
};

export const updatePatient = async (id: string, updates: Partial<CreatePatientRequest>): Promise<Patient> => {
  const { data, error } = await supabase
    .from('patients')
    .update(updates)
    .eq('id', id)
    .select();
  if (error) throw error;
  return (data[0] as Patient);
};

export const deletePatient = async (id: string): Promise<Patient[]> => {
  const { data, error } = await supabase.from('patients').delete().eq('id', id).select();
  if (error) throw error;
  return (data as Patient[]) || [];
};

export const searchPatientsByName = async (name: string): Promise<Patient[]> => {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .ilike('name', `%${name}%`)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as Patient[]) || [];
};
