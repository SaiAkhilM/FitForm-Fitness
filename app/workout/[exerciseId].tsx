import React, { useState, useEffect, useRef, useCallback } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Camera, X, RotateCw, Play, Pause, Check } from "lucide-react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useWorkout } from "@/providers/WorkoutProvider";
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';



export default function WorkoutScreen() {
  const { exerciseId } = useLocalSearchParams();
  const router = useRouter();
  const { startWorkout, endWorkout, updateWorkoutData } = useWorkout();
  const [facing, setFacing] = useState<CameraType>('front');
  const [permission, requestPermission] = useCameraPermissions();
  const [isRecording, setIsRecording] = useState(false);
  const [reps, setReps] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [formScore] = useState(85);
  const [elapsedTime, setElapsedTime] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const initializeWorkout = useCallback(() => {
    startWorkout(exerciseId as string);
  }, [exerciseId, startWorkout]);

  useEffect(() => {
    initializeWorkout();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
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

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      // Simulate rep counting
      setTimeout(() => setReps(prev => prev + 1), 2000);
      setTimeout(() => setReps(prev => prev + 1), 4000);
      setTimeout(() => setReps(prev => prev + 1), 6000);
    }
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const handleFinishSet = () => {
    updateWorkoutData({
      sets: currentSet,
      totalReps: reps,
      averageFormScore: formScore,
      duration: elapsedTime,
    });
    setCurrentSet(prev => prev + 1);
    setReps(0);
    setIsRecording(false);
  };

  const handleEndWorkout = async () => {
    await endWorkout();
    router.replace('/workout-summary');
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
      <CameraView style={styles.camera} facing={facing}>
        {/* Overlay UI */}
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

          {/* Pose Overlay Placeholder */}
          <View style={styles.poseOverlay}>
            <Text style={styles.poseOverlayText}>Pose tracking overlay</Text>
          </View>

          {/* Bottom Controls */}
          <View style={styles.bottomControls}>
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
              <View style={styles.recordingIndicator}>
                <View style={styles.recordingDot} />
                <Text style={styles.recordingText}>Recording</Text>
              </View>
            )}
          </View>
        </SafeAreaView>
      </CameraView>
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
    flex: 1,
    backgroundColor: 'transparent',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
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
  bottomControls: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    marginBottom: 20,
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
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 20,
    gap: 8,
  },
  finishSetText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    position: 'absolute',
    bottom: 110,
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