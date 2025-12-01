import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, Feedback } from "../types";

// Safely retrieve API Key
const getApiKey = () => {
    try {
        return process.env.API_KEY || "";
    } catch {
        return "";
    }
};

// Configuration and Constants
const CONFIG = {
    API_KEY: getApiKey(),
    MODELS: {
        FLASH_LITE: "gemini-flash-lite-latest",
        FLASH: "gemini-flash-lite-latest",
        PRO: "gemini-flash-lite-latest",
    },
    RETRY: {
        MAX_ATTEMPTS: 3,
        INITIAL_DELAY: 1000,
        BACKOFF_MULTIPLIER: 2,
    },
    TIMEOUTS: {
        FAST: 10000, // 10s for fast operations
        STANDARD: 30000, // 30s for standard operations
        EXTENDED: 60000, // 60s for complex operations
    },
    MAX_KEYWORDS: 10,
    MAX_REPLY_LENGTH: 100,
} as const;

// Type Definitions
interface ChatHistoryEntry {
    role: "user" | "model";
    parts: Array<{ text: string }>;
}

interface AnalysisResult {
    category: string;
    sentiment: "Positive" | "Neutral" | "Negative";
}

interface ParsedProfileData {
    bio?: string;
    skills?: string[];
    projects?: Array<{
        title?: string;
        description?: string;
        technologies?: string[];
        link?: string;
    }>;
}

// Custom Error Classes
class GeminiServiceError extends Error {
    constructor(message: string, public readonly originalError?: unknown) {
        super(message);
        this.name = "GeminiServiceError";
    }
}

class APIKeyError extends GeminiServiceError {
    constructor() {
        super("API key is not configured. Please set the API_KEY environment variable.");
        this.name = "APIKeyError";
    }
}

// Initialize AI client (lazy initialization to ensure API key is loaded)
const getAI = () => new GoogleGenAI({ apiKey: CONFIG.API_KEY });

/**
 * Robust UUID generator with crypto API fallback
 */
const generateUUID = (): string => {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }

    // RFC4122 version 4 compliant fallback
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};

/**
 * Enhanced JSON parser with better error handling and logging
 */
const parseJSON = <T>(text: string | undefined, fallback: T): T => {
    if (!text) {
        console.warn("Empty text provided to parseJSON");
        return fallback;
    }

    try {
        // Remove markdown code blocks and trim
        const cleaned = text
            .replace(/```json\s*/gi, "")
            .replace(/```\s*$/g, "")
            .trim();

        if (!cleaned) {
            console.warn("Text became empty after cleaning");
            return fallback;
        }

        return JSON.parse(cleaned) as T;
    } catch (error) {
        console.error("JSON parsing failed:", {
            error: error instanceof Error ? error.message : String(error),
            textSample: text.substring(0, 100),
        });
        return fallback;
    }
};

/**
 * Generic retry wrapper with exponential backoff
 */
const withRetry = async <T>(
    fn: () => Promise<T>,
    context: string,
    maxAttempts = CONFIG.RETRY.MAX_ATTEMPTS
): Promise<T> => {
    let lastError: Error | unknown;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;

            if (attempt === maxAttempts) {
                break;
            }

            const delay = CONFIG.RETRY.INITIAL_DELAY * Math.pow(CONFIG.RETRY.BACKOFF_MULTIPLIER, attempt - 1);
            console.warn(`${context} failed (attempt ${attempt}/${maxAttempts}), retrying in ${delay}ms...`, error);

            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    throw new GeminiServiceError(
        `${context} failed after ${maxAttempts} attempts`,
        lastError
    );
};

/**
 * Timeout wrapper for API calls
 */
const withTimeout = <T>(promise: Promise<T>, ms: number, operation: string): Promise<T> => {
    return Promise.race([
        promise,
        new Promise<T>((_, reject) =>
            setTimeout(() => reject(new Error(`${operation} timed out after ${ms}ms`)), ms)
        ),
    ]);
};

/**
 * Extracts top technical skills from text using Gemini Flash Lite
 * Optimized for speed with ultra-low latency
 */
