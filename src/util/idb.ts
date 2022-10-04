import { openDB } from 'idb';
import type { IDBPDatabase } from 'idb';
import type { Person } from './types';

const DB_NAME = 'standup';
const PERSONS_STORE_NAME = 'persons';

/**
 * Creates the database if it doesn't already exist.
 */
function upgrade(db: IDBPDatabase) {
  db.createObjectStore(PERSONS_STORE_NAME, { keyPath: 'id' });
}

/**
 * Loads all persons in the standup.
 */
export async function loadPersons(): Promise<Person[]> {
  const db = await openDB(DB_NAME, 1, { upgrade });
  const transaction = db.transaction(PERSONS_STORE_NAME, 'readonly');
  const personsStore = transaction.objectStore(PERSONS_STORE_NAME);

  const persons: Person[] = await personsStore.getAll();
  await transaction.done;

  db.close();

  return persons.sort((personA, personB) => {
    return personA.index - personB.index;
  });
}

/**
 * Saves a person's standup info.
 */
export async function savePerson(person: Person): Promise<void> {
  const db = await openDB(DB_NAME, 1, { upgrade });
  const transaction = db.transaction(PERSONS_STORE_NAME, 'readwrite');
  const personsStore = transaction.objectStore(PERSONS_STORE_NAME);
  await personsStore.put(person);
  await transaction.done;

  db.close();
}

/**
 * Deletes a person's standup info.
 */
export async function deletePerson(personId: string): Promise<void> {
  const db = await openDB(DB_NAME, 1, { upgrade });
  const transaction = db.transaction(PERSONS_STORE_NAME, 'readwrite');
  const personsStore = transaction.objectStore(PERSONS_STORE_NAME);
  await personsStore.delete(personId);
  await transaction.done;

  db.close();
}
