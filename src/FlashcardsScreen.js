import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAppTheme } from '../App';
import { loadDecks, saveDecks } from './storage';
import { ACCENT_PALETTE, radius } from './theme';

const SAMPLE_DECKS = [
  { id: 'jlpt-n5', name: 'JLPT N5', emoji: '日', color: '#F4B6B6', updated: '2 hours ago', cards: [
    { id: 1, front: '猫', back: 'cat', example: '猫が好きです。' },
    { id: 2, front: '犬', back: 'dog', example: '犬と散歩します。' },
    { id: 3, front: '水', back: 'water', example: '水を飲みます。' },
    { id: 4, front: '本', back: 'book', example: '本を読みます。' },
    { id: 5, front: '学校', back: 'school', example: '学校に行きます。' },
    { id: 6, front: '友達', back: 'friend', example: '友達と話します。' },
    { id: 7, front: '美味しい', back: 'delicious', example: 'このケーキは美味しい。' },
    { id: 8, front: 'ありがとう', back: 'thank you', example: 'ありがとうございます。' },
  ]},
  { id: 'english-vocab', name: 'English Vocabulary', emoji: 'A', color: '#A8D5BA', updated: 'Yesterday', cards: [
    { id: 1, front: 'serendipity', back: 'A happy accident or pleasant surprise', example: 'Meeting her was pure serendipity.' },
    { id: 2, front: 'ephemeral', back: 'Lasting for a very short time', example: 'The beauty of cherry blossoms is ephemeral.' },
    { id: 3, front: 'petrichor', back: 'The earthy scent after rain', example: 'I love the petrichor after a summer storm.' },
    { id: 4, front: 'ubiquitous', back: 'Present everywhere', example: 'Smartphones are ubiquitous today.' },
    { id: 5, front: 'mellifluous', back: 'Sweet or musical; pleasant to hear', example: 'Her mellifluous voice calmed the baby.' },
    { id: 6, front: 'quintessential', back: 'Representing the most perfect example', example: 'The quintessential summer day.' },
  ]},
  { id: 'business', name: 'Business English', emoji: 'B', color: '#F4D58D', updated: '3 days ago', cards: [
    { id: 1, front: 'leverage', back: 'To use something to maximum advantage', example: 'We can leverage our network.' },
    { id: 2, front: 'synergy', back: 'Combined effort producing greater result', example: "There's strong synergy between teams." },
    { id: 3, front: 'stakeholder', back: 'A person with interest in a business', example: 'We need stakeholder buy-in first.' },
    { id: 4, front: 'pipeline', back: 'A list of prospective deals or projects', example: 'Our Q3 pipeline looks healthy.' },
    { id: 5, front: 'bandwidth', back: 'Capacity to handle work or tasks', example: "I don't have the bandwidth this week." },
  ]},
];

export default function FlashcardsScreen({ navigation }) {
  const { theme } = useAppTheme();
  const [userDecks, setUserDecks] = useState([]);
  const [menuOpen, setMenuOpen] = useState(null);

  useFocusEffect(useCallback(() => {
    loadDecks().then(setUserDecks);
  }, []));

  const allDecks = [...userDecks, ...SAMPLE_DECKS];
  const isEmpty = allDecks.length === 0;

  const handleDelete = async (id) => {
    const next = userDecks.filter(d => d.id !== id);
    setUserDecks(next);
    await saveDecks(next);
    setMenuOpen(null);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]} onStartShouldSetResponder={() => { setMenuOpen(null); return false; }}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.historyLabel, { color: theme.muted }]}>HISTORY</Text>
        <Text style={[styles.title, { color: theme.ink }]}>Flashcards</Text>
      </View>

      {isEmpty ? (
        <FCEmptyState theme={theme} onCreateDeck={() => navigation.navigate('CreateDeck')} />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 22, paddingBottom: 120 }} showsVerticalScrollIndicator={false}
          onScrollBeginDrag={() => setMenuOpen(null)}>
          <Text style={[styles.countText, { color: theme.muted }]}>{allDecks.length} {allDecks.length === 1 ? 'deck' : 'decks'}</Text>
          {allDecks.map((deck, idx) => (
            <DeckCard
              key={deck.id}
              deck={deck}
              theme={theme}
              colorIndex={idx}
              menuOpen={menuOpen === deck.id}
              onMenuToggle={() => setMenuOpen(menuOpen === deck.id ? null : deck.id)}
              onPress={() => { setMenuOpen(null); navigation.navigate('Study', { deck }); }}
              onDelete={SAMPLE_DECKS.find(d => d.id === deck.id) ? null : () => handleDelete(deck.id)}
            />
          ))}
          <TouchableOpacity style={[styles.newDeckBtn, { borderColor: `${theme.muted}4D` }]} activeOpacity={0.7}
            onPress={() => navigation.navigate('CreateDeck')}>
            <Ionicons name="add" size={18} color={theme.muted} />
            <Text style={[styles.newDeckText, { color: theme.muted }]}>Create deck</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
}

