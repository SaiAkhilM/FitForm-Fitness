import { PoseData } from './poseDetection';

export interface ExerciseKnowledge {
  name: string;
  overview: string;
  phases: ExercisePhase[];
  commonMistakes: CommonMistake[];
  safetyConsiderations: string[];
  formCriteria: FormCriteria;
  coachingCues: CoachingCues;
}

export interface ExercisePhase {
  name: string;
  duration: string;
  keyPoints: string[];
  idealRanges: {
    [jointAngle: string]: {
      min: number;
      max: number;
      optimal?: number;
    };
  };
}

export interface CommonMistake {
  name: string;
  detection: string;
  riskLevel: 'low' | 'medium' | 'high';
  correction: string;
  cue: string;
}

export interface FormCriteria {
  excellent: { min: number; description: string[] };
  good: { min: number; description: string[] };
  acceptable: { min: number; description: string[] };
  poor: { min: number; description: string[] };
}

export interface CoachingCues {
  beginner: string[];
  intermediate: string[];
  advanced: string[];
  realTime: {
    critical: string[];
    important: string[];
    minor: string[];
  };
}

export class KnowledgeBaseService {
  private exercises: Map<string, ExerciseKnowledge> = new Map();

  constructor() {
    this.loadExerciseKnowledge();
  }

