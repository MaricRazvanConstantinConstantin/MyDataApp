import React, {useState} from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';

export default function TagInput({onAdd}: {onAdd: (tag: string) => void}) {
  const [val, setVal] = useState<string>('');
  return (
    <div className='flex space-x-2'>
      <Input
        placeholder='Add tag and press Enter'
        value={val}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setVal(e.target.value)
        }
        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            const t = val.trim();
            if (t) onAdd(t);
            setVal('');
          }
        }}
        className='flex-1'
      />
      <Button
        type='button'
        className='pager-btn btn-ghost'
        onClick={() => {
          const t = val.trim();
          if (t) onAdd(t);
          setVal('');
        }}
      >
        Add
      </Button>
    </div>
  );
}
