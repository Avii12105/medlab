import { supabase } from './supabaseClient';

class APIService {
  private token: string | null = null;
  // Resolve base URL from env (Vite), fallback to localhost
  private baseURL: string = (() => {
    const envUrl = (import.meta as any)?.env?.VITE_API_URL as string | undefined;
    const url = (envUrl && envUrl.trim()) || 'http://localhost:3000';
    return url.replace(/\/$/, '');
  })();
  private apiPrefix = '/api';

  setToken(token: string) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async fetch(url: string, options: RequestInit = {}) {
    const headers: any = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    let response: Response;
    try {
      response = await fetch(`${this.baseURL}${this.apiPrefix}${url}`, {
        ...options,
        headers,
      });
    } catch (e: any) {
      // Network-level errors (CORS/mixed content/down backend)
      throw new Error('Network error: failed to reach API. Ensure backend is online, uses HTTPS, and CORS allows this origin.');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Authentication with username/password
  async login(username: string, password: string) {
    const result = await this.fetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    this.token = result.token;
    if (this.token) localStorage.setItem('auth_token', this.token);
    return result;
  }

  async register(username: string, password: string) {
    const result = await this.fetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    this.token = result.token;
    if (this.token) localStorage.setItem('auth_token', this.token);
    return result;
  }

  // Patients
  async getPatients() {
    const { data, error } = await supabase.from('patients').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  async getPatientById(id: string) {
    const { data, error } = await supabase.from('patients').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data;
  }

  async createPatient(payload: any) {
    const { data, error } = await supabase.from('patients').insert([payload]).select();
    if (error) throw error;
    return data[0];
  }

  async updatePatient(id: string, payload: any) {
    const { data, error } = await supabase.from('patients').update(payload).eq('id', id).select();
    if (error) throw error;
    return data[0];
  }

  async deletePatient(id: string) {
    const { data, error } = await supabase.from('patients').delete().eq('id', id).select();
    if (error) throw error;
    return data;
  }

  // Test Categories
  async getTestCategories() {
    const { data, error } = await supabase.from('test_categories').select('*').order('name', { ascending: true });
    if (error) throw error;
    return data;
  }

  async createTestCategory(payload: any) {
    const { data, error } = await supabase.from('test_categories').insert([payload]).select();
    if (error) throw error;
    return data[0];
  }

  // Tests
  async getTests() {
    const { data, error } = await supabase.from('tests').select('*, test_categories(name)').order('created_at', { ascending: false });
    if (error) throw error;
    return data.map((t: any) => ({ ...t, category_name: t.test_categories ? t.test_categories.name : null }));
  }

  async getTestsByCategory(categoryId: string) {
    const { data, error } = await supabase.from('tests').select('*').eq('category_id', categoryId).order('name', { ascending: true });
    if (error) throw error;
    return data;
  }

  async createTest(payload: any) {
    const { data, error } = await supabase.from('tests').insert([payload]).select();
    if (error) throw error;
    return data[0];
  }

  async updateTest(id: string, payload: any) {
    const { data, error } = await supabase.from('tests').update(payload).eq('id', id).select();
    if (error) throw error;
    return data[0];
  }

  // Reports
  async getReports() {
    const { data, error } = await supabase.from('reports').select('id, patient_id, patients(name), created_at').order('created_at', { ascending: false });
    if (error) throw error;
    return data.map((r: any) => ({ id: r.id, patient_id: r.patient_id, patient_name: r.patients ? r.patients.name : null, created_at: r.created_at }));
  }

  async getReportById(id: string) {
    const { data, error } = await supabase.from('reports').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    if (!data) return null;
    const { data: items, error: iErr } = await supabase.from('report_items').select('*, tests(name, unit, normal_min, normal_max)').eq('report_id', id).order('created_at', { ascending: false });
    if (iErr) throw iErr;
    const formattedItems = (items || []).map((it: any) => ({ id: it.id, test_id: it.test_id, test_name: it.tests ? it.tests.name : null, result_value: it.result_value, status: it.status, unit: it.tests ? it.tests.unit : null, normal_min: it.tests ? it.tests.normal_min : null, normal_max: it.tests ? it.tests.normal_max : null }));
    const { data: patient } = await supabase.from('patients').select('name').eq('id', data.patient_id).maybeSingle();
    return { id: data.id, patient_id: data.patient_id, patient_name: patient ? patient.name : null, created_at: data.created_at, items: formattedItems };
  }

  async getReportsByPatientId(patientId: string) {
    const { data, error } = await supabase.from('reports').select('*').eq('patient_id', patientId).order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  async createReport(payload: any) {
    const { data, error } = await supabase.from('reports').insert([payload]).select();
    if (error) throw error;
    return data[0];
  }

  async deleteReport(id: string) {
    const { data, error } = await supabase.from('reports').delete().eq('id', id).select();
    if (error) throw error;
    return data;
  }

  // Report Items
  async addReportItem(reportId: string, payload: any) {
    const { data, error } = await supabase.from('report_items').insert([{ report_id: reportId, ...payload }]).select();
    if (error) throw error;
    return data[0];
  }

  async getReportItems(reportId: string) {
    const { data, error } = await supabase.from('report_items').select('*, tests(name, unit, normal_min, normal_max)').eq('report_id', reportId).order('created_at', { ascending: false });
    if (error) throw error;
    return data.map((ri: any) => ({ ...ri, test_name: ri.tests ? ri.tests.name : null, unit: ri.tests ? ri.tests.unit : null, normal_min: ri.tests ? ri.tests.normal_min : null, normal_max: ri.tests ? ri.tests.normal_max : null }));
  }

  async updateReportItem(reportId: string, itemId: string, payload: any) {
    const { data, error } = await supabase.from('report_items').update(payload).eq('id', itemId).select();
    if (error) throw error;
    return data[0];
  }

  async deleteReportItem(reportId: string, itemId: string) {
    const { data, error } = await supabase.from('report_items').delete().eq('id', itemId).select();
    if (error) throw error;
    return data;
  }
}

export const apiService = new APIService();
