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
    `${import.meta.env.BASE_URL}backend/send_production_csv.php`,
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
      `${import.meta.env.BASE_URL}backend/delete_greenhouse.php`,
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
        <Link to={`${import.meta.env.BASE_URL}dashboard`} className="btn--back">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"/>
          </svg>
        </Link>
      </div>

      <h1 className="section--title__big">Manage greenhouses</h1>

      {error && <p className="auth--error">{error}</p>}

      <Link to={`${import.meta.env.BASE_URL}addGreenhouse`} className="card--click">
        <button type="button">Add greenhouse</button>
      </Link>
      <button type="button" className="btn--csv" onClick={sendProductionCsv}>
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