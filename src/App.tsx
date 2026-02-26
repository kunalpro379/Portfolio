import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Home from './pages/Home';
import Learnings from './pages/Learnings';
import CodePage from './pages/CodePage';
import DiagramsPage from './pages/DiagramsPage';
import ProjectDetail from './pages/ProjectDetail';
import BlogDetail from './pages/BlogDetail';
import NotesDetail from './pages/NotesDetail';
import DocumentationDetail from './pages/DocumentationDetail';
import GuideNoteEditor from './pages/GuideNoteEditor';
import GuideCreate from './pages/GuideCreate';
import GuideView from './pages/GuideView';
import TitleEditor from './pages/TitleEditor';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';
import About from './pages/About';
import Contact from './pages/Contact';
import AIChatButton from './components/AIChatButton';
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
        <Route path="/learnings/code" element={<CodePage />} />
        <Route path="/learnings/diagrams" element={<DiagramsPage />} />
        <Route path="/projects/:id" element={<ProjectDetail />} />
        <Route path="/learnings/blogs/:id" element={<BlogDetail />} />
        <Route path="/learnings/notes/:id" element={<NotesDetail />} />
        <Route path="/learnings/documentation/:docId" element={<DocumentationDetail />} />
        <Route path="/learnings/guide/create" element={<GuideCreate />} />
        <Route path="/learnings/guide/:guideId" element={<GuideView />} />
        <Route path="/learnings/guide/:guideId/title/new" element={<TitleEditor />} />
        <Route path="/learnings/guide/:guideId/title/:titleId" element={<TitleEditor />} />
        <Route path="/learnings/guide/:guideId/title/:titleId/view" element={<GuideNoteEditor />} />
        <Route path="/learnings/guide/:guideId/title/:titleId/edit" element={<GuideNoteEditor />} />
        <Route path="/learn/:guideSlug/:titleSlug" element={<GuideNoteEditor />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<div className="min-h-screen flex items-center justify-center"><div className="text-center"><h1 className="text-2xl font-bold mb-4">404 - Page Not Found</h1><a href="/" className="text-blue-600 hover:underline">Go Home</a></div></div>} />
      </Routes>
      <AIChatButton />
    </>
  );
}

export default App
