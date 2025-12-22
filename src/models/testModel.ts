import supabase from '../config/supabase';
import { LabTest, CreateTestRequest } from '../types/index';

export const createTest = async (test: CreateTestRequest): Promise<LabTest> => {
  const payload = {
    category_id: test.categoryId,
    name: test.name,
    normal_min: test.normalMin,
    normal_max: test.normalMax,
    unit: test.unit,
    result_type: test.result_type,
  };
  const { data, error } = await supabase.from('tests').insert([payload]).select();
  if (error) throw error;
  return (data[0] as LabTest);
};

export const getTests = async (): Promise<LabTest[]> => {
  const { data, error } = await supabase
    .from('tests')
    .select('*, test_categories(name)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  // Map category_name if available
  return (data as any[])?.map((t: any) => ({
    ...t,
    category_name: t.test_categories?.name || null,
  })) || [];
};

export const getTestById = async (id: string): Promise<LabTest | null> => {
  const { data, error } = await supabase
    .from('tests')
    .select('*, test_categories(name)')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    ...(data as any),
    category_name: (data as any).test_categories?.name || null,
  } as LabTest;
};

export const getTestsByCategory = async (categoryId: number): Promise<LabTest[]> => {
  const { data, error } = await supabase
    .from('tests')
    .select('*')
    .eq('category_id', categoryId)
    .order('name', { ascending: true });
  if (error) throw error;
  return (data as LabTest[]) || [];
};

export const updateTest = async (id: string, test: Partial<CreateTestRequest>): Promise<LabTest> => {
  const payload: any = {};
  if (test.categoryId) payload.category_id = test.categoryId;
  if (test.name) payload.name = test.name;
  if (test.normalMin !== undefined) payload.normal_min = test.normalMin;
  if (test.normalMax !== undefined) payload.normal_max = test.normalMax;
  if (test.unit) payload.unit = test.unit;
  if (test.result_type) payload.result_type = test.result_type;

  const { data, error } = await supabase.from('tests').update(payload).eq('id', id).select();
  if (error) throw error;
  return (data[0] as LabTest);
};
