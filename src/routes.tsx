import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import StoryCustomizationPage from './pages/StoryCustomizationPage';
import StoryReadingPage from './pages/StoryReadingPage';
import AboutPage from './pages/AboutPage';
import MyStoriesPage from './pages/MyStoriesPage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import { useAuth } from './contexts/AuthContext';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/sign-in" />;
  }

  return <>{children}</>;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="customize" element={<StoryCustomizationPage />} />
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