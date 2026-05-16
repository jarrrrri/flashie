import 'react-native-gesture-handler';
import React, { useState, useEffect, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { THEMES, DEFAULT_THEME, ACCENT_PALETTE } from './src/theme';
import { loadThemeKey, saveThemeKey, loadSettings, saveSettings } from './src/storage';
import HomeScreen       from './src/HomeScreen';
import AddScreen        from './src/AddScreen';
import FlashcardsScreen from './src/FlashcardsScreen';
import StudyScreen      from './src/StudyScreen';
import CreateDeckScreen from './src/CreateDeckScreen';
import MenuScreen       from './src/MenuScreen';
import ThemesScreen     from './src/ThemesScreen';

// Theme context
export const ThemeContext = React.createContext(null);
export function useAppTheme() { return React.useContext(ThemeContext); }

const Tab   = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function HomeStack({ theme }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="Add" component={AddScreen} options={{ presentation: 'modal' }} />
    </Stack.Navigator>
  );
}

function FlashcardsStack({ theme }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="FlashcardsMain" component={FlashcardsScreen} />
      <Stack.Screen name="Study"      component={StudyScreen}      options={{ presentation: 'fullScreenModal' }} />
      <Stack.Screen name="CreateDeck" component={CreateDeckScreen} options={{ presentation: 'modal' }} />
    </Stack.Navigator>
  );
}

function MenuStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MenuMain"  component={MenuScreen} />
      <Stack.Screen name="Themes"    component={ThemesScreen} options={{ presentation: 'modal' }} />
    </Stack.Navigator>
  );
}

function CustomTabBar({ state, navigation, theme }) {
  const tabs = [
    { name: 'Home',       label: 'Home',       isAdd: false, icon: 'home-outline',    iconActive: 'home' },
    { name: 'ADD_ACTION', label: 'Add',         isAdd: true  },
    { name: 'Flashcards', label: 'Flashcards',  isAdd: false, icon: 'albums-outline', iconActive: 'albums' },
    { name: 'Menu',       label: 'Menu',        isAdd: false, icon: 'settings-outline', iconActive: 'settings' },
  ];

  return (
    <View style={[s.outer, { paddingBottom: 26 }]}>
      <View style={[s.pill, { backgroundColor: theme.surface, borderColor: theme.faint }]}>
        {tabs.map((tab) => {
          const isActive = !tab.isAdd && state.routes[state.index]?.name === tab.name;
          const color = isActive ? theme.accent : theme.muted;

          if (tab.isAdd) {
            return (
              <TouchableOpacity key="add" style={s.tabItem} activeOpacity={0.8}
                onPress={() => navigation.navigate('Home', { screen: 'Add', params: {} })}>
                <View style={[s.addCircle, { backgroundColor: theme.accent }]}>
                  <Text style={{ fontSize: 28, color: theme.accentInk, lineHeight: 32, fontWeight: '300' }}>+</Text>
                </View>
                <Text style={[s.tabLabel, { color: theme.muted }]}>Add</Text>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity key={tab.name} style={s.tabItem} activeOpacity={0.7}
              onPress={() => navigation.navigate(tab.name)}>
              <Ionicons name={isActive ? tab.iconActive : tab.icon} size={22} color={color} />
              <Text style={[s.tabLabel, { color }]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function RootTabs({ theme }) {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} theme={theme} />}
      screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home"       children={() => <HomeStack theme={theme} />} />
      <Tab.Screen name="Flashcards" children={() => <FlashcardsStack theme={theme} />} />
      <Tab.Screen name="Menu"       component={MenuStack} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [themeKey, setThemeKey]   = useState(DEFAULT_THEME);
  const [settings, setSettings]   = useState({ haptics: true, sound: false, animation: true, shake: false, dailyGoal: 20, reminder: true });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    Promise.all([loadThemeKey(), loadSettings()]).then(([key, s]) => {
      setThemeKey(key || DEFAULT_THEME);
      setSettings(s);
      setReady(true);
    });
  }, []);

  const theme = THEMES[themeKey] || THEMES[DEFAULT_THEME];

  const applyTheme = useCallback(async (key) => {
    setThemeKey(key);
    await saveThemeKey(key);
  }, []);

  const updateSetting = useCallback(async (key, value) => {
    setSettings(prev => {
      const next = { ...prev, [key]: value };
      saveSettings(next);
      return next;
    });
  }, []);

  if (!ready) return null;

  return (
    <ThemeContext.Provider value={{ theme, themeKey, applyTheme, settings, updateSetting }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar style={theme.bg.startsWith('#1') ? 'light' : 'dark'} />
          <RootTabs theme={theme} />
        </NavigationContainer>
      </SafeAreaProvider>
    </ThemeContext.Provider>
  );
}

const s = StyleSheet.create({
  outer:     { position: 'absolute', bottom: 0, left: 0, right: 0, paddingTop: 8, paddingHorizontal: 14 },
  pill:      { flexDirection: 'row', borderRadius: 28, padding: 8, borderWidth: 0.5, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
  tabItem:   { flex: 1, alignItems: 'center', paddingVertical: 4, gap: 3 },
  addCircle: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', shadowOpacity: 0.5, shadowRadius: 6, shadowOffset: { width: 0, height: 3 } },
  tabLabel:  { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.2 },
});
