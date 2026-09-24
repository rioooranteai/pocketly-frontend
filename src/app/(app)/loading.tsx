/** Shown inside the app shell while a page's server part loads. */
export default function AppLoading() {
  return (
    <div role="status" aria-label="Memuat halaman" className="space-y-5">
      <div className="h-[68px] animate-pulse rounded-[20px] bg-card" />
      <div className="space-y-4 rounded-[20px] bg-card p-5 lg:p-6">
        <div className="h-7 w-40 animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-64 max-w-full animate-pulse rounded-md bg-muted" />
        <div className="h-64 animate-pulse rounded-2xl bg-muted/60" />
      </div>
    </div>
  );
}
