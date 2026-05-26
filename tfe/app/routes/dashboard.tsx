import { useNavigate } from "react-router";
import { getCurrentUser, logoutUser ,getUserGreenhouses} from "../utils/authServer";
import { Link } from "react-router";
import { useEffect, useState } from "react";
import Card from "../components/card";
import CardManage from "../components/cardManage";

export default function Home() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  type Greenhouse = {
    greenhouse_id: number;
    name: string;
  };

  const [greenhouses, setGreenhouses] = useState<Greenhouse[]>([]);
  const [readyStrawberries, setReadyStrawberries] = useState(0);

  useEffect(() => {
    async function checkUser() {
      const result = await getCurrentUser();

      if (!result.success) {
        navigate("/");
        return;
      }

      setCurrentUser(result.user.username);
      const greenhousesResult = await getUserGreenhouses();
      if (greenhousesResult.success) {
        setGreenhouses(greenhousesResult.greenhouses);
      }
      const readyResponse = await fetch("https://theocolpaert.be/projets/tfe_app/backend/get_ready_strawberries.php", {credentials: "include",});
      const readyResult = await readyResponse.json();

      if (readyResult.success) {
        setReadyStrawberries(readyResult.ready_strawberries);
      }
    }

    checkUser();

  }, []);

  return (
    <>
      <div className="section--logo">
        <img className="img--logo" src={import.meta.env.BASE_URL + "logo.svg"} alt="Logo de l'entreprise BerryCam"/>
        <p className="p--logo">BerryCam</p>
      </div>
      <div className="section--user">
        <p className="p--small">Connected as {currentUser}</p>
        <button className="btn--logout" onClick={async () => {
            await logoutUser();
            navigate(`${import.meta.env.BASE_URL}`);
          }}>
          Logout
        </button>
      </div>

      <h1 className="section--title__big">Your exploitation</h1>
      <p className="p--intro">
         You have {greenhouses.length} greenhouse{greenhouses.length > 1 ? "s" : ""} in your exploitation. See the details&nbsp;below.
      </p>

      <div className="grid">
        {greenhouses.map((greenhouse) => (
          <Link key={greenhouse.greenhouse_id} to={`${import.meta.env.BASE_URL}greenhouseData/${greenhouse.greenhouse_id}`} className="card--click card--home">
            <Card>
              <p className="p--small">See datas for</p>
              <p className="p--big">{greenhouse.name}</p>
            </Card>
          </Link>
        ))}

        <Link to={`${import.meta.env.BASE_URL}manageGreenhouses`} className="card--click card--home">
          <CardManage>
            <p className="p--small">Manage</p>
            <p className="p--big">your farm</p>
          </CardManage>
        </Link>
      </div>

      <Card>
        <p className="p--small">Currently</p>
        <p className="p--big">{readyStrawberries} strawberries</p>
        <p className="p--small"> are ready to get picked up</p>
      </Card>
    </>
  );
}