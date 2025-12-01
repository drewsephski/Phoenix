import { OpenRouter } from "@openrouter/sdk";
import { UserProfile } from "../types";

// Initialize OpenRouter client
const client = new OpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY ?? "",
});

/**
 * RAG-powered chatbot using OpenRouter
 * Maintains conversation context and grounds responses in profile data
 */
export const chatWithAgent = async (
    history: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }>,
    userProfile: UserProfile,
    message: string
): Promise<string> => {
    if (!message.trim()) {
        return "I'd be happy to help! What would you like to know?";
    }

    if (!process.env.OPENROUTER_API_KEY) {
        return "I apologize, but the chat service is currently unavailable.";
    }

    try {
        // Construct full conversation history
        const messages = [
            ...history.map(h => ({
                role: h.role === "model" ? "assistant" : h.role,
                content: h.parts.map(p => p.text).join("\n")
            })),
            {
                role: "user" as const,
                content: message
            }
        ];

        const systemInstruction = `
You are an AI assistant representing ${userProfile.name}.
        
Your knowledge base is STRICTLY LIMITED to:

Profile:
- Name: ${userProfile.name}
- Role: ${userProfile.title}
- Bio: ${userProfile.bio}
- LinkedIn: ${userProfile.linkedinUrl || "N/A"}
- GitHub: ${userProfile.githubUrl || "N/A"}

Skills:
${userProfile.skills.map(s => `- ${s}`).join("\n")}

Projects:
${userProfile.projects.map(p => `
• ${p.title}
  Description: ${p.description}
  Technologies: ${p.technologies.join(", ")}
`).join("\n")}

Instructions:
- Answer as if you are ${userProfile.name}'s representative
- Be professional, helpful, and conversational
- Only reference information from the profile above
- If asked about something not in the profile, politely say you don't have that information
- Suggest the visitor contact ${userProfile.name} directly for detailed discussions
- Keep responses concise (2-4 sentences typically)
- Be personable but maintain professional boundaries
        `;

        const response = await client.chat.send({
            model: "kwaipilot/kat-coder-pro:free",
            messages: [
                { role: "system", content: systemInstruction },
                ...messages
            ],
            temperature: 0.7,
            maxTokens: 500
        });

        const reply = response.choices[0].message.content?.trim();

        if (!reply) {
            throw new Error("Empty response from chat model");
        }

        return reply;

    } catch (error) {
        console.error("Chat failed:", error);

        if (error instanceof Error && error.message.includes("API key")) {
            return "I apologize, but the chat service is temporarily unavailable due to a configuration issue.";
        }

        return "I apologize, but I encountered an error processing your message. Could you please try rephrasing your question?";
    }
};