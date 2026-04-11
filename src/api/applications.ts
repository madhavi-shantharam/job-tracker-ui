import axios from 'axios';
import type { Application, ApplicationRequest, AnalyzeRequest, AnalyzeResponse } from '../types';

const BASE = '/api/applications';

export const getApplications = async (): Promise<Application[]> => {
  const res = await axios.get<Application[]>(BASE);
  return res.data;
};

export const getApplication = async (id: number): Promise<Application> => {
  const res = await axios.get<Application>(`${BASE}/${id}`);
  return res.data;
};

export const createApplication = async (data: ApplicationRequest): Promise<Application> => {
  const res = await axios.post<Application>(BASE, data);
  return res.data;
};

export const updateApplication = async (id: number, data: ApplicationRequest): Promise<Application> => {
  const res = await axios.put<Application>(`${BASE}/${id}`, data);
  return res.data;
};

export const deleteApplication = async (id: number): Promise<void> => {
  await axios.delete(`${BASE}/${id}`);
};

export const analyzeResume = async (data: AnalyzeRequest): Promise<AnalyzeResponse> => {
  const res = await axios.post<AnalyzeResponse>('/api/analyze', data);
  return res.data;
};