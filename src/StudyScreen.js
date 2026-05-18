import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Dimensions,
  PanResponder, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../App';

const { width: SCREEN_W } = Dimensions.get('window');

export default function StudyScreen({ navigation, route }) {
  const { theme } = useAppTheme();
  const { deck } = route.params;
  const cards = deck.cards;

  const [index,     setIndex]     = useState(0);
  const [flipped,   setFlipped]   = useState(false);
  const [completed, setCompleted] = useState(false);
  const flipAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const rotAnim   = useRef(new Animated.Value(0)).current;

  const card = cards[index];
  const progress = (index + 1) / cards.length;
  const isJapanese = deck.id === 'jlpt-n5' || /[぀-ヿ㐀-鿿]/.test(card.front);

  const flip = () => {
    const toValue = flipped ? 0 : 180;
    Animated.spring(flipAnim, { toValue, useNativeDriver: true, friction: 8 }).start();
    setFlipped(f => !f);
  };

  const navigate = (dir) => {
    const newIndex = index + dir;
    if (newIndex < 0) return;
    if (newIndex >= cards.length) { setCompleted(true); return; }
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: dir * -SCREEN_W, duration: 220, useNativeDriver: true }),
      Animated.timing(rotAnim,   { toValue: dir * -10,       duration: 220, useNativeDriver: true }),
    ]).start(() => {
      setIndex(newIndex);
      setFlipped(false);
      flipAnim.setValue(0);
      slideAnim.setValue(dir * SCREEN_W);
      rotAnim.setValue(0);
      Animated.timing(slideAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start();
    });
  };

  // Always keep refs pointing to the latest functions so the PanResponder
  // (created once on mount) never uses stale closures.
  const navigateRef = useRef(navigate);
  const flipRef     = useRef(flip);
  navigateRef.current = navigate;
  flipRef.current     = flip;

  const panResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 10,
    onPanResponderMove: (_, g) => {
      slideAnim.setValue(g.dx * 0.5);
      rotAnim.setValue(g.dx * 0.02);
    },
    onPanResponderRelease: (_, g) => {
      if (Math.abs(g.dx) > 80) {
        navigateRef.current(g.dx < 0 ? 1 : -1);
      } else if (Math.abs(g.dx) < 6 && Math.abs(g.dy) < 6) {
        Animated.parallel([
          Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true }),
          Animated.spring(rotAnim,   { toValue: 0, useNativeDriver: true }),
        ]).start();
        flipRef.current();
      } else {
        Animated.parallel([
          Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true }),
          Animated.spring(rotAnim,   { toValue: 0, useNativeDriver: true }),
        ]).start();
      }
    },
  })).current;

  const restart = () => {
    setIndex(0);
    setFlipped(false);
    setCompleted(false);
    flipAnim.setValue(0);
    slideAnim.setValue(0);
    rotAnim.setValue(0);
  };

  if (completed) {
    return <CompletionScreen theme={theme} deck={deck} onRestart={restart} onBack={() => navigation.goBack()} />;
  }

  const frontRotate  = flipAnim.interpolate({ inputRange: [0, 180], outputRange: ['0deg', '180deg'] });
  const backRotate   = flipAnim.interpolate({ inputRange: [0, 180], outputRange: ['180deg', '360deg'] });
  const frontOpacity = flipAnim.interpolate({ inputRange: [89, 90], outputRange: [1, 0] });
  const backOpacity  = flipAnim.interpolate({ inputRange: [89, 90], outputRange: [0, 1] });

  const rotDeg = rotAnim.interpolate({ inputRange: [-180, 180], outputRange: ['-180deg', '180deg'] });

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.iconBtn, { backgroundColor: theme.surface, borderColor: theme.faint }]}>
          <Ionicons name="close" size={20} color={theme.ink} />
        </TouchableOpacity>
        <View style={{ alignItems: 'center' }}>
          <Text style={[styles.deckName, { color: theme.muted }]}>{deck.name.toUpperCase()}</Text>
          <Text style={[styles.counter, { color: theme.ink }]}>
            <Text style={{ fontWeight: '700' }}>{index + 1}</Text>
            <Text style={{ color: theme.muted, fontWeight: '500' }}> / {cards.length}</Text>
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.iconBtn, { backgroundColor: theme.surface, borderColor: theme.faint }]}
          onPress={() => { const r = Math.floor(Math.random() * cards.length); setIndex(r); setFlipped(false); flipAnim.setValue(0); }}>
          <Ionicons name="shuffle" size={20} color={theme.ink} />
        </TouchableOpacity>
      </View>

      {/* Progress bar */}
      <View style={[styles.progressBg, { backgroundColor: theme.faint }]}>
        <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: theme.accent }]} />
      </View>

      {/* Hint */}
      <Text style={[styles.tapHint, { color: theme.muted, opacity: flipped ? 0 : 1 }]}>TAP TO FLIP</Text>

      {/* Card */}
      <View style={styles.cardStage} {...panResponder.panHandlers}>
        {!isLast && (
          <View style={[styles.peekCard, { backgroundColor: theme.surfaceAlt, borderColor: theme.faint }]} />
        )}

        <Animated.View style={[styles.cardWrap, { transform: [{ translateX: slideAnim }, { rotate: rotDeg }] }]}>
          {/* Front */}
          <Animated.View style={[styles.card, { backgroundColor: theme.cardFront, borderColor: theme.faint, transform: [{ rotateY: frontRotate }], opacity: frontOpacity }]}>
            {theme.glyph && <Text style={[styles.cardGlyph, { color: theme.muted }]}>{theme.glyph}</Text>}
            <Text style={[styles.cardSideLabel, { color: theme.muted }]}>A</Text>
            <Text style={[styles.cardWord, { fontSize: isJapanese ? 88 : 44, fontWeight: isJapanese ? '600' : '700', color: theme.ink }]}>{card.front}</Text>
            <Text style={[styles.cardType, { color: theme.muted }]}>{isJapanese ? 'KANJI' : 'VOCABULARY'}</Text>
          </Animated.View>

          {/* Back */}
          <Animated.View style={[styles.card, { backgroundColor: theme.cardBack, borderColor: theme.faint, transform: [{ rotateY: backRotate }], opacity: backOpacity }]}>
            {theme.glyph && <Text style={[styles.cardGlyph, { color: theme.muted }]}>{theme.glyph}</Text>}
            <Text style={[styles.cardSideLabel, { color: theme.muted }]}>B</Text>
            <Text style={[styles.meaningLabel, { color: theme.muted }]}>MEANING</Text>
            <Text style={[styles.cardMeaning, { color: theme.ink }]}>{card.back}</Text>
            {card.example ? (
              <View style={styles.exampleWrap}>
                <View style={[styles.exampleDivider, { backgroundColor: theme.faint }]} />
                <Text style={[styles.exampleLabel, { color: theme.muted }]}>EXAMPLE</Text>
                <Text style={[styles.exampleText, { color: theme.muted }]}>{card.example}</Text>
              </View>
            ) : null}
          </Animated.View>
        </Animated.View>
      </View>

      {/* Bottom controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          onPress={() => navigate(-1)}
          style={[styles.navBtn, { backgroundColor: theme.surface, borderColor: theme.faint, opacity: index === 0 ? 0.4 : 1 }]}
          disabled={index === 0}>
          <Ionicons name="chevron-back" size={22} color={theme.ink} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.flipBtn, { backgroundColor: theme.accent }]} onPress={flip} activeOpacity={0.8}>
          <Text style={[styles.flipBtnText, { color: theme.accentInk }]}>{flipped ? 'Show vocabulary' : 'Reveal meaning'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navBtn, { backgroundColor: theme.surface, borderColor: theme.faint }]}
          onPress={() => navigate(1)}>
          <Ionicons name="chevron-forward" size={22} color={theme.ink} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const CELEBRATION_MESSAGES = [
  { headline: 'You made it!',     sub: 'Every card reviewed. That\'s a win.' },
  { headline: 'Great job!',       sub: 'You finished the whole deck. Keep it up!' },
  { headline: 'Nice work!',       sub: 'Your vocabulary is growing every day.' },
  { headline: 'Deck complete!',   sub: 'Come back tomorrow to reinforce what you learned.' },
  { headline: 'You crushed it!',  sub: 'One deck down. What\'s next?' },
];

function CompletionScreen({ theme, deck, onRestart, onBack }) {
  const msg = CELEBRATION_MESSAGES[deck.cards.length % CELEBRATION_MESSAGES.length];
  return (
    <View style={[cs.container, { backgroundColor: theme.bg }]}>
      {/* Celebration card illustration */}
      <View style={cs.illustration}>
        <View style={[cs.confCard2, { backgroundColor: theme.surfaceAlt, borderColor: theme.faint }]} />
        <View style={[cs.confCard1, { backgroundColor: theme.surface, borderColor: theme.faint }]}>
          <Text style={cs.emoji}>🎉</Text>
        </View>
      </View>

      <Text style={[cs.headline, { color: theme.ink }]}>{msg.headline}</Text>
      <Text style={[cs.sub, { color: theme.muted }]}>{msg.sub}</Text>

      <View style={cs.statsRow}>
        <View style={[cs.statBox, { backgroundColor: theme.surface, borderColor: theme.faint }]}>
          <Text style={[cs.statNum, { color: theme.ink }]}>{deck.cards.length}</Text>
          <Text style={[cs.statLabel, { color: theme.muted }]}>CARDS</Text>
        </View>
        <View style={[cs.statBox, { backgroundColor: theme.surface, borderColor: theme.faint }]}>
          <Text style={[cs.statNum, { color: theme.accent }]}>100%</Text>
          <Text style={[cs.statLabel, { color: theme.muted }]}>COMPLETE</Text>
        </View>
      </View>

      <TouchableOpacity style={[cs.restartBtn, { backgroundColor: theme.accent }]} onPress={onRestart} activeOpacity={0.8}>
        <Ionicons name="refresh" size={18} color={theme.accentInk} />
        <Text style={[cs.restartText, { color: theme.accentInk }]}>Restart deck</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[cs.backBtn, { borderColor: theme.faint }]} onPress={onBack} activeOpacity={0.7}>
        <Text style={[cs.backText, { color: theme.muted }]}>Back to flashcards</Text>
      </TouchableOpacity>
    </View>
  );
}

