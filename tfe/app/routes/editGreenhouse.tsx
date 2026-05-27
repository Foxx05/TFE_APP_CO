import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useParams } from "react-router";
import { Link } from "react-router";

export default function EditGreenhouse() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [name, setName] = useState("");
  const [lengthM, setLengthM] = useState("");
  const [widthM, setWidthM] = useState("");
  const [heightM, setHeightM] = useState("");
  const [orientation, setOrientation] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadGreenhouse() {
      setError("");

      const response = await fetch(
        `https://theocolpaert.be/projets/tfe_app/backend/get_greenhouse.php?greenhouse_id=${id}`,
        {
          credentials: "include",
        }
      );

      const result = await response.json();

      if (!result.success) {
        setError(result.message || "Unable to load greenhouse");
        return;
      }

      setName(result.greenhouse.name || "");
      setLengthM(result.greenhouse.length_m || "");
      setWidthM(result.greenhouse.width_m || "");
      setHeightM(result.greenhouse.height_m || "");
      setOrientation(result.greenhouse.orientation || "");
    }

    loadGreenhouse();
  }, [id]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const response = await fetch(
      "https://theocolpaert.be/projets/tfe_app/backend/update_greenhouse.php",
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          greenhouse_id: id,
          name,
          length_m: lengthM,
          width_m: widthM,
          height_m: heightM,
          orientation,
        }),
      }
    );

    const result = await response.json();

    if (!result.success) {
      setError(result.message || "Update failed");
      return;
    }

    setSuccess("Greenhouse successfully updated!");

    setTimeout(() => {
      navigate(`${import.meta.env.BASE_URL}manageGreenhouses`);
    }, 800);
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

      <h1 className="section--title__big">Edit greenhouse</h1>

      <form className="auth--form" onSubmit={handleSubmit}>
        <label>
          Name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={12}
            required
          />
        </label>

        <label>
          Length in meters
          <input
            type="number"
            step="0.01"
            value={lengthM}
            onChange={(e) => setLengthM(e.target.value)}
          />
        </label>

        <label>
          Width in meters
          <input
            type="number"
            step="0.01"
            value={widthM}
            onChange={(e) => setWidthM(e.target.value)}
          />
        </label>

        <label>
          Height in meters
          <input
            type="number"
            step="0.01"
            value={heightM}
            onChange={(e) => setHeightM(e.target.value)}
          />
        </label>

        <label>
          Orientation
          <input
            value={orientation}
            onChange={(e) => setOrientation(e.target.value)}
            placeholder="North-South"
          />
        </label>

        {error && <p className="auth--error">{error}</p>}
        {success && <p className="auth--success">{success}</p>}

        <button type="submit">Save changes</button>
      </form>
    </>
  );
}