import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Home from './pages/Home';
import Learnings from './pages/Learnings';
import ProjectDetail from './pages/ProjectDetail';
import BlogDetail from './pages/BlogDetail';
import NotesDetail from './pages/NotesDetail';
import DocumentationDetail from './pages/DocumentationDetail';
import { trackPageView } from './lib/tracking';

// Component to track page views
function PageViewTracker() {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  return null;
}

function App() {
  return (
    <>
      <PageViewTracker />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/learnings" element={<Learnings />} />
        <Route path="/learnings/diagrams" element={<Learnings />} />
        <Route path="/projects/:id" element={<ProjectDetail />} />
        <Route path="/learnings/blogs/:id" element={<BlogDetail />} />
        <Route path="/learnings/notes/:id" element={<NotesDetail />} />
        <Route path="/learnings/documentation/:docId" element={<DocumentationDetail />} />
        <Route path="*" element={<div className="min-h-screen flex items-center justify-center"><div className="text-center"><h1 className="text-2xl font-bold mb-4">404 - Page Not Found</h1><a href="/" className="text-blue-600 hover:underline">Go Home</a></div></div>} />
      </Routes>
    </>
  );
}

export default App
