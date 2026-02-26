import React from 'react';

type CardProps = React.HTMLAttributes<HTMLDivElement> & {className?: string};

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({children, className = '', ...rest}, ref) => {
    return (
      <div
        ref={ref}
        {...rest}
        className={['card', className].filter(Boolean).join(' ')}
      >
        {children}
      </div>
    );
  },
);

Card.displayName = 'Card';

export default Card;
