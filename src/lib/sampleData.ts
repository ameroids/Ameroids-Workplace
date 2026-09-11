import { uid } from './format'
import type { Project, Transaction, Meeting, ActivityLog } from '../types'

const daysFromNow = (n: number) => {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}
const daysAgo = (n: number) => daysFromNow(-n)
const isoAgo = (hours: number) => new Date(Date.now() - hours * 3600 * 1000).toISOString()

export function buildSampleProjects(): Project[] {
  const p = (input: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'updates' | 'notes'>, updates: string[], notes: string[]): Project => {
    const id = uid()
    return {
      ...input,
      id,
      created_at: daysAgo(60),
      updated_at: daysAgo(1),
      updates: updates.map((text, i) => ({
        id: uid(),
        project_id: id,
        text,
        author: 'Ammar',
        created_at: isoAgo((updates.length - i) * 30),
      })),
      notes: notes.map((text) => ({ id: uid(), project_id: id, text, created_at: isoAgo(200) })),
    }
  }

  return [
    p(
      {
        name: 'Ameorids Website',
        client: 'Internal',
        description: 'Public marketing site and brand presence for Ameorids, including case studies and the careers page.',
        status: 'In Progress',
        priority: 'High',
        progress: 72,
        start_date: daysAgo(40),
        due_date: daysFromNow(9),
        assigned_to: 'Ammar',
      },
      ['Mobile navigation completed. SEO and deployment remaining.', 'Homepage completed.', 'Design system finalized.'],
      ['Use the new violet accent consistently across CTAs.'],
    ),
    p(
      {
        name: 'CrochetMart',
        client: 'CrochetMart Pvt Ltd',
        description: 'E-commerce storefront for a handmade crochet products brand, with catalog, cart and checkout.',
        status: 'Completed',
        priority: 'Medium',
        progress: 100,
        start_date: daysAgo(90),
        due_date: daysAgo(5),
        assigned_to: 'Ammar',
      },
      ['CrochetMart marked as Completed.', 'Client handover call completed.', 'Final QA pass done, zero critical bugs.'],
      ['Client wants a seasonal sale banner feature added later.'],
    ),
    p(
      {
        name: 'Campus Connect',
        client: 'Campus Connect Foundation',
        description: 'Student community platform connecting campus clubs, events and announcements.',
        status: 'In Progress',
        priority: 'High',
        progress: 48,
        start_date: daysAgo(30),
        due_date: daysFromNow(21),
        assigned_to: 'Ammar',
      },
      ['Campus Connect progress updated to 48%.', 'Event RSVP flow implemented.', 'Kickoff call completed with foundation team.'],
      ['Foundation wants onboarding to work without email verification for phase 1.'],
    ),
    p(
      {
        name: 'InvoiceFlow',
        client: 'Nimbus Traders',
        description: 'Lightweight invoicing and quotation tool for small trading businesses.',
        status: 'Pending',
        priority: 'Medium',
        progress: 10,
        start_date: daysFromNow(3),
        due_date: daysFromNow(45),
        assigned_to: 'Ammar',
      },
      ['Requirements document shared with client for sign-off.'],
      [],
    ),
    p(
      {
        name: 'CRM System',
        client: 'Internal',
        description: 'Lightweight CRM for tracking Ameorids leads, proposals and follow-ups.',
        status: 'Planning',
        priority: 'Low',
        progress: 5,
        start_date: daysFromNow(10),
        due_date: daysFromNow(70),
        assigned_to: 'Ammar',
      },
      ['Initial scope discussion completed.'],
      [],
    ),
    p(
      {
        name: 'Portfolio Platform',
        client: 'Internal',
        description: 'Template-driven portfolio builder Ameorids can offer to freelance clients.',
        status: 'On Hold',
        priority: 'Low',
        progress: 25,
        start_date: daysAgo(50),
        due_date: daysFromNow(60),
        assigned_to: 'Ammar',
      },
      ['Paused to prioritize Campus Connect delivery.', 'Template gallery drafted.'],
      ['Resume after Campus Connect ships.'],
    ),
    p(
      {
        name: 'Saffron POS',
        client: 'Saffron Diner',
        description: 'Point-of-sale and order management system for a restaurant chain.',
        status: 'In Progress',
        priority: 'Urgent',
        progress: 63,
        start_date: daysAgo(25),
        due_date: daysFromNow(6),
        assigned_to: 'Ammar',
      },
      ['Kitchen display system integrated.', 'Payments module tested with test terminal.'],
      ['Client asked for offline-mode support — flagged as phase 2.'],
    ),
    p(
      {
        name: 'HealthTrack',
        client: 'Wellbeing Clinic',
        description: 'Patient appointment scheduling and reminders system.',
        status: 'Pending',
        priority: 'Medium',
        progress: 0,
        start_date: daysFromNow(14),
        due_date: daysFromNow(80),
        assigned_to: 'Ammar',
      },
      ['Contract signed, awaiting advance payment.'],
      [],
    ),
    p(
      {
        name: 'EduPrep Dashboard',
        client: 'EduPrep Academy',
        description: 'Analytics dashboard for tracking student test performance across batches.',
        status: 'In Progress',
        priority: 'Medium',
        progress: 35,
        start_date: daysAgo(18),
        due_date: daysFromNow(30),
        assigned_to: 'Ammar',
      },
      ['Batch comparison charts added.', 'Data import pipeline from CSV completed.'],
      [],
    ),
    p(
      {
        name: 'Ameorids Internal Tools',
        client: 'Internal',
        description: 'Small internal utilities and scripts used across Ameorids projects.',
        status: 'Completed',
        priority: 'Low',
        progress: 100,
        start_date: daysAgo(120),
        due_date: daysAgo(60),
        assigned_to: 'Ammar',
      },
      ['Ameorids Internal Tools marked as Completed.'],
      [],
    ),
  ]
}

