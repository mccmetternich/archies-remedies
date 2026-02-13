import { NextResponse } from 'next/server';
import { supabaseContacts } from '@/lib/supabase-contacts';

export async function GET() {
  try {
    const campaign = 'stick_launch_test';

    // Execute all queries in parallel for better performance
    const [
      totalContactsResult,
      enrolledInCampaignResult,
      phase1SentResult,
      phase2SentResult,
      interestedResult,
      questionsResult,
      declinedResult,
      unsubscribedResult,
      needsReviewResult,
      totalRepliesResult,
      pendingAutoReplyResult,
      codesSentResult,
      awaitingSendResult
    ] = await Promise.all([
      // Total Contacts
      supabaseContacts
        .from('contacts')
        .select('*', { count: 'exact', head: true })
        .eq('global_status', 'active'),

      // Enrolled in Campaign
      supabaseContacts
        .from('campaign_contacts')
        .select('*', { count: 'exact', head: true })
        .eq('campaign', campaign),

      // Phase 1 Sent
      supabaseContacts
        .from('campaign_contacts')
        .select('*', { count: 'exact', head: true })
        .eq('campaign', campaign)
        .not('phase1_sent_at', 'is', null),

      // Phase 2 Sent
      supabaseContacts
        .from('campaign_contacts')
        .select('*', { count: 'exact', head: true })
        .eq('campaign', campaign)
        .not('phase2_sent_at', 'is', null),

      // Interested
      supabaseContacts
        .from('campaign_contacts')
        .select('*', { count: 'exact', head: true })
        .eq('campaign', campaign)
        .eq('reply_classification', 'INTERESTED'),

      // Questions
      supabaseContacts
        .from('campaign_contacts')
        .select('*', { count: 'exact', head: true })
        .eq('campaign', campaign)
        .eq('reply_classification', 'QUESTION'),

      // Declined
      supabaseContacts
        .from('campaign_contacts')
        .select('*', { count: 'exact', head: true })
        .eq('campaign', campaign)
        .eq('reply_classification', 'DECLINED'),

      // Unsubscribed
      supabaseContacts
        .from('campaign_contacts')
        .select('*', { count: 'exact', head: true })
        .eq('campaign', campaign)
        .eq('reply_classification', 'UNSUBSCRIBE'),

      // Needs Review
      supabaseContacts
        .from('campaign_contacts')
        .select('*', { count: 'exact', head: true })
        .eq('campaign', campaign)
        .eq('status', 'needs_review'),

      // Total Replies (for response rate calculation)
      supabaseContacts
        .from('campaign_contacts')
        .select('*', { count: 'exact', head: true })
        .eq('campaign', campaign)
        .not('reply_classification', 'is', null),

      // Pending Auto-Reply
      supabaseContacts
        .from('campaign_contacts')
        .select('*', { count: 'exact', head: true })
        .eq('campaign', campaign)
        .not('reply_classification', 'is', null)
        .is('reply_sent_at', null),

      // Codes Sent
      supabaseContacts
        .from('campaign_contacts')
        .select('*', { count: 'exact', head: true })
        .eq('campaign', campaign)
        .not('code_sent_at', 'is', null),

      // Get contact IDs that are enrolled in campaign (for awaiting send calculation)
      supabaseContacts
        .from('campaign_contacts')
        .select('contact_id')
        .eq('campaign', campaign)
    ]);

    // Extract counts with error handling
    const totalContacts = totalContactsResult.count || 0;
    const enrolledInCampaign = enrolledInCampaignResult.count || 0;
    const phase1Sent = phase1SentResult.count || 0;
    const phase2Sent = phase2SentResult.count || 0;
    const interested = interestedResult.count || 0;
    const questions = questionsResult.count || 0;
    const declined = declinedResult.count || 0;
    const unsubscribed = unsubscribedResult.count || 0;
    const needsReview = needsReviewResult.count || 0;
    const totalReplies = totalRepliesResult.count || 0;
    const pendingAutoReply = pendingAutoReplyResult.count || 0;
    const codesSent = codesSentResult.count || 0;
    
    // Calculate awaiting send: active contacts not yet enrolled in campaign
    const enrolledContactIds = new Set(
      (awaitingSendResult.data || []).map((row: any) => row.contact_id)
    );
    const awaitingSend = Math.max(0, totalContacts - enrolledContactIds.size);

    // Calculate conversion metrics
    const responseRate = phase1Sent > 0 ? (totalReplies / phase1Sent) * 100 : 0;
    const interestRate = phase1Sent > 0 ? (interested / phase1Sent) * 100 : 0;
    const unsubscribeRate = phase1Sent > 0 ? (unsubscribed / phase1Sent) * 100 : 0;

    const metrics = {
      // Pipeline Overview
      totalContacts,
      enrolledInCampaign,
      awaitingSend,
      phase1Sent,
      phase2Sent,
      
      // Response Breakdown
      interested,
      questions,
      declined,
      unsubscribed,
      needsReview,
      
      // Conversion Metrics
      responseRate: Math.round(responseRate * 10) / 10, // Round to 1 decimal
      interestRate: Math.round(interestRate * 10) / 10,
      unsubscribeRate: Math.round(unsubscribeRate * 10) / 10,
      pendingAutoReply,
      codesSent,
      
      // Meta
      campaign,
      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json(metrics);
    
  } catch (error) {
    console.error('Metrics API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}