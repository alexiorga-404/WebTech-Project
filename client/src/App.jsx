import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Professor from './Professor';
//import Professor from './Professor2';
import Student from './Student';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  return (
    <Router>
      {/* Navigation */}
      <nav className="bg-blue-500 p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link to="/professor" className="text-white text-lg font-semibold">
            Professor
          </Link>
          <Link to="/student" className="text-white text-lg font-semibold">
            Student
          </Link>
        </div>
      </nav>
      
      
      {/* Routes */}
      <Routes>
        <Route path="/professor" element={<Professor />} />
        <Route path="/student" element={<Student />} />
      </Routes>

      {/* Toast Notifications */}
      <ToastContainer />
    </Router>
  );
};

export default App;