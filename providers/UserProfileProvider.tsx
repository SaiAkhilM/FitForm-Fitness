import { useState, useEffect, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';

interface UserProfile {
  name: string;
  age: number;
  height: number;
  weight: number;
  fitnessLevel: string;
  goals: string;
  injuries: string;
}

const STORAGE_KEY = '@fitform_user_profile';

export const [UserProfileProvider, useUserProfile] = createContextHook(() => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboarded, setIsOnboarded] = useState(false);

  const loadProfile = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setProfile(JSON.parse(stored));
        setIsOnboarded(true);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const saveProfile = useCallback(async (newProfile: UserProfile) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newProfile));
      setProfile(newProfile);
      setIsOnboarded(true);
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  }, []);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!profile) return;
    
    const updatedProfile = { ...profile, ...updates };
    await saveProfile(updatedProfile);
  }, [profile, saveProfile]);

  const clearProfile = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setProfile(null);
      setIsOnboarded(false);
    } catch (error) {
      console.error('Error clearing profile:', error);
    }
  }, []);

  return useMemo(() => ({
    profile,
    isLoading,
    isOnboarded,
    saveProfile,
    updateProfile,
    clearProfile,
  }), [profile, isLoading, isOnboarded, saveProfile, updateProfile, clearProfile]);
});