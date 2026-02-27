import {useNavigate, useParams} from 'react-router-dom';
import RecipeForm from '../components/recipeForm/RecipeForm';
import {useAppSelector} from '../store/hooks';
import {selectRecipeById} from '../store/recipesSlice';

export default function RecipeEditorPage() {
  const navigate = useNavigate();
  const {id} = useParams();
  const recipe = useAppSelector((s) => selectRecipeById(s, id));

  return (
    <div className='w-full flex items-center justify-center min-h-[60vh] py-8'>
      <RecipeForm
        initial={recipe ?? null}
        onCancel={() => navigate('/recipes')}
        onSaved={() => navigate('/recipes')}
      />
    </div>
  );
}
