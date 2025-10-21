import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import GuideEditor from '../components/GuideEditor';
import GuideViewer from '../components/GuideViewer';
import GuidesList from '../components/GuidesList';

const GuidesApp = () => {
  return (
    <Router basename="/guides">
      <Routes>
        <Route path="/" element={<GuidesList />} />
        <Route path="/create" element={<GuideEditor />} />
        <Route path="/edit/:id" element={<GuideEditor />} />
        <Route path="/:slug" element={<GuideViewer />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default GuidesApp;
