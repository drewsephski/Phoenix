import { NextRequest, NextResponse } from "next/server";
import { generateFullProfile } from "@/services/geminiService";

export async function POST(req: NextRequest) {
    try {
        const { name, role, rawText, linkedinUrl, githubUrl } = await req.json();

        if (!name || !role || !rawText) {
            return NextResponse.json(
                { error: "Name, role, and background text are required" },
                { status: 400 }
            );
        }

        const profile = await generateFullProfile(name, role, rawText, linkedinUrl, githubUrl);
        return NextResponse.json(profile);

    } catch (error) {
        console.error("Error generating profile:", error);

        if (error instanceof Error && error.message.includes("API key")) {
            return NextResponse.json(
                { error: "AI service configuration error" },
                { status: 503 }
            );
        }

        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}