import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Lazy-loaded Supabase client for the email/contacts database (separate from main website DB)
let _supabaseContacts: SupabaseClient | null = null;

function getSupabaseContacts() {
  if (!_supabaseContacts) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl) {
      throw new Error('SUPABASE_URL environment variable is required for the CSV upload feature.');
    }
    if (!supabaseServiceKey) {
      throw new Error('SUPABASE_SERVICE_KEY environment variable is required for the CSV upload feature.');
    }

    _supabaseContacts = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }
  
  return _supabaseContacts;
}

export const supabaseContacts = new Proxy({} as SupabaseClient, {
  get(target, prop) {
    return getSupabaseContacts()[prop as keyof SupabaseClient];
  }
});

// Types for the contacts database
export interface Contact {
  id?: number;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  global_status?: 'active' | 'bounced' | 'unsubscribed';
  unsubscribed?: boolean;
  unsubscribed_at?: string;
  created_at?: string;
}

export interface CampaignContact {
  id?: number;
  contact_id: number;
  campaign: string;
  status?: 'queued' | 'sent_phase1' | 'sent_phase2' | 'interested' | 'declined' | 'unsubscribed' | 'question' | 'follow_up' | 'needs_review';
  phase1_sent_at?: string;
  phase2_sent_at?: string;
  reply_classification?: string;
  reply_sent_at?: string;
  follow_up_count?: number;
  has_question?: boolean;
  draft_reply?: string;
  thread_id?: string;
  message_id_header?: string;
  created_at?: string;
}

// Active campaign name
export const ACTIVE_CAMPAIGN = 'stick_launch_test';