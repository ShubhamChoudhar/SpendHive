import React from "react";

type Props = {
  recommendations: string[];
};

export default function RecommendationsSection({ recommendations }: Props) {
  return (
    <section className="card">
      <h2>Personalized Recommendations</h2>
      <p className="disclaimer">
        These are simple rule-based suggestions generated from your inputs and are{" "}
        <strong>not</strong> professional financial advice.
      </p>
      <ul className="recs-list">
        {recommendations.map((rec, idx) => (
          <li key={idx}>{rec}</li>
        ))}
      </ul>
    </section>
  );
}