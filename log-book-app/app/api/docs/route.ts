import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Assignment Log Book API",
    version: "1.0.0",
    description:
      "REST API for managing assignments (list, create, view, update, delete).",
  },
  servers: [{ url: "http://localhost:3000" }],
  tags: [{ name: "Assignments" }],
  paths: {
    "/api/assignments": {
      get: {
        tags: ["Assignments"],
        summary: "List assignments",
        responses: {
          "200": {
            description: "List of assignments",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AssignmentsList" },
              },
            },
          },
        },
      },
      post: {
        tags: ["Assignments"],
        summary: "Create assignment",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AssignmentCreate" },
            },
          },
        },
        responses: {
          "201": {
            description: "Created assignment",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Assignment" },
              },
            },
          },
          "400": {
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/assignments/{id}": {
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      get: {
        tags: ["Assignments"],
        summary: "Get assignment by id",
        responses: {
          "200": {
            description: "Assignment detail",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Assignment" },
              },
            },
          },
          "404": {
            description: "Not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      put: {
        tags: ["Assignments"],
        summary: "Update assignment",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AssignmentUpdate" },
            },
          },
        },
        responses: {
          "200": {
            description: "Updated assignment",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Assignment" },
              },
            },
          },
          "400": {
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "404": {
            description: "Not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Assignments"],
        summary: "Delete assignment",
        responses: {
          "200": {
            description: "Deleted assignment",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DeleteResponse" },
              },
            },
          },
          "404": {
            description: "Not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      AssignmentStatus: {
        type: "string",
        enum: ["Create", "On Process", "Submitted"],
      },
      Assignment: {
        type: "object",
        required: ["id", "title", "status", "assignmentDate"],
        properties: {
          id: { type: "string" },
          title: { type: "string", example: "Math homework" },
          description: { type: "string", nullable: true },
          dueDate: { type: "string", format: "date-time", nullable: true },
          status: { $ref: "#/components/schemas/AssignmentStatus" },
          assignmentDate: { type: "string", format: "date-time" },
        },
      },
      AssignmentCreate: {
        type: "object",
        required: ["title"],
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          dueDate: { type: "string", format: "date-time" },
          status: { $ref: "#/components/schemas/AssignmentStatus" },
        },
      },
      AssignmentUpdate: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          dueDate: { type: "string", format: "date-time" },
          status: { $ref: "#/components/schemas/AssignmentStatus" },
        },
      },
      AssignmentsList: {
        type: "object",
        properties: {
          items: {
            type: "array",
            items: { $ref: "#/components/schemas/Assignment" },
          },
          count: { type: "integer", example: 1 },
        },
      },
      DeleteResponse: {
        type: "object",
        properties: {
          message: { type: "string" },
          item: { $ref: "#/components/schemas/Assignment" },
        },
      },
      ErrorResponse: {
        type: "object",
        properties: {
          error: {
            type: "object",
            properties: {
              message: { type: "string" },
              details: {
                type: "array",
                items: { type: "string" },
              },
            },
          },
        },
      },
    },
  },
};

export async function GET() {
  return NextResponse.json(openApiSpec);
}
