import swaggerJsdoc from "swagger-jsdoc";

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
