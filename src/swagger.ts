import swaggerJsdoc from "swagger-jsdoc";
import dotenv from "dotenv";

dotenv.config({ path: ".env.dev" });

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Second Assignment API",
      version: "1.0.0",
      description:
        "A REST API for managing posts and comments with user authentication",
    },
    servers: [
      {
        url: "http://localhost:" + process.env.PORT,
        description: "Development server",
      },
    ],
    components: {
      schemas: {
        User: {
          type: "object",
          required: ["email", "username", "password"],
          properties: {
            _id: {
              type: "string",
              description: "User ID",
              example: "697cc87180aa7bb6865a259d",
            },
            email: {
              type: "string",
              description: "User email address",
              example: "user@example.com",
            },
            username: {
              type: "string",
              description: "Username",
              example: "exampleUser",
            },
            password: {
              type: "string",
              description: "User password",
              example: "password123",
            },
          },
        },
        Comment: {
          type: "object",
          required: ["message", "sender", "postId"],
          properties: {
            _id: {
              type: "string",
              description: "Comment ID",
              example: "697cc87180aa7bb6865a259d",
            },
            message: {
              type: "string",
              description: "The comment content",
              example: "This is a great post!",
            },
            sender: {
              type: "string",
              description: "ID of the user who made the comment",
            },
            postId: {
              type: "string",
              description: "ID of the post the comment belongs to",
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            message: {
              type: "string",
              description: "Error message",
            },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.ts"],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
