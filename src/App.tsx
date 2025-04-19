import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import StoryCustomizationPage from './pages/StoryCustomizationPage';
import StoryReadingPage from './pages/StoryReadingPage';
import AboutPage from './pages/AboutPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="customize" element={<StoryCustomizationPage />} />
        <Route path="read/:storyId" element={<StoryReadingPage />} />
        <Route path="about" element={<AboutPage />} />
      </Route>
    </Routes>
  );
}

export default App;