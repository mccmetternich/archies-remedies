import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@libsql/client';
import { nanoid } from 'nanoid';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

// Product IDs from the database
const EYE_DROPS_ID = 'dOWj6mVNQ4IuYHixWOBPT';
const EYE_WIPES_ID = 'DyxEMW13fYqn0Sle13oGN';

// Eye Drops Reviews with keywords
const eyeDropsReviews = [
  { rating: 5, title: "Finally, a drop that doesn't burn.", author: "Sarah J.", text: "I've tried every drugstore brand—Systane, Refresh, you name it. They all have this slight chemical burn. These? Nothing but relief. It feels like splashing pure water, but it stays hydrated for hours. The lack of preservatives is a total game changer.", keywords: ["No Stinging", "Doctor Recommended"] },
  { rating: 5, title: "My LASIK surgeon approved.", author: "Michael R.", text: "I was terrified to use anything after my surgery. I brought these to my post-op appointment and my doctor gave them the thumbs up because they are 100% preservative-free. No grit, no blur.", keywords: ["Post-LASIK", "Doctor Recommended"] },
  { rating: 5, title: "The only thing that works for my 12-hour shifts.", author: "Elena D.", text: "I work in a hospital with bone-dry air conditioning. By 2 PM, my eyes usually feel like sandpaper. I keep a few of these vials in my scrub pocket. One drop and I'm good for the rest of the shift.", keywords: ["Screen Fatigue", "No Stinging"] },
  { rating: 4, title: "Packaging is genius.", author: "David P.", text: "I hate carrying around a big bottle that expires in 30 days. These little vials are perfect. I have three in my car, two in my wallet, and a handful at my desk. Love that you can recap them.", keywords: ["Travel Friendly"] },
  { rating: 5, title: "Lifesaver for dusty construction sites.", author: "Tom H.", text: "I work in drywall and framing. There is dust everywhere. I use these to flush out the debris. It doesn't just wet the eye; it actually clears out the grit without irritating. Highly recommend for the trades.", keywords: ["Construction Work", "No Stinging"] },
  { rating: 5, title: "Safe for my contacts!", author: "Jessica T.", text: "I wear daily contacts and everything else makes them fog up. I can drop Archie's right on top of my lenses and my vision stays crystal clear.", keywords: ["Contacts Safe"] },
  { rating: 5, title: "My husband finally stopped complaining.", author: "Linda W.", text: "My husband has chronic dry eye but refuses to use 'medication.' I bought him these because the packaging looked nice. He's obsessed. Says they don't feel 'goopy'.", keywords: ["No Stinging"] },
  { rating: 5, title: "No nasty ingredients.", author: "Chris M.", text: "I've been purging my home of parabens. It never occurred to me to check my eye drops until I found Archie's. Knowing there are no hidden chemicals is a huge relief.", keywords: ["Doctor Recommended"] },
  { rating: 5, title: "Perfect for travel.", author: "Amanda B.", text: "Airplane air is the worst. I packed a strip of these for my flight to London. Arrived with bright, white eyes instead of looking like a zombie.", keywords: ["Travel Friendly"] },
  { rating: 4, title: "Great value in the 60 pack.", author: "James L.", text: "Bought the 30 pack first, burned through them because my kids kept asking for them during allergy season. The 60 pack is better bang for your buck.", keywords: ["Travel Friendly"] },
  { rating: 5, title: "Sjogren's Syndrome relief.", author: "Patricia H.", text: "Having an autoimmune disease means my eyes are a desert. Most drops last 10 minutes. These give me solid relief for hours.", keywords: ["Doctor Recommended", "No Stinging"] },
  { rating: 5, title: "No 'Rebound Redness'.", author: "Mark S.", text: "Those 'get the red out' drops always make my eyes worse later. These just hydrate naturally. My eyes are whiter because they are healthy.", keywords: ["No Stinging"] },
  { rating: 5, title: "Computer fatigue is gone.", author: "Olivia K.", text: "I'm a graphic designer staring at pixels all day. Keeping my corneas hydrated with these has surprisingly helped my headaches too.", keywords: ["Screen Fatigue"] },
  { rating: 5, title: "Gentle enough for kids.", author: "Ashley F.", text: "My son gets itchy eyes from pollen. Since these are preservative-free, I tried it. He didn't even flinch. Now he asks for 'the blue drops'.", keywords: ["No Stinging"] },
  { rating: 5, title: "Recap feature is underrated.", author: "Brian C.", text: "The fact that the cap snaps back on so I can use the rest an hour later is a great design detail. Less waste.", keywords: ["Travel Friendly"] },
  { rating: 5, title: "Instant cooling effect.", author: "Sophia G.", text: "I don't know how they do it without menthol, but these feel cool and refreshing instantly. Wakes me up in the morning.", keywords: ["No Stinging"] },
  { rating: 5, title: "Better than prescription.", author: "Kevin N.", text: "My Restasis burns. These don't. I use these in between my prescription doses to keep comfortable.", keywords: ["Doctor Recommended", "No Stinging"] },
  { rating: 5, title: "No crusty residue.", author: "Megan Y.", text: "Other drops leave a white crust on my lashes when they dry. These evaporate cleanly or absorb fully. No mess.", keywords: ["No Stinging"] },
  { rating: 5, title: "A vibe shift for eye care.", author: "Jason R.", text: "Weird to say eye drops are 'cool', but the packaging is beautiful. I don't feel like a patient using them; I feel like I'm doing a wellness routine.", keywords: ["Travel Friendly"] },
  { rating: 5, title: "Arizona heat proof.", author: "Laura B.", text: "Living in Phoenix, your eyes dry out just walking to the mailbox. These are essential survival gear here.", keywords: ["Travel Friendly"] },
  { rating: 5, title: "Clean ingredients, clear vision.", author: "Sam T.", text: "I'm very particular about what I put in my body. The ingredient list here is short and understandable.", keywords: ["Doctor Recommended"] },
  { rating: 5, title: "Great for night driving.", author: "Ethan L.", text: "My eyes get dry and streetlights start to streak at night. A drop of this clears up my vision immediately.", keywords: ["Screen Fatigue"] },
  { rating: 5, title: "Works with scleral lenses.", author: "Grace P.", text: "Hard to find drops that play nice with scleral lenses. These are fantastic. No fogging.", keywords: ["Contacts Safe"] },
  { rating: 5, title: "Gifted to my mom.", author: "Natalie O.", text: "My mom had cataract surgery and was complaining about scratchiness. Sent her a box of these and she raved about them.", keywords: ["Post-LASIK", "Doctor Recommended"] },
  { rating: 5, title: "No preservatives = No irritation.", author: "Ryan M.", text: "If you use drops more than 4 times a day, you NEED preservative-free. These are the best value ones I've found.", keywords: ["No Stinging", "Doctor Recommended"] },
  { rating: 5, title: "Fast shipping, great box.", author: "Chloe Z.", text: "Arrived next day. The box is sturdy and keeps the vials organized.", keywords: ["Travel Friendly"] },
  { rating: 5, title: "Refreshing after swimming.", author: "Justin A.", text: "Chlorine kills my eyes. I flush them with Archie's after every swim workout. Takes the red right out.", keywords: ["No Stinging"] },
  { rating: 5, title: "My daily ritual.", author: "Hannah S.", text: "Brush teeth, wash face, Archie's drops. It's part of my morning now.", keywords: ["Screen Fatigue"] },
  { rating: 5, title: "Does not ruin makeup.", author: "Andrew G.", text: "My girlfriend loves these because if a drop runs down her cheek, it doesn't streak her foundation.", keywords: ["No Stinging"] },
  { rating: 5, title: "High quality plastic.", author: "Victoria E.", text: "Sounds silly, but the vials are soft and easy to squeeze. Some other brands are hard and rigid.", keywords: ["Travel Friendly"] },
  { rating: 5, title: "Gaming essential.", author: "Brandon W.", text: "I stream on Twitch for 6+ hours. Dry eye is a real issue. These keep me in the game.", keywords: ["Screen Fatigue"] },
  { rating: 5, title: "Trust the brand.", author: "Stephanie C.", text: "I use their wipes too. Archie's seems to actually care about eye health.", keywords: ["Doctor Recommended"] },
  { rating: 5, title: "Menopause relief.", author: "Maria D.", text: "Nobody tells you dry eye is a symptom of menopause! These have been a godsend.", keywords: ["Doctor Recommended"] },
  { rating: 5, title: "Simple and effective.", author: "Tyler B.", text: "No bells and whistles, just hydration that works.", keywords: ["No Stinging"] },
  { rating: 5, title: "Love the branding.", author: "Lauren J.", text: "Finally a healthcare product that doesn't look like it belongs in a geriatric ward.", keywords: ["Travel Friendly"] },
  { rating: 5, title: "Works for dogs too!", author: "Kyle F.", text: "My vet actually said I could use preservative-free artificial tears for my pug. These worked!", keywords: ["Doctor Recommended"] },
  { rating: 5, title: "No blurry film.", author: "Nicole H.", text: "Gel drops make me blind for 10 minutes. These are instant clarity.", keywords: ["No Stinging", "Contacts Safe"] },
  { rating: 5, title: "Excellent lubrication.", author: "Austin K.", text: "Slippery in a good way. My eyelids glide over my eyes now.", keywords: ["No Stinging"] },
  { rating: 5, title: "Great for allergy season.", author: "Madison L.", text: "Pollen is my enemy. These wash it away instantly.", keywords: ["No Stinging"] },
  { rating: 5, title: "Subscription worthy.", author: "George P.", text: "I just set up the auto-ship. I never want to run out.", keywords: ["Travel Friendly"] },
  { rating: 5, title: "The 30 pack is great for trial.", author: "Amber R.", text: "Tried the small pack, immediately bought the big one.", keywords: ["Travel Friendly"] },
  { rating: 5, title: "Comfortable.", author: "Jacob S.", text: "That's the best word. My eyes just feel comfortable.", keywords: ["No Stinging"] },
  { rating: 5, title: "No redness.", author: "Brittany T.", text: "People stopped asking me if I was tired. My eyes look white and awake.", keywords: ["No Stinging"] },
  { rating: 5, title: "Professional quality.", author: "Caleb W.", text: "I'm an aesthetician and I recommend these to clients after lash lifts.", keywords: ["Doctor Recommended"] },
  { rating: 5, title: "The standard.", author: "Danielle Y.", text: "I compare all other drops to these now.", keywords: ["Doctor Recommended"] },
  { rating: 5, title: "Relief.", author: "Evan M.", text: "Just pure, sweet relief.", keywords: ["No Stinging"] },
  { rating: 5, title: "Good for sensitive eyes.", author: "Samantha K.", text: "I am allergic to everything. I am not allergic to these.", keywords: ["No Stinging"] },
  { rating: 5, title: "Hydration hero.", author: "Luke J.", text: "Does exactly what it promises.", keywords: ["No Stinging"] },
  { rating: 5, title: "Convenient.", author: "Emily R.", text: "Simply the best.", keywords: ["Travel Friendly"] },
  { rating: 5, title: "Honest product.", author: "Sarah L.", text: "Feels clean and honest.", keywords: ["Doctor Recommended"] },
];

