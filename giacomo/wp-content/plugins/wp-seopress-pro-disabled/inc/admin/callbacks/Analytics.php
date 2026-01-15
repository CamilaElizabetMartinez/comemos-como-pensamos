<?php

defined('ABSPATH') or exit('Please don&rsquo;t call the plugin directly. Thanks :)');

//Google Analytics
function seopress_google_analytics_auth_callback() {
    $options = get_option('seopress_google_analytics_option_name');

    $selected = isset($options['seopress_google_analytics_auth']) ? $options['seopress_google_analytics_auth'] : null;

    /**
      * @deprecated 5.9.0
      * @uses seopress_get_service('GoogleAnalyticsOption')
      */
    function seopress_google_analytics_auth_client_id_option() {
        $service = seopress_get_service('GoogleAnalyticsOption');

        if ( ! empty($service) || ! method_exists($service, 'getAuthClientId')) {
            $data = get_option('seopress_google_analytics_option_name');
            if (isset($data['seopress_google_analytics_auth_client_id'])) {
                return $data['seopress_google_analytics_auth_client_id'];
            }
        }

        return $service->getAuthClientId();
    }

    /**
     * @deprecated 5.9.0
     * @uses seopress_get_service('GoogleAnalyticsOption')
     */
    function seopress_google_analytics_auth_secret_id_option() {
        $service = seopress_get_service('GoogleAnalyticsOption');

        if ( ! empty($service) || ! method_exists($service, 'getAuthSecretId')) {
            $data = get_option('seopress_google_analytics_option_name');
            if (isset($data['seopress_google_analytics_auth_secret_id'])) {
                return $data['seopress_google_analytics_auth_secret_id'];
            }
        }

        return $service->getAuthSecretId();
    }

    /**
     * @deprecated 5.9.0
     * @uses seopress_pro_get_service('GoogleAnalyticsPro')
     */
    function seopress_google_analytics_auth_token_option() {
        return seopress_pro_get_service('GoogleAnalyticsOptionPro')->getAccessToken();
    }

    /**
     * @deprecated 5.9.0
     * @uses seopress_pro_get_service('GoogleAnalyticsPro')
     */
    function seopress_google_analytics_refresh_token_option() {
        return seopress_pro_get_service('GoogleAnalyticsOptionPro')->getRefreshToken();
    }

    /**
     * @deprecated 5.9.0
     * @uses seopress_pro_get_service('GoogleAnalyticsPro')
     */
    function seopress_google_analytics_debug_option() {
        return seopress_pro_get_service('GoogleAnalyticsOptionPro')->getDebug();
    }

    if ('' != seopress_google_analytics_auth_client_id_option()) {
        $client_id = seopress_google_analytics_auth_client_id_option();
    }

    if ('' != seopress_google_analytics_auth_secret_id_option()) {
        $client_secret = seopress_google_analytics_auth_secret_id_option();
    }

    $redirect_uri = admin_url('admin.php?page=seopress-google-analytics');

    if ('' != seopress_google_analytics_auth_client_id_option() && '' != seopress_google_analytics_auth_secret_id_option()) {
        require_once SEOPRESS_PRO_PLUGIN_DIR_PATH . '/vendor/autoload.php';
        $client = new \Google\Client();
        $client->setApplicationName('Client_Library_Examples');
        $client->setClientId($client_id);
        $client->setClientSecret($client_secret);
        $client->setRedirectUri($redirect_uri);
        $client->setScopes(['https://www.googleapis.com/auth/analytics.readonly']);
        $client->setApprovalPrompt('force');   // mandatory to get this fucking refreshtoken
        $client->setAccessType('offline'); // mandatory to get this fucking refreshtoken
        $client->setIncludeGrantedScopes(true); // mandatory to get this fucking refreshtoken
        $client->setPrompt('consent'); // mandatory to get this fucking refreshtoken
    } else { ?>
<p>
    <?php _e('To sign in with Google Analytics, you have to set a Client and Secret ID in the fields below:', 'wp-seopress-pro'); ?>
</p>
<?php }

    //Logout
    if (isset($_GET['logout'], $_GET['_wpnonce'])) {
        if (wp_verify_nonce($_GET['_wpnonce'], 'ga-logout')) {
            $seopress_google_analytics_options = get_option('seopress_google_analytics_option_name1');
            $seopress_google_analytics_options['refresh_token'] = '';
            $seopress_google_analytics_options['access_token'] = '';
            $seopress_google_analytics_options['code'] = '';
            $seopress_google_analytics_options['debug'] = '';
            update_option('seopress_google_analytics_option_name1', $seopress_google_analytics_options, 'yes');
            update_option('seopress_google_analytics_lock_option_name', '', 'yes');
        }
    }

    if ('' != seopress_google_analytics_auth_client_id_option() && '' != seopress_google_analytics_auth_secret_id_option()) {
        // No nonce token, GG will check if the code is correct, if not, nothing happen.
        if (isset($_GET['code']) && '' == seopress_google_analytics_auth_token_option()) {
            $client->authenticate($_GET['code']);
            $_SESSION['token'] = $client->getAccessToken();

            $seopress_google_analytics_options = get_option('seopress_google_analytics_option_name1');
            $seopress_google_analytics_options['access_token'] = $_SESSION['token']['access_token'];
            $seopress_google_analytics_options['refresh_token'] = $_SESSION['token']['refresh_token'];
            $seopress_google_analytics_options['debug'] = $_SESSION['token'];
            $seopress_google_analytics_options['code'] = $_GET['code'];
            update_option('seopress_google_analytics_option_name1', $seopress_google_analytics_options, 'yes');
        }

        //Login button
        if ( ! $client->getAccessToken() && '' == seopress_google_analytics_auth_token_option()) {
            $authUrl = $client->createAuthUrl(); ?>

            <p>
                <a class="login btn btnSecondary"
                    href="<?php echo $authUrl; ?> ">
                    <?php _e('Connect with Google Analytics', 'wp-seopress-pro'); ?>
                </a>
            </p>
            <?php
        }

    //Logout button
    if ('' != seopress_google_analytics_auth_token_option()) {
        $client->setAccessToken(seopress_google_analytics_debug_option());

        if ($client->isAccessTokenExpired()) {
            $client->refreshToken(seopress_google_analytics_debug_option());

            $seopress_new_access_token = $client->getAccessToken(seopress_google_analytics_debug_option());

            $seopress_google_analytics_options = get_option('seopress_google_analytics_option_name1');
            $seopress_google_analytics_options['access_token'] = $seopress_new_access_token['access_token'];
            $seopress_google_analytics_options['refresh_token'] = $seopress_new_access_token['refresh_token'];
            $seopress_google_analytics_options['debug'] = $seopress_new_access_token;
            update_option('seopress_google_analytics_option_name1', $seopress_google_analytics_options, 'yes');
        } ?>

        <p>
            <a class="logout btn btnSecondary" href="<?php echo wp_nonce_url($redirect_uri . '&logout=1', 'ga-logout'); ?>"><?php _e('Log out from Google', 'wp-seopress-pro'); ?></a>
        </p>

        <?php
        $service = new Google_Service_Analytics($client);

        //Select view from Google Analytics
        if ('1' == get_option('seopress_google_analytics_lock_option_name')) { ?>
            <p>
                <?php _e('Your Google Analytics view is locked. Log out from Google to unlocked it.', 'wp-seopress-pro'); ?>
            </p>
            <input id="seopress_google_analytics_auth" name="seopress_google_analytics_option_name[seopress_google_analytics_auth]"
                type="hidden" value="<?php echo $selected; ?>">
            <?php } else {
                //Important to prevent fatal errors
                try {
                    $accounts = $service->management_accountSummaries->listManagementAccountSummaries();

                    if ( ! empty($accounts->getItems())) { ?>
                        <div class="seopress-notice is-warning">
                            <p><?php _e('Select a <strong>Universal Analytics (GA3)</strong> property below.','wp-seopress-pro'); ?></p>
                            <p><?php _e('If the <strong>list is empty, it means you‘re using GA4</strong>. So go to the next field to enter your <strong>GA4 property ID</strong>.','wp-seopress-pro'); ?></p>
                        </div>

                        <p>
                            <select id="seopress_google_analytics_auth"
                                name="seopress_google_analytics_option_name[seopress_google_analytics_auth]">

                                <?php foreach ($accounts->getItems() as $item) {
                                    foreach ($item->getWebProperties() as $wp) {
                                        $views = $wp->getProfiles();
                                        if ( ! is_null($views)) {
                                            foreach ($wp->getProfiles() as $view) {
                                                echo ' <option ';
                                                if ($view['id'] == $selected) {
                                                    echo 'selected="selected"';
                                                }
                                                echo ' value="' . $view['id'] . '">' . $item['name'] . ' > ' . $wp['name'] . ' > ' . $view['name'] . '</option>';
                                            }
                                        }
                                    }
                                } ?>

                            </select>
                        </p>

                    <?php if (null != $selected) { ?>
                            <div class="btn btnSecondary" id="seopress-google-analytics-lock">
                                <?php _e('Lock selection?', 'wp-seopress-pro'); ?>
                            </div>
                            <span class="spinner"></span>
                        <?php }
                        } else { ?>
                            <div class="seopress-notice is-error">
                                <p>
                                    <?php _e('We couldn\'t find any GA properties associated with your Google account. Please use another Google account.', 'wp-seopress-pro'); ?>
                                </p>
                            </div>
                        <?php }
                            } catch (Exception $e) {
                                $err = $e->getMessage();
                                $err = json_decode($err, true);

                                if ($err['error']['message']) { ?>
                            <div class="seopress-notice is-error">
                                <p>
                                    <?php _e('There was an Analytics API service error:', 'wp-seopress-pro'); ?><br>
                                    <strong><?php echo $e->getCode(); ?>:<?php echo $err['error']['message']; ?></strong>
                                </p>
                            </div>
                            <?php
                            }
                        }
                    }
                }
            ?>
    <?php }
    if (isset($options['seopress_google_analytics_auth'])) {
        esc_attr($options['seopress_google_analytics_auth']);
    }
}

