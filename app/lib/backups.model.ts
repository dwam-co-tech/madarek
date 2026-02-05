export type CreateBackupPayload = {
  mode: 'full';
};

export type CreateBackupResponse = {
  success: boolean;
  mode: 'full';
  message: string;
};

export type UploadBackupResponse = {
  success: boolean;
  message: string;
  file_name: string;
};

export type BackupDTO = {
  file_name: string;
  file_size: string;
  created_at: string;
  download_link: string;
};

export type GetBackupsResponse = BackupDTO[];

export type RestoreBackupResponse = {
  success: boolean;
  message: string;
};

export type BackupHistoryItemDTO = {
  id: number;
  type: string;
  status: string;
  file_name: string | null;
  file_size: string | null;
  message: string;
  user_id: number | null;
  created_at: string;
  updated_at: string;
};

export type GetBackupHistoryResponse = BackupHistoryItemDTO[];

export type DeleteBackupResponse = {
  success: boolean;
  message: string;
};

export type BackupDiagnosticsResponse = {
  os_family: string;
  php_version: string;
  mysqldump: {
    dump_binary_path: string | null;
    looks_windows_path: boolean;
    invalid_for_os: boolean;
    candidate?: string | null;
    found_in_dump_binary_path: boolean | null;
    is_executable_in_dump_binary_path?: boolean | null;
    version_exit_code?: number | null;
    version_stdout?: string | null;
    version_stderr?: string | null;
    shell_exec_enabled: boolean;
    found_in_path: boolean | null;
    which: string | null;
  };
  queue: {
    default: string;
    driver: string | null;
    is_sync: boolean;
    pending_jobs_count: number | null;
    oldest_pending_job_age_seconds: number | null;
    failed_jobs_count: number | null;
  };
  scheduler: {
    last_tick: string | null;
    age_seconds: number | null;
    ok: boolean | null;
  };
  latest_create: {
    status: string;
    message: string;
    created_at: string;
  } | null;
  manual_backup_executes_immediately: boolean;
};
