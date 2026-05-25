<?php
require_once "config.php";

if (!isset($_SESSION["user_id"])) {
    echo json_encode([
        "success" => false,
        "message" => "Utilisateur non connecté."
    ]);
    exit;
}

$stmt = $pdo->prepare("
    SELECT greenhouse_id, name
    FROM greenhouses
    WHERE user_id = :user_id
    ORDER BY greenhouse_id ASC
");

$stmt->execute([
    "user_id" => $_SESSION["user_id"]
]);

$greenhouses = $stmt->fetchAll();

echo json_encode([
    "success" => true,
    "greenhouses" => $greenhouses
]);