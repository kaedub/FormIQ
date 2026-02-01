import { useEffect, useMemo, useState } from 'react';
import styles from './app.module.css';
import { IntakeRequest, QuestionResponseInput, StoryResponse } from '@formiq/shared';

const FALLBACK_QUESTIONS: QuestionResponseInput[] = [
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

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

type AnswerState = Record<number, string | string[]>;

export function App() {
  const [questions, setQuestions] = useState<QuestionResponseInput[]>([]);
  const [answers, setAnswers] = useState<AnswerState>({});
  const [email, setEmail] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [story, setStory] = useState<StoryResponse | null>(null);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const res = await fetch(`${API_BASE}/questions`);
        if (!res.ok) throw new Error('Failed to load questions');
        const data = await res.json();
        setQuestions(data.questions ?? FALLBACK_QUESTIONS);
      } catch (error) {
        console.warn('Falling back to static questions', error);
        setStatus('Using fallback questions; API not reachable yet.');
        setQuestions(FALLBACK_QUESTIONS);
      }
    };

    loadQuestions();
  }, []);

  const responsePayload: QuestionResponseInput[] = useMemo(
    () =>
      questions.map((question, index) => {
        const answer = answers[index];
        const normalized =
          Array.isArray(answer) && answer.length > 0
            ? answer.join(', ')
            : (answer as string | undefined);

        return {
          ...question,
          answer: normalized,
        };
      }),
    [answers, questions],
  );

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setStatus(null);
    setStory(null);

    if (!email || !title) {
      setStatus('Email and goal title are required.');
      setLoading(false);
      return;
    }

    const payload: IntakeRequest = {
      email,
      title,
      responses: responsePayload,
    };

    try {
      const res = await fetch(`${API_BASE}/stories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || 'Failed to save story');
      }

      const saved = (await res.json()) as StoryResponse;
      setStory(saved);
      setStatus('Saved goal and answers.');
      setAnswers({});
      setTitle('');
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : 'Failed to save goal; check API connection.',
      );
    } finally {
      setLoading(false);
    }
  };

  const updateAnswer = (
    index: number,
    value: string | string[],
  ): void => {
    setAnswers((prev) => ({ ...prev, [index]: value }));
  };

  return (
    <main className={styles.page}>
      <section className={styles.panel}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>Goal intake</p>
          <h1 className={styles.title}>Capture a goal and the context</h1>
          <p className={styles.lead}>
            Share what you want to achieve and answer a few prompts. We&apos;ll
            save it and draft a roadmap next.
          </p>
        </header>

        <form className={styles.form} onSubmit={submit}>
          <label className={styles.field}>
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
            />
          </label>

          <label className={styles.field}>
            <span>Goal title</span>
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Launch an AI guide for user goals"
              required
            />
          </label>

          <div className={styles.questions}>
            {questions.map((question, index) => (
              <div key={question.question} className={styles.questionCard}>
                <p className={styles.questionText}>{question.question}</p>
                {question.questionType === 'multi_select' ? (
                  <div className={styles.options}>
                    {(question.options ?? []).map((option) => {
                      const selected = Array.isArray(answers[index])
                        ? (answers[index] as string[]).includes(option)
                        : false;
                      return (
                        <label key={option} className={styles.option}>
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={(event) => {
                              const current = Array.isArray(answers[index])
                                ? (answers[index] as string[])
                                : [];
                              const next = event.target.checked
                                ? [...current, option]
                                : current.filter((item) => item !== option);
                              updateAnswer(index, next);
                            }}
                          />
                          {option}
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <textarea
                    value={(answers[index] as string) ?? ''}
                    onChange={(event) => updateAnswer(index, event.target.value)}
                    placeholder="Type your answer"
                    rows={3}
                  />
                )}
              </div>
            ))}
          </div>

          <button type="submit" className={styles.submit} disabled={loading}>
            {loading ? 'Saving…' : 'Save goal and answers'}
          </button>
          {status && <p className={styles.status}>{status}</p>}
        </form>
      </section>

      {story && (
        <section className={styles.result}>
          <h2>Saved story</h2>
          <p className={styles.storyTitle}>{story.title}</p>
          <p className={styles.storyMeta}>
            Status: {story.status} · Responses captured: {story.responses.length}
          </p>
          <ul className={styles.detailList}>
            {story.responses.map((response) => (
              <li key={response.id}>
                <strong>{response.question}</strong>
                <div>{response.answer || 'No answer yet'}</div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}

export default App;
