import { ArrowRight, Layers } from "lucide-react";
export function LoginPage({ error }: { error: string }) {
  return (
    <main className="login">
      <div className="brand">
        <span className="brand-icon">
          <Layers size={22} />
        </span>{" "}
        PeopleSpace
      </div>
      <div className="login-card">
        <span className="eyebrow">YOUR PEOPLE. ONE PLACE.</span>
        <h1>
          A little more connected.
          <br />A lot more organized.
        </h1>
        <p>
          A clear view of your people, their roles, and the communities they
          belong to.
        </p>
        <a className="button" href="/auth/login">
          Sign in to your workspace <ArrowRight size={18} />
        </a>
        <small>Secure sign-in with your organization’s identity provider</small>
        {error && (
          <div role="alert" className="error">
            {error}
          </div>
        )}
      </div>
      <div className="login-footer">
        Built around people. Designed for clarity.
      </div>
    </main>
  );
}
