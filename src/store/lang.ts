import { create } from 'zustand';

interface LangState {
  lang: string;
  setLang: (lang: string) => void;
}

const useLang = create<LangState>((set) => ({
  lang: 'en',
  setLang: (lang: string) => {
    localStorage.setItem('lang', lang); 
    set({ lang });
  },
}));

export default useLang;