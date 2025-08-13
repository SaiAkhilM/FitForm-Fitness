import React, { useCallback } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Play, TrendingUp, Award, Clock } from "lucide-react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useUserProfile } from "@/providers/UserProfileProvider";
import { useWorkoutHistory } from "@/providers/WorkoutProvider";
import { SafeAreaView } from "react-native-safe-area-context";



export default function DashboardScreen() {
  const router = useRouter();
  const { profile, isOnboarded, isLoading } = useUserProfile();
  const { recentWorkouts, stats } = useWorkoutHistory();

  useFocusEffect(
    useCallback(() => {
      if (!isLoading && !isOnboarded) {
        router.replace('/onboarding');
      }
    }, [isLoading, isOnboarded, router])
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <LinearGradient
          colors={['#0A0A0A', '#1C1C1E']}
          style={StyleSheet.absoluteFillObject}
        />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!isOnboarded) {
    return null;
  }

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
          {/* Welcome Header */}
          <View style={styles.header}>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{profile?.name || 'Athlete'}</Text>
          </View>

          {/* Quick Start Card */}
          <TouchableOpacity 
            style={styles.quickStartCard}
            onPress={() => router.push('/exercises')}
            testID="quick-start-button"
          >
            <LinearGradient
              colors={['#007AFF', '#0051D5']}
              style={styles.quickStartGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.quickStartContent}>
                <View>
                  <Text style={styles.quickStartTitle}>Start Workout</Text>
                  <Text style={styles.quickStartSubtitle}>Perfect your form today</Text>
                </View>
                <View style={styles.playButton}>
                  <Play size={24} color="#FFFFFF" fill="#FFFFFF" />
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <TrendingUp size={20} color="#34C759" />
              </View>
              <Text style={styles.statValue}>{stats.totalWorkouts}</Text>
              <Text style={styles.statLabel}>Workouts</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Award size={20} color="#FF9500" />
              </View>
              <Text style={styles.statValue}>{stats.averageScore}%</Text>
              <Text style={styles.statLabel}>Avg Form</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Clock size={20} color="#AF52DE" />
              </View>
              <Text style={styles.statValue}>{stats.totalMinutes}</Text>
              <Text style={styles.statLabel}>Minutes</Text>
            </View>
          </View>

          {/* Recent Workouts */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Workouts</Text>
            {recentWorkouts.length > 0 ? (
              recentWorkouts.map((workout, index) => (
                <TouchableOpacity 
                  key={workout.id} 
                  style={styles.workoutCard}
                  testID={`workout-${index}`}
                >
                  <View style={styles.workoutCardContent}>
                    <View style={styles.workoutInfo}>
                      <Text style={styles.workoutName}>{workout.exerciseName}</Text>
                      <Text style={styles.workoutDate}>{workout.date}</Text>
                    </View>
                    <View style={styles.workoutStats}>
                      <View style={styles.formScoreContainer}>
                        <Text style={styles.formScore}>{workout.formScore}%</Text>
                        <Text style={styles.formScoreLabel}>Form</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No workouts yet</Text>
                <Text style={styles.emptyStateSubtext}>Start your first workout to see your history</Text>
              </View>
            )}
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
    paddingBottom: 10,
  },
  greeting: {
    fontSize: 16,
    color: '#8E8E93',
  },
  userName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 4,
  },
  quickStartCard: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  quickStartGradient: {
    padding: 24,
  },
  quickStartContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quickStartTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  quickStartSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
    marginTop: 4,
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
  section: {
    marginTop: 32,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  workoutCard: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  workoutCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  workoutDate: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  workoutStats: {
    alignItems: 'center',
  },
  formScoreContainer: {
    alignItems: 'center',
  },
  formScore: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#34C759',
  },
  formScoreLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#8E8E93',
    fontWeight: '500',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#6E6E73',
    marginTop: 8,
    textAlign: 'center',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
});