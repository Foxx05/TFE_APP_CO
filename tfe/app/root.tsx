import { Links, Outlet, Scripts } from "react-router";
import appStyles from "./app.css?url";

export const links = () => [
  { rel: "stylesheet", href: appStyles },

  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
  { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap",},

  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
  { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Poller+One&display=swap" },
];

export default function Root() {
  return (
    <html lang="en">
      <head>
        <Links/>
        <link rel="icon" href={`${import.meta.env.BASE_URL}/logo.ico`} />

        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="The app linked to my final project in my senior year of the Web and Transmedia program at HEAJ" />
        <meta property="og:site_name" content="Berrycam App — Théo Colpaert" />
        <meta property="og:title" content="Berrycam App" />
        <meta property="og:description" content="The app linked to my final project in my senior year of the Web and Transmedia program at HEAJ" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://theocolpaert.be/projets/tfe_app/" />
        <meta property="og:image" content="https://theocolpaert.be/projets/tfe_app/logo.svg" />
        <meta property="og:image:width" content="1800" />
        <meta property="og:image:height" content="945" />

        <title>Berrycam App - TFE</title>
      </head>
      <body>
        <div className="phone-frame">
          <div className="inside-phone">
            <Outlet/>
          </div>
        </div>
        <Scripts/>
      </body>
    </html>
  );
}