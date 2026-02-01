import cors from 'cors';
import express from 'express';
import type { QuestionResponseInput } from '@formiq/shared';

const app = express();
app.use(cors());
app.use(express.json());

const questions: QuestionResponseInput[] = [
  {
    question: 'What is the goal you want to achieve?',
    questionType: 'free_text',
  },
  {
    question: 'What constraints or deadlines do you have?',
    questionType: 'free_text',
  },
  {
    question: 'How will you measure success?',
    questionType: 'free_text',
  },
  {
    question: 'Which resources or tools do you prefer?',
    questionType: 'multi_select',
    options: ['AI tooling', 'Design tools', 'Code editors', 'Automation', 'No-code'],
  },
];

app.get('/', (_req, res) => {
  res.send('Welcome to the Story Intake API');
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/questions', (_req, res) => {
  res.json({ questions });
});

const port = process.env['PORT'] || 3001;
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
