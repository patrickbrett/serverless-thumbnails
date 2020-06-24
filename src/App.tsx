import React from 'react';
import './style/App.css';
import Upload from './components/Upload';
import AllPhotos from './components/AllPhotos';
import { CssBaseline, Container, Typography } from "@material-ui/core";

function App() {
  return (
    <div className="App">
      <CssBaseline />
      <Container className="main-title-container">
        <Typography className="main-title" variant="h2">Serverless Thumbnails Generator <span role="img" aria-label="thumbnail">🎆</span></Typography>
        <p>quick access: <a style={{ color: "#000" }} href="https://pat.vc/thumbnails">pat.vc/thumbnails</a> <span role="img" aria-label="strong">💪</span></p>
      </Container>
      <Container>
      <Upload />
      </Container>
      <Container>
      <AllPhotos />
      </Container>
      <Container className="github-link">
      <a href="https://pat.vc/thumbnails-repo">Github</a>
      </Container>
    </div>
  );
}

export default App;
