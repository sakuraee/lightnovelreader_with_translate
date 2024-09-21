import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import Kuroshiro from "kuroshiro";
import KuromojiAnalyzer from "kuroshiro-analyzer-kuromoji";

const root = ReactDOM.createRoot(document.getElementById('root'));

const kuroshiro = new Kuroshiro();


kuroshiro.init(new KuromojiAnalyzer({ dictPath: "/dict" })).then(() => {
  console.log("Kuroshiro is ready!")
  root.render(
    <React.StrictMode>
      <App kuroshiro={kuroshiro}/>
    </React.StrictMode>
  );
}).catch((error) => {
  console.error("Failed to start Kuroshiro: " + error);
});
