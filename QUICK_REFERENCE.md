# Quick Reference: Import Feature

## 🎯 What Was Implemented

Added explicit **"Import from LinkedIn"** and **"Import from GitHub"** sections to the profile creation form.

## 📍 Location

**File:** `/components/InputSection.tsx`
**Page:** "Create Your Aura" (Building state in app)

## 🎨 Visual Layout

See `import_sections_ui` artifact for visual reference.

Two side-by-side cards above the main form:

- **Left:** LinkedIn import (blue theme)
- **Right:** GitHub import (purple theme)

## 🔵 LinkedIn Import

**Inputs:**

1. LinkedIn profile URL
2. Profile text (copy-pasted from LinkedIn)

**Process:**

- Calls `POST /api/ingest/linkedin`
- Uses Gemini AI to parse text
- Returns structured `LinkedInProfile`

**Auto-fills:**

- Full Name
- Current Role
- LinkedIn URL
- Appends formatted data to "About You"

## 🟣 GitHub Import

**Inputs:**

1. GitHub profile URL

**Process:**

- Calls `POST /api/ingest/github`
- Fetches from GitHub API directly
- Returns structured `GithubProfile`

**Auto-fills:**

- Full Name (if available)
- GitHub URL
- Appends stats to "About You"

## ✅ Type Safety

Uses proper types from `/app/lib/types.ts`:

- `LinkedInProfile`
- `GithubProfile`
- `EducationEntry`
- `GithubRepoSummary`

## 🔧 API Compatibility

Works with existing endpoints:

- ✅ `/api/ingest/linkedin/route.ts`
- ✅ `/api/ingest/github/route.ts`
- ✅ `/services/geminiService.ts`

## 🚨 Error Handling

**LinkedIn:**

- Missing URL/text → "Please provide both LinkedIn URL and profile text"
- API error → Shows error from response
- Parse error → "Failed to import LinkedIn profile"

**GitHub:**

- Missing URL → "Please provide a GitHub URL"
- User not found → "GitHub user not found"
- API error → Shows error from response

## 💡 User Experience

**Loading States:**

- Buttons show "Importing..."
- Inputs disabled during import
- Prevents duplicate submissions

**Success States:**

- Green success banner
- Form auto-filled
- Import inputs cleared

**Error States:**

- Red error banner
- Helpful error messages
- Can retry immediately

## 🔑 Configuration

**Required:**

- `API_KEY` environment variable (for LinkedIn/Gemini AI)

**Optional:**

- GitHub works without auth (60 req/hour limit)

## 📚 Documentation

- **Full Docs:** `/IMPORT_DOCUMENTATION.md`
- **Summary:** `/IMPLEMENTATION_SUMMARY.md`
- **This File:** `/QUICK_REFERENCE.md`

## 🧪 Testing

**LinkedIn:**

1. Go to your LinkedIn profile
2. Copy all text (Cmd/Ctrl + A)
3. Paste into import section
4. Add LinkedIn URL
5. Click "Import LinkedIn Data"

**GitHub:**

1. Enter GitHub username or URL
2. Click "Import GitHub Data"
3. Wait for auto-fetch

## ✨ Features

- ✅ Explicit import sections
- ✅ Visual distinction (colors/icons)
- ✅ Auto-fill form fields
- ✅ Data merging (can import both)
- ✅ Loading states
- ✅ Error handling
- ✅ Success feedback
- ✅ Type-safe
- ✅ Responsive design
- ✅ Accessible

## 🎉 Success

All requirements met:

- ✅ Explicit import sections added
- ✅ Correct types used
- ✅ Compatible with existing APIs
- ✅ Working properly
