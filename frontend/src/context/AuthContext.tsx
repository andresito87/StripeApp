import { createContext, useContext } from "react";

export interface User {
  id_user: string;
  balance: number;
  name: string;
  email: string;
  google2fa_enabled: boolean;
}

export interface AuthContextType {
  user: User | null;
  token?: string;
  login: (email: string, password: string) => Promise<string>;
  register: (name: string, email: string, password: string) => Promise<string>;
  logout: () => void;
  fetchUser: () => void;
  isTwoFactorRequired: boolean;
  verifyTwoFactor: (otp: string) => Promise<string | void>;
  cancelTwoFactor: () => void;
  updateBalance: (newBalance: number) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

// Custom hook para facilitar el acceso
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("El usuario necesita un Proveedor de autenticación válido");
  }
  return context;
};
