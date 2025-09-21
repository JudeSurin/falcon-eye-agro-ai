import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  picture?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (auth0User: any) => Promise<{ success: boolean; user?: User; error?: string }>;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (auth0User) => {
        try {
          set({ isLoading: true });

          // Simulate API call to your backend
          const user: User = {
            id: auth0User.sub,
            name: auth0User.name || auth0User.email,
            email: auth0User.email,
            picture: auth0User.picture,
          };

          // Generate a simple token (in real app, this comes from your backend)
          const token = `hoverfly_token_${Date.now()}`;

          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false
          });

          return { success: true, user };
        } catch (error) {
          console.error('Login error:', error);
          set({ isLoading: false });
          
          const message = 'Authentication failed';
          return { success: false, error: message };
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false
        });
        localStorage.removeItem('hoverfly-auth-storage');
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'hoverfly-auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);