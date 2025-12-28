/**
 * MentionText Component
 *
 * Renders text with styled mentions. Converts @[Name](userId) format into styled spans.
 * Used for displaying comments, notifications, and other text with user mentions.
 */

const MentionText = ({ text, mentionClassName = 'text-warning-300 mx-1 fw-bold' }) => {
  if (!text) return null;

  // Replace @[Name](userId) with styled mention
  const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  // eslint-disable-next-line no-cond-assign
  while ((match = mentionRegex.exec(text)) !== null) {
    // Add text before mention
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    // Add styled mention
    parts.push(
      <span key={match.index} className={mentionClassName}>
        @{match[1]}
      </span>,
    );
    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
};

export default MentionText;
