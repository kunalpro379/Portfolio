import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './responsive.css';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import CreateProject from './pages/CreateProject';
import EditProject from './pages/EditProject';
import Blogs from './pages/Blogs';
import CreateBlog from './pages/CreateBlog';
import EditBlog from './pages/EditBlog';
import Documentation from './pages/Documentation';
import CreateDocumentation from './pages/CreateDocumentation';
import EditDocumentation from './pages/EditDocumentation';
import Notes from './pages/Notes';
import TodoEditor from './pages/TodoEditor';
import Layout from './components/Layout';
import { AuthProvider, useAuth } from './context/AuthContext';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  return isAuthenticated ? <Layout>{children}</Layout> : <Navigate to="/login" />;
}

function PrivateRouteNoLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/projects"
            element={
              <PrivateRoute>
                <Projects />
              </PrivateRoute>
            }
          />
          <Route
            path="/create/:projectId"
            element={
              <PrivateRouteNoLayout>
                <CreateProject />
              </PrivateRouteNoLayout>
            }
          />
          <Route
            path="/edit/project/:projectId"
            element={
              <PrivateRouteNoLayout>
                <EditProject />
              </PrivateRouteNoLayout>
            }
          />
          <Route
            path="/blogs"
            element={
              <PrivateRoute>
                <Blogs />
              </PrivateRoute>
            }
          />
          <Route
            path="/blogs/create/:blogId"
            element={
              <PrivateRouteNoLayout>
                <CreateBlog />
              </PrivateRouteNoLayout>
            }
          />
          <Route
            path="/blogs/edit/:blogId"
            element={
              <PrivateRouteNoLayout>
                <EditBlog />
              </PrivateRouteNoLayout>
            }
          />
          <Route
            path="/documentation"
            element={
              <PrivateRoute>
                <Documentation />
              </PrivateRoute>
            }
          />
          <Route
            path="/documentation/create"
            element={
              <PrivateRouteNoLayout>
                <CreateDocumentation />
              </PrivateRouteNoLayout>
            }
          />
          <Route
            path="/documentation/edit/:docId"
            element={
              <PrivateRouteNoLayout>
                <EditDocumentation />
              </PrivateRouteNoLayout>
            }
          />
          <Route
            path="/notes"
            element={
              <PrivateRoute>
                <Notes />
              </PrivateRoute>
            }
          />
          <Route
            path="/notes/todo/:todoId"
            element={
              <PrivateRouteNoLayout>
                <TodoEditor />
              </PrivateRouteNoLayout>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
