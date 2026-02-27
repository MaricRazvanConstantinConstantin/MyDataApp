import {useEffect, useState} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import {selectRecipeById} from '../store/recipesSlice';
import {fetchRecipeById} from '../store/recipesSlice';

import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import placeholderForTitle from '../utils/placeholder';
import type {Recipe} from '../utils/types/recipe';
import {deleteRecipe} from '../store/recipesSlice';
import {useToast} from '../context/hooks';
import {getJson, setJson} from '../utils/storage';
import ReviewsList from '../components/ReviewsList';
import StepTimerBar from '../components/timer/StepTimerBar';
import AddTimerButton from '../components/timer/AddTimerButton';
import type {Timer} from '../utils/types/timer';

type ChecksState = {
  ingredients: boolean[];
  steps: boolean[];
};

export default function RecipeDetail() {
  const {id} = useParams();
  const navigate = useNavigate();
  const recipe = useAppSelector((s) =>
    selectRecipeById(s, id),
  ) as Recipe | null;
  const {isAdmin} = useAppSelector((s) => s.auth);
  const dispatch = useAppDispatch();
  const {showToast} = useToast();

  const loading = useAppSelector((s) => s.recipes.loading);

  const [storedChecks, setStoredChecks] = useState<ChecksState>(() =>
    getJson<ChecksState>(`recipe-checks-${id ?? 'unknown'}`, {
      ingredients: [],
      steps: [],
    }),
  );

  const checks: ChecksState = (function deriveChecks() {
    const ingLen = recipe?.ingredients.length ?? 0;
    const stepsLen = recipe?.steps.length ?? 0;

    const ingredients = Array.isArray(storedChecks.ingredients)
      ? [...storedChecks.ingredients]
      : [];
    while (ingredients.length < ingLen) ingredients.push(false);
    ingredients.length = ingLen;

    const steps = Array.isArray(storedChecks.steps)
      ? [...storedChecks.steps]
      : [];
    while (steps.length < stepsLen) steps.push(false);
    steps.length = stepsLen;

    return {ingredients, steps};
  })();

  const timers = useAppSelector((s) => s.timers.items as Timer[]);

  useEffect(() => {
    if (!id) return;
    setJson(`recipe-checks-${id}`, storedChecks);
  }, [storedChecks, id]);

  useEffect(() => {
    if (!id) return;
    if (!recipe && !loading) {
      void dispatch(fetchRecipeById(id));
    }
  }, [dispatch, id, recipe, loading]);

  useEffect(() => {
    function onChecksUpdated(e: Event) {
      const rid = (e as CustomEvent)?.detail?.recipeId ?? id;
      if (!rid || String(rid) !== String(id)) return;
      setStoredChecks(() =>
        getJson(`recipe-checks-${id ?? 'unknown'}`, {
          ingredients: [],
          steps: [],
        }),
      );
    }
    window.addEventListener(
      'recipe-checks-updated',
      onChecksUpdated as EventListener,
    );
    return () =>
      window.removeEventListener(
        'recipe-checks-updated',
        onChecksUpdated as EventListener,
      );
  }, [id]);

  if (!recipe) {
    if (loading) {
      return (
        <div className='w-full flex items-center justify-center min-h-[60vh] py-8'>
          <Card className='card'>
            <div className='p-6 flex items-center gap-4'>
              <Spinner size={36} />
              <div className='text-lg font-semibold'>Loading recipe…</div>
            </div>
          </Card>
        </div>
      );
    }

    return (
      <div className='w-full flex items-center justify-center min-h-[60vh] py-8'>
        <Card className='card'>
          <div className='p-4'>
            <div className='text-lg font-semibold mb-2'>Recipe not found</div>
            <div className='flex space-x-2'>
              <Button onClick={() => navigate('/recipes')}>Back</Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  function toggleIngredient(i: number) {
    setStoredChecks((c) => {
      const ingredients = Array.isArray(c.ingredients)
        ? [...c.ingredients]
        : [];
      while (ingredients.length <= i) ingredients.push(false);
      ingredients[i] = !ingredients[i];
      return {...c, ingredients};
    });
  }

  function toggleStep(i: number) {
    setStoredChecks((c) => {
      const steps = Array.isArray(c.steps) ? [...c.steps] : [];
      while (steps.length <= i) steps.push(false);
      steps[i] = !steps[i];
      return {...c, steps};
    });
  }

  function CheckToggle({
    checked,
    onToggle,
    id,
    ariaLabel,
  }: {
    checked: boolean;
    onToggle: () => void;
    id?: string;
    ariaLabel?: string;
  }) {
    return (
      <button
        id={id}
        type='button'
        aria-pressed={checked}
        aria-label={ariaLabel}
        onClick={onToggle}
        className='mr-3 inline-flex items-center justify-center'
        style={{
          width: 22,
          height: 22,
          border: '1px solid var(--border)',
          background: checked ? 'var(--primary)' : 'transparent',
          color: checked ? 'var(--primary-foreground)' : 'var(--muted)',
          borderRadius: '50%',
          padding: 0,
        }}
      >
        {checked ? (
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            width='14'
            height='14'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            aria-hidden='true'
          >
            <polyline points='20 6 9 17 4 12' />
          </svg>
        ) : (
          <span style={{width: 14, height: 14}} />
        )}
      </button>
    );
  }

  return (
    <div className='w-full flex items-center justify-center min-h-[60vh] py-8'>
      <div className='w-full max-w-3xl'>
        <div className='flex justify-between items-start mb-4'>
          <div>
            <h2 className='text-2xl font-bold'>{recipe.title}</h2>
            <div className='text-sm text-muted'>
              {(() => {
                const parts: string[] = [];
                if (recipe.category) parts.push(recipe.category);
                if (recipe.prep_time != null)
                  parts.push(`${recipe.prep_time}m prep`);
                if (recipe.cook_time != null)
                  parts.push(`${recipe.cook_time}m cook`);
                parts.push(`${recipe.servings ?? '-'} servings`);
                return parts.join(' • ');
              })()}
            </div>
          </div>
          <div className='space-x-2'>
            <Button
              variant='ghost'
              onClick={() => navigate('/recipes')}
              aria-label='Back to recipes'
              title='Back'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                width='18'
                height='18'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
                aria-hidden
              >
                <path d='M19 12H6' />
                <path d='M12 5l-7 7 7 7' />
              </svg>
            </Button>
            {isAdmin && (
              <>
                <Button
                  onClick={() => navigate(`/recipes/${recipe.id}/edit`)}
                  aria-label='Edit recipe'
                  title='Edit'
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 24 24'
                    width='18'
                    height='18'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    aria-hidden
                  >
                    <path d='M12 20h9' />
                    <path d='M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4 12.5-12.5z' />
                  </svg>
                </Button>
                <Button
                  variant='ghost'
                  onClick={async () => {
                    const ok = window.confirm('Delete this recipe?');
                    if (!ok) return;
                    try {
                      await dispatch(deleteRecipe(recipe.id)).unwrap();
                      navigate('/recipes');
                    } catch (err) {
                      const msg =
                        err && typeof err === 'object' && 'message' in err
                          ? (err as Error).message
                          : String(err);
                      showToast(msg, 'error');
                      console.error('Delete failed', err);
                    }
                  }}
                  aria-label='Delete recipe'
                  title='Delete'
                  style={{color: 'var(--accent)'}}
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 24 24'
                    width='18'
                    height='18'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    aria-hidden
                  >
                    <polyline points='3 6 5 6 21 6' />
                    <path d='M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6' />
                    <path d='M10 11v6' />
                    <path d='M14 11v6' />
                    <path d='M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2' />
                  </svg>
                </Button>
              </>
            )}
          </div>
        </div>

        <img
          src={recipe.image_url ?? placeholderForTitle(recipe.title)}
          alt={recipe.title}
          className='w-full h-56 object-cover rounded mb-4'
        />

        <Card className='mb-4'>
          <div>
            {recipe.description && (
              <p className='text-sm text-muted mb-3'>{recipe.description}</p>
            )}

            <div className='mb-3'>
              {(recipe.tags || []).map((t) => (
                <span key={t} className='chip m-1'>
                  {t}
                </span>
              ))}
            </div>

            <div className='grid grid-cols-1 gap-4'>
              <div>
                <h3 className='font-semibold mb-2'>Ingredients</h3>
                <ul>
                  {recipe.ingredients.map((ing, i) => {
                    const iid = `ingredient-${recipe.id ?? 'r'}-${i}`;
                    return (
                      <li key={i} className='flex items-start mb-2'>
                        <CheckToggle
                          id={iid}
                          checked={!!checks.ingredients[i]}
                          onToggle={() => toggleIngredient(i)}
                          ariaLabel={`Mark ingredient ${ing.name} as done`}
                        />
                        <div>
                          <div
                            role='button'
                            tabIndex={0}
                            onClick={() => toggleIngredient(i)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                toggleIngredient(i);
                              }
                            }}
                            className={
                              checks.ingredients[i]
                                ? 'line-through cursor-pointer'
                                : 'cursor-pointer'
                            }
                          >
                            {ing.name}
                            {ing.quantity ? ` — ${ing.quantity}` : ''}
                          </div>
                          {ing.notes ? (
                            <div className='text-xs text-muted'>
                              {ing.notes}
                            </div>
                          ) : null}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div>
                <h3 className='font-semibold mb-2'>Steps</h3>
                <ol className='list-decimal pl-5'>
                  {recipe.steps.map((s, i) => {
                    const stepText = typeof s === 'string' ? s : s.step;
                    const note = typeof s === 'string' ? undefined : s.note;
                    const sid = `step-${recipe.id ?? 'r'}-${i}`;
                    const match = timers.find((t) => {
                      if (t.recipeId == null && recipe.id == null)
                        return t.stepIndex === i;
                      return (
                        String(t.recipeId) === String(recipe.id) &&
                        t.stepIndex === i
                      );
                    });
                    return (
                      <li key={i} className='mb-3'>
                        <div className='flex items-start'>
                          <CheckToggle
                            id={sid}
                            checked={!!checks.steps[i]}
                            onToggle={() => toggleStep(i)}
                            ariaLabel={`Mark step ${i + 1} as done`}
                          />
                          <div className='flex-1'>
                            <div
                              role='button'
                              tabIndex={0}
                              onClick={() => toggleStep(i)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  toggleStep(i);
                                }
                              }}
                              className={
                                checks.steps[i]
                                  ? 'line-through cursor-pointer'
                                  : 'cursor-pointer'
                              }
                            >
                              {stepText}
                            </div>
                            {note ? (
                              <div className='text-xs text-muted'>{note}</div>
                            ) : null}
                            {/* if a timer exists for this step, show the bar under the step */}
                            {match ? (
                              <div className='mt-2'>
                                <StepTimerBar
                                  recipeId={recipe.id}
                                  stepIndex={i}
                                  label={`${recipe.title} — ${stepText}`}
                                />
                              </div>
                            ) : null}
                          </div>
                          {/* if no timer exists, show the add button to the right */}
                          {!match ? (
                            <div className='ml-3'>
                              <AddTimerButton
                                recipeId={recipe.id}
                                stepIndex={i}
                                label={`${recipe.title} — ${stepText}`}
                              />
                            </div>
                          ) : null}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </div>
          </div>
        </Card>
        <ReviewsList recipeId={recipe.id} />
      </div>
    </div>
  );
}
