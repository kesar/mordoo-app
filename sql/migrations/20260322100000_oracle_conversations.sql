-- Create oracle_conversations table
CREATE TABLE public.oracle_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_date DATE NOT NULL,
  summary TEXT,
  summarized_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, conversation_date)
);

-- Create oracle_messages table
CREATE TABLE public.oracle_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.oracle_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_oracle_messages_conversation ON public.oracle_messages(conversation_id, created_at);
CREATE INDEX idx_oracle_messages_user ON public.oracle_messages(user_id);

-- RLS policies
ALTER TABLE public.oracle_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oracle_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations"
  ON public.oracle_conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own messages"
  ON public.oracle_messages FOR SELECT
  USING (auth.uid() = user_id);
