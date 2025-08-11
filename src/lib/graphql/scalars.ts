import { GraphQLScalarType, Kind } from 'graphql';
import { GraphQLError } from 'graphql';

// DateTime scalar
export const DateTimeScalar = new GraphQLScalarType({
  name: 'DateTime',
  description: 'Date custom scalar type',
  serialize(value: any): string {
    if (value instanceof Date) {
      return value.toISOString();
    }
    throw new GraphQLError(`Value is not an instance of Date: ${value}`);
  },
  parseValue(value: any): Date {
    if (typeof value === 'string') {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new GraphQLError(`Value is not a valid DateTime: ${value}`);
      }
      return date;
    }
    throw new GraphQLError(`Value is not a valid DateTime: ${value}`);
  },
  parseLiteral(ast): Date {
    if (ast.kind === Kind.STRING) {
      const date = new Date(ast.value);
      if (isNaN(date.getTime())) {
        throw new GraphQLError(`Value is not a valid DateTime: ${ast.value}`);
      }
      return date;
    }
    throw new GraphQLError(`Can only parse strings to dates but got a: ${ast.kind}`);
  },
});

// EmailAddress scalar
export const EmailAddressScalar = new GraphQLScalarType({
  name: 'EmailAddress',
  description: 'Email address custom scalar type',
  serialize(value: any): string {
    if (typeof value === 'string' && isValidEmail(value)) {
      return value;
    }
    throw new GraphQLError(`Value is not a valid email address: ${value}`);
  },
  parseValue(value: any): string {
    if (typeof value === 'string' && isValidEmail(value)) {
      return value;
    }
    throw new GraphQLError(`Value is not a valid email address: ${value}`);
  },
  parseLiteral(ast): string {
    if (ast.kind === Kind.STRING && isValidEmail(ast.value)) {
      return ast.value;
    }
    throw new GraphQLError(`Value is not a valid email address: ${ast.value}`);
  },
});

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
