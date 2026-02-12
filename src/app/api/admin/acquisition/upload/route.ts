import { NextRequest, NextResponse } from 'next/server';
import { supabaseContacts, ACTIVE_CAMPAIGN } from '@/lib/supabase-contacts';

// This is the enhanced version with detailed processing feedback
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    if (!file.name.endsWith('.csv')) {
      return NextResponse.json({ error: 'File must be a CSV' }, { status: 400 });
    }
    
    // Parse CSV
    const csvText = await file.text();
    const { headers, rows } = parseCSV(csvText);
    
    // Initialize results with detailed tracking
    const results = {
      totalRows: rows.length,
      filtered: {
        invalidEmail: 0,
        blockedDomain: 0,
        blockedName: 0,
        maleNames: 0,
        blockedAreaCode: 0,
        duplicateInCSV: 0,
        duplicateInDB: 0,
        alreadyInCampaign: 0
      },
      inserted: {
        newContacts: 0,
        campaignEnrollments: 0
      },
      errors: [] as string[],
      processingDetails: {
        parseStage: `Successfully parsed ${rows.length} rows from CSV`,
        filteringStage: 'Applying smart filters...',
        deduplicationStage: 'Checking for duplicates...',
        insertionStage: 'Inserting new contacts...'
      }
    };
    
    // Parse and filter contacts with detailed tracking
    const parsedRows: ParsedRow[] = [];
    const emailsInCSV = new Set<string>();
    const filterReasons: { [email: string]: string } = {};
    
    for (const row of rows) {
      const parsed = mapCSVRow(headers, row);
      if (!parsed) continue;
      
      // Filter 1: Invalid email
      if (!isValidEmail(parsed.email)) {
        results.filtered.invalidEmail++;
        filterReasons[parsed.email] = 'Invalid email format';
        continue;
      }
      
      // Filter 2: Blocked domains
      const emailDomain = parsed.email.split('@')[1]?.toLowerCase();
      if (BLOCKED_DOMAINS.has(emailDomain)) {
        results.filtered.blockedDomain++;
        filterReasons[parsed.email] = `Blocked domain: ${emailDomain}`;
        continue;
      }
      
      // Filter 3: Blocked names
      if ((parsed.firstName && BLOCKED_FIRST_NAMES.has(parsed.firstName.toLowerCase())) ||
          (parsed.lastName && BLOCKED_LAST_NAMES.has(parsed.lastName.toLowerCase()))) {
        results.filtered.blockedName++;
        filterReasons[parsed.email] = `Blocked name: ${parsed.firstName} ${parsed.lastName}`;
        continue;
      }
      
      // Filter 4: Male names (with protection for gender-neutral names)
      if (parsed.firstName) {
        const firstName = parsed.firstName.toLowerCase();
        if (!PROTECTED_NAMES.has(firstName) && MALE_NAMES.has(firstName)) {
          results.filtered.maleNames++;
          filterReasons[parsed.email] = `Male first name: ${parsed.firstName}`;
          continue;
        }
      }
      
      // Filter 5: Blocked area codes
      if (parsed.phone) {
        const areaCode = getAreaCode(parsed.phone);
        if (areaCode && BLOCKED_AREA_CODES.has(areaCode)) {
          results.filtered.blockedAreaCode++;
          filterReasons[parsed.email] = `Blocked area code: ${areaCode}`;
          continue;
        }
      }
      
      // Filter 6: Duplicate within CSV
      if (emailsInCSV.has(parsed.email)) {
        results.filtered.duplicateInCSV++;
        filterReasons[parsed.email] = 'Duplicate within CSV file';
        continue;
      }
      emailsInCSV.add(parsed.email);
      
      parsedRows.push(parsed);
    }
    
    // Update processing details
    results.processingDetails.filteringStage = `Filtered ${parsedRows.length} qualified contacts from ${rows.length} total rows`;
    
    // Check for existing emails in database
    if (parsedRows.length === 0) {
      return NextResponse.json({ results });
    }
    
    const emails = parsedRows.map(row => row.email);
    const { data: existingContacts } = await supabaseContacts
      .from('contacts')
      .select('id, email')
      .in('email', emails);
    
    const existingEmails = new Set(existingContacts?.map(c => c.email) || []);
    
    // Check which existing contacts are already in the campaign
    const existingContactIds = existingContacts?.map(c => c.id) || [];
    const { data: campaignContacts } = await supabaseContacts
      .from('campaign_contacts')
      .select('contact_id')
      .in('contact_id', existingContactIds)
      .eq('campaign', ACTIVE_CAMPAIGN);
    
    const contactsInCampaign = new Set(campaignContacts?.map(cc => cc.contact_id) || []);
    
    // Filter out existing contacts
    const contactsToInsert = parsedRows.filter(row => {
      if (existingEmails.has(row.email)) {
        const existingContact = existingContacts?.find(c => c.email === row.email);
        if (existingContact && contactsInCampaign.has(existingContact.id)) {
          results.filtered.alreadyInCampaign++;
          filterReasons[row.email] = 'Already enrolled in active campaign';
        } else {
          results.filtered.duplicateInDB++;
          filterReasons[row.email] = 'Email exists in database';
        }
        return false;
      }
      return true;
    });
    
    // Update processing details
    results.processingDetails.deduplicationStage = `${contactsToInsert.length} unique contacts ready for insertion`;
    
    // Insert new contacts in batches
    const BATCH_SIZE = 100;
    const newContactIds: number[] = [];
    
    for (let i = 0; i < contactsToInsert.length; i += BATCH_SIZE) {
      const batch = contactsToInsert.slice(i, i + BATCH_SIZE);
      
      const contactsToInsertDB = batch.map(row => ({
        email: row.email,
        first_name: row.firstName || null,
        last_name: row.lastName || null,
        phone: row.phone || null,
        global_status: 'active' as const,
        created_at: new Date().toISOString()
      }));
      
      const { data: insertedContacts, error } = await supabaseContacts
        .from('contacts')
        .insert(contactsToInsertDB)
        .select('id');
      
      if (error) {
        results.errors.push(`Batch ${i / BATCH_SIZE + 1}: ${error.message}`);
        continue;
      }
      
      if (insertedContacts) {
        newContactIds.push(...insertedContacts.map(c => c.id));
        results.inserted.newContacts += insertedContacts.length;
      }
    }
    
    // Insert campaign contacts
    if (newContactIds.length > 0) {
      const campaignContactsToInsert = newContactIds.map(contactId => ({
        contact_id: contactId,
        campaign: ACTIVE_CAMPAIGN,
        status: 'queued' as const,
        created_at: new Date().toISOString()
      }));
      
      for (let i = 0; i < campaignContactsToInsert.length; i += BATCH_SIZE) {
        const batch = campaignContactsToInsert.slice(i, i + BATCH_SIZE);
        
        const { data, error } = await supabaseContacts
          .from('campaign_contacts')
          .insert(batch)
          .select('id');
        
        if (error) {
          results.errors.push(`Campaign enrollment batch ${i / BATCH_SIZE + 1}: ${error.message}`);
        } else if (data) {
          results.inserted.campaignEnrollments += data.length;
        }
      }
    }
    
    // Final processing details
    results.processingDetails.insertionStage = `Successfully inserted ${results.inserted.newContacts} contacts and enrolled them in ${ACTIVE_CAMPAIGN}`;
    
    return NextResponse.json({ results });
    
  } catch (error) {
    console.error('CSV upload error:', error);
    return NextResponse.json(
      { error: 'Failed to process CSV upload' },
      { status: 500 }
    );
  }
}