export const analyzeInputFast = async (text: string): Promise<string[]> => {
    if (!text.trim()) {
        console.warn("Empty text provided to analyzeInputFast");
        return [];
    }

    if (!CONFIG.API_KEY) {
        console.warn("API Key missing, returning fallback tags");
        return ["Strategy", "Leadership", "Development"];
    }

    return withRetry(async () => {
        const response = await withTimeout(
            getAI().models.generateContent({
                model: CONFIG.MODELS.FLASH_LITE,
                config: {
                    responseMimeType: "application/json",
                },
                contents: `
          Extract the top ${CONFIG.MAX_KEYWORDS} technical skills, tools, or frameworks from this text.
          
          Prioritize:
          1. Specific, modern, hard skills (e.g., "Next.js", "Kubernetes", "Figma", "Rust")
          2. Technical frameworks and libraries
          3. Programming languages
          4. Professional tools and platforms
          
          Avoid:
          - Generic terms (e.g., "Development", "Leadership", "Teamwork")
          - Soft skills
          - Vague descriptions
          
          Return ONLY valid JSON in this exact format:
          {"keywords": ["keyword1", "keyword2", "keyword3"]}

          Text:
          """${text.substring(0, 5000)}"""
        `,
            }),
            CONFIG.TIMEOUTS.FAST,
            "Fast keyword analysis"
        );

        const json = parseJSON<{ keywords?: string[] }>(response.text, { keywords: [] });
        const rawKeywords = Array.isArray(json.keywords) ? json.keywords : [];

        return rawKeywords
            .map((s) => s.trim())
            .filter((s) => s.length > 0 && s.length < 50) // Reasonable length check
            .slice(0, CONFIG.MAX_KEYWORDS);
    }, "analyzeInputFast")
        .catch((error) => {
            console.error("Fast analysis failed:", error);
            return ["Strategy", "Leadership", "Development"]; // Safe fallback
        });
};

/**
 * Analyzes feedback sentiment and categorization
 * Uses Flash Lite for low-latency classification
 */
export const analyzeIncomingFeedback = async (text: string): Promise<AnalysisResult> => {
    if (!text.trim()) {
        return { category: "Other", sentiment: "Neutral" };
    }

    if (!CONFIG.API_KEY) {
        return { category: "Uncategorized", sentiment: "Neutral" };
    }

    return withRetry(async () => {
        const response = await withTimeout(
            getAI().models.generateContent({
                model: CONFIG.MODELS.FLASH_LITE,
                config: {
                    responseMimeType: "application/json",
                },
                contents: `
          Analyze the following feedback message for a professional portfolio.
          
          Classify it into ONE category:
          - "Work Opportunity": Job offers, collaboration requests, project proposals
          - "Praise": Compliments, positive feedback, appreciation
          - "Question": Inquiries about experience, skills, or availability
          - "Bug Report": Technical issues, errors, or problems with the site
          - "Other": Anything else
          
          Determine sentiment:
          - "Positive": Encouraging, complimentary, enthusiastic
          - "Neutral": Factual, informational, neither positive nor negative
          - "Negative": Critical, complaining, disappointed
          
          Return ONLY valid JSON:
          {"category": "string", "sentiment": "string"}
          
          Message:
          """${text.substring(0, 2000)}"""
        `,
            }),
            CONFIG.TIMEOUTS.FAST,
            "Feedback analysis"
        );

        const json = parseJSON<{
            category?: string;
            sentiment?: string;
        }>(response.text, {});

        const validSentiments = ["Positive", "Neutral", "Negative"] as const;
        const sentiment = validSentiments.includes(json.sentiment as AnalysisResult["sentiment"])
            ? (json.sentiment as AnalysisResult["sentiment"])
            : "Neutral";

        return {
            category: json.category || "Other",
            sentiment,
        };
    }, "analyzeIncomingFeedback")
        .catch((error) => {
            console.error("Feedback analysis failed:", error);
            return { category: "Uncategorized", sentiment: "Neutral" };
        });
};

/**
 * Generates a professional email reply draft
 * Uses Gemini Flash for balanced quality and speed
 */
export const generateReplyDraft = async (
    feedback: Feedback,
    ownerName: string
): Promise<string> => {
    if (!feedback.message.trim()) {
        return "Thank you for reaching out. I appreciate your interest.";
    }

    if (!CONFIG.API_KEY) {
        return "Thank you for your message. I appreciate your feedback and will get back to you soon.";
    }

    return withRetry(async () => {
        const response = await withTimeout(
            getAI().models.generateContent({
                model: CONFIG.MODELS.FLASH,
                contents: `
          You are ${ownerName}, responding to feedback on your professional portfolio.
          
          Sender: ${feedback.name ?? "Unknown"}
          Email: ${feedback.email ?? "Not provided"}
          Category: ${feedback.category ?? "General"}
          Sentiment: ${feedback.sentiment ?? "Neutral"}
          
          Message:
          """${feedback.message}"""
          
          Draft a professional, concise, and warm email reply.
          
          Guidelines:
          - Be authentic and personable, not robotic
          - Keep it under ${CONFIG.MAX_REPLY_LENGTH} words
          - Match the tone to the sentiment (enthusiastic for positive, professional for neutral)
          - Include a clear next step or call to action if appropriate
          - Sign off naturally
          
          Write ONLY the email body, no subject line.
        `,
            }),
            CONFIG.TIMEOUTS.STANDARD,
            "Reply draft generation"
        );

        const reply = response.text?.trim();
        return reply || "Thank you for your message. I appreciate your feedback and will get back to you soon.";
    }, "generateReplyDraft")
        .catch((error) => {
            console.error("Reply drafting failed:", error);
            return "Thank you for reaching out. I appreciate your feedback and will get back to you soon.";
        });
};

