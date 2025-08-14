// React Native compatible pose detection service
// This will be a simplified version that can work with camera frames

export interface PoseLandmark {
  x: number; // Normalized [0-1]
  y: number; // Normalized [0-1]
  z: number; // Depth
  visibility: number; // [0-1]
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
}

export interface FormAnalysis {
  score: number; // 0-100
  feedback: string[];
  corrections: {
    type: 'critical' | 'minor' | 'good';
    message: string;
  }[];
}

// Pose landmarks indices (MediaPipe format)
export const POSE_LANDMARKS = {
  NOSE: 0,
  LEFT_EYE_INNER: 1,
  LEFT_EYE: 2,
  LEFT_EYE_OUTER: 3,
  RIGHT_EYE_INNER: 4,
  RIGHT_EYE: 5,
  RIGHT_EYE_OUTER: 6,
  LEFT_EAR: 7,
  RIGHT_EAR: 8,
  MOUTH_LEFT: 9,
  MOUTH_RIGHT: 10,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_PINKY: 17,
  RIGHT_PINKY: 18,
  LEFT_INDEX: 19,
  RIGHT_INDEX: 20,
  LEFT_THUMB: 21,
  RIGHT_THUMB: 22,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
  LEFT_HEEL: 29,
  RIGHT_HEEL: 30,
  LEFT_FOOT_INDEX: 31,
  RIGHT_FOOT_INDEX: 32,
};

export class PoseDetectionService {
  private isProcessing = false;
  private lastProcessTime = 0;
  private readonly minProcessInterval = 33; // ~30 FPS

  constructor() {}

  // Mock pose detection for development
  // In production, this would interface with TensorFlow Lite or similar
  async detectPose(imageData: any, width: number, height: number): Promise<PoseData | null> {
    const now = Date.now();
    
    // Throttle processing to maintain performance
    if (this.isProcessing || (now - this.lastProcessTime) < this.minProcessInterval) {
      return null;
    }

    this.isProcessing = true;
    this.lastProcessTime = now;

    try {
      // Mock pose detection for now
      // TODO: Replace with actual TensorFlow Lite model inference
      const mockLandmarks = this.generateMockLandmarks();
      
      const poseData: PoseData = {
        timestamp: now,
        landmarks: mockLandmarks,
        angles: this.calculateAngles(mockLandmarks),
        confidence: 0.85,
      };

      return poseData;
    } catch (error) {
      console.error('Pose detection error:', error);
      return null;
    } finally {
      this.isProcessing = false;
    }
  }

  private generateMockLandmarks(): PoseLandmark[] {
    // Generate realistic mock landmarks for a standing person
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
        case POSE_LANDMARKS.LEFT_HIP:
          x = 0.45; y = 0.65; break;
        case POSE_LANDMARKS.RIGHT_HIP:
          x = 0.55; y = 0.65; break;
        case POSE_LANDMARKS.LEFT_KNEE:
          x = 0.45; y = 0.8; break;
        case POSE_LANDMARKS.RIGHT_KNEE:
          x = 0.55; y = 0.8; break;
        case POSE_LANDMARKS.LEFT_ANKLE:
          x = 0.45; y = 0.95; break;
        case POSE_LANDMARKS.RIGHT_ANKLE:
          x = 0.55; y = 0.95; break;
        default:
          x = 0.5 + (Math.random() - 0.5) * 0.1;
          y = 0.5 + (Math.random() - 0.5) * 0.1;
      }

      // Add some realistic movement variation
      x += (Math.random() - 0.5) * 0.02;
      y += (Math.random() - 0.5) * 0.02;
      z = (Math.random() - 0.5) * 0.1;

