import React, { useCallback, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheck,
  faEllipsisVertical,
  faRotateRight,
  faShuffle,
  faTurnUp,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { getPersonIndex } from '../../util';
import type { Person } from '../../util/types';
import './index.scss';

interface PersonsListProps {
  persons: Person[];
  onAddPerson: () => Person;
  onClear: () => void;
  onDeletePerson: (personId: string) => void;
  onRenamePerson: (personId: string, newName: string) => void;
  onRestart: () => void;
  onSelectNextPerson: (personId: string) => void;
  onShuffle: () => void;
  onTogglePerson: (personId: string) => void;
}

export default function PersonsList(props: PersonsListProps) {
  const [extrasAnchor, setExtrasAnchor] = useState<undefined | HTMLElement>(undefined);
  const [personAnchor, setPersonAnchor] = useState<undefined | HTMLElement>(undefined);
  const [personMenuId, setPersonMenuId] = useState<undefined | string>(undefined);
  const [personRenameId, setPersonRenameId] = useState<undefined | string>(undefined);
  const [tempPersonName, setTempPersonName] = useState<undefined | string>(undefined);

  const renameInputFocusRef = useCallback((renameInput: HTMLInputElement | null) => {
    renameInput?.focus();
  }, []);

  const onAddPersonClick = () => {
    const newPerson = props.onAddPerson();
    setPersonRenameId(newPerson.id);
    setTempPersonName(newPerson.name);
  };

  const onPersonMenuOpen = (personId: string, event: React.MouseEvent<HTMLButtonElement>) => {
    setPersonMenuId(personId);
    setPersonAnchor(event.currentTarget);
  };

  const onPersonMenuClose = () => {
    setPersonMenuId(undefined);
    setPersonAnchor(undefined);
  };

  const onExtrasMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setExtrasAnchor(event.currentTarget);
  };

  const onExtrasMenuClose = () => {
    setExtrasAnchor(undefined);
  };

  const onClearClick = () => {
    props.onClear();
    onExtrasMenuClose();
  };

  const onDeletePerson = (personId: string) => {
    props.onDeletePerson(personId);
    onPersonMenuClose();
  };

  const onRenameOpen = (personId: string) => {
    onPersonMenuClose();

    // HACK: Wait until the menu is closed on the next render so we can show the rename input
    // and focus on it
    requestAnimationFrame(() => {
      const personIndex = getPersonIndex(props.persons, personId);
      const person = props.persons[personIndex];
      setPersonRenameId(personId);
      setTempPersonName(person.name);
    });
  };

  const onRenameConfirm = () => {
    if (!personRenameId) {
      throw new ReferenceError('No person to rename.');
    }

    props.onRenamePerson(personRenameId, tempPersonName || '');
    setPersonRenameId(undefined);
    setTempPersonName(undefined);
  };

  const onRenameCancel = () => {
    setPersonRenameId(undefined);
    setTempPersonName(undefined);
  };

  const getDefaultItem = (person: Person) => {
    const isOpen = !!personAnchor && person.id === personMenuId;

    return (
      <li key={person.id}>
        <button onClick={props.onTogglePerson.bind(undefined, person.id)}>
          <span className={person.hasCompleted ? 'standup-person-completed' : ''}>
            {person.name || '<No name>'}
          </span>
        </button>
        <button onClick={props.onSelectNextPerson.bind(undefined, person.id)}>
          <FontAwesomeIcon icon={faTurnUp} />
        </button>
        <button onClick={onPersonMenuOpen.bind(undefined, person.id)}>
          <FontAwesomeIcon icon={faEllipsisVertical} />
        </button>
        <Menu anchorEl={personAnchor} open={isOpen} onClose={onPersonMenuClose}>
          <MenuItem onClick={onRenameOpen.bind(undefined, person.id)}>Rename</MenuItem>
          <MenuItem onClick={onDeletePerson.bind(undefined, person.id)}>Delete</MenuItem>
        </Menu>
      </li>
    );
  };

  const onTempPersonNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTempPersonName(event.target.value);
  };

  const onRenameKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      onRenameConfirm();
    } else if (event.key === 'Escape') {
      onRenameCancel();
    }
  };

  const getRenameItem = (person: Person) => {
    return (
      <li key={person.id}>
        <input
          onChange={onTempPersonNameChange}
          onKeyDown={onRenameKeyDown}
          ref={renameInputFocusRef}
          type="text"
          value={tempPersonName}
        />
        <button onClick={onRenameConfirm}>
          <FontAwesomeIcon icon={faCheck} />
        </button>
        <button onClick={onRenameCancel}>
          <FontAwesomeIcon icon={faXmark} />
        </button>
      </li>
    );
  };

  const getListItems = () => {
    return props.persons.map((person) => {
      return person.id === personRenameId ? getRenameItem(person) : getDefaultItem(person);
    });
  };

  const getEmptyMessage = () => {
    const msgListItem = <li>Your standup is empty.</li>;
    return [msgListItem];
  };

  const getTopActionsBar = () => {
    return (
      <div>
        <button onClick={props.onShuffle}>
          <FontAwesomeIcon icon={faShuffle} />
        </button>
        <button onClick={props.onRestart}>
          <FontAwesomeIcon icon={faRotateRight} />
        </button>
        <button onClick={onExtrasMenuOpen}>
          <FontAwesomeIcon icon={faEllipsisVertical} />
        </button>
        <Menu anchorEl={extrasAnchor} open={!!extrasAnchor} onClose={onExtrasMenuClose}>
          <MenuItem onClick={onClearClick}>Clear</MenuItem>
        </Menu>
      </div>
    );
  };

  const personListItems = props.persons.length ? getListItems() : getEmptyMessage();
  const topActionsBar = props.persons.length ? getTopActionsBar() : null;

  return (
    <div>
      <h2>Up next...</h2>
      {topActionsBar}
      <ul>{personListItems}</ul>
      <button onClick={onAddPersonClick}>Add person</button>
    </div>
  );
}
