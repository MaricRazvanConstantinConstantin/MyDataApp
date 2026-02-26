import React, {useState} from 'react';
import {createPortal} from 'react-dom';
import Card from './ui/Card';
import Button from './ui/Button';
import Input from './ui/Input';
import {useAppDispatch} from '../store/hooks';
import {addMessage} from '../store/messagesSlice';
import {useToast} from '../context/hooks';

export default function ContactModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [title, setTitle] = useState('');
  const [mail, setMail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const {showToast} = useToast();
  const dispatch = useAppDispatch();

  const titleId = React.useId();
  const mailId = React.useId();

  if (!open) return null;

  async function handleSend(e?: React.FormEvent) {
    e?.preventDefault();
    setLoading(true);
    try {
      const payload = {
        title: title.trim(),
        email: mail.trim(),
        message: message.trim(),
      };
      await dispatch(addMessage(payload)).unwrap();
      showToast('Message sent — thank you!', 'success');
      setTitle('');
      setMail('');
      setMessage('');
      onClose();
    } catch (err) {
      const msg =
        err && typeof err === 'object' && 'message' in err
          ? (err as Error).message
          : String(err);
      showToast(msg, 'error');
      console.error('Contact send failed', err);
    } finally {
      setLoading(false);
    }
  }

  const modal = (
    <div
      role='dialog'
      aria-modal='true'
      className='fixed inset-0 z-50 flex items-center justify-center p-4'
    >
      <div
        className='absolute inset-0 bg-black/40'
        onClick={onClose}
        aria-hidden
      />
      <Card className='z-10 w-full max-w-md shadow-lg'>
        <form onSubmit={handleSend} className='p-6 space-y-4'>
          <h2 className='text-xl font-semibold mb-1'>Contact Us</h2>
          <p className='text-sm text-muted mb-2'>
            Send us a message and we&apos;ll get back to you.
          </p>

          <div>
            <label htmlFor={titleId} className='text-sm font-medium mb-1 block'>
              Title
            </label>
            <Input
              id={titleId}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className='mb-2'
              placeholder='Short subject'
            />
          </div>

          <div>
            <label htmlFor={mailId} className='text-sm font-medium mb-1 block'>
              Email
            </label>
            <Input
              id={mailId}
              value={mail}
              onChange={(e) => setMail(e.target.value)}
              className='mb-2'
              placeholder='your@address.com'
            />
          </div>

          <div>
            <label className='text-sm font-medium mb-1 block'>Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className='input w-full h-32 mb-3'
              placeholder='Describe your message'
            />
          </div>

          <div className='flex items-center justify-end gap-2'>
            <Button variant='ghost' onClick={onClose}>
              Cancel
            </Button>
            <Button type='submit' disabled={loading}>
              {loading ? 'Sending…' : 'Send'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );

  return createPortal(modal, document.body);
}
