import React from 'react';

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  className?: string;
  label?: string;
};

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
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
        <textarea
          id={_id}
          ref={ref}
          {...rest}
          className={['input', className].filter(Boolean).join(' ')}
        />
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';

export default Textarea;
