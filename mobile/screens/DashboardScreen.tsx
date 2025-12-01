import React from 'react';
import { SafeAreaView, View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText, Spacer } from '@/components/ui';

export default function DashboardScreen() {
  // auth removed for mobile; no-op UI

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <ThemedText variant="title" style={styles.title}>
          Dashboard
        </ThemedText>

        <>
          <ThemedText variant="subtitle" style={styles.subtitle}>
            Welcome to NutriSnap mobile.
          </ThemedText>
          <Spacer size={8} />
          <TouchableOpacity style={styles.primaryButton} onPress={() => {}} accessibilityRole="button">
            <ThemedText variant="subtitle" style={styles.primaryButtonText}>
              Open settings
            </ThemedText>
          </TouchableOpacity>
        </>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#ffffff' },
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  subtitle: { marginBottom: 12, color: '#333' },
  primaryButton: {
    backgroundColor: '#1e90ff',
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  primaryButtonText: { color: '#fff', fontWeight: '700' },
  secondaryButton: {
    marginTop: 8,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    width: '50%',
  },
  secondaryButtonText: { color: '#333' },
});
