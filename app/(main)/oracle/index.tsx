import { useCallback, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Markdown from 'react-native-markdown-display';
import { router } from 'expo-router';
import { Text } from '@/src/components/ui/Text';
import { StarIcon, LockIcon, BambooIcon, SendArrowIcon } from '@/src/components/icons/TarotIcons';
import { colors } from '@/src/constants/colors';
import { fonts } from '@/src/constants/typography';
import { useOracleStore, type ChatMessage } from '@/src/stores/oracleStore';
import { useOnboardingStore } from '@/src/stores/onboardingStore';
import { useAuthStore } from '@/src/stores/authStore';
import { useSettingsStore } from '@/src/stores/settingsStore';
import { sendOracleMessage } from '@/src/services/oracle';
import { lightHaptic } from '@/src/utils/haptics';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content:
    'The constellations shift in your favor, seeker. What shall we decode from the stars?',
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
            <StarIcon size={11} color={mode === 'mordoo' ? colors.onPrimary : 'rgba(228,225,240,0.7)'} />
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
            <LockIcon size={11} />
            <Text style={[styles.modeBtnText, styles.modeBtnTextLocked]}>{' '}Strategist</Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}


// eslint-disable-next-line @typescript-eslint/no-var-requires
const mordooAvatar = require('@/assets/images/mordoo-avatar.png');

const markdownStyles = {
  body: {
    fontFamily: fonts.body.regular,
    fontSize: 15,
    color: colors.onSurface,
    lineHeight: 21,
  },
  paragraph: {
    marginTop: 0,
    marginBottom: 4,
  },
  strong: {
    fontFamily: fonts.body.semibold,
    color: colors.gold.light,
  },
  em: {
    fontFamily: fonts.body.regular,
    fontStyle: 'italic' as const,
    color: colors.onSurface,
  },
  bullet_list: {
    marginTop: 2,
    marginBottom: 2,
  },
  ordered_list: {
    marginTop: 2,
    marginBottom: 2,
  },
  list_item: {
    marginTop: 1,
    marginBottom: 1,
  },
  heading1: {
    fontFamily: fonts.display.bold,
    fontSize: 18,
    color: colors.gold.light,
    marginTop: 4,
    marginBottom: 4,
  },
  heading2: {
    fontFamily: fonts.display.bold,
    fontSize: 16,
    color: colors.gold.light,
    marginTop: 4,
    marginBottom: 4,
  },
  heading3: {
    fontFamily: fonts.body.semibold,
    fontSize: 15,
    color: colors.gold.light,
    marginTop: 2,
    marginBottom: 2,
  },
};

function AiMessageBubble({ message }: { message: ChatMessage }) {
  const time = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
  return (
    <View style={styles.aiRow}>
      <Image source={mordooAvatar} style={styles.avatar} />
      <View style={styles.aiBubble}>
        <Markdown style={markdownStyles}>{message.content}</Markdown>
        <Text style={styles.aiBubbleTime}>{time}</Text>
      </View>
    </View>
  );
}

function UserMessageBubble({ message }: { message: ChatMessage }) {
  const time = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
  return (
    <View style={styles.userBubble}>
      <Text style={styles.userBubbleText}>{message.content}</Text>
      <Text style={styles.userBubbleTime}>{time}</Text>
    </View>
  );
}

function TypingIndicator() {
  return (
    <View style={styles.aiRow}>
      <Image source={mordooAvatar} style={styles.avatar} />
      <View style={styles.typingContainer}>
        <View style={styles.typingDots}>
          <View style={styles.typingDot} />
          <View style={styles.typingDot} />
          <View style={styles.typingDot} />
        </View>
      </View>
    </View>
  );
}