function seopress_google_analytics_auth_client_id_callback() {
    $options = get_option('seopress_google_analytics_option_name');
    $docs = function_exists('seopress_get_docs_links') ? seopress_get_docs_links() : '';

    $selected = isset($options['seopress_google_analytics_auth_client_id']) ? esc_attr($options['seopress_google_analytics_auth_client_id']) : null; ?>

<input type="text" name="seopress_google_analytics_option_name[seopress_google_analytics_auth_client_id]"
    placeholder="<?php esc_html_e('Enter your client ID', 'wp-seopress-pro'); ?>"
    aria-label="<?php _e('Google Console Client ID', 'wp-seopress-pro'); ?>"
    value="<?php echo $selected; ?>" />

<?php if (isset($options['seopress_google_analytics_auth_client_id'])) {
    esc_html($options['seopress_google_analytics_auth_client_id']);
}

    echo seopress_tooltip_link($docs['analytics']['connect'], __('Guide to connect your WordPress site with Google Analytics - new window', 'wp-seopress-pro'));
}

function seopress_google_analytics_auth_secret_id_callback() {
    $options = get_option('seopress_google_analytics_option_name');

    $selected = isset($options['seopress_google_analytics_auth_secret_id']) ? esc_attr($options['seopress_google_analytics_auth_secret_id']) : null; ?>

<input type="text" name="seopress_google_analytics_option_name[seopress_google_analytics_auth_secret_id]"
    placeholder="<?php esc_html_e('Enter your secret ID', 'wp-seopress-pro'); ?>"
    aria-label="<?php _e('Google Console Secret ID', 'wp-seopress-pro'); ?>"
    value="<?php echo $selected; ?>" />

    <?php if (isset($options['seopress_google_analytics_auth_secret_id'])) {
        esc_html($options['seopress_google_analytics_auth_secret_id']);
    }
}

