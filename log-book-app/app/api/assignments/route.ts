import { NextResponse } from "next/server";

import {
  createAssignment,
  listAssignments,
  validateCreateInput,
} from "@/lib/assignments";

export const dynamic = "force-dynamic";

const jsonResponse = (data: unknown, status = 200) =>
  NextResponse.json(data, { status });

export async function GET() {
  const assignments = await listAssignments();
  return jsonResponse({ items: assignments, count: assignments.length });
}

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return jsonResponse(
      { error: { message: "Invalid JSON body." } },
      400
    );
  }

  const { errors, data } = validateCreateInput(payload);
  if (errors.length > 0 || !data) {
    return jsonResponse(
      { error: { message: "Validation failed.", details: errors } },
      400
    );
  }

  const assignment = await createAssignment(data);
  return jsonResponse(assignment, 201);
}
