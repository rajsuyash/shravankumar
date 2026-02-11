import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const BATCH_SIZE = 10;
const FROM_EMAIL = 'Shravan Kumar Pilgrimage <noreply@shravankumar.com>';

interface EmailQueueRow {
  id: string;
  to_email: string;
  subject: string;
  body_html: string;
  status: string;
}

Deno.serve(async (req) => {
  // Only allow POST
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!RESEND_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'RESEND_API_KEY is not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Fetch pending emails in batches
  const { data: pendingEmails, error: fetchError } = await supabase
    .from('email_queue')
    .select('id, to_email, subject, body_html, status')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(BATCH_SIZE);

  if (fetchError) {
    return new Response(
      JSON.stringify({ error: 'Failed to fetch email queue', details: fetchError.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }

  if (!pendingEmails || pendingEmails.length === 0) {
    return new Response(
      JSON.stringify({ message: 'No pending emails to process', processed: 0 }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  }

  let sent = 0;
  let failed = 0;

  for (const email of pendingEmails as EmailQueueRow[]) {
    try {
      const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: [email.to_email],
          subject: email.subject,
          html: email.body_html,
        }),
      });

      if (resendResponse.ok) {
        await supabase
          .from('email_queue')
          .update({ status: 'sent', sent_at: new Date().toISOString() })
          .eq('id', email.id);
        sent++;
      } else {
        const errorBody = await resendResponse.text();
        await supabase
          .from('email_queue')
          .update({
            status: 'failed',
            error_message: `HTTP ${resendResponse.status}: ${errorBody}`,
            last_attempt_at: new Date().toISOString(),
          })
          .eq('id', email.id);
        failed++;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      await supabase
        .from('email_queue')
        .update({
          status: 'failed',
          error_message: errorMessage,
          last_attempt_at: new Date().toISOString(),
        })
        .eq('id', email.id);
      failed++;
    }
  }

  return new Response(
    JSON.stringify({
      message: 'Email queue processed',
      total: pendingEmails.length,
      sent,
      failed,
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );
});
