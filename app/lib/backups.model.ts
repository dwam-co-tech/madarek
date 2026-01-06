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