function FCEmptyState({ theme, onCreateDeck }) {
  return (
    <View style={styles.emptyWrap}>
      <View style={styles.emptyIllustration}>
        <View style={[styles.emptyCard2, { backgroundColor: theme.surfaceAlt, borderColor: theme.faint }]} />
        <View style={[styles.emptyCard1, { backgroundColor: theme.surface, borderColor: theme.faint }]}>
          <View style={[styles.emptyIconBox, { backgroundColor: `${theme.accent}30` }]}>
            <Text style={[styles.emptyIconText, { color: theme.accent }]}>Aa</Text>
          </View>
          <View style={{ gap: 5 }}>
            <View style={[styles.emptyBarLong, { backgroundColor: theme.faint }]} />
            <View style={[styles.emptyBarShort, { backgroundColor: theme.faint }]} />
          </View>
        </View>
      </View>
      <Text style={[styles.emptyTitle, { color: theme.ink }]}>No flashcards yet.</Text>
      <Text style={[styles.emptyBody, { color: theme.muted }]}>
        Create your first deck from the vocabulary you've saved. Decks you make appear here so you can study them again.
      </Text>
      <TouchableOpacity style={[styles.createBtn, { backgroundColor: theme.accent }]} onPress={onCreateDeck} activeOpacity={0.8}>
        <Ionicons name="add" size={18} color={theme.accentInk} />
        <Text style={[styles.createBtnText, { color: theme.accentInk }]}>Create first deck</Text>
      </TouchableOpacity>
    </View>
  );
}

function DeckCard({ deck, theme, colorIndex, menuOpen, onMenuToggle, onPress, onDelete }) {
  const color = deck.color || ACCENT_PALETTE[colorIndex % ACCENT_PALETTE.length];
  return (
    <View style={[styles.deckCard, { backgroundColor: theme.surface, borderColor: theme.faint }]}>
      <TouchableOpacity style={styles.deckCardInner} onPress={onPress} activeOpacity={0.75}>
        <View style={[styles.deckIcon, { backgroundColor: color }]}>
          <Text style={styles.deckEmoji}>{deck.emoji}</Text>
          <View style={styles.deckDot} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.deckName, { color: theme.ink }]} numberOfLines={1}>{deck.name}</Text>
          <Text style={[styles.deckMeta, { color: theme.muted }]}>
            {deck.cards.length} {deck.cards.length === 1 ? 'card' : 'cards'}{deck.updated ? ` · ${deck.updated}` : ''}
          </Text>
        </View>
        {onDelete && (
          <TouchableOpacity onPress={e => { e?.stopPropagation?.(); onMenuToggle(); }} style={styles.dotsBtn} hitSlop={8}>
            <Ionicons name="ellipsis-horizontal" size={18} color={theme.muted} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
      {menuOpen && onDelete && (
        <TouchableOpacity style={[styles.deleteMenuItem, { borderTopColor: theme.faint }]} onPress={onDelete}>
          <Ionicons name="trash-outline" size={14} color="#E5484D" />
          <Text style={styles.deleteMenuText}>Delete deck</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1 },
  header:      { paddingHorizontal: 22, paddingTop: 58, paddingBottom: 4 },
  historyLabel:{ fontSize: 13, fontWeight: '600', letterSpacing: 0.4, textTransform: 'uppercase' },
  title:       { fontSize: 32, fontWeight: '900', letterSpacing: -0.5, marginTop: 2 },
  countText:   { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 14 },
  deckCard:    { borderRadius: 22, borderWidth: 0.5, marginBottom: 12, overflow: 'hidden' },
  deckCardInner:{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16 },
  deckIcon:    { width: 56, height: 64, borderRadius: 14, alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' },
  deckEmoji:   { fontSize: 26, fontWeight: '800', color: 'rgba(255,255,255,0.95)' },
  deckDot:     { position: 'absolute', top: 6, right: 6, width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.4)' },
  deckName:    { fontSize: 17, fontWeight: '700', letterSpacing: -0.2 },
  deckMeta:    { fontSize: 13, marginTop: 2, fontWeight: '500' },
  dotsBtn:     { padding: 6 },
  deleteMenuItem:{ flexDirection: 'row', alignItems: 'center', gap: 8, padding: 14, borderTopWidth: 0.5 },
  deleteMenuText:{ fontSize: 14, fontWeight: '600', color: '#E5484D' },
  newDeckBtn:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4, padding: 18, borderRadius: 22, borderWidth: 1.5, borderStyle: 'dashed' },
  newDeckText: { fontSize: 15, fontWeight: '700' },
  // Empty state
  emptyWrap:        { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28, paddingBottom: 130 },
  emptyIllustration:{ position: 'relative', width: 180, height: 130 },
  emptyCard2:       { position: 'absolute', inset: 0, borderRadius: 18, borderWidth: 0.5, transform: [{ translateY: 8 }, { rotate: '-6deg' }, { scaleX: 0.92 }] },
  emptyCard1:       { position: 'absolute', inset: 0, borderRadius: 18, borderWidth: 0.5, padding: 18, transform: [{ rotate: '-1deg' }], justifyContent: 'space-between', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
  emptyIconBox:     { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  emptyIconText:    { fontSize: 13, fontWeight: '900' },
  emptyBarLong:     { height: 8, width: '70%', borderRadius: 4 },
  emptyBarShort:    { height: 5, width: '50%', borderRadius: 4 },
  emptyTitle:       { fontSize: 22, fontWeight: '800', letterSpacing: -0.4, marginTop: 26 },
  emptyBody:        { fontSize: 14, fontWeight: '500', lineHeight: 21, textAlign: 'center', maxWidth: 280, marginTop: 8 },
  createBtn:        { flexDirection: 'row', alignItems: 'center', gap: 8, height: 48, paddingHorizontal: 22, borderRadius: 24, marginTop: 22 },
  createBtnText:    { fontSize: 15, fontWeight: '700' },
});
