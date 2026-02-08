import { JSX, useCallback, useEffect, useMemo, useState } from 'react';
import { Link, Navigate, Route, Routes, useParams } from 'react-router-dom';
import styles from './app.module.css';
import {
  IntakeQuestionDto,
  QuestionResponseInput,
  StoryDto,
  StorySummaryDto,
} from '@formiq/shared';

const API_BASE = 'http://localhost:3001';
const INTAKE_FORM_NAME = 'goal_intake_v1';

type AnswerState = Record<string, string | string[]>;

function HomePage(): JSX.Element {
  const [stories, setStories] = useState<StorySummaryDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/stories`);
      if (!res.ok) {
        throw new Error(`Failed to load stories: ${res.status}`);
      }
      const data = await res.json();
      setStories(data.stories);
    } catch (err) {
      console.warn('Could not load stories', err);
      setStories([]);
      setError('Unable to load stories right now. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStories();
  }, [loadStories]);


  return (
    <div className={styles.home}>
      <div className={styles.homeCard}>
        <p className={styles.eyebrow}>Story hub</p>
        <h1 className={styles.homeTitle}>Your stories</h1>
        <p className={styles.lead}>
          Start a new story to capture a goal and its context. Your saved work
          will appear here.
        </p>
        <div className={styles.homeActions}>
          <Link to="/intake" className={styles.primaryLink}>
            Start New Story
          </Link>
        </div>
        <div className={styles.storyList}>
          {loading ? (
            <div className={styles.homePlaceholder}>
              <p>Loading stories…</p>
            </div>
          ) : error ? (
            <div className={styles.homePlaceholder}>
              <p>{error}</p>
            </div>
          ) : stories.length === 0 ? (
            <div className={styles.homePlaceholder}>
              <p>No stories yet. Create one to see it here.</p>
            </div>
          ) : (
            stories.map((story) => (
              <Link
                key={story.id}
                to={`/stories/${story.id}`}
                className={styles.storyCardLink}
              >
                <article className={styles.storyCard}>
                  <div className={styles.storyCardTop}>
                    <p className={styles.storyStatus}>
                      {story.status ?? 'unknown'}
                    </p>
                    <span className={styles.storyBadge}>Story</span>
                  </div>
                  <h2 className={styles.storyTitleHome}>{story.title}</h2>
                </article>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function IntakePage(): JSX.Element {
  const [questions, setQuestions] = useState<IntakeQuestionDto[]>([]);
  const [answers, setAnswers] = useState<AnswerState>({});
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [story, setStory] = useState<StoryDto | null>(null);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/intake-forms/${INTAKE_FORM_NAME}`,
        );
        if (!res.ok) throw new Error('Failed to load questions');
        const data = await res.json();
        setQuestions(data.form?.questions);
      } catch (error) {
        console.warn('Falling back to static questions', error);
        setStatus('Using fallback questions; API not reachable yet.');
      }
    };

    loadQuestions();
  }, []);

  const responsePayload: QuestionResponseInput[] = useMemo(() => {
    return questions.map((question, index) => {
      const value = answers[question.id];
      if (question.questionType === 'multi_select') {
        const list = Array.isArray(value) ? (value as string[]) : [];
        return {
          questionId: question.id,
          values: list.filter((value): value is string => Boolean(value)),
        };
      }

      return {
        questionId: question.id,
        values: value ? [value as string] : [''],
      };
    });
  }, [answers, questions]);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setStatus(null);
    setStory(null);

    if (!title.trim()) {
      setStatus('Goal title is required.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/stories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          responses: responsePayload,
        }), 
      });

      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || 'Failed to save story');
      }

      const saved = (await res.json()) as StoryDto;
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

  const updateAnswer = (questionId: string, value: string | string[]): void => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
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
              <div key={question.id} className={styles.questionCard}>
                <p className={styles.questionText}>{question.prompt}</p>
                {question.questionType === 'multi_select' ? (
                  <div className={styles.options}>
                    {question.options.map((option) => {
                      const selected = Array.isArray(answers[question.id])
                        ? (answers[question.id] as string[]).includes(option)
                        : false;
                      return (
                        <label key={option} className={styles.option}>
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={(event) => {
                              const current = Array.isArray(answers[question.id])
                                ? (answers[question.id] as string[])
                                : [];
                              const next = event.target.checked
                                ? [...current, option]
                                : current.filter((item) => item !== option);
                              updateAnswer(question.id, next);
                            }}
                          />
                          {option}
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <textarea
                    value={(answers[question.id] as string) ?? ''}
                    onChange={(event) =>
                      updateAnswer(question.id, event.target.value)
                    }
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
            Status: {story.status} · Responses captured:{' '}
            {story.responses.length}
          </p>
          <ul className={styles.detailList}>
            {story.responses.map((response) => (
              <li key={response.answer.questionId}>
                <strong>{response.question.prompt}</strong>
                <div>
                  {response.answer.values.length > 0
                    ? response.answer.values.join(', ')
                    : 'No answer yet'}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}

function StoryDetailsPage(): JSX.Element {
  const { storyId } = useParams<{ storyId: string }>();
  return (
    <div className={styles.home}>
      <div className={styles.homeCard}>
        <p className={styles.eyebrow}>Story detail</p>
        <h1 className={styles.homeTitle}>Story {storyId}</h1>
        <p className={styles.lead}>
          Detailed view coming soon. Use the intake form to add more stories.
        </p>
        <div className={styles.homeActions}>
          <Link to="/" className={styles.primaryLink}>
            Back to stories
          </Link>
        </div>
      </div>
    </div>
  );
}

export function App(): JSX.Element {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/intake" element={<IntakePage />} />
      <Route path="/stories/:storyId" element={<StoryDetailsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
