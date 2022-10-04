import type { Person } from './types';

export function getPersonIndex(persons: Person[], personId: string): number {
  const personIndex = persons.findIndex((person) => person.id === personId);

  if (personIndex < 0) {
    throw new ReferenceError(`Person does not exist (id: ${personId})`);
  }

  return personIndex;
}
