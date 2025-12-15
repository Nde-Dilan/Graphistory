import { NextResponse } from "next/server";
import { generateImageDescription } from "@/ai/flows/image-description-generator";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const imageHint: string = body?.imageHint || "";
    const output = await generateImageDescription({ imageId: imageHint });
    return NextResponse.json(output);
  } catch (error) {
    console.error("Failed to generate image description (API):", error);
    return NextResponse.json(
      { description: `A captivating image showing ${""}.` },
      { status: 500 }
    );
  }
}
