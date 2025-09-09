import type { Lead } from '../types';

export const exportToCsv = (leads: Lead[], filename: string = 'leads.csv') => {
  const header = ['company','location','website','email','phone','emailQuality','rating','reviews','instagram'];
  const rows = leads.map(l => [
    l.company, 
    l.location, 
    l.website, 
    l.email || '', 
    l.phone || '', 
    l.emailQuality || '', 
    l.rating || '', 
    l.reviews || '', 
    l.instagram || ''
  ]);
  
  const csv = [header, ...rows].map(r => r.map(String).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};
