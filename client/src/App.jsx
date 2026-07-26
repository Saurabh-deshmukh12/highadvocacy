import { Routes, Route } from 'react-router-dom'
import SubmissionForm from './pages/SubmissionForm.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Wall from './pages/Wall.jsx'
import Layout from './components/Layout.jsx'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<SubmissionForm />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/wall" element={<Wall />} />
      </Route>
    </Routes>
  )
}

export default App
