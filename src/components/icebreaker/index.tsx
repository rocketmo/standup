import React, { useState } from 'react';
import sample from 'lodash/sample';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCaretDown,
  faCaretUp,
  faCheck,
  faEllipsisVertical,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { ICE_BREAKERS } from './constants';
import './index.scss';

function getRandomIcebreaker(): string {
  return sample(ICE_BREAKERS)!;
}

export default function Icebreaker() {
  const [showIcebreaker, setShowIcebreaker] = useState<boolean>(false);
  const [showCustomTextArea, setShowCustomTextArea] = useState<boolean>(false);
  const [icebreakerText, setIcebreakerText] = useState<string>(getRandomIcebreaker());
  const [tempIcebreakerText, setTempIcebreakerText] = useState<string>(icebreakerText);
  const [menuAnchor, setMenuAnchor] = useState<undefined | HTMLElement>(undefined);

  const caretIcon = showIcebreaker ? faCaretDown : faCaretUp;

  const onMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const onMenuClose = () => {
    setMenuAnchor(undefined);
  };

  const shuffleIcebreaker = () => {
    setIcebreakerText(getRandomIcebreaker());
    setShowCustomTextArea(false);
    onMenuClose();
  };

  const onCustomTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTempIcebreakerText(event.target.value);
  };

  const onCustomTextKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter') {
      onCustomTextConfirm();
    } else if (event.key === 'Escape') {
      onCustomTextCancel();
    }
  };

  const onCustomTextConfirm = () => {
    setIcebreakerText(tempIcebreakerText);
    setShowCustomTextArea(false);
  };

  const onCustomTextCancel = () => {
    setShowCustomTextArea(false);
  };

  const openCustomTextArea = () => {
    setShowCustomTextArea(true);
    setTempIcebreakerText(icebreakerText);
    onMenuClose();
  };

  const getIcebreakerTextSection = () => {
    if (!showIcebreaker) {
      return;
    }

    if (showCustomTextArea) {
      return (
        <div id="icebreaker-text-container">
          <div id="icebreaker-text">
            <textarea
              value={tempIcebreakerText}
              onChange={onCustomTextChange}
              onKeyDown={onCustomTextKeyDown}
            />
          </div>
          <div id="custom-text-actions">
            <button onClick={onCustomTextConfirm}>
              <FontAwesomeIcon icon={faCheck} />
            </button>
            <button onClick={onCustomTextCancel}>
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </div>
        </div>
      );
    }

    return (
      <div id="icebreaker-text-container">
        <div id="icebreaker-text">
          <span>{icebreakerText}</span>
        </div>
        <button onClick={onMenuOpen}>
          <FontAwesomeIcon icon={faEllipsisVertical} />
        </button>
        <Menu anchorEl={menuAnchor} open={!!menuAnchor} onClose={onMenuClose}>
          <MenuItem onClick={shuffleIcebreaker}>Random</MenuItem>
          <MenuItem onClick={openCustomTextArea}>Custom</MenuItem>
        </Menu>
      </div>
    );
  };

  return (
    <div id="icebreaker-container">
      <button
        id="icebreaker-header"
        className={showIcebreaker ? 'icebreaker-header-opened' : ''}
        onClick={setShowIcebreaker.bind(undefined, !showIcebreaker)}
      >
        <h2>Icebreaker</h2>
        <div id="icebreaker-caret">
          <FontAwesomeIcon icon={caretIcon} />
        </div>
      </button>
      {getIcebreakerTextSection()}
    </div>
  );
}
