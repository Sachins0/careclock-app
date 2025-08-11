// Auth0 User Type (from their SDK)
export interface Auth0User {
  sub: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  middle_name?: string;
  nickname?: string;
  preferred_username?: string;
  profile?: string;
  picture?: string;
  website?: string;
  email?: string;
  email_verified?: boolean;
  gender?: string;
  birthdate?: string;
  zoneinfo?: string;
  locale?: string;
  phone_number?: string;
  phone_number_verified?: boolean;
  address?: {
    country?: string;
  };
  updated_at?: string;
  // Our custom field
  dbUser?: {
    id: string;
    role: string;
    organizationId: string;
    organization: {
      id: string;
      name: string;
    };
  };
}