// Eye Wipes Reviews with keywords
const eyeWipesReviews = [
  { rating: 5, title: "Cured a stubborn stye in 48 hours.", author: "Jennifer A.", text: "I woke up with that painful bump. Used these morning and night, and the stye literally deflated and vanished in two days. The tea tree oil is magic.", keywords: ["Stye Prevention", "Tea Tree Oil"] },
  { rating: 5, title: "I was shocked at the size!", author: "Robert B.", text: "I expected a tiny little pad. These things are HUGE. I use one side for my left eye, one side for my right, and the rest to wipe my whole face.", keywords: ["Huge Wipe"] },
  { rating: 5, title: "The tingle tells you it's working.", author: "Lisa C.", text: "Distinct cooling 'tingle' from the tea tree oil. It's not a burn—it feels incredibly refreshing. Stops that deep-seated itch instantly.", keywords: ["Refreshing Tingle", "Tea Tree Oil"] },
  { rating: 5, title: "Threw away my makeup remover.", author: "Karen D.", text: "Melts my waterproof mascara better than micellar water. Cleans my lashes, treats my lids, and removes makeup in one step.", keywords: ["Makeup Remover"] },
  { rating: 5, title: "Blepharitis finally under control.", author: "John E.", text: "Struggled with crusty eyelids for years. These wipes are convenient and effective. My eyes are clear for the first time.", keywords: ["Blepharitis Control"] },
  { rating: 4, title: "Strong scent, but worth it.", author: "Michael F.", text: "Smells strongly of Tea Tree, but I like it. It smells 'clean'. And the results speak for themselves.", keywords: ["Tea Tree Oil"] },
  { rating: 5, title: "Great companion to the drops.", author: "Sarah G.", text: "I use Archie's drops during the day and these wipes at night. Total game changer.", keywords: ["Ophthalmologist Approved"] },
  { rating: 5, title: "Gentle exfoliation.", author: "David H.", text: "Texture has a little 'grip' to scrub away dead skin, but it's soft enough not to scratch.", keywords: ["Huge Wipe"] },
  { rating: 5, title: "Demodex mites... gone.", author: "Emily I.", text: "My doctor said I had lash mites causing itching. Tea Tree oil kills them. Clean bill of health after a month!", keywords: ["Tea Tree Oil", "Ophthalmologist Approved"] },
  { rating: 5, title: "Better than Ocusoft.", author: "James J.", text: "Others dried out my skin. These have Aloe and Coconut I think? My skin feels soft afterwards.", keywords: ["Huge Wipe"] },
  { rating: 5, title: "My morning wake-up call.", author: "Jessica K.", text: "First thing I do is wipe my eyes. The cooling sensation wakes me up faster than coffee.", keywords: ["Refreshing Tingle"] },
  { rating: 5, title: "No rinsing needed!", author: "William L.", text: "I love that I can just wipe and go. No sticky residue. Great for the gym.", keywords: ["Huge Wipe"] },
  { rating: 5, title: "Incredible value for 60 count.", author: "Ashley M.", text: "Most brands give you 30. Getting 60 is a steal. I cut them in half to make them last even longer.", keywords: ["Huge Wipe"] },
  { rating: 5, title: "Safe for sensitive skin.", author: "Brian N.", text: "I have eczema and was worried. Surprisingly very soothing. No redness.", keywords: ["Ophthalmologist Approved"] },
  { rating: 5, title: "Prevented my stye.", author: "Chris P.", text: "Caught a stye early. Used the wipe as a warm compress then scrubbed. Stopped it in its tracks.", keywords: ["Stye Prevention"] },
  { rating: 5, title: "Rosacea friendly.", author: "Amanda Q.", text: "I have ocular rosacea. These wipes calm everything down.", keywords: ["Ophthalmologist Approved"] },
  { rating: 5, title: "Clean ingredients list.", author: "Joshua R.", text: "No parabens, no sulfates. Just good, effective ingredients. Why I switched.", keywords: ["Ophthalmologist Approved"] },
  { rating: 5, title: "Great for elderly parents.", author: "Lauren S.", text: "Bought these for my dad. Makes it easy for him to keep his eyes clean sitting in his recliner.", keywords: ["Huge Wipe"] },
  { rating: 5, title: "Gym bag essential.", author: "Matthew T.", text: "Sweat stings my eyes. I use these to clean the salt and sweat off. Prevents clogged pores.", keywords: ["Refreshing Tingle"] },
  { rating: 5, title: "Individually wrapped is key.", author: "Nicole U.", text: "I hate the tubs that dry out. These stay moist. Perfect for a purse.", keywords: ["Huge Wipe"] },
  { rating: 5, title: "Works on acne too?", author: "Andrew V.", text: "Acne around my temples cleared up after using these. Probably the tea tree oil.", keywords: ["Tea Tree Oil"] },
  { rating: 5, title: "Spa quality.", author: "Samantha W.", text: "The scent, the cooling feel... feels like a mini spa treatment.", keywords: ["Refreshing Tingle"] },
  { rating: 5, title: "Balanced formula.", author: "Daniel X.", text: "Tea tree can be harsh, but they balanced it perfectly. Strong enough to work, gentle enough for daily use.", keywords: ["Tea Tree Oil", "Ophthalmologist Approved"] },
  { rating: 5, title: "Gets the 'gunk' out.", author: "Rachel Y.", text: "If you wake up with sleep crusties, one swipe and it's all gone.", keywords: ["Blepharitis Control"] },
  { rating: 5, title: "Highly recommend for contact wearers.", author: "Anthony Z.", text: "Cleaning my lids after I take my lenses out feels amazing.", keywords: ["Ophthalmologist Approved"] },
  { rating: 4, title: "Box squished, product fine.", author: "Heather A.", text: "Shipping crushed the box, but wipes are sealed so they were fine.", keywords: ["Huge Wipe"] },
  { rating: 5, title: "Can't live without them.", author: "Brandon B.", text: "Ran out for a week and my eyes started itching. Never again.", keywords: ["Stye Prevention"] },
  { rating: 5, title: "Premium feel.", author: "Stephanie C.", text: "These don't feel like cheap paper. They feel like a premium cloth.", keywords: ["Huge Wipe"] },
  { rating: 5, title: "Great for travel.", author: "Ryan D.", text: "TSA friendly. Take them on every trip.", keywords: ["Huge Wipe"] },
  { rating: 5, title: "My teen loves them.", author: "Melissa E.", text: "Got these for my daughter who wears heavy eyeliner. She actually uses them.", keywords: ["Makeup Remover"] },
  { rating: 5, title: "Trust Archie's.", author: "Justin F.", text: "It's a brand that seems to get it. High quality, fair price.", keywords: ["Ophthalmologist Approved"] },
  { rating: 5, title: "Stye prevention strategy.", author: "Brittany G.", text: "Haven't had a single stye since starting this routine.", keywords: ["Stye Prevention"] },
  { rating: 5, title: "Cooling lasts.", author: "Tyler H.", text: "The fresh feeling lasts for like 15 minutes.", keywords: ["Refreshing Tingle"] },
  { rating: 5, title: "Moisturizing.", author: "Elizabeth I.", text: "Expected them to be drying, but they are surprisingly moisturizing.", keywords: ["Huge Wipe"] },
  { rating: 5, title: "Cut them in half!", author: "Alexander J.", text: "Pro tip: They are so big you can cut them in half and get 120 uses.", keywords: ["Huge Wipe"] },
  { rating: 5, title: "Eyeliner eraser.", author: "Victoria K.", text: "Takes off waterproof eyeliner without scrubbing hard.", keywords: ["Makeup Remover"] },
  { rating: 5, title: "Soothing relief.", author: "Jonathan L.", text: "My eyes just feel... relieved.", keywords: ["Refreshing Tingle"] },
  { rating: 5, title: "Nightly wind down.", author: "Christina M.", text: "Using this is the signal to my brain that it's time to sleep.", keywords: ["Stye Prevention"] },
  { rating: 5, title: "Kills the mites.", author: "Kevin N.", text: "If you have itchy lashes, it's probably mites. This kills them.", keywords: ["Tea Tree Oil"] },
  { rating: 5, title: "More awake.", author: "Rebecca O.", text: "My eyes look brighter and more awake after using.", keywords: ["Refreshing Tingle"] },
  { rating: 5, title: "Exfoliating.", author: "Thomas P.", text: "My eyelids used to be flaky. Now they are smooth.", keywords: ["Blepharitis Control"] },
  { rating: 5, title: "Doctor sample hooked me.", author: "Laura Q.", text: "Got a sample at the eye doctor. Ordered a box immediately.", keywords: ["Ophthalmologist Approved"] },
  { rating: 5, title: "Dad loves them.", author: "Richard R.", text: "My elderly father struggles with hygiene. These made it simple.", keywords: ["Huge Wipe"] },
  { rating: 5, title: "No burn.", author: "Kimberly S.", text: "Ready for the burn, but it never came. Just cool fresh air.", keywords: ["Refreshing Tingle"] },
  { rating: 5, title: "Perfect moisture level.", author: "Charles T.", text: "Not dripping wet, not dry. Just right.", keywords: ["Huge Wipe"] },
  { rating: 5, title: "Clean medicinal scent.", author: "Amy U.", text: "Smells like health. I love it.", keywords: ["Tea Tree Oil"] },
  { rating: 5, title: "Redness reducer.", author: "Patrick V.", text: "Skin around my eyes is less red/purple.", keywords: ["Blepharitis Control"] },
  { rating: 5, title: "The Best.", author: "Michelle W.", text: "Hands down better than any other lid wipe.", keywords: ["Ophthalmologist Approved"] },
  { rating: 5, title: "Auto-ship essential.", author: "Scott X.", text: "One box lasts me 2 months perfectly.", keywords: ["Huge Wipe"] },
  { rating: 5, title: "Wonderful product.", author: "Zoe L.", text: "If you wear makeup, you need them.", keywords: ["Makeup Remover"] },
];