function seopress_google_analytics_ga4_property_id_callback() {
    $options = get_option('seopress_google_analytics_option_name');
    $docs = function_exists('seopress_get_docs_links') ? seopress_get_docs_links() : '';

    $selected = isset($options['seopress_google_analytics_ga4_property_id']) ? esc_attr($options['seopress_google_analytics_ga4_property_id']) : null; ?>

<input type="text" name="seopress_google_analytics_option_name[seopress_google_analytics_ga4_property_id]"
    placeholder="<?php esc_html_e('Enter your Google Analytics v4 property ID', 'wp-seopress-pro'); ?>"
    aria-label="<?php _e('GA4 property ID', 'wp-seopress-pro'); ?>"
    value="<?php echo $selected; ?>" />

<?php if (isset($options['seopress_google_analytics_ga4_property_id'])) {
    esc_html($options['seopress_google_analytics_ga4_property_id']);
}

    echo seopress_tooltip_link($docs['analytics']['ga4_property'], __('Find your GA4 property ID - new window', 'wp-seopress-pro')); ?>

<p class="description"><?php printf(__('<span class="seopress-help dashicons dashicons-external"></span><a class="seopress-help" href="%s" target="_blank">Find my property ID</a> If you enter a GA4 property ID, we will use GA4 instead of Universal Analytics to display your stats in Dashboard.', 'wp-seopress-pro'), esc_url($docs['analytics']['ga4_property'])); ?>
</p>

<?php
}

function seopress_google_analytics_dashboard_widget_callback() {
    $options = get_option('seopress_google_analytics_option_name');

    $check = isset($options['seopress_google_analytics_dashboard_widget']); ?>

<label for="seopress_google_analytics_dashboard_widget">
    <input id="seopress_google_analytics_dashboard_widget"
        name="seopress_google_analytics_option_name[seopress_google_analytics_dashboard_widget]" type="checkbox" <?php if ('1' == $check) { ?>
    checked="yes"
    <?php } ?>
    value="1"/>

    <?php _e('Remove Google Analytics stats widget from WordPress dashboard', 'wp-seopress-pro'); ?>
</label>

<?php if (isset($options['seopress_google_analytics_dashboard_widget'])) {
    esc_attr($options['seopress_google_analytics_dashboard_widget']);
}
}
