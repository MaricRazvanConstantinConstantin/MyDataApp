import {useEffect, useState} from 'react';
import {useAppSelector, useAppDispatch} from '../store/hooks';
import {useNavigate} from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import {useToast} from '../context/hooks';
import {fetchMessages} from '../store/messagesSlice';

export default function MessagesPage() {
  const {isAdmin, initialized} = useAppSelector((s) => s.auth);
  const navigate = useNavigate();
  const {showToast} = useToast();
  const dispatch = useAppDispatch();

  const {list: messages, loading} = useAppSelector((s) => s.messages);

  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(10);

  useEffect(() => {
    if (!initialized) return;
    if (!isAdmin) {
      navigate('/');
      return;
    }
    dispatch(fetchMessages())
      .unwrap()
      .catch((err) => {
        const msg =
          err && 'message' in err ? (err as Error).message : String(err);
        showToast(msg, 'error');
      });
  }, [initialized, isAdmin, navigate, showToast, dispatch]);

  const total = messages.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const from = (page - 1) * pageSize;
  const to = Math.min(from + pageSize, total);
  const pageItems = messages.slice(from, to);

  return (
    <div className='w-full flex items-center justify-center min-h-[60vh] py-8'>
      <div className='w-full max-w-4xl'>
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-2xl font-semibold'>Messages</h2>
          <div className='flex items-center space-x-2'>
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
          </div>
        </div>

        <Card>
          {loading ? (
            <div>Loading…</div>
          ) : (
            <div>
              <div className='hidden md:block'>
                <table className='w-full text-left'>
                  <thead>
                    <tr>
                      <th className='pb-2'>Title</th>
                      <th className='pb-2'>Email</th>
                      <th className='pb-2'>Message</th>
                      <th className='pb-2'>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageItems.map((m) => (
                      <tr key={m.id} className='border-t'>
                        <td className='py-2'>{m.title}</td>
                        <td className='py-2'>{m.email}</td>
                        <td className='py-2 max-w-md truncate'>{m.message}</td>
                        <td className='py-2 text-sm text-muted'>
                          {new Date(m.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className='md:hidden space-y-3'>
                {pageItems.map((m) => (
                  <div key={m.id} className='p-3 border rounded bg-white'>
                    <div className='flex items-center justify-between'>
                      <div className='font-medium'>{m.title}</div>
                      <div className='text-xs text-muted'>
                        {new Date(m.created_at).toLocaleString()}
                      </div>
                    </div>
                    <div className='text-sm text-muted wrap-break-word mt-1'>
                      {m.email}
                    </div>
                    <div className='mt-2 text-sm'>{m.message}</div>
                  </div>
                ))}
              </div>

              <div className='flex items-center justify-between mt-4'>
                <div>
                  Page {page} / {pageCount}
                </div>
                <div className='flex items-center space-x-2'>
                  <Button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Prev
                  </Button>
                  <Button
                    disabled={page >= pageCount}
                    onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
