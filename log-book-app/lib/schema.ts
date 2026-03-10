export const AssignmentStatusValues = [
  "Create",
  "On Process",
  "Submitted",
] as const;

export type AssignmentStatus = (typeof AssignmentStatusValues)[number];

export type AssignmentRecord = {
  id: string;
  title: string;
  description?: string;
  status: AssignmentStatus;
  assignmentDate: string;
  dueDate?: string;
};

export type AssignmentCreateInput = {
  title: string;
  description?: string;
  dueDate?: string;
  status?: AssignmentStatus;
};

export type AssignmentUpdateInput = Partial<AssignmentCreateInput>;
