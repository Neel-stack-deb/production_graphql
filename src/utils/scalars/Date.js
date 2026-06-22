import { GraphQLScalarType, Kind } from "graphql";

export const DateScalar = new GraphQLScalarType({
  name: "Date",
  description: "Custom date scalar in ISO-8601 format",
  serialize(value) {
    const date = value instanceof Date ? value : new Date(value);
    return date.toISOString();
  },
  parseValue(value) {
    return new Date(value);
  },
  parseLiteral(ast) {
    if (ast.kind !== Kind.STRING) {
      return null;
    }

    return new Date(ast.value);
  },
});