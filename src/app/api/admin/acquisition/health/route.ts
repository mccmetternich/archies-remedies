import { NextResponse } from 'next/server';
import { supabaseContacts } from '@/lib/supabase-contacts';

export async function GET() {
  try {
    const { data, error } = await supabaseContacts
      .from('workflow_heartbeats')
      .select('*')
      .order('workflow_name');

    if (error) {
      console.error('Health API error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch workflow health', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      heartbeats: data || [],
      lastUpdated: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Health API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workflow health', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}