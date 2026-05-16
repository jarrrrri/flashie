import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../App';
import { loadInbox, loadDecks, saveDecks } from './storage';
import { useFocusEffect } from '@react-navigation/native';
import { ACCENT_PALETTE, radius } from './theme';

export default function CreateDeckScreen({ navigation }) {
  const { theme } = useAppTheme();
  const [inbox, setInbox] = useState([]);
  const [count, setCount] = useState(5);
  const [countText, setCountText] = useState('5');
  const [seed, setSeed] = useState(Math.random());
  const [error, setError] = useState(null);

  useFocusEffect(useCallback(() => {
    loadInbox().then(items => {
      setInbox(items);
      const defaultCount = Math.min(5, items.length || 1);
      setCount(defaultCount);
      setCountText(`${defaultCount}`);
    });
  }, []));

  const max = inbox.length;

  const preview = useMemo(() => {
    return seededShuffle(inbox, seed).slice(0, Math.max(1, Math.min(max || 1, count)));
  }, [inbox, count, seed]);

  const clamp = n => Math.max(1, Math.min(max || 1, Math.floor(n)));
  const quickChips = [...new Set([1, 5, 10, max].filter(v => v >= 1 && v <= max))].sort((a,b)=>a-b);

  const handleStart = async () => {
    const picks = seededShuffle(inbox, Math.random()).slice(0, clamp(count));
    const firstWord = picks[0]?.word || 'Deck';
    const friendlyName = picks.length === 1 ? firstWord : `${firstWord} +${picks.length - 1} more`;
    const deck = {
      id: `deck-${Date.now()}`,
      name: friendlyName,
      emoji: firstWord.slice(0, 2),
      color: ACCENT_PALETTE[Math.floor(Math.random() * ACCENT_PALETTE.length)],
      updated: 'Just now',
      cards: picks.map((item, i) => ({ id: i + 1, front: item.word, back: item.meaning, example: item.example || '' })),
    };
    const existing = await loadDecks();
    await saveDecks([deck, ...existing]);
    navigation.navigate('Study', { deck });
  };

  if (max === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.bg }]}>
        <Header theme={theme} onBack={() => navigation.goBack()} />
        <View style={styles.emptyWrap}>
          <Text style={{ fontSize: 40 }}>📭</Text>
          <Text style={[styles.emptyTitle, { color: theme.ink }]}>Inbox is empty</Text>
          <Text style={[styles.emptyBody, { color: theme.muted }]}>Save some vocabulary first, then come back to build a deck.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <Header theme={theme} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: 22, paddingBottom: 120 }}>
        <Text style={[styles.lead, { color: theme.ink }]}>How many cards?</Text>
        <Text style={[styles.sub, { color: theme.muted }]}>We'll pick {count} {count === 1 ? 'word' : 'words'} at random from your inbox.</Text>

        {/* Stepper */}
        <View style={[styles.stepperCard, { backgroundColor: theme.surface, borderColor: theme.faint }]}>
          <View style={styles.stepperRow}>
            <StepBtn theme={theme} label="−" disabled={count <= 1} onPress={() => { const v = clamp(count-1); setCount(v); setCountText(`${v}`); }} />
            <TextInput
              value={countText}
              onChangeText={raw => {
                setCountText(raw);
                setError(null);
                if (/^\d+$/.test(raw)) {
                  const n = parseInt(raw);
                  if (n < 1)   { setError('Must be at least 1 card'); setCount(1); }
                  else if (n > max) { setError(`Only ${max} words in your inbox`); setCount(max); }
                  else { setCount(n); }
                } else if (raw !== '') setError('Whole numbers only');
              }}
              keyboardType="number-pad"
              style={[styles.countInput, { color: theme.ink }]}
            />
            <StepBtn theme={theme} label="+" disabled={count >= max} onPress={() => { const v = clamp(count+1); setCount(v); setCountText(`${v}`); }} />
          </View>
          <Text style={[styles.stepNote, { color: error ? theme.errorRed : theme.muted }]}>
            {error || `${max} ${max === 1 ? 'word' : 'words'} available · whole numbers only`}
          </Text>
          {/* Quick chips */}
          <View style={[styles.quickRow, { borderTopColor: theme.faint }]}>
            {quickChips.map(v => (
              <TouchableOpacity key={v} style={[styles.quickChip, { backgroundColor: count === v ? theme.accent : theme.surfaceAlt }]}
                onPress={() => { setCount(v); setCountText(`${v}`); setError(null); }}>
                <Text style={[styles.quickChipText, { color: count === v ? theme.accentInk : theme.ink }]}>
                  {v === max && max > 1 ? `All ${v}` : `${v}`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Preview */}
        <View style={{ marginTop: 24 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <Text style={[styles.previewLabel, { color: theme.muted }]}>PREVIEW</Text>
            <TouchableOpacity onPress={() => setSeed(Math.random())} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="shuffle" size={14} color={theme.accent} />
              <Text style={{ fontSize: 12, fontWeight: '700', color: theme.accent, letterSpacing: 0.4 }}>SHUFFLE</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.previewBox, { backgroundColor: theme.surface, borderColor: theme.faint }]}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {preview.map(item => (
                <View key={item.id} style={[styles.previewChip, { backgroundColor: theme.surfaceAlt, borderColor: theme.faint }]}>
                  <Text style={[styles.previewChipText, { color: theme.ink }]}>{item.word}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Start button */}
        <TouchableOpacity style={[styles.startBtn, { backgroundColor: theme.accent }]} onPress={handleStart} activeOpacity={0.8}>
          <Ionicons name="play" size={18} color={theme.accentInk} />
          <Text style={[styles.startText, { color: theme.accentInk }]}>Start studying</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function Header({ theme, onBack }) {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onBack} style={[styles.backBtn, { backgroundColor: theme.surface, borderColor: theme.faint }]}>
        <Ionicons name="chevron-back" size={20} color={theme.ink} />
      </TouchableOpacity>
      <Text style={[styles.headerTitle, { color: theme.ink }]}>New Flashcard Deck</Text>
      <View style={{ width: 38 }} />
    </View>
  );
}

function StepBtn({ theme, label, disabled, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled}
      style={[styles.stepBtn, { backgroundColor: theme.surfaceAlt, borderColor: theme.faint }, disabled && { opacity: 0.4 }]}>
      <Text style={[styles.stepBtnText, { color: theme.ink }]}>{label}</Text>
    </TouchableOpacity>
  );
}

function seededShuffle(arr, seed) {
  const a = [...arr];
  let s = Math.floor(seed * 2147483647) || 1;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const styles = StyleSheet.create({
  container:     { flex: 1 },
  header:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 56, paddingBottom: 12 },
  backBtn:       { width: 38, height: 38, borderRadius: 19, borderWidth: 0.5, alignItems: 'center', justifyContent: 'center' },
  headerTitle:   { fontSize: 16, fontWeight: '700' },
  emptyWrap:     { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 },
  emptyTitle:    { fontSize: 22, fontWeight: '900', marginTop: 18 },
  emptyBody:     { fontSize: 14, textAlign: 'center', marginTop: 8, lineHeight: 21 },
  lead:          { fontSize: 24, fontWeight: '900', letterSpacing: -0.4 },
  sub:           { fontSize: 14, marginTop: 4, lineHeight: 21 },
  stepperCard:   { borderRadius: radius.card, borderWidth: 0.5, padding: 22, marginTop: 22 },
  stepperRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16 },
  stepBtn:       { width: 48, height: 48, borderRadius: 24, borderWidth: 0.5, alignItems: 'center', justifyContent: 'center' },
  stepBtnText:   { fontSize: 28, fontWeight: '700', lineHeight: 32 },
  countInput:    { width: 100, textAlign: 'center', fontSize: 56, fontWeight: '900', letterSpacing: -2 },
  stepNote:      { fontSize: 12, fontWeight: '600', textAlign: 'center', marginTop: 8 },
  quickRow:      { flexDirection: 'row', gap: 6, justifyContent: 'center', flexWrap: 'wrap', marginTop: 16, paddingTop: 16, borderTopWidth: 0.5 },
  quickChip:     { borderRadius: 999, paddingHorizontal: 14, paddingVertical: 7 },
  quickChipText: { fontSize: 13, fontWeight: '700' },
  previewLabel:  { fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  previewBox:    { borderRadius: radius.input, borderWidth: 0.5, padding: 14 },
  previewChip:   { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 0.5 },
  previewChipText:{ fontSize: 13, fontWeight: '600' },
  startBtn:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 56, borderRadius: 28, marginTop: 28 },
  startText:     { fontSize: 17, fontWeight: '900' },
});
