import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Learnings from './pages/Learnings'
import ProjectDetail from './pages/ProjectDetail'
import BlogDetail from './pages/BlogDetail'
import DocumentationDetail from './pages/DocumentationDetail'
import NotesDetail from './pages/NotesDetail'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/learnings" element={<Learnings />} />
      <Route path="/projects/:id" element={<ProjectDetail />} />
      <Route path="/learnings/blogs/:id" element={<BlogDetail />} />
      <Route path="/learnings/documentation/:id" element={<DocumentationDetail />} />
      <Route path="/learnings/notes/:id" element={<NotesDetail />} />
      <Route path="*" element={<div className="min-h-screen flex items-center justify-center"><div className="text-center"><h1 className="text-2xl font-bold mb-4">404 - Page Not Found</h1><a href="/" className="text-blue-600 hover:underline">Go Home</a></div></div>} />
    </Routes>
  )
}

export default App
