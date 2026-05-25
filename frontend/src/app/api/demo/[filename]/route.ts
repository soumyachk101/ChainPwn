import { NextRequest, NextResponse } from "next/server";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  const filename = params.filename;

  // Try to find the demo contract relative to the project root
  const possiblePaths = [
    join(process.cwd(), "..", "backend", "demo_contracts", filename),
    join(process.cwd(), "backend", "demo_contracts", filename),
    join(process.cwd(), "demo_contracts", filename),
  ];

  for (const path of possiblePaths) {
    if (existsSync(path)) {
      const content = readFileSync(path, "utf-8");
      return new NextResponse(content, {
        headers: { "Content-Type": "text/plain" },
      });
    }
  }

  return NextResponse.json(
    { error: `Contract ${filename} not found` },
    { status: 404 }
  );
}
