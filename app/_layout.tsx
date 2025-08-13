import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { UserProfileProvider } from "@/providers/UserProfileProvider";
import { WorkoutProvider } from "@/providers/WorkoutProvider";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ 
      headerBackTitle: "Back",
      headerStyle: {
        backgroundColor: '#0A0A0A',
      },
      headerTintColor: '#FFFFFF',
      headerTitleStyle: {
        fontWeight: '600',
      },
    }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="workout/[exerciseId]" options={{ 
        headerShown: false,
        presentation: "fullScreenModal" 
      }} />
      <Stack.Screen name="workout-summary" options={{ 
        title: "Workout Summary",
        headerBackVisible: false,
        gestureEnabled: false
      }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <UserProfileProvider>
          <WorkoutProvider>
            <RootLayoutNav />
          </WorkoutProvider>
        </UserProfileProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}