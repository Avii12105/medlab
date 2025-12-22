import supabase from '../config/supabase';
import { Report, CreateReportRequest } from '../types/index';
import * as reportItemModel from './reportItemModel';

export const createReport = async (req: CreateReportRequest): Promise<Report> => {
  const { data, error } = await supabase.from('reports').insert([{ patient_id: req.patientId }]).select();
  if (error) throw error;
  return (data[0] as Report);
};

export const getReports = async (): Promise<Partial<Report>[]> => {
  const { data, error } = await supabase
    .from('reports')
    .select('id, patient_id, patients(name), created_at')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as any[])?.map((r: any) => ({
    id: r.id,
    patient_id: r.patient_id,
    patient_name: r.patients?.name || null,
    created_at: r.created_at,
  })) || [];
};

export const getReportById = async (id: string): Promise<Partial<Report> | null> => {
  const { data, error } = await supabase.from('reports').select('*, patients(name)').eq('id', id).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    ...(data as any),
    patient_name: (data as any).patients?.name || null,
  };
};

export const getReportsByPatientId = async (patientId: string): Promise<Report[]> => {
  const { data, error } = await supabase.from('reports').select('*').eq('patient_id', patientId).order('created_at', { ascending: false });
  if (error) throw error;
  return (data as Report[]) || [];
};

export const getReportWithItems = async (id: string): Promise<Report | null> => {
  const { data: report, error: rErr } = await supabase.from('reports').select('*').eq('id', id).maybeSingle();
  if (rErr) throw rErr;
  if (!report) return null;

  // fetch patient name
  const { data: patient } = await supabase.from('patients').select('name').eq('id', (report as any).patient_id).maybeSingle();

  // fetch items and test info
  const { data: items, error: iErr } = await supabase
    .from('report_items')
    .select('*, tests(name, unit, normal_min, normal_max)')
    .eq('report_id', id)
    .order('created_at', { ascending: false });
  if (iErr) throw iErr;

  const formattedItems = (items as any[] || []).map((it: any) => ({
    id: it.id,
    test_id: it.test_id,
    test_name: it.tests?.name || null,
    result_value: it.result_value,
    status: it.status,
    unit: it.tests?.unit || null,
    normal_min: it.tests?.normal_min || null,
    normal_max: it.tests?.normal_max || null,
  }));

  return {
    id: (report as any).id,
    patient_id: (report as any).patient_id,
    patient_name: (patient as any)?.name || null,
    created_at: (report as any).created_at,
    items: formattedItems,
  } as Report;
};

export const deleteReport = async (id: string): Promise<Report[]> => {
  // delete items first
  await reportItemModel.deleteReportItemsByReportId(id);
  const { data, error } = await supabase.from('reports').delete().eq('id', id).select();
  if (error) throw error;
  return (data as Report[]) || [];
};
