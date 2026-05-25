import { useEffect, useState } from "react";
import { Link } from "react-router";
import { getUserGreenhouses } from "../utils/authServer";

type Greenhouse = {
  greenhouse_id: number;
  name: string;
};

export default function ManageGreenhouses() {
  const [greenhouses, setGreenhouses] = useState<Greenhouse[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadGreenhouses() {
      const result = await getUserGreenhouses();

      if (result.success) {
        setGreenhouses(result.greenhouses);
      } else {
        setError("Unable to load greenhouses");
      }
    }

    loadGreenhouses();
  }, []);

  const [message, setMessage] = useState("");

  async function sendProductionCsv() {
  setError("");
  setMessage("");

  const response = await fetch(
    "https://theocolpaert.be/projets/tfe_app/backend/send_production_csv.php",
    {
      method: "POST",
      credentials: "include",
    }
  );

  const result = await response.json();

  if (!result.success) {
    setError(result.message || "Unable to send CSV");
    return;
  }

  setMessage("CSV successfully sent by email");
  }


  async function deleteGreenhouse(id: number) {
    const confirmDelete = confirm("Are you sure you want to delete this greenhouse?");
    if (!confirmDelete) return;

    const response = await fetch(
      "https://theocolpaert.be/projets/tfe_test6/backend/delete_greenhouse.php",
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          greenhouse_id: id,
        }),
      }
    );

    const result = await response.json();

    if (!result.success) {
      setError(result.message || "Delete failed");
      return;
    }

    setGreenhouses((prev) =>
      prev.filter((greenhouse) => greenhouse.greenhouse_id !== id)
    );
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

      <h1 className="section--title__big">Manage greenhouses</h1>

      {error && <p className="auth--error">{error}</p>}

      <Link to={`${import.meta.env.BASE_URL}addGreenhouse`} className="card--click">
        <button type="button">Add greenhouse</button>
      </Link>
      <button type="button" onClick={sendProductionCsv}>
        Send Production CSV by email
      </button>

      {message && <p className="auth--success">{message}</p>}

      <div className="card--gap">
        {greenhouses.map((greenhouse) => (
          <div className="card" key={greenhouse.greenhouse_id}>
            <p className="p--big">{greenhouse.name}</p>

            <Link to={`${import.meta.env.BASE_URL}editGreenhouse/${greenhouse.greenhouse_id}`}>
              <button type="button">Edit</button>
            </Link>

            <button type="button" onClick={() => deleteGreenhouse(greenhouse.greenhouse_id)}>
              Delete
            </button>
          </div>
        ))}
      </div>
    </>
  );
}