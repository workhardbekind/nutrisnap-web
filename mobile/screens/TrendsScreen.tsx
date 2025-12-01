import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText, Spacer } from '@/components/ui';

export default function TrendsScreen() {
  return (
    <View style={styles.container}>
      <ThemedText variant="title" style={styles.title}>
        Trends
      </ThemedText>
      <Spacer size={8} />
      <ThemedText>Charts and trends will be available here.</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, padding: 16 }, title: { fontSize: 20, fontWeight: '600', marginBottom: 8 } });
