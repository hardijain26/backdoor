export interface Contact {
  name: string;
  title: string;
  confidence: number;
}

export function parseContacts(rawContacts: unknown[]): Contact[] {
  return [];
}