export function buildSampleTransactions(): Transaction[] {
  const t = (
    type: Transaction['type'],
    amount: number,
    description: string,
    category: string,
    daysBack: number,
    notes = '',
  ): Transaction => ({
    id: uid(),
    type,
    amount,
    description,
    category,
    date: daysAgo(daysBack),
    notes,
    created_at: isoAgo(daysBack * 24 + 2),
  })

  return [
    t('Received', 45000, 'CrochetMart milestone payment', 'Project milestone', 3),
    t('Received', 60000, 'Campus Connect advance', 'Advance', 12),
    t('Received', 30000, 'Saffron POS advance', 'Advance', 8),
    t('Received', 25000, 'Ameorids Internal Tools final payment', 'Final payment', 40),
    t('Received', 18000, 'InvoiceFlow booking advance', 'Advance', 1),
    t('Spent', 4200, 'Cloud & domain renewal', 'Hosting', 5),
    t('Spent', 1999, 'Design software subscription', 'Software', 15),
    t('Spent', 6000, 'Social media advertising — Campus Connect launch', 'Advertising', 9),
    t('Spent', 3500, 'Freelance illustration for Portfolio Platform', 'Development expenses', 20),
    t('Spent', 1200, 'Domain renewals (3 client projects)', 'Domain', 30),
    t('Wajebat', 10000, 'Wajebat contribution — September', 'Wajebat', 3),
    t('Wajebat', 8000, 'Wajebat contribution — August', 'Wajebat', 33),
  ]
}

export function buildSampleMeetings(): Meeting[] {
  const m = (input: Omit<Meeting, 'id' | 'created_at' | 'updated_at'>): Meeting => ({
    ...input,
    id: uid(),
    created_at: isoAgo(72),
    updated_at: isoAgo(24),
  })

  return [
    m({
      title: 'Ameorids Weekly Sync',
      date: daysFromNow(2),
      time: '11:00',
      participants: ['Ammar', 'Team'],
      agenda: 'Review progress across all active projects and blockers for the week.',
      notes: '',
      decisions: '',
      action_items: '',
      status: 'Upcoming',
    }),
    m({
      title: 'Campus Connect Client Call',
      date: daysFromNow(4),
      time: '16:30',
      participants: ['Ammar', 'Campus Connect Foundation'],
      agenda: 'Walk through the event RSVP flow and confirm phase 1 onboarding scope.',
      notes: '',
      decisions: '',
      action_items: '',
      status: 'Upcoming',
    }),
    m({
      title: 'CrochetMart Handover',
      date: daysAgo(4),
      time: '15:00',
      participants: ['Ammar', 'CrochetMart Pvt Ltd'],
      agenda: 'Final walkthrough of the storefront and admin panel before handover.',
      notes: 'Client was happy with the checkout flow and product filters.',
      decisions: 'Project marked as delivered. Support window of 30 days agreed.',
      action_items: 'Send final invoice. Share admin credentials document.',
      status: 'Completed',
    }),
    m({
      title: 'Saffron POS Kickoff',
      date: daysAgo(20),
      time: '10:00',
      participants: ['Ammar', 'Saffron Diner'],
      agenda: 'Kickoff discussion on POS requirements and kitchen display integration.',
      notes: 'Client wants receipt printer support in v1.',
      decisions: 'Scope locked for v1, offline mode moved to phase 2.',
      action_items: 'Share technical proposal by Friday.',
      status: 'Completed',
    }),
  ]
}

export function buildSampleActivity(projects: Project[], transactions: Transaction[], meetings: Meeting[]): ActivityLog[] {
  const logs: ActivityLog[] = [
    { id: uid(), kind: 'project_status', description: 'CrochetMart marked as Completed', created_at: isoAgo(70) },
    { id: uid(), kind: 'transaction', description: '₹45,000 received from CrochetMart', created_at: isoAgo(72) },
    { id: uid(), kind: 'project_progress', description: 'Campus Connect progress updated to 48%', created_at: isoAgo(40) },
    { id: uid(), kind: 'meeting_created', description: 'Weekly Sync meeting added', created_at: isoAgo(20) },
    { id: uid(), kind: 'transaction', description: 'Wajebat contribution of ₹10,000 recorded', created_at: isoAgo(72) },
    { id: uid(), kind: 'project_update', description: 'Mobile navigation completed on Ameorids Website', created_at: isoAgo(30) },
    { id: uid(), kind: 'transaction', description: '₹60,000 received from Campus Connect (advance)', created_at: isoAgo(288) },
    { id: uid(), kind: 'meeting_updated', description: 'CrochetMart Handover notes updated', created_at: isoAgo(96) },
    { id: uid(), kind: 'project_created', description: 'InvoiceFlow added as a new project', created_at: isoAgo(24) },
    { id: uid(), kind: 'transaction', description: '₹6,000 spent on advertising for Campus Connect', created_at: isoAgo(216) },
  ]
  return logs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}
