import { SchemaType } from "@google/generative-ai";

export const aiTools = [
  {
    name: "read_file",
    description: "Read the content of a file at the given path.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        path: {
          type: SchemaType.STRING,
          description: "The path of the file to read.",
        },
      },
      required: ["path"],
    },
  },
  {
    name: "write_file",
    description: "Write content to a file at the given path.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        path: {
          type: SchemaType.STRING,
          description: "The path of the file to write.",
        },
        content: {
          type: SchemaType.STRING,
          description: "The content to write to the file.",
        },
      },
      required: ["path", "content"],
    },
  },
  {
    name: "create_file",
    description: "Create a new file at the given path.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        path: {
          type: SchemaType.STRING,
          description: "The path where the file should be created.",
        },
        name: {
            type: SchemaType.STRING,
            description: "The name of the file."
        }
      },
      required: ["path", "name"],
    },
  },
  {
    name: "create_directory",
    description: "Create a new directory at the given path.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        path: {
          type: SchemaType.STRING,
          description: "The path where the directory should be created.",
        },
        name: {
            type: SchemaType.STRING,
            description: "The name of the directory."
        }
      },
      required: ["path", "name"],
    },
  },
  {
    name: "delete_item",
    description: "Delete a file or directory at the given path.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        path: {
          type: SchemaType.STRING,
          description: "The path of the item to delete.",
        },
      },
      required: ["path"],
    },
  },
  {
    name: "list_files",
    description: "List all files in the project structure.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {},
    },
  },
];
