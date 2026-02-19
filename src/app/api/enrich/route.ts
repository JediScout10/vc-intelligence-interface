import { NextRequest, NextResponse } from 'next/server';

// In-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000;

// Safe OpenAI client function
function getOpenAIClient() {
  // Check for both possible environment variable names
  const apiKey = process.env.OPENAI_API_KEY || process.env.AI_API_KEY;
  
  if (!apiKey) {
    return null;
  }
  
  try {
    const OpenAI = require('openai').default;
    return new OpenAI({
      apiKey: apiKey,
    });
  } catch (error) {
    console.error('Failed to initialize OpenAI:', error);
    return null;
  }
}

interface EnrichmentRequest {
  websiteUrl: string;
}

interface EnrichmentResponse {
  success: boolean;
  summary: string;
  whatTheyDo: string[];
  keywords: string[];
  signals: string[];
  warning?: string;
  error?: string;
}

/* ===============================
   LLM EXTRACTION (NO sources here)
================================= */

async function extractWithLLM(
  text: string
): Promise<EnrichmentResponse> {
  // Get safe OpenAI client
  const openai = getOpenAIClient();
  if (!openai) {
    console.warn('OpenAI API key not available, using fallback extraction');
    return {
      success: true,
      summary: "Limited public information available from automated extraction.",
      whatTheyDo: [],
      keywords: [],
      signals: [],
      warning: "This website restricts automated data extraction. Consider adding manual notes."
    };
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `
You are a venture capital research analyst.

Extract structured intelligence from website content.

Return STRICT JSON only:
{
  "success": true,
  "summary": "1-2 analytical sentences",
  "whatTheyDo": ["3-6 concise bullets"],
  "keywords": ["6-10 lowercase keywords"],
  "signals": ["2-4 investor signals"]
}
`.trim(),
        },
        {
          role: "user",
          content: text.slice(0, 4000),
        },
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      console.warn('No content from OpenAI, using fallback');
      return {
        success: true,
        summary: "Limited public information available from automated extraction.",
        whatTheyDo: [],
        keywords: [],
        signals: [],
        warning: "This website restricts automated data extraction. Consider adding manual notes."
      };
    }

    const parsed = JSON.parse(content);
    
    // Validate the response structure
    if (!parsed || typeof parsed !== 'object') {
      console.warn('Invalid response from OpenAI, using fallback');
      return {
        success: true,
        summary: "Limited public information available from automated extraction.",
        whatTheyDo: [],
        keywords: [],
        signals: [],
        warning: "This website restricts automated data extraction. Consider adding manual notes."
      };
    }

    return {
      success: true,
      summary: parsed.summary || "Unable to extract summary",
      whatTheyDo: Array.isArray(parsed.whatTheyDo) ? parsed.whatTheyDo : [],
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
      signals: Array.isArray(parsed.signals) ? parsed.signals : []
    };
  } catch (error) {
    console.error('LLM extraction failed:', error);
    return {
      success: true,
      summary: "Limited public information available from automated extraction.",
      whatTheyDo: [],
      keywords: [],
      signals: [],
      warning: "This website restricts automated data extraction. Consider adding manual notes."
    };
  }
}

/* ===============================
   SIMPLE HTML CLEANER
================================= */

function extractTextFromHtml(html: string): string {
  let cleaned = html;

  cleaned = cleaned.replace(/<script[\s\S]*?<\/script>/gi, '');
  cleaned = cleaned.replace(/<style[\s\S]*?<\/style>/gi, '');
  cleaned = cleaned.replace(/<nav[\s\S]*?<\/nav>/gi, '');
  cleaned = cleaned.replace(/<footer[\s\S]*?<\/footer>/gi, '');
  cleaned = cleaned.replace(/<[^>]+>/g, ' ');
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  return cleaned;
}

/* ===============================
   META TAG EXTRACTION
================================= */

function extractMetaTags(html: string): { title: string; description: string } {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : '';
  
  const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["'][^>]*>/i);
  const ogDescMatch = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["'][^>]*>/i);
  
  const description = descMatch ? descMatch[1].trim() : (ogDescMatch ? ogDescMatch[1].trim() : '');
  
  return { title, description };
}

/* ===============================
   FALLBACK HEURISTIC
================================= */

function fallbackExtraction(
  text: string,
  metaTags: { title: string; description: string }
): EnrichmentResponse {
  const sentences = text
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 40 && s.length < 200);

  // Use meta tags as primary fallback
  let summary = metaTags.description || metaTags.title;
  
  // If no meta tags, use text extraction
  if (!summary) {
    summary = sentences.slice(0, 2).join(". ") || "No summary available.";
  }

  const hasMinimalContent = summary.length > 10 || sentences.length > 0;
  
  return {
    success: true,
    summary: hasMinimalContent ? summary : "Limited public information available from automated extraction.",
    whatTheyDo: hasMinimalContent ? sentences.slice(0, 3) : [],
    keywords: [],
    signals: [],
    warning: hasMinimalContent ? 
      "Limited automated data available. Consider adding manual notes for complete analysis." :
      "This website restricts automated data extraction. Consider adding manual notes."
  };
}

/* ===============================
   POST API
================================= */

export async function POST(request: NextRequest) {
  try {
    const body: EnrichmentRequest = await request.json();
    const { websiteUrl } = body;

    if (!websiteUrl) {
      return NextResponse.json(
        { error: "websiteUrl is required" },
        { status: 400 }
      );
    }

    new URL(websiteUrl);

    const cacheKey = websiteUrl.toLowerCase();
    const cached = cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json(cached.data);
    }

    const response = await fetch(websiteUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; VC-Bot/1.0)",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
      signal: AbortSignal.timeout(8000), // 8s timeout for better UX
    });

    if (!response.ok) {
      // Handle HTTP errors gracefully - don't throw for scraping limitations
      if (response.status === 403 || response.status === 429 || response.status === 404) {
        return NextResponse.json({
          success: true,
          summary: "Limited public information available from automated extraction.",
          whatTheyDo: [],
          keywords: [],
          signals: [],
          warning: "This website restricts automated data extraction. Consider adding manual notes."
        });
      }
      
      // For other HTTP errors, return structured error
      return NextResponse.json({
        success: false,
        summary: "",
        whatTheyDo: [],
        keywords: [],
        signals: [],
        error: `HTTP ${response.status}: ${response.statusText}`
      });
    }

    const html = await response.text();
    const text = extractTextFromHtml(html);
    const metaTags = extractMetaTags(html);

    let enrichmentData = await extractWithLLM(text);

    // Always ensure we have valid data
    if (!enrichmentData.summary || enrichmentData.summary.length < 20) {
      enrichmentData = fallbackExtraction(text, metaTags);
    }

    const finalData: EnrichmentResponse = {
      ...enrichmentData
    };

    cache.set(cacheKey, { data: finalData, timestamp: Date.now() });

    return NextResponse.json(finalData);
  } catch (error: any) {
    console.error("Enrichment error:", error);
    
    // Always return JSON, never plain text
    return NextResponse.json(
      { 
        error: "Enrichment failed", 
        message: error?.message || "Unknown error occurred",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

/* ===============================
   HEALTH CHECK
================================= */

export async function GET() {
  return NextResponse.json({
    status: "healthy",
    cacheSize: cache.size,
    timestamp: new Date().toISOString(),
  });
}
