import React, {useEffect, useMemo, useState} from 'react';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import {fetchReviews, addReview} from '../store/reviewsSlice';
import type {Review} from '../utils/types/review';
import Button from './ui/Button';
import Card from './ui/Card';
import Input from './ui/Input';

function Stars({value, size = 14}: {value: number; size?: number}) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    const filled = i <= Math.round(value);
    stars.push(
      <svg
        key={i}
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
      </svg>,
    );
  }
  return (
    <span
      className='inline-flex items-center space-x-1'
      style={{fontSize: `${size}px`}}
    >
      {stars}
    </span>
  );
}

export default function ReviewsList({recipeId}: {recipeId: string}) {
  const dispatch = useAppDispatch();
  const state = useAppSelector((s) => s.reviews);
  const reviews: Review[] = useMemo(
    () => state.byRecipe?.[recipeId] ?? [],
    [state.byRecipe, recipeId],
  );
  const loading = !!state.loading;

  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (recipeId) dispatch(fetchReviews(recipeId));
  }, [dispatch, recipeId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!recipeId || !content.trim()) return;
    setSubmitting(true);
    try {
      await dispatch(
        addReview({recipeId, author: name || undefined, rating, content}),
      ).unwrap();
      setName('');
      setRating(5);
      setContent('');
    } catch (err) {
      console.warn('Failed to submit review', err);
    } finally {
      setSubmitting(false);
    }
  }

  const average = useMemo(() => {
    if (!reviews || reviews.length === 0) return null;
    const avg =
      reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length;
    return Math.round(avg * 10) / 10;
  }, [reviews]);

  return (
    <Card className='mt-4'>
      <div>
        <div className='flex items-center justify-between mb-4 gap-4 flex-wrap'>
          <h3 className='font-semibold text-lg'>Reviews</h3>
          {average ? (
            <div className='flex items-center space-x-3 text-sm'>
              <Stars value={average} size={16} />
              <div className='text-muted'>{average} / 5</div>
            </div>
          ) : (
            <div className='text-sm text-muted'>No reviews yet</div>
          )}
        </div>

        <form onSubmit={handleSubmit} className='mb-4 space-y-3'>
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-2'>
            <div className='sm:col-span-2'>
              <Input
                placeholder='Your name (optional)'
                value={name}
                onChange={(e) => setName(e.target.value)}
                className='w-full'
              />
            </div>
            <div className='flex items-center sm:justify-end'>
              <label htmlFor={`rating-select-${recipeId}`} className='sr-only'>
                Rating
              </label>
              <select
                id={`rating-select-${recipeId}`}
                value={String(rating)}
                onChange={(e) => setRating(Number(e.target.value))}
                className='input w-20'
                aria-label='Rating'
              >
                <option value='5'>5</option>
                <option value='4'>4</option>
                <option value='3'>3</option>
                <option value='2'>2</option>
                <option value='1'>1</option>
              </select>
            </div>
          </div>

          <textarea
            id='review-content'
            placeholder='Write a short review'
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className='input w-full min-h-24'
          />

          <div className='flex justify-end'>
            <Button
              type='submit'
              className='w-full sm:w-auto'
              disabled={submitting || !content.trim()}
            >
              {submitting ? 'Posting…' : 'Post review'}
            </Button>
          </div>
        </form>

        <div className='space-y-3 reviews-list'>
          {loading ? (
            <div>Loading reviews…</div>
          ) : reviews.length === 0 ? (
            <div className='text-sm text-muted'>
              No reviews yet. Be the first!
            </div>
          ) : (
            reviews.map((r) => (
              <article key={r.id} className='p-3 rounded'>
                <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2'>
                  <div>
                    <div className='font-medium'>{r.author || 'Guest'}</div>
                    <div className='text-xs text-muted'>
                      {new Date(r.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div className='flex items-center'>
                    <Stars value={r.rating || 0} />
                  </div>
                </div>
                {r.content ? (
                  <div className='mt-2 text-sm'>{r.content}</div>
                ) : null}
              </article>
            ))
          )}
        </div>
      </div>
    </Card>
  );
}
