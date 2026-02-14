import { type JSX, useCallback, useEffect, useMemo, useState } from 'react';
import { Link, Navigate, Route, Routes, useParams } from 'react-router-dom';
import styles from './app.module.css';
import type {
  FocusQuestionsDefinition,
  FormDefinition,
  ProjectCommitment,
  ProjectContextProjectDto,
  ProjectFamiliarity,
  ProjectSummaryDto,
  ProjectWorkStyle,
} from '@formiq/shared';

const API_BASE = 'http://localhost:3001';

function HomePage(): JSX.Element {
  const [projects, setProjects] = useState<ProjectSummaryDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/projects`);
      if (!res.ok) {
        throw new Error(`Failed to load projects: ${res.status}`);
      }
      const data = (await res.json()) as { projects: ProjectSummaryDto[] };
      setProjects(data.projects);
    } catch (err) {
      console.warn('Could not load projects', err);
      setProjects([]);
      setError('Unable to load projects right now. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

  return (
    <div className={styles['home']}>
      <div className={styles['homeCard']}>
        <p className={styles['eyebrow']}>Project hub</p>
        <h1 className={styles['homeTitle']}>Your projects</h1>
        <p className={styles['lead']}>
          Start a new project to capture a goal and its context. Your saved work
          will appear here.
        </p>
        <div className={styles['homeActions']}>
          <Link to="/start" className={styles['primaryLink']}>
            Start New Project
          </Link>
        </div>
        <div className={styles['projectList']}>
          {loading ? (
            <div className={styles['homePlaceholder']}>
              <p>Loading projects…</p>
            </div>
          ) : error ? (
            <div className={styles['homePlaceholder']}>
              <p>{error}</p>
            </div>
          ) : projects.length === 0 ? (
            <div className={styles['homePlaceholder']}>
              <p>No projects yet. Create one to see it here.</p>
            </div>
          ) : (
            projects.map((project) => (
              <article key={project.id} className={styles['projectCard']}>
                <div className={styles['projectCardTop']}>
                  <p className={styles['projectStatus']}>
                    {project.status ?? 'unknown'}
                  </p>
                  <span className={styles['projectBadge']}>Project</span>
                </div>
                <h2 className={styles['projectTitleHome']}>{project.title}</h2>
                <div className={styles['projectCardActions']}>
                  <Link
                    to={`/projects/${project.id}`}
                    className={styles['secondaryLink']}
                  >
                    Details
                  </Link>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function StartProjectPage(): JSX.Element {
  const [goal, setGoal] = useState('');
  const [commitment, setCommitment] = useState<ProjectCommitment | ''>('');
  const [familiarity, setFamiliarity] = useState<ProjectFamiliarity | ''>('');
  const [workStyle, setWorkStyle] = useState<ProjectWorkStyle | ''>('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [submittedGoal, setSubmittedGoal] = useState<string | null>(null);
  const [intakeForm, setIntakeForm] = useState<FormDefinition | null>(null);
  const [focusQuestions, setFocusQuestions] =
    useState<FocusQuestionsDefinition | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const isReadyToSubmit = useMemo(
    () =>
      Boolean(
        goal.trim() &&
          commitment &&
          familiarity &&
          workStyle &&
          intakeForm?.questions.length,
      ),
    [goal, commitment, familiarity, workStyle, intakeForm],
  );

  useEffect(() => {
    const loadQuestions = async (): Promise<void> => {
      setFetchError(null);
      try {
        const res = await fetch(`${API_BASE}/project-intake/questions`);
        if (!res.ok) {
          throw new Error(`Failed to load intake questions: ${res.status}`);
        }
        const data = (await res.json()) as { form: FormDefinition };
        setIntakeForm(data.form);

        // TODO: use enum values here
        const commitmentQuestion = data.form.questions.find(
          (q) => q.id === 'time_commitment',
        );
        const familiarityQuestion = data.form.questions.find(
          (q) => q.id === 'familiarity',
        );
        const workStyleQuestion = data.form.questions.find(
          (q) => q.id === 'work_style',
        );

        setCommitment(
          (commitmentQuestion?.options[0]?.value as ProjectCommitment | undefined) ??
            '',
        );
        setFamiliarity(
          (familiarityQuestion?.options[0]?.value as ProjectFamiliarity | undefined) ??
            '',
        );
        setWorkStyle(
          (workStyleQuestion?.options[0]?.value as ProjectWorkStyle | undefined) ?? '',
        );
      } catch (error) {
        setFetchError(
          error instanceof Error
            ? error.message
            : 'Unable to load intake questions.',
        );
        setIntakeForm(null);
      }
    };

    void loadQuestions();
  }, []);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setStatus(null);
    setSubmittedGoal(null);
    setFocusQuestions(null);

    const trimmed = goal.trim();
    if (!trimmed) {
      setStatus('Please enter your goal.');
      setLoading(false);
      return;
    }
    if (!commitment || !familiarity || !workStyle) {
      setStatus('Please answer all intake questions.');
      setLoading(false);
      return;
    }

    try {
      setStatus('Building your context…');
      const res = await fetch(`${API_BASE}/projects/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal: trimmed,
          commitment,
          familiarity,
          workStyle,
        }),
      });

      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || 'Failed to start project');
      }

      setSubmittedGoal(trimmed);
      setGoal('');
      const payload = (await res.json()) as {
        focusQuestions: FocusQuestionsDefinition;
      };
      setFocusQuestions(payload.focusQuestions);
      setStatus('Focus questions are ready below.');
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : 'Failed to start project; check API connection.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles['page']}>
      <section className={styles['panel']}>
        <header className={styles['header']}>
          <p className={styles['eyebrow']}>New project</p>
          <h1 className={styles['title']}>Project intake</h1>
          <p className={styles['lead']}>
            Answer these to shape your plan. We&apos;ll build focus questions next.
          </p>
        </header>

        {fetchError ? (
          <p className={styles['status']}>{fetchError}</p>
        ) : (
          <form className={styles['form']} onSubmit={submit}>
            <label className={styles['field']}>
              <span>Goal</span>
              <input
                type="text"
                value={goal}
                onChange={(event) => setGoal(event.target.value)}
                placeholder="Ship a roadmap generator MVP"
                required
              />
            </label>

            <label className={styles['field']}>
              <span>Time commitment</span>
              <select
                value={commitment}
                onChange={(event) =>
                  setCommitment(event.target.value as ProjectCommitment)
                }
                required
              >
                {intakeForm?.questions
                  .find((q) => q.id === 'time_commitment')
                  ?.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
              </select>
            </label>

            <label className={styles['field']}>
              <span>Familiarity</span>
              <select
                value={familiarity}
                onChange={(event) =>
                  setFamiliarity(event.target.value as ProjectFamiliarity)
                }
                required
              >
                {intakeForm?.questions
                  .find((q) => q.id === 'familiarity')
                  ?.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
              </select>
            </label>

            <label className={styles['field']}>
              <span>Work style</span>
              <select
                value={workStyle}
                onChange={(event) =>
                  setWorkStyle(event.target.value as ProjectWorkStyle)
                }
                required
              >
                {intakeForm?.questions
                  .find((q) => q.id === 'work_style')
                  ?.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
              </select>
            </label>

            <button
              type="submit"
              className={styles['submit']}
              disabled={loading || !isReadyToSubmit}
            >
              {loading ? 'Building your context…' : 'Start project'}
            </button>
            {status && <p className={styles['status']}>{status}</p>}
          </form>
        )}
      </section>

      {submittedGoal && (
        <section className={styles['result']}>
          <h2>Submitted goal</h2>
          <p className={styles['projectTitle']}>{submittedGoal}</p>
          <p className={styles['projectMeta']}>
            Building your context…
          </p>
        </section>
      )}

      {focusQuestions && (
        <section className={styles['panel']}>
          <header className={styles['header']}>
            <p className={styles['eyebrow']}>Focus Questions</p>
            <h2 className={styles['title']}>Clarify your project</h2>
            <p className={styles['lead']}>
              Answer these next to refine your plan.
            </p>
          </header>
          <ol className={styles['detailList']}>
            {focusQuestions.questions.map((question) => (
              <li key={question.id}>
                <strong>{question.prompt}</strong>
                {question.options.length > 0 && (
                  <div>
                    {question.options.map((option) => (
                      <span key={option.value} className={styles['optionBadge']}>
                        {option.label}
                      </span>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ol>
        </section>
      )}
    </main>
  );
}

function StoryDetailsPage(): JSX.Element {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<ProjectContextProjectDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProject = async (): Promise<void> => {
      if (!projectId) {
        setError('Missing project id.');
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/projects/${projectId}`);
        if (res.status === 404) {
          setError('Project not found.');
          setProject(null);
          return;
        }
        if (!res.ok) {
          throw new Error(`Failed to load project: ${res.status}`);
        }
        const data = (await res.json()) as {
          project: ProjectContextProjectDto;
        };
        setProject(data.project);
      } catch (err) {
        console.warn('Could not load project', err);
        setError('Unable to load project details. Please try again.');
        setProject(null);
      } finally {
        setLoading(false);
      }
    };

    void loadProject();
  }, [projectId]);

  return (
    <div className={styles['home']}>
      <div className={styles['homeCard']}>
        <p className={styles['eyebrow']}>Project detail</p>
        <h1 className={styles['homeTitle']}>
          {project ? project.title : `Project ${projectId ?? ''}`}
        </h1>
        {loading ? (
          <p className={styles['lead']}>Loading project…</p>
        ) : error ? (
          <p className={styles['lead']}>{error}</p>
        ) : project ? (
          <>
            <p className={styles['lead']}>
              Status: {project.status} · Responses captured:{' '}
              {project.responses.length}
            </p>
            <div className={styles['projectDetailsSection']}>
              <h2>Responses</h2>
              <ul className={styles['detailList']}>
                {project.responses.map((response) => (
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
            </div>
            {project.milestones.length > 0 && (
              <div className={styles['projectDetailsSection']}>
                <h2>Milestones</h2>
                <ul className={styles['detailList']}>
                  {project.milestones.map((milestone) => (
                    <li key={milestone.id}>
                      <strong>{milestone.title}</strong>
                      <div>{milestone.summary}</div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : (
          <p className={styles['lead']}>No project details to show.</p>
        )}
        <div className={styles['homeActions']}>
          <Link to="/" className={styles['primaryLink']}>
            Back to projects
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
      <Route path="/start" element={<StartProjectPage />} />
      <Route path="/projects/:projectId" element={<StoryDetailsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
