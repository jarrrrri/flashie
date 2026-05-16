import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, StyleSheet } from 'react-native';
import { useAppTheme } from '../App';
import { THEMES } from './theme';

export default function MenuScreen({ navigation }) {
  const { theme, themeKey, settings, updateSetting } = useAppTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.bg }]}
      contentContainerStyle={{ paddingBottom: 130 }} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.profileLabel, { color: theme.muted }]}>PROFILE</Text>
        <Text style={[styles.title, { color: theme.ink }]}>Menu</Text>
      </View>

      {/* Profile chip */}
      <View style={[styles.profileCard, { backgroundColor: theme.surface, borderColor: theme.faint }]}>
        <View style={[styles.avatar, { backgroundColor: theme.accent }]}>
          <Text style={[styles.avatarText, { color: theme.accentInk }]}>F</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.profileName, { color: theme.ink }]}>Flashie Learner</Text>
          <Text style={[styles.profileSub, { color: theme.muted }]}>Free plan</Text>
        </View>
        <TouchableOpacity style={[styles.upgradeBtn, { backgroundColor: theme.surfaceAlt }]}>
          <Text style={[styles.upgradeText, { color: theme.ink }]}>Upgrade</Text>
        </TouchableOpacity>
      </View>

      <MenuGroup theme={theme} label="Appearance">
        <NavRow theme={theme} label="Theme" icon="◐" detail={THEMES[themeKey]?.name || 'Minimal White'}
          onPress={() => navigation.navigate('Themes')} />
        <Separator theme={theme} />
        <ToggleRow theme={theme} label="Dark mode" icon="🌙" value={themeKey === 'dark'}
          onChange={v => v ? updateSetting('darkMode', true) : null} />
      </MenuGroup>

      <MenuGroup theme={theme} label="Study">
        <ToggleRow theme={theme} label="Vibration on flip" icon="〰" value={settings.haptics}    onChange={v => updateSetting('haptics', v)} />
        <Separator theme={theme} />
        <ToggleRow theme={theme} label="Sound effects"     icon="🔊" value={settings.sound}     onChange={v => updateSetting('sound', v)} />
        <Separator theme={theme} />
        <ToggleRow theme={theme} label="Smooth animation"  icon="✦"  value={settings.animation} onChange={v => updateSetting('animation', v)} />
        <Separator theme={theme} />
        <ToggleRow theme={theme} label="Shake to flip"     icon="↻"  value={settings.shake}     onChange={v => updateSetting('shake', v)} />
      </MenuGroup>

      <MenuGroup theme={theme} label="Daily Practice">
        <NavRow theme={theme} label="Daily goal" icon="◯" detail={`${settings.dailyGoal} cards`} chevron={false} />
        <Separator theme={theme} />
        <ToggleRow theme={theme} label="Daily reminder" icon="◔" value={settings.reminder} onChange={v => updateSetting('reminder', v)} />
      </MenuGroup>

      <MenuGroup theme={theme} label="About">
        <NavRow theme={theme} label="Help & support"  icon="?" />
        <Separator theme={theme} />
        <NavRow theme={theme} label="Privacy policy"  icon="◐" />
        <Separator theme={theme} />
        <NavRow theme={theme} label="Version" icon="◌" detail="1.0.0" chevron={false} />
      </MenuGroup>
    </ScrollView>
  );
}

function MenuGroup({ theme, label, children }) {
  return (
    <View style={styles.group}>
      <Text style={[styles.groupLabel, { color: theme.muted }]}>{label.toUpperCase()}</Text>
      <View style={[styles.groupCard, { backgroundColor: theme.surface, borderColor: theme.faint }]}>
        {children}
      </View>
    </View>
  );
}

function ToggleRow({ theme, label, icon, value, onChange }) {
  return (
    <View style={styles.row}>
      <View style={[styles.iconBubble, { backgroundColor: theme.surfaceAlt }]}>
        <Text style={{ fontSize: 14, color: theme.muted }}>{icon}</Text>
      </View>
      <Text style={[styles.rowLabel, { color: theme.ink }]}>{label}</Text>
      <Switch
        value={!!value}
        onValueChange={onChange}
        trackColor={{ false: theme.faint, true: theme.accent }}
        thumbColor="#fff"
        ios_backgroundColor={theme.faint}
      />
    </View>
  );
}

function NavRow({ theme, label, icon, detail, chevron = true, onPress }) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
      <View style={[styles.iconBubble, { backgroundColor: theme.surfaceAlt }]}>
        <Text style={{ fontSize: 14, color: theme.muted }}>{icon}</Text>
      </View>
      <Text style={[styles.rowLabel, { color: theme.ink }]}>{label}</Text>
      {detail && <Text style={[styles.rowDetail, { color: theme.muted }]}>{detail}</Text>}
      {chevron && <Text style={[styles.chevron, { color: theme.muted }]}>›</Text>}
    </TouchableOpacity>
  );
}

function Separator({ theme }) {
  return <View style={[styles.separator, { backgroundColor: theme.faint }]} />;
}

const styles = StyleSheet.create({
  container:   { flex: 1 },
  header:      { paddingHorizontal: 22, paddingTop: 110, paddingBottom: 6 },
  profileLabel:{ fontSize: 13, fontWeight: '600', letterSpacing: 0.4, textTransform: 'uppercase' },
  title:       { fontSize: 30, fontWeight: '800', letterSpacing: -0.5, marginTop: 2 },
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: 14, marginHorizontal: 22, marginTop: 14, marginBottom: 6, paddingHorizontal: 16, paddingVertical: 14, borderRadius: 20, borderWidth: 0.5 },
  avatar:      { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  avatarText:  { fontSize: 19, fontWeight: '800' },
  profileName: { fontSize: 16, fontWeight: '700', letterSpacing: -0.2 },
  profileSub:  { fontSize: 13, marginTop: 1, fontWeight: '500' },
  upgradeBtn:  { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  upgradeText: { fontSize: 12, fontWeight: '700' },
  group:       { marginTop: 22 },
  groupLabel:  { fontSize: 11, fontWeight: '700', letterSpacing: 1, paddingHorizontal: 28, paddingBottom: 8 },
  groupCard:   { marginHorizontal: 22, borderRadius: 18, borderWidth: 0.5, overflow: 'hidden' },
  row:         { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, paddingHorizontal: 14, minHeight: 48 },
  iconBubble:  { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  rowLabel:    { flex: 1, fontSize: 15, fontWeight: '600', letterSpacing: -0.1 },
  rowDetail:   { fontSize: 14, fontWeight: '500' },
  chevron:     { fontSize: 18, opacity: 0.5 },
  separator:   { height: 0.5, marginHorizontal: 14 },
});
