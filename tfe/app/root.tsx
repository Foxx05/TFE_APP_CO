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
        <link rel="icon" type="image/svg+xml" href={import.meta.env.BASE_URL + "logo.svg"} />
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        <title>TFE</title>
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