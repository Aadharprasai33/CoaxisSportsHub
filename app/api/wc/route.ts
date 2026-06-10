import { NextResponse } from "next/server";
import { getWcData } from "@/lib/wc";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getWcData();
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
