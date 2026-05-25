import { route, type RouteConfig } from "@react-router/dev/routes";

export default [
  route("projets/tfe_app", "./routes/login.tsx"),
  route("projets/tfe_app/register", "./routes/register.tsx"),
  route("projets/tfe_app/forgot-password", "./routes/forgotPassword.tsx"),
  route("projets/tfe_app/reset-password", "./routes/resetPassword.tsx"),
  route("projets/tfe_app/dashboard", "./routes/dashboard.tsx"),
  route("projets/tfe_app/greenhouseData/:id", "./routes/greenhouseData.tsx"),
  route("projets/tfe_app/addGreenhouse", "./routes/addGreenhouse.tsx"),
  route("projets/tfe_app/manageGreenhouses", "./routes/manageGreenhouses.tsx"),
  route("projets/tfe_app/editGreenhouse/:id", "./routes/editGreenhouse.tsx"),
  
] satisfies RouteConfig;