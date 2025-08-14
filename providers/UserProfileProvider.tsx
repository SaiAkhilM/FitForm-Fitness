import { useState, useEffect, useMemo, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, Database } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';

interface UserProfile {
  name: string;
  age: number | null;
  height: number | null;
  weight: number | null;
  fitnessLevel: string | null;
  goals: string | null;
  injuries: string | null;
}

type DatabaseProfile = Database['public']['Tables']['profiles']['Row'];

export const [UserProfileProvider, useUserProfile] = createContextHook(() => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboarded, setIsOnboarded] = useState(false);

  const loadProfile = useCallback(async () => {
    try {
      // First check if user is authenticated
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      setUser(currentSession?.user || null);

      if (currentSession?.user) {
        // Load profile from Supabase
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', currentSession.user.id)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
          console.error('Error loading profile from Supabase:', error);
          return;
        }

        if (profileData) {
          const userProfile: UserProfile = {
            name: profileData.name,
            age: profileData.age,
            height: profileData.height,
            weight: profileData.weight,
            fitnessLevel: profileData.fitness_level,
            goals: profileData.goals,
            injuries: profileData.injuries,
          };
          setProfile(userProfile);
          setIsOnboarded(true);
        }
      } else {
        // Fallback to local storage for onboarding
        const stored = await AsyncStorage.getItem('@fitform_user_profile');
        if (stored) {
          setProfile(JSON.parse(stored));
          setIsOnboarded(true);
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user || null);
        
        if (event === 'SIGNED_IN' && session?.user) {
          await loadProfile();
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
          setIsOnboarded(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [loadProfile]);

  const signUp = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    // Clear local storage as well
    await AsyncStorage.removeItem('@fitform_user_profile');
    setProfile(null);
    setIsOnboarded(false);
  }, []);

  const saveProfile = useCallback(async (newProfile: UserProfile) => {
    try {
      if (user) {
        // Save to Supabase
        const profileData: Database['public']['Tables']['profiles']['Insert'] = {
          user_id: user.id,
          name: newProfile.name,
          age: newProfile.age,
          height: newProfile.height,
          weight: newProfile.weight,
          fitness_level: newProfile.fitnessLevel,
          goals: newProfile.goals,
          injuries: newProfile.injuries,
        };

        const { error } = await supabase
          .from('profiles')
          .upsert(profileData, { onConflict: 'user_id' });

        if (error) throw error;
      } else {
        // Fallback to local storage during onboarding
        await AsyncStorage.setItem('@fitform_user_profile', JSON.stringify(newProfile));
      }

      setProfile(newProfile);
      setIsOnboarded(true);
    } catch (error) {
      console.error('Error saving profile:', error);
      throw error;
    }
  }, [user]);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!profile) return;
    
    const updatedProfile = { ...profile, ...updates };
    await saveProfile(updatedProfile);
  }, [profile, saveProfile]);

  const clearProfile = useCallback(async () => {
    await signOut();
  }, [signOut]);

  return useMemo(() => ({
    profile,
    user,
    session,
    isLoading,
    isOnboarded,
    signUp,
    signIn,
    signOut,
    saveProfile,
    updateProfile,
    clearProfile,
  }), [profile, user, session, isLoading, isOnboarded, signUp, signIn, signOut, saveProfile, updateProfile, clearProfile]);
});