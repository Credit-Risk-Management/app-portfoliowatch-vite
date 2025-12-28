import { useEffect, useState } from 'react';
import { Mention, MentionsInput } from 'react-mentions';
import usersApi from '@src/api/users.api';
import { $mentionableUsers } from '@src/signals';
import './MentionInput.scss';

const MentionInput = ({
  value,
  onChange,
  placeholder = 'Type @ to mention someone...',
  className = '',
  rows = 3,
  disabled = false,
  isLoading = false,
}) => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Fetch mentionable users
    const fetchMentionableUsers = async () => {
      try {
        $mentionableUsers.value = { ...$mentionableUsers.value, isLoading: true };
        const response = await usersApi.getMentionable();
        const mentionable = response.data || [];
        setUsers(mentionable);
        $mentionableUsers.value = { list: mentionable, isLoading: false };
      } catch (error) {
        console.error('Failed to fetch mentionable users:', error);
        $mentionableUsers.value = { list: [], isLoading: false };
      }
    };

    fetchMentionableUsers();
  }, []);

  return (
    <div className={`mention-input-wrapper ${isLoading ? 'is-loading' : ''}`}>
      <MentionsInput
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || 'Type @ to mention someone...'}
        className={`mention-input ${className}`}
        disabled={disabled || isLoading}
        style={{
          control: {
            fontSize: 14,
            fontWeight: 'normal',
            color: '#DAF7FB',
            opacity: isLoading ? 0.6 : 1,
          },
          '&multiLine': {
            control: {
              minHeight: rows * 24,
            },
            highlighter: {
              padding: 9,
              border: '1px solid transparent',
            },
            input: {
              padding: 9,
              border: '1px solid #ced4da',
              borderRadius: '0.25rem',
              color: '#DAF7FB',
            },
          },
        }}
      >
        <Mention
          trigger="@"
          data={users.map((user) => ({
            id: user.id,
            display: user.name,
          }))}
          renderSuggestion={(suggestion, search, highlightedDisplay) => (
            <div className="mention-suggestion">
              {highlightedDisplay}
            </div>
          )}
          markup="@[__display__](__id__)"
          displayTransform={(id, display) => `@${display}`}
          className="custom-mention"
        />
      </MentionsInput>
      {isLoading && (
        <div className="mention-input-loading">
          <div className="spinner-border spinner-border-sm" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentionInput;
