import { useQuery } from "@apollo/client";
import { GET_COUNTRIES, GET_CONTINENTS } from "../api/example";
import { Country, Continent, NewCountryInput } from "../types";
import { useState } from "react";
import { useMutation } from "@apollo/client";
import { ADD_COUNTRY } from "../api/example";
import { Link } from "react-router-dom";
import "../styles/Home.css";

const commonFlags = [
  { name: "France", emoji: "🇫🇷" },
  { name: "Spain", emoji: "🇪🇸" },
  { name: "United States", emoji: "🇺🇸" },
  { name: "China", emoji: "🇨🇳" },
  { name: "Canada", emoji: "🇨🇦" },
  { name: "Germany", emoji: "🇩🇪" },
  { name: "Japan", emoji: "🇯🇵" },
  { name: "Brazil", emoji: "🇧🇷" },
  { name: "Australia", emoji: "🇦🇺" },
  { name: "United Kingdom", emoji: "🇬🇧" },
  { name: "Italy", emoji: "🇮🇹" },
  { name: "Kenya", emoji: "🇰🇪" },
  { name: "India", emoji: "🇮🇳" },
  { name: "Russia", emoji: "🇷🇺" },
  { name: "Mexico", emoji: "🇲🇽" }
];


const containsEmoji = (str: string) => {
  const emojiRegex = /[\p{Emoji}]/u;
  return emojiRegex.test(str);
};

export function HomePage() {
  const { loading, error, data, refetch } = useQuery(GET_COUNTRIES);
  const { data: continentsData } = useQuery(GET_CONTINENTS);
  const [addCountry, { loading: addingCountry }] = useMutation(ADD_COUNTRY);

  const [newCountry, setNewCountry] = useState<NewCountryInput>({
    name: "",
    code: "",
    emoji: "",
  });
  
  const [showEmojiSelector, setShowEmojiSelector] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [apiError, setApiError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[name];
        return newErrors;
      });
    }
    
    if (apiError) {
      setApiError(null);
    }
    
    if (name === "continent") {
      setNewCountry({
        ...newCountry,
        continent: value ? { id: parseInt(value) } : undefined,
      });
    } else {
      setNewCountry({
        ...newCountry,
        [name]: value,
      });
    }
  };
  
  const selectEmoji = (emoji: string) => {
    setNewCountry({
      ...newCountry,
      emoji,
    });
    setShowEmojiSelector(false);
    
    if (formErrors.emoji) {
      setFormErrors(prev => {
        const newErrors = {...prev};
        delete newErrors.emoji;
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};
    
    if (!newCountry.name.trim()) {
      errors.name = "Name is required";
    }
    
    if (!newCountry.code.trim()) {
      errors.code = "Code is required";
    } else if (newCountry.code.length < 2) {
      errors.code = "Code must be at least 2 characters";
    } else if (newCountry.code.length > 3) {
      errors.code = "Code cannot exceed 3 characters";
    }
    
    if (!newCountry.emoji.trim()) {
      errors.emoji = "Emoji is required";
    } else if (!containsEmoji(newCountry.emoji)) {
      errors.emoji = "Please enter a valid emoji";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setApiError(null);
    
    if (!validateForm()) {
      return;
    }
    
    try {
      await addCountry({
        variables: {
          data: newCountry,
        },
      });
      setNewCountry({ name: "", code: "", emoji: "" });
      refetch();
    } catch (error: any) {
      console.error("Error adding country:", error);
      
      if (error.graphQLErrors && error.graphQLErrors.length > 0) {
        const gqlError = error.graphQLErrors[0];
        
        if (gqlError.extensions?.code === "CODE_ALREADY_EXISTS") {
          setApiError("A country with this code already exists");
        } else if (gqlError.message.includes("Argument Validation Error")) {
          setApiError("Please check your input values");
        } else {
          setApiError(gqlError.message || "An error occurred");
        }
      } else {
        setApiError("An unexpected error occurred");
      }
    }
  };

  if (loading) return <p className="loading-message">Loading countries...</p>;
  if (error) return <p className="error-message">Error loading countries: {error.message}</p>;

  const countries: Country[] = data?.countries || [];
  const continents: Continent[] = continentsData?.continents || [];

  return (
    <div className="home-container">
      <div className="add-country-form">
        <h2>Add Country</h2>
        
        {apiError && (
          <div className="api-error">
            {apiError}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className={`form-group ${formErrors.name ? 'has-error' : ''}`}>
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={newCountry.name}
              onChange={handleInputChange}
              required
            />
            {formErrors.name && <div className="error-message">{formErrors.name}</div>}
          </div>
          <div className={`form-group ${formErrors.emoji ? 'has-error' : ''}`}>
            <label>Emoji</label>
            <div className="emoji-input-container">
              <input
                type="text"
                name="emoji"
                value={newCountry.emoji}
                onChange={handleInputChange}
                required
                placeholder="Paste emoji or select →"
              />
              <button 
                type="button"
                className="emoji-selector-button"
                onClick={() => setShowEmojiSelector(!showEmojiSelector)}
              >
                🏴
              </button>
              
              {showEmojiSelector && (
                <div className="emoji-selector">
                  {commonFlags.map(flag => (
                    <div 
                      key={flag.name}
                      className="emoji-option"
                      onClick={() => selectEmoji(flag.emoji)}
                      title={flag.name}
                    >
                      {flag.emoji}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {formErrors.emoji && <div className="error-message">{formErrors.emoji}</div>}
          </div>
          <div className={`form-group ${formErrors.code ? 'has-error' : ''}`}>
            <label>Code</label>
            <input
              type="text"
              name="code"
              value={newCountry.code}
              onChange={handleInputChange}
              required
              minLength={2}
              maxLength={3}
              placeholder="2-3 characters (e.g. FR, US, DE)"
            />
            {formErrors.code && <div className="error-message">{formErrors.code}</div>}
          </div>
          {continents.length > 0 && (
            <div className="form-group">
              <label>Continent</label>
              <select 
                name="continent" 
                onChange={handleInputChange}
                value={newCountry.continent?.id || ""}
              >
                <option value="">Select a continent</option>
                {continents.map((continent) => (
                  <option key={continent.id} value={continent.id}>
                    {continent.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <button 
            type="submit" 
            disabled={addingCountry}
          >
            {addingCountry ? 'Adding...' : 'Add'}
          </button>
        </form>
      </div>

      <div className="countries-list">
        <h2>Countries</h2>
        <div className="country-cards">
          {countries.map((country) => (
            <Link to={`/country/${country.code}`} key={country.id} className="country-card">
              <div className="country-flag">{country.emoji}</div>
              <div className="country-name">{country.name}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
