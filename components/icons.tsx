import {
  ChevronDown,
  ChevronRight,
  Folder,
  FolderLock,
  File,
  PanelLeftClose,
  PanelRightClose,
  Send,
  Save,
  Plus,
  Upload,
  Pencil,
  Copy,
  Trash2,
  Download,
  Settings,
  Code2,
  HardDrive,
  Loader2,
  CheckCircle2,
  KeyRound,
  Eye,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import React from 'react';

export const LogoIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M12 12H9.5C8.12 12 7 10.88 7 9.5V9.5C7 8.12 8.12 7 9.5 7H12" />
      <path d="M12 12L15 15" />
      <path d="M12 7v10" />
    </svg>
  );

export {
  ChevronDown as ChevronDownIcon,
  ChevronRight as ChevronRightIcon,
  Folder as FolderIcon,
  FolderLock as FolderLockIcon,
  File as FileIcon,
  PanelLeftClose as PanelLeftCloseIcon,
  PanelRightClose as PanelRightCloseIcon,
  Send as SendIcon,
  Save as SaveIcon,
  Plus as PlusIcon,
  Upload as UploadIcon,
  Pencil as PencilIcon,
  Copy as CopyIcon,
  Trash2 as Trash2Icon,
  Download as DownloadIcon,
  Settings as SettingsIcon,
  Code2 as CodeIcon,
  HardDrive as HardDriveIcon,
  Loader2 as LoaderIcon,
  CheckCircle2 as CheckCircleIcon,
  KeyRound as KeyIcon,
  Eye as EyeIcon,
  RefreshCw as RefreshCwIcon,
  AlertTriangle as AlertTriangleIcon,
};