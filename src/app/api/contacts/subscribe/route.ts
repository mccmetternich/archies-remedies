import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { contacts } from '@/lib/db/schema';
import { eq, or } from 'drizzle-orm';
import { nanoid } from 'nanoid';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, phone, source = 'coming-soon' } = body;

    // Must have either email or phone
    if (!email && !phone) {
      return NextResponse.json(
        { error: 'Email or phone number is required' },
        { status: 400 }
      );
    }

    // Validate email format if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Basic phone validation if provided
    if (phone && phone.replace(/\D/g, '').length < 10) {
      return NextResponse.json(
        { error: 'Please enter a valid phone number' },
        { status: 400 }
      );
    }

    // Clean phone number - keep only digits
    const cleanPhone = phone ? phone.replace(/\D/g, '') : null;
    const cleanEmail = email?.toLowerCase().trim();

    // Check if contact already exists
    const existingConditions = [];
    if (cleanEmail) existingConditions.push(eq(contacts.email, cleanEmail));
    if (cleanPhone) existingConditions.push(eq(contacts.phone, cleanPhone));

    const [existingContact] = existingConditions.length > 0
      ? await db
          .select()
          .from(contacts)
          .where(or(...existingConditions))
          .limit(1)
      : [null];

    const now = new Date().toISOString();

    if (existingContact) {
      // Update existing contact with new info
      const updateData: Record<string, unknown> = {
        source,
        updatedAt: now,
      };

      // Add email if not already set and provided
      if (cleanEmail && !existingContact.email) {
        updateData.email = cleanEmail;
        updateData.emailStatus = 'active';
        updateData.emailConsentAt = now;
      } else if (cleanEmail && existingContact.email === cleanEmail) {
        // Re-activate if same email
        updateData.emailStatus = 'active';
      }

      // Add phone if not already set and provided
      if (cleanPhone && !existingContact.phone) {
        updateData.phone = cleanPhone;
        updateData.smsStatus = 'active';
        updateData.smsConsentAt = now;
      } else if (cleanPhone && existingContact.phone === cleanPhone) {
        // Re-activate if same phone
        updateData.smsStatus = 'active';
      }

      await db
        .update(contacts)
        .set(updateData)
        .where(eq(contacts.id, existingContact.id));

      return NextResponse.json({
        success: true,
        message: 'Contact updated successfully',
        contactId: existingContact.id,
      });
    }

    // Create new contact
    const newContactId = nanoid();
    const newContact = {
      id: newContactId,
      email: cleanEmail || null,
      phone: cleanPhone || null,
      source,
      emailStatus: cleanEmail ? 'active' : 'none',
      smsStatus: cleanPhone ? 'active' : 'none',
      emailConsentAt: cleanEmail ? now : null,
      smsConsentAt: cleanPhone ? now : null,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(contacts).values(newContact);

    return NextResponse.json({
      success: true,
      message: 'Contact created successfully',
      contactId: newContactId,
    });
  } catch (error) {
    console.error('Failed to subscribe contact:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe. Please try again.' },
      { status: 500 }
    );
  }
}
