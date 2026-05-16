import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, LayoutAnimation } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAppTheme } from '../App';
import { loadInbox, saveInbox, makeBucket, makeTimeLabel } from './storage';
import { radius } from './theme';

const SAMPLE_CHIPS = ['serendipity', '木漏れ日', 'petrichor', 'ありがとう', 'bandwidth'];

export default function HomeScreen({ navigation }) {
  const { theme } = useAppTheme();
  const [inbox, setInbox] = useState([]);
  const [expanded, setExpanded] = useState(null);

  useFocusEffect(useCallback(() => {
    loadInbox().then(setInbox);
  }, []));

  const handleDelete = async (id) => {
    Alert.alert('Delete word?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        const next = inbox.filter(i => i.id !== id);
        setInbox(next);
        await saveInbox(next);
      }},
    ]);
  };

  const handleEdit = (item) => {
    navigation.navigate('Add', { editing: item });
  };

  const isEmpty = inbox.length === 0;

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={[styles.logoBox, { backgroundColor: theme.accent }]}>
            <Text style={[styles.logoGlyph, { color: theme.accentInk }]}>ƒ</Text>
          </View>
          <View>
            <Text style={[styles.appName, { color: theme.ink }]}>Flashie</Text>
            <Text style={[styles.appSub, { color: theme.muted }]}>VOCABULARY INBOX</Text>
          </View>
        </View>
      </View>

      {isEmpty ? (
        <EmptyState theme={theme} onAdd={() => navigation.navigate('Add', {})} />
      ) : (
        <InboxList
          theme={theme}
          inbox={inbox}
          expanded={expanded}
          setExpanded={setExpanded}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAdd={() => navigation.navigate('Add', {})}
        />
      )}
    </View>
  );
}

