import React from 'react';

export default function Spinner({size = 32}: {size?: number}) {
  return (
    <svg
      className='spinner'
      width={size}
      height={size}
      viewBox='0 0 50 50'
      aria-hidden='true'
    >
      <circle
        cx='25'
        cy='25'
        r='20'
        stroke='currentColor'
        strokeWidth='4'
        strokeLinecap='round'
        fill='none'
        opacity='0.25'
      />
      <path
        d='M45 25a20 20 0 00-20-20'
        stroke='currentColor'
        strokeWidth='4'
        strokeLinecap='round'
        fill='none'
      />
    </svg>
  );
}
