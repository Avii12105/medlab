export interface User {
  id: string;
  username: string;
  role: 'admin' | 'staff';
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  email: string;
  createdAt: number;
}

export interface TestCategory {
  id: string;
  name: string;
}

export interface LabTest {
  id: string;
  categoryId: string;
  name: string;
  minRange: number;
  maxRange: number;
  unit: string;
}

export type ResultStatus = 'Low' | 'Normal' | 'High';

export interface ReportItem {
  testId: string;
  testName: string;
  resultValue: number;
  minRange: number;
  maxRange: number;
  unit: string;
  status: ResultStatus;
}

export interface Report {
  id: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  doctorName: string;
  reportDate: number;
  items: ReportItem[];
  summary?: string; // AI Summary
}

export type PageView = 'LOGIN' | 'PATIENTS' | 'TESTS' | 'REPORTS' | 'CREATE_REPORT' | 'VIEW_REPORT';
