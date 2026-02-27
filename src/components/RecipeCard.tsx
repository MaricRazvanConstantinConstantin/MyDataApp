import {memo, useEffect, useMemo} from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import placeholderForTitle from '../utils/placeholder';
import type {Recipe} from '../utils/types/recipe';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import {fetchReviews, selectReviewsByRecipe} from '../store/reviewsSlice';

type Props = {
  recipe: Recipe;
  isAdmin?: boolean;
  onEdit?: (r: Recipe) => void;
  onDelete?: (id: string) => void;
  onOpen?: (r: Recipe) => void;
};

function RecipeCard({recipe, isAdmin, onEdit, onDelete, onOpen}: Props) {
  const dispatch = useAppDispatch();
  const reviewsByRecipe = useAppSelector((s) => s.reviews.byRecipe);
  const reviews = useAppSelector((s) => selectReviewsByRecipe(s, recipe.id));

  useEffect(() => {
    if (!recipe?.id) return;
    if (!(recipe.id in (reviewsByRecipe || {}))) {
      void dispatch(fetchReviews(recipe.id));
    }
  }, [dispatch, recipe?.id, reviewsByRecipe]);

  const average = useMemo(() => {
    if (!reviews || reviews.length === 0) return null;
    const avg =
      reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length;
    return Math.round(avg * 10) / 10;
  }, [reviews]);

  const prep = recipe.prep_time ?? 0;
  const cook = recipe.cook_time ?? 0;
  const total = prep + cook;
  return (
    <Card
      className={['list-item', onOpen ? 'cursor-pointer' : ''].join(' ')}
      role='article'
      aria-labelledby={`recipe-title-${recipe.id}`}
      onClick={() => onOpen?.(recipe)}
    >
      <div className='space-x-4'>
        <div className='flex flex-row gap-2'>
          <img
            src={recipe.image_url ?? placeholderForTitle(recipe.title)}
            alt={recipe.title}
            className='w-28 h-20 object-cover rounded'
          />
          <div className='min-w-0'>
            <h3
              id={`recipe-title-${recipe.id}`}
              className='text-lg font-medium text-primary'
            >
              {recipe.title}
            </h3>
            <div className='text-sm text-muted flex gap-3'>
              <div>
                {recipe.category || '-'} • {recipe.servings ?? '-'} servings •{' '}
                {total > 0 ? (
                  <>
                    {total} min total ({prep} prep • {cook} cook)
                  </>
                ) : (
                  '-'
                )}
              </div>
              {reviews.length > 0 ? (
                <div
                  className='inline-flex items-center gap-2 text-sm'
                  role='img'
                  aria-label={`${average} out of 5`}
                >
                  <div className='inline-flex items-center gap-1'>
                    {Array.from({length: 5}, (_, i) => {
                      const idx = i + 1;
                      const filled = idx <= Math.round(Number(average));
                      return (
                        <svg
                          key={idx}
                          xmlns='http://www.w3.org/2000/svg'
                          viewBox='0 0 24 24'
                          width='1em'
                          height='1em'
                          fill={filled ? 'currentColor' : 'none'}
                          stroke='currentColor'
                          strokeWidth='1.2'
                          className={filled ? 'text-yellow-500' : 'text-muted'}
                          aria-hidden='true'
                        >
                          <path d='M12 .587l3.668 7.431L24 9.748l-6 5.84 1.416 8.267L12 19.771 4.584 23.855 6 15.588 0 9.748l8.332-1.73z' />
                        </svg>
                      );
                    })}
                  </div>
                  <span className='text-sm text-muted'>({reviews.length})</span>
                </div>
              ) : (
                <div className='text-sm text-muted'>No reviews yet</div>
              )}
            </div>
          </div>
        </div>
        <div className='flex flex-row justify-between items-start align-bottom'>
          <div>
            {recipe.description && (
              <p className='mt-2 text-sm text-muted'>{recipe.description}</p>
            )}

            <div className='mt-2 text-xs'>
              {(() => {
                const tags = recipe.tags || [];
                const visible = tags.slice(0, 5);
                const remaining = tags.length - visible.length;
                return (
                  <>
                    {visible.map((t, i) => (
                      <span key={`${t}-${i}`} className='chip mr-2'>
                        {t}
                      </span>
                    ))}
                    {remaining > 0 && (
                      <span
                        className='chip mr-2'
                        aria-label={`and ${remaining} more tags`}
                      >
                        +{remaining}
                      </span>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
          {isAdmin && (
            <div className='card-actions flex flex-row justify-center align-bottom space-x-2'>
              <Button
                variant='ghost'
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.(recipe);
                }}
                aria-label={`Edit ${recipe.title}`}
                style={{color: 'var(--primary)'}}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 24 24'
                  width='16'
                  height='16'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='1.5'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  aria-hidden='true'
                >
                  <path d='M12 20h9' />
                  <path d='M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4 12.5-12.5z' />
                </svg>
                <span className='sr-only'>Edit</span>
              </Button>

              <Button
                variant='ghost'
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(recipe.id);
                }}
                aria-label={`Delete ${recipe.title}`}
                style={{color: 'var(--accent)'}}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 24 24'
                  width='16'
                  height='16'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='1.5'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  aria-hidden='true'
                >
                  <polyline points='3 6 5 6 21 6' />
                  <path d='M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6' />
                  <path d='M10 11v6' />
                  <path d='M14 11v6' />
                  <path d='M9 6V4a2 2 0 012-2h2a2 2 0 012 2v2' />
                </svg>
                <span className='sr-only'>Delete</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
export default memo(RecipeCard);
