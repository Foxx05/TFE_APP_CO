<?php
require_once "config.php";

$data = json_decode(file_get_contents("php://input"), true);

$username = trim($data["username"] ?? "");
$password = $data["password"] ?? "";

$stmt = $pdo->prepare("
    SELECT user_id, username, email, password_hash
    FROM users
    WHERE username = :username OR email = :username
    LIMIT 1
");

$stmt->execute([
    "username" => $username
]);

$user = $stmt->fetch();

if (!$user || !password_verify($password, $user["password_hash"])) {
    echo json_encode([
        "success" => false,
        "message" => "Identifiants incorrects."
    ]);
    exit;
}

$_SESSION["user_id"] = $user["user_id"];
$_SESSION["username"] = $user["username"];

echo json_encode([
    "success" => true,
    "user" => [
        "id" => $user["user_id"],
        "username" => $user["username"],
        "email" => $user["email"]
    ]
]);