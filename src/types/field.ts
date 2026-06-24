export interface Field {
  id: string;
  complex_id: string;
  name: string;
  capacity: number;
  surface: string | null;
  created_at: string;
}

export interface FieldWithComplex extends Field {
  complex: {
    id: string;
    name: string;
  };
}

export interface CreateFieldInput {
  complex_id: string;
  name: string;
  capacity: number;
  surface?: string;
}