      return {
        x: Math.max(0, Math.min(1, x)),
        y: Math.max(0, Math.min(1, y)),
        z,
        visibility: Math.random() * 0.3 + 0.7, // 0.7-1.0
      };
    });

    return landmarks;
  }

  calculateAngles(landmarks: PoseLandmark[]): PoseData['angles'] {
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
      leftWrist: 0, // Simplified for now
      rightWrist: 0, // Simplified for now
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

    // Calculate vectors
    const vector1 = {
      x: point1.x - point2.x,
      y: point1.y - point2.y,
    };

    const vector2 = {
      x: point3.x - point2.x,
      y: point3.y - point2.y,
    };

    // Calculate dot product
    const dotProduct = vector1.x * vector2.x + vector1.y * vector2.y;

    // Calculate magnitudes
    const magnitude1 = Math.sqrt(vector1.x * vector1.x + vector1.y * vector1.y);
    const magnitude2 = Math.sqrt(vector2.x * vector2.x + vector2.y * vector2.y);

    if (magnitude1 === 0 || magnitude2 === 0) return 0;

    // Calculate angle in radians and convert to degrees
    const cosAngle = dotProduct / (magnitude1 * magnitude2);
    const angleRad = Math.acos(Math.max(-1, Math.min(1, cosAngle)));
    const angleDeg = (angleRad * 180) / Math.PI;

    return angleDeg;
  }

  // Analyze form based on exercise type
  analyzeForm(poseData: PoseData, exerciseType: string): FormAnalysis {
    const { angles } = poseData;
    let score = 100;
    const feedback: string[] = [];
    const corrections: FormAnalysis['corrections'] = [];

    switch (exerciseType) {
      case 'overhead-press':
        return this.analyzeOverheadPress(angles, feedback, corrections, score);
      case 'tennis-serve':
        return this.analyzeTennisServe(angles, feedback, corrections, score);
      case 'boxing-combo':
        return this.analyzeBoxingCombo(angles, feedback, corrections, score);
      default:
        return { score: 85, feedback: ['Form analysis not available for this exercise'], corrections: [] };
    }
  }

  private analyzeOverheadPress(
    angles: PoseData['angles'], 
    feedback: string[], 
    corrections: FormAnalysis['corrections'], 
    score: number
  ): FormAnalysis {
    // Check elbow positioning
    if (angles.leftElbow < 90 || angles.rightElbow < 90) {
      score -= 15;
      corrections.push({
        type: 'critical',
        message: 'Keep your elbows at 90 degrees or higher during the press'
      });
    }

    // Check shoulder alignment
    const shoulderDifference = Math.abs(angles.leftShoulder - angles.rightShoulder);
    if (shoulderDifference > 20) {
      score -= 10;
      corrections.push({
        type: 'minor',
        message: 'Keep your shoulders level and aligned'
      });
    }

    // Good form encouragement
    if (angles.leftElbow > 120 && angles.rightElbow > 120) {
      corrections.push({
        type: 'good',
        message: 'Excellent full range of motion!'
      });
    }

    feedback.push('Focus on controlled movement');
    
    return { score: Math.max(0, score), feedback, corrections };
  }

  private analyzeTennisServe(
    angles: PoseData['angles'], 
    feedback: string[], 
    corrections: FormAnalysis['corrections'], 
    score: number
  ): FormAnalysis {
    // Simplified tennis serve analysis
    feedback.push('Keep your toss consistent');
    feedback.push('Rotate your shoulders fully');
    
    corrections.push({
      type: 'good',
      message: 'Good shoulder rotation!'
    });

    return { score: 88, feedback, corrections };
  }

  private analyzeBoxingCombo(
    angles: PoseData['angles'], 
    feedback: string[], 
    corrections: FormAnalysis['corrections'], 
    score: number
  ): FormAnalysis {
    // Simplified boxing analysis
    feedback.push('Keep your guard up');
    feedback.push('Rotate your hips with each punch');
    
    corrections.push({
      type: 'minor',
      message: 'Remember to snap your punches back quickly'
    });

    return { score: 82, feedback, corrections };
  }
}

export default PoseDetectionService;