import type { Person } from '../../util/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';

interface ActiveBarProps {
  activePerson: Person | undefined;
  persons: Person[];
  onCompletePerson: (personId: string) => void;
  onStart: () => void;
}

export default function ActiveBar(props: ActiveBarProps) {
  const areAllPersonsCompleted = () => {
    return props.persons.every((person) => person.hasCompleted);
  };

  const getPersonElement = (person: Person) => {
    return (
      <h2>
        {person.name || 'No name'}
        <button onClick={props.onCompletePerson.bind(undefined, person.id)}>
          <FontAwesomeIcon icon={faCheck} />
        </button>
      </h2>
    );
  };

  const getNonActiveElement = () => {
    if (areAllPersonsCompleted()) {
      return <h2>Finished!</h2>;
    }

    return <button onClick={props.onStart}>Start</button>;
  };

  return props.activePerson ? getPersonElement(props.activePerson) : getNonActiveElement();
}
