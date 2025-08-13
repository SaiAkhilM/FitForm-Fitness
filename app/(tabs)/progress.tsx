import React from "react";
import { StyleSheet, Text, View, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { TrendingUp, Award, Target, Calendar } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useWorkoutHistory } from "@/providers/WorkoutProvider";



export default function ProgressScreen() {
  const { stats, weeklyProgress } = useWorkoutHistory();

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
            <Text style={styles.title}>Your Progress</Text>
            <Text style={styles.subtitle}>Track your fitness journey</Text>
          </View>

          {/* Achievement Cards */}
          <View style={styles.achievementGrid}>
            <View style={styles.achievementCard}>
              <LinearGradient
                colors={['#007AFF', '#0051D5']}
                style={styles.achievementGradient}
              >
                <Award size={32} color="#FFFFFF" />
                <Text style={styles.achievementValue}>{stats.totalWorkouts}</Text>
                <Text style={styles.achievementLabel}>Total Workouts</Text>
              </LinearGradient>
            </View>
            <View style={styles.achievementCard}>
              <LinearGradient
                colors={['#34C759', '#30D158']}
                style={styles.achievementGradient}
              >
                <Target size={32} color="#FFFFFF" />
                <Text style={styles.achievementValue}>{stats.averageScore}%</Text>
                <Text style={styles.achievementLabel}>Average Form</Text>
              </LinearGradient>
            </View>
          </View>

          {/* Weekly Progress */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Calendar size={20} color="#8E8E93" />
              <Text style={styles.sectionTitle}>This Week</Text>
            </View>
            <View style={styles.weekGrid}>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                const isActive = weeklyProgress[index];
                return (
                  <View key={day} style={styles.dayContainer}>
                    <Text style={styles.dayLabel}>{day}</Text>
                    <View style={[styles.dayCircle, isActive && styles.dayCircleActive]}>
                      {isActive && <View style={styles.dayCircleInner} />}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Form Score Trend */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <TrendingUp size={20} color="#8E8E93" />
              <Text style={styles.sectionTitle}>Form Score Trend</Text>
            </View>
            <View style={styles.chartContainer}>
              <View style={styles.chartPlaceholder}>
                <Text style={styles.chartPlaceholderText}>Chart visualization coming soon</Text>
              </View>
            </View>
          </View>

          {/* Personal Records */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Records</Text>
            <View style={styles.recordCard}>
              <Text style={styles.recordTitle}>Best Form Score</Text>
              <Text style={styles.recordValue}>92%</Text>
              <Text style={styles.recordDate}>Achieved on Dec 15, 2024</Text>
            </View>
            <View style={styles.recordCard}>
              <Text style={styles.recordTitle}>Longest Streak</Text>
              <Text style={styles.recordValue}>7 days</Text>
              <Text style={styles.recordDate}>Nov 20 - Nov 26, 2024</Text>
            </View>
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
  achievementGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  achievementCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  achievementGradient: {
    padding: 20,
    alignItems: 'center',
  },
  achievementValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 12,
  },
  achievementLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  section: {
    marginTop: 32,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  weekGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
  },
  dayContainer: {
    alignItems: 'center',
    gap: 8,
  },
  dayLabel: {
    fontSize: 12,
    color: '#8E8E93',
  },
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3A3A3C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayCircleActive: {
    backgroundColor: '#007AFF',
  },
  dayCircleInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
  },
  chartContainer: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 20,
    height: 200,
  },
  chartPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartPlaceholderText: {
    color: '#6E6E73',
    fontSize: 14,
  },
  recordCard: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  recordTitle: {
    fontSize: 14,
    color: '#8E8E93',
  },
  recordValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 4,
  },
  recordDate: {
    fontSize: 12,
    color: '#6E6E73',
    marginTop: 4,
  },
});