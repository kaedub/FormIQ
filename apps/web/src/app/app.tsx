import { Navigate, Route, Routes } from 'react-router-dom';
import type { JSX } from 'react';
import { HomePage } from './pages/HomePage';
import { StartProjectPage } from './pages/StartProjectPage';
import { ProjectDetailsPage } from './pages/ProjectDetailsPage';

export function App(): JSX.Element {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/start" element={<StartProjectPage />} />
      <Route path="/projects/:projectId" element={<ProjectDetailsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
