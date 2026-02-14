import type { JSX } from 'react';
import styles from '../app.module.css';

interface SubmittedGoalProps {
  goal: string;
}

export const SubmittedGoal = ({ goal }: SubmittedGoalProps): JSX.Element => (
  <section className={styles['result']}>
    <h2>Submitted goal</h2>
    <p className={styles['projectTitle']}>{goal}</p>
    <p className={styles['projectMeta']}>Building your context…</p>
  </section>
);

export default SubmittedGoal;
