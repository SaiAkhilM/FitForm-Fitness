import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || Constants.expoConfig?.extra?.supabaseUrl;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || Constants.expoConfig?.extra?.supabaseAnonKey;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase configuration. Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  },
});

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          user_id: string;
          name: string;
          age: number | null;
          height: number | null;
          weight: number | null;
          fitness_level: string | null;
          goals: string | null;
          injuries: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          name: string;
          age?: number | null;
          height?: number | null;
          weight?: number | null;
          fitness_level?: string | null;
          goals?: string | null;
          injuries?: string | null;
        };
        Update: {
          name?: string;
          age?: number | null;
          height?: number | null;
          weight?: number | null;
          fitness_level?: string | null;
          goals?: string | null;
          injuries?: string | null;
        };
      };
      workouts: {
        Row: {
          id: string;
          user_id: string;
          started_at: string;
          ended_at: string | null;
          exercise_type: string;
          exercise_name: string;
          duration: number | null;
          sets: number | null;
          total_reps: number | null;
          average_form_score: number | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          exercise_type: string;
          exercise_name: string;
          started_at?: string;
          ended_at?: string | null;
          duration?: number | null;
          sets?: number | null;
          total_reps?: number | null;
          average_form_score?: number | null;
        };
        Update: {
          ended_at?: string | null;
          duration?: number | null;
          sets?: number | null;
          total_reps?: number | null;
          average_form_score?: number | null;
        };
      };
      exercise_sets: {
        Row: {
          id: string;
          workout_id: string;
          set_number: number;
          reps: number;
          form_scores: number[];
          feedback_notes: string[] | null;
          created_at: string;
        };
        Insert: {
          workout_id: string;
          set_number: number;
          reps: number;
          form_scores: number[];
          feedback_notes?: string[] | null;
        };
        Update: {
          reps?: number;
          form_scores?: number[];
          feedback_notes?: string[] | null;
        };
      };
      sensor_data: {
        Row: {
          id: string;
          workout_id: string;
          timestamp: string;
          sensor_type: 'wrist' | 'elbow' | 'shoulder';
          data: {
            accel: { x: number; y: number; z: number };
            gyro: { x: number; y: number; z: number };
            quaternion: { w: number; x: number; y: number; z: number };
            battery?: number;
          };
        };
        Insert: {
          workout_id: string;
          timestamp: string;
          sensor_type: 'wrist' | 'elbow' | 'shoulder';
          data: {
            accel: { x: number; y: number; z: number };
            gyro: { x: number; y: number; z: number };
            quaternion: { w: number; x: number; y: number; z: number };
            battery?: number;
          };
        };
        Update: never;
      };
      ai_feedback: {
        Row: {
          id: string;
          exercise_set_id: string;
          feedback_type: 'safety' | 'technique' | 'encouragement';
          message: string;
          severity: 'low' | 'medium' | 'high';
          timestamp: string;
        };
        Insert: {
          exercise_set_id: string;
          feedback_type: 'safety' | 'technique' | 'encouragement';
          message: string;
          severity: 'low' | 'medium' | 'high';
          timestamp?: string;
        };
        Update: never;
      };
    };
  };
}