import { create } from 'zustand';
import { request } from './api';
import type { Filters } from '../../src/analytics/filters';

export type Page = 'overview' | 'requests' | 'sessions' | 'projects' | 'models' | 'costs' | 'insights' | 'integrations' | 'settings';

interface S {
  page: Page; filters: Filters; data: any | null; loading: boolean; host: any | null; progress: string[];
  detailId: string | null; sessionKey: string | null;
  setPage(p: Page): void; setFilters(f: Partial<Filters>): void; load(): Promise<void>;
  setHost(h: any): void; pushProgress(m: string): void; openDetail(id: string | null): void; openSession(k: string | null): void;
  drill(kind: 'tool' | 'project' | 'model' | 'provider' | 'session', key: string): void;
}

let loadSeq = 0;
export const useStore = create<S>((set, get) => ({
  page: 'overview', filters: { period: '30d' }, data: null, loading: true, host: null, progress: [], detailId: null, sessionKey: null,
  setPage: page => set({ page }),
  setFilters: f => { set({ filters: { ...get().filters, ...f } }); void get().load(); },
  load: async () => {
    const my = ++loadSeq;
    set({ loading: true });
    const data = await request('dashboard', { filters: get().filters });
    if (my === loadSeq) set({ data, loading: false });
  },
  setHost: host => set({ host }),
  pushProgress: m => set({ progress: [...get().progress.slice(-30), m] }),
  openDetail: detailId => set({ detailId }),
  openSession: sessionKey => set({ sessionKey }),
  drill: (kind, key) => {
    if (kind === 'session') { set({ sessionKey: key, page: 'sessions' }); return; }
    get().setFilters({ [kind]: [key] } as Partial<Filters>);
  },
}));
