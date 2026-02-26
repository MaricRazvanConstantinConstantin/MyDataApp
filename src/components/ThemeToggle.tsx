import {useState} from 'react';
import {useTheme} from '../context/hooks';

export default function ThemeToggle() {
  const {toggle, theme} = useTheme();
  const [colors] = useState({
    primary: 'var(--primary)',
    secondary: 'var(--secondary)',
  });

  return (
    <span
      onClick={toggle}
      title={`Toggle theme (current: ${theme})`}
      aria-pressed={theme === 'two'}
      className='w-5 h-5 rounded-full'
      style={{
        background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
        transition: 'background 220ms ease',
        display: 'inline-block',
      }}
    />
  );
}
