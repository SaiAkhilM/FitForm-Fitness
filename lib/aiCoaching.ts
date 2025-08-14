import { PoseData } from './poseDetection';
import KnowledgeBaseService from './knowledgeBase';

export interface CoachingFeedback {
  type: 'safety' | 'technique' | 'encouragement' | 'rep_count';
  message: string;
  priority: 'high' | 'medium' | 'low';
  timestamp: number;
  shouldSpeak: boolean;
}

export interface WorkoutAnalysis {
  formScore: number;
  repCount: number;
  phase: 'setup' | 'execution' | 'completion' | 'rest';
  feedback: CoachingFeedback[];
  improvements: string[];
}

export interface ExerciseContext {
  exerciseType: string;
  currentSet: number;
  totalReps: number;
  userLevel: string;
  previousFormScores: number[];
}

export class AICoachingService {
  private claudeApiKey: string;
  private lastFeedbackTime = 0;
  private feedbackCooldown = 3000; // 3 seconds minimum between voice feedback
  private repDetectionBuffer: number[] = [];
  private lastRepTime = 0;
  private knowledgeBase: KnowledgeBaseService;

  constructor() {
    this.claudeApiKey = process.env.EXPO_PUBLIC_CLAUDE_API_KEY || '';
    if (!this.claudeApiKey) {
      console.warn('Claude API key not found. AI coaching will use mock responses.');
    }
    this.knowledgeBase = new KnowledgeBaseService();
  }

  async analyzeWorkout(
    poseData: PoseData,
    context: ExerciseContext,
    sensorData?: any
  ): Promise<WorkoutAnalysis> {
    try {
      // For now, use enhanced rule-based analysis
      // TODO: Replace with actual Claude API calls for production
      return this.analyzePoseWithRules(poseData, context);
    } catch (error) {
      console.error('AI coaching analysis error:', error);
      return this.getFallbackAnalysis(poseData, context);
    }
  }

  private async analyzePoseWithClaude(
    poseData: PoseData,
    context: ExerciseContext
  ): Promise<WorkoutAnalysis> {
    if (!this.claudeApiKey) {
      throw new Error('Claude API key not available');
    }

    const prompt = this.buildAnalysisPrompt(poseData, context);

    try {
      // TODO: Implement actual Claude API call
      // This would be an HTTP request to Anthropic's API
      const response = await this.callClaudeAPI(prompt);
      return this.parseClaudeResponse(response);
    } catch (error) {
      console.error('Claude API error:', error);
      throw error;
    }
  }

  private async callClaudeAPI(prompt: string): Promise<any> {
    // TODO: Implement actual Claude API integration
    // For now, return mock response
    return {
      analysis: {
        formScore: 85,
        phase: 'execution',
        feedback: ['Good form overall', 'Keep your core engaged'],
        repDetected: false,
      }
    };
  }

  private buildAnalysisPrompt(poseData: PoseData, context: ExerciseContext): string {
    return `
    You are an expert personal trainer analyzing exercise form in real-time. 
    
    Exercise: ${context.exerciseType}
    User Level: ${context.userLevel}
    Current Set: ${context.currentSet}
    
    Pose Data:
    - Left Elbow Angle: ${poseData.angles.leftElbow.toFixed(1)}°
    - Right Elbow Angle: ${poseData.angles.rightElbow.toFixed(1)}°
    - Left Shoulder Angle: ${poseData.angles.leftShoulder.toFixed(1)}°
    - Right Shoulder Angle: ${poseData.angles.rightShoulder.toFixed(1)}°
    - Pose Confidence: ${poseData.confidence.toFixed(2)}
    
    Analyze the form and provide:
    1. Form score (0-100)
    2. Current exercise phase (setup/execution/completion/rest)
    3. Immediate feedback (max 2 items)
    4. Whether a rep was just completed
    5. Priority level for any corrections
    
    Keep feedback concise and encouraging. Focus on the most important correction first.
    `;
  }

