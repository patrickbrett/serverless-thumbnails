import React from 'react';
import './style/App.css';
import Upload from './components/Upload';
import AllPhotos from './components/AllPhotos';

function App() {
  return (
    <div className="App">
      <Upload />
      <AllPhotos />
    </div>
  );
}

export default App;
