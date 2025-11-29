export const metadata = {
    title: "Features | SpendHive",
    description: "See what SpendHive can do for your budgeting.",
  };
  
  export default function FeaturesPage() {
    return (
      <main className="page">
        <div className="page-inner">
          <section className="page-hero">
            <h1>Features</h1>
            <p>
              Everything you need to stay on top of your money — without the
              clutter or complexity.
            </p>
          </section>
  
          <section className="page-grid">
            <div className="page-card">
              <h2>Smart expense tracking</h2>
              <p>
                Log every expense in seconds, organize by category, and instantly
                see how your month is shaping up.
              </p>
            </div>
            <div className="page-card">
              <h2>Monthly comparisons</h2>
              <p>
                Compare spending month-over-month to spot trends, leaks, and
                opportunities to save more.
              </p>
            </div>
            <div className="page-card">
              <h2>Goals & savings</h2>
              <p>
                Set realistic goals and watch your progress update automatically
                as you save.
              </p>
            </div>
          </section>
        </div>
      </main>
    );
  }  