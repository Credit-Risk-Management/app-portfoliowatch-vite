import React from 'react';
import { formatCurrency } from '@src/utils/formatCurrency';

const ChartTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const data = payload[0];
  const isAmountValue = typeof data.value === 'number' && data.value > 1000;

  return (
    <div
      style={{
        backgroundColor: 'white',
        padding: '10px',
        border: '1px solid #ccc',
        borderRadius: '4px',
      }}
    >
      <p className="p-0 mb-0">
        <b>{data.name}</b>
      </p>
      <p className={`p-0 mb-0 text-${data.payload.fill}`}>
        {isAmountValue ? formatCurrency(data.value) : `Count: ${data.value}`}
      </p>
    </div>
  );
};

export default ChartTooltip;

