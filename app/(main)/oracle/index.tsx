import { useCallback, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { router } from 'expo-router';
import { Text } from '@/src/components/ui/Text';
import { colors } from '@/src/constants/colors';
import { fonts } from '@/src/constants/typography';
import { useOracleStore, type ChatMessage } from '@/src/stores/oracleStore';
import { useOnboardingStore } from '@/src/stores/onboardingStore';
import { useAuthStore } from '@/src/stores/authStore';
import { useSettingsStore } from '@/src/stores/settingsStore';
import { sendOracleMessage } from '@/src/services/oracle';
import { lightHaptic } from '@/src/utils/haptics';

// ---------------------------------------------------------------------------
// SVG Icons
// ---------------------------------------------------------------------------

function StarIcon({ size = 14, color = colors.gold.DEFAULT }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
    </Svg>
  );
}

function LockIcon({ size = 14, color = 'rgba(228,225,240,0.5)' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM9 8V6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9z" />
    </Svg>
  );
}

function BambooIcon({ size = 28, color = colors.gold.DEFAULT }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 2v20M12 6c-2 0-4-1-5-3M12 6c2 0 4-1 5-3M12 12c-2 0-4-1-5-3M12 12c2 0 4-1 5-3M12 18c-2 0-4-1-5-3M12 18c2 0 4-1 5-3" />
    </Svg>
  );
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content:
    'The constellations shift in your favor, seeker. I sense the threads of fate gathering around you. What whispers of destiny shall we decode from the astral tapestries?',
  timestamp: new Date().toISOString(),
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ModeToggle({
  mode,
  onSelect,
}: {
  mode: 'mordoo' | 'strategist';
  onSelect: (m: 'mordoo' | 'strategist') => void;
}) {
  return (
    <View style={styles.modeToggleContainer}>
      <View style={styles.modePill}>
        <Pressable
          style={[styles.modeBtn, mode === 'mordoo' && styles.modeBtnActive]}
          onPress={() => onSelect('mordoo')}
        >
          <View style={styles.modeBtnRow}>
            <StarIcon size={12} color={mode === 'mordoo' ? colors.onPrimary : 'rgba(228,225,240,0.7)'} />
            <Text style={[styles.modeBtnText, mode === 'mordoo' && styles.modeBtnTextActive]}>
              {' '}Mor Doo
            </Text>
          </View>
        </Pressable>
        <Pressable
          style={[styles.modeBtn, mode === 'strategist' && styles.modeBtnActive]}
          onPress={() => {
            /* locked — no-op */
          }}
        >
          <View style={styles.modeBtnRow}>
            <LockIcon size={12} />
            <Text style={[styles.modeBtnText, styles.modeBtnTextLocked]}>{' '}Strategist</Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

function SiamSiEntryCard() {
  return (
    <Pressable
      style={styles.siamSiCard}
      onPress={() => router.push('/(main)/oracle/siam-si')}
    >
      <BambooIcon size={28} />
      <View style={styles.siamSiTextContainer}>
        <Text style={styles.siamSiTitle}>SIAM SI</Text>
        <Text style={styles.siamSiSubtitle}>Shake for fortune sticks</Text>
      </View>
      <Text style={styles.siamSiArrow}>{'>'}</Text>
    </Pressable>
  );
}

function AiMessageBubble({ message }: { message: ChatMessage }) {
  const time = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
  return (
    <View style={styles.aiBubble}>
      <Text style={styles.aiBubbleBody}>{message.content}</Text>
      <View style={styles.aiBubbleFooter}>
        <Text style={styles.aiBubbleFooterText}>{time}</Text>
        <Text style={styles.aiBubbleFooterText}>{'  ·  DIVINE CONNECTION'}</Text>
      </View>
    </View>
  );
}

function UserMessageBubble({ message }: { message: ChatMessage }) {
  return (
    <View style={styles.userBubble}>
      <Text style={styles.userBubbleText}>{message.content}</Text>
    </View>
  );
}

function TypingIndicator() {
  return (
    <View style={styles.typingContainer}>
      <View style={styles.typingDots}>
        <View style={styles.typingDot} />
        <View style={styles.typingDot} />
        <View style={styles.typingDot} />
      </View>
      <Text style={styles.typingLabel}>ORACLE IS GAZING INTO THE VOID...</Text>
    </View>
  );
}

function QuotaExceeded() {
  return (
    <View style={styles.quotaCard}>
      <Text style={styles.quotaTitle}>DAILY WISDOM LIMIT REACHED</Text>
      <Text style={styles.quotaBody}>
        The stars need time to realign. Your next reading will be available tomorrow.
      </Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------

export default function OracleScreen() {
  const [mode, setMode] = useState<'mordoo' | 'strategist'>('mordoo');
  const [input, setInput] = useState('');
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const flatListRef = useRef<FlatList<ChatMessage>>(null);

  const authMode = useAuthStore((s) => s.authMode);
  const messages = useOracleStore((s) => s.messages);
  const isStreaming = useOracleStore((s) => s.isStreaming);
  const addMessage = useOracleStore((s) => s.addMessage);
  const appendToLastMessage = useOracleStore((s) => s.appendToLastMessage);
  const setStreaming = useOracleStore((s) => s.setStreaming);

  const birthData = useOnboardingStore((s) => s.birthData);
  const nameData = useOnboardingStore((s) => s.nameData);
  const concerns = useOnboardingStore((s) => s.concerns);

  const lang = useSettingsStore((s) => s.language);

  const displayMessages =
    messages.length === 0 ? [WELCOME_MESSAGE] : messages;

  const sendingRef = useRef(false);

  const sendMessage = useCallback(() => {
    const text = input.trim();
    if (!text || isStreaming || sendingRef.current) return;
    sendingRef.current = true;

    lightHaptic();
    setInput('');
    setQuotaExceeded(false);

    // Add user message
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };
    addMessage(userMsg);

    // If guest mode, navigate to sign-in
    if (!authMode) {
      sendingRef.current = false;
      router.push('/(onboarding)/soul-gate');
      return;
    }

    // Create placeholder assistant message for streaming
    const assistantMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
    };
    addMessage(assistantMsg);
    setStreaming(true);

    const birthPayload = birthData
      ? {
          dateOfBirth: birthData.dateOfBirth,
          fullName: nameData?.fullName,
          concerns: concerns,
        }
      : undefined;

    sendOracleMessage({
      message: text,
      birthData: birthPayload,
      lang,
      onChunk: (chunk) => {
        appendToLastMessage(chunk);
      },
      onDone: () => {
        setStreaming(false);
        sendingRef.current = false;
      },
      onError: (error) => {
        setStreaming(false);
        sendingRef.current = false;
        if (error.message === 'QUOTA_EXCEEDED') {
          setQuotaExceeded(true);
        } else {
          appendToLastMessage(
            '\n\n_The astral connection was disrupted. Please try again._',
          );
        }
      },
    });
  }, [
    input,
    isStreaming,
    authMode,
    birthData,
    nameData,
    concerns,
    lang,
    addMessage,
    appendToLastMessage,
    setStreaming,
  ]);

  const renderItem = useCallback(
    ({ item }: { item: ChatMessage }) => {
      if (item.role === 'assistant') return <AiMessageBubble message={item} />;
      return <UserMessageBubble message={item} />;
    },
    [],
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={80}
      >
        <FlatList
          ref={flatListRef}
          data={displayMessages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          inverted={false}
          keyboardDismissMode="on-drag"
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          ListHeaderComponent={
            <>
              <ModeToggle mode={mode} onSelect={setMode} />
              <SiamSiEntryCard />
            </>
          }
          ListFooterComponent={
            <>
              {isStreaming ? <TypingIndicator /> : null}
              {quotaExceeded ? <QuotaExceeded /> : null}
            </>
          }
        />
      </KeyboardAvoidingView>

      {/* Fixed input bar above tab bar */}
      <View style={styles.inputBar}>
        <View style={styles.inputBarInner}>
          <TextInput
            style={styles.textInput}
            value={input}
            onChangeText={setInput}
            placeholder="Ask the stars..."
            placeholderTextColor="rgba(228,225,240,0.4)"
            onSubmitEditing={sendMessage}
            returnKeyType="send"
            multiline={false}
            editable={!isStreaming}
          />

          <Pressable
            style={[styles.sendBtn, isStreaming && styles.sendBtnDisabled]}
            onPress={sendMessage}
            disabled={isStreaming}
          >
            <Svg width={16} height={16} viewBox="0 0 24 24" fill={colors.onPrimary}>
              <Path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </Svg>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.night.DEFAULT,
  },

  // ---- Message list ----
  messageList: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 160,
    gap: 16,
  },

  // ---- Mode Toggle ----
  modeToggleContainer: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 12,
  },
  modePill: {
    flexDirection: 'row',
    backgroundColor: 'rgba(13,13,23,0.8)',
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: 'rgba(77,70,55,0.3)',
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  modeBtn: {
    borderRadius: 9999,
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  modeBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modeBtnEmoji: {
    fontSize: 14,
  },
  modeBtnActive: {
    backgroundColor: colors.gold.DEFAULT,
  },
  modeBtnText: {
    fontFamily: fonts.display.regular,
    fontSize: 14,
    color: 'rgba(228,225,240,0.7)',
  },
  modeBtnTextActive: {
    color: colors.onPrimary,
    fontFamily: fonts.display.bold,
  },
  modeBtnTextLocked: {
    color: 'rgba(228,225,240,0.5)',
  },

  // ---- Siam Si Entry Card ----
  siamSiCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.night.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gold.border,
    padding: 16,
    gap: 12,
  },
  siamSiIcon: {
    fontSize: 28,
  },
  siamSiTextContainer: {
    flex: 1,
    gap: 2,
  },
  siamSiTitle: {
    fontFamily: fonts.display.bold,
    fontSize: 14,
    color: colors.gold.DEFAULT,
    letterSpacing: 3,
  },
  siamSiSubtitle: {
    fontFamily: fonts.body.regular,
    fontSize: 14,
    color: colors.onSurfaceVariant,
  },
  siamSiArrow: {
    fontFamily: fonts.display.bold,
    fontSize: 18,
    color: colors.gold.DEFAULT,
  },

  // ---- AI Bubble ----
  aiBubble: {
    maxWidth: '90%',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(41,41,52,0.9)',
    padding: 14,
    borderRadius: 14,
    borderLeftWidth: 3,
    borderLeftColor: colors.gold.DEFAULT,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    gap: 4,
  },
  aiBubbleBody: {
    fontFamily: fonts.body.regular,
    fontSize: 15,
    fontStyle: 'italic',
    color: colors.onSurface,
    lineHeight: 22,
  },
  aiBubbleFooter: {
    flexDirection: 'row',
    marginTop: 4,
  },
  aiBubbleFooterText: {
    fontFamily: fonts.display.regular,
    fontSize: 10,
    color: 'rgba(201,168,76,0.6)',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },

  // ---- User Bubble ----
  userBubble: {
    maxWidth: '90%',
    alignSelf: 'flex-end',
    backgroundColor: colors.surface.containerLowest,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(77,70,55,0.2)',
  },
  userBubbleText: {
    fontFamily: fonts.body.regular,
    fontSize: 15,
    color: 'rgba(228,225,240,0.95)',
    lineHeight: 22,
  },

  // ---- Typing Indicator ----
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  typingDots: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gold.DEFAULT,
  },
  typingLabel: {
    fontFamily: fonts.display.regular,
    fontSize: 10,
    color: 'rgba(201,168,76,0.8)',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },

  // ---- Quota Exceeded ----
  quotaCard: {
    backgroundColor: colors.night.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.energy.low,
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  quotaTitle: {
    fontFamily: fonts.display.bold,
    fontSize: 12,
    color: colors.energy.low,
    letterSpacing: 3,
  },
  quotaBody: {
    fontFamily: fonts.body.regular,
    fontSize: 16,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 24,
  },

  // ---- Input Bar ----
  inputBar: {
    position: 'absolute',
    bottom: 96,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
  },
  inputBarInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(13,13,23,0.95)',
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.3)',
    borderRadius: 16,
    padding: 8,
    paddingRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: 'transparent',
    fontFamily: fonts.body.regular,
    fontSize: 20,
    color: colors.onSurface,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.gold.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
  sendBtnText: {
    fontSize: 16,
    color: colors.onPrimary,
  },
});