// Re-use the utility functions from the original upload route
interface ParsedRow {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

const MALE_NAMES = new Set([
  'aaron', 'adam', 'adrian', 'alan', 'albert', 'alex', 'alexander', 'alfred', 'andrew', 'anthony', 
  'arthur', 'austin', 'barry', 'benjamin', 'bernard', 'billy', 'blake', 'bobby', 'brad', 'bradley', 
  'brandon', 'brent', 'brett', 'brian', 'bruce', 'bryan', 'caleb', 'calvin', 'cameron', 'carl', 
  'carlos', 'chad', 'charles', 'charlie', 'chris', 'christian', 'christopher', 'clarence', 'clifford', 
  'clinton', 'cody', 'colin', 'connor', 'corey', 'craig', 'curtis', 'dale', 'damien', 'dan', 'daniel', 
  'danny', 'darrell', 'darren', 'daryl', 'dave', 'david', 'dean', 'dennis', 'derek', 'derrick', 
  'devin', 'dominic', 'don', 'donald', 'douglas', 'drew', 'duane', 'dustin', 'dylan', 'earl', 
  'eddie', 'edward', 'edwin', 'eli', 'elijah', 'elliott', 'eric', 'erik', 'ernest', 'ethan', 
  'eugene', 'evan', 'fernando', 'floyd', 'francis', 'francisco', 'frank', 'fred', 'frederick', 
  'gabriel', 'garrett', 'gary', 'gavin', 'gene', 'george', 'gerald', 'glen', 'glenn', 'gordon', 
  'grant', 'greg', 'gregory', 'harold', 'harry', 'harvey', 'hector', 'henry', 'herbert', 'herman', 
  'howard', 'hugh', 'hunter', 'ian', 'isaac', 'ivan', 'jack', 'jacob', 'jake', 'james', 'jared', 
  'jason', 'jay', 'jeff', 'jeffrey', 'jeremy', 'jerome', 'jerry', 'jesse', 'jim', 'jimmy', 'joe', 
  'joel', 'joey', 'john', 'johnny', 'jon', 'jonathan', 'jorge', 'jose', 'joseph', 'josh', 'joshua', 
  'juan', 'julian', 'justin', 'karl', 'keith', 'ken', 'kenneth', 'kent', 'kevin', 'kirk', 'kurt', 
  'kyle', 'lance', 'larry', 'lawrence', 'lee', 'leo', 'leon', 'leonard', 'leroy', 'lester', 'lewis', 
  'lincoln', 'lloyd', 'logan', 'louis', 'lucas', 'luke', 'malcolm', 'manuel', 'marc', 'marcus', 
  'mario', 'mark', 'marshall', 'martin', 'marvin', 'mason', 'matt', 'matthew', 'maurice', 'max', 
  'maxwell', 'michael', 'miguel', 'mike', 'miles', 'mitchell', 'nathan', 'nathaniel', 'neil', 
  'nelson', 'nicholas', 'nick', 'noah', 'norman', 'oliver', 'omar', 'oscar', 'owen', 'patrick', 
  'paul', 'pedro', 'perry', 'pete', 'peter', 'philip', 'preston', 'rafael', 'ralph', 'ramon', 
  'randall', 'randy', 'ray', 'raymond', 'reginald', 'rex', 'ricardo', 'richard', 'rick', 'robert', 
  'roberto', 'rodney', 'roger', 'roland', 'ron', 'ronald', 'ross', 'roy', 'ruben', 'russell', 
  'ryan', 'samuel', 'scott', 'sean', 'seth', 'shane', 'shaun', 'shawn', 'sidney', 'simon', 
  'spencer', 'stanley', 'stephen', 'steve', 'steven', 'stuart', 'ted', 'terry', 'theodore', 
  'thomas', 'tim', 'timothy', 'todd', 'tom', 'tommy', 'tony', 'travis', 'trevor', 'troy', 'tyler', 
  'vernon', 'victor', 'vincent', 'wade', 'wallace', 'walter', 'warren', 'wayne', 'wesley', 'will', 
  'william', 'willie', 'wyatt', 'zachary'
]);

const PROTECTED_NAMES = new Set([
  'jordan', 'alex', 'cameron', 'morgan', 'taylor', 'casey', 'riley', 'avery', 'quinn', 'skyler', 
  'dakota', 'reese', 'finley', 'rowan', 'charlie', 'sam', 'jamie', 'pat', 'robin', 'terry', 'lee', 
  'angel', 'jessie', 'kerry', 'dana', 'shannon'
]);

const BLOCKED_DOMAINS = new Set(['kialanutrition.com']);
const BLOCKED_FIRST_NAMES = new Set(['pete', 'jack']);
const BLOCKED_LAST_NAMES = new Set(['warnell', 'christel', 'szymczak']);
const BLOCKED_AREA_CODES = new Set([
  '404', '770', '678', '470', '762', '706', '912', '229', '478',
  '305', '786', '954', '754'
]);

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return false;
  
