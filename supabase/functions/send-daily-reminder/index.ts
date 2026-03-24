import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

interface Profile {
  user_id: string;
  push_token: string;
  language: string;
}

function getNotificationContent(lang: string) {
  if (lang === 'th') {
    return { title: 'หมอดู', body: 'ดวงประจำวันของคุณพร้อมแล้ว ✨' };
  }
  return { title: 'Mordoo', body: 'Your daily energy reading is ready ✨' };
}

Deno.serve(async (req) => {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response('Unauthorized', { status: 401 });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: users, error } = await supabase.rpc('get_notification_eligible_users');

    const eligible: Profile[] = users ?? [];

    if (error || eligible.length === 0) {
      if (error) console.error('Query error:', error);
      return new Response(JSON.stringify({ sent: 0 }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const batches: Profile[][] = [];
    for (let i = 0; i < eligible.length; i += 100) {
      batches.push(eligible.slice(i, i + 100));
    }

    let totalSent = 0;
    const failedTokens: string[] = [];

    for (const batch of batches) {
      const messages = batch.map((user) => {
        const content = getNotificationContent(user.language);
        return {
          to: user.push_token,
          title: content.title,
          body: content.body,
          data: { screen: 'pulse' },
          channelId: 'daily-reminders',
        };
      });

      const response = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messages),
      });

      if (!response.ok) {
        console.error('Expo Push API error:', response.status);
        continue;
      }

      const result = await response.json();
      const tickets = result.data ?? [];

      for (let i = 0; i < tickets.length; i++) {
        const ticket = tickets[i];
        const user = batch[i];

        if (ticket.status === 'ok') {
          await supabase
            .from('profiles')
            .update({ last_notification_sent: new Date().toISOString().split('T')[0] })
            .eq('user_id', user.user_id);
          totalSent++;
        } else if (ticket.details?.error === 'DeviceNotRegistered') {
          failedTokens.push(user.user_id);
        }
      }
    }

    if (failedTokens.length > 0) {
      await supabase
        .from('profiles')
        .update({ push_token: null, notifications_enabled: false })
        .in('user_id', failedTokens);
    }

    console.log(`Sent ${totalSent} notifications, cleared ${failedTokens.length} invalid tokens`);

    return new Response(
      JSON.stringify({ sent: totalSent, cleared: failedTokens.length }),
      { headers: { 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error('Edge function error:', err);
    return new Response(JSON.stringify({ error: 'Internal error' }), { status: 500 });
  }
});
