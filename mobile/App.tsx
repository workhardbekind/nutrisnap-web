import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AuthProvider } from './context/AuthContext';
import DashboardScreen from './screens/DashboardScreen';
import MealsScreen from './screens/MealsScreen';
import TrendsScreen from './screens/TrendsScreen';
import { Text } from 'react-native';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Tab.Navigator screenOptions={{ headerShown: false }}>
          <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ tabBarLabel: 'Dashboard' }} />
          <Tab.Screen name="Meals" component={MealsScreen} options={{ tabBarLabel: 'Meals' }} />
          <Tab.Screen name="Trends" component={TrendsScreen} options={{ tabBarLabel: 'Trends' }} />
        </Tab.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}
