export const runInBackground = (fn: () => Promise<any>) => {
  setImmediate(() => {
    fn().catch((err) => {
      console.error("Background task failed:", err);
    });
  });
};
