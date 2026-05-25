import { Form, Link, useNavigate } from "react-router";
import { useState } from "react";
import { registerUser } from "../utils/authServer";

export default function Register() {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const username = String(formData.get("username"));
    const email = String(formData.get("email"));
    const password = String(formData.get("password"));
    const confirmPassword = String(formData.get("confirmPassword"));

    if (password !== confirmPassword) {
      setError("Passwords are not the same.");
      return;
    }

    const result = await registerUser(username, email, password);

    if (!result.success) {
      setError(result.message);
      return;
    }

    navigate(`${import.meta.env.BASE_URL.replace(/\/$/, "")}`);
  }

  return (
    <>
      <div className="top--nav">
        <div className="section--logo">
            <img className="img--logo" src={import.meta.env.BASE_URL + "logo.svg"} alt="Logo de l'entreprise BerryCam"/>
            <p className="p--logo">BerryCam</p>
        </div>
      </div>
      <h1 className="section--title__big">Create account</h1>

      <Form className="auth--form" onSubmit={handleSubmit}>
        <label>Username</label>
        <input name="username" type="text" required />

        <label>Email</label>
        <input name="email" type="email" required />

        <label>Password</label>
        <input name="password" type="password" required />

        <label>Confirm password</label>
        <input name="confirmPassword" type="password" required />

        {error && <p className="auth--error">{error}</p>}

        <button type="submit">Create account</button>
      </Form>

      <div className="auth--links">
        <Link to={`${import.meta.env.BASE_URL}`}>Back to login</Link>
      </div>
    </>
  );
}