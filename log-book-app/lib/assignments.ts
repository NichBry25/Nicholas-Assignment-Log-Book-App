import { randomUUID } from "crypto";
import fs from "fs/promises";
import path from "path";

import {
  AssignmentCreateInput,
  AssignmentRecord,
  AssignmentStatus,
  AssignmentStatusValues,
  AssignmentUpdateInput,
} from "./schema";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "assignments.json");
const STATUS_VALUES: AssignmentStatus[] = [...AssignmentStatusValues];

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const isOptionalString = (value: unknown): value is string | undefined =>
  value === undefined || typeof value === "string";

const isValidStatus = (value: unknown): value is AssignmentStatus =>
  typeof value === "string" && STATUS_VALUES.includes(value as AssignmentStatus);

const isValidDate = (value: unknown): value is string =>
  typeof value === "string" && Number.isFinite(Date.parse(value));

const nowIso = () => new Date().toISOString();
const legacyStatusMap: Record<string, AssignmentStatus> = {
  pending: "Create",
  in_progress: "On Process",
  completed: "Submitted",
};

async function ensureDataFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, "[]\n", "utf8");
  }
}

function normalizeAssignment(value: unknown): AssignmentRecord | null {
  if (value === null || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  const id = typeof record.id === "string" ? record.id : null;
  const title = typeof record.title === "string" ? record.title : null;

  if (!id || !title) {
    return null;
  }

  const rawStatus = record.status;
  let status: AssignmentStatus = "Create";

  if (isValidStatus(rawStatus)) {
    status = rawStatus;
  } else if (typeof rawStatus === "string" && legacyStatusMap[rawStatus]) {
    status = legacyStatusMap[rawStatus];
  }

  const assignmentDate =
    typeof record.assignmentDate === "string"
      ? record.assignmentDate
      : typeof record.createdAt === "string"
        ? record.createdAt
        : nowIso();

  const description =
    typeof record.description === "string" ? record.description : undefined;
  const dueDate = typeof record.dueDate === "string" ? record.dueDate : undefined;

  return {
    id,
    title,
    description,
    dueDate,
    status,
    assignmentDate,
  };
}

async function readAssignments(): Promise<AssignmentRecord[]> {
  await ensureDataFile();
  const raw = await fs.readFile(DATA_FILE, "utf8");
  try {
    const parsed = JSON.parse(raw) as AssignmentRecord[];
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed
      .map((item) => normalizeAssignment(item))
      .filter((item): item is AssignmentRecord => item !== null);
  } catch {
    return [];
  }
}

async function writeAssignments(assignments: AssignmentRecord[]) {
  await ensureDataFile();
  await fs.writeFile(DATA_FILE, JSON.stringify(assignments, null, 2) + "\n", "utf8");
}

export async function listAssignments() {
  return readAssignments();
}

export async function createAssignment(input: AssignmentCreateInput) {
  const assignments = await readAssignments();
  const timestamp = nowIso();

  const assignment: AssignmentRecord = {
    id: randomUUID(),
    title: input.title.trim(),
    description: input.description?.trim() || undefined,
    dueDate: input.dueDate,
    status: input.status ?? "Create",
    assignmentDate: timestamp,
  };

  assignments.push(assignment);
  await writeAssignments(assignments);

  return assignment;
}

export async function findAssignment(id: string) {
  const assignments = await readAssignments();
  return assignments.find((assignment) => assignment.id === id) ?? null;
}

export async function updateAssignment(id: string, input: AssignmentUpdateInput) {
  const assignments = await readAssignments();
  const index = assignments.findIndex((assignment) => assignment.id === id);

  if (index === -1) {
    return null;
  }

  const current = assignments[index];
  const updated: AssignmentRecord = {
    ...current,
    title: input.title ? input.title.trim() : current.title,
    description:
      input.description === undefined
        ? current.description
        : input.description.trim() || undefined,
    dueDate: input.dueDate === undefined ? current.dueDate : input.dueDate,
    status: input.status ?? current.status,
  };

  assignments[index] = updated;
  await writeAssignments(assignments);

  return updated;
}

export async function deleteAssignment(id: string) {
  const assignments = await readAssignments();
  const index = assignments.findIndex((assignment) => assignment.id === id);

  if (index === -1) {
    return null;
  }

  const [removed] = assignments.splice(index, 1);
  await writeAssignments(assignments);

  return removed;
}

export function validateCreateInput(payload: unknown) {
  const errors: string[] = [];

  if (payload === null || typeof payload !== "object") {
    return { errors: ["Body must be a JSON object."], data: null };
  }

  const data = payload as Record<string, unknown>;
  const title = data.title;

  if (!isNonEmptyString(title)) {
    errors.push("title is required and must be a non-empty string.");
  }

  const description = data.description;
  if (!isOptionalString(description)) {
    errors.push("description must be a string if provided.");
  }

  const dueDate = data.dueDate;
  if (dueDate !== undefined && !isValidDate(dueDate)) {
    errors.push("dueDate must be a valid ISO date string if provided.");
  }

  const status = data.status;
  if (status !== undefined && !isValidStatus(status)) {
    errors.push("status must be one of: Create, On Process, Submitted.");
  }

  if (errors.length > 0) {
    return { errors, data: null };
  }

  return {
    errors: [],
    data: {
      title: (title as string).trim(),
      description: typeof description === "string" ? description : undefined,
      dueDate: typeof dueDate === "string" ? dueDate : undefined,
      status: status as AssignmentStatus | undefined,
    } as AssignmentCreateInput,
  };
}

export function validateUpdateInput(payload: unknown) {
  const errors: string[] = [];

  if (payload === null || typeof payload !== "object") {
    return { errors: ["Body must be a JSON object."], data: null, hasUpdates: false };
  }

  const data = payload as Record<string, unknown>;
  const updates: AssignmentUpdateInput = {};

  if ("title" in data) {
    if (!isNonEmptyString(data.title)) {
      errors.push("title must be a non-empty string when provided.");
    } else {
      updates.title = data.title;
    }
  }

  if ("description" in data) {
    if (!isOptionalString(data.description)) {
      errors.push("description must be a string when provided.");
    } else {
      updates.description = data.description as string | undefined;
    }
  }

  if ("dueDate" in data) {
    if (data.dueDate !== undefined && !isValidDate(data.dueDate)) {
      errors.push("dueDate must be a valid ISO date string when provided.");
    } else {
      updates.dueDate = data.dueDate as string | undefined;
    }
  }

  if ("status" in data) {
    if (data.status !== undefined && !isValidStatus(data.status)) {
      errors.push("status must be one of: Create, On Process, Submitted.");
    } else {
      updates.status = data.status as AssignmentStatus | undefined;
    }
  }

  if (errors.length > 0) {
    return { errors, data: null, hasUpdates: false };
  }

  const hasUpdates = Object.keys(updates).length > 0;

  return { errors: [], data: updates, hasUpdates };
}
