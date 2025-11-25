import UniversalInput from '@src/components/global/Inputs/UniversalInput';
import { $form } from '@src/signals';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

const Search = ({
  signal = $form,
  name = 'localSearch', // because 'search' is already reserved for nav search in $form
  placeholder = 'Search',
  hidden = false,
  onChange,
}) => (
  <div
    className="d-flex align-items-center bg-info-800 pe-8"
    style={{ borderRadius: '10px' }}
    hidden={hidden}
  >
    <UniversalInput
      name={name}
      signal={signal}
      type="text"
      placeholder={placeholder}
      className="bg-transparent border-0 text-info-100"
      onChange={(e) => {
        signal.update({ [name]: e.target.value });
        if (onChange) {
          onChange();
        }
      }}
    />
    <FontAwesomeIcon icon={faSearch} className="ms-4 text-info-50 text-info-600" />
  </div>
);

export default Search;
