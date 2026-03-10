import { randomUUID } from "crypto";
import fs from "fs/promises";
import path from "path";

export type AssignmentStatus = "pending" | "in_progress" | "completed";

export type Assignment = {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  status: AssignmentStatus;
  createdAt: string;
  updatedAt: string;
};

export type AssignmentCreateInput = {
  title: string;
  description?: string;
  dueDate?: string;
  status?: AssignmentStatus;
};

export type AssignmentUpdateInput = Partial<AssignmentCreateInput>;

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "assignments.json");
const STATUS_VALUES: AssignmentStatus[] = ["pending", "in_progress", "completed"];

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const isOptionalString = (value: unknown): value is string | undefined =>
  value === undefined || typeof value === "string";

const isValidStatus = (value: unknown): value is AssignmentStatus =>
  typeof value === "string" && STATUS_VALUES.includes(value as AssignmentStatus);

const isValidDate = (value: unknown): value is string =>
  typeof value === "string" && Number.isFinite(Date.parse(value));

const nowIso = () => new Date().toISOString();

async function ensureDataFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, "[]\n", "utf8");
  }
}

async function readAssignments(): Promise<Assignment[]> {
  await ensureDataFile();
  const raw = await fs.readFile(DATA_FILE, "utf8");
  try {
    const parsed = JSON.parse(raw) as Assignment[];
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed;
  } catch {
    return [];
  }
}

async function writeAssignments(assignments: Assignment[]) {
  await ensureDataFile();
  await fs.writeFile(DATA_FILE, JSON.stringify(assignments, null, 2) + "\n", "utf8");
}

export async function listAssignments() {
  return readAssignments();
}

export async function createAssignment(input: AssignmentCreateInput) {
  const assignments = await readAssignments();
  const timestamp = nowIso();

  const assignment: Assignment = {
    id: randomUUID(),
    title: input.title.trim(),
    description: input.description?.trim() || undefined,
    dueDate: input.dueDate,
    status: input.status ?? "pending",
    createdAt: timestamp,
    updatedAt: timestamp,
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
  const updated: Assignment = {
    ...current,
    title: input.title ? input.title.trim() : current.title,
    description:
      input.description === undefined
        ? current.description
        : input.description.trim() || undefined,
    dueDate: input.dueDate === undefined ? current.dueDate : input.dueDate,
    status: input.status ?? current.status,
    updatedAt: nowIso(),
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
    errors.push("status must be one of: pending, in_progress, completed.");
  }

  if (errors.length > 0) {
    return { errors, data: null };
  }

  return {
    errors: [],
    data: {
      title: title.trim(),
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
      errors.push("status must be one of: pending, in_progress, completed.");
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
