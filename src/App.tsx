import {BrowserRouter, Routes, Route} from 'react-router-dom';
import Shell from './components/Shell';
import {useEffect} from 'react';
import {useAppDispatch} from './store/hooks';
import {restoreSession} from './store/authSlice';
import RecipesPage from './pages/Recipes';
import RecipeEditorPage from './pages/RecipeEditor';
import RecipeDetailPage from './pages/RecipeDetail';
import MessagesPage from './pages/Messages';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';

export default function App() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(restoreSession());
  }, [dispatch]);
  return (
    <BrowserRouter>
      <Shell>
        <Routes>
          <Route path='/' element={<Landing />} />
          <Route path='/recipes' element={<RecipesPage />} />
          <Route path='/recipes/:id' element={<RecipeDetailPage />} />
          <Route
            path='/messages'
            element={
              <ProtectedRoute requireAdmin>
                <MessagesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path='/recipes/new'
            element={
              <ProtectedRoute requireAdmin>
                <RecipeEditorPage />
              </ProtectedRoute>
            }
          />
          <Route
            path='/recipes/:id/edit'
            element={
              <ProtectedRoute requireAdmin>
                <RecipeEditorPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Shell>
    </BrowserRouter>
  );
}
