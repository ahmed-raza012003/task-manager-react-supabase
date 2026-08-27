import { db } from './db'
import { createId, nowIso } from '@/lib/id'
import { toDateKey } from '@/lib/dateHelpers'
import { addDays, subDays } from 'date-fns'
import { seedDefaultColumns } from './kanbanColumns'
import { ensureSettings, updateSettings } from './settings'
import type { ChecklistItem, Label, Note, Project, Task, TimeEntry } from './types'

function dk(offset: number): string {
  return toDateKey(addDays(new Date(), offset))
}

let seedingPromise: Promise<void> | null = null

/** Memoized so concurrent callers (e.g. React StrictMode's double effect invocation) share one run. */
export function seedDemoData(): Promise<void> {
  if (!seedingPromise) seedingPromise = runSeed()
  return seedingPromise
}

async function runSeed(): Promise<void> {
  const settings = await ensureSettings()
  if (settings.seeded) return

  const existingProjects = await db.projects.count()
  if (existingProjects > 0) {
    await updateSettings({ seeded: true })
    return
  }

  const ts = nowIso()

  const labelDefs: { name: string; color: string }[] = [
    { name: 'Development', color: '#3E8FF0' },
    { name: 'Business', color: '#D9A515' },
    { name: 'Personal', color: '#1F9D66' },
    { name: 'Marketing', color: '#D64F94' },
    { name: 'Urgent', color: '#E0483E' },
    { name: 'Learning', color: '#8A5CF6' },
    { name: 'Client', color: '#1FA88A' },
    { name: 'Startup', color: '#D97B15' },
  ]
  const labels: Label[] = labelDefs.map((l) => ({
    id: createId(),
    name: l.name,
    color: l.color,
    archivedAt: null,
    deletedAt: null,
    createdAt: ts,
  }))
  await db.labels.bulkAdd(labels)
  const L = Object.fromEntries(labels.map((l) => [l.name, l.id]))

  const projectDefs: Array<Omit<Project, 'id' | 'sortOrder' | 'archivedAt' | 'deletedAt' | 'createdAt' | 'updatedAt'>> = [
    { name: 'Website Redesign', description: 'Rebuild the marketing site with a new visual identity.', color: '#6D5EF5', icon: 'Code2', status: 'active', priority: 'high', dueDate: dk(18) },
    { name: 'Startup Launch', description: 'Everything needed to get the product in front of first users.', color: '#D97B15', icon: 'Rocket', status: 'active', priority: 'urgent', dueDate: dk(9) },
    { name: 'Learning: System Design', description: 'Structured study plan for distributed systems fundamentals.', color: '#8A5CF6', icon: 'GraduationCap', status: 'active', priority: 'medium', dueDate: dk(45) },
    { name: 'Personal', description: 'Life admin, health, and home tasks.', color: '#1F9D66', icon: 'Home', status: 'active', priority: null, dueDate: null },
    { name: 'Q3 Marketing Push', description: 'Content calendar and campaign prep for next quarter.', color: '#D64F94', icon: 'Megaphone', status: 'planning', priority: 'medium', dueDate: dk(30) },
  ]

  const projects: Project[] = projectDefs.map((p, i) => ({
    ...p,
    id: createId(),
    sortOrder: (i + 1) * 1024,
    archivedAt: null,
    deletedAt: null,
    createdAt: ts,
    updatedAt: ts,
  }))
  await db.projects.bulkAdd(projects)

  const columnsByProject: Record<string, Awaited<ReturnType<typeof seedDefaultColumns>>> = {}
  for (const p of projects) {
    columnsByProject[p.name] = await seedDefaultColumns(p.id)
  }
  const col = (projectName: string, colName: string) => columnsByProject[projectName].find((c) => c.name === colName)!.id
  const pid = (name: string) => projects.find((p) => p.name === name)!.id

  interface TaskSeed {
    title: string
    project?: string
    column?: string
    status: Task['status']
    priority: Task['priority']
    dueDate: string | null
    dueTime?: string | null
    timeOfDay?: Task['timeOfDay']
    labels?: string[]
    estimateMinutes?: number | null
    completedAt?: string | null
    checklist?: string[]
    description?: string
  }

  const taskSeeds: TaskSeed[] = [
    { title: 'Define new brand color palette', project: 'Website Redesign', column: 'Done', status: 'done', priority: 'high', dueDate: dk(-6), labels: [L.Development, L.Business], estimateMinutes: 90, completedAt: subDays(new Date(), 6).toISOString(), checklist: ['Audit current palette', 'Explore 3 directions', 'Get sign-off'] },
    { title: 'Design homepage hero section', project: 'Website Redesign', column: 'In Progress', status: 'in_progress', priority: 'high', dueDate: dk(1), timeOfDay: 'morning', labels: [L.Development], estimateMinutes: 120, checklist: ['Wireframe', 'High-fidelity mock', 'Mobile variant'], description: 'Focus on a strong first impression above the fold.' },
    { title: 'Build responsive navbar', project: 'Website Redesign', column: 'To Do', status: 'todo', priority: 'medium', dueDate: dk(3), labels: [L.Development], estimateMinutes: 90, checklist: ['Desktop layout', 'Mobile menu', 'Scroll behavior'] },
    { title: 'Build pricing page', project: 'Website Redesign', column: 'To Do', status: 'todo', priority: 'medium', dueDate: dk(6), labels: [L.Development, L.Business] },
    { title: 'Connect contact form backend', project: 'Website Redesign', column: 'Backlog', status: 'todo', priority: 'low', dueDate: null, labels: [L.Development] },
    { title: 'Test on mobile devices', project: 'Website Redesign', column: 'Backlog', status: 'todo', priority: 'low', dueDate: dk(15) },
    { title: 'Deploy to production', project: 'Website Redesign', column: 'Backlog', status: 'todo', priority: 'high', dueDate: dk(18), labels: [L.Urgent] },

    { title: 'Finalize pitch deck', project: 'Startup Launch', column: 'In Progress', status: 'in_progress', priority: 'urgent', dueDate: dk(0), timeOfDay: 'afternoon', labels: [L.Startup, L.Urgent], estimateMinutes: 60, checklist: ['Problem slide', 'Market size', 'Traction', 'Ask'] },
    { title: 'Reach out to 10 beta users', project: 'Startup Launch', column: 'To Do', status: 'todo', priority: 'high', dueDate: dk(2), labels: [L.Startup, L.Client], estimateMinutes: 45 },
    { title: 'Set up analytics dashboard', project: 'Startup Launch', column: 'To Do', status: 'todo', priority: 'medium', dueDate: dk(4), labels: [L.Development, L.Startup] },
    { title: 'Draft landing page copy', project: 'Startup Launch', column: 'Review', status: 'in_progress', priority: 'high', dueDate: dk(1), labels: [L.Marketing, L.Startup] },
    { title: 'Incorporate the company', project: 'Startup Launch', column: 'Done', status: 'done', priority: 'urgent', dueDate: dk(-10), completedAt: subDays(new Date(), 10).toISOString(), labels: [L.Startup] },
    { title: 'Open business bank account', project: 'Startup Launch', column: 'Done', status: 'done', priority: 'high', dueDate: dk(-8), completedAt: subDays(new Date(), 8).toISOString() },
    { title: 'Plan launch week schedule', project: 'Startup Launch', column: 'Backlog', status: 'todo', priority: 'medium', dueDate: dk(9) },

    { title: 'Read "Designing Data-Intensive Applications" ch.5', project: 'Learning: System Design', column: 'In Progress', status: 'in_progress', priority: 'medium', dueDate: dk(2), labels: [L.Learning], estimateMinutes: 60 },
    { title: 'Watch consistent hashing lecture', project: 'Learning: System Design', column: 'To Do', status: 'todo', priority: 'low', dueDate: dk(5), labels: [L.Learning] },
    { title: 'Design a URL shortener (practice)', project: 'Learning: System Design', column: 'To Do', status: 'todo', priority: 'medium', dueDate: dk(10), labels: [L.Learning], checklist: ['Requirements', 'API design', 'Data model', 'Scale estimation'] },
    { title: 'Summarize CAP theorem notes', project: 'Learning: System Design', column: 'Done', status: 'done', priority: 'low', dueDate: dk(-3), completedAt: subDays(new Date(), 3).toISOString(), labels: [L.Learning] },

    { title: 'Weekly planning session', project: 'Personal', column: 'To Do', status: 'todo', priority: 'medium', dueDate: dk(0), timeOfDay: 'evening', labels: [L.Personal] },
    { title: 'Book dentist appointment', project: 'Personal', column: 'Backlog', status: 'todo', priority: 'low', dueDate: dk(7), labels: [L.Personal] },
    { title: 'Pay electricity bill', project: 'Personal', column: 'To Do', status: 'todo', priority: 'high', dueDate: dk(-1), labels: [L.Personal, L.Urgent] },
    { title: 'Grocery run', project: 'Personal', column: 'To Do', status: 'todo', priority: null, dueDate: dk(0), timeOfDay: 'afternoon' },
    { title: 'Gym — leg day', project: 'Personal', column: 'To Do', status: 'todo', priority: null, dueDate: dk(0), timeOfDay: 'morning' },
    { title: 'Call mom', project: 'Personal', column: 'To Do', status: 'todo', priority: null, dueDate: dk(0), timeOfDay: 'evening' },

    { title: 'Draft content calendar', project: 'Q3 Marketing Push', column: 'To Do', status: 'todo', priority: 'medium', dueDate: dk(12), labels: [L.Marketing] },
    { title: 'Research competitor campaigns', project: 'Q3 Marketing Push', column: 'Backlog', status: 'todo', priority: 'low', dueDate: dk(20), labels: [L.Marketing] },

    { title: 'Reply to unread emails', status: 'todo', priority: 'low', dueDate: dk(0) },
    { title: 'Clear desktop downloads folder', status: 'todo', priority: null, dueDate: null },
  ]

  const tasks: Task[] = []
  const checklistItems: ChecklistItem[] = []

  taskSeeds.forEach((s, i) => {
    const taskId = createId()
    tasks.push({
      id: taskId,
      projectId: s.project ? pid(s.project) : null,
      columnId: s.project && s.column ? col(s.project, s.column) : null,
      title: s.title,
      description: s.description ?? '',
      status: s.status,
      priority: s.priority,
      labelIds: s.labels ?? [],
      dueDate: s.dueDate,
      dueTime: s.dueTime ?? null,
      startDate: null,
      timeOfDay: s.timeOfDay ?? null,
      estimateMinutes: s.estimateMinutes ?? null,
      completedAt: s.completedAt ?? null,
      recurrence: null,
      recurrenceRootId: null,
      sortOrder: (i + 1) * 1024,
      archivedAt: null,
      deletedAt: null,
      createdAt: ts,
      updatedAt: ts,
    })
    s.checklist?.forEach((title, ci) => {
      checklistItems.push({
        id: createId(),
        taskId,
        title,
        completed: s.status === 'done' || (s.status === 'in_progress' && ci === 0),
        sortOrder: (ci + 1) * 1024,
        createdAt: ts,
      })
    })
  })

  await db.tasks.bulkAdd(tasks)
  if (checklistItems.length) await db.checklistItems.bulkAdd(checklistItems)

  const heroTask = tasks.find((t) => t.title === 'Design homepage hero section')
  const timeEntries: TimeEntry[] = []
  if (heroTask) {
    const start = subDays(new Date(), 1)
    start.setHours(10, 15, 0, 0)
    const end = new Date(start.getTime() + 52 * 60 * 1000)
    timeEntries.push({
      id: createId(),
      taskId: heroTask.id,
      startedAt: start.toISOString(),
      endedAt: end.toISOString(),
      durationSeconds: 52 * 60,
      isRunning: 0,
      createdAt: ts,
    })
  }
  const deckTask = tasks.find((t) => t.title === 'Finalize pitch deck')
  if (deckTask) {
    const start = new Date()
    start.setHours(9, 0, 0, 0)
    const end = new Date(start.getTime() + 38 * 60 * 1000)
    timeEntries.push({
      id: createId(),
      taskId: deckTask.id,
      startedAt: start.toISOString(),
      endedAt: end.toISOString(),
      durationSeconds: 38 * 60,
      isRunning: 0,
      createdAt: ts,
    })
  }
  if (timeEntries.length) await db.timeEntries.bulkAdd(timeEntries)

  const notes: Note[] = [
    {
      id: createId(),
      title: 'Website redesign — brand direction',
      content: 'Leaning toward a warm, editorial feel rather than generic SaaS blue. Reference: Linear, Arc browser, Cron.',
      projectId: pid('Website Redesign'),
      taskId: null,
      labelIds: [L.Development],
      pinned: true,
      archivedAt: null,
      deletedAt: null,
      createdAt: ts,
      updatedAt: ts,
    },
    {
      id: createId(),
      title: 'Investor list — first pass',
      content: 'Prioritize angels with prior seed-stage B2B SaaS experience. Warm intros first, cold outreach second.',
      projectId: pid('Startup Launch'),
      taskId: null,
      labelIds: [L.Startup],
      pinned: false,
      archivedAt: null,
      deletedAt: null,
      createdAt: ts,
      updatedAt: ts,
    },
    {
      id: createId(),
      title: 'Books to read next',
      content: '- Designing Data-Intensive Applications\n- The Manager\'s Path\n- Thinking in Systems',
      projectId: null,
      taskId: null,
      labelIds: [L.Learning, L.Personal],
      pinned: true,
      archivedAt: null,
      deletedAt: null,
      createdAt: ts,
      updatedAt: ts,
    },
  ]
  await db.notes.bulkAdd(notes)

  await updateSettings({ seeded: true })
}
