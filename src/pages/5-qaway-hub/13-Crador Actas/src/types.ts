export type Agreement = { id: string; text: string; deadline: string };
export type Evidence = { id: string; file: File; url: string; kind: 'attendance' | 'photo'; caption: string };
export type ActForm = {
  date: string; startTime: string; endTime: string; activity: 'Asistencia técnica' | 'Monitoreo y seguimiento' | 'Balance';
  modality: 'Presencial' | 'Virtual'; scope: 'Regional' | 'Local'; totalParticipants: string; dre: string; ugel: string;
  participants: string; agenda: string[]; agreements: Agreement[]; observations: string;
};
export const emptyForm: ActForm = {
  date: new Date().toISOString().slice(0, 10), startTime: '', endTime: '', activity: 'Asistencia técnica', modality: 'Virtual', scope: 'Local',
  totalParticipants: '', dre: '', ugel: '', participants: '', agenda: ['', '', ''],
  agreements: [{ id: crypto.randomUUID(), text: '', deadline: '' }, { id: crypto.randomUUID(), text: '', deadline: '' }, { id: crypto.randomUUID(), text: '', deadline: '' }, { id: crypto.randomUUID(), text: '', deadline: '' }], observations: '',
};
