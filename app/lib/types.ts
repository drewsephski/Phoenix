// lib/types.ts
export type EducationEntry = {
    institution: string;
    degree?: string | null;
    fieldOfStudy?: string | null;
    startYear?: number | null;
    endYear?: number | null;
};

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
    lastPushAt: string; // ISO
};

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
    languages: Record<
        string,
        { bytes: number; percent: number }
    >;
    lastActivityAt: string | null;
    pinnedRepos: GithubRepoSummary[];
    topReposByStars: GithubRepoSummary[];
    topReposByRecentActivity: GithubRepoSummary[];
    profileReadme?: {
        repoFullName: string;
        markdown: string;
    };
};

export type UnifiedDeveloperProfile = {
    id: string;
    createdAt: string;
    updatedAt: string;
    linkedin?: LinkedInProfile;
    github?: GithubProfile;
    primaryName: string | null;
    primaryLocation: string | null;
    primaryTitle: string | null;
    primaryCompany: string | null;
    normalizedSkills: string[];
};
