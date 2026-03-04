import React, { createContext, useContext, useState } from 'react';
import bcrypt from 'bcryptjs';
// import { genSalt, hash } from 'bcrypt-ts';

interface User {
  id: string;
  name: string;
  phoneNumber: string;
  email: string;
  role: string;
}

interface LoginResult {
  success: boolean;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('authUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string): Promise<LoginResult> => {
    setIsLoading(true);
    try {
      let users: any[] = [];

      // Always try fresh API call
      const response = await fetch('https://api.nirwanastays.com/admin/users');
      if (response.ok) {
        users = await response.json();
      }

      // ❌ No users from API → reject login immediately
      if (!users || users.length === 0) {
        setIsLoading(false);
        return { success: false };
      }

      // Match by email or phone
      const matchedUser = users.find(
        (u: any) => u.email === email.trim() || u.phoneNumber === email.trim()
      );
      // console.log('Matched user:', matchedUser);
      if (!matchedUser) {
        setIsLoading(false);
        return { success: false };
      }

      // const saltRounds = 12;
      // const plainPassword = 'admin@1234';
      // const hash = bcrypt.hashSync(plainPassword, saltRounds);
      // console.log(hash); // Copy this hash

      // const testHash = await bcrypt.hash(password, 12);
      // // const testHash = await hash(password, 12);
      // console.log('Test hash for entered password:', testHash);

      // const passwordMatch = matchedUser.password === testHash;
      // console.log("Password comparison result:", passwordMatch);
      // console.log("Entered password:", testHash);
      // console.log("Stored password:", matchedUser.password);

      // Check password
      const isPasswordMatch = await bcrypt.compare(password, matchedUser.password);
      // console.log('Password match:', isPasswordMatch);
      if (!isPasswordMatch) {
        setIsLoading(false);
        return { success: false };
      }

      // ✅ Store only this matched user
      const authUser: User = {
        id: matchedUser.id,
        name: matchedUser.name,
        phoneNumber: matchedUser.phoneNumber,
        email: matchedUser.email,
        role: matchedUser.role,
      };

      setUser(authUser);
      localStorage.setItem('authUser', JSON.stringify(authUser));

      setIsLoading(false);
      return { success: true, role: matchedUser.role };
    } catch (err) {
      console.error('Login error:', err);
      setIsLoading(false);
      return { success: false };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authUser');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
