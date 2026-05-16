import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../App';
import { THEMES, THEME_ORDER } from './theme';

export default function ThemesScreen({ navigation }) {
  const { theme, themeKey, applyTheme } = useAppTheme();
  const [preview, setPreview] = useState(themeKey);
  const previewTheme = THEMES[preview] || theme;

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: theme.surface, borderColor: theme.faint }]}>
        <Ionicons name="chevron-back" size={20} color={theme.ink} />
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={[styles.headerSub, { color: theme.muted }]}>THEME</Text>
        <Text style={[styles.headerTitle, { color: theme.ink }]}>Make it yours</Text>
        <Text style={[styles.headerHint, { color: theme.muted }]}>Tap to preview · tap again to apply</Text>
      </View>

      {/* Preview */}
      <View style={[styles.previewBox, { backgroundColor: previewTheme.surface, borderColor: previewTheme.faint }]}>
        <View style={[styles.previewHeader, { backgroundColor: previewTheme.bg }]}>
          <View style={[styles.previewLogo, { backgroundColor: previewTheme.accent }]}>
            <Text style={{ color: previewTheme.accentInk, fontWeight: '900', fontSize: 13 }}>ƒ</Text>
          </View>
          <View>
            <Text style={[styles.previewTitle, { color: previewTheme.ink }]}>Flashie</Text>
            <Text style={[styles.previewSub, { color: previewTheme.muted }]}>VOCABULARY INBOX</Text>
          </View>
        </View>
        <View style={[styles.previewCard, { backgroundColor: previewTheme.surface, borderColor: previewTheme.faint }]}>
          <View style={[styles.previewStripe, { backgroundColor: previewTheme.accent }]} />
          <View style={{ flex: 1, paddingHorizontal: 10, paddingVertical: 6 }}>
            <Text style={[styles.previewWord, { color: previewTheme.ink }]}>serendipity</Text>
            <Text style={[styles.previewMeaning, { color: previewTheme.muted }]}>A happy accident or pleasant surprise</Text>
          </View>
        </View>
      </View>

      {/* Theme list */}
      <ScrollView contentContainerStyle={{ paddingHorizontal: 22, paddingBottom: 40, gap: 10 }} showsVerticalScrollIndicator={false}>
        {THEME_ORDER.map(key => {
          const t = THEMES[key];
          const isSelected = themeKey === key;
          return (
            <TouchableOpacity key={key} activeOpacity={0.8}
              style={[styles.themeRow, { backgroundColor: theme.surface, borderColor: isSelected ? theme.accent : theme.faint, borderWidth: isSelected ? 2 : 0.5 }]}
              onPress={() => {
                if (t.free) {
                  if (preview === key) {
                    applyTheme(key);
                    navigation.goBack();
                  } else {
                    setPreview(key);
                  }
                }
              }}>
              <View style={styles.swatches}>
                {t.swatches.map((c, i) => (
                  <View key={i} style={[styles.swatch, { backgroundColor: c, borderColor: theme.faint, marginRight: i < t.swatches.length - 1 ? -6 : 0 }]} />
                ))}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.themeName, { color: theme.ink }]}>{t.name}</Text>
                {!t.free && <Text style={[styles.premiumTag, { color: theme.muted }]}>Premium</Text>}
              </View>
              {isSelected && <Ionicons name="checkmark-circle" size={20} color={theme.accent} />}
              {!t.free && <Ionicons name="lock-closed" size={14} color={theme.muted} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1 },
  backBtn:        { position: 'absolute', top: 56, left: 16, zIndex: 10, width: 38, height: 38, borderRadius: 19, borderWidth: 0.5, alignItems: 'center', justifyContent: 'center' },
  header:         { paddingHorizontal: 22, paddingTop: 110, paddingBottom: 16 },
  headerSub:      { fontSize: 13, fontWeight: '600', letterSpacing: 0.4, textTransform: 'uppercase' },
  headerTitle:    { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  headerHint:     { fontSize: 13, marginTop: 4, fontWeight: '500' },
  previewBox:     { marginHorizontal: 22, borderRadius: 18, borderWidth: 0.5, overflow: 'hidden', marginBottom: 20 },
  previewHeader:  { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, paddingBottom: 8 },
  previewLogo:    { width: 26, height: 26, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  previewTitle:   { fontSize: 14, fontWeight: '900' },
  previewSub:     { fontSize: 8, fontWeight: '600', letterSpacing: 0.6 },
  previewCard:    { flexDirection: 'row', marginHorizontal: 12, marginBottom: 12, borderRadius: 12, borderWidth: 0.5, overflow: 'hidden', height: 52 },
  previewStripe:  { width: 4 },
  previewWord:    { fontSize: 14, fontWeight: '700' },
  previewMeaning: { fontSize: 11, marginTop: 2 },
  themeRow:       { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 16, padding: 14 },
  swatches:       { flexDirection: 'row' },
  swatch:         { width: 24, height: 24, borderRadius: 12, borderWidth: 0.5 },
  themeName:      { fontSize: 15, fontWeight: '700' },
  premiumTag:     { fontSize: 11, fontWeight: '600', marginTop: 1 },
});
