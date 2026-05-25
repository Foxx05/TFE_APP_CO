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
                <div className="section--logo">
                    <img className="img--logo" src={import.meta.env.BASE_URL + "logo.svg"} alt="Logo de l'entreprise BerryCam"/>
                    <p className="p--logo">BerryCam</p>
                </div>

                <Link to={`${import.meta.env.BASE_URL}dashboard`} className="btn--back">
                    Back
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
          <input value={orientation} onChange={(e) => setOrientation(e.target.value)} placeholder="North-South" />
        </label>

        {error && <p className="auth--error">{error}</p>}
        {success && <p className="auth--success">{success}</p>}
        <button type="submit">Add greenhouse</button>
      </form>
    </>
  );
}