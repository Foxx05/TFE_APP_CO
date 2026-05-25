<?php
require_once "config.php";

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require_once __DIR__ . "/vendor/autoload.php";

$mailConfig = require __DIR__ . "/mail_config.php";

$data = json_decode(file_get_contents("php://input"), true);

$email = trim($data["email"] ?? "");

if ($email === "") {
    echo json_encode([
        "success" => false,
        "message" => "Email is required."
    ]);
    exit;
}

$stmt = $pdo->prepare("
    SELECT user_id, username, email
    FROM users
    WHERE email = :email
    LIMIT 1
");

$stmt->execute([
    "email" => $email
]);

$user = $stmt->fetch();


if (!$user) {
    echo json_encode([
        "success" => true,
        "message" => "If this email exists, a reset link has been sent."
    ]);
    exit;
}

$token = bin2hex(random_bytes(32));

$expires = date("Y-m-d H:i:s", time() + 3600);

$updateStmt = $pdo->prepare("
    UPDATE users
    SET
        reset_token = :reset_token,
        reset_token_expires = :reset_token_expires
    WHERE user_id = :user_id
");

$updateStmt->execute([
    "reset_token" => $token,
    "reset_token_expires" => $expires,
    "user_id" => $user["user_id"]
]);

$resetLink = "https://theocolpaert.be/projets/tfe_test6/reset-password?token=" . urlencode($token);

try {
    $mail = new PHPMailer(true);

    $mail->isSMTP();
    $mail->Host = $mailConfig["host"];
    $mail->SMTPAuth = true;
    $mail->Username = $mailConfig["username"];
    $mail->Password = $mailConfig["password"];
    $mail->Port = $mailConfig["port"];

    if ($mailConfig["encryption"] === "tls") {
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    }

    if ($mailConfig["encryption"] === "ssl") {
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
    }

    $mail->CharSet = "UTF-8";

    $mail->setFrom($mailConfig["from_email"], $mailConfig["from_name"]);
    $mail->addAddress($user["email"], $user["username"]);

    $mail->isHTML(true);
    $mail->Subject = "Reset your BerryCam password";

    $mail->Body = "
        <h1>Password reset</h1>
        <p>Hello {$user["username"]},</p>
        <p>You requested a password reset for your BerryCam account.</p>
        <p>This link is valid for 1 hour:</p>
        <p>
            <a href='{$resetLink}'>Reset my password</a>
        </p>
        <p>If you did not request this, you can ignore this email.</p>
    ";

    $mail->AltBody = "Reset your password here: " . $resetLink;

    $mail->send();

    echo json_encode([
        "success" => true,
        "message" => "If this email exists, a reset link has been sent."
    ]);
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => "Email could not be sent."
    ]);
}