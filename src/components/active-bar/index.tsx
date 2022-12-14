import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import type { Person } from '../../util/types';
import { getPersonIndex } from '../../util';
import './index.scss';

interface ActiveBarProps {
  activePersonId?: string;
  persons: Person[];
  onCompletePerson: (personId: string) => void;
  onStart: () => void;
}

export default function ActiveBar(props: ActiveBarProps) {
  const clapGifUrl = chrome.runtime.getURL('assets/images/sob-clap.gif');

  const areAllPersonsCompleted = () => {
    return props.persons.every((person) => person.hasCompleted);
  };

  const getPersonElement = (person: Person) => {
    return (
      <div id="standup-active-person">
        <span>{person.name || 'No name'}</span>
        <button onClick={props.onCompletePerson.bind(undefined, person.id)}>
          <FontAwesomeIcon icon={faCheck} />
        </button>
      </div>
    );
  };

  const getNonActiveElement = () => {
    if (areAllPersonsCompleted()) {
      const clappingImg = <img src={clapGifUrl} alt="Sob clapping" />;

      return (
        <div id="standup-finished">
          {clappingImg}
          <span>&nbsp;Finished!&nbsp;</span>
          {clappingImg}
        </div>
      );
    }

    return (
      <button id="standup-start-button" onClick={props.onStart}>
        Start
      </button>
    );
  };

  const personIndex = props.activePersonId
    ? getPersonIndex(props.persons, props.activePersonId)
    : -1;
  const person = personIndex > -1 ? props.persons[personIndex] : undefined;

  return person ? getPersonElement(person) : getNonActiveElement();
}
