import { create } from 'zustand';
import { UserData } from '../types/user';

interface UserState {
  userData: UserData | null;
  setUserData: (data: UserData) => void;
}

const useUserStore = create<UserState>(set => ({
  userData: null,
  setUserData: data => set({ userData: data }),
}));

export default useUserStore;
