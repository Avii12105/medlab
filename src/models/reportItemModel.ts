import supabase from '../config/supabase';
import { ReportItem, CreateReportItemRequest } from '../types/index';

export const createReportItem = async (reportId: string, item: CreateReportItemRequest): Promise<ReportItem> => {
  const { data, error } = await supabase
    .from('report_items')
    .insert([{
      report_id: reportId,
      test_id: item.testId,
      result_value: item.resultValue,
      status: item.status,
    }])
    .select();
  if (error) throw error;
  return (data[0] as ReportItem);
};

export const getReportItems = async (): Promise<ReportItem[]> => {
  const { data, error } = await supabase
    .from('report_items')
    .select('*, tests(name, unit, normal_min, normal_max, category_id)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as any[])?.map((ri: any) => ({
    ...ri,
    test_name: ri.tests?.name || null,
    unit: ri.tests?.unit || null,
    normal_min: ri.tests?.normal_min || null,
    normal_max: ri.tests?.normal_max || null,
  })) || [];
};

export const getReportItemById = async (id: string): Promise<ReportItem | null> => {
  const { data, error } = await supabase
    .from('report_items')
    .select('*, tests(name, unit, normal_min, normal_max)')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    ...(data as any),
    test_name: (data as any).tests?.name || null,
    unit: (data as any).tests?.unit || null,
    normal_min: (data as any).tests?.normal_min || null,
    normal_max: (data as any).tests?.normal_max || null,
  } as ReportItem;
};

export const deleteReportItem = async (id: string): Promise<ReportItem[]> => {
  const { data, error } = await supabase.from('report_items').delete().eq('id', id).select();
  if (error) throw error;
  return (data as ReportItem[]) || [];
};

export const deleteReportItemsByReportId = async (reportId: string): Promise<ReportItem[]> => {
  const { data, error } = await supabase.from('report_items').delete().eq('report_id', reportId).select();
  if (error) throw error;
  return (data as ReportItem[]) || [];
};

export const updateReportItem = async (id: string, updates: Partial<CreateReportItemRequest>): Promise<ReportItem> => {
  const payload: any = {};
  if (updates.testId) payload.test_id = updates.testId;
  if (updates.resultValue !== undefined) payload.result_value = updates.resultValue;
  if (updates.status) payload.status = updates.status;

  const { data, error } = await supabase.from('report_items').update(payload).eq('id', id).select();
  if (error) throw error;
  return (data[0] as ReportItem);
};