  private loadExerciseKnowledge(): void {
    // Load overhead press knowledge
    this.exercises.set('overhead-press', {
      name: 'Overhead Press',
      overview: 'Fundamental upper body strength exercise targeting shoulders, triceps, and core.',
      phases: [
        {
          name: 'Setup',
          duration: '0-1 seconds',
          keyPoints: ['Feet shoulder-width apart', 'Core engaged', 'Elbows at 90°'],
          idealRanges: {
            leftElbow: { min: 90, max: 100, optimal: 95 },
            rightElbow: { min: 90, max: 100, optimal: 95 },
            leftShoulder: { min: 30, max: 50, optimal: 40 },
            rightShoulder: { min: 30, max: 50, optimal: 40 }
          }
        },
        {
          name: 'Press',
          duration: '1-2 seconds',
          keyPoints: ['Straight bar path', 'Progressive elbow extension', 'Core braced'],
          idealRanges: {
            leftElbow: { min: 100, max: 180, optimal: 140 },
            rightElbow: { min: 100, max: 180, optimal: 140 },
          }
        },
        {
          name: 'Lockout',
          duration: '2-2.5 seconds',
          keyPoints: ['Full extension', 'Shoulders stable', 'Core still engaged'],
          idealRanges: {
            leftElbow: { min: 170, max: 180, optimal: 175 },
            rightElbow: { min: 170, max: 180, optimal: 175 },
          }
        },
        {
          name: 'Descent',
          duration: '2.5-4 seconds',
          keyPoints: ['Controlled lowering', 'Maintain tension', 'Prepare for next rep'],
          idealRanges: {
            leftElbow: { min: 90, max: 180, optimal: 135 },
            rightElbow: { min: 90, max: 180, optimal: 135 },
          }
        }
      ],
      commonMistakes: [
        {
          name: 'Insufficient Elbow Height',
          detection: 'Elbow angle < 90° at start',
          riskLevel: 'high',
          correction: 'Lift your elbows higher',
          cue: 'Elbows up, under the bar'
        },
        {
          name: 'Incomplete Lockout',
          detection: 'Elbow angle < 170° at top',
          riskLevel: 'low',
          correction: 'Full lockout overhead',
          cue: 'Push the ceiling away'
        },
        {
          name: 'Asymmetrical Press',
          detection: 'Left/right elbow difference > 15°',
          riskLevel: 'medium',
          correction: 'Keep both arms even',
          cue: 'Press evenly'
        }
      ],
      safetyConsiderations: [
        'Adequate shoulder mobility required',
        'Warm up shoulders thoroughly',
        'Start with light weight',
        'Stop if shoulder pain occurs'
      ],
      formCriteria: {
        excellent: { min: 90, description: ['Perfect elbow positioning', 'Straight bar path', 'Full ROM'] },
        good: { min: 80, description: ['Minor bar path deviation', 'Good control overall'] },
        acceptable: { min: 70, description: ['Moderate form issues', 'Safe execution'] },
        poor: { min: 60, description: ['Multiple form breaks', 'Safety concerns present'] }
      },
      coachingCues: {
        beginner: ['Feet shoulder-width apart', 'Elbows up and under', 'Press straight up'],
        intermediate: ['Drive through your heels', 'Maintain upper back tightness'],
        advanced: ['Generate power from the ground up', 'Time your breathing'],
        realTime: {
          critical: ['Elbows higher!', 'Core tight!', 'Control the weight!'],
          important: ['Full lockout', 'Even pressure', 'Straight path'],
          minor: ['Good tempo', 'Stay tight', 'Nice control']
        }
      }
    });

    // Load tennis serve knowledge
    this.exercises.set('tennis-serve', {
      name: 'Tennis Serve',
      overview: 'Complex kinetic chain movement combining power, precision, and technique.',
      phases: [
        {
          name: 'Ball Toss',
          duration: '0-1 seconds',
          keyPoints: ['Consistent height', 'Proper placement', 'Smooth release'],
          idealRanges: {
            leftShoulder: { min: 20, max: 40, optimal: 30 },
            rightShoulder: { min: 30, max: 60, optimal: 45 }
          }
        },
        {
          name: 'Loading',
          duration: '1-1.5 seconds',
          keyPoints: ['Shoulder turn', 'Trophy position', 'Core coiled'],
          idealRanges: {
            leftShoulder: { min: 40, max: 80, optimal: 60 },
            rightShoulder: { min: 60, max: 100, optimal: 80 }
          }
        },
        {
          name: 'Acceleration',
          duration: '1.5-1.8 seconds',
          keyPoints: ['Explosive leg drive', 'Hip rotation', 'Shoulder turn'],
          idealRanges: {
            leftElbow: { min: 120, max: 180, optimal: 150 },
            rightElbow: { min: 100, max: 160, optimal: 130 }
          }
        },
        {
          name: 'Contact',
          duration: '1.8-1.9 seconds',
          keyPoints: ['Highest reach point', 'Full extension', 'Clean contact'],
          idealRanges: {
            leftElbow: { min: 170, max: 180, optimal: 175 },
            rightElbow: { min: 170, max: 180, optimal: 175 }
          }
        }
      ],
      commonMistakes: [
        {
          name: 'Low Ball Toss',
          detection: 'Rushed swing timing',
          riskLevel: 'medium',
          correction: 'Toss higher and more consistent',
          cue: 'Let the ball come down to you'
        },
        {
          name: 'Poor Shoulder Rotation',
          detection: 'Limited shoulder turn',
          riskLevel: 'medium',
          correction: 'Turn your shoulders more',
          cue: 'Show your back to your opponent'
        }
      ],
      safetyConsiderations: [
        'Proper warm-up essential',
        'Gradual intensity increase',
        'Watch for shoulder/elbow pain'
      ],
      formCriteria: {
        excellent: { min: 90, description: ['Consistent toss', 'Perfect timing', 'Full rotation'] },
        good: { min: 80, description: ['Minor toss variations', 'Good timing'] },
        acceptable: { min: 70, description: ['Basic technique present', 'Room for improvement'] },
        poor: { min: 60, description: ['Major timing issues', 'Inconsistent execution'] }
      },
      coachingCues: {
        beginner: ['Stand sideways', 'Consistent toss', 'Reach high'],
        intermediate: ['Use your legs', 'Full shoulder turn', 'Accelerate through'],
        advanced: ['Coordinate kinetic chain', 'Generate racquet speed'],
        realTime: {
          critical: ['Toss higher!', 'Turn more!', 'Stay sideways!'],
          important: ['Good extension', 'Nice rotation', 'Follow through'],
          minor: ['Great timing', 'Smooth motion', 'Perfect toss']
        }
      }
    });

    // Load boxing combo knowledge
    this.exercises.set('boxing-combo', {
      name: 'Boxing Combo (Jab-Cross-Hook)',
      overview: 'Fundamental boxing combination developing coordination, power, and defense.',
      phases: [
        {
          name: 'Jab',
          duration: '0-0.3 seconds',
          keyPoints: ['Straight extension', 'Quick snap back', 'Guard maintained'],
          idealRanges: {
            leftElbow: { min: 160, max: 180, optimal: 170 },
            rightElbow: { min: 90, max: 120, optimal: 100 }
          }
        },
        {
          name: 'Cross',
          duration: '0.3-0.6 seconds',
          keyPoints: ['Hip rotation', 'Power from ground', 'Straight line'],
          idealRanges: {
            rightElbow: { min: 160, max: 180, optimal: 170 },
            leftElbow: { min: 90, max: 120, optimal: 100 }
          }
        },
        {
          name: 'Hook',
          duration: '0.6-1.0 seconds',
          keyPoints: ['90° elbow', 'Circular motion', 'Pivot on foot'],
          idealRanges: {
            leftElbow: { min: 80, max: 100, optimal: 90 },
            rightElbow: { min: 90, max: 120, optimal: 100 }
          }
        }
      ],
      commonMistakes: [
        {
          name: 'Dropping Guard',
          detection: 'Hand below chin level',
          riskLevel: 'high',
          correction: 'Keep your hands up',
          cue: 'Protect your face'
        },
        {
          name: 'Overreaching',
          detection: 'Full arm extension on all punches',
          riskLevel: 'medium',
          correction: 'Don\'t overextend',
          cue: 'Punch through, not at'
        }
      ],
      safetyConsiderations: [
        'Always use hand wraps',
        'Proper warm-up required',
        'Focus on technique before power'
      ],
      formCriteria: {
        excellent: { min: 90, description: ['Perfect guard', 'Optimal power', 'Flawless sequence'] },
        good: { min: 80, description: ['Minor guard lapses', 'Good technique'] },
        acceptable: { min: 70, description: ['Moderate flaws', 'Basic competency'] },
        poor: { min: 60, description: ['Major issues', 'Poor power generation'] }
      },
      coachingCues: {
        beginner: ['Hands up', 'Jab straight out', 'Cross with hip rotation'],
        intermediate: ['Coordinate footwork', 'Flow between punches', 'Power from legs'],
        advanced: ['Vary timing', 'Integrate head movement', 'Develop power'],
        realTime: {
          critical: ['Hands up!', 'Don\'t drop guard!', 'Stay balanced!'],
          important: ['Good rotation', 'Sharp punches', 'Nice flow'],
          minor: ['Great combo', 'Perfect timing', 'Excellent form']
        }
      }
    });
  }

