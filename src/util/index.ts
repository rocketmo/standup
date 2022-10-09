import type { Person } from './types';

export function getPersonIndex(persons: Person[], personId: string): number {
  const personIndex = persons.findIndex((person) => person.id === personId);
  return personIndex;
}
