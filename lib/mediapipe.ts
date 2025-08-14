// React Native compatible pose detection types and utilities
// This replaces MediaPipe web APIs with React Native compatible implementations

export const POSE_LANDMARKS = {
  NOSE: 0,
  LEFT_EYE: 2,
  RIGHT_EYE: 5,
  LEFT_EAR: 7,
  RIGHT_EAR: 8,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
};

export interface PoseLandmark {
  x: number;
  y: number;
  z: number;
  visibility: number;
}

export interface PoseData {
  timestamp: number;
  landmarks: PoseLandmark[];
  angles: {
    leftElbow: number;
    rightElbow: number;
    leftShoulder: number;
    rightShoulder: number;
    leftWrist: number;
    rightWrist: number;
    leftKnee: number;
    rightKnee: number;
  };
  confidence: number;
  worldLandmarks?: PoseLandmark[];
}

export interface PoseDetectionConfig {
  modelComplexity: 0 | 1 | 2;
  smoothLandmarks: boolean;
  enableSegmentation: boolean;
  smoothSegmentation: boolean;
  minDetectionConfidence: number;
  minTrackingConfidence: number;
}

// React Native compatible pose detection service
export class PoseDetectionService {
  private isInitialized = false;
  private onResults: ((results: PoseData) => void) | null = null;

  constructor(
    private config: PoseDetectionConfig = {
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      smoothSegmentation: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    }
  ) {}

  async initialize(): Promise<void> {
    // TODO: Initialize TensorFlow Lite model for React Native
    // For now, mark as initialized for mock data generation
    this.isInitialized = true;
    console.log('Pose detection service initialized (mock mode)');
  }

  start(): void {
    if (this.isInitialized) {
      console.log('Pose detection started');
      // TODO: Start actual pose detection
    }
  }

  stop(): void {
    console.log('Pose detection stopped');
    // TODO: Stop actual pose detection
  }

  setOnResults(callback: (results: PoseData) => void): void {
    this.onResults = callback;
  }

  // Mock pose detection for development
  generateMockPoseData(): PoseData {
    const landmarks: PoseLandmark[] = new Array(33).fill(null).map((_, index) => {
      let x = 0.5, y = 0.5, z = 0;
      
      switch (index) {
        case POSE_LANDMARKS.NOSE:
          x = 0.5; y = 0.2; break;
        case POSE_LANDMARKS.LEFT_SHOULDER:
          x = 0.4; y = 0.3; break;
        case POSE_LANDMARKS.RIGHT_SHOULDER:
          x = 0.6; y = 0.3; break;
        case POSE_LANDMARKS.LEFT_ELBOW:
          x = 0.35; y = 0.5; break;
        case POSE_LANDMARKS.RIGHT_ELBOW:
          x = 0.65; y = 0.5; break;
        case POSE_LANDMARKS.LEFT_WRIST:
          x = 0.3; y = 0.7; break;
        case POSE_LANDMARKS.RIGHT_WRIST:
          x = 0.7; y = 0.7; break;
        default:
          x = 0.5 + (Math.random() - 0.5) * 0.1;
          y = 0.5 + (Math.random() - 0.5) * 0.1;
      }

      return {
        x: Math.max(0, Math.min(1, x + (Math.random() - 0.5) * 0.02)),
        y: Math.max(0, Math.min(1, y + (Math.random() - 0.5) * 0.02)),
        z: (Math.random() - 0.5) * 0.1,
        visibility: Math.random() * 0.3 + 0.7,
      };
    });

    return {
      timestamp: Date.now(),
      landmarks,
      angles: this.calculateAngles(landmarks),
      confidence: 0.85 + Math.random() * 0.1, // Mock confidence 0.85-0.95
    };
  }

  private calculateAngles(landmarks: PoseLandmark[]): PoseData['angles'] {
    return {
      leftElbow: this.calculateAngle(
        landmarks[POSE_LANDMARKS.LEFT_SHOULDER],
        landmarks[POSE_LANDMARKS.LEFT_ELBOW],
        landmarks[POSE_LANDMARKS.LEFT_WRIST]
      ),
      rightElbow: this.calculateAngle(
        landmarks[POSE_LANDMARKS.RIGHT_SHOULDER],
        landmarks[POSE_LANDMARKS.RIGHT_ELBOW],
        landmarks[POSE_LANDMARKS.RIGHT_WRIST]
      ),
      leftShoulder: this.calculateAngle(
        landmarks[POSE_LANDMARKS.LEFT_HIP],
        landmarks[POSE_LANDMARKS.LEFT_SHOULDER],
        landmarks[POSE_LANDMARKS.LEFT_ELBOW]
      ),
      rightShoulder: this.calculateAngle(
        landmarks[POSE_LANDMARKS.RIGHT_HIP],
        landmarks[POSE_LANDMARKS.RIGHT_SHOULDER],
        landmarks[POSE_LANDMARKS.RIGHT_ELBOW]
      ),
      leftWrist: 0,
      rightWrist: 0,
      leftKnee: this.calculateAngle(
        landmarks[POSE_LANDMARKS.LEFT_HIP],
        landmarks[POSE_LANDMARKS.LEFT_KNEE],
        landmarks[POSE_LANDMARKS.LEFT_ANKLE]
      ),
      rightKnee: this.calculateAngle(
        landmarks[POSE_LANDMARKS.RIGHT_HIP],
        landmarks[POSE_LANDMARKS.RIGHT_KNEE],
        landmarks[POSE_LANDMARKS.RIGHT_ANKLE]
      ),
    };
  }

  private calculateAngle(point1: PoseLandmark, point2: PoseLandmark, point3: PoseLandmark): number {
    if (!point1 || !point2 || !point3) return 0;

    const vector1 = {
      x: point1.x - point2.x,
      y: point1.y - point2.y,
    };

    const vector2 = {
      x: point3.x - point2.x,
      y: point3.y - point2.y,
    };

    const dotProduct = vector1.x * vector2.x + vector1.y * vector2.y;
    const magnitude1 = Math.sqrt(vector1.x * vector1.x + vector1.y * vector1.y);
    const magnitude2 = Math.sqrt(vector2.x * vector2.x + vector2.y * vector2.y);

    if (magnitude1 === 0 || magnitude2 === 0) return 0;

    const cosAngle = dotProduct / (magnitude1 * magnitude2);
    const angleRad = Math.acos(Math.max(-1, Math.min(1, cosAngle)));
    const angleDeg = (angleRad * 180) / Math.PI;

    return angleDeg;
  }

  destroy(): void {
    this.stop();
    this.isInitialized = false;
  }
}

export default PoseDetectionService;