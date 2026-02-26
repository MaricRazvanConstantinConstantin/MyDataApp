import React from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  className?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
};

const VARIANT_CLASS: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'btn',
  secondary: 'btn btn-secondary',
  ghost: 'btn-ghost',
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({children, className = '', variant = 'primary', type, ...rest}, ref) => {
    const finalType = type ?? 'button';
    const base = VARIANT_CLASS[variant] ?? VARIANT_CLASS.primary;
    return (
      <button
        ref={ref}
        type={finalType}
        {...rest}
        className={`${base} ${className}`.trim()}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';

export default React.memo(Button);
