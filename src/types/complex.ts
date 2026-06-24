export interface Complex {
  id: string;
  owner_id: string;
  name: string;
  address: string | null;
  phone: string | null;
  created_at: string;
}

export interface ComplexWithStats extends Complex {
  fields_count: number;
  upcoming_matches_count: number;
}

export interface CreateComplexInput {
  name: string;
  address?: string;
  phone?: string;
}
