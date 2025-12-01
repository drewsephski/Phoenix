import { NextRequest, NextResponse } from "next/server";
import { GithubProfile, GithubRepoSummary } from "@/app/lib/types";

export async function POST(req: NextRequest) {
    try {
        const { url } = await req.json();

        if (!url) {
            return NextResponse.json(
                { error: "GitHub URL is required" },
                { status: 400 }
            );
        }

        // Extract username from URL
        // Supports formats: https://github.com/username, github.com/username, username
        let username = url;
        if (url.includes("github.com/")) {
            const parts = url.split("github.com/");
            username = parts[1].split("/")[0];
        }
        // Trim any trailing slashes or whitespace
        username = username.trim().replace(/\/$/, '');

        if (!username) {
            return NextResponse.json(
                { error: "Invalid GitHub URL or username" },
                { status: 400 }
            );
        }

        // Fetch User Data
        const userRes = await fetch(`https://api.github.com/users/${username}`);

        if (!userRes.ok) {
            if (userRes.status === 404) {
                return NextResponse.json({ error: "GitHub user not found" }, { status: 404 });
            }
            return NextResponse.json({ error: "Failed to fetch GitHub user data" }, { status: userRes.status });
        }

        const userData = await userRes.json();

        // Fetch Repos (up to 100 for now to calculate stats)
        // Sort by stars to get most popular repos first
        const reposRes = await fetch(
            `https://api.github.com/users/${username}/repos?per_page=100&sort=stars&type=owner`
        );


        // Define types for GitHub API responses
        interface GitHubRepo {
            name: string;
            full_name: string;
            html_url: string;
            description: string | null;
            stargazers_count: number;
            forks_count: number;
            language: string | null;
            topics: string[];
            fork: boolean;
            pushed_at: string;
            size: number;
        }

        let reposData: GitHubRepo[] = [];
        if (reposRes.ok) {
            reposData = await reposRes.json();
        } else {
            return NextResponse.json(
                { error: "Failed to fetch GitHub repositories" },
                { status: reposRes.status }
            );
        }

        // Calculate Derived Fields
        const totalStars = reposData.reduce((acc: number, repo: GitHubRepo) => acc + (repo.stargazers_count || 0), 0);

        // Language Breakdown (using primary language for simplicity/speed)
        const languageCounts: Record<string, number> = {};
        let totalBytes = 0; // We are using count as proxy for bytes/importance in this simple version
        // or we can just count occurrences. The type says { bytes: number, percent: number }
        // Let's just count occurrences as "bytes" for now to fit the shape, 
        // or better, let's treat 1 repo = 1 unit of "bytes" for simplicity 
        // unless we want to fetch /languages for every repo (too many requests).
        // A better proxy might be size (kb) * 1024.

        reposData.forEach((repo: GitHubRepo) => {
            if (repo.language) {
                const size = repo.size || 1; // size is in KB
                languageCounts[repo.language] = (languageCounts[repo.language] || 0) + size;
                totalBytes += size;
            }
        });

        const languages: Record<string, { bytes: number; percent: number }> = {};
        Object.entries(languageCounts).forEach(([lang, count]) => {
            languages[lang] = {
                bytes: count,
                percent: totalBytes > 0 ? (count / totalBytes) * 100 : 0
            };
        });

        // Map to GithubRepoSummary
        const allRepos: GithubRepoSummary[] = reposData.map((repo: GitHubRepo) => ({
            name: repo.name,
            fullName: repo.full_name,
            htmlUrl: repo.html_url,
            description: repo.description,
            stargazersCount: repo.stargazers_count,
            forksCount: repo.forks_count,
            language: repo.language,
            topics: repo.topics || [],
            isFork: repo.fork,
            lastPushAt: repo.pushed_at
        }));

        // Top Repos by Stars
        const topReposByStars = [...allRepos]
            .sort((a, b) => b.stargazersCount - a.stargazersCount)
            .slice(0, 6);

        // Top Repos by Recent Activity
        const topReposByRecentActivity = [...allRepos]
            .sort((a, b) => new Date(b.lastPushAt).getTime() - new Date(a.lastPushAt).getTime())
            .slice(0, 6);

        // Pinned repos - usually requires a separate scrape or GraphQL. 
        // For now, we'll use top stars as a fallback for pinned.
        const pinnedRepos = topReposByStars;

        const profile: GithubProfile = {
            url: userData.html_url,
            username: userData.login,
            name: userData.name,
            bio: userData.bio,
            location: userData.location,
            blog: userData.blog,
            avatarUrl: userData.avatar_url,
            followers: userData.followers,
            following: userData.following,
            publicReposCount: userData.public_repos,
            totalStars,
            languages,
            lastActivityAt: topReposByRecentActivity[0]?.lastPushAt || null,
            pinnedRepos,
            topReposByStars,
            topReposByRecentActivity,
            // profileReadme: undefined // Omitted for now as it requires another fetch
        };

        return NextResponse.json(profile);

    } catch (error) {
        console.error("Error ingesting GitHub profile:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
