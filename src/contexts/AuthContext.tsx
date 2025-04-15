// firebase-auth-context.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut as firebaseSignOut, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { auth, db } from '@/integrations/firebase.config';

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: 'super_admin' | 'admin';
}

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  createAdmin: (email: string, password: string, fullName: string) => Promise<void>;
  createInitialAdmin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await fetchUserProfile(firebaseUser.uid);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const fetchUserProfile = async (uid: string) => {
    try {
      const docRef = doc(db, 'profiles', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProfile(docSnap.data() as UserProfile);
      } else {
        setProfile(null);
      }
    } catch (error: any) {
      console.error('Error fetching user profile:', error.message);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Signed in successfully!');
      navigate('/admin');
    } catch (error: any) {
      toast.error(`Error signing in: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      toast.success('Signed out successfully!');
      navigate('/login');
    } catch (error: any) {
      toast.error(`Error signing out: ${error.message}`);
    }
  };

  const createAdmin = async (email: string, password: string, fullName: string) => {
    try {
      setLoading(true);

      // Create user via Firebase Admin SDK or secure Cloud Function (not client-side)
      const { uid } = await createUserWithEmailAndPassword(auth, email, password).then(res => res.user);

      const profileData: UserProfile = {
        id: uid,
        email,
        full_name: fullName,
        role: 'admin'
      };

      await setDoc(doc(db, 'profiles', uid), profileData);

      toast.success(`Admin user ${email} created successfully!`);
    } catch (error: any) {
      toast.error(`Error creating admin: ${error.message}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createInitialAdmin = async () => {
    try {
      setLoading(true);
      // This should be done via a secure backend endpoint or Cloud Function
      // For now, simulate by creating a default admin:
      const defaultEmail = 'admin@example.com';
      const defaultPassword = 'AdminPass123!';
      const fullName = 'Super Admin';

      const { user: newUser } = await createUserWithEmailAndPassword(auth, defaultEmail, defaultPassword);

      const profileData: UserProfile = {
        id: newUser.uid,
        email: defaultEmail,
        full_name: fullName,
        role: 'super_admin'
      };

      await setDoc(doc(db, 'profiles', newUser.uid), profileData);

      toast.success('Initial admin user created successfully!');
    } catch (error: any) {
      console.error('Error creating initial admin:', error);
      toast.error(`Error creating initial admin: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signIn,
        signOut,
        createAdmin,
        createInitialAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
