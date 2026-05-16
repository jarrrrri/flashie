import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';

const CORRECT_PIN = '1234';
const STORAGE_KEY = 'flashie_unlocked';
const UNLOCK_DAYS = 30; // stay unlocked for 30 days

export function isUnlocked() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const { until } = JSON.parse(raw);
    return Date.now() < until;
  } catch { return false; }
}

export function storeUnlock() {
  try {
    const until = Date.now() + UNLOCK_DAYS * 24 * 60 * 60 * 1000;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ until }));
  } catch {}
}

export default function PinLockScreen({ onUnlock }) {
  const [digits, setDigits]     = useState([]);
  const [error, setError]       = useState(false);
  const shakeAnim               = useRef(new Animated.Value(0)).current;

  // Auto-submit when 4 digits entered
  useEffect(() => {
    if (digits.length === 4) {
      if (digits.join('') === CORRECT_PIN) {
        storeUnlock();
        onUnlock();
      } else {
        // Shake and reset
        setError(true);
        Animated.sequence([
          Animated.timing(shakeAnim, { toValue: 10,  duration: 60, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 8,   duration: 60, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: -8,  duration: 60, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 0,   duration: 60, useNativeDriver: true }),
        ]).start(() => {
          setDigits([]);
          setError(false);
        });
      }
    }
  }, [digits]);

  const press = (d) => {
    if (digits.length < 4) setDigits(prev => [...prev, d]);
  };
  const del = () => setDigits(prev => prev.slice(0, -1));

  const PAD = [
    ['1','2','3'],
    ['4','5','6'],
    ['7','8','9'],
    ['','0','⌫'],
  ];

  return (
    <View style={s.container}>
      {/* Logo */}
      <View style={s.logoBox}>
        <Text style={s.logoGlyph}>ƒ</Text>
      </View>
      <Text style={s.appName}>Flashie</Text>
      <Text style={s.subtitle}>Enter your PIN to continue</Text>

      {/* Dots */}
      <Animated.View style={[s.dotsRow, { transform: [{ translateX: shakeAnim }] }]}>
        {[0,1,2,3].map(i => (
          <View key={i} style={[
            s.dot,
            digits.length > i && { backgroundColor: error ? '#E5484D' : '#F4B6B6' }
          ]} />
        ))}
      </Animated.View>

      {error && <Text style={s.errorText}>Incorrect PIN</Text>}

      {/* Number pad */}
      <View style={s.pad}>
        {PAD.map((row, ri) => (
          <View key={ri} style={s.padRow}>
            {row.map((key, ki) => {
              if (key === '') return <View key={ki} style={s.padKeyEmpty} />;
              const isDelete = key === '⌫';
              return (
                <TouchableOpacity
                  key={ki}
                  style={s.padKey}
                  activeOpacity={0.6}
                  onPress={() => isDelete ? del() : press(key)}
                >
                  <Text style={[s.padKeyText, isDelete && s.padDeleteText]}>{key}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>

      <Text style={s.hint}>Staying unlocked for 30 days once correct</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#FAF7F2', alignItems: 'center', justifyContent: 'center', paddingBottom: 40 },
  logoBox:      { width: 72, height: 72, borderRadius: 20, backgroundColor: '#F4B6B6', alignItems: 'center', justifyContent: 'center', marginBottom: 14, shadowColor: '#F4B6B6', shadowOpacity: 0.5, shadowRadius: 16, shadowOffset: { width: 0, height: 6 } },
  logoGlyph:    { fontSize: 40, fontWeight: '900', color: '#7A3838' },
  appName:      { fontSize: 28, fontWeight: '900', color: '#29261B', letterSpacing: -0.5 },
  subtitle:     { fontSize: 14, color: 'rgba(41,38,27,0.55)', marginTop: 6, marginBottom: 36, fontWeight: '500' },
  dotsRow:      { flexDirection: 'row', gap: 16, marginBottom: 12 },
  dot:          { width: 14, height: 14, borderRadius: 7, backgroundColor: 'rgba(41,38,27,0.12)', borderWidth: 1.5, borderColor: 'rgba(41,38,27,0.15)' },
  errorText:    { fontSize: 13, color: '#E5484D', fontWeight: '600', marginBottom: 4, height: 20 },
  pad:          { marginTop: 28, gap: 12 },
  padRow:       { flexDirection: 'row', gap: 16 },
  padKey:       { width: 76, height: 76, borderRadius: 38, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', borderWidth: 0.5, borderColor: 'rgba(41,38,27,0.08)', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
  padKeyEmpty:  { width: 76, height: 76 },
  padKeyText:   { fontSize: 24, fontWeight: '600', color: '#29261B' },
  padDeleteText:{ fontSize: 20 },
  hint:         { marginTop: 32, fontSize: 12, color: 'rgba(41,38,27,0.35)', fontWeight: '500' },
});
