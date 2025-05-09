import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import StoryCustomizationPage from './pages/StoryCustomizationPage';
import StoryReadingPage from './pages/StoryReadingPage';
import AboutPage from './pages/AboutPage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import MyStoriesPage from './pages/MyStoriesPage';
import PrivateRoute from './components/auth/PrivateRoute';
import AuthCheck from './components/auth/AuthCheck';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route 
          path="customize" 
          element={
            <AuthCheck>
              <StoryCustomizationPage />
            </AuthCheck>
          } 
        />
        <Route path="read/:storyId" element={<StoryReadingPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="sign-in" element={<SignInPage />} />
        <Route path="sign-up" element={<SignUpPage />} />
        <Route
          path="my-stories"
          element={
            <PrivateRoute>
              <MyStoriesPage />
            </PrivateRoute>
          }
        />
      </Route>
    </Routes>
  );
} 