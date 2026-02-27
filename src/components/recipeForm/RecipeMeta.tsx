import React from 'react';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import TagInput from './TagInput';
import placeholderForTitle from '../../utils/placeholder';

type MetaValues = {
  title: string;
  category: string;
  description: string;
  image_url: string;
  prep_time: string;
  cook_time: string;
  servings: string;
  tags: string[];
};

type FieldChangeEvent = React.ChangeEvent<
  HTMLInputElement | HTMLTextAreaElement
>;

type SetFieldValueFn = (
  field: string,
  value:
    | string
    | number
    | boolean
    | string[]
    | Array<Record<string, string | number | boolean>>,
  shouldValidate?: boolean,
) => void;

type Props = {
  values: MetaValues;
  handleChange: (e: FieldChangeEvent) => void;
  setFieldValue: SetFieldValueFn;
  getFieldError: <K extends keyof MetaValues>(k: K) => string | undefined;
  showErrors: boolean;
};

export default function RecipeMeta({
  values,
  handleChange,
  setFieldValue,
  getFieldError,
  showErrors,
}: Props) {
  const previewSrc =
    values.image_url && values.image_url.trim()
      ? values.image_url.trim()
      : placeholderForTitle(values.title);
  return (
    <>
      <div>
        <label htmlFor='title' className='block text-sm font-medium mb-1'>
          Title
        </label>
        <Input
          id='title'
          name='title'
          className='w-full'
          placeholder='Title'
          value={values.title}
          onChange={handleChange}
        />
        {showErrors && getFieldError('title') && (
          <div className='text-red-600 text-sm mt-1'>
            {getFieldError('title')}
          </div>
        )}
      </div>

      <div>
        <label htmlFor='category' className='block text-sm font-medium mb-1'>
          Category
        </label>
        <Input
          id='category'
          name='category'
          className='w-full'
          placeholder='Category'
          value={values.category}
          onChange={handleChange}
        />
        {showErrors && getFieldError('category') && (
          <div className='text-red-600 text-sm mt-1'>
            {getFieldError('category')}
          </div>
        )}
      </div>

      <div>
        <label htmlFor='description' className='block text-sm font-medium mb-1'>
          Short description
        </label>
        <Textarea
          id='description'
          name='description'
          className='w-full'
          placeholder='Short description'
          value={values.description}
          onChange={handleChange}
        />
        {showErrors && getFieldError('description') && (
          <div className='text-red-600 text-sm mt-1'>
            {getFieldError('description')}
          </div>
        )}
      </div>

      <div>
        <label htmlFor='image_url' className='block text-sm font-medium mb-1'>
          Image URL (optional)
        </label>
        <Input
          id='image_url'
          name='image_url'
          className='w-full'
          placeholder='https://example.com/photo.jpg'
          value={values.image_url}
          onChange={handleChange}
        />
        {showErrors && getFieldError('image_url') && (
          <div className='text-red-600 text-sm mt-1'>
            {getFieldError('image_url')}
          </div>
        )}
      </div>
      <div className='mt-2'>
        <label className='block text-sm font-medium mb-1'>Preview</label>
        <div
          className='w-full h-40 bg-gray-50 rounded overflow-hidden border'
          aria-hidden
        >
          <img
            src={previewSrc}
            alt={values.title || 'Recipe image preview'}
            className='w-full h-full object-cover'
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = placeholderForTitle(
                values.title,
              );
            }}
          />
        </div>
      </div>

      <div>
        <div className='flex flex-wrap gap-2 mb-2'>
          {values.tags.map((t, i) => (
            <span key={i} className='chip'>
              <span className='text-sm text-muted'>{t}</span>
              <button
                type='button'
                className='text-xs ml-2'
                aria-label={`Remove tag ${t}`}
                onClick={() =>
                  setFieldValue(
                    'tags',
                    values.tags.filter((_, idx) => idx !== i),
                  )
                }
              >
                ✕
              </button>
            </span>
          ))}
        </div>
        <div>
          <label className='block text-sm font-medium mb-1'>Tags</label>
          <TagInput
            onAdd={(t) =>
              setFieldValue('tags', Array.from(new Set([...values.tags, t])))
            }
          />
          {showErrors && getFieldError('tags') && (
            <div className='text-red-600 text-sm mt-1'>
              {getFieldError('tags')}
            </div>
          )}
        </div>
      </div>

      <div className='flex flex-col sm:flex-row sm:space-x-2'>
        <div className='w-1/3'>
          <label htmlFor='prep_time' className='block text-sm font-medium mb-1'>
            Prep time (min)
          </label>
          <Input
            id='prep_time'
            name='prep_time'
            className='w-full'
            placeholder='Prep time (min)'
            value={values.prep_time}
            onChange={handleChange}
          />
          {showErrors && getFieldError('prep_time') && (
            <div className='text-red-600 text-sm mt-1'>
              {getFieldError('prep_time')}
            </div>
          )}
        </div>
        <div className='w-1/3'>
          <label htmlFor='cook_time' className='block text-sm font-medium mb-1'>
            Cook time (min)
          </label>
          <Input
            id='cook_time'
            name='cook_time'
            className='w-full'
            placeholder='Cook time (min)'
            value={values.cook_time}
            onChange={handleChange}
          />
          {showErrors && getFieldError('cook_time') && (
            <div className='text-red-600 text-sm mt-1'>
              {getFieldError('cook_time')}
            </div>
          )}
        </div>
        <div className='w-1/3'>
          <label htmlFor='servings' className='block text-sm font-medium mb-1'>
            Servings
          </label>
          <Input
            id='servings'
            name='servings'
            className='w-full'
            placeholder='Servings'
            value={values.servings}
            onChange={handleChange}
          />
          {showErrors && getFieldError('servings') && (
            <div className='text-red-600 text-sm mt-1'>
              {getFieldError('servings')}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