async function seedReviews() {
  console.log('Seeding reviews...\n');

  // Clear existing reviews
  await client.execute('DELETE FROM reviews');
  await client.execute('DELETE FROM review_keywords');
  console.log('Cleared existing reviews and keywords\n');

  // Seed Eye Drops reviews
  console.log('Seeding Eye Drops reviews...');
  for (let i = 0; i < eyeDropsReviews.length; i++) {
    const review = eyeDropsReviews[i];
    await client.execute({
      sql: `INSERT INTO reviews (id, product_id, rating, title, author_name, author_initial, text, keywords, is_verified, is_featured, is_active, sort_order)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, 1, ?)`,
      args: [
        nanoid(),
        EYE_DROPS_ID,
        review.rating,
        review.title,
        review.author.split(' ')[0], // First name
        review.author,
        review.text,
        JSON.stringify(review.keywords),
        i < 5 ? 1 : 0, // First 5 are featured
        i
      ]
    });
  }
  console.log(`  ✓ Seeded ${eyeDropsReviews.length} Eye Drops reviews`);

  // Seed Eye Wipes reviews
  console.log('Seeding Eye Wipes reviews...');
  for (let i = 0; i < eyeWipesReviews.length; i++) {
    const review = eyeWipesReviews[i];
    await client.execute({
      sql: `INSERT INTO reviews (id, product_id, rating, title, author_name, author_initial, text, keywords, is_verified, is_featured, is_active, sort_order)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, 1, ?)`,
      args: [
        nanoid(),
        EYE_WIPES_ID,
        review.rating,
        review.title,
        review.author.split(' ')[0],
        review.author,
        review.text,
        JSON.stringify(review.keywords),
        i < 5 ? 1 : 0,
        i
      ]
    });
  }
  console.log(`  ✓ Seeded ${eyeWipesReviews.length} Eye Wipes reviews`);

  // Aggregate and seed keywords for Eye Drops
  console.log('\nSeeding review keywords...');
  const dropsKeywords: Record<string, number> = {};
  eyeDropsReviews.forEach(r => {
    r.keywords.forEach(k => {
      dropsKeywords[k] = (dropsKeywords[k] || 0) + 1;
    });
  });

  const dropsKeywordOrder = ['No Stinging', 'Contacts Safe', 'Post-LASIK', 'Construction Work', 'Screen Fatigue', 'Travel Friendly', 'Doctor Recommended'];
  for (let i = 0; i < dropsKeywordOrder.length; i++) {
    const keyword = dropsKeywordOrder[i];
    await client.execute({
      sql: 'INSERT INTO review_keywords (id, product_id, keyword, count, sort_order) VALUES (?, ?, ?, ?, ?)',
      args: [nanoid(), EYE_DROPS_ID, keyword, dropsKeywords[keyword] || 0, i]
    });
  }
  console.log(`  ✓ Seeded ${dropsKeywordOrder.length} Eye Drops keywords`);

  // Aggregate and seed keywords for Eye Wipes
  const wipesKeywords: Record<string, number> = {};
  eyeWipesReviews.forEach(r => {
    r.keywords.forEach(k => {
      wipesKeywords[k] = (wipesKeywords[k] || 0) + 1;
    });
  });

  const wipesKeywordOrder = ['Stye Prevention', 'Tea Tree Oil', 'Makeup Remover', 'Blepharitis Control', 'Huge Wipe', 'Refreshing Tingle', 'Ophthalmologist Approved'];
  for (let i = 0; i < wipesKeywordOrder.length; i++) {
    const keyword = wipesKeywordOrder[i];
    await client.execute({
      sql: 'INSERT INTO review_keywords (id, product_id, keyword, count, sort_order) VALUES (?, ?, ?, ?, ?)',
      args: [nanoid(), EYE_WIPES_ID, keyword, wipesKeywords[keyword] || 0, i]
    });
  }
  console.log(`  ✓ Seeded ${wipesKeywordOrder.length} Eye Wipes keywords`);

  // Seed certifications
  console.log('\nSeeding product certifications...');
  await client.execute('DELETE FROM product_certifications');

  // Eye Drops certifications
  const dropsCerts = [
    { icon: 'droplet', title: 'Preservative Free', description: 'Single-use vials eliminate irritating preservatives' },
    { icon: 'eye', title: 'Contact Safe', description: 'Safe for all contact lens types' },
    { icon: 'flag', title: 'Made in USA', description: 'Manufactured in FDA-registered facility' },
  ];
  for (let i = 0; i < dropsCerts.length; i++) {
    const cert = dropsCerts[i];
    await client.execute({
      sql: 'INSERT INTO product_certifications (id, product_id, icon, title, description, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
      args: [nanoid(), EYE_DROPS_ID, cert.icon, cert.title, cert.description, i]
    });
  }
  console.log(`  ✓ Seeded ${dropsCerts.length} Eye Drops certifications`);

  // Eye Wipes certifications
  const wipesCerts = [
    { icon: 'leaf', title: 'Natural Tea Tree', description: 'Therapeutic tea tree oil formula' },
    { icon: 'sparkles', title: 'Makeup Remover', description: 'Removes waterproof makeup gently' },
    { icon: 'plus', title: 'Stye Relief', description: 'Prevents and treats styes' },
  ];
  for (let i = 0; i < wipesCerts.length; i++) {
    const cert = wipesCerts[i];
    await client.execute({
      sql: 'INSERT INTO product_certifications (id, product_id, icon, title, description, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
      args: [nanoid(), EYE_WIPES_ID, cert.icon, cert.title, cert.description, i]
    });
  }
  console.log(`  ✓ Seeded ${wipesCerts.length} Eye Wipes certifications`);

  // Update product subtitles and drawer content
  console.log('\nUpdating product content...');

  await client.execute({
    sql: `UPDATE products SET
      subtitle = ?,
      ritual_title = 'The Ritual',
      ritual_content = ?,
      ingredients_title = 'Ingredients',
      ingredients_content = ?,
      shipping_title = 'Good to Know',
      shipping_content = ?
      WHERE id = ?`,
    args: [
      'The Instant Relief Ritual',
      '<p><strong>Step 1:</strong> Twist off the top of a single-use vial.</p><p><strong>Step 2:</strong> Tilt your head back slightly and squeeze 1-2 drops into each eye.</p><p><strong>Step 3:</strong> Blink gently to spread the solution. Recap and save for later use within 12 hours.</p><p><em>Use as needed throughout the day for lasting comfort.</em></p>',
      '<p><strong>What\'s In:</strong></p><ul><li>Purified Water</li><li>Sodium Hyaluronate (Hyaluronic Acid)</li><li>Electrolytes for natural tear balance</li></ul><p><strong>What\'s Not:</strong></p><ul><li>No Preservatives</li><li>No Parabens</li><li>No Phthalates</li><li>No Sulfates</li></ul>',
      '<p><strong>Shipping:</strong> Free Prime shipping on all orders. Arrives in 1-2 business days.</p><p><strong>Returns:</strong> 30-day satisfaction guarantee. If you\'re not happy, we\'ll make it right.</p><p><strong>Storage:</strong> Store at room temperature. Keep away from direct sunlight.</p>',
      EYE_DROPS_ID
    ]
  });
  console.log('  ✓ Updated Eye Drops content');

  await client.execute({
    sql: `UPDATE products SET
      subtitle = ?,
      ritual_title = 'The Ritual',
      ritual_content = ?,
      ingredients_title = 'Ingredients',
      ingredients_content = ?,
      shipping_title = 'Good to Know',
      shipping_content = ?
      WHERE id = ?`,
    args: [
      'Daily Cleansing, Elevated',
      '<p><strong>Step 1:</strong> Remove a wipe from its individual packet.</p><p><strong>Step 2:</strong> Close your eye and gently scrub from the inner corner outward along your lash line.</p><p><strong>Step 3:</strong> Repeat on the other eye using a clean section of the wipe.</p><p><em>Use morning and night for best results. No rinsing required.</em></p>',
      '<p><strong>What\'s In:</strong></p><ul><li>Tea Tree Oil (Melaleuca Alternifolia)</li><li>Coconut Oil</li><li>Aloe Vera</li><li>Chamomile Extract</li></ul><p><strong>What\'s Not:</strong></p><ul><li>No Parabens</li><li>No Sulfates</li><li>No Artificial Fragrances</li><li>No Alcohol</li></ul>',
      '<p><strong>Shipping:</strong> Free Prime shipping on all orders. Arrives in 1-2 business days.</p><p><strong>Returns:</strong> 30-day satisfaction guarantee. If you\'re not happy, we\'ll make it right.</p><p><strong>Storage:</strong> Store in a cool, dry place. Individually wrapped to maintain freshness.</p>',
      EYE_WIPES_ID
    ]
  });
  console.log('  ✓ Updated Eye Wipes content');

  console.log('\n✅ All seeding complete!');

  // Verify counts
  const reviewCount = await client.execute('SELECT COUNT(*) as count FROM reviews');
  const keywordCount = await client.execute('SELECT COUNT(*) as count FROM review_keywords');
  const certCount = await client.execute('SELECT COUNT(*) as count FROM product_certifications');

  console.log(`\nFinal counts:`);
  console.log(`  Reviews: ${reviewCount.rows[0].count}`);
  console.log(`  Keywords: ${keywordCount.rows[0].count}`);
  console.log(`  Certifications: ${certCount.rows[0].count}`);
}

seedReviews().catch(console.error);