  private parseClaudeResponse(response: any): WorkoutAnalysis {
    // TODO: Parse actual Claude response format
    return {
      formScore: response.analysis.formScore || 85,
      repCount: 0,
      phase: response.analysis.phase || 'execution',
      feedback: [
        {
          type: 'technique',
          message: 'Great form! Keep it consistent.',
          priority: 'low',
          timestamp: Date.now(),
          shouldSpeak: false,
        }
      ],
      improvements: response.analysis.feedback || [],
    };
  }

  private analyzePoseWithRules(
    poseData: PoseData,
    context: ExerciseContext
  ): Promise<WorkoutAnalysis> {
    return new Promise((resolve) => {
      // Use knowledge base for enhanced analysis
      const knowledgeAnalysis = this.knowledgeBase.analyzeFormWithKnowledge(
        context.exerciseType,
        poseData,
        this.determineExercisePhase(poseData, context.exerciseType)
      );

      const analysis: WorkoutAnalysis = {
        formScore: knowledgeAnalysis.score,
        repCount: this.detectRep(poseData, context.exerciseType),
        phase: this.determineExercisePhase(poseData, context.exerciseType),
        feedback: [],
        improvements: knowledgeAnalysis.feedback,
      };

      // Convert knowledge base feedback to coaching feedback
      knowledgeAnalysis.mistakes.forEach(mistake => {
        analysis.feedback.push({
          type: mistake.riskLevel === 'high' ? 'safety' : 'technique',
          message: mistake.correction,
          priority: mistake.riskLevel === 'high' ? 'high' : 'medium',
          timestamp: Date.now(),
          shouldSpeak: mistake.riskLevel === 'high' && this.shouldProvideSpeechFeedback(),
        });
      });

      // Add encouraging feedback for good form
      if (knowledgeAnalysis.score > 85) {
        analysis.feedback.push({
          type: 'encouragement',
          message: 'Excellent form!',
          priority: 'low',
          timestamp: Date.now(),
          shouldSpeak: false,
        });
      }

      // Generate real-time feedback with knowledge base cues
      this.generateRealtimeFeedback(poseData, analysis, context, knowledgeAnalysis.cues);

      resolve(analysis);
    });
  }

  private analyzeOverheadPress(
    poseData: PoseData,
    analysis: WorkoutAnalysis,
    context: ExerciseContext
  ): void {
    const { angles } = poseData;
    let score = 100;

    // Check elbow positioning
    if (angles.leftElbow < 90 || angles.rightElbow < 90) {
      score -= 20;
      analysis.feedback.push({
        type: 'safety',
        message: 'Keep elbows at 90° or higher',
        priority: 'high',
        timestamp: Date.now(),
        shouldSpeak: this.shouldProvideSpeechFeedback(),
      });
    }

    // Check shoulder symmetry
    const shoulderDiff = Math.abs(angles.leftShoulder - angles.rightShoulder);
    if (shoulderDiff > 15) {
      score -= 10;
      analysis.feedback.push({
        type: 'technique',
        message: 'Keep shoulders level',
        priority: 'medium',
        timestamp: Date.now(),
        shouldSpeak: false,
      });
    }

    // Positive reinforcement for good form
    if (angles.leftElbow > 140 && angles.rightElbow > 140) {
      analysis.feedback.push({
        type: 'encouragement',
        message: 'Excellent full extension!',
        priority: 'low',
        timestamp: Date.now(),
        shouldSpeak: false,
      });
    }

    analysis.formScore = Math.max(0, score);
    analysis.improvements = this.generateImprovements('overhead-press', poseData);
  }

  private analyzeTennisServe(
    poseData: PoseData,
    analysis: WorkoutAnalysis,
    context: ExerciseContext
  ): void {
    // Simplified tennis serve analysis
    analysis.formScore = 88;
    analysis.feedback.push({
      type: 'technique',
      message: 'Good shoulder rotation',
      priority: 'medium',
      timestamp: Date.now(),
      shouldSpeak: false,
    });
  }

  private analyzeBoxingCombo(
    poseData: PoseData,
    analysis: WorkoutAnalysis,
    context: ExerciseContext
  ): void {
    // Simplified boxing combo analysis
    analysis.formScore = 82;
    analysis.feedback.push({
      type: 'technique',
      message: 'Keep your guard up',
      priority: 'medium',
      timestamp: Date.now(),
      shouldSpeak: false,
    });
  }

