export interface UpdateInfo {
  updateAvaible: boolean;
  version?: string;
  changelog?: string;
  url: string;
  fetchUpdate: () => Promise<void>;
}
