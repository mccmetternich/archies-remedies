import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from '../src/lib/db/schema';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const db = drizzle(client, { schema });

function generateId(length: number = 21): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function seed() {
  console.log('🌱 Seeding database...\n');

  // Site Settings
  console.log('Creating site settings...');
  await db.insert(schema.siteSettings).values({
    id: 'default',
    siteName: "Archie's Remedies",
    tagline: 'Safe, Dry Eye Relief that Works',
    primaryColor: '#bbdae9',
    secondaryColor: '#f5f0eb',
    metaTitle: "Archie's Remedies - Safe, Clean Eye Care",
    metaDescription: 'Preservative-free eye drops and gentle eye wipes made without questionable ingredients. Safe for all ages.',
    amazonStoreUrl: 'https://www.amazon.com/stores/Archie%27s+Remedies/page/YOUR-STORE-ID',
    emailPopupEnabled: true,
    emailPopupTitle: 'Join the Archie\'s Community',
    emailPopupSubtitle: 'Get 10% off your first order and be the first to know about new products.',
    emailPopupButtonText: 'Get My 10% Off',
  });

  // Products
  console.log('Creating products...');

  const eyeDropsId = generateId();
  const eyeWipesId = generateId();

  // Eye Drops
  await db.insert(schema.products).values({
    id: eyeDropsId,
    slug: 'eye-drops',
    name: 'Dry Eye Relief Drops',
    shortDescription: 'Ultra lubricating, preservative-free eye drops in convenient single-use vials.',
    longDescription: `<h2>Instant Relief, Clean Formula</h2>
<p>Our Dry Eye Relief Drops are formulated to instantly lubricate and soothe dry, irritated, red, and itchy eyes. Each single-use vial ensures a fresh, preservative-free dose every time.</p>

<h3>Why Choose Archie's Eye Drops?</h3>
<ul>
  <li><strong>Preservative-Free:</strong> Single-use vials eliminate the need for preservatives that can irritate sensitive eyes</li>
  <li><strong>Long-Lasting Relief:</strong> Our advanced formula provides comfort for up to 8 hours</li>
  <li><strong>Safe for All Ages:</strong> Gentle enough for the whole family</li>
  <li><strong>On-the-Go Convenience:</strong> Compact vials perfect for travel, work, or daily use</li>
</ul>

<h3>Perfect For</h3>
<p>Screen time fatigue, contact lens wearers, allergy season, post-surgery care (LASIK/cataract), air travel, dry climates, and medication side effects.</p>`,
    price: 24.99,
    compareAtPrice: 29.99,
    isActive: true,
    sortOrder: 1,
  });

  // Eye Wipes
  await db.insert(schema.products).values({
    id: eyeWipesId,
    slug: 'eye-wipes',
    name: 'Eyelid Cleansing Wipes',
    shortDescription: 'Gentle, pre-moistened wipes with Australian Tea Tree Oil for daily eye hygiene.',
    longDescription: `<h2>Gentle Daily Cleansing</h2>
<p>Our Eyelid Cleansing Wipes are pre-moistened with a gentle, effective formula featuring Australian Tea Tree Oil. Perfect for maintaining daily eye hygiene and removing debris, oils, and makeup residue.</p>

<h3>Why Choose Archie's Eye Wipes?</h3>
<ul>
  <li><strong>Australian Tea Tree Oil:</strong> Natural cleansing power without harsh chemicals</li>
  <li><strong>Pre-Moistened:</strong> Ready to use, no additional products needed</li>
  <li><strong>Sensitive Skin Safe:</strong> Paraben-free, sulfate-free, phthalate-free formula</li>
  <li><strong>Daily Use:</strong> Gentle enough for everyday eye care maintenance</li>
</ul>

<h3>Perfect For</h3>
<p>Daily eye hygiene, makeup removal, blepharitis management, contact lens wearers, and anyone seeking a cleaner eye care routine.</p>`,
    price: 19.99,
    compareAtPrice: 24.99,
    isActive: true,
    sortOrder: 2,
  });

  // Product Variants
  console.log('Creating product variants...');

  // Eye Drops - 30 count
  await db.insert(schema.productVariants).values({
    id: generateId(),
    productId: eyeDropsId,
    name: '30 Count',
    price: 24.99,
    compareAtPrice: 29.99,
    amazonUrl: 'https://www.amazon.com/Archies-Remedies-Lubricating-Preservative-Free-Single-Use/dp/B0CN7HBR5D',
    isDefault: false,
    sortOrder: 1,
  });

  // Eye Drops - 60 count (default/best value)
  await db.insert(schema.productVariants).values({
    id: generateId(),
    productId: eyeDropsId,
    name: '60 Count',
    price: 39.99,
    compareAtPrice: 49.99,
    amazonUrl: 'https://www.amazon.com/Archies-Remedies-Lubricating-Preservative-Free-Single-Use/dp/B0CN7HBR5D', // Update with 60-count URL
    isDefault: true,
    sortOrder: 2,
  });

  // Eye Wipes - 30 count
  await db.insert(schema.productVariants).values({
    id: generateId(),
    productId: eyeWipesId,
    name: '30 Count',
    price: 19.99,
    compareAtPrice: 24.99,
    amazonUrl: 'https://www.amazon.com/Archies-Remedies-Eyelid-Cleanser-Scrub/dp/B0D25C2V2B',
    isDefault: true,
    sortOrder: 1,
  });

  // Product Benefits (What's In / What's Not)
  console.log('Creating product benefits...');

  // Eye Drops - What's In
  const dropsPositiveBenefits = [
    { title: 'Preservative-Free', description: 'Single-use vials eliminate irritating preservatives' },
    { title: 'Ultra Lubricating', description: 'Advanced formula for instant, lasting comfort' },
    { title: 'Natural Tears', description: 'Mimics your natural tear composition' },
    { title: 'Safe for All Ages', description: 'Gentle formula the whole family can use' },
  ];

  for (let i = 0; i < dropsPositiveBenefits.length; i++) {
    await db.insert(schema.productBenefits).values({
      id: generateId(),
      productId: eyeDropsId,
      title: dropsPositiveBenefits[i].title,
      description: dropsPositiveBenefits[i].description,
      isPositive: true,
      sortOrder: i + 1,
    });
  }

  // Eye Drops - What's Not
  const dropsNegativeBenefits = [
    { title: 'No Preservatives', description: 'Avoids irritation and allergic reactions' },
    { title: 'No Phthalates', description: 'Eliminates chemicals linked to ocular toxicity' },
    { title: 'No Parabens', description: 'Reduces hormonal and reproductive concerns' },
    { title: 'No Sulfates', description: 'Prevents eye irritation and allergic reactions' },
  ];

  for (let i = 0; i < dropsNegativeBenefits.length; i++) {
    await db.insert(schema.productBenefits).values({
      id: generateId(),
      productId: eyeDropsId,
      title: dropsNegativeBenefits[i].title,
      description: dropsNegativeBenefits[i].description,
      isPositive: false,
      sortOrder: i + 1,
    });
  }

  // Eye Wipes - What's In
  const wipesPositiveBenefits = [
    { title: 'Australian Tea Tree Oil', description: 'Natural antibacterial and cleansing power' },
    { title: 'Pre-Moistened', description: 'Ready to use, perfectly portioned' },
    { title: 'Sensitive Skin Safe', description: 'Dermatologist tested for gentleness' },
    { title: 'Daily Use Formula', description: 'Gentle enough for everyday care' },
  ];

  for (let i = 0; i < wipesPositiveBenefits.length; i++) {
    await db.insert(schema.productBenefits).values({
      id: generateId(),
      productId: eyeWipesId,
      title: wipesPositiveBenefits[i].title,
      description: wipesPositiveBenefits[i].description,
      isPositive: true,
      sortOrder: i + 1,
    });
  }

  // Eye Wipes - What's Not
  for (let i = 0; i < dropsNegativeBenefits.length; i++) {
    await db.insert(schema.productBenefits).values({
      id: generateId(),
      productId: eyeWipesId,
      title: dropsNegativeBenefits[i].title,
      description: dropsNegativeBenefits[i].description,
      isPositive: false,
      sortOrder: i + 1,
    });
  }

  // Hero Slides
  console.log('Creating hero slides...');
  await db.insert(schema.heroSlides).values([
    {
      id: generateId(),
      title: 'Safe, Dry Eye Relief',
      subtitle: 'Made clean without the questionable ingredients',
      buttonText: 'Shop Eye Drops',
      buttonUrl: '/products/eye-drops',
      imageUrl: '/images/hero-1.jpg', // Placeholder
      testimonialText: '"Clean, gentle and highly effective. Finally, eye drops I can trust."',
      testimonialAuthor: 'Sarah M., Verified Buyer',
      isActive: true,
      sortOrder: 1,
    },
    {
      id: generateId(),
      title: 'New: Eyelid Wipes',
      subtitle: 'Gentle daily cleansing with Australian Tea Tree Oil',
      buttonText: 'Shop Eye Wipes',
      buttonUrl: '/products/eye-wipes',
      imageUrl: '/images/hero-2.jpg', // Placeholder
      testimonialText: '"My morning routine is complete. These wipes are a game changer!"',
      testimonialAuthor: 'Michael T., Verified Buyer',
      isActive: true,
      sortOrder: 2,
    },
  ]);

  // Testimonials
  console.log('Creating testimonials...');
  const testimonials = [
    { name: 'Sarah M.', location: 'Los Angeles, CA', rating: 5, text: 'Clean, gentle and highly effective, providing instant, long-lasting daily comfort. Finally eye drops I can trust!', isFeatured: true },
    { name: 'Michael T.', location: 'New York, NY', rating: 5, text: 'After the recalls, I was scared to use any eye drops. Archie\'s changed that. Preservative-free and actually works!', isFeatured: true },
    { name: 'Jennifer L.', location: 'Chicago, IL', rating: 5, text: 'I use these every day at work. The single vials are so convenient and my eyes feel amazing all day.', isFeatured: false },
    { name: 'David K.', location: 'Houston, TX', rating: 5, text: 'Best eye drops I\'ve ever used. No burning, no irritation, just relief. My whole family uses them now.', isFeatured: false },
    { name: 'Amanda R.', location: 'Phoenix, AZ', rating: 5, text: 'The eye wipes are incredible! Tea tree oil is so soothing and they\'re gentle enough for my sensitive skin.', isFeatured: true },
    { name: 'Robert H.', location: 'Seattle, WA', rating: 5, text: 'As a contact lens wearer, these drops are a lifesaver. 8 hours of relief is no joke!', isFeatured: false },
  ];

  for (const t of testimonials) {
    await db.insert(schema.testimonials).values({
      id: generateId(),
      name: t.name,
      location: t.location,
      rating: t.rating,
      text: t.text,
      isVerified: true,
      isFeatured: t.isFeatured,
      isActive: true,
      sortOrder: testimonials.indexOf(t) + 1,
    });
  }

  // FAQs
  console.log('Creating FAQs...');
  const faqs = [
    {
      question: 'What makes Archie\'s eye drops different from other brands?',
      answer: 'Our eye drops are preservative-free, phthalate-free, paraben-free, and sulfate-free. Each single-use vial ensures a fresh, uncontaminated dose every time. We\'ve eliminated the questionable chemicals that other brands use, making our formula safe for all ages and sensitive eyes.',
      category: 'Products',
    },
    {
      question: 'How often can I use the eye drops?',
      answer: 'Our preservative-free eye drops can be used as often as needed throughout the day. Most users find relief with 1-2 drops per eye, 3-4 times daily. Since there are no preservatives, you don\'t have to worry about overuse.',
      category: 'Usage',
    },
    {
      question: 'Are the eye drops safe for contact lens wearers?',
      answer: 'Yes! Our eye drops are safe to use with contact lenses. You can apply them while wearing contacts or use them before inserting your lenses for extra comfort throughout the day.',
      category: 'Usage',
    },
    {
      question: 'How long does the relief last?',
      answer: 'Our ultra-lubricating formula provides relief for up to 8 hours. However, individual results may vary based on the severity of your dry eye condition and environmental factors.',
      category: 'Products',
    },
    {
      question: 'What is the shelf life of the products?',
      answer: 'Unopened vials have a shelf life of 24 months from the manufacturing date. Once opened, a single-use vial should be used immediately and any remaining solution discarded to maintain sterility.',
      category: 'Products',
    },
    {
      question: 'Can children use Archie\'s eye drops?',
      answer: 'Yes, our eye drops are safe for all ages. The gentle, preservative-free formula is suitable for children. However, we always recommend consulting with a pediatrician for children under 2 years of age.',
      category: 'Usage',
    },
    {
      question: 'What is the difference between the 30 and 60 count packs?',
      answer: 'Both packs contain the same high-quality, preservative-free eye drops. The 60 count is our most popular option as it offers better value and ensures you always have relief on hand. The 30 count is perfect for first-time customers or travel.',
      category: 'Products',
    },
    {
      question: 'How should I store the eye drops?',
      answer: 'Store your eye drops at room temperature, away from direct sunlight and heat. There\'s no need to refrigerate. Keep them in a cool, dry place for optimal freshness.',
      category: 'Usage',
    },
    {
      question: 'Where can I purchase Archie\'s products?',
      answer: 'Currently, Archie\'s Remedies products are available exclusively on Amazon. Click the "Buy Now" button on any product page to be taken directly to our Amazon listing.',
      category: 'Orders',
    },
    {
      question: 'Do you offer international shipping?',
      answer: 'International shipping is available through Amazon\'s global shipping program. Availability and shipping costs vary by country. Check Amazon for specific details about shipping to your location.',
      category: 'Orders',
    },
  ];

  for (let i = 0; i < faqs.length; i++) {
    await db.insert(schema.faqs).values({
      id: generateId(),
      question: faqs[i].question,
      answer: faqs[i].answer,
      category: faqs[i].category,
      isActive: true,
      sortOrder: i + 1,
    });
  }

  // Pages
  console.log('Creating pages...');
  await db.insert(schema.pages).values([
    {
      id: generateId(),
      slug: 'about',
      title: 'About Us',
      content: `<h1>Our Story</h1>
<p>Archie's Remedies was born from a simple belief: everyone deserves access to safe, effective eye care without the worry of questionable ingredients.</p>

<p>After the alarming eye drop recalls that shook consumer confidence, we knew there had to be a better way. We set out to create products that prioritize safety without compromising on effectiveness.</p>

<h2>Our Promise</h2>
<p>Every Archie's product is:</p>
<ul>
  <li><strong>Preservative-Free</strong> – No irritating chemicals</li>
  <li><strong>Phthalate-Free</strong> – No hidden toxins</li>
  <li><strong>Paraben-Free</strong> – No hormonal disruptors</li>
  <li><strong>Sulfate-Free</strong> – No harsh cleansers</li>
</ul>

<h2>Made for Everyone</h2>
<p>From busy professionals dealing with screen fatigue to parents looking for safe options for their children, Archie's is for anyone who wants clean, effective eye care they can trust.</p>`,
      metaTitle: "About Archie's Remedies - Our Story",
      metaDescription: "Learn about Archie's Remedies and our commitment to safe, clean eye care without questionable ingredients.",
      isActive: true,
    },
    {
      id: generateId(),
      slug: 'privacy',
      title: 'Privacy Policy',
      content: `<h1>Privacy Policy</h1>
<p>Last updated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

<p>At Archie's Remedies, we are committed to protecting your privacy. This policy explains how we collect, use, and safeguard your information.</p>

<h2>Information We Collect</h2>
<p>We collect information you provide directly, such as your email address when subscribing to our newsletter or contacting us.</p>

<h2>How We Use Your Information</h2>
<ul>
  <li>To send you newsletters and promotional materials (with your consent)</li>
  <li>To respond to your inquiries</li>
  <li>To improve our website and services</li>
</ul>

<h2>Contact Us</h2>
<p>If you have questions about this privacy policy, please contact us through our Contact page.</p>`,
      metaTitle: "Privacy Policy - Archie's Remedies",
      metaDescription: "Read our privacy policy to understand how we collect, use, and protect your personal information.",
      isActive: true,
    },
    {
      id: generateId(),
      slug: 'terms',
      title: 'Terms of Service',
      content: `<h1>Terms of Service</h1>
<p>Last updated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

<p>Welcome to Archie's Remedies. By using our website, you agree to these terms of service.</p>

<h2>Use of Website</h2>
<p>This website is for informational purposes. All purchases are made through Amazon and are subject to Amazon's terms and conditions.</p>

<h2>Intellectual Property</h2>
<p>All content on this website, including text, images, and logos, is the property of Archie's Remedies and is protected by copyright law.</p>

<h2>Disclaimer</h2>
<p>Our products are not intended to diagnose, treat, cure, or prevent any disease. Consult a healthcare professional for medical advice.</p>

<h2>Contact</h2>
<p>For questions about these terms, please contact us through our Contact page.</p>`,
      metaTitle: "Terms of Service - Archie's Remedies",
      metaDescription: "Read our terms of service for using the Archie's Remedies website.",
      isActive: true,
    },
  ]);

  console.log('\n✅ Database seeded successfully!');
}

seed()
  .catch(console.error)
  .finally(() => process.exit());
