import React, { useState, useEffect, Component } from 'react';
import './App.css';
import ImagePrev from './ImagePreview.js';
import GraphService from './Graph.js';
import MapService from './Map.js';
import { Button } from 'react-bootstrap';
const axios = require('axios');

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>
          Graphalicious
        </h1>
        <ImagePrev className="ImageSize" />
        <GraphService />
        <MapService />
      </header>
    </div>
  );

}
export default App;
