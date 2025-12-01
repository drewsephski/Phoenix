import { NextRequest, NextResponse } from "next/server";
import { parseLinkedInProfile } from "@/services/geminiService";

export async function POST(req: NextRequest) {
    try {
        const { url, text } = await req.json();

        if (!url) {
            return NextResponse.json(
                { error: "LinkedIn URL is required" },
                { status: 400 }
            );
        }

        // Use AI service to parse the LinkedIn text
        const profile = await parseLinkedInProfile(url, text);

        return NextResponse.json(profile);

    } catch (error) {
        console.error("Error ingesting LinkedIn profile:", error);

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
