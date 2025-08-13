import React from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { User, Ruler, Weight, Target, Activity, ChevronRight, LogOut } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUserProfile } from "@/providers/UserProfileProvider";
import { useRouter } from "expo-router";

export default function ProfileScreen() {
  const { profile, clearProfile } = useUserProfile();
  const router = useRouter();

  const handleLogout = () => {
    clearProfile();
    router.replace('/onboarding');
  };

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
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={['#007AFF', '#0051D5']}
                style={styles.avatarGradient}
              >
                <User size={40} color="#FFFFFF" />
              </LinearGradient>
            </View>
            <Text style={styles.userName}>{profile?.name || 'Athlete'}</Text>
            <Text style={styles.userEmail}>Member since {new Date().toLocaleDateString()}</Text>
          </View>

          {/* Profile Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <User size={20} color="#8E8E93" />
                  <Text style={styles.infoLabel}>Age</Text>
                  <Text style={styles.infoValue}>{profile?.age || '-'} years</Text>
                </View>
                <View style={styles.infoItem}>
                  <Ruler size={20} color="#8E8E93" />
                  <Text style={styles.infoLabel}>Height</Text>
                  <Text style={styles.infoValue}>{profile?.height || '-'} cm</Text>
                </View>
              </View>
              <View style={styles.infoDivider} />
              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Weight size={20} color="#8E8E93" />
                  <Text style={styles.infoLabel}>Weight</Text>
                  <Text style={styles.infoValue}>{profile?.weight || '-'} kg</Text>
                </View>
                <View style={styles.infoItem}>
                  <Activity size={20} color="#8E8E93" />
                  <Text style={styles.infoLabel}>Fitness Level</Text>
                  <Text style={styles.infoValue}>{profile?.fitnessLevel || '-'}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Goals */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fitness Goals</Text>
            <View style={styles.goalsCard}>
              <Target size={20} color="#007AFF" />
              <Text style={styles.goalsText}>{profile?.goals || 'No goals set'}</Text>
            </View>
          </View>

          {/* Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Settings</Text>
            
            <TouchableOpacity style={styles.settingRow}>
              <Text style={styles.settingText}>Edit Profile</Text>
              <ChevronRight size={20} color="#8E8E93" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.settingRow}>
              <Text style={styles.settingText}>Notifications</Text>
              <ChevronRight size={20} color="#8E8E93" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.settingRow}>
              <Text style={styles.settingText}>Privacy</Text>
              <ChevronRight size={20} color="#8E8E93" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.settingRow}>
              <Text style={styles.settingText}>About</Text>
              <ChevronRight size={20} color="#8E8E93" />
            </TouchableOpacity>
          </View>

          {/* Logout */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={20} color="#FF3B30" />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
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
    paddingVertical: 32,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    marginBottom: 16,
  },
  avatarGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userEmail: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 20,
  },
  infoRow: {
    flexDirection: 'row',
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: '#8E8E93',
  },
  infoValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  infoDivider: {
    height: 1,
    backgroundColor: '#3A3A3C',
    marginVertical: 16,
  },
  goalsCard: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  goalsText: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 22,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  settingText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
  },
});