  private determineExercisePhase(poseData: PoseData, exerciseType: string): 'setup' | 'execution' | 'completion' | 'rest' {
    // Simple phase detection based on movement
    const { angles } = poseData;

    switch (exerciseType) {
      case 'overhead-press':
        if (angles.leftElbow < 100 && angles.rightElbow < 100) {
          return 'setup';
        } else if (angles.leftElbow > 160 && angles.rightElbow > 160) {
          return 'completion';
        } else {
          return 'execution';
        }
      default:
        return 'execution';
    }
  }

  private detectRep(poseData: PoseData, exerciseType: string): number {
    const now = Date.now();
    
    // Prevent multiple rep counts within short timeframe
    if (now - this.lastRepTime < 1000) return 0;

    const { angles } = poseData;
    let repDetected = false;

    switch (exerciseType) {
      case 'overhead-press':
        // Rep completed when both arms are fully extended
        repDetected = angles.leftElbow > 160 && angles.rightElbow > 160;
        break;
      default:
        // Generic rep detection
        repDetected = Math.random() > 0.98; // Occasionally detect rep for demo
    }

    if (repDetected) {
      this.lastRepTime = now;
      return 1;
    }

    return 0;
  }

  private generateRealtimeFeedback(
    poseData: PoseData,
    analysis: WorkoutAnalysis,
    context: ExerciseContext,
    knowledgeCues: string[] = []
  ): void {
    // Add rep count feedback
    if (analysis.repCount > 0) {
      analysis.feedback.push({
        type: 'rep_count',
        message: `Rep ${context.totalReps + analysis.repCount} complete!`,
        priority: 'medium',
        timestamp: Date.now(),
        shouldSpeak: true,
      });
    }

    // Add knowledge-based cues
    knowledgeCues.forEach(cue => {
      analysis.feedback.push({
        type: 'technique',
        message: cue,
        priority: 'medium',
        timestamp: Date.now(),
        shouldSpeak: this.shouldProvideSpeechFeedback(),
      });
    });

    // Add phase-specific guidance using knowledge base
    const phaseCues = this.knowledgeBase.getRealTimeCues(
      context.exerciseType, 
      analysis.formScore > 80 ? 'minor' : analysis.formScore > 60 ? 'important' : 'critical'
    );
    
    phaseCues.forEach(cue => {
      analysis.feedback.push({
        type: 'technique',
        message: cue,
        priority: analysis.formScore > 60 ? 'medium' : 'high',
        timestamp: Date.now(),
        shouldSpeak: analysis.formScore < 60 && this.shouldProvideSpeechFeedback(),
      });
    });
  }

  private shouldProvideSpeechFeedback(): boolean {
    const now = Date.now();
    if (now - this.lastFeedbackTime > this.feedbackCooldown) {
      this.lastFeedbackTime = now;
      return true;
    }
    return false;
  }

  private generateImprovements(exerciseType: string, poseData: PoseData): string[] {
    const improvements: string[] = [];

    switch (exerciseType) {
      case 'overhead-press':
        improvements.push('Focus on controlled movement');
        improvements.push('Keep core engaged throughout');
        improvements.push('Breathe out on the press up');
        break;
      case 'tennis-serve':
        improvements.push('Work on consistent ball toss');
        improvements.push('Increase shoulder rotation');
        break;
      case 'boxing-combo':
        improvements.push('Snap punches back quickly');
        improvements.push('Keep feet planted');
        break;
    }

    return improvements.slice(0, 2); // Return max 2 improvements
  }

  private getFallbackAnalysis(poseData: PoseData, context: ExerciseContext): WorkoutAnalysis {
    return {
      formScore: 80,
      repCount: 0,
      phase: 'execution',
      feedback: [
        {
          type: 'technique',
          message: 'Keep up the good work!',
          priority: 'low',
          timestamp: Date.now(),
          shouldSpeak: false,
        }
      ],
      improvements: ['Focus on form', 'Stay consistent'],
    };
  }
}

export default AICoachingService;