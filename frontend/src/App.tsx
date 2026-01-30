import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { Home } from '@/pages/Home'
import { Patients } from '@/pages/Patients'
import { Triage } from '@/pages/Triage'
import { Queue } from '@/pages/Queue'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="patients" element={<Patients />} />
        <Route path="triage" element={<Triage />} />
        <Route path="queue" element={<Queue />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App
