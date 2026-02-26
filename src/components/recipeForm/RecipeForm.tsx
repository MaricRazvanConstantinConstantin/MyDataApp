import {useState} from 'react';
import type {Recipe} from '../../utils/types/recipe';
import type {Ingredient} from '../../utils/types/ingredient';
import {useAppDispatch} from '../../store/hooks';
import {addRecipe, updateRecipe} from '../../store/recipesSlice';
import Card from '../ui/Card';
import Button from '../ui/Button';
import RecipeMeta from './RecipeMeta';
import IngredientsList from './IngredientsList';
import StepsList from './StepsList';
import {
  Formik,
  Form,
  FieldArray,
  type FormikHelpers,
  type FormikProps,
  type FieldArrayRenderProps,
  type FormikErrors,
} from 'formik';
import {useToast} from '../../context/hooks';

type Props = {
  initial?: Partial<Recipe> | null;
  onCancel: () => void;
  onSaved?: (r: Recipe) => void;
};

type FormValues = {
  title: string;
  description: string;
  category: string;
  prep_time: string;
  cook_time: string;
  servings: string;
  tags: string[];
  ingredients: Ingredient[];
  steps: string[];
};

export default function RecipeForm({initial = null, onCancel, onSaved}: Props) {
  const dispatch = useAppDispatch();
  const [error, setError] = useState<string | null>(null);
  const {showToast} = useToast();

  const initialValues: FormValues = {
    title: initial?.title ?? '',
    description: initial?.description ?? '',
    category: initial?.category ?? '',
    prep_time: initial?.prep_time != null ? String(initial.prep_time) : '',
    cook_time: initial?.cook_time != null ? String(initial.cook_time) : '',
    servings: initial?.servings != null ? String(initial.servings) : '',
    tags: Array.isArray(initial?.tags) ? (initial!.tags as string[]) : [],
    ingredients: Array.isArray(initial?.ingredients)
      ? (initial!.ingredients as Ingredient[])
      : [{name: '', quantity: ''}],
    steps: Array.isArray(initial?.steps)
      ? (initial!.steps as Array<string | {step: string}>).map((s) =>
          typeof s === 'string' ? s : s.step,
        )
      : [''],
  };

  function validate(values: FormValues): FormikErrors<FormValues> {
    const errors: FormikErrors<FormValues> = {};

    if (!values.title || !values.title.trim())
      errors.title = 'Title is required';
    if (!values.category || !values.category.trim())
      errors.category = 'Category is required';
    if (!values.description || !values.description.trim())
      errors.description = 'Description is required';

    if (!values.tags || values.tags.length === 0)
      errors.tags = 'Add at least one tag';

    const numFields: Array<
      keyof Pick<FormValues, 'prep_time' | 'cook_time' | 'servings'>
    > = ['prep_time', 'cook_time', 'servings'];
    for (const k of numFields) {
      const v = values[k];
      const key = k as keyof FormikErrors<FormValues>;
      if (v === undefined || v === null || String(v).trim() === '') {
        errors[key] = `${k.replace('_', ' ')} is required`;
      } else if (
        Number.isNaN(Number(v)) ||
        !Number.isFinite(Number(v)) ||
        Number(v) < 0
      ) {
        errors[key] = `${k.replace('_', ' ')} must be a non-negative number`;
      }
    }

    if (!Array.isArray(values.ingredients) || values.ingredients.length === 0) {
      errors.ingredients = 'Add at least one ingredient';
    } else {
      const ingErrs: Array<FormikErrors<Ingredient>> = [];
      values.ingredients.forEach((ing, i) => {
        const ie: {name?: string; quantity?: string} = {};
        if (!ing || !ing.name || !ing.name.trim()) ie.name = 'Name is required';
        if (!ing || !ing.quantity || !ing.quantity.trim())
          ie.quantity = 'Quantity is required';
        ingErrs[i] = Object.keys(ie).length
          ? (ie as FormikErrors<Ingredient>)
          : ({} as FormikErrors<Ingredient>);
      });
      if (ingErrs.some((entry) => Object.keys(entry).length > 0))
        errors.ingredients = ingErrs;
    }

    if (!Array.isArray(values.steps) || values.steps.length === 0) {
      errors.steps = 'Add at least one step';
    } else {
      const stepErrs: Array<string> = [];
      values.steps.forEach((st, i) => {
        stepErrs[i] = !st || !st.trim() ? 'Step is required' : '';
      });
      if (stepErrs.some((s) => s && s.trim())) errors.steps = stepErrs;
    }

    return errors;
  }

  async function handleSubmit(
    values: FormValues,
    helpers: FormikHelpers<FormValues>,
  ) {
    setError(null);
    const payload: Partial<Recipe> = {
      title: values.title.trim(),
      description: values.description.trim() || null,
      category: values.category.trim() || null,
      prep_time: values.prep_time ? Number(values.prep_time) : null,
      cook_time: values.cook_time ? Number(values.cook_time) : null,
      servings: values.servings ? Number(values.servings) : null,
      tags: values.tags,
      ingredients: values.ingredients.filter((it) => it.name && it.name.trim()),
      steps: values.steps.filter((s) => s && s.trim()),
    };

    try {
      if (initial && initial.id) {
        const res = await dispatch(
          updateRecipe({id: initial.id, changes: payload}),
        ).unwrap();
        onSaved?.(res);
      } else {
        const res = await dispatch(addRecipe(payload)).unwrap();
        onSaved?.(res);
      }
      onCancel();
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? (err as Error).message
          : String(err);
      setError(message);
      try {
        showToast(message, 'error');
      } catch (err) {
        console.warn('showToast failed', err);
      }
    } finally {
      helpers.setSubmitting(false);
    }
  }

  return (
    <Card className='p-6 max-w-3xl mx-auto'>
      <Formik
        initialValues={initialValues}
        validate={validate}
        onSubmit={handleSubmit}
      >
        {(formik: FormikProps<FormValues>) => {
          const {
            values,
            handleChange,
            setFieldValue,
            isSubmitting,
            submitCount,
            errors,
          } = formik;
          const showErrors = submitCount > 0;
          function getFieldError<K extends keyof FormValues>(
            key: K,
          ): string | undefined {
            const v = errors[key];
            return typeof v === 'string' ? v : undefined;
          }

          type IngredientErrorEntry =
            | {name?: string; quantity?: string}
            | string
            | undefined;
          const getIngredientError = (
            index: number,
            field: 'name' | 'quantity',
          ): string | undefined => {
            const ingErr = errors.ingredients;
            if (Array.isArray(ingErr)) {
              const entry = ingErr[index] as IngredientErrorEntry;
              if (entry && typeof entry === 'object')
                return (entry as {[k: string]: string})[field];
            }
            return undefined;
          };

          const getStepError = (index: number): string | undefined => {
            const sErr = errors.steps;
            if (Array.isArray(sErr)) return sErr[index] as string | undefined;
            return undefined;
          };

          return (
            <Form className='space-y-3'>
              {error && <div className='text-red-600 mb-2'>{error}</div>}
              <div className='form-header'>
                <h2 className='text-2xl font-semibold'>
                  {initial ? 'Edit recipe' : 'New recipe'}
                </h2>
                <p className='text-muted text-sm mt-1'>
                  Add details, ingredients and steps below.
                </p>
              </div>

              <div className='grid grid-cols-1 gap-2'>
                <div className='form-section'>
                  <RecipeMeta
                    values={{
                      title: values.title,
                      category: values.category,
                      description: values.description,
                      prep_time: values.prep_time,
                      cook_time: values.cook_time,
                      servings: values.servings,
                      tags: values.tags,
                    }}
                    handleChange={handleChange}
                    setFieldValue={setFieldValue}
                    getFieldError={getFieldError}
                    showErrors={showErrors}
                  />
                </div>

                <div className='form-section'>
                  <label className='block text-sm font-medium mb-2'>
                    Ingredients
                  </label>
                  <div className='space-y-2'>
                    <FieldArray name='ingredients'>
                      {(arrayHelpers: FieldArrayRenderProps) => (
                        <IngredientsList
                          ingredients={values.ingredients}
                          handleChange={handleChange}
                          arrayHelpers={arrayHelpers}
                          getIngredientError={getIngredientError}
                          showErrors={showErrors}
                        />
                      )}
                    </FieldArray>
                  </div>
                </div>

                <div className='form-section'>
                  <label className='block text-sm font-medium mb-2'>
                    Steps
                  </label>
                  <div className='space-y-2'>
                    <FieldArray name='steps'>
                      {(arrayHelpers: FieldArrayRenderProps) => (
                        <StepsList
                          steps={values.steps}
                          handleChange={handleChange}
                          arrayHelpers={arrayHelpers}
                          getStepError={getStepError}
                          showErrors={showErrors}
                        />
                      )}
                    </FieldArray>
                  </div>
                </div>

                <div className='form-actions'>
                  <Button
                    type='submit'
                    variant='primary'
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Saving…' : 'Save recipe'}
                  </Button>
                  <Button
                    type='button'
                    variant='ghost'
                    className='px-4'
                    onClick={onCancel}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </Form>
          );
        }}
      </Formik>
    </Card>
  );
}
