import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
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
import { SimpleMarkdown } from '@/src/components/ui/SimpleMarkdown';
import { router } from 'expo-router';
import { Text } from '@/src/components/ui/Text';
import { StarIcon, LockIcon, BambooIcon, SendArrowIcon } from '@/src/components/icons/TarotIcons';
import { colors } from '@/src/constants/colors';
import { fonts } from '@/src/constants/typography';
import { useOracleStore, type ChatMessage, type PastConversation } from '@/src/stores/oracleStore';
import { useOnboardingStore } from '@/src/stores/onboardingStore';
import { useAuthStore } from '@/src/stores/authStore';
import { useSettingsStore } from '@/src/stores/settingsStore';
import {
  sendOracleMessage,
  fetchTodayConversation,
  fetchConversationHistory,
  type ConversationMessage,
} from '@/src/services/oracle';
import { lightHaptic } from '@/src/utils/haptics';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation('oracle');
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
              {' '}{t('modes.mordoo')}
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
            <Text style={[styles.modeBtnText, styles.modeBtnTextLocked]}>{' '}{t('modes.strategist')}</Text>
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

function AiMessageBubble({ message, isThinking }: { message: ChatMessage; isThinking?: boolean }) {
  const { t } = useTranslation('oracle');
  const time = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const [phrase] = useState(() => {
    const phrases = t('chat.thinking', { returnObjects: true }) as string[];
    return phrases[Math.floor(Math.random() * phrases.length)];
  });

  const thinkingOpacity = useRef(new Animated.Value(1)).current;
  const hasContent = message.content.length > 0;
  const [showThinking, setShowThinking] = useState(!!isThinking);

  useEffect(() => {
    if (hasContent && showThinking) {
      Animated.timing(thinkingOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setShowThinking(false));
    }
  }, [hasContent, showThinking, thinkingOpacity]);

  // Not thinking and no content — hide entirely (shouldn't normally happen)
  if (!showThinking && !hasContent) return null;

  return (
    <View style={styles.aiRow}>
      <Image source={mordooAvatar} style={styles.avatar} />
      <View style={{ flex: 1 }}>
        {/* Thinking phrase — fades out when content arrives */}
        {showThinking && (
          <Animated.View style={[styles.typingContainer, { opacity: thinkingOpacity }]}>
            <Text style={styles.typingText}>{phrase}</Text>
          </Animated.View>
        )}
        {/* Actual content bubble */}
        {hasContent && (
          <View style={styles.aiBubble}>
            <SimpleMarkdown style={markdownStyles}>{message.content}</SimpleMarkdown>
            <Text style={styles.aiBubbleTime}>{time}</Text>
          </View>
        )}
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

function QuotaExceeded() {
  const { t } = useTranslation('oracle');
  return (
    <View style={styles.quotaCard}>
      <Text style={styles.quotaTitle}>{t('chat.quotaTitle')}</Text>
      <Text style={styles.quotaBody}>
        {t('chat.quotaBody')}
      </Text>
    </View>
  );
}

function DateDivider({ date }: { date: string }) {
  const formatted = new Date(date + 'T00:00:00').toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
  return (
    <View style={styles.dateDivider}>
      <View style={styles.dateDividerLine} />
      <Text style={styles.dateDividerText}>{formatted}</Text>
      <View style={styles.dateDividerLine} />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------

export default function OracleScreen() {
  const { t } = useTranslation('oracle');
  const [mode, setMode] = useState<'mordoo' | 'strategist'>('mordoo');
  const [input, setInput] = useState('');
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  type ListItem =
    | (ChatMessage & { type: 'message' })
    | { type: 'date-divider'; id: string; date: string };

  const flatListRef = useRef<FlatList<ListItem>>(null);

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

  const currentUserId = useAuthStore((s) => s.supabaseUserId);
  const cachedUserId = useOracleStore((s) => s.userId);
  const quotaRemaining = useOracleStore((s) => s.quotaRemaining);
  const quotaTotal = useOracleStore((s) => s.quotaTotal);
  const setQuota = useOracleStore((s) => s.setQuota);
  const conversationDate = useOracleStore((s) => s.conversationDate);
  const pastConversations = useOracleStore((s) => s.pastConversations);
  const hasMoreHistory = useOracleStore((s) => s.hasMoreHistory);
  const isLoadingHistory = useOracleStore((s) => s.isLoadingHistory);
  const setTodayConversation = useOracleStore((s) => s.setTodayConversation);
  const clearConversation = useOracleStore((s) => s.clearConversation);
  const setOracleUserId = useOracleStore((s) => s.setUserId);
  const appendHistory = useOracleStore((s) => s.appendHistory);
  const setLoadingHistory = useOracleStore((s) => s.setLoadingHistory);

  // Load today's conversation + first page of history on mount
  useEffect(() => {
    if (!isAuthenticated || !currentUserId) return;

    // Stale cache from a different user — wipe before fetching
    if (cachedUserId && cachedUserId !== currentUserId) {
      clearConversation();
    }

    fetchTodayConversation()
      .then((data) => {
        const msgs = data.messages.map((m: ConversationMessage) => ({
          id: m.id,
          role: m.role as 'user' | 'assistant',
          content: m.content,
          timestamp: m.createdAt,
        }));
        setTodayConversation(data.conversationId, data.conversationDate, msgs);
        setOracleUserId(currentUserId);
        setQuota(data.quota.used, data.quota.total, data.quota.remaining);

        // Automatically load first page of past conversations
        return fetchConversationHistory(data.conversationDate);
      })
      .then((historyData) => {
        if (!historyData) return;
        const mapped: PastConversation[] = historyData.conversations.map((c) => ({
          id: c.id,
          conversationDate: c.conversationDate,
          summary: c.summary,
          messages: c.messages.map((m) => ({
            id: m.id,
            role: m.role as 'user' | 'assistant',
            content: m.content,
            timestamp: m.createdAt,
          })),
        }));
        appendHistory(mapped, historyData.hasMore);
      })
      .catch(() => {
        // Keep cached messages if fetch fails
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, currentUserId]);

  const welcomeMessage = useMemo<ChatMessage>(() => ({
    id: 'welcome',
    role: 'assistant',
    content: t('chat.welcomeMessage'),
    timestamp: new Date().toISOString(),
  }), [t]);

  const loadMoreHistory = useCallback(() => {
    if (isLoadingHistory || !hasMoreHistory) return;

    const oldestDate = pastConversations.length > 0
      ? pastConversations[pastConversations.length - 1].conversationDate
      : conversationDate || undefined;

    if (!oldestDate) return;

    setLoadingHistory(true);
    fetchConversationHistory(oldestDate)
      .then((data) => {
        const mapped: PastConversation[] = data.conversations.map((c) => ({
          id: c.id,
          conversationDate: c.conversationDate,
          summary: c.summary,
          messages: c.messages.map((m) => ({
            id: m.id,
            role: m.role as 'user' | 'assistant',
            content: m.content,
            timestamp: m.createdAt,
          })),
        }));
        appendHistory(mapped, data.hasMore);
      })
      .catch(() => {})
      .finally(() => setLoadingHistory(false));
  }, [isLoadingHistory, hasMoreHistory, pastConversations, conversationDate, setLoadingHistory, appendHistory]);

  const allItems = useMemo<ListItem[]>(() => {
    const items: ListItem[] = [];

    // Past conversations (oldest first since they're loaded in desc order)
    const pastReversed = [...pastConversations].reverse();
    for (const conv of pastReversed) {
      items.push({ type: 'date-divider', id: `div-${conv.conversationDate}`, date: conv.conversationDate });
      for (const msg of conv.messages) {
        items.push({ ...msg, type: 'message' });
      }
    }

    // Today's messages
    const todayMsgs = messages.length === 0 ? [welcomeMessage] : messages;
    if (conversationDate && pastConversations.length > 0) {
      items.push({ type: 'date-divider', id: `div-${conversationDate}`, date: conversationDate });
    }
    for (const msg of todayMsgs) {
      items.push({ ...msg, type: 'message' });
    }

    return items;
  }, [messages, pastConversations, conversationDate, welcomeMessage]);

  const invertedItems = useMemo(() => [...allItems].reverse(), [allItems]);

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
    if (currentUserId) setOracleUserId(currentUserId);

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
        // Optimistically decrement remaining quota
        if (quotaRemaining !== null) {
          setQuota(
            (quotaTotal ?? 0) - Math.max(0, quotaRemaining - 1),
            quotaTotal,
            Math.max(0, quotaRemaining - 1),
          );
        }
      },
      onError: (error) => {
        setStreaming(false);
        sendingRef.current = false;
        if (error.message === 'QUOTA_EXCEEDED') {
          removeLastMessage(); // Remove empty assistant placeholder
          setQuotaExceeded(true);
        } else {
          appendToLastMessage(
            t('chat.errorDisrupted'),
          );
        }
      },
    });
  }, [
    input,
    isStreaming,
    isAuthenticated,
    currentUserId,
    birthData,
    nameData,
    concerns,
    lang,
    t,
    addMessage,
    removeLastMessage,
    appendToLastMessage,
    setStreaming,
    setOracleUserId,
    quotaRemaining,
    quotaTotal,
    setQuota,
  ]);

  const renderItem = useCallback(
    ({ item }: { item: ListItem }) => {
      if (item.type === 'date-divider') return <DateDivider date={item.date} />;
      if (item.role === 'assistant') {
        const isLastAssistant = isStreaming && item.id === messages[messages.length - 1]?.id;
        return <AiMessageBubble message={item} isThinking={isLastAssistant} />;
      }
      return <UserMessageBubble message={item} />;
    },
    [isStreaming, messages],
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
          data={invertedItems}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          inverted={true}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.messageList}
          onEndReached={loadMoreHistory}
          onEndReachedThreshold={0.5}
          ListHeaderComponent={
            quotaExceeded ? <QuotaExceeded /> : null
          }
        />

        {/* Input bar — inside KAV so it moves with keyboard */}
        <View style={styles.inputBar}>
          {quotaTotal !== null && quotaRemaining !== null && (
            <Text style={styles.quotaIndicator}>
              {t('chat.remaining', { count: quotaRemaining, total: quotaTotal })}
            </Text>
          )}
          <View style={styles.inputBarInner}>
            <TextInput
              style={styles.textInput}
              value={input}
              onChangeText={setInput}
              placeholder={t('chat.placeholder')}
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
  typingText: {
    fontFamily: fonts.body.regular,
    fontStyle: 'italic',
    fontSize: 14,
    color: 'rgba(201,168,76,0.7)',
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

  // ---- Date Divider ----
  dateDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 10,
  },
  dateDividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(201,168,76,0.2)',
  },
  dateDividerText: {
    fontFamily: fonts.display.regular,
    fontSize: 11,
    color: 'rgba(201,168,76,0.5)',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  // ---- Input Bar ----
  quotaIndicator: {
    fontFamily: fonts.body.regular,
    fontSize: 11,
    color: 'rgba(201,168,76,0.5)',
    textAlign: 'center',
    marginBottom: 4,
  },
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
