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
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
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
        Post: {
          type: "object",
          required: ["title", "description", "sender"],
          properties: {
            _id: {
              type: "string",
              description: "Post ID",
              example: "697cc87180aa7bb6865a259d",
            },
            title: {
              type: "string",
              description: "The post title",
              example: "My First Post",
            },
            description: {
              type: "string",
              description: "The post description",
              example: "This is the description of my new post.",
            },
            sender: {
              type: "string",
              description: "ID of the user who created the post",
              example: "697a78c9437f1b91bae9a42d",
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
              example: "697cc87180aa7bb6865a259d",
            },
            postId: {
              type: "string",
              description: "ID of the post the comment belongs to",
              example: "697cc87180aa7bb6865a259d",
            },
          },
        },
        AuthResponse: {
          type: "object",
          properties: {
            accessToken: {
              type: "string",
              description: "JWT access token",
            },
          },
        },
        Error: {
          type: "string",
        },
      },
    },
  },
  apis: ["./src/routes/*.ts"],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
