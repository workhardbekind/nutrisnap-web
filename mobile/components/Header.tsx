import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Logo from './Logo';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function Header() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  return (
    <View style={[styles.header, { backgroundColor: theme.background, borderBottomColor: '#eee' }]}>
      <View style={styles.brand}>
        <Logo width={36} height={36} />
        <Text style={[styles.title, { color: theme.text, fontFamily: (Fonts as any)[colorScheme]?.sans }]}>NutriSnap</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: 12, paddingBottom: 12, paddingHorizontal: 16, borderBottomWidth: 1 },
  brand: { flexDirection: 'row', alignItems: 'center' },
  logo: { width: 36, height: 36, marginRight: 10 },
  logoPlaceholder: { width: 36, height: 36, marginRight: 10, backgroundColor: '#ddd', borderRadius: 6 },
  title: { fontSize: 18, fontWeight: '700' },
});
