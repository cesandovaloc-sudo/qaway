// Barrel curado Hub. Re-exports explícitos para preservar tree-shaking de Vite.
// No usar `export * from 'lucide-react'`. Solo lo que el Hub consume.
// Afines CRM + Gestor v2 comparten este set. Creador usa subset + propios.

export {
  Search,
  Plus,
  X,
  Bell,
  Calendar,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Settings,
  Settings2,
  User,
  Users,
  Layers,
  LayoutDashboard,
  FolderKanban,
  Kanban,
  FileText,
  BarChart3,
  MessageSquare,
  Zap,
  Target,
  Briefcase,
  Clock,
  Check,
  CheckCircle2,
  AlertCircle,
  SlidersHorizontal,
  Share2,
  ExternalLink,
  TrendingUp,
  Sparkles,
  PenTool,
  BookOpen,
  Building2,
  LogOut,
  Workflow,
} from 'lucide-react'

// Mapa semántico (solo documentación, no importa componentes).
// CRM/Gestor: dashboard, leads, pipeline, clientes, tareas, mensajes
// Creador: dashboard, ideas, scripts, calendario, activos, distribucion
export const HUB_ICON_NAMES = {
  dashboard: 'LayoutDashboard|BarChart3',
  leads: 'Users',
  pipeline: 'Layers|Kanban',
  search: 'Search',
  plus: 'Plus',
  bell: 'Bell',
  calendar: 'Calendar',
}
