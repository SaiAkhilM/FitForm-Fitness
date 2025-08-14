import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Circle, Line, G } from 'react-native-svg';
import { PoseData, POSE_LANDMARKS } from '@/lib/poseDetection';
import PoseDetectionService from '@/lib/mediapipe';

interface PoseOverlayProps {
  width: number;
  height: number;
  isActive: boolean;
  exerciseType: string;
  onPoseDetected?: (poseData: PoseData) => void;
  onFormAnalysis?: (analysis: any) => void;
}

// Pose connection pairs for skeleton drawing
const POSE_CONNECTIONS = [
  // Face
  [POSE_LANDMARKS.LEFT_EAR, POSE_LANDMARKS.LEFT_EYE],
  [POSE_LANDMARKS.LEFT_EYE, POSE_LANDMARKS.NOSE],
  [POSE_LANDMARKS.NOSE, POSE_LANDMARKS.RIGHT_EYE],
  [POSE_LANDMARKS.RIGHT_EYE, POSE_LANDMARKS.RIGHT_EAR],
  
  // Torso
  [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.RIGHT_SHOULDER],
  [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_HIP],
  [POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_HIP],
  [POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.RIGHT_HIP],
  
  // Left arm
  [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_ELBOW],
  [POSE_LANDMARKS.LEFT_ELBOW, POSE_LANDMARKS.LEFT_WRIST],
  
  // Right arm
  [POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_ELBOW],
  [POSE_LANDMARKS.RIGHT_ELBOW, POSE_LANDMARKS.RIGHT_WRIST],
  
  // Left leg
  [POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.LEFT_KNEE],
  [POSE_LANDMARKS.LEFT_KNEE, POSE_LANDMARKS.LEFT_ANKLE],
  
  // Right leg
  [POSE_LANDMARKS.RIGHT_HIP, POSE_LANDMARKS.RIGHT_KNEE],
  [POSE_LANDMARKS.RIGHT_KNEE, POSE_LANDMARKS.RIGHT_ANKLE],
];

export default function PoseOverlay({
  width,
  height,
  isActive,
  exerciseType,
  onPoseDetected,
  onFormAnalysis,
}: PoseOverlayProps) {
  const [poseData, setPoseData] = useState<PoseData | null>(null);
  const poseService = useRef(new PoseDetectionService());
  const detectionInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const initializePoseDetection = async () => {
      if (isActive) {
        // Initialize pose detection service
        await poseService.current.initialize();
        
        // Start pose detection simulation
        detectionInterval.current = setInterval(() => {
          // Generate mock pose data for development
          const mockPose = poseService.current.generateMockPoseData();
          
          if (mockPose) {
            setPoseData(mockPose);
            onPoseDetected?.(mockPose);

            // Simple form analysis placeholder
            const mockAnalysis = {
              score: 80 + Math.random() * 15,
              corrections: [
                { type: 'minor', message: 'Good form!' }
              ]
            };
            onFormAnalysis?.(mockAnalysis);
          }
        }, 100); // 10 FPS pose detection
      } else {
        if (detectionInterval.current) {
          clearInterval(detectionInterval.current);
          detectionInterval.current = null;
        }
        setPoseData(null);
      }
    };

    initializePoseDetection();

    return () => {
      if (detectionInterval.current) {
        clearInterval(detectionInterval.current);
      }
    };
  }, [isActive, exerciseType, width, height, onPoseDetected, onFormAnalysis]);

  if (!isActive || !poseData) {
    return null;
  }

  const renderPoseSkeleton = () => {
    return (
      <Svg width={width} height={height} style={StyleSheet.absoluteFillObject}>
        <G opacity={0.8}>
          {/* Render connections */}
          {POSE_CONNECTIONS.map(([startIdx, endIdx], index) => {
            const startPoint = poseData.landmarks[startIdx];
            const endPoint = poseData.landmarks[endIdx];
            
            if (!startPoint || !endPoint || 
                startPoint.visibility < 0.5 || endPoint.visibility < 0.5) {
              return null;
            }

            return (
              <Line
                key={`connection-${index}`}
                x1={startPoint.x * width}
                y1={startPoint.y * height}
                x2={endPoint.x * width}
                y2={endPoint.y * height}
                stroke="#00FF88"
                strokeWidth={2}
              />
            );
          })}
          
          {/* Render landmarks */}
          {poseData.landmarks.map((landmark, index) => {
            if (landmark.visibility < 0.5) return null;
            
            // Use different colors for different body parts
            let color = '#00D4FF';
            if (index >= POSE_LANDMARKS.LEFT_SHOULDER && index <= POSE_LANDMARKS.RIGHT_WRIST) {
              color = '#FF6B35'; // Arms
            } else if (index >= POSE_LANDMARKS.LEFT_HIP && index <= POSE_LANDMARKS.RIGHT_ANKLE) {
              color = '#34C759'; // Legs
            }

            return (
              <Circle
                key={`landmark-${index}`}
                cx={landmark.x * width}
                cy={landmark.y * height}
                r={4}
                fill={color}
                stroke="#FFFFFF"
                strokeWidth={1}
              />
            );
          })}
        </G>
      </Svg>
    );
  };

  return (
    <View style={[styles.container, { width, height }]} pointerEvents="none">
      {renderPoseSkeleton()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 10,
  },
});