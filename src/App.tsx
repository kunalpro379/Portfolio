import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Learnings from './pages/Learnings'
import ProjectDetail from './pages/ProjectDetail'
import LearningDetail from './pages/LearningDetail'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/learnings" element={<Learnings />} />
      <Route path="/projects/:id" element={<ProjectDetail />} />
      <Route path="/learnings/:id" element={<LearningDetail />} />
    </Routes>
  )
}

export default App
