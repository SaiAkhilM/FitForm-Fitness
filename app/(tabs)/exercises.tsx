import React from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ChevronRight, Zap, Target, Dumbbell } from "lucide-react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

const exercises = [
  {
    id: 'tennis-serve',
    name: 'Tennis Serve',
    category: 'Sports',
    difficulty: 'Intermediate',
    duration: '15 min',
    icon: Target,
    gradient: ['#FF6B35', '#F7931E'] as const,
    description: 'Perfect your serve technique with real-time form analysis',
    image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400&h=300&fit=crop',
  },
  {
    id: 'boxing-combo',
    name: 'Boxing Combo',
    category: 'Combat',
    difficulty: 'Beginner',
    duration: '10 min',
    icon: Zap,
    gradient: ['#667EEA', '#764BA2'] as const,
    description: 'Master the jab-cross-hook combination',
    image: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=400&h=300&fit=crop',
  },
  {
    id: 'overhead-press',
    name: 'Overhead Press',
    category: 'Strength',
    difficulty: 'All Levels',
    duration: '12 min',
    icon: Dumbbell,
    gradient: ['#34C759', '#30D158'] as const,
    description: 'Build shoulder strength with perfect form',
    image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&h=300&fit=crop',
  },
];

export default function ExercisesScreen() {
  const router = useRouter();

  const handleExercisePress = (exerciseId: string) => {
    router.push(`/workout/${exerciseId}`);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0A0A0A', '#1C1C1E']}
        style={StyleSheet.absoluteFillObject}
      />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Choose Exercise</Text>
            <Text style={styles.subtitle}>Select an exercise to start tracking your form</Text>
          </View>

          {exercises.map((exercise) => {
            const Icon = exercise.icon;
            return (
              <TouchableOpacity
                key={exercise.id}
                style={styles.exerciseCard}
                onPress={() => handleExercisePress(exercise.id)}
                testID={`exercise-${exercise.id}`}
              >
                <LinearGradient
                  colors={exercise.gradient}
                  style={styles.exerciseGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.exerciseContent}>
                    <View style={styles.exerciseHeader}>
                      <View style={styles.iconContainer}>
                        <Icon size={24} color="#FFFFFF" />
                      </View>
                      <View style={styles.exerciseInfo}>
                        <Text style={styles.exerciseName}>{exercise.name}</Text>
                        <View style={styles.exerciseMeta}>
                          <Text style={styles.exerciseMetaText}>{exercise.category}</Text>
                          <Text style={styles.exerciseMetaDot}>•</Text>
                          <Text style={styles.exerciseMetaText}>{exercise.duration}</Text>
                          <Text style={styles.exerciseMetaDot}>•</Text>
                          <Text style={styles.exerciseMetaText}>{exercise.difficulty}</Text>
                        </View>
                      </View>
                      <ChevronRight size={24} color="#FFFFFF" />
                    </View>
                    <Text style={styles.exerciseDescription}>{exercise.description}</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            );
          })}

          <View style={styles.comingSoon}>
            <Text style={styles.comingSoonTitle}>More Exercises Coming Soon</Text>
            <Text style={styles.comingSoonText}>We&apos;re adding new exercises every week</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 8,
  },
  exerciseCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  exerciseGradient: {
    padding: 20,
  },
  exerciseContent: {
    gap: 12,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  exerciseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  exerciseMetaText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  exerciseMetaDot: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 6,
  },
  exerciseDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
  comingSoon: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  comingSoonTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8E8E93',
  },
  comingSoonText: {
    fontSize: 14,
    color: '#6E6E73',
    marginTop: 8,
  },
});
