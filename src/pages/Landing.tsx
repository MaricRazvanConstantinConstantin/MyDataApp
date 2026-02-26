import {useNavigate} from 'react-router-dom';
import {useAppSelector} from '../store/hooks';
import Container from '../components/ui/Container';
import Button from '../components/ui/Button';

export default function Landing() {
  const navigate = useNavigate();
  const {isAdmin} = useAppSelector((s) => s.auth);

  async function handleContinueAsVisitor() {
    navigate('/recipes');
  }

  return (
    <Container>
      <div className='min-h-[60vh] flex flex-col items-center justify-center p-4'>
        <h1 className='text-2xl font-bold mb-4 text-center'>Recipe Manager</h1>
        <p className='mb-6 text-center'>
          My recipe app - a simple application to manage recipes.
        </p>
        <div className='space-x-3'>
          <Button variant='ghost' onClick={handleContinueAsVisitor}>
            {isAdmin ? 'Continue as admin' : 'Continue as visitor'}
          </Button>
        </div>
      </div>
    </Container>
  );
}
