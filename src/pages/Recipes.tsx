import {useEffect, useMemo, useState, useRef, useCallback} from 'react';
import type {Recipe} from '../utils/types/recipe';
import {useNavigate} from 'react-router-dom';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import {fetchRecipes, deleteRecipe} from '../store/recipesSlice';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import RecipeCard from '../components/RecipeCard';
import {getString, setString, remove} from '../utils/storage';

export default function RecipesPage() {
  const dispatch = useAppDispatch();
  const {list, loading} = useAppSelector((s) => s.recipes);
  const {isAdmin} = useAppSelector((s) => s.auth);
  const [query, setQuery] = useState(() => getString('recipes-query', ''));
  const [maxCook, setMaxCook] = useState(() => {
    return getString('recipes-maxCook', '');
  });
  const [minServings, setMinServings] = useState(() => {
    return getString('recipes-minServings', '');
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(() => {
    try {
      const raw = getString('recipes-pageSize', '');
      const n = raw ? Number(raw) : 6;
      return Number.isFinite(n) && n > 0 ? n : 6;
    } catch {
      return 6;
    }
  });
  const navigate = useNavigate();
  const handleOpen = useCallback(
    (rec: Recipe) => navigate(`/recipes/${rec.id}`),
    [navigate],
  );
  const handleEdit = useCallback(
    (rec: Recipe) => navigate(`/recipes/${rec.id}/edit`),
    [navigate],
  );
  const handleDelete = useCallback(
    (id: string) => void dispatch(deleteRecipe(id)),
    [dispatch],
  );

  useEffect(() => {
    dispatch(fetchRecipes());
  }, [dispatch]);

  const filtered = useMemo(() => {
    const q = (query || '').toLowerCase();
    const maxCookNum = Number(maxCook) || 0;
    const minServingsNum = Number(minServings) || 0;

    return list.filter((r) => {
      if (q) {
        const matchesQuery =
          r.title.toLowerCase().includes(q) ||
          (r.description || '').toLowerCase().includes(q) ||
          (r.tags || []).some((t) => t.toLowerCase().includes(q));
        if (!matchesQuery) return false;
      }

      const totalTime = (r.prep_time ?? 0) + (r.cook_time ?? 0);
      if (maxCook) {
        if (totalTime > maxCookNum) return false;
      }

      if (minServings && r.servings != null) {
        if (r.servings < minServingsNum) return false;
      }

      return true;
    });
  }, [list, query, maxCook, minServings]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalCount = filtered.length;
  const startIndex = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const endIndex = Math.min(page * pageSize, totalCount);

  const handleQueryChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setQuery(e.target.value);
      setPage(1);
    },
    [setQuery, setPage],
  );

  const handleMaxCookChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      if (v === '') {
        setMaxCook('');
        setPage(1);
        return;
      }
      const num = Math.max(0, Math.floor(Number(v) || 0));
      setMaxCook(String(num));
      setPage(1);
    },
    [setMaxCook, setPage],
  );

  const handleMinServingsChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      if (v === '') {
        setMinServings('');
        setPage(1);
        return;
      }
      const num = Math.max(0, Math.floor(Number(v) || 0));
      setMinServings(String(num));
      setPage(1);
    },
    [setMinServings, setPage],
  );

  const handleClear = useCallback(() => {
    setQuery('');
    setMaxCook('');
    setMinServings('');
    setPage(1);
    remove('recipes-query');
    remove('recipes-maxCook');
    remove('recipes-minServings');
  }, [setQuery, setMaxCook, setMinServings, setPage]);

  const handlePrev = useCallback(
    () => setPage((p) => Math.max(1, p - 1)),
    [setPage],
  );
  const handleNext = useCallback(
    () => setPage((p) => Math.min(pageCount, p + 1)),
    [setPage, pageCount],
  );

  const handlePageSizeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      const n = Math.max(1, Math.floor(Number(v) || 1));
      setPageSize(n);
      setPage(1);
    },
    [setPageSize, setPage],
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const active = document.activeElement as HTMLElement | null;
      const tag = active?.tagName?.toLowerCase() ?? '';
      const isEditable =
        tag === 'input' || tag === 'textarea' || active?.isContentEditable;
      if (isEditable) return;

      if (e.key === 'ArrowLeft' && page > 1) {
        setPage((p) => Math.max(1, p - 1));
      } else if (e.key === 'ArrowRight' && page < pageCount) {
        setPage((p) => Math.min(pageCount, p + 1));
      }
    }

    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [page, pageCount]);

  useEffect(() => {
    if (maxCook === '') {
      remove('recipes-maxCook');
    } else {
      setString('recipes-maxCook', maxCook);
    }
  }, [maxCook]);

  useEffect(() => {
    if (minServings === '') {
      remove('recipes-minServings');
    } else {
      setString('recipes-minServings', minServings);
    }
  }, [minServings]);

  useEffect(() => {
    setString('recipes-pageSize', String(pageSize));
  }, [pageSize]);

  useEffect(() => {
    if (query === '') {
      remove('recipes-query');
    } else {
      setString('recipes-query', query);
    }
  }, [query]);

  function FooterBar({
    page,
    pageCount,
    onPrev,
    onNext,
  }: {
    page: number;
    pageCount: number;
    onPrev: () => void;
    onNext: () => void;
  }) {
    const [visible, setVisible] = useState(true);
    const idleRef = useRef<number | null>(null);

    useEffect(() => {
      function showTemporarily() {
        setVisible(true);
        if (idleRef.current) {
          clearTimeout(idleRef.current);
        }
        idleRef.current = window.setTimeout(() => {
          setVisible(false);
          idleRef.current = null;
        }, 1500);
      }

      idleRef.current = window.setTimeout(() => {
        setVisible(false);
        idleRef.current = null;
      }, 1500);

      const events = ['scroll', 'wheel', 'touchmove', 'mousemove'];
      events.forEach((ev) =>
        window.addEventListener(ev, showTemporarily, {passive: true}),
      );

      return () => {
        events.forEach((ev) => window.removeEventListener(ev, showTemporarily));
        if (idleRef.current) clearTimeout(idleRef.current);
      };
    }, []);

    return (
      <div
        className={`fixed bottom-0 left-0 right-0 bg-white/95 border-t p-3 z-40 transition-transform  duration-400 ease-in-out transform recipes-footer ${
          visible
            ? 'translate-y-0 opacity-100'
            : 'translate-y-full opacity-0 pointer-events-none'
        }`}
        aria-hidden={!visible}
      >
        <div className='max-w-4xl mx-auto flex items-center justify-center space-x-4'>
          <button disabled={page <= 1} onClick={onPrev} className='pager-btn'>
            {'<'}
          </button>

          <div>
            {page} / {pageCount}
          </div>

          <button
            disabled={page >= pageCount}
            onClick={onNext}
            className='pager-btn'
          >
            {'>'}
          </button>

          <div />
        </div>
      </div>
    );
  }

  return (
    <div className='gap-1 flex flex-col items-center overflow-y-hidden pb-28'>
      <header className='flex items-center w-full mb-4 gap-4 flex-wrap recipes-filters recipes-header-card'>
        <div className='flex-1 min-w-0 search-field'>
          <Input
            label='Search recipes'
            placeholder='Search'
            value={query}
            onChange={handleQueryChange}
            className='w-full'
          />
        </div>
        <div className='flex items-center space-x-3 flex-wrap gap-2 filters-right'>
          <div className='max-w-28 w-full'>
            <Input
              label='Max total time (mins)'
              placeholder='Max total'
              type='number'
              step={10}
              min={0}
              value={maxCook}
              className='w-full'
              onChange={handleMaxCookChange}
            />
          </div>
          <div className='max-w-28 w-full'>
            <Input
              label='Min servings'
              placeholder='Min servings'
              type='number'
              step={1}
              min={0}
              value={minServings}
              className='w-full'
              onChange={handleMinServingsChange}
            />
          </div>
          <div className='flex items-center space-x-3'>
            <div className='text-sm text-muted'>
              {totalCount === 0
                ? '0 of 0'
                : `${startIndex} - ${endIndex} of ${totalCount}`}
            </div>
            <div className='max-w-20'>
              <Input
                label='Per page'
                id='page-size-input'
                type='number'
                min={1}
                step={5}
                className='w-full'
                value={String(pageSize)}
                onChange={handlePageSizeChange}
              />
            </div>
          </div>
          <Button className='pager-btn' onClick={handleClear}>
            Clear filters
          </Button>

          {isAdmin && null}
        </div>
      </header>

      {loading ? (
        <div>Loading…</div>
      ) : (
        <div>
          <div
            role='list'
            className='grid gap-3 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2'
          >
            {pageItems.map((r) => (
              <div role='listitem' key={r.id} className='h-full'>
                <RecipeCard
                  recipe={r}
                  isAdmin={isAdmin}
                  onOpen={handleOpen}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <FooterBar
        page={page}
        pageCount={pageCount}
        onPrev={handlePrev}
        onNext={handleNext}
      />
    </div>
  );
}