/**
 * Generates complete user profile with structured output
 * Uses Gemini Flash with schema validation for reliability
 */
export const generateFullProfile = async (
    name: string,
    role: string,
    rawText: string,
    linkedinUrl?: string,
    githubUrl?: string
): Promise<UserProfile> => {
    if (!name.trim() || !role.trim() || !rawText.trim()) {
        throw new GeminiServiceError("Name, role, and background text are required");
    }

    if (!CONFIG.API_KEY) {
        throw new APIKeyError();
    }

    const systemInstruction = `
    You are a professional luxury brand copywriter specializing in portfolio content.
    
    Brand Voice Guidelines:
    - Minimalist, confident, sophisticated
    - Strong action verbs, concrete achievements
    - Clear and direct language
    - Avoid: "passionate", "ninja", "guru", "rockstar", buzzwords
    - Focus on impact and results
    
    Create authentic, compelling content that showcases expertise without overselling.
  `;

    const prompt = `
    Create a structured portfolio for:
    
    Name: ${name}
    Role: ${role}
    
    Background Information:
    """${rawText.substring(0, 10000)}"""

    The user has provided these links (context only, do not scrape):
    LinkedIn: ${linkedinUrl || 'Not provided'}
    GitHub: ${githubUrl || 'Not provided'}
    
    Generate:
    1. A concise bio (2-3 sentences) highlighting key expertise and unique value
    2. Top 8-12 relevant skills (specific technologies, tools, methodologies)
    3. 3-5 notable projects with clear descriptions and tech stacks. Use the user's background info to infer these.
    
    Ensure all content is professional, specific, and results-oriented.
  `;

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            bio: {
                type: Type.STRING,
                description: "2-3 sentence professional bio"
            },
            skills: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "List of 8-12 technical skills and tools"
            },
            projects: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        title: {
                            type: Type.STRING,
                            description: "Clear, descriptive project name"
                        },
                        description: {
                            type: Type.STRING,
                            description: "2-3 sentence description focusing on impact and results"
                        },
                        technologies: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: "List of technologies used"
                        },
                        link: {
                            type: Type.STRING,
                            description: "A placeholder link for the project (e.g. #project-name)"
                        }
                    },
                    required: ["title", "description", "technologies"],
                },
                description: "List of 3-5 notable projects"
            },
        },
        required: ["bio", "skills", "projects"],
    };

    return withRetry(async () => {
        const response = await withTimeout(
            getAI().models.generateContent({
                model: CONFIG.MODELS.FLASH,
                contents: prompt,
                config: {
                    systemInstruction,
                    responseMimeType: "application/json",
                    responseSchema,
                },
            }),
            CONFIG.TIMEOUTS.EXTENDED,
            "Profile generation"
        );

        const json = parseJSON<ParsedProfileData>(response.text, {});

        if (!json.bio || !json.skills || !json.projects) {
            throw new GeminiServiceError("Incomplete profile data received from AI");
        }

        const safeProjects = Array.isArray(json.projects)
            ? json.projects
                .filter(p => p.title && p.description)
                .map((p) => ({
                    title: p.title || "Untitled Project",
                    description: p.description || "Project description not available.",
                    technologies: Array.isArray(p.technologies) ? p.technologies : [],
                    link: p.link || "#"
                }))
            : [];

        const safeSkills = Array.isArray(json.skills)
            ? json.skills.filter(s => s && s.trim().length > 0)
            : [];

        if (safeProjects.length === 0) {
            throw new GeminiServiceError("No valid projects generated");
        }

        // Attach the provided URLs to the final object manually
        return {
            id: generateUUID(),
            name: name.trim(),
            title: role.trim(),
            bio: json.bio.trim(),
            skills: safeSkills,
            projects: safeProjects,
            generatedAt: new Date().toISOString(),
            linkedinUrl: linkedinUrl || undefined,
            githubUrl: githubUrl || undefined
        } as UserProfile;
    }, "generateFullProfile");
};

/**
 * RAG-powered chatbot using OpenRouter
 * Maintains conversation context and grounds responses in profile data
 */
