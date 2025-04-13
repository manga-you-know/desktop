export interface UpdateInfo {
  updateAvailable: boolean;
  version?: string;
  changelog?: string;
  url: string;
  fetchUpdate: () => Promise<void>;
}
