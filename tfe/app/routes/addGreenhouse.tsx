import {  useState } from "react";
import type{ FormEvent } from "react";
import { useNavigate } from "react-router";
import { Link } from "react-router";

export default function AddGreenhouse() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [lengthM, setLengthM] = useState("");
  const [widthM, setWidthM] = useState("");
  const [heightM, setHeightM] = useState("");
  const [orientation, setOrientation] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    const response = await fetch("https://theocolpaert.be/projets/tfe_app/backend/add_greenhouse.php", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        length_m: lengthM,
        width_m: widthM,
        height_m: heightM,
        orientation,
      }),
    });

    

const result = await response.json();

    if (!result.success) {
      setError(result.message || "Error while adding greenhouse");
      return;
    }
    setSuccess("Greenhouse successfully added!");
    navigate(`${import.meta.env.BASE_URL}dashboard`);
  }

  return (
    <>
      <div className="top--nav">
        <Link to={`${import.meta.env.BASE_URL}manageGreenhouses`} className="btn--back">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path fill-rule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"/>
            </svg>
        </Link>
      </div>

      <h1 className="section--title__big">Add greenhouse</h1>

      <form className="auth--form" onSubmit={handleSubmit}>
        <label>
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={12} required />
        </label>

        <label>
          Length in meters
          <input type="number" step="0.01" value={lengthM} onChange={(e) => setLengthM(e.target.value)} />
        </label>

        <label>
          Width in meters
          <input type="number" step="0.01" value={widthM} onChange={(e) => setWidthM(e.target.value)} />
        </label>

        <label>
          Height in meters
          <input type="number" step="0.01" value={heightM} onChange={(e) => setHeightM(e.target.value)} />
        </label>

        <label>
          Orientation
          <select value={orientation} onChange={(e) => setOrientation(e.target.value)}>
            <option value="north">North</option>
            <option value="northeast">Northeast</option>
            <option value="east">East</option>
            <option value="southeast">Southeast</option>
            <option value="south">South</option>
            <option value="southwest">Southwest</option>
            <option value="west">West</option>
            <option value="nortwest">Nortwest</option>
          </select>
        </label>

        {error && <p className="auth--error">{error}</p>}
        {success && <p className="auth--success">{success}</p>}
        <button type="submit">Add greenhouse</button>
      </form>
    </>
  );
}