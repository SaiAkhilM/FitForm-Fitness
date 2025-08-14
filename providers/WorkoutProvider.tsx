import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase, Database } from '@/lib/supabase';
import { useUserProfile } from './UserProfileProvider';
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

type DatabaseWorkout = Database['public']['Tables']['workouts']['Row'];

export const [WorkoutProvider, useWorkout] = createContextHook(() => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [currentWorkout, setCurrentWorkout] = useState<Partial<Workout> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useUserProfile();

  const loadWorkouts = useCallback(async () => {
    try {
      if (user) {
        // Load from Supabase
        const { data: workoutData, error } = await supabase
          .from('workouts')
          .select('*')
          .eq('user_id', user.id)
          .order('started_at', { ascending: false });

        if (error) {
          console.error('Error loading workouts from Supabase:', error);
          return;
        }

        if (workoutData) {
          const mappedWorkouts: Workout[] = workoutData.map((dbWorkout: DatabaseWorkout) => ({
            id: dbWorkout.id,
            exerciseId: dbWorkout.exercise_type,
            exerciseName: dbWorkout.exercise_name,
            date: dbWorkout.started_at,
            duration: dbWorkout.duration || 0,
            sets: dbWorkout.sets || 0,
            totalReps: dbWorkout.total_reps || 0,
            averageFormScore: dbWorkout.average_form_score || 0,
          }));
          setWorkouts(mappedWorkouts);
        }
      } else {
        // Fallback to local storage
        const stored = await AsyncStorage.getItem('@fitform_workouts');
        if (stored) {
          setWorkouts(JSON.parse(stored));
        }
      }
    } catch (error) {
      console.error('Error loading workouts:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadWorkouts();
  }, [loadWorkouts]);

  const saveWorkouts = useCallback(async (updatedWorkouts: Workout[]) => {
    try {
      if (user) {
        // Supabase updates are handled per workout, not batch
        setWorkouts(updatedWorkouts);
      } else {
        // Fallback to local storage
        await AsyncStorage.setItem('@fitform_workouts', JSON.stringify(updatedWorkouts));
        setWorkouts(updatedWorkouts);
      }
    } catch (error) {
      console.error('Error saving workouts:', error);
    }
  }, [user]);

  const startWorkout = useCallback(async (exerciseId: string) => {
    const exerciseNames: Record<string, string> = {
      'tennis-serve': 'Tennis Serve',
      'boxing-combo': 'Boxing Combo',
      'overhead-press': 'Overhead Press',
    };

    try {
      if (user) {
        // Create workout in Supabase
        const workoutData: Database['public']['Tables']['workouts']['Insert'] = {
          user_id: user.id,
          exercise_type: exerciseId,
          exercise_name: exerciseNames[exerciseId] || 'Unknown Exercise',
          started_at: new Date().toISOString(),
        };

        const { data: newWorkout, error } = await supabase
          .from('workouts')
          .insert(workoutData)
          .select()
          .single();

        if (error) throw error;

        if (newWorkout) {
          setCurrentWorkout({
            id: newWorkout.id,
            exerciseId: newWorkout.exercise_type,
            exerciseName: newWorkout.exercise_name,
            date: newWorkout.started_at,
            duration: 0,
            sets: 0,
            totalReps: 0,
            averageFormScore: 0,
          });
        }
      } else {
        // Fallback to local state
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
      }
    } catch (error) {
      console.error('Error starting workout:', error);
    }
  }, [user]);

  const updateWorkoutData = useCallback(async (data: Partial<Workout>) => {
    if (!currentWorkout) return;

    const updatedWorkout = { ...currentWorkout, ...data };
    setCurrentWorkout(updatedWorkout);

    if (user && currentWorkout.id) {
      // Update in Supabase
      try {
        const updateData: Database['public']['Tables']['workouts']['Update'] = {
          duration: data.duration,
          sets: data.sets,
          total_reps: data.totalReps,
          average_form_score: data.averageFormScore,
        };

        const { error } = await supabase
          .from('workouts')
          .update(updateData)
          .eq('id', currentWorkout.id);

        if (error) throw error;
      } catch (error) {
        console.error('Error updating workout:', error);
      }
    }
  }, [currentWorkout, user]);

  const endWorkout = useCallback(async () => {
    if (!currentWorkout || !currentWorkout.id) return;

    try {
      if (user) {
        // Finalize workout in Supabase
        const { error } = await supabase
          .from('workouts')
          .update({ ended_at: new Date().toISOString() })
          .eq('id', currentWorkout.id);

        if (error) throw error;

        // Reload workouts to get the completed one
        await loadWorkouts();
      } else {
        // Fallback to local storage
        const completedWorkout = currentWorkout as Workout;
        const updatedWorkouts = [completedWorkout, ...workouts];
        await saveWorkouts(updatedWorkouts);
      }

      setCurrentWorkout(null);
    } catch (error) {
      console.error('Error ending workout:', error);
    }
  }, [currentWorkout, user, workouts, saveWorkouts, loadWorkouts]);

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