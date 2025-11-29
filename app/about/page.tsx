export const metadata = {
    title: "About | SpendHive",
    description: "Learn how SpendHive helps you track expenses and budgets.",
  };
  
  export default function AboutPage() {
    return (
      <main className="page">
        <div className="page-inner">
          <section className="page-hero">
            <h1>About SpendHive</h1>
            <p>
              SpendHive was built to make personal finance feel less stressful and
              more intentional. We help you see where every dollar goes so you can
              save, invest, and spend with confidence.
            </p>
          </section>
  
          <section className="page-grid">
            <div className="page-card">
              <h2>Why we exist</h2>
              <p>
                Most budgeting tools feel complicated or overwhelming. SpendHive
                focuses on clarity: simple inputs, smart insights, and a clean
                view of your money.
              </p>
            </div>
            <div className="page-card">
              <h2>What you can do</h2>
              <p>
                Track daily expenses, compare months, monitor saving goals, and
                spot patterns in your spending — all in one dashboard.
              </p>
            </div>
            <div className="page-card">
              <h2>Built for real life</h2>
              <p>
                Whether you&apos;re managing rent, bills, subscriptions, or side
                hustles, SpendHive adapts to the way you actually live and spend.
              </p>
            </div>
          </section>
        </div>
      </main>
    );
  }  