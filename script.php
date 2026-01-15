<?php
require 'vendor/autoload.php';

use Facebook\WebDriver\Remote\DesiredCapabilities;
use Facebook\WebDriver\Remote\RemoteWebDriver;
use Facebook\WebDriver\WebDriverBy;
use Facebook\WebDriver\WebDriverExpectedCondition;

// URL del Selenium Server
$serverUrl = 'http://localhost:1234/wd/hub';

// Configuración del User-Agent y otras capacidades
$capabilities = DesiredCapabilities::firefox();
$capabilities->setCapability('moz:firefoxOptions', [
    'args' => [
        '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36',
    ],
]);
// Crear el WebDriver
$driver = RemoteWebDriver::create($serverUrl, $capabilities);

// URL del evento en Vivid Seats (pasada como parámetro)
$eventUrl = $argv[1];

// Navegar a la página del evento
$driver->get($eventUrl);

// Gestionar cookies para evitar ser bloqueado entre solicitudes
$cookies = $driver->manage()->getCookies(); // Obtener cookies
// Si es necesario, puedes guardar y reutilizar las cookies aquí.

// Esperar a que la página cargue completamente
$driver->wait(30)->until(
    WebDriverExpectedCondition::presenceOfElementLocated(WebDriverBy::cssSelector('body'))
);

// Extraer los datos (modifica los selectores según la estructura de la página)
try {
    $objetcLi = $driver->findElement(WebDriverBy::cssSelector('.styles_sidebar__CQ3V4'))->getText();
    $text = $driver->findElement(WebDriverBy::cssSelector('.styles_listingsContainer__FIaQR[data-testid="listings-container"]'))->getText();

    // Dividimos el texto por saltos de línea
    $lines = explode("\n", $text);
    // Inicializamos el objeto 'listing' como un array vacío
    $listing = [];
    $currentListing = [];
    $counter = 0;

    // Procesamos cada línea del texto
    foreach ($lines as $line) {
        $line = trim($line); // Limpiamos la línea

        if (empty($line)) {
            continue; // Saltamos líneas vacías
        }

        // Si la línea es "ea", simplemente la ignoramos
        if ($line === "ea") {
            continue;
        }

        // Añadimos la línea al 'currentListing'
        $currentListing[] = $line;

        // Si la línea contiene el precio (por ejemplo, "$190"), cerramos el listing actual
        if (preg_match('/^\$\d+/', $line)) {
            // Quitamos "ea" si está presente en la línea del precio
            $price = str_replace('ea', '', $line); // Eliminamos " ea"

            // Creamos el array con claves descriptivas
            $listing[] = [
                'type_ticket' => isset($currentListing[0]) ? $currentListing[0] : '',
                'quantity_ticket' => isset($currentListing[1]) ? $currentListing[1] : '',
                'description' => isset($currentListing[2]) && !preg_match('/^\$\d+/', $currentListing[2]) ? $currentListing[2] : '',
                'price' => $price
            ];

            // Reiniciamos 'currentListing' para el siguiente bloque
            $currentListing = [];

            // Controlamos el número de listings creados
            $counter++;
            if ($counter >= 9) {
                break; // Detenemos el proceso si ya hemos recopilado 9 listings
            }
        }
    }

} catch (Exception $e) {
    echo "No se pudo encontrar el título principal.\n";
}

?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <title>Listado de Entradas</title>
</head>
<body>
<div class="container mt-5">
    <div class="d-flex flex-column">
        <?php foreach ($listing as $item): ?>
            <div class="p-2">
                <div class="card mb-4" style="width: 40%;">
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-6">
                                <h5 class="card-title"><?= htmlspecialchars($item['type_ticket']) ?></h5>
                                <p class="card-text">
                                    <span><?= htmlspecialchars($item['quantity_ticket']) ?></span><br>
                                    <span><?= htmlspecialchars($item['description']) ?></span><br>
                                </p>
                            </div>
                            <div class="col-md-6 d-flex justify-content-end align-items-center">
                                <span class="h5"><?= htmlspecialchars($item['price']) ?></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        <?php endforeach; ?>
    </div>
</div>
</body>
</html>