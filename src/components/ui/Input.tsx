import React from 'react';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  className?: string;
  label?: string;
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({className = '', label, id, ...rest}, ref) => {
    const generatedId = React.useId();
    const _id = id ?? generatedId;
    return (
      <div style={{display: 'contents'}}>
        {label ? (
          <label htmlFor={_id} className='sr-only'>
            {label}
          </label>
        ) : null}
        <input
          id={_id}
          ref={ref}
          {...rest}
          className={`input ${className}`.trim()}
        />
      </div>
    );
  },
);

Input.displayName = 'Input';

export default React.memo(Input);