  const lowerEmail = email.toLowerCase();
  const junkEmails = ['test@test.com', 'example@example.com', 'noreply@', 'no-reply@'];
  return !junkEmails.some(junk => lowerEmail.includes(junk));
}

function cleanPhone(phone: string): string | null {
  if (!phone) return null;
  
  phone = phone.replace(/^'/, '');
  const digits = phone.replace(/\D/g, '');
  
  if (digits.length === 10) {
    return `+1${digits}`;
  } else if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }
  
  return digits.length >= 10 ? `+${digits}` : null;
}

function getAreaCode(phone: string): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  
  if (digits.length === 11 && digits.startsWith('1')) {
    return digits.substring(1, 4);
  }
  if (digits.length === 10) {
    return digits.substring(0, 3);
  }
  
  return null;
}

function titleCase(str: string): string {
  if (!str) return str;
  return str.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
}

function parseCSV(csvText: string): { headers: string[], rows: string[][] } {
  csvText = csvText.replace(/^\uFEFF/, '');
  
  const firstLine = csvText.split('\n')[0];
  const delimiter = firstLine.includes('\t') ? '\t' : ',';
  
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length < 2) throw new Error('CSV must have headers and at least one data row');
  
  const headers = lines[0].split(delimiter).map(h => h.trim().replace(/"/g, ''));
  const rows = lines.slice(1).map(line => 
    line.split(delimiter).map(cell => cell.trim().replace(/"/g, ''))
  );
  
  return { headers, rows };
}

function mapCSVRow(headers: string[], row: string[]): ParsedRow | null {
  const data: Record<string, string> = {};
  headers.forEach((header, index) => {
    data[header.toLowerCase()] = row[index] || '';
  });
  
  let email = '';
  for (const key in data) {
    if (key.includes('email')) {
      email = data[key].toLowerCase().trim();
      break;
    }
  }
  
  if (!email) return null;
  
  let firstName = '';
  let lastName = '';
  for (const key in data) {
    if (key.includes('first')) firstName = data[key];
    if (key.includes('last')) lastName = data[key];
  }
  
  let phone = '';
  if (data['phone']) {
    phone = data['phone'];
  } else if (data['default address phone']) {
    phone = data['default address phone'];
  } else {
    for (const key in data) {
      if (key.includes('phone') && data[key]) {
        phone = data[key];
        break;
      }
    }
  }
  
  return {
    email,
    firstName: firstName ? titleCase(firstName.trim()) : undefined,
    lastName: lastName ? titleCase(lastName.trim()) : undefined,
    phone: cleanPhone(phone) || undefined
  };
}