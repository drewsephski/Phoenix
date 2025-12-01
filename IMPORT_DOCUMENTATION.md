# Import Functionality Documentation

## Overview

The Alani application now includes explicit **Import from LinkedIn** and **Import from GitHub** sections that allow users to automatically populate their profile data from these platforms.

## Features

### 🔵 Import from LinkedIn

**Requirements:**

- LinkedIn profile URL
- LinkedIn profile text (copy-pasted from profile page)

**What it does:**

1. Sends the URL and text to `/api/ingest/linkedin`
2. Uses Gemini AI to parse and extract structured data:
   - Name
   - Headline
   - Current role and company
   - Location
   - Education history
   - Skills
   - Recent posts
3. Auto-fills the main form with extracted data
4. Appends formatted LinkedIn info to the "About You" section

**API Endpoint:** `POST /api/ingest/linkedin`

**Request Body:**

```json
{
  "url": "https://linkedin.com/in/username",
  "text": "Pasted LinkedIn profile content..."
}
```

**Response:** `LinkedInProfile` object (see types below)

---

### 🟣 Import from GitHub

**Requirements:**

- GitHub profile URL (e.g., `https://github.com/username` or just `username`)

**What it does:**

1. Sends the URL to `/api/ingest/github`
2. Fetches data directly from GitHub API:
   - User profile information
   - Repository statistics
   - Star counts
   - Language breakdown
   - Top repositories by stars and recent activity
3. Auto-fills the main form with extracted data
4. Appends formatted GitHub stats to the "About You" section

**API Endpoint:** `POST /api/ingest/github`

**Request Body:**

```json
{
  "url": "https://github.com/username"
}
```

**Response:** `GithubProfile` object (see types below)

---

## Type Definitions

### LinkedInProfile

```typescript
export type LinkedInProfile = {
  url: string;
  name: string | null;
  headline: string | null;
  currentRole: string | null;
  currentCompany: string | null;
  location: string | null;
  education: EducationEntry[];
  skills: string[];
  posts: {
    title?: string | null;
    contentSnippet: string;
    url?: string | null;
    createdAt?: string | null;
  }[];
  rawSource?: {
    text?: string;
  };
};

export type EducationEntry = {
  institution: string;
  degree?: string | null;
  fieldOfStudy?: string | null;
  startYear?: number | null;
  endYear?: number | null;
};
```

### GithubProfile

```typescript
export type GithubProfile = {
  url: string;
  username: string;
  name: string | null;
  bio: string | null;
  location: string | null;
  blog: string | null;
  avatarUrl: string | null;
  followers: number;
  following: number;
  publicReposCount: number;
  totalStars: number;
  languages: Record<string, { bytes: number; percent: number }>;
  lastActivityAt: string | null;
  pinnedRepos: GithubRepoSummary[];
  topReposByStars: GithubRepoSummary[];
  topReposByRecentActivity: GithubRepoSummary[];
  profileReadme?: {
    repoFullName: string;
    markdown: string;
  };
};

export type GithubRepoSummary = {
  name: string;
  fullName: string;
  htmlUrl: string;
  description: string | null;
  stargazersCount: number;
  forksCount: number;
  language: string | null;
  topics: string[];
  isFork: boolean;
  lastPushAt: string;
};
```

---

## UI Components

### Import Sections Layout

The import sections are displayed in a **2-column grid** (stacks on mobile) above the main form:

```
┌─────────────────────────┬─────────────────────────┐
│  Import from LinkedIn   │   Import from GitHub    │
│  🔵                     │   🟣                    │
│  - URL input            │   - URL input           │
│  - Text area            │   - Auto-fetch info     │
│  - Import button        │   - Import button       │
└─────────────────────────┴─────────────────────────┘
```

### Status Messages

- **Success:** Green banner with success message
- **Error:** Red banner with error details
- Both auto-clear when starting a new import

### Loading States

- Buttons show "Importing..." text
- Input fields are disabled during import
- Prevents duplicate submissions

---

## User Flow

1. **User arrives at the "Create Your Aura" page**
2. **Sees two import options:**
   - LinkedIn (requires manual text paste)
   - GitHub (automatic via API)
