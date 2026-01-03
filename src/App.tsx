import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Learnings from './pages/Learnings'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/learnings" element={<Learnings />} />
    </Routes>
  )
}

export default App
