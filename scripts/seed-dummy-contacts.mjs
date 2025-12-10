import { createClient } from '@libsql/client';
import { nanoid } from 'nanoid';

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function seedDummyContacts() {
  const now = new Date().toISOString();

  // Dummy email contact
  const emailContactId = nanoid();
  const emailContact = {
    id: emailContactId,
    email: 'jane.doe@example.com',
    phone: null,
    firstName: 'Jane',
    lastName: 'Doe',
    source: 'welcome_popup',
    emailStatus: 'active',
    smsStatus: 'none',
    emailConsentAt: now,
    smsConsentAt: null,
    createdAt: now,
    updatedAt: now,
  };

  // Dummy SMS contact
  const smsContactId = nanoid();
  const smsContact = {
    id: smsContactId,
    email: null,
    phone: '+15551234567',
    firstName: 'John',
    lastName: 'Smith',
    source: 'exit_popup',
    emailStatus: 'none',
    smsStatus: 'active',
    emailConsentAt: null,
    smsConsentAt: now,
    createdAt: now,
    updatedAt: now,
  };

  try {
    // Insert email contact
    await db.execute({
      sql: `INSERT INTO contacts (id, email, phone, first_name, last_name, source, email_status, sms_status, email_consent_at, sms_consent_at, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        emailContact.id,
        emailContact.email,
        emailContact.phone,
        emailContact.firstName,
        emailContact.lastName,
        emailContact.source,
        emailContact.emailStatus,
        emailContact.smsStatus,
        emailContact.emailConsentAt,
        emailContact.smsConsentAt,
        emailContact.createdAt,
        emailContact.updatedAt,
      ],
    });
    console.log('✅ Created email contact: Jane Doe (jane.doe@example.com)');

    // Insert SMS contact
    await db.execute({
      sql: `INSERT INTO contacts (id, email, phone, first_name, last_name, source, email_status, sms_status, email_consent_at, sms_consent_at, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        smsContact.id,
        smsContact.email,
        smsContact.phone,
        smsContact.firstName,
        smsContact.lastName,
        smsContact.source,
        smsContact.emailStatus,
        smsContact.smsStatus,
        smsContact.emailConsentAt,
        smsContact.smsConsentAt,
        smsContact.createdAt,
        smsContact.updatedAt,
      ],
    });
    console.log('✅ Created SMS contact: John Smith (+15551234567)');

    console.log('\n📊 Summary:');
    console.log('- 1 Email contact (Active)');
    console.log('- 1 SMS contact (Active)');
    console.log('\nYou can now test clicking into these contacts in the admin panel.');
  } catch (error) {
    if (error.message?.includes('UNIQUE constraint')) {
      console.log('⚠️  Contacts may already exist (duplicate email/phone). Skipping...');
    } else {
      console.error('❌ Error creating contacts:', error);
    }
  }
}

seedDummyContacts();
