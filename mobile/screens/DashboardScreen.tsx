import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function DashboardScreen() {
  const { user, signIn, signOut } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>
      {!user ? (
        <>
          <Text style={{ marginBottom: 8 }}>You are not signed in.</Text>
          <Button title="Sign in with GitHub" onPress={() => signIn()} />
        </>
      ) : (
        <>
          <Text style={{ marginBottom: 8 }}>Welcome back, {user.name ?? user.email}</Text>
          <Button title="Sign out" onPress={() => signOut()} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, padding: 16 }, title: { fontSize: 20, fontWeight: '600', marginBottom: 8 } });