  getExerciseKnowledge(exerciseId: string): ExerciseKnowledge | null {
    return this.exercises.get(exerciseId) || null;
  }

  analyzeFormWithKnowledge(
    exerciseId: string,
    poseData: PoseData,
    phase?: string
  ): {
    score: number;
    feedback: string[];
    mistakes: CommonMistake[];
    cues: string[];
  } {
    const knowledge = this.getExerciseKnowledge(exerciseId);
    if (!knowledge) {
      return {
        score: 80,
        feedback: ['Exercise knowledge not available'],
        mistakes: [],
        cues: []
      };
    }

    let score = 100;
    const feedback: string[] = [];
    const detectedMistakes: CommonMistake[] = [];
    const cues: string[] = [];

    // Analyze based on current angles
    const { angles } = poseData;

    // Check for common mistakes
    for (const mistake of knowledge.commonMistakes) {
      if (this.detectMistake(mistake, angles, exerciseId)) {
        detectedMistakes.push(mistake);
        feedback.push(mistake.correction);
        
        // Deduct points based on risk level
        const deduction = mistake.riskLevel === 'high' ? 20 : 
                         mistake.riskLevel === 'medium' ? 10 : 5;
        score -= deduction;

        // Add appropriate cue
        cues.push(mistake.cue);
      }
    }

    // Phase-specific analysis
    if (phase) {
      const phaseKnowledge = knowledge.phases.find(p => p.name.toLowerCase().includes(phase.toLowerCase()));
      if (phaseKnowledge) {
        // Check if angles are within ideal ranges
        for (const [joint, range] of Object.entries(phaseKnowledge.idealRanges)) {
          const currentAngle = (angles as any)[joint];
          if (currentAngle && (currentAngle < range.min || currentAngle > range.max)) {
            score -= 5;
            feedback.push(`Adjust ${joint.replace('left', '').replace('right', '')} position`);
          }
        }
      }
    }

    // Add positive reinforcement for good form
    if (score > 85) {
      feedback.push('Excellent form!');
      cues.push('Keep it up!');
    } else if (score > 75) {
      feedback.push('Good technique, minor adjustments needed');
    }

    return {
      score: Math.max(0, Math.min(100, score)),
      feedback: feedback.slice(0, 3), // Limit feedback
      mistakes: detectedMistakes,
      cues: cues.slice(0, 2) // Limit cues
    };
  }

  private detectMistake(mistake: CommonMistake, angles: PoseData['angles'], exerciseId: string): boolean {
    switch (exerciseId) {
      case 'overhead-press':
        switch (mistake.name) {
          case 'Insufficient Elbow Height':
            return angles.leftElbow < 90 || angles.rightElbow < 90;
          case 'Incomplete Lockout':
            return angles.leftElbow < 170 || angles.rightElbow < 170;
          case 'Asymmetrical Press':
            return Math.abs(angles.leftElbow - angles.rightElbow) > 15;
        }
        break;

      case 'boxing-combo':
        switch (mistake.name) {
          case 'Overreaching':
            return angles.leftElbow > 175 && angles.rightElbow > 175;
          // Add more boxing-specific detection logic
        }
        break;

      case 'tennis-serve':
        switch (mistake.name) {
          case 'Poor Shoulder Rotation':
            return Math.abs(angles.leftShoulder - angles.rightShoulder) < 20;
          // Add more tennis-specific detection logic
        }
        break;
    }

    return false;
  }

  getCoachingCuesForLevel(exerciseId: string, level: 'beginner' | 'intermediate' | 'advanced'): string[] {
    const knowledge = this.getExerciseKnowledge(exerciseId);
    return knowledge?.coachingCues[level] || [];
  }

  getRealTimeCues(exerciseId: string, priority: 'critical' | 'important' | 'minor'): string[] {
    const knowledge = this.getExerciseKnowledge(exerciseId);
    return knowledge?.coachingCues.realTime[priority] || [];
  }

  getFormCriteriaDescription(exerciseId: string, score: number): string[] {
    const knowledge = this.getExerciseKnowledge(exerciseId);
    if (!knowledge) return ['Form analysis not available'];

    const { formCriteria } = knowledge;
    
    if (score >= formCriteria.excellent.min) return formCriteria.excellent.description;
    if (score >= formCriteria.good.min) return formCriteria.good.description;
    if (score >= formCriteria.acceptable.min) return formCriteria.acceptable.description;
    return formCriteria.poor.description;
  }

  getAllExercises(): string[] {
    return Array.from(this.exercises.keys());
  }
}

export default KnowledgeBaseService;