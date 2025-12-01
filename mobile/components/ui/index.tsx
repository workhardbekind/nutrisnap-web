import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function Box({ children, style }: { children?: React.ReactNode; style?: any }) {
  return <View style={style}>{children}</View>;
}

export function Spacer({ size = 8 }: { size?: number }) {
  return <View style={{ height: size }} />;
}

export function ThemedText({ children, variant = 'body', style }: { children?: React.ReactNode; variant?: 'title' | 'subtitle' | 'body'; style?: any }) {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const base = { color: colors.text, fontFamily: (Fonts as any)[scheme]?.sans };
  const stylesMap: any = {
    title: { fontSize: 20, fontWeight: '700' },
    subtitle: { fontSize: 16, fontWeight: '600' },
    body: { fontSize: 14 },
  };
  return <Text style={[base, stylesMap[variant], style]}>{children}</Text>;
}

const local = StyleSheet.create({});
