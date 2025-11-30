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
        {recommendations.length > 0 ? (
          recommendations.map((rec, idx) => (
            <li key={idx} className="rec-item">
              {rec}
            </li>
          ))
        ) : (
          <li className="rec-item">
            No recommendations yet — fill in more data to get personalized suggestions.
          </li>
        )}
      </ul>
    </section>
  );
}
