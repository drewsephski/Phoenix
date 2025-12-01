import { NextRequest, NextResponse } from "next/server";
import { analyzeInputFast } from "@/services/geminiService";

export async function POST(req: NextRequest) {
    try {
        const { text } = await req.json();

        if (!text) {
            return NextResponse.json(
                { error: "Text content is required" },
                { status: 400 }
            );
        }

        const tags = await analyzeInputFast(text);
        return NextResponse.json({ tags });

    } catch (error) {
        console.error("Error analyzing input:", error);

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