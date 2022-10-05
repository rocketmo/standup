import { useState, useEffect } from 'react';
import cloneDeep from 'lodash/cloneDeep';
import shuffle from 'lodash/shuffle';
import { v4 } from 'uuid';
import Header from '../header';
import PersonsList from '../persons-list';
import { loadPersons, deletePerson, savePerson } from '../../util/idb';
import { getPersonIndex } from '../../util';
import type { Person } from '../../util/types';

export default function App() {
  const [persons, setPersons] = useState<Person[]>([]);

  const onAddPerson = () => {
    const personsCopy: Person[] = cloneDeep(persons);
    const newPerson = {
      hasCompleted: false,
      id: v4(),
      index: personsCopy.length,
      name: '',
    };

    personsCopy.push(newPerson);
    setPersons(personsCopy);
    savePerson(newPerson);
    return newPerson;
  };

  const onClear = () => {
    for (const person of persons) {
      deletePerson(person.id);
    }

    setPersons([]);
  };

  const onDeletePerson = (personId: string) => {
    // Delete the person from the local array and from the DB
    const personToDeleteIndex = getPersonIndex(persons, personId);
    const personsCopy: Person[] = cloneDeep(persons);
    personsCopy.splice(personToDeleteIndex, 1);
    deletePerson(personId);

    // Update indices of persons in the array
    for (let personIndex = 0; personIndex < personsCopy.length; personIndex += 1) {
      const person = personsCopy[personIndex];
      if (person.index !== personIndex) {
        personsCopy[personIndex].index = personIndex;
        savePerson(personsCopy[personIndex]);
      }
    }

    setPersons(personsCopy);
  };

  const onRenamePerson = (personId: string, newName: string) => {
    const personIndex = getPersonIndex(persons, personId);
    const personsCopy: Person[] = cloneDeep(persons);
    personsCopy[personIndex].name = newName;
    setPersons(personsCopy);
    savePerson(personsCopy[personIndex]);
  };

  const onRestart = () => {
    const personsCopy: Person[] = cloneDeep(persons);
    for (const person of personsCopy) {
      person.hasCompleted = false;
      savePerson(person);
    }

    setPersons(personsCopy);
  };

  const onShuffle = () => {
    const personsCopy: Person[] = cloneDeep(persons);
    const shuffledPersons = shuffle(personsCopy);

    for (let personIndex = 0; personIndex < shuffledPersons.length; personIndex += 1) {
      shuffledPersons[personIndex].index = personIndex;
      savePerson(shuffledPersons[personIndex]);
    }

    setPersons(shuffledPersons);
  };

  const onTogglePerson = (personId: string) => {
    const personIndex = getPersonIndex(persons, personId);
    const personsCopy: Person[] = cloneDeep(persons);
    personsCopy[personIndex].hasCompleted = !personsCopy[personIndex].hasCompleted;
    setPersons(personsCopy);
    savePerson(personsCopy[personIndex]);
  };

  // Load data on mount
  useEffect(() => {
    loadPersons().then((persons) => {
      setPersons(persons);
    });
  });

  return (
    <div>
      <Header />
      <PersonsList
        persons={persons}
        onAddPerson={onAddPerson}
        onClear={onClear}
        onDeletePerson={onDeletePerson}
        onRenamePerson={onRenamePerson}
        onRestart={onRestart}
        onShuffle={onShuffle}
        onTogglePerson={onTogglePerson}
      />
    </div>
  );
}
