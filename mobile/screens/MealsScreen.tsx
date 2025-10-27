import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Button, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';

const BACKEND_BASE = 'https://nutrisnap.workhardbekind.com';

export default function MealsScreen() {
  const { token, signIn } = useAuth();
  const [meals, setMeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!token) return;
      setLoading(true);
      setError(null);
      try {
        const r = await fetch(`${BACKEND_BASE}/api/meals`, {
          headers: { Authorization: `Bearer ${token}` },
        });
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
  }, [token]);

  if (!token) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Meals</Text>
        <Text style={{ marginBottom: 12 }}>You must sign in to view meals.</Text>
        <Button title="Sign in" onPress={() => signIn()} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Meals</Text>
      {loading ? (
        <ActivityIndicator />
      ) : error ? (
        <Text style={{ color: 'red' }}>{error}</Text>
      ) : (
        <FlatList data={meals} keyExtractor={(i) => i.id} renderItem={({ item }) => <Text style={styles.item}>{item.name ?? 'Meal'}</Text>} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, padding: 16 }, title: { fontSize: 20, fontWeight: '600', marginBottom: 8 }, item: { paddingVertical: 8 } });