export { chatWithAgent } from "@/services/openrouterService";

/**
 * Parses LinkedIn profile text content into structured data
 * Uses Gemini Flash with schema validation for reliable extraction
 */
export const parseLinkedInProfile = async (
    url: string,
    text?: string
): Promise<import("@/app/lib/types").LinkedInProfile> => {
    if (text && !text.trim()) {
        throw new GeminiServiceError("LinkedIn text content is required");
    }

    if (!CONFIG.API_KEY) {
        throw new APIKeyError();
    }

    const systemInstruction = `
    You are a professional data extraction assistant specializing in parsing LinkedIn profile content.
    
    Extract structured information from copy-pasted LinkedIn profile text.
    Be precise and only extract information that is explicitly present.
    If a field is not found, use null or empty array as appropriate.
  `;

    const prompt = `
    Parse the following LinkedIn profile information and extract structured data.
    
    LinkedIn URL: ${url}
    
    ${text ? `Profile Text:
    """${text.substring(0, 15000)}"""` : "No profile text provided - extract information from the URL context only."}
    
    Extract:
    1. Basic Info: name, headline, current role/company, location
    2. Education: institution, degree, field of study, years (if available)
    3. Skills: list of professional skills mentioned
    4. Recent Posts: any post content snippets with dates (if present)
    
    Be accurate and only include information explicitly stated in the available text.
  `;

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            name: {
                type: Type.STRING,
                description: "Full name of the person",
                nullable: true
            },
            headline: {
                type: Type.STRING,
                description: "Professional headline or tagline",
                nullable: true
            },
            currentRole: {
                type: Type.STRING,
                description: "Current job title",
                nullable: true
            },
            currentCompany: {
                type: Type.STRING,
                description: "Current employer/company",
                nullable: true
            },
            location: {
                type: Type.STRING,
                description: "Geographic location",
                nullable: true
            },
            education: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        institution: {
                            type: Type.STRING,
                            description: "School or university name"
                        },
                        degree: {
                            type: Type.STRING,
                            description: "Degree earned",
                            nullable: true
                        },
                        fieldOfStudy: {
                            type: Type.STRING,
                            description: "Major or field of study",
                            nullable: true
                        },
                        startYear: {
                            type: Type.INTEGER,
                            description: "Start year",
                            nullable: true
                        },
                        endYear: {
                            type: Type.INTEGER,
                            description: "End year",
                            nullable: true
                        }
                    },
                    required: ["institution"]
                },
                description: "List of education entries"
            },
            skills: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "List of professional skills"
            },
            posts: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        title: {
                            type: Type.STRING,
                            description: "Post title if available",
                            nullable: true
                        },
                        contentSnippet: {
                            type: Type.STRING,
                            description: "Brief snippet of post content"
                        },
                        url: {
                            type: Type.STRING,
                            description: "Post URL if available",
                            nullable: true
                        },
                        createdAt: {
                            type: Type.STRING,
                            description: "Post date in ISO format if available",
                            nullable: true
                        }
                    },
                    required: ["contentSnippet"]
                },
                description: "List of recent posts"
            }
        },
        required: ["name", "headline", "currentRole", "currentCompany", "location", "education", "skills", "posts"]
    };

    return withRetry(async () => {
        const response = await withTimeout(
            getAI().models.generateContent({
                model: CONFIG.MODELS.FLASH,
                contents: prompt,
                config: {
                    systemInstruction,
                    responseMimeType: "application/json",
                    responseSchema,
                },
            }),
            CONFIG.TIMEOUTS.EXTENDED,
            "LinkedIn profile parsing"
        );

        const json = parseJSON<{
            name?: string | null;
            headline?: string | null;
            currentRole?: string | null;
            currentCompany?: string | null;
            location?: string | null;
            education?: Array<{
                institution: string;
                degree?: string | null;
                fieldOfStudy?: string | null;
                startYear?: number | null;
                endYear?: number | null;
            }>;
            skills?: string[];
            posts?: Array<{
                title?: string | null;
                contentSnippet: string;
                url?: string | null;
                createdAt?: string | null;
            }>;
        }>(response.text, {});

        return {
            url,
            name: json.name || null,
            headline: json.headline || null,
            currentRole: json.currentRole || null,
            currentCompany: json.currentCompany || null,
            location: json.location || null,
            education: Array.isArray(json.education) ? json.education : [],
            skills: Array.isArray(json.skills) ? json.skills : [],
            posts: Array.isArray(json.posts) ? json.posts : [],
            rawSource: {
                text: text ? text.substring(0, 10000) : "" // Store first 10k chars for reference
            }
        };
    }, "parseLinkedInProfile");
};