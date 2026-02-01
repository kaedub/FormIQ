import cors from 'cors';
import express from 'express';
import type { IntakeQuestionDto } from '@formiq/shared';

const app = express();
app.use(cors());
app.use(express.json());

const questions: IntakeQuestionDto[] = [
  {
    id: 'question_goal',
    prompt: 'What is the goal you want to achieve?',
    questionType: 'free_text',
    options: [],
    position: 0,
  },
  {
    id: 'question_constraints',
    prompt: 'What constraints or deadlines do you have?',
    questionType: 'free_text',
    options: [],
    position: 1,
  },
  {
    id: 'question_success',
    prompt: 'How will you measure success?',
    questionType: 'free_text',
    options: [],
    position: 2,
  },
  {
    id: 'question_resources',
    prompt: 'Which resources or tools do you prefer?',
    questionType: 'multi_select',
    options: ['AI tooling', 'Design tools', 'Code editors', 'Automation', 'No-code'],
    position: 3,
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
