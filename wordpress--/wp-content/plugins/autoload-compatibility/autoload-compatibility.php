<?php
/*
Plugin Name: Autoload Compatibility
Description: Adds __autoload() function for compatibility with older code.
Version: 1.0
Author: Tu Nombre
*/

if (!function_exists('__autoload')) {
    spl_autoload_register(function ($class_name) {
        // Aquí puedes añadir la lógica de carga de clases si es necesario
        // Por ejemplo:
        $file = str_replace('\\', '/', $class_name) . '.php';
        if (file_exists($file)) {
            require_once $file;
        }
    });
}
