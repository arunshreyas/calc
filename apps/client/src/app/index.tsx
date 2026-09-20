import { useMemo, useState } from 'react';
import { Pressable, SafeAreaView, StatusBar, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';

type KeyTone = 'utility' | 'number' | 'operator' | 'equals';
type ChatMessage = { id: number; body: string; mine?: boolean; time: string };

const initialMessages: ChatMessage[] = [
  { id: 1, body: 'Hey, you found the quiet line.', time: '10:42' },
  { id: 2, body: 'It was hiding in plain sight.', mine: true, time: '10:43' },
  { id: 3, body: 'Exactly where it should be. ✦', time: '10:43' },
];
const keypad: { label: string; value: string; tone: KeyTone }[] = [
  { label: 'AC', value: 'AC', tone: 'utility' }, { label: '±', value: '±', tone: 'utility' }, { label: '%', value: '%', tone: 'utility' }, { label: '÷', value: '/', tone: 'operator' },
  { label: '7', value: '7', tone: 'number' }, { label: '8', value: '8', tone: 'number' }, { label: '9', value: '9', tone: 'number' }, { label: '×', value: '*', tone: 'operator' },
  { label: '4', value: '4', tone: 'number' }, { label: '5', value: '5', tone: 'number' }, { label: '6', value: '6', tone: 'number' }, { label: '−', value: '-', tone: 'operator' },
  { label: '1', value: '1', tone: 'number' }, { label: '2', value: '2', tone: 'number' }, { label: '3', value: '3', tone: 'number' }, { label: '+', value: '+', tone: 'operator' },
  { label: '0', value: '0', tone: 'number' }, { label: '.', value: '.', tone: 'number' }, { label: '=', value: '=', tone: 'equals' },
];
function calculate(expression: string) {
  if (!/^[0-9.+*/%()\- ]+$/.test(expression)) return null;
  try {
    const value = Function(`"use strict"; return (${expression})`)();
    return typeof value === 'number' && Number.isFinite(value) ? String(Number(value.toFixed(10))) : null;
  } catch { return null; }
}

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 880;
  const [display, setDisplay] = useState('0');
  const [previous, setPrevious] = useState('');
  const [unlockTrail, setUnlockTrail] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [authScreen, setAuthScreen] = useState<'signup' | 'login'>('signup');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [messageMode, setMessageMode] = useState(false);
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState(initialMessages);
  const expressionLabel = useMemo(() => previous ? previous.replace('*', '×').replace('/', '÷') : 'Calculator', [previous]);
  const tapKey = (value: string) => {
    if (value === 'AC') { setDisplay('0'); setPrevious(''); setUnlockTrail(''); return; }
    if (value === '±') { setDisplay((c) => c.startsWith('-') ? c.slice(1) : '-' + c); return; }
    if (value === '%') { const result = calculate(display); if (result) setDisplay(String(Number(result) / 100)); return; }
    if (value === '=') { const result = calculate(display); if (result) { setPrevious(display + ' ='); setDisplay(result); } return; }
    setPrevious('');
    setUnlockTrail((trail) => {
      const nextTrail = (trail + value).slice(-8);
      if (nextTrail.endsWith('08.20.26') || nextTrail.endsWith('8.20.26')) setMessageMode(true);
      return nextTrail;
    });
    setDisplay((current) => {
      const operator = ['+', '-', '*', '/'].includes(value);
      const next = current === '0' && !operator && value !== '.' ? value : current + value;
      return next;
    });
  };
  const sendMessage = () => {
    const body = draft.trim();
    if (!body) return;
    setMessages((current) => [...current, { id: Date.now(), body, mine: true, time: 'Now' }]);
    setDraft('');
  };
  const formReady = username.trim().length > 0 && password.length > 0 && (authScreen === 'login' || name.trim().length > 0);
  const submitAuth = () => {
    if (formReady) setAuthenticated(true);
  };
  if (!authenticated) return <SafeAreaView style={styles.safeArea}>
    <StatusBar barStyle="light-content" />
    <View style={styles.authPage}>
      <View style={styles.authGlowOne} /><View style={styles.authGlowTwo} />
      <View style={styles.authCard}>
        <View style={styles.authBrandRow}><Text style={styles.brand}>NUMBR</Text><View style={styles.authMark}><Text style={styles.authMarkText}>✦</Text></View></View>
        <View style={styles.authCopy}>
          <Text style={styles.authEyebrow}>{authScreen === 'signup' ? 'START HERE' : 'WELCOME BACK'}</Text>
          <Text style={styles.authTitle}>{authScreen === 'signup' ? 'Make numbers feel simple.' : 'Good to see you.'}</Text>
          <Text style={styles.authSubtitle}>{authScreen === 'signup' ? 'Create your local space in a moment.' : 'Sign in to return to your calculator.'}</Text>
        </View>
        <View style={styles.form}>
          {authScreen === 'signup' && <View style={styles.field}><Text style={styles.fieldLabel}>NAME</Text><TextInput value={name} onChangeText={setName} placeholder="Your name" placeholderTextColor="#777785" style={styles.authInput} autoCapitalize="words" autoComplete="name" /></View>}
          <View style={styles.field}><Text style={styles.fieldLabel}>USERNAME</Text><TextInput value={username} onChangeText={setUsername} placeholder="Choose a username" placeholderTextColor="#777785" style={styles.authInput} autoCapitalize="none" autoCorrect={false} autoComplete="username" /></View>
          <View style={styles.field}><Text style={styles.fieldLabel}>PASSWORD</Text><TextInput value={password} onChangeText={setPassword} placeholder="Create a password" placeholderTextColor="#777785" style={styles.authInput} secureTextEntry autoCapitalize="none" autoComplete={authScreen === 'signup' ? 'new-password' : 'current-password'} onSubmitEditing={submitAuth} returnKeyType="go" /></View>
        </View>
        <Pressable onPress={submitAuth} style={[styles.authSubmit, !formReady && styles.authSubmitMuted]}><Text style={styles.authSubmitText}>{authScreen === 'signup' ? 'Create account' : 'Log in'} <Text style={styles.authArrow}>→</Text></Text></Pressable>
        <View style={styles.authSwitch}><Text style={styles.authSwitchCopy}>{authScreen === 'signup' ? 'Already have an account?' : 'New to NUMBR?'}</Text><Pressable onPress={() => setAuthScreen(authScreen === 'signup' ? 'login' : 'signup')} hitSlop={8}><Text style={styles.authSwitchLink}>{authScreen === 'signup' ? 'Log in' : 'Sign up'}</Text></Pressable></View>
      </View>
      <Text style={styles.authFoot}>LOCAL UI DEMO · NO DATA IS SENT OR SAVED</Text>
    </View>
  </SafeAreaView>;
  if (messageMode) return <SafeAreaView style={styles.safeArea}>
    <StatusBar barStyle="light-content" />
    <View style={[styles.messagePage, isDesktop && styles.messagePageDesktop]}>
      <View style={styles.messageHeader}><Pressable onPress={() => setMessageMode(false)} hitSlop={12} style={styles.backButton}><Text style={styles.backArrow}>‹</Text></Pressable><View style={styles.avatar}><Text style={styles.avatarText}>M</Text></View><View style={styles.contactInfo}><Text style={styles.contactName}>Maya</Text><Text style={styles.onlineStatus}>Active now</Text></View><Pressable style={styles.headerAction}><Text style={styles.headerActionText}>•••</Text></Pressable></View>
      <View style={styles.messageIntro}><Text style={styles.messageEyebrow}>PRIVATE THREAD</Text><Text style={styles.messageTitle}>The quiet line</Text><Text style={styles.messageDate}>A small space, just for this conversation.</Text></View>
      <View style={styles.conversation}>{messages.map((message) => <View key={message.id} style={[styles.messageRow, message.mine && styles.messageRowMine]}><View style={[styles.bubble, message.mine ? styles.bubbleMine : styles.bubbleTheirs]}><Text style={[styles.bubbleText, message.mine && styles.bubbleTextMine]}>{message.body}</Text><Text style={[styles.messageTime, message.mine && styles.messageTimeMine]}>{message.time}</Text></View></View>)}</View>
      <View style={styles.composer}><TextInput value={draft} onChangeText={setDraft} onSubmitEditing={sendMessage} placeholder="Write a message" placeholderTextColor="#777785" style={styles.messageInput} returnKeyType="send" /><Pressable onPress={sendMessage} style={[styles.sendButton, !draft.trim() && styles.sendButtonMuted]}><Text style={styles.sendArrow}>↑</Text></Pressable></View>
    </View>
  </SafeAreaView>;
  return <SafeAreaView style={styles.safeArea}>
    <StatusBar barStyle="light-content" />
    <View style={[styles.app, isDesktop && styles.appDesktop]}>
      <View style={[styles.calculator, isDesktop && styles.calculatorDesktop]}>
        <View style={styles.topBar}><View><Text style={styles.brand}>NUMBR</Text><Text style={styles.modeLabel}>STANDARD</Text></View><View style={styles.topActions}><Pressable style={styles.roundAction}><Text style={styles.actionSymbol}>◷</Text></Pressable><Pressable style={styles.roundAction}><Text style={styles.actionSymbol}>☼</Text></Pressable></View></View>
        <View style={styles.displayArea}><Text style={styles.expression}>{expressionLabel}</Text><Text numberOfLines={1} adjustsFontSizeToFit style={styles.display}>{display.replace('*', '×').replace('/', '÷')}</Text></View>
        <View style={styles.keypad}>{keypad.map((key) => <Pressable key={key.label} onPress={() => tapKey(key.value)} style={({ pressed }) => [styles.key, key.label === '0' && styles.zeroKey, key.tone === 'utility' && styles.utilityKey, key.tone === 'operator' && styles.operatorKey, key.tone === 'equals' && styles.equalsKey, pressed && styles.keyPressed]}><Text style={[styles.keyText, key.tone === 'utility' && styles.utilityKeyText, (key.tone === 'operator' || key.tone === 'equals') && styles.accentKeyText]}>{key.label}</Text></Pressable>)}</View>
      </View>
      {isDesktop && <View style={styles.sidePanel}><Text style={styles.panelEyebrow}>TODAY'S NOTES</Text><Text style={styles.panelTitle}>Keep the math close.</Text><View style={styles.noteCard}><Text style={styles.noteLabel}>RECENT RESULT</Text><Text style={styles.noteValue}>1,280.50</Text><View style={styles.noteLine} /><Text style={styles.noteCopy}>A quieter way to do the everyday things.</Text></View><View style={styles.panelFoot}><Text style={styles.panelFootMark}>✦</Text><Text style={styles.panelFootText}>Everything stays on this device</Text></View></View>}
    </View>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#101014' }, app: { flex: 1, backgroundColor: '#101014' }, appDesktop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 70, paddingHorizontal: 48 },
  calculator: { flex: 1, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20, maxWidth: 550, alignSelf: 'center', width: '100%' }, calculatorDesktop: { flex: 0, flexGrow: 0, flexShrink: 0, flexBasis: 500, width: 500, minWidth: 500, paddingVertical: 42, borderRadius: 34, backgroundColor: '#17171c', borderWidth: 1, borderColor: '#2a2a31', shadowColor: '#000', shadowOpacity: 0.32, shadowRadius: 30, elevation: 12 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, brand: { color: '#f0efe9', fontSize: 18, letterSpacing: 3.5, fontWeight: '800' }, modeLabel: { color: '#777781', fontSize: 9, fontWeight: '700', letterSpacing: 1.7, marginTop: 4 }, topActions: { flexDirection: 'row', gap: 10 }, roundAction: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#202027', justifyContent: 'center', alignItems: 'center' }, actionSymbol: { color: '#e4e2dc', fontSize: 17 },
  displayArea: { flex: 1, minHeight: 150, justifyContent: 'flex-end', alignItems: 'flex-end', paddingBottom: 20 }, expression: { color: '#83838d', fontSize: 13, letterSpacing: 0.4, marginBottom: 10 }, display: { color: '#f6f3ec', fontSize: 64, fontWeight: '300', letterSpacing: -2, textAlign: 'right', width: '100%' },
  keypad: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 }, key: { flexBasis: '22.9%', flexGrow: 0, flexShrink: 0, aspectRatio: 1, borderRadius: 18, backgroundColor: '#24242b', justifyContent: 'center', alignItems: 'center' }, zeroKey: { flexBasis: '48.5%', aspectRatio: 2.1, alignItems: 'flex-start', paddingLeft: 29 }, utilityKey: { backgroundColor: '#b9b8b3' }, operatorKey: { backgroundColor: '#29272f', borderWidth: 1, borderColor: '#403d48' }, equalsKey: { backgroundColor: '#d8ff67' }, keyPressed: { opacity: 0.68, transform: [{ scale: 0.97 }] }, keyText: { color: '#f7f5ef', fontSize: 25, fontWeight: '500' }, utilityKeyText: { color: '#18181d', fontSize: 19 }, accentKeyText: { color: '#d8ff67', fontSize: 28 },
  sidePanel: { width: 310, alignSelf: 'center' }, panelEyebrow: { color: '#a4cf45', fontSize: 10, fontWeight: '800', letterSpacing: 2 }, panelTitle: { color: '#f4f2ea', fontSize: 40, lineHeight: 46, letterSpacing: -1.5, marginTop: 16, fontWeight: '400' }, noteCard: { marginTop: 34, backgroundColor: '#1d1d23', padding: 25, borderRadius: 20, borderWidth: 1, borderColor: '#2b2b33' }, noteLabel: { color: '#85858f', fontSize: 10, fontWeight: '700', letterSpacing: 1.6 }, noteValue: { color: '#f6f3ec', fontSize: 32, marginTop: 12, fontWeight: '300' }, noteLine: { height: 1, backgroundColor: '#34343d', marginVertical: 20 }, noteCopy: { color: '#aaa9b0', fontSize: 14, lineHeight: 21 }, panelFoot: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 24 }, panelFootMark: { color: '#d8ff67' }, panelFootText: { color: '#777781', fontSize: 12 },
  messagePage: { flex: 1, maxWidth: 760, width: '100%', alignSelf: 'center', backgroundColor: '#15151a' }, messagePageDesktop: { borderWidth: 1, borderColor: '#2a2a31', marginVertical: 26, borderRadius: 28, overflow: 'hidden', maxHeight: 820 }, messageHeader: { height: 76, borderBottomWidth: 1, borderBottomColor: '#29292f', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, gap: 12 }, backButton: { width: 32, alignItems: 'center' }, backArrow: { color: '#f5f2eb', fontSize: 36, lineHeight: 36, fontWeight: '200' }, avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#d8ff67', alignItems: 'center', justifyContent: 'center' }, avatarText: { color: '#161718', fontWeight: '800' }, contactInfo: { flex: 1 }, contactName: { color: '#f5f2eb', fontSize: 16, fontWeight: '700' }, onlineStatus: { color: '#a9d548', fontSize: 11, marginTop: 2 }, headerAction: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#24242b', alignItems: 'center', justifyContent: 'center' }, headerActionText: { color: '#e9e7e0', letterSpacing: 1, marginTop: -5 },
  messageIntro: { alignItems: 'center', paddingTop: 42, paddingBottom: 27 }, messageEyebrow: { color: '#a4cf45', fontSize: 10, letterSpacing: 1.8, fontWeight: '800' }, messageTitle: { color: '#f3f0e8', fontSize: 27, marginTop: 10, fontWeight: '400' }, messageDate: { color: '#85858f', marginTop: 7, fontSize: 12 }, conversation: { flex: 1, paddingHorizontal: 20, gap: 12, justifyContent: 'flex-end' }, messageRow: { alignItems: 'flex-start' }, messageRowMine: { alignItems: 'flex-end' }, bubble: { maxWidth: '78%', paddingHorizontal: 15, paddingVertical: 11, borderRadius: 18 }, bubbleTheirs: { backgroundColor: '#28282f', borderBottomLeftRadius: 4 }, bubbleMine: { backgroundColor: '#d8ff67', borderBottomRightRadius: 4 }, bubbleText: { color: '#f3f0e9', fontSize: 15, lineHeight: 20 }, bubbleTextMine: { color: '#1b1d16' }, messageTime: { color: '#8c8c96', fontSize: 9, marginTop: 5, alignSelf: 'flex-end' }, messageTimeMine: { color: '#627227' }, composer: { borderTopWidth: 1, borderTopColor: '#29292f', padding: 14, flexDirection: 'row', gap: 10, alignItems: 'center', marginTop: 20 }, messageInput: { flex: 1, backgroundColor: '#24242b', color: '#f3f0e9', minHeight: 46, borderRadius: 23, paddingHorizontal: 17, fontSize: 15 }, sendButton: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#d8ff67', alignItems: 'center', justifyContent: 'center' }, sendButtonMuted: { opacity: 0.38 }, sendArrow: { color: '#181a15', fontSize: 24, fontWeight: '700', marginTop: -3 },
  authPage: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 22, overflow: 'hidden' }, authGlowOne: { position: 'absolute', width: 370, height: 370, borderRadius: 185, backgroundColor: '#293417', opacity: 0.28, top: -140, right: -130 }, authGlowTwo: { position: 'absolute', width: 260, height: 260, borderRadius: 130, backgroundColor: '#222027', opacity: 0.8, bottom: -110, left: -90 },
  authCard: { width: '100%', maxWidth: 430, backgroundColor: '#19191f', borderWidth: 1, borderColor: '#303038', borderRadius: 26, padding: 26, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 24, elevation: 10 }, authBrandRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, authMark: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#d8ff67', alignItems: 'center', justifyContent: 'center' }, authMarkText: { color: '#1a1d16', fontSize: 17 }, authCopy: { marginTop: 34 }, authEyebrow: { color: '#a4cf45', fontSize: 10, fontWeight: '800', letterSpacing: 1.8 }, authTitle: { color: '#f5f2eb', fontSize: 30, lineHeight: 36, letterSpacing: -0.7, marginTop: 10 }, authSubtitle: { color: '#96959e', fontSize: 14, lineHeight: 20, marginTop: 8 }, form: { gap: 15, marginTop: 28 }, field: { gap: 7 }, fieldLabel: { color: '#94939b', fontSize: 10, fontWeight: '800', letterSpacing: 1.3 }, authInput: { minHeight: 50, backgroundColor: '#24242b', borderWidth: 1, borderColor: '#303039', borderRadius: 13, color: '#f5f2eb', paddingHorizontal: 15, fontSize: 15 }, authSubmit: { height: 52, borderRadius: 15, backgroundColor: '#d8ff67', justifyContent: 'center', alignItems: 'center', marginTop: 27 }, authSubmitMuted: { opacity: 0.35 }, authSubmitText: { color: '#171a14', fontSize: 15, fontWeight: '800' }, authArrow: { fontSize: 19 }, authSwitch: { flexDirection: 'row', justifyContent: 'center', gap: 5, marginTop: 22 }, authSwitchCopy: { color: '#888790', fontSize: 13 }, authSwitchLink: { color: '#d8ff67', fontSize: 13, fontWeight: '700' }, authFoot: { color: '#666570', fontSize: 9, letterSpacing: 1.2, marginTop: 22, textAlign: 'center' },
});