const cs = StyleSheet.create({
  container:  { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28, paddingBottom: 60 },
  illustration:{ position: 'relative', width: 180, height: 140, marginBottom: 32 },
  confCard2:  { position: 'absolute', inset: 0, borderRadius: 24, borderWidth: 0.5, transform: [{ rotate: '-8deg' }, { scaleX: 0.9 }] },
  confCard1:  { position: 'absolute', inset: 0, borderRadius: 24, borderWidth: 0.5, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 16, shadowOffset: { width: 0, height: 6 } },
  emoji:      { fontSize: 52 },
  headline:   { fontSize: 32, fontWeight: '900', letterSpacing: -0.6, textAlign: 'center' },
  sub:        { fontSize: 15, fontWeight: '500', textAlign: 'center', lineHeight: 22, marginTop: 8, maxWidth: 280 },
  statsRow:   { flexDirection: 'row', gap: 12, marginTop: 28 },
  statBox:    { flex: 1, borderRadius: 18, borderWidth: 0.5, paddingVertical: 16, alignItems: 'center', gap: 4 },
  statNum:    { fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
  statLabel:  { fontSize: 11, fontWeight: '700', letterSpacing: 1.2 },
  restartBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 52, paddingHorizontal: 28, borderRadius: 26, marginTop: 28 },
  restartText:{ fontSize: 16, fontWeight: '700' },
  backBtn:    { marginTop: 12, height: 48, paddingHorizontal: 28, borderRadius: 24, borderWidth: 0.5, alignItems: 'center', justifyContent: 'center' },
  backText:   { fontSize: 15, fontWeight: '600' },
});

