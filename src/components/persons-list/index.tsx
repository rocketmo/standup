import React, { useCallback, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisVertical, faCheck, faXmark } from '@fortawesome/free-solid-svg-icons';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { getPersonIndex } from '../../util';
import type { Person } from '../../util/types';
import './index.scss';

interface PersonsListProps {
  persons: Person[];
  onAddPerson: () => Person;
  onDeletePerson: (personId: string) => void;
  onRenamePerson: (personId: string, newName: string) => void;
  onTogglePerson: (personId: string) => void;
}

export default function PersonsList(props: PersonsListProps) {
  const [anchorElement, setAnchorElement] = useState<undefined | HTMLElement>(undefined);
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

  const onMenuOpen = (personId: string, event: React.MouseEvent<HTMLButtonElement>) => {
    setPersonMenuId(personId);
    setAnchorElement(event.currentTarget);
  };

  const onMenuClose = () => {
    setPersonMenuId(undefined);
    setAnchorElement(undefined);
  };

  const onDeletePerson = (personId: string) => {
    props.onDeletePerson(personId);
    onMenuClose();
  };

  const onRenameOpen = (personId: string) => {
    onMenuClose();

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
    const isOpen = !!anchorElement && person.id === personMenuId;

    return (
      <li key={person.id}>
        <button onClick={props.onTogglePerson.bind(undefined, person.id)}>
          <span className={person.hasCompleted ? 'standup-person-completed' : ''}>
            {person.name || '<No name>'}
          </span>
        </button>
        <button onClick={onMenuOpen.bind(undefined, person.id)}>
          <FontAwesomeIcon icon={faEllipsisVertical} />
        </button>
        <Menu anchorEl={anchorElement} open={isOpen} onClose={onMenuClose}>
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

  const personListItems = props.persons.length ? getListItems() : getEmptyMessage();

  return (
    <div>
      <h2>Up next...</h2>
      <ul>{personListItems}</ul>
      <button onClick={onAddPersonClick}>Add person</button>
    </div>
  );
}
