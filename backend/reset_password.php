<?php
require_once "config.php";

$data = json_decode(file_get_contents("php://input"), true);

$token = trim($data["token"] ?? "");
$password = $data["password"] ?? "";

if ($token === "" || $password === "") {
    echo json_encode([
        "success" => false,
        "message" => "Token and password are required."
    ]);
    exit;
}

if (strlen($password) < 8) {
    echo json_encode([
        "success" => false,
        "message" => "Password must contain at least 8 characters."
    ]);
    exit;
}

$stmt = $pdo->prepare("
    SELECT user_id, reset_token_expires
    FROM users
    WHERE reset_token = :reset_token
    LIMIT 1
");

$stmt->execute([
    "reset_token" => $token
]);

$user = $stmt->fetch();

if (!$user) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid reset link."
    ]);
    exit;
}

$expiresAt = strtotime($user["reset_token_expires"]);

if ($expiresAt === false || $expiresAt < time()) {
    echo json_encode([
        "success" => false,
        "message" => "This reset link has expired."
    ]);
    exit;
}

$passwordHash = password_hash($password, PASSWORD_DEFAULT);

$updateStmt = $pdo->prepare("
    UPDATE users
    SET
        password_hash = :password_hash,
        reset_token = NULL,
        reset_token_expires = NULL
    WHERE user_id = :user_id
");

$updateStmt->execute([
    "password_hash" => $passwordHash,
    "user_id" => $user["user_id"]
]);

echo json_encode([
    "success" => true,
    "message" => "Password updated successfully."
]);