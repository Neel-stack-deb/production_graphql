import test from "node:test";
import assert from "node:assert/strict";
import { graphql } from "graphql";

import { schema } from "../src/graphql/schema.js";

test("GraphQL register mutation returns a user payload", async () => {
  const contextValue = {
    userService: {
      register: async (input) => ({
        success: true,
        message: "User registered successfully",
        data: {
          id: "user-1",
          name: input.name,
          email: input.email.toLowerCase(),
          role: "USER",
          createdAt: new Date("2026-01-01T00:00:00.000Z"),
          updatedAt: new Date("2026-01-01T00:00:00.000Z"),
        },
      }),
    },
  };

  const result = await graphql({
    schema,
    source: `
      mutation Register($input: RegisterInput!) {
        register(input: $input) {
          success
          message
          data {
            id
            name
            email
            role
          }
        }
      }
    `,
    contextValue,
    variableValues: {
      input: {
        name: "Ada Lovelace",
        email: "ADA@EXAMPLE.COM",
        password: "password123",
      },
    },
  });

  assert.equal(result.errors, undefined);
  assert.equal(result.data.register.success, true);
  assert.equal(result.data.register.data.email, "ada@example.com");
});

test("GraphQL me query requires authentication", async () => {
  const contextValue = {
    user: null,
    userService: {
      profile: async () => ({
        success: true,
        message: "User profile loaded",
        data: null,
      }),
    },
  };

  const result = await graphql({
    schema,
    source: `
      query {
        me {
          success
        }
      }
    `,
    contextValue,
  });

  assert.equal(result.data, null);
  assert.equal(result.errors.length, 1);
  assert.equal(result.errors[0].message, "Unauthorized");
});