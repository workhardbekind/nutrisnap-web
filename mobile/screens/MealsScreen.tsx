import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, Button, ActivityIndicator } from 'react-native';
import { ThemedText, Spacer } from '@/components/ui';

const BACKEND_BASE = 'https://nutrisnap.workhardbekind.com';

export default function MealsScreen() {
  // no auth on mobile
  const [meals, setMeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const r = await fetch(`${BACKEND_BASE}/api/meals`);
        if (r.ok) {
          setMeals(await r.json());
        } else {
          const text = await r.text().catch(() => null);
          setError(text || `Error ${r.status}`);
        }
      } catch (e: any) {
        console.log('Failed to fetch meals', e);
        setError(e?.message ?? String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <View style={styles.container}>
      <ThemedText variant="title" style={styles.title}>
        Meals
      </ThemedText>
        {loading ? (
        <ActivityIndicator />
      ) : error ? (
        <ThemedText style={{ color: 'red' }}>{error}</ThemedText>
      ) : (
        <FlatList data={meals} keyExtractor={(i) => i.id} renderItem={({ item }) => <ThemedText style={styles.item}>{item.name ?? 'Meal'}</ThemedText>} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, padding: 16 }, title: { fontSize: 20, fontWeight: '600', marginBottom: 8 }, item: { paddingVertical: 8 } });
