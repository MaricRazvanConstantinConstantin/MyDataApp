import React from 'react';

type ContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
};

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({children, className = '', ...rest}, ref) => {
    return (
      <div
        ref={ref}
        {...rest}
        className={['app-container', className].filter(Boolean).join(' ')}
      >
        {children}
      </div>
    );
  },
);

Container.displayName = 'Container';

export default Container;
