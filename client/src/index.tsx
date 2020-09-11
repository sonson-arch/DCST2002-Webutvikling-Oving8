import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { Whiteboard } from './whiteboard-component';
import { Alert } from './widgets';

let root = document.getElementById('root');
if (root)
  createRoot(root).render(
    <>
      <Alert />
      <Whiteboard />
    </>,
  );
