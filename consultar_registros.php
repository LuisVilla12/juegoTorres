<?php
header('Content-Type: application/json'); // Establecer el tipo de contenido a JSON

// Configuración de la conexión a la base de datos
$host = '127.0.0.1';
$port = '3307'; // Cambia al puerto correcto
$dbname = 'torres_database';
$username = 'root';
$password = 'lkqaz923'; // Asegúrate de usar la contraseña correcta

try {
    // Crear una nueva conexión PDO
    $dsn = "mysql:host=$host;port=$port;dbname=$dbname;charset=utf8mb4";
    $pdo = new PDO($dsn, $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Preparar y ejecutar la consulta
    $stmt = $pdo->query("SELECT * FROM plays");
    $partidas = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Enviar registros como JSON
    echo json_encode($partidas);
} catch (PDOException $e) {
    // Enviar error como JSON
    echo json_encode(['error' => 'Error: ' . $e->getMessage()]);
}
?>
