<?php
require_once "config.php";

$data = json_decode(file_get_contents("php://input"), true);

$username = trim($data["username"] ?? "");
$email = trim($data["email"] ?? "");
$password = $data["password"] ?? "";

if ($username === "" || $email === "" || $password === "") {
    echo json_encode([
        "success" => false,
        "message" => "Tous les champs sont obligatoires."
    ]);
    exit;
}

$passwordHash = password_hash($password, PASSWORD_DEFAULT);

try {
    $stmt = $pdo->prepare("
        INSERT INTO users (username, email, password_hash)
        VALUES (:username, :email, :password_hash)
    ");

    $stmt->execute([
        "username" => $username,
        "email" => $email,
        "password_hash" => $passwordHash
    ]);

    echo json_encode([
        "success" => true,
        "message" => "Utilisateur créé."
    ]);
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Nom d'utilisateur ou email déjà utilisé."
    ]);
}