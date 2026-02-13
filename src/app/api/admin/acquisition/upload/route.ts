import { NextRequest, NextResponse } from 'next/server';
import { supabaseContacts } from '@/lib/supabase-contacts';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const sourceTag = formData.get('sourceTag') as string;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    if (!file.name.endsWith('.csv')) {
      return NextResponse.json({ error: 'File must be a CSV' }, { status: 400 });
    }
    
    // Parse CSV
    const csvText = await file.text();
    const { headers, rows } = parseCSV(csvText);
    
    // Initialize results tracking
    const results = {
      totalRows: rows.length,
      filtered: {
        malformedEmails: 0,
        tiktokRelay: 0,
        genericAddresses: 0,
        disposableDomains: 0,
        maleNames: 0,
        blockedDomains: 0,
        blockedSurnames: 0,
        blockedAreaCodes: 0,
        duplicateInCSV: 0
      },
      inserted: {
        contactsAdded: 0,
        duplicatesSkipped: 0
      },
      errors: [] as string[],
      sourceTag: sourceTag || `csv_import_${new Date().toISOString().split('T')[0]}`
    };
    
    // Parse and filter contacts
    const validContacts: ParsedContact[] = [];
    const emailsInCSV = new Set<string>();
    
    for (const row of rows) {
      const contact = parseShopifyRow(headers, row);
      if (!contact) continue;
      
      // Filter 1: Malformed emails
      if (!isValidEmail(contact.email)) {
        results.filtered.malformedEmails++;
        continue;
      }
      
      // Filter 2: TikTok relay emails
      if (contact.email.includes('@chat-seller-us.tiktok.com')) {
        results.filtered.tiktokRelay++;
        continue;
      }
      
      // Filter 3: Generic/role addresses
      if (isGenericEmail(contact.email)) {
        results.filtered.genericAddresses++;
        continue;
      }
      
      // Filter 4: Disposable domains
      if (isDisposableDomain(contact.email)) {
        results.filtered.disposableDomains++;
        continue;
      }
      
      // Filter 5: Male names
      if (contact.first_name && isMaleName(contact.first_name)) {
        results.filtered.maleNames++;
        continue;
      }
      
      // Filter 6: Blocked domains (kialanutrition.com)
      const domain = contact.email.split('@')[1]?.toLowerCase();
      if (BLOCKED_DOMAINS.has(domain)) {
        results.filtered.blockedDomains++;
        continue;
      }
      
      // Filter 7: Blocked surnames
      if (contact.last_name && isBlockedSurname(contact.last_name)) {
        results.filtered.blockedSurnames++;
        continue;
      }
      
      // Filter 8: Blocked area codes (GA/FL)
      if (contact.phone) {
        const areaCode = getAreaCode(contact.phone);
        if (areaCode && BLOCKED_AREA_CODES.has(areaCode)) {
          results.filtered.blockedAreaCodes++;
          continue;
        }
      }
      
      // Filter 9: Duplicate within CSV
      if (emailsInCSV.has(contact.email)) {
        results.filtered.duplicateInCSV++;
        continue;
      }
      emailsInCSV.add(contact.email);
      
      validContacts.push({
        email: contact.email,
        first_name: contact.first_name,
        last_name: contact.last_name,
        phone: contact.phone,
        source: results.sourceTag
      });
    }
    
    // Insert contacts using direct Supabase REST API with proper conflict resolution
    if (validContacts.length > 0) {
      const BATCH_SIZE = 500;
      let totalSent = 0;
      
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
      
      for (let i = 0; i < validContacts.length; i += BATCH_SIZE) {
        const batch = validContacts.slice(i, i + BATCH_SIZE);
        
        try {
          // Use direct REST API with proper conflict resolution
          const response = await fetch(`${supabaseUrl}/rest/v1/contacts?on_conflict=email`, {
            method: 'POST',
            headers: {
              'apikey': supabaseServiceKey!,
              'Authorization': `Bearer ${supabaseServiceKey}`,
              'Content-Type': 'application/json',
              'Prefer': 'resolution=ignore-duplicates,return=minimal'
            },
            body: JSON.stringify(batch)
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            results.errors.push(`Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${response.status} ${errorText}`);
          } else {
            totalSent += batch.length;
          }
        } catch (error) {
          results.errors.push(`Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
      
      // Calculate actual inserts vs duplicates by counting contacts with this source tag
      try {
        const { count: actualCount } = await supabaseContacts
          .from('contacts')
          .select('*', { count: 'exact', head: true })
          .eq('source', results.sourceTag);
        
        results.inserted.contactsAdded = actualCount || 0;
        results.inserted.duplicatesSkipped = totalSent - results.inserted.contactsAdded;
      } catch (error) {
        // Fallback if count query fails
        results.inserted.contactsAdded = totalSent;
        results.inserted.duplicatesSkipped = 0;
        results.errors.push(`Could not count inserted contacts: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    return NextResponse.json({ results });
    
  } catch (error) {
    console.error('CSV upload error:', error);
    return NextResponse.json(
      { error: 'Failed to process CSV upload' },
      { status: 500 }
    );
  }
}

// Interfaces
interface ParsedContact {
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  source: string;
}

interface ShopifyContact {
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
}

// Constants
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

const BLOCKED_DOMAINS = new Set([
  'kialanutrition.com'
]);

const BLOCKED_SURNAMES = new Set([
  'warnell', 'christel', 'szymczak'
]);

const BLOCKED_AREA_CODES = new Set([
  '404', '770', '678', '470', '762', '706', '912', '229', '478', // Georgia
  '305', '786', '954', '754' // Florida
]);

const GENERIC_EMAIL_PREFIXES = new Set([
  'info@', 'noreply@', 'no-reply@', 'support@', 'admin@', 'sales@', 
  'hello@', 'contact@', 'help@', 'billing@', 'team@', 'webmaster@', 'postmaster@'
]);

const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com', 'guerrillamail.com', 'tempmail.com', 'throwaway.email', 
  'yopmail.com', 'sharklasers.com', 'guerrillamailblock.com', 'grr.la', 
  'dispostable.com', 'trashmail.com'
]);

// Utility functions
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isGenericEmail(email: string): boolean {
  const lowerEmail = email.toLowerCase();
  return Array.from(GENERIC_EMAIL_PREFIXES).some(prefix => lowerEmail.startsWith(prefix));
}

function isDisposableDomain(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase();
  return DISPOSABLE_DOMAINS.has(domain);
}

function isMaleName(firstName: string): boolean {
  const name = firstName.toLowerCase();
  return !PROTECTED_NAMES.has(name) && MALE_NAMES.has(name);
}

function isBlockedSurname(lastName: string): boolean {
  return BLOCKED_SURNAMES.has(lastName.toLowerCase());
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

function cleanPhone(phone: string): string | null {
  if (!phone) return null;
  
  // Remove leading apostrophe if present
  phone = phone.replace(/^'/, '');
  const digits = phone.replace(/\D/g, '');
  
  if (digits.length === 10) {
    return `+1${digits}`;
  } else if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }
  
  return digits.length >= 10 ? `+${digits}` : null;
}

function titleCase(str: string): string {
  if (!str) return str;
  return str.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
}

function parseCSV(csvText: string): { headers: string[], rows: string[][] } {
  // Remove BOM if present
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

function parseShopifyRow(headers: string[], row: string[]): ShopifyContact | null {
  const data: Record<string, string> = {};
  headers.forEach((header, index) => {
    data[header.toLowerCase()] = row[index] || '';
  });
  
  // Extract email (required)
  let email = '';
  if (data['email']) {
    email = data['email'].toLowerCase().trim();
  }
  if (!email) return null;
  
  // Extract names
  const firstName = data['first name'] ? titleCase(data['first name'].trim()) : undefined;
  const lastName = data['last name'] ? titleCase(data['last name'].trim()) : undefined;
  
  // Extract phone
  let phone = cleanPhone(data['phone']) || cleanPhone(data['default address phone']) || undefined;
  
  return {
    email,
    first_name: firstName,
    last_name: lastName,
    phone
  };
}