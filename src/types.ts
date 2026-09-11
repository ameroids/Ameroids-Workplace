export type ProjectStatus = 'Planning' | 'Pending' | 'In Progress' | 'On Hold' | 'Completed'
export type ProjectPriority = 'Low' | 'Medium' | 'High' | 'Urgent'

export interface ProjectUpdate {
  id: string
  project_id: string
  text: string
  author: string
  created_at: string
}

export interface ProjectNote {
  id: string
  project_id: string
  text: string
  created_at: string
}

export interface Project {
  id: string
  name: string
  client: string
  description: string
  status: ProjectStatus
  priority: ProjectPriority
  progress: number
  start_date: string | null
  due_date: string | null
  assigned_to: string
  created_at: string
  updated_at: string
  updates: ProjectUpdate[]
  notes: ProjectNote[]
}

export type TransactionType = 'Received' | 'Spent' | 'Wajebat'

export interface Transaction {
  id: string
  type: TransactionType
  amount: number
  description: string
  category: string
  date: string
  notes: string
  created_at: string
}

export type MeetingStatus = 'Upcoming' | 'Completed' | 'Cancelled'

export interface Meeting {
  id: string
  title: string
  date: string
  time: string
  participants: string[]
  agenda: string
  notes: string
  decisions: string
  action_items: string
  status: MeetingStatus
  created_at: string
  updated_at: string
}

export type ActivityKind =
  | 'project_created'
  | 'project_status'
  | 'project_progress'
  | 'project_update'
  | 'transaction'
  | 'meeting_created'
  | 'meeting_updated'

export interface ActivityLog {
  id: string
  kind: ActivityKind
  description: string
  created_at: string
}

export interface WorkspaceSettings {
  workspace_name: string
  currency: 'INR'
  theme: 'dark'
  notifications_enabled: boolean
  time_zone: string
  date_format: string
}

export type NotificationKind =
  | 'deadline'
  | 'meeting'
  | 'completed'
  | 'transaction'
  | 'update'

export interface AppNotification {
  id: string
  kind: NotificationKind
  title: string
  description: string
  created_at: string
  read: boolean
}
