export const formatMoneyShorthand = (num, currency = '$') => {
  const roundedNum = Math.round(Number(num));

  // Handle small or zero values
  if (roundedNum === 0 || roundedNum < 1000) {
    return `${currency}${roundedNum.toLocaleString()}`;
  }

  if (roundedNum >= 1000000) {
    const millions = (roundedNum / 1000000).toFixed(1);
    // Remove .0 if whole number
    const formattedMillions = millions.endsWith('.0') ? millions.slice(0, -2) : millions;
    return `${currency}${formattedMillions}M`;
  }

  const thousands = (roundedNum / 1000).toFixed(1);
  // Remove .0 if whole number
  const formattedThousands = thousands.endsWith('.0') ? thousands.slice(0, -2) : thousands;
  return `${currency}${formattedThousands}K`;
};

export const formatMoneyOneLetter = (num, currency = '$') => {
  if (!num) { return ''; }
  if (num < 1000) { return `${currency}${num}`; }
  // if (num >= 1000000) {
  //   const millions = (50000 * Math.round(Number(num) / 50000)) / 1000000;
  //   return `${currency}${millions}M`;
  // }
  const thousands = (1000 * Math.round(Number(num) / 1000)) / 1000;
  return `${currency}${thousands}k`;
};
