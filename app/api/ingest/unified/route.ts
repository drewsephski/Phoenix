import { NextRequest, NextResponse } from "next/server";
import { GithubProfile, LinkedInProfile, UnifiedDeveloperProfile } from "@/app/lib/types";

/**
 * Merges GitHub and LinkedIn profiles into a unified developer profile
 * POST /api/ingest/unified
 * 
 * Body can be:
 * 1. { githubData: GithubProfile, linkedinData: LinkedInProfile }
 * 2. { githubUrl: string, linkedinUrl: string, linkedinText: string } - will fetch internally
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        let githubData: GithubProfile | undefined;
        let linkedinData: LinkedInProfile | undefined;

        // Check if we received pre-fetched data or need to fetch
        if (body.githubData && body.linkedinData) {
            githubData = body.githubData;
            linkedinData = body.linkedinData;
        } else if (body.githubUrl || body.linkedinUrl) {
            // Fetch GitHub data if URL provided
            if (body.githubUrl) {
                const githubRes = await fetch(`${req.nextUrl.origin}/api/ingest/github`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ url: body.githubUrl }),
                });

                if (githubRes.ok) {
                    githubData = await githubRes.json();
                } else {
                    console.error("Failed to fetch GitHub data:", await githubRes.text());
                }
            }

            // Fetch LinkedIn data if URL provided
            if (body.linkedinUrl) {
                const linkedinRes = await fetch(`${req.nextUrl.origin}/api/ingest/linkedin`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ url: body.linkedinUrl, text: '' }),
                });

                if (linkedinRes.ok) {
                    linkedinData = await linkedinRes.json();
                } else {
                    console.error("Failed to fetch LinkedIn data:", await linkedinRes.text());
                }
            }
        } else {
            return NextResponse.json(
                {
                    error: "Either provide (githubData + linkedinData) or (githubUrl and/or linkedinUrl)"
                },
                { status: 400 }
            );
        }

        // Merge the profiles
        const unifiedProfile = mergeProfiles(githubData, linkedinData);

        return NextResponse.json(unifiedProfile);

    } catch (error) {
        console.error("Error creating unified profile:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

/**
 * Merges GitHub and LinkedIn data into a unified profile
 */
function mergeProfiles(
    github?: GithubProfile,
    linkedin?: LinkedInProfile
): UnifiedDeveloperProfile {
    const now = new Date().toISOString();

    // Determine primary fields with priority logic
    // LinkedIn typically has more current job info
    // GitHub has verified technical skills
    const primaryName = linkedin?.name || github?.name || null;
    const primaryLocation = linkedin?.location || github?.location || null;
    const primaryTitle = linkedin?.currentRole || linkedin?.headline || null;
    const primaryCompany = linkedin?.currentCompany || null;

    // Normalize skills from both sources
    const normalizedSkills = normalizeSkills(github, linkedin);

    return {
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
        github,
        linkedin,
        primaryName,
        primaryLocation,
        primaryTitle,
        primaryCompany,
        normalizedSkills,
    };
}

/**
 * Combines and deduplicates skills from GitHub and LinkedIn
 */
function normalizeSkills(
    github?: GithubProfile,
    linkedin?: LinkedInProfile
): string[] {
    const skillsSet = new Set<string>();

    // Add LinkedIn skills (claimed skills)
    if (linkedin?.skills) {
        linkedin.skills.forEach(skill => {
            skillsSet.add(skill.trim().toLowerCase());
        });
    }

    // Add GitHub languages (verified by code)
    if (github?.languages) {
        Object.keys(github.languages).forEach(lang => {
            skillsSet.add(lang.trim().toLowerCase());
        });
    }

    // Add topics from top GitHub repos
    if (github?.topReposByStars) {
        github.topReposByStars.forEach(repo => {
            repo.topics.forEach(topic => {
                skillsSet.add(topic.trim().toLowerCase());
            });
        });
    }

    // Convert back to array and capitalize properly
    return Array.from(skillsSet)
        .map(skill => {
            // Capitalize first letter of each word
            return skill
                .split(/[\s-]/)
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
        })
        .sort();
}
