import { Form, Link } from "react-router";
import { useState } from "react";
import { forgotPassword } from "../utils/authServer";

export default function ForgotPassword() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setError("");

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email"));

    const result = await forgotPassword(email);

    if (!result.success) {
      setError(result.message);
      return;
    }

    setMessage(result.message);
  }

  return (
    <>
      <div className="section--logo">
        <img className="img--logo" src={import.meta.env.BASE_URL + "logo.svg"} alt="BerryCam logo"/>
        <p className="p--logo">BerryCam</p>
      </div>

      <h1 className="section--title__big">Forgot password</h1>

      <Form className="auth--form" onSubmit={handleSubmit}>
        <label>Email</label>
        <input name="email" type="email" required />

        {error && <p className="auth--error">{error}</p>}
        {message && <p className="auth--success">{message}</p>}

        <button type="submit">Send reset link</button>
      </Form>

      <div className="auth--links">
        <Link to={`${import.meta.env.BASE_URL}`}>Back to login</Link>
      </div>
    </>
  );
}