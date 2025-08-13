import React from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Trophy, TrendingUp, Clock, Award, Home, RotateCcw } from "lucide-react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useWorkout } from "@/providers/WorkoutProvider";

export default function WorkoutSummaryScreen() {
  const router = useRouter();
  const { currentWorkout } = useWorkout();

  const handleGoHome = () => {
    router.replace('/(tabs)');
  };

  const handleDoAnother = () => {
    router.replace('/(tabs)/exercises');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0A0A0A', '#1C1C1E']}
        style={StyleSheet.absoluteFillObject}
      />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Success Header */}
          <View style={styles.header}>
            <View style={styles.trophyContainer}>
              <LinearGradient
                colors={['#FFD700', '#FFA500']}
                style={styles.trophyGradient}
              >
                <Trophy size={48} color="#FFFFFF" />
              </LinearGradient>
            </View>
            <Text style={styles.title}>Workout Complete!</Text>
            <Text style={styles.subtitle}>Great job on your training session</Text>
          </View>

          {/* Overall Score */}
          <View style={styles.scoreCard}>
            <LinearGradient
              colors={['#34C759', '#30D158']}
              style={styles.scoreGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.scoreLabel}>Form Score</Text>
              <Text style={styles.scoreValue}>{currentWorkout?.averageFormScore || 85}%</Text>
              <Text style={styles.scoreMessage}>Excellent form!</Text>
            </LinearGradient>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Clock size={24} color="#007AFF" />
              <Text style={styles.statValue}>
                {Math.floor((currentWorkout?.duration || 0) / 60)}:{((currentWorkout?.duration || 0) % 60).toString().padStart(2, '0')}
              </Text>
              <Text style={styles.statLabel}>Duration</Text>
            </View>
            <View style={styles.statCard}>
              <TrendingUp size={24} color="#FF6B35" />
              <Text style={styles.statValue}>{currentWorkout?.sets || 3}</Text>
              <Text style={styles.statLabel}>Sets</Text>
            </View>
            <View style={styles.statCard}>
              <Award size={24} color="#AF52DE" />
              <Text style={styles.statValue}>{currentWorkout?.totalReps || 30}</Text>
              <Text style={styles.statLabel}>Total Reps</Text>
            </View>
          </View>

          {/* Feedback Section */}
          <View style={styles.feedbackSection}>
            <Text style={styles.feedbackTitle}>Coach Feedback</Text>
            <View style={styles.feedbackCard}>
              <Text style={styles.feedbackText}>
                ✅ Great control throughout the movement
              </Text>
            </View>
            <View style={styles.feedbackCard}>
              <Text style={styles.feedbackText}>
                ⚡ Try to maintain a more consistent tempo
              </Text>
            </View>
            <View style={styles.feedbackCard}>
              <Text style={styles.feedbackText}>
                💪 Your form improved in the last set
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.secondaryButton} onPress={handleDoAnother}>
              <RotateCcw size={20} color="#007AFF" />
              <Text style={styles.secondaryButtonText}>Do Another</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.primaryButton} onPress={handleGoHome}>
              <LinearGradient
                colors={['#007AFF', '#0051D5']}
                style={styles.primaryButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Home size={20} color="#FFFFFF" />
                <Text style={styles.primaryButtonText}>Go Home</Text>
              </LinearGradient>
            </TouchableOpacity>
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
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 32,
  },
  trophyContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    marginBottom: 20,
  },
  trophyGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
  },
  scoreCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },
  scoreGradient: {
    padding: 24,
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  scoreMessage: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
  },
  feedbackSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  feedbackTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  feedbackCard: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  feedbackText: {
    fontSize: 15,
    color: '#FFFFFF',
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  primaryButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});