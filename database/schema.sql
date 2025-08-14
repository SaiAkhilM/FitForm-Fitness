-- FitForm Fitness Database Schema
-- Run this in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User profiles table (extends auth.users)
CREATE TABLE profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age INTEGER,
  height INTEGER, -- in cm
  weight INTEGER, -- in kg
  fitness_level TEXT CHECK (fitness_level IN ('Beginner', 'Intermediate', 'Advanced', 'Expert')),
  goals TEXT,
  injuries TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workouts table
CREATE TABLE workouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  exercise_type TEXT NOT NULL, -- 'tennis-serve', 'boxing-combo', 'overhead-press'
  exercise_name TEXT NOT NULL,
  duration INTEGER, -- in seconds
  sets INTEGER DEFAULT 0,
  total_reps INTEGER DEFAULT 0,
  average_form_score REAL, -- 0-100 scale
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exercise sets within workouts
CREATE TABLE exercise_sets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  set_number INTEGER NOT NULL,
  reps INTEGER NOT NULL DEFAULT 0,
  form_scores REAL[] NOT NULL DEFAULT '{}', -- Array of scores for each rep
  feedback_notes TEXT[] DEFAULT '{}', -- Array of AI feedback for each rep
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(workout_id, set_number)
);

-- Sensor data streams (high-frequency data)
CREATE TABLE sensor_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  sensor_type TEXT NOT NULL CHECK (sensor_type IN ('wrist', 'elbow', 'shoulder')),
  data JSONB NOT NULL -- {accel: {x,y,z}, gyro: {x,y,z}, quaternion: {w,x,y,z}, battery: number}
);

-- AI feedback for each set
CREATE TABLE ai_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exercise_set_id UUID NOT NULL REFERENCES exercise_sets(id) ON DELETE CASCADE,
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('safety', 'technique', 'encouragement')),
  message TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_workouts_user_id ON workouts(user_id);
CREATE INDEX idx_workouts_started_at ON workouts(started_at DESC);
CREATE INDEX idx_exercise_sets_workout_id ON exercise_sets(workout_id);
CREATE INDEX idx_sensor_data_workout_timestamp ON sensor_data(workout_id, timestamp);
CREATE INDEX idx_ai_feedback_exercise_set_id ON ai_feedback(exercise_set_id);

-- Updated at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to profiles
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensor_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_feedback ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Workouts policies
CREATE POLICY "Users can view own workouts" ON workouts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workouts" ON workouts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workouts" ON workouts
  FOR UPDATE USING (auth.uid() = user_id);

-- Exercise sets policies
CREATE POLICY "Users can view own exercise sets" ON exercise_sets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workouts 
      WHERE workouts.id = exercise_sets.workout_id 
      AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own exercise sets" ON exercise_sets
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM workouts 
      WHERE workouts.id = exercise_sets.workout_id 
      AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own exercise sets" ON exercise_sets
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM workouts 
      WHERE workouts.id = exercise_sets.workout_id 
      AND workouts.user_id = auth.uid()
    )
  );

-- Sensor data policies
CREATE POLICY "Users can view own sensor data" ON sensor_data
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workouts 
      WHERE workouts.id = sensor_data.workout_id 
      AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own sensor data" ON sensor_data
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM workouts 
      WHERE workouts.id = sensor_data.workout_id 
      AND workouts.user_id = auth.uid()
    )
  );

-- AI feedback policies
CREATE POLICY "Users can view own ai feedback" ON ai_feedback
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM exercise_sets es
      JOIN workouts w ON w.id = es.workout_id
      WHERE es.id = ai_feedback.exercise_set_id 
      AND w.user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert ai feedback" ON ai_feedback
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM exercise_sets es
      JOIN workouts w ON w.id = es.workout_id
      WHERE es.id = ai_feedback.exercise_set_id 
      AND w.user_id = auth.uid()
    )
  );

-- Function to handle user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, created_at)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', 'New User'), NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();