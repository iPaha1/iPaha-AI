import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import OpenAIA from "openai";
import { increaseApiLimit, checkApiLimit } from "@/lib/api_limit";
import { checkSubscription } from "@/lib/subscription";

const openai = new OpenAIA ({
    apiKey: process.env.OPENAI_API_KEY,
});


export async function POST(
    req: Request
    
) {
    try {
        const { userId } = auth();
        const body = await req.json();
        const { prompt, amount = 1, resolution = "512x512" } = body;

        if (!userId) {
            return new NextResponse("unauthorized", { status: 401 });
        }

        if (!openai.apiKey) {
            return new NextResponse("OpenAI API KEY not configured", { status: 500 });
        }

        if (!prompt) {
            return new NextResponse("Prompt is required", { status: 400 });
        }

        if (!amount) {
            return new NextResponse("Amount is required", { status: 400 });
        }

        if (!resolution) {
            return new NextResponse("Resolution is required", { status: 400 });
        }

        const freeTrail = await checkApiLimit();
        const isPro = await checkSubscription();

        if (!freeTrail && !isPro) {
            return new NextResponse("Free trail has expired.", {status: 403 });
        }

        const response = await openai.images.generate({
            prompt,
            n: parseInt(amount, 10),
            size: resolution,
        });

        if (!isPro) {
            await increaseApiLimit();
        }

        console.log(response); // Add this line to inspect the response

        // return NextResponse.json(response.data.data);

        return new Response(JSON.stringify(response.data), {
            headers: { 'Content-Type': 'application/json' }
          });

    } catch (error){ 
    console.log("[IMAGE_ERROR]", error);
    return new NextResponse("Internal error", { status: 500});
    }
}