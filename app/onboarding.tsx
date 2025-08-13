import React, { useState } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ChevronRight, User, Ruler, Target } from "lucide-react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUserProfile } from "@/providers/UserProfileProvider";

const fitnessLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

export default function OnboardingScreen() {
  const router = useRouter();
  const { saveProfile } = useUserProfile();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    height: '',
    weight: '',
    fitnessLevel: 'Beginner',
    goals: '',
    injuries: '',
  });

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    saveProfile({
      ...formData,
      age: parseInt(formData.age) || 0,
      height: parseInt(formData.height) || 0,
      weight: parseInt(formData.weight) || 0,
    });
    router.replace('/(tabs)');
  };

  const canProceed = () => {
    if (step === 1) return formData.name.length > 0;
    if (step === 2) return formData.age && formData.height && formData.weight;
    return true;
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0A0A0A', '#1C1C1E']}
        style={StyleSheet.absoluteFillObject}
      />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${(step / 3) * 100}%` }]} />
              </View>
              <Text style={styles.stepText}>Step {step} of 3</Text>
            </View>

            {/* Step 1: Basic Info */}
            {step === 1 && (
              <View style={styles.stepContent}>
                <View style={styles.iconContainer}>
                  <User size={48} color="#007AFF" />
                </View>
                <Text style={styles.title}>Welcome to FitForm</Text>
                <Text style={styles.subtitle}>Let&apos;s get to know you better</Text>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>What&apos;s your name?</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your name"
                    placeholderTextColor="#6E6E73"
                    value={formData.name}
                    onChangeText={(text) => setFormData({ ...formData, name: text })}
                    autoFocus
                    testID="name-input"
                  />
                </View>
              </View>
            )}

            {/* Step 2: Physical Stats */}
            {step === 2 && (
              <View style={styles.stepContent}>
                <View style={styles.iconContainer}>
                  <Ruler size={48} color="#007AFF" />
                </View>
                <Text style={styles.title}>Physical Information</Text>
                <Text style={styles.subtitle}>This helps us personalize your experience</Text>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Age</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your age"
                    placeholderTextColor="#6E6E73"
                    value={formData.age}
                    onChangeText={(text) => setFormData({ ...formData, age: text })}
                    keyboardType="numeric"
                    testID="age-input"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Height (cm)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your height"
                    placeholderTextColor="#6E6E73"
                    value={formData.height}
                    onChangeText={(text) => setFormData({ ...formData, height: text })}
                    keyboardType="numeric"
                    testID="height-input"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Weight (kg)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your weight"
                    placeholderTextColor="#6E6E73"
                    value={formData.weight}
                    onChangeText={(text) => setFormData({ ...formData, weight: text })}
                    keyboardType="numeric"
                    testID="weight-input"
                  />
                </View>
              </View>
            )}

            {/* Step 3: Fitness Goals */}
            {step === 3 && (
              <View style={styles.stepContent}>
                <View style={styles.iconContainer}>
                  <Target size={48} color="#007AFF" />
                </View>
                <Text style={styles.title}>Fitness Profile</Text>
                <Text style={styles.subtitle}>Tell us about your fitness journey</Text>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Fitness Level</Text>
                  <View style={styles.levelGrid}>
                    {fitnessLevels.map((level) => (
                      <TouchableOpacity
                        key={level}
                        style={[
                          styles.levelButton,
                          formData.fitnessLevel === level && styles.levelButtonActive
                        ]}
                        onPress={() => setFormData({ ...formData, fitnessLevel: level })}
                      >
                        <Text style={[
                          styles.levelButtonText,
                          formData.fitnessLevel === level && styles.levelButtonTextActive
                        ]}>{level}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Your Goals</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="What do you want to achieve?"
                    placeholderTextColor="#6E6E73"
                    value={formData.goals}
                    onChangeText={(text) => setFormData({ ...formData, goals: text })}
                    multiline
                    numberOfLines={3}
                    testID="goals-input"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Any injuries or limitations? (Optional)</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Let us know about any concerns"
                    placeholderTextColor="#6E6E73"
                    value={formData.injuries}
                    onChangeText={(text) => setFormData({ ...formData, injuries: text })}
                    multiline
                    numberOfLines={2}
                    testID="injuries-input"
                  />
                </View>
              </View>
            )}

            {/* Navigation Buttons */}
            <View style={styles.buttonContainer}>
              {step > 1 && (
                <TouchableOpacity 
                  style={styles.backButton}
                  onPress={() => setStep(step - 1)}
                >
                  <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                style={[styles.nextButton, !canProceed() && styles.nextButtonDisabled]}
                onPress={handleNext}
                disabled={!canProceed()}
              >
                <LinearGradient
                  colors={canProceed() ? ['#007AFF', '#0051D5'] : ['#3A3A3C', '#3A3A3C']}
                  style={styles.nextButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.nextButtonText}>
                    {step === 3 ? 'Get Started' : 'Continue'}
                  </Text>
                  <ChevronRight size={20} color="#FFFFFF" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  progressContainer: {
    paddingTop: 20,
    paddingBottom: 40,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#3A3A3C',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  stepText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 12,
  },
  stepContent: {
    flex: 1,
    alignItems: 'center',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 40,
  },
  inputGroup: {
    width: '100%',
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  levelGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  levelButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  levelButtonActive: {
    backgroundColor: '#007AFF',
  },
  levelButtonText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  levelButtonTextActive: {
    color: '#FFFFFF',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 40,
  },
  backButton: {
    flex: 1,
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  nextButton: {
    flex: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});