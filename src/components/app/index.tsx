import { useCallback, useState, useEffect } from 'react';
import shuffle from 'lodash/shuffle';
import { v4 } from 'uuid';
import ActiveBar from '../active-bar';
import Header from '../header';
import Icebreaker from '../icebreaker';
import PersonsList from '../persons-list';
import { loadPersons, deletePerson, savePerson } from '../../util/idb';
import { getPersonIndex } from '../../util';
import { closePeopleFilters, highlightPerson } from '../../util/klondike';
import type { Person } from '../../util/types';
import './index.scss';

export default function App() {
  const [hasLoadedPersons, setHasLoadedPersons] = useState<boolean>(false);
  const [persons, setPersons] = useState<Person[]>([]);
  const [activePersonId, setActivePersonId] = useState<string | undefined>(undefined);

  const setNextActivePerson = useCallback(() => {
    const nextPerson = persons.find((person) => !person.hasCompleted);
    setActivePersonId(nextPerson?.id);

    if (nextPerson) {
      highlightPerson(nextPerson.name);
    } else {
      closePeopleFilters();
    }
  }, [persons]);

  const onAddPerson = (name = '') => {
    const newPerson = {
      hasCompleted: false,
      id: v4(),
      index: persons.length,
      name,
    };

    setPersons((previousPersons) => [...previousPersons, newPerson]);
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
        return person;
      });
    });
  };

  const onDeletePerson = (personId: string) => {
    setPersons((previousPersons) => {
      // Delete the person from the local array and from the DB
      const personToDeleteIndex = getPersonIndex(previousPersons, personId);
      const updatedPersons = previousPersons.filter((_, idx) => idx !== personToDeleteIndex);

      // Update indices of persons in the array
      for (let personIndex = 0; personIndex < updatedPersons.length; personIndex += 1) {
        const person = updatedPersons[personIndex];
        if (person.index !== personIndex) {
          updatedPersons[personIndex].index = personIndex;
        }
      }

      return updatedPersons;
    });

    deletePerson(personId);
  };

  const onMovePerson = (personId: string, moveIndex: number) => {
    setPersons((previousPersons) => {
      // Sort the list first since it might be out of order
      const newPersons = [...previousPersons];
      newPersons.sort((personA, personB) => personA.index - personB.index);

      // Move the person to their new position in the list
      const prevPersonIndex = getPersonIndex(newPersons, personId);
      const movedPerson = newPersons.splice(prevPersonIndex, 1);
      newPersons.splice(moveIndex, 0, ...movedPerson);

      // Update the indices of the persons
      for (let personIndex = 0; personIndex < newPersons.length; personIndex += 1) {
        newPersons[personIndex].index = personIndex;
      }

      return newPersons;
    });
  };

  const onRenamePerson = (personId: string, newName: string) => {
    setPersons((previousPersons) => {
      const personIndex = getPersonIndex(previousPersons, personId);
      return previousPersons.map((person, idx) => {
        if (idx !== personIndex) return person;
        person.name = newName;
        return person;
      });
    });
  };

  const onRestart = () => {
    setPersons((previousPersons) => {
      return previousPersons.map((person) => {
        person.hasCompleted = false;
        return person;
      });
    });

    setActivePersonId(undefined);
    closePeopleFilters();
  };

  const onSelectNextPerson = (personId: string) => {
    const personIndex = getPersonIndex(persons, personId);
    if (personIndex < 0) return;

    const prevActivePersonId = activePersonId;
    const nextPerson = persons[personIndex];
    setActivePersonId(personId);
    highlightPerson(nextPerson.name);

    setPersons((previousPersons) => {
      return previousPersons.map((person) => {
        if (person.id === personId) {
          person.hasCompleted = false;
        } else if (person.id === prevActivePersonId) {
          person.hasCompleted = true;
        }

        return person;
      });
    });
  };

  const onShuffle = () => {
    setPersons((previousPersons) => {
      const shuffledPersons = shuffle(previousPersons);
      for (let personIndex = 0; personIndex < shuffledPersons.length; personIndex += 1) {
        shuffledPersons[personIndex].index = personIndex;
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
    if (!activePersonId) return;

    const personIndex = getPersonIndex(persons, activePersonId);
    if (personIndex < 0 || persons[personIndex].hasCompleted) {
      setNextActivePerson();
    }
  }, [persons, activePersonId, setNextActivePerson]);

  // Save persons whenever the list is updated
  useEffect(() => {
    for (const person of persons) {
      if (!person.name) continue; // Don't save if the person has not been named
      savePerson(person);
    }
  }, [persons]);

  // Only show the active bar if there are persons in the standup
  let activeBar: JSX.Element | null = null;
  if (persons.length) {
    activeBar = (
      <ActiveBar
        activePersonId={activePersonId}
        persons={persons}
        onCompletePerson={onCompletePerson}
        onStart={setNextActivePerson}
      />
    );
  }

  return (
    <div id="standup-container">
      <Header />
      {activeBar}
      <PersonsList
        activePersonId={activePersonId}
        persons={persons}
        onAddPerson={onAddPerson}
        onClear={onClear}
        onDeletePerson={onDeletePerson}
        onMovePerson={onMovePerson}
        onRenamePerson={onRenamePerson}
        onRestart={onRestart}
        onSelectNextPerson={onSelectNextPerson}
        onShuffle={onShuffle}
        onTogglePerson={onTogglePerson}
      />
      <Icebreaker />
    </div>
  );
}
