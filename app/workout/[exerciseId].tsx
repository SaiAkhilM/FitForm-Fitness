import React, { useState, useEffect, useRef, useCallback } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Camera, X, RotateCw, Play, Pause, Check } from "lucide-react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useWorkout } from "@/providers/WorkoutProvider";
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import PoseOverlay from '@/components/PoseOverlay';
import { PoseData } from '@/lib/poseDetection';
import AICoachingService, { WorkoutAnalysis, ExerciseContext } from '@/lib/aiCoaching';
import VoiceFeedbackService from '@/lib/voiceFeedback';



export default function WorkoutScreen() {
  const { exerciseId } = useLocalSearchParams();
  const router = useRouter();
  const { startWorkout, endWorkout, updateWorkoutData } = useWorkout();
  const [facing, setFacing] = useState<CameraType>('front');
  const [permission, requestPermission] = useCameraPermissions();
  const [isRecording, setIsRecording] = useState(false);
  const [reps, setReps] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [formScore, setFormScore] = useState(85);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentPose, setCurrentPose] = useState<PoseData | null>(null);
  const [recentFeedback, setRecentFeedback] = useState<string[]>([]);
  const [workoutAnalysis, setWorkoutAnalysis] = useState<WorkoutAnalysis | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const aiCoach = useRef(new AICoachingService());
  const voiceService = useRef(new VoiceFeedbackService());
  
  // Debug voice service status
  useEffect(() => {
    const status = voiceService.current.getStatus();
    console.log('Voice service status:', status);
  }, []);
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  const initializeWorkout = useCallback(() => {
    startWorkout(exerciseId as string);
  }, [exerciseId, startWorkout]);

  useEffect(() => {
    initializeWorkout();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      // Clean up services
      voiceService.current?.destroy();
    };
  }, [initializeWorkout]);

  useEffect(() => {
    if (isRecording) {
      intervalRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePoseDetected = useCallback(async (poseData: PoseData) => {
    setCurrentPose(poseData);
    
    // Create exercise context for AI analysis
    const exerciseContext: ExerciseContext = {
      exerciseType: exerciseId as string,
      currentSet,
      totalReps: reps,
      userLevel: 'intermediate', // TODO: Get from user profile
      previousFormScores: [formScore], // TODO: Track historical scores
    };

    try {
      // Get AI analysis
      const analysis = await aiCoach.current.analyzeWorkout(poseData, exerciseContext);
      setWorkoutAnalysis(analysis);
      
      // Update form score
      if (analysis.formScore !== formScore) {
        setFormScore(Math.round(analysis.formScore));
      }
      
      // Update rep count
      if (analysis.repCount > 0) {
        setReps(prev => prev + analysis.repCount);
        // Provide voice feedback for rep completion
        try {
          await voiceService.current.speakCoachingPhrase('rep_complete');
        } catch (error) {
          console.error('Voice feedback error:', error);
        }
      }
      
      // Process feedback
      const visualFeedback = analysis.feedback
        .filter(f => f.type === 'safety' || f.type === 'technique')
        .map(f => f.message)
        .slice(0, 2);
      
      setRecentFeedback(visualFeedback);
      
      // Handle voice feedback
      for (const feedback of analysis.feedback) {
        if (feedback.shouldSpeak) {
          try {
            await voiceService.current.provideFeedback(
              feedback.type === 'safety' ? 'safety' : 
              feedback.type === 'encouragement' ? 'positive' : 'correction',
              feedback.message
            );
          } catch (error) {
            console.error('Voice feedback error:', error);
          }
        }
      }
      
    } catch (error) {
      console.error('AI coaching analysis error:', error);
    }
  }, [exerciseId, currentSet, reps, formScore]);

  const handleFormAnalysis = useCallback((analysis: any) => {
    // This is now handled in handlePoseDetected with AI coaching
    // Keep for backwards compatibility with PoseOverlay
  }, []);

  const toggleRecording = async () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      // Starting workout - provide encouragement
      try {
        await voiceService.current.speakCoachingPhrase('setup_position');
      } catch (error) {
        console.error('Voice feedback error:', error);
      }
    } else {
      // Stopping workout
      setRecentFeedback([]);
      voiceService.current.clearQueue();
    }
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const handleFinishSet = async () => {
    try {
      // Provide positive feedback for completing set
      await voiceService.current.speakCoachingPhrase('finish_strong');
      
      // Update workout data
      updateWorkoutData({
        sets: currentSet,
        totalReps: reps,
        averageFormScore: formScore,
        duration: elapsedTime,
      });
      
      // Reset for next set
      setCurrentSet(prev => prev + 1);
      setReps(0);
      setIsRecording(false);
      setRecentFeedback([]);
      
      // Clear voice queue
      voiceService.current.clearQueue();
    } catch (error) {
      console.error('Error finishing set:', error);
    }
  };

  const handleEndWorkout = async () => {
    try {
      // Stop all voice feedback
      voiceService.current.clearQueue();
      await voiceService.current.stopCurrentSpeech();
      
      // Stop recording if active
      if (isRecording) {
        setIsRecording(false);
      }
      
      // End the workout
      await endWorkout();
      
      // Navigate to summary
      router.replace('/workout-summary');
    } catch (error) {
      console.error('Error ending workout:', error);
      // Still try to navigate even if there's an error
      router.replace('/workout-summary');
    }
  };

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#0A0A0A', '#1C1C1E']}
          style={StyleSheet.absoluteFillObject}
        />
        <SafeAreaView style={styles.permissionContainer}>
          <Camera size={48} color="#8E8E93" />
          <Text style={styles.permissionTitle}>Camera Permission Required</Text>
          <Text style={styles.permissionText}>We need camera access to track your form</Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing} />
      
      {/* Overlay UI - positioned absolutely over camera */}
      <SafeAreaView style={styles.overlay} edges={['top', 'bottom']}>
        {/* Top Bar */}
        <View style={styles.topBar}>
            <TouchableOpacity style={styles.closeButton} onPress={handleEndWorkout}>
              <X size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.timerContainer}>
              <Text style={styles.timerText}>{formatTime(elapsedTime)}</Text>
            </View>
            <TouchableOpacity style={styles.flipButton} onPress={toggleCameraFacing}>
              <RotateCw size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Stats Display */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Set</Text>
              <Text style={styles.statValue}>{currentSet}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Reps</Text>
              <Text style={styles.statValue}>{reps}</Text>
            </View>
            <View style={[styles.statCard, styles.formScoreCard]}>
              <Text style={styles.statLabel}>Form</Text>
              <Text style={[styles.statValue, { color: formScore > 80 ? '#34C759' : '#FF9500' }]}>
                {formScore}%
              </Text>
            </View>
          </View>

          {/* Pose Overlay */}
          <PoseOverlay
            width={screenWidth}
            height={screenHeight}
            isActive={isRecording}
            exerciseType={exerciseId as string}
            onPoseDetected={handlePoseDetected}
            onFormAnalysis={handleFormAnalysis}
          />
          
          {/* Real-time Feedback */}
          {recentFeedback.length > 0 && (
            <View style={styles.feedbackContainer}>
              {recentFeedback.map((feedback, index) => (
                <View key={index} style={styles.feedbackCard}>
                  <Text style={styles.feedbackText}>{feedback}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Bottom Controls */}
          <View style={styles.bottomControls}>
            <View style={styles.controlRow}>
              {isRecording && (
                <TouchableOpacity style={styles.finishSetButton} onPress={handleFinishSet}>
                  <Check size={20} color="#FFFFFF" />
                  <Text style={styles.finishSetText}>Finish Set</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity style={styles.recordButton} onPress={toggleRecording}>
                <LinearGradient
                  colors={isRecording ? ['#FF3B30', '#FF6B6B'] : ['#007AFF', '#0051D5']}
                  style={styles.recordButtonGradient}
                >
                  {isRecording ? (
                    <Pause size={32} color="#FFFFFF" fill="#FFFFFF" />
                  ) : (
                    <Play size={32} color="#FFFFFF" fill="#FFFFFF" />
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {isRecording && (
                <TouchableOpacity style={styles.endWorkoutButton} onPress={handleEndWorkout}>
                  <X size={20} color="#FFFFFF" />
                  <Text style={styles.endWorkoutText}>End</Text>
                </TouchableOpacity>
              )}
            </View>

            {isRecording && (
              <View style={styles.recordingIndicator}>
                <View style={styles.recordingDot} />
                <Text style={styles.recordingText}>Recording</Text>
              </View>
            )}
          </View>
        </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  timerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  flipButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 20,
    gap: 12,
  },
  statCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minWidth: 80,
    alignItems: 'center',
  },
  formScoreCard: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  poseOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  poseOverlayText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.3)',
  },
  feedbackContainer: {
    position: 'absolute',
    top: 120,
    left: 20,
    right: 20,
    zIndex: 20,
  },
  feedbackCard: {
    backgroundColor: 'rgba(255, 107, 53, 0.9)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#FF6B35',
  },
  feedbackText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 300,
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
  },
  recordButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  finishSetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 199, 89, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 6,
  },
  finishSetText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  endWorkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 6,
  },
  endWorkoutText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
  },
  recordingText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 20,
    marginBottom: 8,
  },
  permissionText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 32,
  },
  permissionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});