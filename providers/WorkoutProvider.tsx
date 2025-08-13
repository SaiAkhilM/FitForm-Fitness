import { useState, useEffect, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';

interface Workout {
  id: string;
  exerciseId: string;
  exerciseName: string;
  date: string;
  duration: number;
  sets: number;
  totalReps: number;
  averageFormScore: number;
}

interface WorkoutStats {
  totalWorkouts: number;
  averageScore: number;
  totalMinutes: number;
}

const STORAGE_KEY = '@fitform_workouts';

export const [WorkoutProvider, useWorkout] = createContextHook(() => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [currentWorkout, setCurrentWorkout] = useState<Partial<Workout> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadWorkouts = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setWorkouts(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading workouts:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWorkouts();
  }, [loadWorkouts]);

  const saveWorkouts = useCallback(async (updatedWorkouts: Workout[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedWorkouts));
      setWorkouts(updatedWorkouts);
    } catch (error) {
      console.error('Error saving workouts:', error);
    }
  }, []);

  const startWorkout = useCallback((exerciseId: string) => {
    const exerciseNames: Record<string, string> = {
      'tennis-serve': 'Tennis Serve',
      'boxing-combo': 'Boxing Combo',
      'overhead-press': 'Overhead Press',
    };

    setCurrentWorkout({
      id: Date.now().toString(),
      exerciseId,
      exerciseName: exerciseNames[exerciseId] || 'Unknown Exercise',
      date: new Date().toISOString(),
      duration: 0,
      sets: 0,
      totalReps: 0,
      averageFormScore: 0,
    });
  }, []);

  const updateWorkoutData = useCallback((data: Partial<Workout>) => {
    if (currentWorkout) {
      setCurrentWorkout({ ...currentWorkout, ...data });
    }
  }, [currentWorkout]);

  const endWorkout = useCallback(async () => {
    if (currentWorkout && currentWorkout.id) {
      const completedWorkout = currentWorkout as Workout;
      const updatedWorkouts = [completedWorkout, ...workouts];
      await saveWorkouts(updatedWorkouts);
      setCurrentWorkout(null);
    }
  }, [currentWorkout, workouts, saveWorkouts]);

  return useMemo(() => ({
    workouts,
    currentWorkout,
    isLoading,
    startWorkout,
    updateWorkoutData,
    endWorkout,
  }), [workouts, currentWorkout, isLoading, startWorkout, updateWorkoutData, endWorkout]);
});

export const useWorkoutHistory = () => {
  const { workouts } = useWorkout();

  const recentWorkouts = workouts.slice(0, 5).map(w => ({
    ...w,
    date: new Date(w.date).toLocaleDateString(),
    formScore: w.averageFormScore,
  }));

  const stats: WorkoutStats = {
    totalWorkouts: workouts.length,
    averageScore: workouts.length > 0 
      ? Math.round(workouts.reduce((acc, w) => acc + w.averageFormScore, 0) / workouts.length)
      : 0,
    totalMinutes: Math.round(workouts.reduce((acc, w) => acc + (w.duration / 60), 0)),
  };

  const weeklyProgress = [false, true, true, false, true, false, false]; // Mock data

  return {
    recentWorkouts,
    stats,
    weeklyProgress,
  };
};