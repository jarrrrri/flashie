import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useAppTheme } from '../App';
import { radius } from './theme';
import { loadInbox, saveInbox, makeBucket, makeTimeLabel } from './storage';

export default function AddScreen({ navigation, route }) {
  const { theme } = useAppTheme();
  const editing = route.params?.editing ?? null;

  const [word,    setWord]    = useState(editing?.word    ?? '');
  const [meaning, setMeaning] = useState(editing?.meaning ?? '');
  const [example, setExample] = useState(editing?.example ?? '');
  const [touchedWord,    setTouchedWord]    = useState(!!editing);
  const [touchedMeaning, setTouchedMeaning] = useState(!!editing);

  const wordRef = useRef(null);
  useEffect(() => { setTimeout(() => wordRef.current?.focus(), 100); }, []);

  const isValid    = word.trim() && meaning.trim();
  const wordError    = touchedWord    && !word.trim()    ? 'Vocabulary cannot be empty' : null;
  const meaningError = touchedMeaning && !meaning.trim() ? 'Meaning cannot be empty'    : null;

  const handleSave = async () => {
    setTouchedWord(true); setTouchedMeaning(true);
    if (!isValid) return;
    const inbox = await loadInbox();
    if (editing) {
      const updated = inbox.map(i => i.id === editing.id
        ? { ...i, word: word.trim(), meaning: meaning.trim(), example: example.trim() }
        : i
      );
      await saveInbox(updated);
    } else {
      const savedAt = new Date().toISOString();
      const bucket  = makeBucket(savedAt);
      const newItem = {
        id: Date.now().toString(),
        word: word.trim(), meaning: meaning.trim(), example: example.trim(),
        savedAt, bucket, timeLabel: makeTimeLabel(savedAt),
        isFlashcarded: false,
      };
      await saveInbox([newItem, ...inbox]);
    }
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.container, { backgroundColor: theme.bg }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.cancelBtn}>
            <Text style={[styles.cancelText, { color: theme.muted }]}>Cancel</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.ink }]}>{editing ? 'Edit Vocabulary' : 'Add Vocabulary'}</Text>
          <TouchableOpacity
            onPress={handleSave}
            disabled={!isValid}
            style={[styles.saveBtn, { backgroundColor: isValid ? theme.accent : theme.faint }]}
          >
            <Text style={[styles.saveText, { color: isValid ? theme.accentInk : theme.muted }]}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
          {/* Vocabulary */}
          <FieldLabel theme={theme} text="Vocabulary" required />
          <TextInput
            ref={wordRef}
            value={word}
            onChangeText={setWord}
            onBlur={() => setTouchedWord(true)}
            placeholder="Type a word…"
            placeholderTextColor={theme.muted}
            style={[styles.input, styles.wordInput, { backgroundColor: theme.surface, borderColor: wordError ? theme.errorRed : theme.faint, color: theme.ink, borderWidth: wordError ? 1 : 0.5 }]}
          />
          <FieldError theme={theme} text={wordError} />

          {/* Meaning */}
          <FieldLabel theme={theme} text="Meaning" required style={{ marginTop: 22 }} />
          <TextInput
            value={meaning}
            onChangeText={setMeaning}
            onBlur={() => setTouchedMeaning(true)}
            placeholder="The definition or translation"
            placeholderTextColor={theme.muted}
            multiline
            numberOfLines={3}
            style={[styles.input, styles.textarea, { backgroundColor: theme.surface, borderColor: meaningError ? theme.errorRed : theme.faint, color: theme.ink, borderWidth: meaningError ? 1 : 0.5 }]}
          />
          <FieldError theme={theme} text={meaningError} />

          {/* Example */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 22 }}>
            <FieldLabel theme={theme} text="Example sentence" />
            <Text style={[styles.optional, { color: theme.muted }]}>Optional</Text>
          </View>
          <TextInput
            value={example}
            onChangeText={setExample}
            placeholder="A sentence using this word"
            placeholderTextColor={theme.muted}
            multiline
            numberOfLines={3}
            style={[styles.input, styles.textarea, styles.italic, { backgroundColor: theme.surface, borderColor: theme.faint, color: theme.ink }]}
          />

          {/* Info card */}
          <View style={[styles.helperCard, { backgroundColor: `${theme.accent}14`, borderColor: `${theme.accent}2E` }]}>
            <View style={[styles.helperIcon, { backgroundColor: theme.accent }]}>
              <Text style={[styles.helperI, { color: theme.accentInk }]}>i</Text>
            </View>
            <Text style={[styles.helperText, { color: theme.ink }]}>
              Capture it fast. You can organize words into flashcards later from the Flashcards tab.
            </Text>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

function FieldLabel({ theme, text, required, style }) {
  return (
    <View style={[{ flexDirection: 'row', marginBottom: 8, paddingLeft: 4 }, style]}>
      <Text style={[styles.label, { color: theme.muted }]}>{text.toUpperCase()}</Text>
      {required && <Text style={{ color: theme.accent, marginLeft: 4 }}>*</Text>}
    </View>
  );
}

function FieldError({ theme, text }) {
  if (!text) return null;
  return <Text style={[styles.fieldError, { color: theme.errorRed }]}>{text}</Text>;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 56, paddingBottom: 12 },
  cancelBtn: { padding: 6 },
  cancelText:{ fontSize: 16 },
  title:     { fontSize: 16, fontWeight: '700', letterSpacing: -0.2 },
  saveBtn:   { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 },
  saveText:  { fontSize: 14, fontWeight: '700' },
  form:      { paddingHorizontal: 22, paddingTop: 12, paddingBottom: 80 },
  label:     { fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  optional:  { fontSize: 12 },
  input:     { borderRadius: radius.input, paddingHorizontal: 18, paddingVertical: 14 },
  wordInput: { fontSize: 26, fontWeight: '700', letterSpacing: -0.4 },
  textarea:  { fontSize: 16, fontWeight: '500', lineHeight: 24, minHeight: 80, textAlignVertical: 'top' },
  italic:    { fontStyle: 'italic', fontSize: 15 },
  fieldError:{ fontSize: 12, fontWeight: '600', paddingLeft: 6, marginTop: 6 },
  helperCard:{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, borderWidth: 0.5, borderRadius: 16, padding: 16, marginTop: 24 },
  helperIcon:{ width: 24, height: 24, borderRadius: 6, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  helperI:   { fontSize: 14, fontWeight: '900' },
  helperText:{ fontSize: 13, lineHeight: 20, flex: 1 },
});
