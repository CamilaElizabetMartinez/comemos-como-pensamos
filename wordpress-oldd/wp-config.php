	<?php
/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the installation.
 * You don't have to use the website, you can copy this file to "wp-config.php"
 * and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * Database settings
 * * Secret keys
 * * Database table prefix
 * * ABSPATH
 *
 * @link https://developer.wordpress.org/advanced-administration/wordpress/wp-config/
 *
 * @package WordPress
 */

// ** Database settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define( 'DB_NAME', 'comemos_como_pensamos_db' );

/** Database username */
define( 'DB_USER', 'root' );

/** Database password */
define( 'DB_PASSWORD', 'MyPassword123!' );

/** Database hostname */
define( 'DB_HOST', 'localhost' );

/** Database charset to use in creating database tables. */
define( 'DB_CHARSET', 'utf8mb4' );

/** The database collate type. Don't change this if in doubt. */
define( 'DB_COLLATE', '' );

/**#@+
 * Authentication unique keys and salts.
 *
 * Change these to different unique phrases! You can generate these using
 * the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}.
 *
 * You can change these at any point in time to invalidate all existing cookies.
 * This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define( 'AUTH_KEY',         'g--(5 1 6m>/0H>//{9pj!K4r:y+14HFVi,k8J K+.!00KPz,I{+yU-cJ !qRh</' );
define( 'SECURE_AUTH_KEY',  'R0$y,2qYvDj.-9MgWX)aWluEU3HLbH,p@f;HMLdB~[5x3T1r~x-LQQ`N#OyDbT4x' );
define( 'LOGGED_IN_KEY',    'm<olG%qfw^hWr/bP<:8&}f$rci1OJ`(- R-=g=uj^jfC,WTWP5J@r=s7|C6AB1<q' );
define( 'NONCE_KEY',        'Kb>el1U|Gxm+C}i3-<<Q%gPATT-x={Ns~[Nw$/Ymku?Fr3>t68p<HW87*o/F*Di7' );
define( 'AUTH_SALT',        'H=9<<6ePpqS$.tGw2NU:3I|vF`n}!L,yNPly%t+rJ-y:w~ce>cc8zGeDGVghYW#)' );
define( 'SECURE_AUTH_SALT', 'nS5j|3:vuH*)}D>*@Oy>xI%UcWQF%miQU2x}mwv[7RY{gRg*A{PfLUo3:>?u0DIg' );
define( 'LOGGED_IN_SALT',   'y?R IOKXP[&^T `%Y4l*EP97wIkx+^u[|--f: p%]AAED9L[[h6KL:sCDd/RmYmL' );
define( 'NONCE_SALT',       '^~krByd _FzLEXK7/)v(UdK6^Z^c=TAiQOa0kVq};|$7.5D~klS^s$>n1S^enR|J' );

/**#@-*/

/**
 * WordPress database table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 */
$table_prefix = 'comemos_como_pensamos_db';

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the documentation.
 *
 * @link https://developer.wordpress.org/advanced-administration/debug/debug-wordpress/
 */
define( 'WP_DEBUG', true );

/* Add any custom values between this line and the "stop editing" line. */

define("WPLANG", "es_ES");

/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/' );
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';