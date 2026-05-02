import Sidebar from '@/components/Sidebar';
import { ClassesManagementDashboard } from '@/components/ClassesManagementDashboard';

export default function ClassesPage() {
  return (
    <div className="page-shell">
      <Sidebar />

      <main className="page-main">
        <div className="page-main-inner">
          <section className="hero-panel">
            <div className="space-y-4">
              <span className="chip-soft">Classes console</span>
              <div className="space-y-3">
                <h1 className="text-4xl font-bold tracking-tight text-gradient sm:text-5xl">
                  Classes Management
                </h1>
                <p className="max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
                  Create new classes, edit sections, and keep the roster clean with a focused layout
                  and reusable form styling.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="surface-chip">
                <div className="text-2xl font-bold text-foreground">Fast</div>
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Save flow</div>
              </div>
              <div className="surface-chip">
                <div className="text-2xl font-bold text-foreground">Clear</div>
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Class details</div>
              </div>
              <div className="surface-chip">
                <div className="text-2xl font-bold text-foreground">Styled</div>
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Buttons & inputs</div>
              </div>
            </div>
          </section>

          <section className="page-card">
            <ClassesManagementDashboard />
          </section>
        </div>
      </main>
    </div>
  );
}
