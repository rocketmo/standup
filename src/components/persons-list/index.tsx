import React, { useCallback, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheck,
  faEllipsisVertical,
  faPlus,
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
  activePersonId?: string;
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
  const [showInvalidNameError, setShowInvalidNameError] = useState<boolean>(false);

  const renameInputFocusRef = useCallback((renameInput: HTMLInputElement | null) => {
    renameInput?.focus();
  }, []);

  const onAddPersonClick = () => {
    deleteNoRenamedPerson();

    const newPerson = props.onAddPerson();
    setPersonRenameId(newPerson.id);
    setTempPersonName(newPerson.name);
    setShowInvalidNameError(false);
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

  /**
   * Deletes the person currently being renamed if they did not previously already have a name
   */
  const deleteNoRenamedPerson = () => {
    if (!personRenameId) return;

    const personIndex = getPersonIndex(props.persons, personRenameId);
    const person = props.persons[personIndex];
    if (person && !person.name) {
      props.onDeletePerson(personRenameId);
    }
  };

  const onRenameOpen = (personId: string) => {
    onPersonMenuClose();
    setShowInvalidNameError(false);
    deleteNoRenamedPerson();

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

    // Name is required
    if (!tempPersonName) {
      setShowInvalidNameError(true);
      return;
    }

    props.onRenamePerson(personRenameId, tempPersonName);
    setPersonRenameId(undefined);
    setTempPersonName(undefined);
    setShowInvalidNameError(false);
  };

  const onRenameCancel = () => {
    deleteNoRenamedPerson();
    setPersonRenameId(undefined);
    setTempPersonName(undefined);
    setShowInvalidNameError(false);
  };

  const getDefaultItem = (person: Person) => {
    const isOpen = !!personAnchor && person.id === personMenuId;
    const isHighlighted = person.id === props.activePersonId;
    let itemClass = '';

    if (person.hasCompleted) {
      itemClass = 'standup-person-completed';
    } else if (isHighlighted) {
      itemClass = 'standup-person-highlight';
    }

    const selectNextButton = (
      <button onClick={props.onSelectNextPerson.bind(undefined, person.id)}>
        <FontAwesomeIcon icon={faTurnUp} />
      </button>
    );

    return (
      <li key={person.id} className={itemClass}>
        <button
          className="standup-person"
          onClick={props.onTogglePerson.bind(undefined, person.id)}
        >
          <span>{person.name || '<No name>'}</span>
        </button>
        <div className="standup-person-actions">
          {!isHighlighted ? selectNextButton : null}
          <button onClick={onPersonMenuOpen.bind(undefined, person.id)}>
            <FontAwesomeIcon icon={faEllipsisVertical} />
          </button>
          <Menu anchorEl={personAnchor} open={isOpen} onClose={onPersonMenuClose}>
            <MenuItem onClick={onRenameOpen.bind(undefined, person.id)}>Rename</MenuItem>
            <MenuItem onClick={onDeletePerson.bind(undefined, person.id)}>Delete</MenuItem>
          </Menu>
        </div>
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
    const isInvalidName = showInvalidNameError && !tempPersonName;
    const inputClassName =
      'standup-person-rename-input' + (isInvalidName ? ' standup-invalid-input' : '');
    const errorMsg = isInvalidName ? (
      <span className="standup-error-msg">A name is required.</span>
    ) : null;

    return (
      <li key={person.id} className="standup-rename-list-item">
        <div className="standup-person-rename-input-container">
          <input
            className={inputClassName}
            onChange={onTempPersonNameChange}
            onKeyDown={onRenameKeyDown}
            ref={renameInputFocusRef}
            type="text"
            value={tempPersonName}
          />
          <div className="standup-person-rename-actions">
            <button onClick={onRenameConfirm}>
              <FontAwesomeIcon icon={faCheck} />
            </button>
            <button onClick={onRenameCancel}>
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </div>
        </div>
        {errorMsg}
      </li>
    );
  };

  const getListItems = () => {
    return props.persons
      .sort((personA, personB) => {
        if (personA.hasCompleted && !personB.hasCompleted) {
          return 1;
        } else if (!personA.hasCompleted && personB.hasCompleted) {
          return -1;
        }

        return personA.index - personB.index;
      })
      .map((person) => {
        return person.id === personRenameId ? getRenameItem(person) : getDefaultItem(person);
      });
  };

  const getEmptyMessage = () => {
    const msgListItem = <li>Your standup is empty.</li>;
    return [msgListItem];
  };

  const getTopActionsBar = () => {
    return (
      <div id="standup-top-action-bar">
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
      <div id="standup-person-list-header">
        <h2 id="standup-up-next-header">Up next...</h2>
        {topActionsBar}
      </div>
      <ul id="standup-person-list">{personListItems}</ul>
      <button id="standup-add-person" onClick={onAddPersonClick}>
        <FontAwesomeIcon icon={faPlus} /> Add person
      </button>
    </div>
  );
}
