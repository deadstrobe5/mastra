import { boardFlow, workBoard } from '@mastra/factory/boards';

import type { BoardCatalogResponse, InstalledBoardInfo } from '../../src/api/types';

export const releaseBoard: InstalledBoardInfo = {
  id: 'release',
  title: 'Release Preview',
  initialPhase: 'queued',
  phases: [
    { id: 'queued', title: 'Queued', kind: 'resting', transitions: [{ outcome: null, to: 'preparing' }] },
    {
      id: 'preparing',
      title: 'Preparing',
      kind: 'working',
      role: 'release-preparer',
      transitions: [{ outcome: null, to: 'shipping' }],
    },
    {
      id: 'shipping',
      title: 'Shipping',
      kind: 'working',
      role: 'release-publisher',
      transitions: [{ outcome: null, to: 'shipped' }],
    },
    { id: 'shipped', title: 'Shipped', kind: 'terminal', transitions: [] },
  ],
};

const phase = (
  id: string,
  kind: 'resting' | 'working' | 'terminal',
  nextPhases: string[],
  context?: string,
): InstalledBoardInfo['phases'][number] => ({
  id,
  name: id.charAt(0).toUpperCase() + id.slice(1),
  title: id.charAt(0).toUpperCase() + id.slice(1),
  kind,
  nextPhases,
  ...(context ? { context, role: context } : {}),
  transitions: nextPhases.map(to => ({ outcome: null, to })),
});

/** A board running the pull request loop under its own phase names, as the catalog sends it. */
export const shipBoard: InstalledBoardInfo = {
  id: 'ship',
  name: 'Ship',
  title: 'Ship',
  initialPhase: 'inbox',
  flow: {
    triage: 'think',
    build: 'make',
    selfReview: 'check',
    pullRequestReview: 'pr',
    completed: 'shipped',
    canceled: 'dropped',
  },
  phases: [
    phase('inbox', 'resting', ['think', 'make', 'pr', 'dropped']),
    phase('think', 'working', ['inbox', 'make', 'dropped'], 'triage'),
    phase('make', 'working', ['check', 'pr', 'dropped'], 'work'),
    phase('check', 'working', ['make', 'pr', 'inbox'], 'review'),
    phase('pr', 'working', ['shipped', 'dropped', 'inbox'], 'review'),
    phase('shipped', 'terminal', ['pr']),
    phase('dropped', 'terminal', ['inbox']),
  ],
};

/** The built-in Work board as the catalog route sends it, read off the real declaration. */
export const workBoardInfo: InstalledBoardInfo = {
  id: workBoard.id,
  name: workBoard.name,
  title: workBoard.name,
  initialPhase: workBoard.initialPhase,
  flow: catalogFlow(boardFlow(workBoard)),
  phases: Object.entries(workBoard.phases).map(([id, phase]) => ({
    id,
    name: phase.name,
    title: phase.name,
    kind: phase.kind,
    nextPhases: [...phase.nextPhases],
    ...(phase.kind === 'working' ? { context: phase.runner.context, role: phase.runner.context } : {}),
    transitions: (workBoard.transitions[id as keyof typeof workBoard.phases] ?? []).map(({ outcome, to }) => ({
      outcome,
      to,
    })),
  })),
};

function catalogFlow(flow: ReturnType<typeof boardFlow>): NonNullable<InstalledBoardInfo['flow']> {
  return {
    ...(flow.triage ? { triage: flow.triage } : {}),
    ...(flow.build ? { build: flow.build } : {}),
    ...(flow.selfReview ? { selfReview: flow.selfReview } : {}),
    ...(flow.pullRequestReview ? { pullRequestReview: flow.pullRequestReview } : {}),
    ...(flow.completed ? { completed: flow.completed.phase } : {}),
    ...(flow.canceled ? { canceled: flow.canceled.phase } : {}),
  };
}

export const builtinBoardCatalog: BoardCatalogResponse = { boards: [workBoardInfo] };

/** The retired Review board, which the server still serves to a project with open cards on it. */
export const keptReviewBoard: InstalledBoardInfo = {
  id: 'review',
  title: 'Review',
  name: 'Review',
  initialPhase: 'intake',
  flow: { pullRequestReview: 'review', completed: 'done', canceled: 'canceled' },
  phases: [
    {
      id: 'intake',
      title: 'Intake',
      kind: 'resting',
      nextPhases: ['review', 'done', 'canceled'],
      transitions: [
        { outcome: null, to: 'review' },
        { outcome: null, to: 'done' },
        { outcome: null, to: 'canceled' },
      ],
    },
    {
      id: 'review',
      title: 'Reviewing',
      kind: 'working',
      context: 'review',
      role: 'review',
      nextPhases: ['intake', 'done', 'canceled'],
      transitions: [
        { outcome: null, to: 'intake' },
        { outcome: null, to: 'done' },
        { outcome: null, to: 'canceled' },
      ],
    },
    { id: 'done', title: 'Done', kind: 'terminal', transitions: [{ outcome: null, to: 'review' }] },
    { id: 'canceled', title: 'Canceled', kind: 'terminal', transitions: [{ outcome: null, to: 'review' }] },
  ],
};
