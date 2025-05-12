import { useQuery } from "@apollo/client";
import { useParams, Link } from "react-router-dom";
import { GET_COUNTRY_BY_CODE } from "../api/example";
import "../styles/CountryDetails.css";

export function CountryDetailsPage() {
  const { code } = useParams<{ code: string }>();
  const { loading, error, data } = useQuery(GET_COUNTRY_BY_CODE, {
    variables: { code },
    skip: !code,
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading country: {error.message}</p>;
  if (!data?.country) return <p>Country not found</p>;

  const { country } = data;

  return (
    <div className="country-details-container">
      <div className="country-details-card">
        <div className="country-flag-large">{country.emoji}</div>
        <h1>Name : {country.name} ({country.code})</h1>
        {country.continent && (
          <h2>Continent : {country.continent.name}</h2>
        )}
        <Link to="/" className="back-link">Back to Countries</Link>
      </div>
    </div>
  );
} 