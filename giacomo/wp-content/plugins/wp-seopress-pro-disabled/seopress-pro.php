<?php
/*
Plugin Name: SEOPress PRO
Plugin URI: https://www.seopress.org/seopress-pro/
Description: The PRO version of SEOPress. SEOPress required (free).
Version: 6.6.1
Author: The SEO Guys at SEOPress
Author URI: https://www.seopress.org/seopress-pro/
License: GPLv2
Text Domain: wp-seopress-pro
Domain Path: /languages
Requires PHP: 7.2
Requires at least: 5.0
*/

/*  Copyright 2016 - 2023 - Benjamin Denis  (email : contact@seopress.org)

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License, version 2, as
    published by the Free Software Foundation.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program; if not, write to the Free Software
    Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
*/

// To prevent calling the plugin directly
if ( ! function_exists('add_action')) {
    echo 'Please don&rsquo;t call the plugin directly. Thanks :)';
    exit;
}

///////////////////////////////////////////////////////////////////////////////////////////////////
//CRON
///////////////////////////////////////////////////////////////////////////////////////////////////
function seopress_pro_cron() {
    //CRON - 404 cleaning
    if ( ! wp_next_scheduled('seopress_404_cron_cleaning')) {
        wp_schedule_event(time(), 'daily', 'seopress_404_cron_cleaning');
    }

    //CRON - GA stats in dashboard
    if ( ! wp_next_scheduled('seopress_google_analytics_cron')) {
        wp_schedule_event(time(), 'hourly', 'seopress_google_analytics_cron');
    }

    //CRON - Matomo stats in dashboard
    if ( ! wp_next_scheduled('seopress_matomo_analytics_cron')) {
        wp_schedule_event(time(), 'hourly', 'seopress_matomo_analytics_cron');
    }

    //CRON - Page Speed Insights
    if ( ! wp_next_scheduled('seopress_page_speed_insights_cron')) {
        wp_schedule_event(time(), 'daily', 'seopress_page_speed_insights_cron');
    }

    //CRON - 404 errors Email Alerts
    if ( ! wp_next_scheduled('seopress_404_email_alerts_cron')) {
        wp_schedule_event(time(), 'weekly', 'seopress_404_email_alerts_cron');
    }

    //CRON - Insight from GSC
    if ( ! wp_next_scheduled('seopress_insights_gsc_cron')) {
        wp_schedule_event(time(), 'daily', 'seopress_insights_gsc_cron');
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////////
//Hooks activation
///////////////////////////////////////////////////////////////////////////////////////////////////
// Deactivate SEOPress PRO if the Free version is not activated/installed
//@since version 3.8.1
function seopress_pro_loaded() {
    require_once ABSPATH . 'wp-admin/includes/plugin.php';
    if ( ! function_exists('deactivate_plugins')) {
        return;
    }

    if ( ! is_plugin_active('wp-seopress/seopress.php')) {//if SEOPress Free NOT activated
        deactivate_plugins('wp-seopress-pro/seopress-pro.php');
        add_action('admin_notices', 'seopress_pro_admin_notices');
    }
}
add_action('plugins_loaded', 'seopress_pro_loaded');

///////////////////////////////////////////////////////////////////////////////////////////////////
//Install plugins
///////////////////////////////////////////////////////////////////////////////////////////////////
//@since version 6.5
function seopress_pro_install_plugin($plugin_slug) {
    require_once ABSPATH . 'wp-admin/includes/file.php';
    require_once ABSPATH . 'wp-admin/includes/plugin-install.php';
    require_once ABSPATH . 'wp-admin/includes/class-wp-upgrader.php';
    require_once ABSPATH . 'wp-admin/includes/plugin.php';

    WP_Filesystem();

    $skin              = new Automatic_Upgrader_Skin();
    $upgrader          = new WP_Upgrader( $skin );

    if (!empty($plugin_slug)) {
        ob_start();

        try {
            $plugin_information = plugins_api(
                'plugin_information',
                array(
                    'slug'   => $plugin_slug,
                    'fields' => array(
                        'short_description' => false,
                        'sections'          => false,
                        'requires'          => false,
                        'rating'            => false,
                        'ratings'           => false,
                        'downloaded'        => false,
                        'last_updated'      => false,
                        'added'             => false,
                        'tags'              => false,
                        'homepage'          => false,
                        'donate_link'       => false,
                        'author_profile'    => false,
                        'author'            => false,
                    ),
                )
            );

            if ( is_wp_error( $plugin_information ) ) {
                throw new Exception( $plugin_information->get_error_message() );
            }

            $package  = $plugin_information->download_link;
            $download = $upgrader->download_package( $package );

            if ( is_wp_error( $download ) ) {
                throw new Exception( $download->get_error_message() );
            }

            $working_dir = $upgrader->unpack_package( $download, true );

            if ( is_wp_error( $working_dir ) ) {
                throw new Exception( $working_dir->get_error_message() );
            }

            $result = $upgrader->install_package(
                array(
                    'source'                      => $working_dir,
                    'destination'                 => WP_PLUGIN_DIR,
                    'clear_destination'           => false,
                    'abort_if_destination_exists' => false,
                    'clear_working'               => true,
                    'hook_extra'                  => array(
                        'type'   => 'plugin',
                        'action' => 'install',
                    ),
                )
            );

            if ( is_wp_error( $result ) ) {
                throw new Exception( $result->get_error_message() );
            }

            $activate = true;
        } catch ( Exception $e ) {
            $e->getMessage();
        }

        ob_end_clean();
    }

    wp_clean_plugins_cache();
}

function seopress_pro_activation() {
    require_once ABSPATH . 'wp-admin/includes/plugin.php';
    if ( ! function_exists('activate_plugins')) {
        return;
    }

    if ( ! function_exists('get_plugins')) {
        return;
    }

    $plugins = get_plugins();
    if ( empty($plugins['wp-seopress/seopress.php'])) {//if SEOPress Free is NOT installed
        seopress_pro_install_plugin('wp-seopress');
        activate_plugins('wp-seopress/seopress.php');
    }

    if ( ! empty($plugins['wp-seopress/seopress.php'])) {//if SEOPress Free is installed
        if ( ! is_plugin_active('wp-seopress/seopress.php')) {//if SEOPress Free is not activated
            activate_plugins('wp-seopress/seopress.php');
        }
        add_option('seopress_pro_activated', 'yes');

        flush_rewrite_rules(false);

        seopress_pro_cron();
    }

    //Add Redirections caps to user with "manage_options" capability
    $roles = get_editable_roles();
    if ( ! empty($roles)) {
        foreach ($GLOBALS['wp_roles']->role_objects as $key => $role) {
            if (isset($roles[$key]) && $role->has_cap('manage_options')) {
                $role->add_cap('edit_redirection');
                $role->add_cap('edit_redirections');
                $role->add_cap('edit_others_redirections');
                $role->add_cap('publish_redirections');
                $role->add_cap('read_redirection');
                $role->add_cap('read_private_redirections');
                $role->add_cap('delete_redirection');
                $role->add_cap('delete_redirections');
                $role->add_cap('delete_others_redirections');
                $role->add_cap('delete_published_redirections');
            }
            if (isset($roles[$key]) && $role->has_cap('manage_options')) {
                $role->add_cap('edit_schema');
                $role->add_cap('edit_schemas');
                $role->add_cap('edit_others_schemas');
                $role->add_cap('publish_schemas');
                $role->add_cap('read_schema');
                $role->add_cap('read_private_schemas');
                $role->add_cap('delete_schema');
                $role->add_cap('delete_schemas');
                $role->add_cap('delete_others_schemas');
                $role->add_cap('delete_published_schemas');
            }
        }
    }

    do_action('seopress_pro_activation');
}
register_activation_hook(__FILE__, 'seopress_pro_activation');

function seopress_pro_deactivation() {
    delete_option('seopress_pro_activated');
    flush_rewrite_rules(false);
    wp_clear_scheduled_hook('seopress_404_cron_cleaning');
    wp_clear_scheduled_hook('seopress_google_analytics_cron');
    wp_clear_scheduled_hook('seopress_page_speed_insights_cron');
    wp_clear_scheduled_hook('seopress_404_email_alerts_cron');
    wp_clear_scheduled_hook('seopress_insights_gsc_cron');
    do_action('seopress_pro_deactivation');
}
register_deactivation_hook(__FILE__, 'seopress_pro_deactivation');

/**
 * Hooks uninstall.
 *
 * @since 4.2
 *
 * @author Benjamin
 */
function seopress_pro_uninstall() {
    //Remove CRON
    wp_clear_scheduled_hook('seopress_404_cron_cleaning');
    wp_clear_scheduled_hook('seopress_google_analytics_cron');
    wp_clear_scheduled_hook('seopress_page_speed_insights_cron');
    wp_clear_scheduled_hook('seopress_404_email_alerts_cron');
    wp_clear_scheduled_hook('seopress_insights_gsc_cron');
}

///////////////////////////////////////////////////////////////////////////////////////////////////
//Define
///////////////////////////////////////////////////////////////////////////////////////////////////
define('SEOPRESS_PRO_VERSION', '6.6.1');
define('SEOPRESS_PRO_AUTHOR', 'Benjamin Denis');
define('STORE_URL_SEOPRESS', 'https://www.seopress.org/es');
define('ITEM_ID_SEOPRESS', 86);
define('ITEM_NAME_SEOPRESS', 'SEOPress PRO');
define('SEOPRESS_LICENSE_PAGE', 'seopress-license');
define('SEOPRESS_PRO_PLUGIN_DIR_PATH', plugin_dir_path(__FILE__));
define('SEOPRESS_PRO_PLUGIN_DIR_URL', plugin_dir_url(__FILE__));
define('SEOPRESS_PRO_ASSETS_DIR', SEOPRESS_PRO_PLUGIN_DIR_URL . 'assets');
define('SEOPRESS_PRO_PUBLIC_URL', SEOPRESS_PRO_PLUGIN_DIR_URL . 'public');
define('SEOPRESS_PRO_TEMPLATE_DIR', SEOPRESS_PRO_PLUGIN_DIR_PATH . 'templates');
define('SEOPRESS_PRO_TEMPLATE_JSON_SCHEMAS', SEOPRESS_PRO_TEMPLATE_DIR . '/json-schemas');
define('SEOPRESS_PRO_TEMPLATE_STOP_WORDS', SEOPRESS_PRO_TEMPLATE_DIR . '/stop-words');

use SEOPressPro\Core\Kernel;

require_once __DIR__ . '/seopress-autoload.php';

if (file_exists(__DIR__ . '/vendor/autoload.php') && file_exists(WP_PLUGIN_DIR . '/wp-seopress/seopress-autoload.php')) {
    require_once WP_PLUGIN_DIR . '/wp-seopress/seopress-autoload.php';
    require_once __DIR__ . '/seopress-pro-functions.php';
    require_once __DIR__ . '/inc/admin/cron.php';

    $versions = get_option('seopress_versions');
    $versionFree = isset($versions['free']) ? $versions['free'] : 0;
    if ('6.6.1' !== $versionFree && version_compare($versionFree, '4.5.1', '<=')) {
        return;
    }

    Kernel::execute([
        'file' => __FILE__,
        'slug' => 'wp-seopress-pro',
        'main_file' => 'seopress-pro',
        'root' => __DIR__,
    ]);
}

///////////////////////////////////////////////////////////////////////////////////////////////////
//SEOPRESS PRO INIT
///////////////////////////////////////////////////////////////////////////////////////////////////
function seopress_pro_init() {
    //CRON
    seopress_pro_cron();

    //i18n
    load_plugin_textdomain('wp-seopress-pro', false, dirname(plugin_basename(__FILE__)) . '/languages/');

    global $pagenow;

    if ( ! function_exists('seopress_capability')) {
        return;
    }

    if (is_admin() || is_network_admin()) {
        require_once dirname(__FILE__) . '/inc/admin/admin.php';
        require_once dirname(__FILE__) . '/inc/admin/ajax.php';
        if ('post-new.php' == $pagenow || 'post.php' == $pagenow) {
            require_once dirname(__FILE__) . '/inc/admin/metaboxes/admin-metaboxes.php';
        }

        if ('index.php' == $pagenow || (isset($_GET['page']) && 'seopress-option' === $_GET['page'])) {
            require_once dirname(__FILE__) . '/inc/admin/wp-dashboard/google-analytics.php';
            require_once dirname(__FILE__) . '/inc/admin/wp-dashboard/matomo.php';
        }

        //CSV Import
        include_once dirname(__FILE__) . '/inc/admin/import/class-csv-wizard.php';

        //Bot
        require_once dirname(__FILE__) . '/inc/admin/bot.php';
        require_once dirname(__FILE__) . '/inc/functions/bot/seopress-bot.php';
    }

    // Watchers
    require_once dirname(__FILE__) . '/inc/admin/watchers/index.php';

    //Redirections
    if (is_admin()) {
        if (function_exists('seopress_get_toggle_option') && '1' === seopress_get_toggle_option('404')) {
            require_once dirname(__FILE__) . '/inc/admin/redirections/redirections.php';
        }
    }
    require_once dirname(__FILE__) . '/inc/functions/options.php';

    require_once dirname(__FILE__) . '/inc/admin/admin-bar/admin-bar.php';

    //Elementor
    if (did_action('elementor/loaded')) {
        require_once dirname(__FILE__) . '/inc/admin/page-builders/elementor/elementor.php';
        require_once dirname(__FILE__) . '/inc/admin/page-builders/elementor/elementor-widgets.php';
    }

    //TranslationsPress
    if ( ! class_exists('SEOPRESS_Language_Packs')) {
        if (is_admin() || is_network_admin()) {
            require_once dirname(__FILE__) . '/inc/admin/updater/t15s-registry.php';
        }
    }

    // Blocks registration
    require_once dirname(__FILE__) . '/inc/functions/blocks.php';
}
add_action('plugins_loaded', 'seopress_pro_init', 999);

///////////////////////////////////////////////////////////////////////////////////////////////////
//Translations
///////////////////////////////////////////////////////////////////////////////////////////////////
function seopress_init_t15s() {
    if (class_exists('SEOPRESS_Language_Packs')) {
        $t15s_updater = new SEOPRESS_Language_Packs(
            'wp-seopress-pro',
            'https://packages.translationspress.com/seopress/wp-seopress-pro/packages.json'
        );
    }
}
add_action('init', 'seopress_init_t15s');

///////////////////////////////////////////////////////////////////////////////////////////////////
//Loads the JS/CSS in admin
///////////////////////////////////////////////////////////////////////////////////////////////////
// Add JS for AI
add_action('seopress_seo_metabox_init', 'seopress_pro_admin_scripts');
function seopress_pro_admin_scripts(){

    $active = seopress_get_service('ToggleOption')->getToggleAi();
    if($active !== "1"){
        return;
    }

    $seopress_ai_generate_seo_meta = [
        'seopress_nonce'            => wp_create_nonce('seopress_ai_generate_seo_meta_nonce'),
        'seopress_ai_generate_seo_meta'      => admin_url('admin-ajax.php'),
    ];

    wp_enqueue_script('seopress-pro-ai-js', plugins_url('assets/js/seopress-pro-ai.js', __FILE__), ['jquery'], SEOPRESS_PRO_VERSION, true);

    wp_localize_script('seopress-pro-ai-js', 'seopressAjaxAIMetaSEO', $seopress_ai_generate_seo_meta);
}

//Google Page Speed Insights
function seopress_pro_admin_ps_scripts() {
    wp_enqueue_script('seopress-page-speed', plugins_url('assets/js/seopress-page-speed.js', __FILE__), ['jquery', 'jquery-ui-accordion'], SEOPRESS_PRO_VERSION, true);

    $seopress_request_page_speed = [
        'seopress_nonce' => wp_create_nonce('seopress_request_page_speed_nonce'),
        'seopress_request_page_speed' => admin_url('admin-ajax.php'),
    ];
    wp_localize_script('seopress-page-speed', 'seopressAjaxRequestPageSpeed', $seopress_request_page_speed);

    $seopress_clear_page_speed_cache = [
        'seopress_nonce' => wp_create_nonce('seopress_clear_page_speed_cache_nonce'),
        'seopress_clear_page_speed_cache' => admin_url('admin-ajax.php'),
    ];
    wp_localize_script('seopress-page-speed', 'seopressAjaxClearPageSpeedCache', $seopress_clear_page_speed_cache);

}

//SEOPRESS PRO Options page
function seopress_pro_add_admin_options_scripts($hook) {
    $prefix = defined('SCRIPT_DEBUG') && SCRIPT_DEBUG ? '' : '.min';

    wp_register_style('seopress-pro-admin', plugins_url('assets/css/seopress-pro' . $prefix . '.css', __FILE__), [], SEOPRESS_PRO_VERSION);
    wp_enqueue_style('seopress-pro-admin');

    //Dashboard GA
    global $pagenow;
    if ('index.php' == $pagenow || (isset($_GET['page']) && 'seopress-option' === $_GET['page'])) {
        if (function_exists('seopress_google_analytics_dashboard_widget_option') && seopress_google_analytics_dashboard_widget_option() !== '1') {
            wp_register_style('seopress-ga-dashboard-widget', plugins_url('assets/css/seopress-pro-dashboard' . $prefix . '.css', __FILE__), [], SEOPRESS_PRO_VERSION);
            wp_enqueue_style('seopress-ga-dashboard-widget');

            //GA API
            wp_enqueue_script('seopress-pro-ga-embed', plugins_url('assets/js/chart.bundle.min.js', __FILE__), [], SEOPRESS_PRO_VERSION);

            wp_enqueue_script('seopress-pro-ga', plugins_url('assets/js/seopress-pro-ga.js', __FILE__), ['jquery', 'jquery-ui-tabs'], SEOPRESS_PRO_VERSION);

            $seopress_request_google_analytics = [
                'seopress_nonce' => wp_create_nonce('seopress_request_google_analytics_nonce'),
                'seopress_request_google_analytics' => admin_url('admin-ajax.php'),
            ];
            wp_localize_script('seopress-pro-ga', 'seopressAjaxRequestGoogleAnalytics', $seopress_request_google_analytics);
        }
    }

    //Dashboard Matomo
    global $pagenow;
    if ('index.php' == $pagenow || (isset($_GET['page']) && 'seopress-option' === $_GET['page'])) {
        if (function_exists('seopress_google_analytics_matomo_dashboard_widget_option') && seopress_google_analytics_matomo_dashboard_widget_option() !== '1') {
            wp_register_style('seopress-ga-dashboard-widget', plugins_url('assets/css/seopress-pro-dashboard' . $prefix . '.css', __FILE__), [], SEOPRESS_PRO_VERSION);
            wp_enqueue_style('seopress-ga-dashboard-widget');

            //Matomo API
            wp_enqueue_script('seopress-pro-ga-embed', plugins_url('assets/js/chart.bundle.min.js', __FILE__), [], SEOPRESS_PRO_VERSION);

            wp_enqueue_script('seopress-pro-matomo', plugins_url('assets/js/seopress-pro-matomo.js', __FILE__), ['jquery', 'jquery-ui-tabs'], SEOPRESS_PRO_VERSION);

            $seopress_request_matomo_analytics = [
                'seopress_nonce' => wp_create_nonce('seopress_request_matomo_analytics_nonce'),
                'seopress_request_matomo_analytics' => admin_url('admin-ajax.php'),
            ];
            wp_localize_script('seopress-pro-matomo', 'seopressAjaxRequestMatomoAnalytics', $seopress_request_matomo_analytics);
        }
    }

    //Local Business widget
    if ('widgets.php' == $pagenow) {
        wp_enqueue_script('seopress-pro-lb-widget', plugins_url('assets/js/seopress-pro-lb-widget.js', __FILE__), ['jquery', 'jquery-ui-tabs'], SEOPRESS_PRO_VERSION);

        $seopress_pro_lb_widget = [
            'seopress_nonce' => wp_create_nonce('seopress_pro_lb_widget_nonce'),
            'seopress_pro_lb_widget' => admin_url('admin-ajax.php'),
        ];
        wp_localize_script('seopress-pro-lb-widget', 'seopressAjaxLocalBusinessOrder', $seopress_pro_lb_widget);
    }

    //GA tab
    if (isset($_GET['page']) && ('seopress-google-analytics' == $_GET['page'])) {
        wp_enqueue_script('seopress-pro-ga-lock', plugins_url('assets/js/seopress-pro-ga-lock.js', __FILE__), ['jquery'], SEOPRESS_PRO_VERSION, true);

        $seopress_google_analytics_lock = [
            'seopress_nonce' => wp_create_nonce('seopress_google_analytics_lock_nonce'),
            'seopress_google_analytics_lock' => admin_url('admin-ajax.php'),
        ];
        wp_localize_script('seopress-pro-ga-lock', 'seopressAjaxLockGoogleAnalytics', $seopress_google_analytics_lock);
    }

    //Pro Tabs
    if (isset($_GET['page']) && ('seopress-pro-page' == $_GET['page'])) {
        wp_enqueue_script('seopress-pro-admin-tabs-js', plugins_url('assets/js/seopress-pro-tabs.js', __FILE__), ['jquery-ui-tabs'], SEOPRESS_PRO_VERSION);
        wp_enqueue_script('seopress-pro-search-console-js', plugins_url('assets/js/seopress-pro-search-console.js', __FILE__), ['jquery'], SEOPRESS_PRO_VERSION);

        $search_console = [
            'seopress_nonce' => wp_create_nonce('seopress_request_bot_nonce'),
            'seopress_request_bot' => admin_url('admin-ajax.php'),
            'seopress_nonce_search_console' => wp_create_nonce('seopress_nonce_search_console'),
            'seopress_search_console_batch_process' => apply_filters('seopress_search_console_batch_process', 20),
            'i18n' => [
                'progress_matches' => __('%s matches.', 'wp-seopress-pro'),
                'finish_matches' => __('The analysis is complete. We have matched %s urls. Go to post / page or post types list to see your metrics.', 'wp-seopress-pro'),
            ]
        ];
        wp_localize_script('seopress-pro-search-console-js', 'seopressAjaxGSC', $search_console);
    }

    if (isset($_GET['page']) && ('seopress-pro-page' == $_GET['page'] || 'seopress-network-option' == $_GET['page'])) {
        //htaccess
        wp_enqueue_script('seopress-save-htaccess', plugins_url('assets/js/seopress-htaccess.js', __FILE__), ['jquery'], SEOPRESS_PRO_VERSION, true);

        $seopress_save_htaccess = [
            'seopress_nonce' => wp_create_nonce('seopress_save_htaccess_nonce'),
            'seopress_save_htaccess' => admin_url('admin-ajax.php'),
        ];
        wp_localize_script('seopress-save-htaccess', 'seopressAjaxSaveHtaccess', $seopress_save_htaccess);

        wp_enqueue_media();
    }

    //Google Page Speed
    if ('edit.php' == $hook) {
        seopress_pro_admin_ps_scripts();
    } elseif (isset($_GET['page']) && ('seopress-pro-page' == $_GET['page'])) {
        seopress_pro_admin_ps_scripts();
    }

    //Bot Tabs
    if (isset($_GET['page']) && ('seopress-bot-batch' == $_GET['page'])) {
        wp_enqueue_script('seopress-bot-admin-tabs-js', plugins_url('assets/js/seopress-bot-tabs.js', __FILE__), ['jquery-ui-tabs'], SEOPRESS_PRO_VERSION);


        $seopress_bot = [
            'seopress_nonce' => wp_create_nonce('seopress_request_bot_nonce'),
            'seopress_request_bot' => admin_url('admin-ajax.php'),
        ];
        wp_localize_script('seopress-bot-admin-tabs-js', 'seopressAjaxBot', $seopress_bot);
    }

    //License
    if (isset($_GET['page']) && ('seopress-license' == $_GET['page'])) {
        wp_enqueue_script('seopress-license', plugins_url('assets/js/seopress-pro-license.js', __FILE__), ['jquery'], SEOPRESS_PRO_VERSION, true);

        $seopress_request_reset_license = [
            'seopress_nonce' => wp_create_nonce('seopress_request_reset_license_nonce'),
            'seopress_request_reset_license' => admin_url('admin-ajax.php'),
        ];
        wp_localize_script('seopress-license', 'seopressAjaxResetLicense', $seopress_request_reset_license);
    }
}

add_action('admin_enqueue_scripts', 'seopress_pro_add_admin_options_scripts', 10, 1);

///////////////////////////////////////////////////////////////////////////////////////////////////
//SEOPress PRO Notices
///////////////////////////////////////////////////////////////////////////////////////////////////
function seopress_pro_admin_notices() {
    if (!current_user_can('manage_options')) {
        return;
    }

    if ( ! is_plugin_active('wp-seopress/seopress.php')) {
        ?>
<div class="notice error">
    <p>
        <?php _e('Please enable <strong>SEOPress</strong> in order to use SEOPress PRO.', 'wp-seopress-pro'); ?>
        <a href="<?php echo esc_url(admin_url('plugin-install.php?tab=plugin-information&plugin=wp-seopress&TB_iframe=true&width=600&height=550')); ?>"
            class="thickbox btn btnPrimary" target="_blank"><?php _e('Enable / Download now!', 'wp-seopress-pro'); ?></a>
    </p>
</div>
<?php
    } else {
        if (defined('SCRIPT_DEBUG') && SCRIPT_DEBUG === true) {
            return;
        }
        /**
         * Display an update message if PRO version is too old compare to Free version
         *
         * @since 6.0
         *
         * @return void
         *
         * @author Benjamin
         */
        if ( version_compare(SEOPRESS_PRO_VERSION, '5.4', '<')) {
            $docs = seopress_get_docs_links();
            $class   = is_seopress_page() ? 'seopress-notice is-warning' : 'notice notice-warning';
            ?>
            <div class="<?php echo $class; ?>">
                <p>
                    <?php _e('A new <strong>SEOPress PRO</strong> update (v<code>6.6</code>) is available (current installed version <code>'.SEOPRESS_PRO_VERSION.'</code>). <br>Please update now to get new features and prevent any issues.', 'wp-seopress-pro'); ?>
                </p>
                <p>
                    <a href="<?php echo $docs['downloads']; ?>" class="button button-primary" target="_blank">
                        <?php _e('Update SEOPress PRO', 'wp-seopress-pro'); ?>
                    </a>
                </p>
            </div>
        <?php
        }


        /**
         * Display a message if license key is not activated to receive automatic updates
         *
         * @since 6.3
         *
         * @return void
         *
         * @author Benjamin
         */
        if ('valid' != get_option('seopress_pro_license_status') && ! is_multisite()) {

            $screen_id = get_current_screen();
            if ('seopress-option' === $screen_id->parent_base && 'seo_page_seopress-license' !== $screen_id->base) {
                $docs = seopress_get_docs_links();

                $class   = 'seopress-notice is-error';

                $message = '<p><strong>' . __('Welcome to SEOPress PRO!', 'wp-seopress-pro') . '</strong></p>';

                $message .= '<p>' . __('Please activate your license to receive automatic updates and get premium support.', 'wp-seopress-pro') . '</p>';

                $message .= '<p><a class="button button-primary" href="' . admin_url('admin.php?page=seopress-license') . '">' . __('Activate License', 'wp-seopress-pro') . '</a></p>';

                printf('<div class="%1$s">%2$s</div>', esc_attr($class), $message);
            }
        }
    }
}
add_action('admin_notices', 'seopress_pro_admin_notices');

///////////////////////////////////////////////////////////////////////////////////////////////////
//Shortcut settings page
///////////////////////////////////////////////////////////////////////////////////////////////////
add_filter('plugin_action_links', 'seopress_pro_plugin_action_links', 10, 2);
function seopress_pro_plugin_action_links($links, $file) {
    static $this_plugin;

    if ( ! $this_plugin) {
        $this_plugin = plugin_basename(__FILE__);
    }

    if ($file == $this_plugin) {
        $settings_link = '<a href="' . admin_url('admin.php?page=seopress-pro-page') . '">' . __('Settings', 'wp-seopress-pro') . '</a>';

        $website_link = '<a href="https://www.seopress.org/support/" target="_blank">' . __('Support', 'wp-seopress-pro') . '</a>';

        if ('valid' != get_option('seopress_pro_license_status')) {
            $license_link = '<a style="color:red;font-weight:bold" href="' . admin_url('admin.php?page=seopress-license') . '">' . __('Activate your license', 'wp-seopress-pro') . '</a>';
        } else {
            $license_link = '<a href="' . admin_url('admin.php?page=seopress-license') . '">' . __('License', 'wp-seopress-pro') . '</a>';
        }

        if (is_plugin_active('wp-seopress-pro/seopress-pro.php') && method_exists(seopress_get_service('ToggleOption'), 'getToggleWhiteLabel') && '1' === seopress_get_service('ToggleOption')->getToggleWhiteLabel() && '1' === seopress_pro_get_service('OptionPro')->getWhiteLabelHelpLinks()) {
            array_unshift($links, $settings_link);
        } else {
            array_unshift($links, $settings_link, $website_link, $license_link);
        }
    }

    return $links;
}

///////////////////////////////////////////////////////////////////////////////////////////////////
//SEOPress PRO Updater
///////////////////////////////////////////////////////////////////////////////////////////////////
if ( ! class_exists('SEOPRESS_Updater')) {
    // load our custom updater
    require_once dirname(__FILE__) . '/inc/admin/updater/plugin-updater.php';
    require_once dirname(__FILE__) . '/inc/admin/updater/plugin-upgrader.php';
}

function SEOPRESS_Updater() {
    // To support auto-updates, this needs to run during the wp_version_check cron job for privileged users.
    $doing_cron = defined('DOING_CRON') && DOING_CRON;
    if ( ! current_user_can('manage_options') && ! $doing_cron) {
        return;
    }

    // retrieve our license key from the DB
    $license_key = defined('SEOPRESS_LICENSE_KEY') && ! empty(SEOPRESS_LICENSE_KEY) && is_string(SEOPRESS_LICENSE_KEY) ? SEOPRESS_LICENSE_KEY : trim(get_option('seopress_pro_license_key'));

    // setup the updater
    $edd_updater = new SEOPRESS_Updater(
        STORE_URL_SEOPRESS,
        __FILE__,
        [
            'version' => SEOPRESS_PRO_VERSION,
            'license' => $license_key,
            'item_id' => ITEM_ID_SEOPRESS,
            'author' => SEOPRESS_PRO_AUTHOR,
            'url' => home_url(),
            'beta' => false,
        ]
    );
}
add_action('init', 'SEOPRESS_Updater', 0);

///////////////////////////////////////////////////////////////////////////////////////////////////
// Highlight Current menu when Editing Post Type
///////////////////////////////////////////////////////////////////////////////////////////////////
add_filter('parent_file', 'seopress_submenu_current');
function seopress_submenu_current($current_menu) {
    global $pagenow;
    global $typenow;
    if ('post-new.php' == $pagenow || 'post.php' == $pagenow) {
        if ('seopress_404' == $typenow || 'seopress_bot' == $typenow || 'seopress_backlinks' == $typenow || 'seopress_schemas' == $typenow) {
            global $plugin_page;
            $plugin_page = 'seopress-option';
        }
    }

    return $current_menu;
}
