import { Dropdown } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';

const ContextMenu = ({ items = [], onItemClick = () => { } }) => (
  <Dropdown onClick={(e) => e.stopPropagation()}>
    <Dropdown.Toggle
      variant="link"
      className="text-white p-0"
      id="dropdown-basic"
    >
      <FontAwesomeIcon icon={faEllipsisV} />
    </Dropdown.Toggle>

    <Dropdown.Menu>
      {items.map((item, index) => (
        <Dropdown.Item
          key={index}
          onClick={(e) => {
            e.stopPropagation();
            onItemClick(item);
          }}
          className="py-8"
        >
          {item.icon && (
            <FontAwesomeIcon icon={item.icon} className="me-8" />
          )}
          {item.label}
        </Dropdown.Item>
      ))}
    </Dropdown.Menu>
  </Dropdown>
);

export default ContextMenu;
