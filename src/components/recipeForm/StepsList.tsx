import React from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import type {FieldArrayRenderProps} from 'formik';

type FieldChangeEvent = React.ChangeEvent<
  HTMLInputElement | HTMLTextAreaElement
>;

type Props = {
  steps: string[];
  handleChange: (e: FieldChangeEvent) => void;
  arrayHelpers: FieldArrayRenderProps;
  getStepError: (index: number) => string | undefined;
  showErrors: boolean;
};

export default function StepsList({
  steps,
  handleChange,
  arrayHelpers,
  getStepError,
  showErrors,
}: Props) {
  return (
    <div>
      {steps.map((st, i) => (
        <div key={i} className='step-row flex items-center space-x-3'>
          <div className='flex-1'>
            <label
              htmlFor={`steps.${i}`}
              className='block text-sm font-medium mb-1'
            >
              Step {i + 1}
            </label>
            <Input
              id={`steps.${i}`}
              name={`steps.${i}`}
              className='w-full'
              placeholder={`Step ${i + 1}`}
              value={st}
              onChange={handleChange}
            />
            {showErrors && getStepError(i) && (
              <div className='text-red-600 text-sm mt-1'>{getStepError(i)}</div>
            )}
          </div>
          <div className='row-actions pt-6'>
            {i > 0 && (
              <Button
                type='button'
                className='btn-ghost remove-btn'
                onClick={() => arrayHelpers.remove(i)}
                aria-label={`Remove step ${i + 1}`}
                title='Remove step'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='16'
                  height='16'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  aria-hidden='true'
                >
                  <line x1='18' y1='6' x2='6' y2='18' />
                  <line x1='6' y1='6' x2='18' y2='18' />
                </svg>
              </Button>
            )}
          </div>
        </div>
      ))}

      <Button
        type='button'
        className='text-sm btn-ghost add-btn'
        onClick={() => arrayHelpers.push('')}
        aria-label='Add step'
      >
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='16'
          height='16'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
          aria-hidden='true'
        >
          <line x1='12' y1='5' x2='12' y2='19' />
          <line x1='5' y1='12' x2='19' y2='12' />
        </svg>
        <span className='responsive-label ml-2'>Add step</span>
      </Button>
    </div>
  );
}