function EmptyState({ theme, onAdd }) {
  return (
    <ScrollView contentContainerStyle={styles.emptyWrap} showsVerticalScrollIndicator={false}>
      {/* Ghost card stack */}
      <View style={styles.ghostStack}>
        <View style={[styles.ghostCard, styles.ghostCard3, { backgroundColor: theme.surfaceAlt, borderColor: theme.faint }]} />
        <View style={[styles.ghostCard, styles.ghostCard2, { backgroundColor: theme.surfaceAlt, borderColor: theme.faint }]} />
        <View style={[styles.ghostCard, styles.ghostCard1, { backgroundColor: theme.surface, borderColor: theme.faint }]}>
          <View style={[styles.ghostLine, { width: '60%', backgroundColor: theme.faint }]} />
          <View style={[styles.ghostLine, { width: '40%', backgroundColor: theme.faint, height: 6, marginTop: 8 }]} />
        </View>
      </View>

      <Text style={[styles.emptyTitle, { color: theme.ink }]}>Your inbox is empty.</Text>
      <Text style={[styles.emptyBody, { color: theme.muted }]}>
        Tap the <Text style={{ color: theme.accent, fontWeight: '800' }}>+</Text> button to save the first word that caught your eye today.
      </Text>

      <TouchableOpacity style={[styles.saveFirstBtn, { backgroundColor: theme.accent }]} onPress={onAdd} activeOpacity={0.8}>
        <Ionicons name="add" size={18} color={theme.accentInk} />
        <Text style={[styles.saveFirstText, { color: theme.accentInk }]}>Save first word</Text>
      </TouchableOpacity>

      <View style={[styles.chipsDivider, { borderTopColor: theme.faint }]}>
        <Text style={[styles.chipsLabel, { color: theme.muted }]}>NEED IDEAS?</Text>
        <View style={styles.chipsRow}>
          {SAMPLE_CHIPS.map(word => (
            <TouchableOpacity key={word} style={[styles.chip, { backgroundColor: theme.surface, borderColor: theme.faint }]} onPress={onAdd} activeOpacity={0.7}>
              <Text style={[styles.chipPlus, { color: theme.muted }]}>＋</Text>
              <Text style={[styles.chipText, { color: theme.ink }]}>{word}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

function InboxList({ theme, inbox, expanded, setExpanded, onEdit, onDelete, onAdd }) {
  const groups = [
    { key: 'today',     label: 'Today',              items: inbox.filter(i => i.bucket === 'today') },
    { key: 'yesterday', label: 'Yesterday',           items: inbox.filter(i => i.bucket === 'yesterday') },
    { key: 'earlier',   label: 'Earlier this week',   items: inbox.filter(i => i.bucket === 'earlier') },
  ].filter(g => g.items.length > 0);

  return (
    <ScrollView contentContainerStyle={{ padding: 22, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
      <Text style={[styles.countText, { color: theme.muted }]}>{inbox.length} {inbox.length === 1 ? 'word' : 'words'}</Text>
      {groups.map(group => (
        <View key={group.key} style={{ marginTop: 18 }}>
          <Text style={[styles.groupLabel, { color: theme.muted }]}>{group.label.toUpperCase()}</Text>
          <View style={[styles.groupCard, { backgroundColor: theme.surface, borderColor: theme.faint }]}>
            {group.items.map((item, idx) => (
              <React.Fragment key={item.id}>
                {idx > 0 && <View style={[styles.separator, { backgroundColor: theme.faint }]} />}
                <InboxRow
                  theme={theme}
                  item={item}
                  isExpanded={expanded === item.id}
                  onToggle={() => {
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                    setExpanded(expanded === item.id ? null : item.id);
                  }}
                  onEdit={() => onEdit(item)}
                  onDelete={() => onDelete(item.id)}
                />
              </React.Fragment>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

function InboxRow({ theme, item, isExpanded, onToggle, onEdit, onDelete }) {
  const accentColor = item.flashcarded ? theme.accent : `${theme.accent}66`;
  return (
    <TouchableOpacity onPress={onToggle} activeOpacity={0.7}>
      <View style={styles.rowOuter}>
        <View style={[styles.rowStripe, { backgroundColor: accentColor }]} />
        <View style={styles.rowContent}>
          <View style={styles.rowTop}>
            <Text style={[styles.rowWord, { color: theme.ink }]} numberOfLines={isExpanded ? undefined : 1}>{item.word}</Text>
            <Text style={[styles.rowTime, { color: theme.muted }]}>{item.timeLabel}</Text>
          </View>
          <Text style={[styles.rowMeaning, { color: theme.muted }]} numberOfLines={isExpanded ? undefined : 2}>{item.meaning}</Text>
          {isExpanded && (
            <View style={styles.expandedArea}>
              {item.example ? (
                <View style={[styles.exampleBox, { borderTopColor: theme.faint }]}>
                  <Text style={[styles.exampleLabel, { color: theme.muted }]}>EXAMPLE</Text>
                  <Text style={[styles.exampleText, { color: theme.muted }]}>{item.example}</Text>
                </View>
              ) : null}
              <Text style={[styles.savedAt, { color: theme.muted }]}>Saved {item.timeLabel}</Text>
              <View style={styles.actionRow}>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.surfaceAlt, borderColor: theme.faint }]} onPress={onEdit}>
                  <Ionicons name="pencil-outline" size={14} color={theme.ink} />
                  <Text style={[styles.actionText, { color: theme.ink }]}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.surfaceAlt, borderColor: theme.faint }]} onPress={onDelete}>
                  <Ionicons name="trash-outline" size={14} color="#E5484D" />
                  <Text style={[styles.actionText, { color: '#E5484D' }]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1 },
  header:        { paddingHorizontal: 22, paddingTop: 58, paddingBottom: 8 },
  logoRow:       { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoBox:       { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  logoGlyph:     { fontSize: 20, fontWeight: '900' },
  appName:       { fontSize: 22, fontWeight: '900', letterSpacing: -0.4, lineHeight: 24 },
  appSub:        { fontSize: 11, fontWeight: '600', letterSpacing: 0.6, marginTop: 2 },
  // Empty state
  emptyWrap:     { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 24, paddingBottom: 130 },
  ghostStack:    { position: 'relative', width: 220, height: 150, marginBottom: 8 },
  ghostCard:     { position: 'absolute', inset: 0, borderRadius: 22, borderWidth: 0.5 },
  ghostCard3:    { transform: [{ translateY: 12 }, { rotate: '-6deg' }, { scaleX: 0.88 }] },
  ghostCard2:    { transform: [{ translateY: 6 }, { rotate: '3deg' }, { scaleX: 0.94 }] },
  ghostCard1:    { justifyContent: 'flex-end', padding: 18, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
  ghostLine:     { height: 8, borderRadius: 4 },
  emptyTitle:    { fontSize: 26, fontWeight: '800', letterSpacing: -0.5, textAlign: 'center', marginTop: 30, lineHeight: 32 },
  emptyBody:     { fontSize: 15, textAlign: 'center', marginTop: 10, lineHeight: 22, maxWidth: 290, fontWeight: '500' },
  saveFirstBtn:  { flexDirection: 'row', alignItems: 'center', gap: 8, height: 48, paddingHorizontal: 22, borderRadius: 24, marginTop: 24 },
  saveFirstText: { fontSize: 15, fontWeight: '700' },
  chipsDivider:  { marginTop: 30, paddingTop: 22, borderTopWidth: 0.5, width: '100%', maxWidth: 320, alignItems: 'center', gap: 10 },
  chipsLabel:    { fontSize: 10, fontWeight: '700', letterSpacing: 1.4 },
  chipsRow:      { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center' },
  chip:          { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 0.5 },
  chipPlus:      { fontSize: 11, fontWeight: '700' },
  chipText:      { fontSize: 13, fontWeight: '600' },
  // Inbox list
  countText:     { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 4 },
  groupLabel:    { fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 },
  groupCard:     { borderRadius: 22, borderWidth: 0.5, overflow: 'hidden' },
  separator:     { height: 0.5, marginHorizontal: 16 },
  rowOuter:      { flexDirection: 'row' },
  rowStripe:     { width: 4, borderRadius: 2 },
  rowContent:    { flex: 1, padding: 14 },
  rowTop:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  rowWord:       { fontSize: 18, fontWeight: '700', flex: 1, letterSpacing: -0.2 },
  rowTime:       { fontSize: 12, fontWeight: '500', marginTop: 2 },
  rowMeaning:    { fontSize: 14, marginTop: 4, lineHeight: 20, fontWeight: '500' },
  expandedArea:  { marginTop: 12 },
  exampleBox:    { borderTopWidth: 0.5, paddingTop: 10, marginBottom: 8 },
  exampleLabel:  { fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 4 },
  exampleText:   { fontSize: 13, fontStyle: 'italic', lineHeight: 19 },
  savedAt:       { fontSize: 12, fontWeight: '500', marginBottom: 10 },
  actionRow:     { flexDirection: 'row', gap: 8 },
  actionBtn:     { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 0.5 },
  actionText:    { fontSize: 13, fontWeight: '700' },
});