function QuotaExceeded() {
  return (
    <View style={styles.quotaCard}>
      <Text style={styles.quotaTitle}>DAILY LIMIT REACHED</Text>
      <Text style={styles.quotaBody}>
        Your next reading will be available tomorrow.
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

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const messages = useOracleStore((s) => s.messages);
  const isStreaming = useOracleStore((s) => s.isStreaming);
  const addMessage = useOracleStore((s) => s.addMessage);
  const removeLastMessage = useOracleStore((s) => s.removeLastMessage);
  const appendToLastMessage = useOracleStore((s) => s.appendToLastMessage);
  const setStreaming = useOracleStore((s) => s.setStreaming);

  const birthData = useOnboardingStore((s) => s.birthData);
  const nameData = useOnboardingStore((s) => s.nameData);
  const concerns = useOnboardingStore((s) => s.concerns);

  const lang = useSettingsStore((s) => s.language);

  const displayMessages =
    messages.length === 0 ? [WELCOME_MESSAGE] : messages;

  // Inverted FlatList needs data in reverse order
  const invertedMessages = [...displayMessages].reverse();

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

    // If not authenticated, navigate to sign-in
    if (!isAuthenticated) {
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
          removeLastMessage(); // Remove empty assistant placeholder
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
    isAuthenticated,
    birthData,
    nameData,
    concerns,
    lang,
    addMessage,
    removeLastMessage,
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
      {/* Compact header with mode toggle and Siam Si */}
      <View style={styles.header}>
        <ModeToggle mode={mode} onSelect={setMode} />
        <Pressable
          style={styles.siamSiBtn}
          onPress={() => router.push('/(main)/oracle/siam-si')}
        >
          <BambooIcon size={18} />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatListRef}
          data={invertedMessages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          inverted={true}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.messageList}
          ListHeaderComponent={
            <>
              {isStreaming ? <TypingIndicator /> : null}
              {quotaExceeded ? <QuotaExceeded /> : null}
            </>
          }
        />

        {/* Input bar — inside KAV so it moves with keyboard */}
        <View style={styles.inputBar}>
          <View style={styles.inputBarInner}>
            <TextInput
              style={styles.textInput}
              value={input}
              onChangeText={setInput}
              placeholder="Ask the stars..."
              placeholderTextColor="rgba(228,225,240,0.35)"
              onSubmitEditing={sendMessage}
              returnKeyType="send"
              multiline={true}
              maxLength={500}
              editable={!isStreaming}
            />

            <Pressable
              style={[styles.sendBtn, (!input.trim() || isStreaming) && styles.sendBtnDisabled]}
              onPress={sendMessage}
              disabled={isStreaming || !input.trim()}
            >
              <SendArrowIcon size={16} color={colors.onPrimary} />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
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

  // ---- Header ----
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(201,168,76,0.15)',
  },
  siamSiBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(201,168,76,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ---- Message list ----
  messageList: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 8,
    gap: 6,
  },

  // ---- Mode Toggle ----
  modeToggleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  modePill: {
    flexDirection: 'row',
    backgroundColor: 'rgba(13,13,23,0.8)',
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: 'rgba(77,70,55,0.3)',
    padding: 3,
  },
  modeBtn: {
    borderRadius: 9999,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  modeBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modeBtnActive: {
    backgroundColor: colors.gold.DEFAULT,
  },
  modeBtnText: {
    fontFamily: fonts.display.regular,
    fontSize: 12,
    color: 'rgba(228,225,240,0.7)',
  },
  modeBtnTextActive: {
    color: colors.onPrimary,
    fontFamily: fonts.display.bold,
  },
  modeBtnTextLocked: {
    color: 'rgba(228,225,240,0.5)',
  },

  // ---- AI Bubble ----
  aiRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    maxWidth: '85%',
    alignSelf: 'flex-start',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  aiBubble: {
    flex: 1,
    backgroundColor: 'rgba(35,35,48,0.95)',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 6,
    borderRadius: 16,
    borderTopLeftRadius: 4,
    gap: 2,
  },
  aiBubbleBody: {
    fontFamily: fonts.body.regular,
    fontSize: 15,
    color: colors.onSurface,
    lineHeight: 21,
  },
  aiBubbleTime: {
    fontFamily: fonts.body.regular,
    fontSize: 11,
    color: 'rgba(201,168,76,0.5)',
    alignSelf: 'flex-end',
  },

  // ---- User Bubble ----
  userBubble: {
    maxWidth: '78%',
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(201,168,76,0.15)',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 6,
    borderRadius: 16,
    borderTopRightRadius: 4,
    gap: 2,
  },
  userBubbleText: {
    fontFamily: fonts.body.regular,
    fontSize: 15,
    color: colors.onSurface,
    lineHeight: 21,
  },
  userBubbleTime: {
    fontFamily: fonts.body.regular,
    fontSize: 11,
    color: 'rgba(228,225,240,0.35)',
    alignSelf: 'flex-end',
  },

  // ---- Typing Indicator ----
  typingContainer: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(35,35,48,0.95)',
    borderRadius: 16,
    borderTopLeftRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  typingDots: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  typingDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.gold.DEFAULT,
    opacity: 0.6,
  },

  // ---- Quota Exceeded ----
  quotaCard: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(35,35,48,0.95)',
    borderRadius: 12,
    padding: 14,
    gap: 4,
    maxWidth: '78%',
  },
  quotaTitle: {
    fontFamily: fonts.display.bold,
    fontSize: 11,
    color: colors.energy.low,
    letterSpacing: 2,
  },
  quotaBody: {
    fontFamily: fonts.body.regular,
    fontSize: 14,
    color: colors.onSurfaceVariant,
    lineHeight: 20,
  },

  // ---- Input Bar ----
  inputBar: {
    paddingHorizontal: 10,
    paddingTop: 6,
    paddingBottom: Platform.OS === 'ios' ? 90 : 96,
    backgroundColor: colors.night.DEFAULT,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(201,168,76,0.12)',
  },
  inputBarInner: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    backgroundColor: 'rgba(20,20,32,0.95)',
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.2)',
    borderRadius: 22,
    paddingLeft: 14,
    paddingRight: 6,
    paddingVertical: 6,
  },
  textInput: {
    flex: 1,
    backgroundColor: 'transparent',
    fontFamily: fonts.body.regular,
    fontSize: 16,
    color: colors.onSurface,
    paddingVertical: 4,
    maxHeight: 100,
  },
  sendBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.gold.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.3,
  },
  sendBtnText: {
    fontSize: 16,
    color: colors.onPrimary,
  },
});
