import { Form, Link, useNavigate } from "react-router";
import { useState } from "react";
import { loginUser } from "../utils/authServer";

export default function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const username = String(formData.get("username"));
    const password = String(formData.get("password"));

    const result = await loginUser(username, password);

    if (!result.success) {
      setError(result.message);
      return;
    }

    navigate(`${import.meta.env.BASE_URL}dashboard`);
  }

  return (
    <>
      <div className="section--logo">
        <img
          className="img--logo"
          src={import.meta.env.BASE_URL + "logo.svg"}
          alt="BerryCam logo"
        />
        <p className="p--logo">BerryCam</p>
      </div>

      <h1 className="section--title__big">Login</h1>

      <Form method="post" className="auth--form" onSubmit={handleSubmit}>
        <label>Username or email</label>
        <input name="username" type="text" required />

        <label>Password</label>
        <input name="password" type="password" required />

        {error && <p className="auth--error">{error}</p>}

        <button type="submit">Login</button>
      </Form>

      <div className="auth--links">
        <Link to={`${import.meta.env.BASE_URL}register`}>Create new user</Link>
        <Link to={`${import.meta.env.BASE_URL}forgot-password`}>Forgot password?</Link>
      </div>
    </>
  );
}