const styles = StyleSheet.create({
  container:    { flex: 1 },
  topBar:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 22, paddingTop: 56, paddingBottom: 6 },
  iconBtn:      { width: 40, height: 40, borderRadius: 20, borderWidth: 0.5, alignItems: 'center', justifyContent: 'center' },
  deckName:     { fontSize: 12, fontWeight: '600', letterSpacing: 0.4 },
  counter:      { fontSize: 15, marginTop: 1 },
  progressBg:   { height: 4, marginHorizontal: 22, borderRadius: 999, marginTop: 10, overflow: 'hidden' },
  progressFill: { height: 4, borderRadius: 999 },
  tapHint:      { textAlign: 'center', fontSize: 12, fontWeight: '600', letterSpacing: 0.4, marginTop: 16, textTransform: 'uppercase' },
  cardStage:    { flex: 1, marginHorizontal: 22, marginTop: 14, position: 'relative' },
  cardWrap:     { position: 'absolute', inset: 0 },
  peekCard:     { position: 'absolute', bottom: -8, left: 0, right: 0, borderRadius: 28, borderWidth: 0.5, height: '100%', transform: [{ scaleX: 0.96 }], opacity: 0.7 },
  card:         { position: 'absolute', inset: 0, borderRadius: 28, borderWidth: 0.5, backfaceVisibility: 'hidden', alignItems: 'center', justifyContent: 'center', padding: 28, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 16, shadowOffset: { width: 0, height: 6 } },
  cardGlyph:    { position: 'absolute', top: 14, right: 18, fontSize: 22 },
  cardSideLabel:{ position: 'absolute', top: 16, left: 18, fontSize: 11, fontWeight: '700', letterSpacing: 1.2 },
  cardWord:     { textAlign: 'center', letterSpacing: -1 },
  cardType:     { fontSize: 12, fontWeight: '600', letterSpacing: 1.2, marginTop: 18, textTransform: 'uppercase' },
  meaningLabel: { fontSize: 12, fontWeight: '600', letterSpacing: 1.2, marginBottom: 14, textTransform: 'uppercase' },
  cardMeaning:  { fontSize: 26, fontWeight: '700', textAlign: 'center', lineHeight: 34, letterSpacing: -0.4 },
  exampleWrap:  { width: '85%', marginTop: 22, alignItems: 'center' },
  exampleDivider:{ height: 0.5, width: '100%', marginBottom: 10 },
  exampleLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6 },
  exampleText:  { fontSize: 14, textAlign: 'center', fontStyle: 'italic', lineHeight: 21 },
  controls:     { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 22, paddingBottom: 40, paddingTop: 18 },
  navBtn:       { width: 56, height: 56, borderRadius: 28, borderWidth: 0.5, alignItems: 'center', justifyContent: 'center' },
  flipBtn:      { flex: 1, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  flipBtnText:  { fontSize: 16, fontWeight: '700' },

});