3. **User chooses an import method:**
   - **LinkedIn:** Pastes URL + profile text → clicks "Import LinkedIn Data"
   - **GitHub:** Pastes URL → clicks "Import GitHub Data"
4. **System processes the import:**
   - Shows loading state
   - Calls appropriate API endpoint
   - Parses response
5. **On success:**
   - Auto-fills name, role, and URLs
   - Appends structured data to "About You" field
   - Shows success message
   - Clears import inputs
6. **User can:**
   - Import from the other platform (data merges)
   - Edit any auto-filled data
   - Submit the form to generate their site

---

## API Integration

### LinkedIn Import Service

**File:** `/services/geminiService.ts`

**Function:** `parseLinkedInProfile(url: string, text: string)`

- Uses Gemini Flash model
- Structured output with schema validation
- Extracts: name, headline, role, company, location, education, skills, posts
- Returns: `LinkedInProfile` object

### GitHub Import Service

**File:** `/app/api/ingest/github/route.ts`

**Process:**

1. Extracts username from URL
2. Fetches user data from `https://api.github.com/users/{username}`
3. Fetches repositories from `https://api.github.com/users/{username}/repos`
4. Calculates:
   - Total stars across all repos
   - Language breakdown (by repo size)
   - Top repos by stars
   - Top repos by recent activity
5. Returns: `GithubProfile` object

---

## Error Handling

### LinkedIn Import Errors

- Missing URL or text → "Please provide both LinkedIn URL and profile text"
- API failure → Shows error message from API response
- Parsing failure → "Failed to import LinkedIn profile"

### GitHub Import Errors

- Missing URL → "Please provide a GitHub URL"
- User not found → "GitHub user not found" (404)
- API failure → Shows error message from API response
- Network error → "Failed to import GitHub profile"

---

## Configuration

### Environment Variables

**Required:**

- `API_KEY` - Google Gemini API key (for LinkedIn parsing)

**Optional:**

- GitHub API works without authentication but has lower rate limits
- For higher limits, add GitHub token to API requests (future enhancement)

---

## Future Enhancements

1. **GitHub Authentication**
   - Add GitHub token support for higher API rate limits
   - Fetch private repo data (with user permission)

2. **LinkedIn Scraping Alternative**
   - Explore LinkedIn API integration (requires OAuth)
   - Browser extension for easier text extraction

3. **Unified Import**
   - Single endpoint that accepts both LinkedIn and GitHub data
   - Merge profiles automatically
   - See `/api/ingest/unified` for existing merge logic

4. **Import History**
   - Save imported profiles
   - Allow re-import/refresh
   - Track data freshness

5. **Additional Platforms**
   - Twitter/X profile import
   - Portfolio sites (Dribbble, Behance)
   - Resume file upload (PDF parsing)

---

## Testing

### Test LinkedIn Import

1. Go to your LinkedIn profile
2. Copy all visible text (Cmd/Ctrl + A, then Cmd/Ctrl + C)
3. Paste into the LinkedIn import section
4. Add your LinkedIn URL
5. Click "Import LinkedIn Data"

### Test GitHub Import

1. Enter your GitHub username or full URL
2. Click "Import GitHub Data"
3. Wait for API response
4. Verify data appears in form

---

## Troubleshooting

**LinkedIn import not working:**

- Ensure you've copied ALL text from your profile page
- Check that API_KEY is set in environment variables
- Verify Gemini API quota hasn't been exceeded

**GitHub import not working:**

- Check username is correct
- Verify GitHub profile is public
- Check GitHub API rate limits (60 requests/hour without auth)

**Data not appearing in form:**

- Check browser console for errors
- Verify API responses in Network tab
- Ensure types match expected structure

---

## Code References

- **UI Component:** `/components/InputSection.tsx`
- **Types:** `/app/lib/types.ts`
- **LinkedIn API:** `/app/api/ingest/linkedin/route.ts`
- **GitHub API:** `/app/api/ingest/github/route.ts`
- **Unified API:** `/app/api/ingest/unified/route.ts`
- **Gemini Service:** `/services/geminiService.ts`
