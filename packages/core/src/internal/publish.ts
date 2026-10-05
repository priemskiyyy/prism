export type Notify = () => void;

export const publish = (notifications: Notify[]) => {
  for (const notify of notifications) {
    notify();
  }
};
