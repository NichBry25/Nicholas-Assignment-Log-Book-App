import { NextResponse } from "next/server";

import {
  deleteAssignment,
  findAssignment,
  updateAssignment,
  validateUpdateInput,
} from "@/lib/assignments";

export const dynamic = "force-dynamic";

const jsonResponse = (data: unknown, status = 200) =>
  NextResponse.json(data, { status });

export async function GET(
  _request: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const assignment = await findAssignment(resolvedParams.id);
  if (!assignment) {
    return jsonResponse(
      { error: { message: "Assignment not found." } },
      404
    );
  }

  return jsonResponse(assignment);
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return jsonResponse(
      { error: { message: "Invalid JSON body." } },
      400
    );
  }

  const { errors, data, hasUpdates } = validateUpdateInput(payload);
  if (errors.length > 0 || !data) {
    return jsonResponse(
      { error: { message: "Validation failed.", details: errors } },
      400
    );
  }

  if (!hasUpdates) {
    return jsonResponse(
      { error: { message: "Provide at least one field to update." } },
      400
    );
  }

  const updated = await updateAssignment(resolvedParams.id, data);
  if (!updated) {
    return jsonResponse(
      { error: { message: "Assignment not found." } },
      404
    );
  }

  return jsonResponse(updated);
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const removed = await deleteAssignment(resolvedParams.id);
  if (!removed) {
    return jsonResponse(
      { error: { message: "Assignment not found." } },
      404
    );
  }

  return jsonResponse({ message: "Assignment deleted.", item: removed });
}
