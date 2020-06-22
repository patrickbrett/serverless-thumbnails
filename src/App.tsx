import React from 'react';
import './style/App.css';
import Upload from './components/Upload';
import AllPhotos from './components/AllPhotos';

function App() {
  return (
    <div className="App">
      <Upload />
      <AllPhotos />
      <a href="https://pat.vc/thumbnails-repo">Github</a>
    </div>
  );
}

export default App;
