import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { closeSidebar } from '../../util/sidebar';
import './index.scss';

export default function Header() {
  return (
    <div className="standup-header">
      <h1>Standup</h1>
      <button onClick={closeSidebar}>
        <FontAwesomeIcon icon={faXmark} />
      </button>
    </div>
  );
}
