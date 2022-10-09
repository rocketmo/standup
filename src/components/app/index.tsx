import { useCallback, useState, useEffect } from 'react';
import cloneDeep from 'lodash/cloneDeep';
import shuffle from 'lodash/shuffle';
import { v4 } from 'uuid';
import ActiveBar from '../active-bar';
import Header from '../header';
import PersonsList from '../persons-list';
import { loadPersons, deletePerson, savePerson } from '../../util/idb';
import { getPersonIndex } from '../../util';
import type { Person } from '../../util/types';

export default function App() {
  const [hasLoadedPersons, setHasLoadedPersons] = useState<boolean>(false);
  const [persons, setPersons] = useState<Person[]>([]);
  const [activePerson, setActivePerson] = useState<Person | undefined>(undefined);

  const setNextActivePerson = useCallback(() => {
    const nextPerson = persons.find((person) => !person.hasCompleted);
    setActivePerson(cloneDeep(nextPerson));
  }, [persons]);

  const onAddPerson = () => {
    const newPerson = {
      hasCompleted: false,
      id: v4(),
      index: persons.length,
      name: '',
    };

    setPersons((previousPersons) => [...previousPersons, newPerson]);
    savePerson(newPerson);
    return newPerson;
  };

  const onClear = () => {
    for (const person of persons) {
      deletePerson(person.id);
    }

    setPersons([]);
  };

  const onCompletePerson = (personId: string) => {
    setPersons((previousPersons) => {
      const personIndex = getPersonIndex(previousPersons, personId);
      return previousPersons.map((person, idx) => {
        if (idx !== personIndex || person.hasCompleted) {
          return person;
        }

        person.hasCompleted = true;
        savePerson(person);

        return person;
      });
    });

    setNextActivePerson();
  };

  const onDeletePerson = (personId: string) => {
    setPersons((previousPersons) => {
      // Delete the person from the local array and from the DB
      const personToDeleteIndex = getPersonIndex(previousPersons, personId);
      const updatedPersons = previousPersons.filter((person, idx) => idx !== personToDeleteIndex);
      deletePerson(personId);

      // Update indices of persons in the array
      for (let personIndex = 0; personIndex < updatedPersons.length; personIndex += 1) {
        const person = updatedPersons[personIndex];
        if (person.index !== personIndex) {
          updatedPersons[personIndex].index = personIndex;
          savePerson(updatedPersons[personIndex]);
        }
      }

      return updatedPersons;
    });
  };

  const onRenamePerson = (personId: string, newName: string) => {
    setPersons((previousPersons) => {
      const personIndex = getPersonIndex(previousPersons, personId);
      return previousPersons.map((person, idx) => {
        if (idx !== personIndex) return person;
        person.name = newName;
        savePerson(person);

        return person;
      });
    });
  };

  const onRestart = () => {
    setPersons((previousPersons) => {
      return previousPersons.map((person) => {
        person.hasCompleted = false;
        savePerson(person);

        return person;
      });
    });

    setActivePerson(undefined);
  };

  const onShuffle = () => {
    setPersons((previousPersons) => {
      const shuffledPersons = shuffle(previousPersons);
      for (let personIndex = 0; personIndex < shuffledPersons.length; personIndex += 1) {
        shuffledPersons[personIndex].index = personIndex;
        savePerson(shuffledPersons[personIndex]);
      }

      return shuffledPersons;
    });
  };

  const onTogglePerson = (personId: string) => {
    setPersons((previousPersons) => {
      const personIndex = getPersonIndex(previousPersons, personId);
      return previousPersons.map((person, idx) => {
        if (idx !== personIndex) return person;
        person.hasCompleted = !person.hasCompleted;
        savePerson(person);

        return person;
      });
    });
  };

  // Load data on mount
  useEffect(() => {
    if (hasLoadedPersons) return;

    loadPersons().then((persons) => {
      setPersons(persons);
      setHasLoadedPersons(true);
    });
  });

  // Set next active person if the current active person has gone
  useEffect(() => {
    if (!activePerson) return;

    const personIndex = getPersonIndex(persons, activePerson.id);
    if (personIndex < 0 || persons[personIndex].hasCompleted) {
      setNextActivePerson();
    }
  }, [persons, activePerson, setNextActivePerson]);

  // Only show the active bar if there are persons in the standup
  let activeBar: JSX.Element | null = null;
  if (persons.length) {
    activeBar = (
      <ActiveBar
        activePerson={activePerson}
        persons={persons}
        onCompletePerson={onCompletePerson}
        onStart={setNextActivePerson}
      />
    );
  }

  return (
    <div>
      <Header />
      {activeBar}
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
