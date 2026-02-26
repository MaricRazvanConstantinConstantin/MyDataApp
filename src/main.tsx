import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import './styles.css';
import App from './App';
import {Provider} from 'react-redux';
import {store} from './store';
import {ThemeProvider} from './context/ThemeContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </Provider>
  </StrictMode>,
);
