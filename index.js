import express from 'express';


import { promises as fs } from 'fs';

import dotenv from 'dotenv';


dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Create uploads directory if it doesn't exist
(async () => {
  try {
    await fs.access('uploads');
  } catch (_) {
    await fs.mkdir('uploads');
    console.log('Created uploads directory');
  }
})();