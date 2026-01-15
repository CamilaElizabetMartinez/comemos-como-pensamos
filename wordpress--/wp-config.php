<?php
/** 
 * Configuración básica de WordPress.
 *
 * Este archivo contiene las siguientes configuraciones: ajustes de MySQL, prefijo de tablas,
 * claves secretas, idioma de WordPress y ABSPATH. Para obtener más información,
 * visita la página del Codex{@link http://codex.wordpress.org/Editing_wp-config.php Editing
 * wp-config.php} . Los ajustes de MySQL te los proporcionará tu proveedor de alojamiento web.
 *
 * This file is used by the wp-config.php creation script during the
 * installation. You don't have to use the web site, you can just copy this file
 * to "wp-config.php" and fill in the values.
 *
 * @package WordPress
 */

// ** Ajustes de MySQL. Solicita estos datos a tu proveedor de alojamiento web. ** //
/** El nombre de tu base de datos de WordPress */
define('DB_NAME', 'comemos_como_pensamos_db');

/** Tu nombre de usuario de MySQL */
define('DB_USER', 'root');

/** Tu contraseña de MySQL */
define('DB_PASSWORD', 'MyPassword123!');

/** Host de MySQL (es muy probable que no necesites cambiarlo) */
define('DB_HOST', 'localhost');

/** Codificación de caracteres para la base de datos. */
define('DB_CHARSET', 'utf8');

/** Cotejamiento de la base de datos. No lo modifiques si tienes dudas. */
define('DB_COLLATE', '');

/**#@+
 * Claves únicas de autentificación.
 *
 * Define cada clave secreta con una frase aleatoria distinta.
 * Puedes generarlas usando el {@link https://api.wordpress.org/secret-key/1.1/salt/ servicio de claves secretas de WordPress}
 * Puedes cambiar las claves en cualquier momento para invalidar todas las cookies existentes. Esto forzará a todos los usuarios a volver a hacer login.
 *
 * @since 2.6.0
 */

define('AUTH_KEY',         'W)L|<*c*|n1|;Zc*NbT,(^EnPu-%E;JTI,./r-ZQhj2_>u #P)q6ERlJ*Y$b~Ow,');
define('SECURE_AUTH_KEY',  'l!ESW>G27Daw>F~19|J|p}:!UbyF)bb~deJE5S!-Y]~nFtq|L_A:l|ix5-IW|uAr');
define('LOGGED_IN_KEY',    '8tvgU/QH<FuPl!>pt-?xFU0L]tl~k-@DeIE^-=){&]O=reZ^D:hY^0ZuDicx8<z9');
define('NONCE_KEY',        '-< R>E47V{)6AUES+O}|ZYvi&^fl{~ ~B9M8|KS,fev^:eo)*4Ws+6vnh<SA&*Y0');
define('AUTH_SALT',        '#p)H;A:GnbO(Zohj$@z7IhwE-#OigOKxQRf+-9p/{C#n!h<9xsR*sEx $/9n!,@%');
define('SECURE_AUTH_SALT', 'Aa)25xpY~/d+RE$-C&EXqB33nkaqP66>)-*fU|K29nu+j8-8=R35Q]=$<CCo;~ %');
define('LOGGED_IN_SALT',   'jh6j)lDWme;#jS@2Wff;8e_bh==`[*5|N{,izdb2Kvw/T~o9sTSC>_Niz<w^D6>r');
define('NONCE_SALT',       '=>09y(UM^s`O{.m)nzR8*)YMRH^8h|DXhkJ!-T^{-:/;_hsLTUm8%@J@U$VC`hhL');

/**#@-*/

/**
 * Prefijo de la base de datos de WordPress.
 *
 * Cambia el prefijo si deseas instalar multiples blogs en una sola base de datos.
 * Emplea solo números, letras y guión bajo.
 */
$table_prefix  = 'wp_';


/**
 * Para desarrolladores: modo debug de WordPress.
 *
 * Cambia esto a true para activar la muestra de avisos durante el desarrollo.
 * Se recomienda encarecidamente a los desarrolladores de temas y plugins que usen WP_DEBUG
 * en sus entornos de desarrollo.
 */
define('WP_DEBUG', true);
define('WP_HOME','http://localhost');
define('WP_SITEURL','http://localhost');

/* ¡Eso es todo, deja de editar! Feliz blogging */

/** WordPress absolute path to the Wordpress directory. */
if ( !defined('ABSPATH') )
	define('ABSPATH', dirname(__FILE__) . '/');

/** Sets up WordPress vars and included files. */
require_once(ABSPATH . 'wp-settings.php');

