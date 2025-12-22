import supabase from '../config/supabase';
import { TestCategory, CreateTestCategoryRequest } from '../types/index';

export const createTestCategory = async (category: CreateTestCategoryRequest): Promise<TestCategory> => {
  const { data, error } = await supabase.from('test_categories').insert([category]).select();
  if (error) throw error;
  return (data[0] as TestCategory);
};

export const getTestCategories = async (): Promise<TestCategory[]> => {
  const { data, error } = await supabase.from('test_categories').select('*').order('name', { ascending: true });
  if (error) throw error;
  return (data as TestCategory[]) || [];
};

export const getTestCategoryById = async (id: number): Promise<TestCategory | null> => {
  const { data, error } = await supabase.from('test_categories').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return (data as TestCategory) || null;
};

export const updateTestCategory = async (id: number, updates: Partial<CreateTestCategoryRequest>): Promise<TestCategory> => {
  const { data, error } = await supabase.from('test_categories').update(updates).eq('id', id).select();
  if (error) throw error;
  return (data[0] as TestCategory);
};

export const deleteTestCategory = async (id: number): Promise<TestCategory[]> => {
  const { data, error } = await supabase.from('test_categories').delete().eq('id', id).select();
  if (error) throw error;
  return (data as TestCategory[]) || [];
};
