export interface Enrichment {
  summary: string;
  whatTheyDo: string[];
  keywords: string[];
  signals: string[];
  sources: {
    url: string;
    timestamp: string;
  }[];
}

export interface Company {
  id: string;
  name: string;
  website: string;
  industry: string;
  stage: 'Seed' | 'Series A' | 'Series B' | 'Series C' | 'Growth' | 'IPO';
  location: string;
  enrichment?: Enrichment;
}

const companies: Company[] = [
  {
    id: '1',
    name: 'Stripe',
    website: 'https://stripe.com',
    industry: 'Fintech',
    stage: 'Growth',
    location: 'San Francisco, CA'
  },
  {
    id: '2',
    name: 'Airtable',
    website: 'https://airtable.com',
    industry: 'Productivity',
    stage: 'Growth',
    location: 'San Francisco, CA'
  },
  {
    id: '3',
    name: 'Ramp',
    website: 'https://ramp.com',
    industry: 'Fintech',
    stage: 'Series C',
    location: 'New York, NY'
  },
  {
    id: '4',
    name: 'Vercel',
    website: 'https://vercel.com',
    industry: 'Developer Tools',
    stage: 'Series B',
    location: 'San Francisco, CA'
  },
  {
    id: '5',
    name: 'Retool',
    website: 'https://retool.com',
    industry: 'Developer Tools',
    stage: 'Series C',
    location: 'San Francisco, CA'
  },
  {
    id: '6',
    name: 'Warp',
    website: 'https://www.warp.dev',
    industry: 'Developer Tools',
    stage: 'Series A',
    location: 'San Francisco, CA'
  },
  {
    id: '7',
    name: 'Linear',
    website: 'https://linear.app',
    industry: 'Productivity',
    stage: 'Series B',
    location: 'San Francisco, CA'
  },
  {
    id: '8',
    name: 'Clerk',
    website: 'https://clerk.dev',
    industry: 'Developer Tools',
    stage: 'Series A',
    location: 'San Francisco, CA'
  },
  {
    id: '9',
    name: 'Supabase',
    website: 'https://supabase.com',
    industry: 'Developer Tools',
    stage: 'Series B',
    location: 'San Francisco, CA'
  },
  {
    id: '10',
    name: 'PlanetScale',
    website: 'https://planetscale.com',
    industry: 'Developer Tools',
    stage: 'Series B',
    location: 'San Francisco, CA'
  },
  {
    id: '11',
    name: 'Hugging Face',
    website: 'https://huggingface.co',
    industry: 'AI/ML',
    stage: 'Series C',
    location: 'New York, NY'
  },
  {
    id: '12',
    name: 'Runway',
    website: 'https://runwayml.com',
    industry: 'AI/ML',
    stage: 'Series C',
    location: 'New York, NY'
  },
  {
    id: '13',
    name: 'Anthropic',
    website: 'https://anthropic.com',
    industry: 'AI/ML',
    stage: 'Series C',
    location: 'San Francisco, CA'
  },
  {
    id: '14',
    name: 'Perplexity',
    website: 'https://perplexity.ai',
    industry: 'AI/ML',
    stage: 'Series B',
    location: 'San Francisco, CA'
  },
  {
    id: '15',
    name: 'Character.AI',
    website: 'https://character.ai',
    industry: 'AI/ML',
    stage: 'Series A',
    location: 'Palo Alto, CA'
  },
  {
    id: '16',
    name: 'Pinecone',
    website: 'https://pinecone.io',
    industry: 'AI/ML',
    stage: 'Series B',
    location: 'New York, NY'
  },
  {
    id: '17',
    name: 'Sequin',
    website: 'https://sequin.io',
    industry: 'Developer Tools',
    stage: 'Seed',
    location: 'San Francisco, CA'
  },
  {
    id: '18',
    name: 'Neon',
    website: 'https://neon.tech',
    industry: 'Developer Tools',
    stage: 'Series B',
    location: 'San Francisco, CA'
  },
  {
    id: '19',
    name: 'Midday',
    website: 'https://midday.ai',
    industry: 'Fintech',
    stage: 'Seed',
    location: 'San Francisco, CA'
  },
  {
    id: '20',
    name: 'Loom',
    website: 'https://loom.com',
    industry: 'Productivity',
    stage: 'Growth',
    location: 'San Francisco, CA'
  }
];

export default companies;
