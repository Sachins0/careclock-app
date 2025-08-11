import { queries } from './queries';
import { mutations } from './mutations';
import { fieldResolvers } from './fields';
import { DateTimeScalar, EmailAddressScalar } from '../scalars';

export const resolvers = {
  // Custom scalars
  DateTime: DateTimeScalar,
  EmailAddress: EmailAddressScalar,

  // Root resolvers
  Query: queries,
  Mutation: mutations,

  // Field resolvers
  ...fieldResolvers,
};
