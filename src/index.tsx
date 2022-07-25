import 'reflect-metadata';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { Module } from '@adi/react';

import { App } from './App';
import { bootstrapAppInjector } from './app.module';

import './tailwind.css';
import "allotment/dist/style.css";
import './main.css';

// import reportWebVitals from './reportWebVitals';

async function bootstrap() {
  const injector = await bootstrapAppInjector();

  const root = createRoot(
    document.getElementById('root') as HTMLElement
  );
  
  root.render(
    <StrictMode>
      <Module module={injector} cacheID='studio:app'>
        <App />
      </Module>
    </StrictMode>
  );
}

bootstrap();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
