import React from 'react';
import type {Ingredient} from '../../utils/types/ingredient';
import Input from '../ui/Input';
import Button from '../ui/Button';
import type {FieldArrayRenderProps} from 'formik';

type FieldChangeEvent = React.ChangeEvent<
  HTMLInputElement | HTMLTextAreaElement
>;

type Props = {
  ingredients: Ingredient[];
  handleChange: (e: FieldChangeEvent) => void;
  arrayHelpers: FieldArrayRenderProps;
  getIngredientError: (
    index: number,
    field: 'name' | 'quantity',
  ) => string | undefined;
  showErrors: boolean;
};

export default function IngredientsList({
  ingredients,
  handleChange,
  arrayHelpers,
  getIngredientError,
  showErrors,
}: Props) {
  return (
    <div>
      {ingredients.map((ing, i) => (
        <div key={i} className='ingredient-row flex space-x-3 items-start'>
          <div className='flex-1'>
            <label
              htmlFor={`ingredients.${i}.name`}
              className='block text-sm font-medium mb-1'
            >
              Ingredient name
            </label>
            <Input
              id={`ingredients.${i}.name`}
              name={`ingredients.${i}.name`}
              className='w-full'
              placeholder='Ingredient name'
              value={ing.name}
              onChange={handleChange}
            />
            {showErrors && getIngredientError(i, 'name') && (
              <div className='text-red-600 text-sm mt-1'>
                {getIngredientError(i, 'name')}
              </div>
            )}
          </div>
          <div className='w-1/3'>
            <label
              htmlFor={`ingredients.${i}.quantity`}
              className='block text-sm font-medium mb-1'
            >
              Quantity
            </label>
            <Input
              id={`ingredients.${i}.quantity`}
              name={`ingredients.${i}.quantity`}
              className='w-full'
              placeholder='Quantity'
              value={ing.quantity ?? ''}
              onChange={handleChange}
            />
            {showErrors && getIngredientError(i, 'quantity') && (
              <div className='text-red-600 text-sm mt-1'>
                {getIngredientError(i, 'quantity')}
              </div>
            )}
          </div>
          <div className='row-actions pt-6'>
            {i > 0 && (
              <Button
                type='button'
                className='btn-ghost remove-btn'
                onClick={() => arrayHelpers.remove(i)}
                aria-label={`Remove ingredient ${i + 1}`}
                title='Remove ingredient'
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
        onClick={() => arrayHelpers.push({name: '', quantity: ''})}
        aria-label='Add ingredient'
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
        <span className='responsive-label ml-2'>Add ingredient</span>
      </Button>
    </div>
  );
}
