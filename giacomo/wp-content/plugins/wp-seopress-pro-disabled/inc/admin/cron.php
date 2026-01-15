<?php
if ( ! defined('ABSPATH')) {
    exit;
}

///////////////////////////////////////////////////////////////////////////////////////////////////
//Request Google PageSpeed Insights
///////////////////////////////////////////////////////////////////////////////////////////////////
function seopress_request_page_speed_fn($cron = false) {
    $options = get_option('seopress_pro_option_name');

    //Save URLs field
    if (isset($_POST['seopress_ps_url'])) {
        $options['seopress_ps_url'] = sanitize_textarea_field($_POST['seopress_ps_url']);
        update_option('seopress_pro_option_name', $options);
    } elseif (isset($options['seopress_ps_url'])) {
        $seopress_get_site_url = $options['seopress_ps_url'];
    } else {
        $seopress_get_site_url = get_home_url();
    }

    $options = get_option('seopress_pro_option_name');

    //Save API key
    if (isset($_POST['seopress_ps_api_key'])) {
        $options['seopress_ps_api_key'] = sanitize_textarea_field($_POST['seopress_ps_api_key']);
        update_option('seopress_pro_option_name', $options);
    }

    $options = get_option('seopress_pro_option_name');

    $seopress_google_api_key = ! empty($options['seopress_ps_api_key']) ? $options['seopress_ps_api_key'] : 'AIzaSyBqvSx2QrqbEqZovzKX8znGpTosw7KClHQ';
    $seopress_get_site_url = ! empty($options['seopress_ps_url']) ? $options['seopress_ps_url'] : get_home_url();

    delete_transient('seopress_results_page_speed');
    delete_transient('seopress_results_page_speed_desktop');

    $args = ['timeout' => 30, 'blocking' => true];

    //Mobile
    if (false === ($seopress_results_page_speed_cache = get_transient('seopress_results_page_speed'))) {
        $seopress_results_page_speed = wp_remote_retrieve_body(wp_remote_get('https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=' . $seopress_get_site_url . '&key=' . $seopress_google_api_key . '&screenshot=true&strategy=mobile&category=performance&category=seo&category=best-practices&locale=' . get_locale(), $args));
        $seopress_results_page_speed_cache = $seopress_results_page_speed;
        set_transient('seopress_results_page_speed', $seopress_results_page_speed_cache, 1 * DAY_IN_SECONDS);
    }

    //Desktop
    if (false === ($seopress_results_page_speed_desktop_cache = get_transient('seopress_results_page_speed_desktop'))) {
        $seopress_results_page_speed_desktop = wp_remote_retrieve_body(wp_remote_get('https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=' . $seopress_get_site_url . '&key=' . $seopress_google_api_key . '&screenshot=true&strategy=desktop&category=performance&locale=' . get_locale(), $args));
        $seopress_results_page_speed_desktop_cache = $seopress_results_page_speed_desktop;
        set_transient('seopress_results_page_speed_desktop', $seopress_results_page_speed_desktop_cache, 1 * DAY_IN_SECONDS);
    }
    $data = ['url' => add_query_arg('ps', 'done', remove_query_arg(['data_permalink', 'ps'], admin_url('admin.php?page=seopress-pro-page&ps=done#tab=tab_seopress_page_speed')))];

    if ($cron === false) {
        wp_send_json_success($data);
    }
    exit();
}
/**
 * Request Page Speed Insights by CRON.
 *
 * @since 5.3
 * @param boolean Is is a CRON request?
 *
 * @author Benjamin
 */
function seopress_request_page_speed_insights_cron() {
    seopress_request_page_speed_fn(true);
}
add_action('seopress_page_speed_insights_cron', 'seopress_request_page_speed_insights_cron');

function seopress_request_page_speed() {
    check_ajax_referer('seopress_request_page_speed_nonce');

    if (current_user_can(seopress_capability('manage_options', 'cron')) && is_admin()) {
        seopress_request_page_speed_fn();
    }
}
add_action('wp_ajax_seopress_request_page_speed', 'seopress_request_page_speed');

///////////////////////////////////////////////////////////////////////////////////////////////////
//Request Google Analytics
///////////////////////////////////////////////////////////////////////////////////////////////////
use Google\Analytics\Data\V1beta\BetaAnalyticsDataClient;
use Google\Analytics\Data\V1beta\DateRange;
use Google\Analytics\Data\V1beta\Dimension;
use Google\Analytics\Data\V1beta\OrderBy;
use Google\Analytics\Data\V1beta\Metric;
use Google\ApiCore\ApiException;
use Google\Auth\OAuth2;

function seopress_request_google_analytics_fn($clear = false) {
    if (function_exists('seopress_google_analytics_dashboard_widget_option') && seopress_google_analytics_dashboard_widget_option() === '1') {
        exit();
    }

    /**
     * @deprecated 5.9.0
     * @uses seopress_get_service('GoogleAnalyticsOption')
     */
    function seopress_google_analytics_auth_option() {
        $service = seopress_get_service('GoogleAnalyticsOption');

        if ( ! empty($service) || ! method_exists($service, 'getAuth')) {
            $data = get_option('seopress_google_analytics_option_name');
            if (isset($data['seopress_google_analytics_auth'])) {
                return $data['seopress_google_analytics_auth'];
            }
        }

        return $service->getAuth();
    }

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

    /**
     * @deprecated 5.9.0
     * @uses seopress_get_service('GoogleAnalyticsOption')
     */
    function seopress_google_analytics_ga4_2_option() {
       return seopress_get_service('GoogleAnalyticsOption')->getGA4();
    }

    /**
     * @deprecated 5.9.0
     * @uses seopress_get_service('GoogleAnalyticsOption')
     */
    function seopress_google_analytics_ga4_property_id_option() {
        $service = seopress_get_service('GoogleAnalyticsOption');

        if ( ! empty($service) || ! method_exists($service, 'getGA4PropertId')) {
            $data = get_option('seopress_google_analytics_option_name');
            if (isset($data['seopress_google_analytics_ga4_property_id'])) {
                return $data['seopress_google_analytics_ga4_property_id'];
            }
        }

        return $service->getGA4PropertId();
    }
    $authOption = seopress_google_analytics_auth_option();
    if ((!empty($authOption)  || '' != seopress_google_analytics_ga4_property_id_option() ) && '' != seopress_google_analytics_auth_token_option()) {

        try {
            // get saved data
            if ( ! $widget_options = get_option('seopress_ga_dashboard_widget_options')) {
                $widget_options = [];
            }

            // check if saved data contains content
            $seopress_ga_dashboard_widget_options_period = isset($widget_options['period']) ? $widget_options['period'] : false;

            $seopress_ga_dashboard_widget_options_type = isset($widget_options['type']) ? $widget_options['type'] : 'ga_sessions';

            // custom content saved by control callback, modify output
            if ($seopress_ga_dashboard_widget_options_period) {
                $period = $seopress_ga_dashboard_widget_options_period;
            } else {
                $period = '30daysAgo';
            }

            $client_id = seopress_google_analytics_auth_client_id_option();
            $client_secret = seopress_google_analytics_auth_secret_id_option();

            if(empty($client_id) || empty($client_secret)) {
                return;
            }

            $ga_account = 'ga:' . $authOption;
            $redirect_uri = admin_url('admin.php?page=seopress-google-analytics');

            require_once SEOPRESS_PRO_PLUGIN_DIR_PATH . '/vendor/autoload.php';

            $oauth = new OAuth2([
                'scope' => 'https://www.googleapis.com/auth/analytics.readonly',
                'tokenCredentialUri' => 'https://oauth2.googleapis.com/token',
                'authorizationUri' => 'https://accounts.google.com/o/oauth2/auth',
                'clientId' => seopress_google_analytics_auth_client_id_option(),
                'clientSecret' => seopress_google_analytics_auth_secret_id_option(),
                'redirectUri' => admin_url('admin.php?page=seopress-google-analytics'),
                'plugin_name' => 'SEOPress',
            ]);

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

            $client->setAccessToken(seopress_google_analytics_debug_option());

            if ($client->isAccessTokenExpired()) {
                $client->refreshToken(seopress_google_analytics_debug_option());

                $seopress_new_access_token = $client->getAccessToken(seopress_google_analytics_debug_option());

                $seopress_google_analytics_options = get_option('seopress_google_analytics_option_name1');
                $seopress_google_analytics_options['access_token'] = $seopress_new_access_token['access_token'];
                $seopress_google_analytics_options['refresh_token'] = $seopress_new_access_token['refresh_token'];
                $seopress_google_analytics_options['debug'] = $seopress_new_access_token;
                update_option('seopress_google_analytics_option_name1', $seopress_google_analytics_options, 'yes');
            }

            $service = new Google_Service_AnalyticsReporting($client);

            $oauth->setAccessToken(seopress_google_analytics_auth_token_option());
            $oauth->setRefreshToken(seopress_google_analytics_refresh_token_option());

            // GA4 Stats
            $all = [];

            //Get GA4 property ID
            $property_id = '';
            if (seopress_google_analytics_ga4_property_id_option()) {
                $property_id = seopress_google_analytics_ga4_property_id_option();

                //Get GA4 data
                $ga4_data = new BetaAnalyticsDataClient(['credentials' => $oauth]);
                // sessions
                $sessions = $ga4_data->runReport(
                    [
                        'property' => 'properties/' . $property_id,
                        'dateRanges' => [
                            new DateRange([
                                'start_date' => $period,
                                'end_date' => 'today',
                            ]),
                        ],
                        'dimensions' => [new Dimension([
                            'name' => 'date',
                        ]),
                        ],
                        'metrics' => [new Metric([
                            'name' => 'sessions',
                        ]),
                        ],
                        'orderBys' => [
                            new OrderBy([
                                'dimension' => new OrderBy\DimensionOrderBy([
                                    'dimension_name' => 'date',
                                    'order_type' => OrderBy\DimensionOrderBy\OrderType::ALPHANUMERIC
                                ]),
                                'desc' => false,
                            ]),
                        ],
                    ]
                );

                $users = $ga4_data->runReport(
                    [
                        'property' => 'properties/' . $property_id,
                        'dateRanges' => [
                            new DateRange([
                                'start_date' => $period,
                                'end_date' => 'today',
                            ]),
                        ],
                        'dimensions' => [new Dimension([
                            'name' => 'date',
                        ]),
                        ],
                        'metrics' => [new Metric([
                            'name' => 'totalUsers',
                        ]),
                        ],
                        'orderBys' => [
                            new OrderBy([
                                'dimension' => new OrderBy\DimensionOrderBy([
                                    'dimension_name' => 'date',
                                    'order_type' => OrderBy\DimensionOrderBy\OrderType::ALPHANUMERIC
                                ]),
                                'desc' => false,
                            ]),
                        ],
                    ]
                );

                $pageviews = $ga4_data->runReport(
                    [
                        'property' => 'properties/' . $property_id,
                        'dateRanges' => [
                            new DateRange([
                                'start_date' => $period,
                                'end_date' => 'today',
                            ]),
                        ],
                        'dimensions' => [new Dimension([
                            'name' => 'date',
                        ]),
                        ],
                        'metrics' => [new Metric([
                            'name' => 'screenPageViews',
                        ]),
                        ],
                        'orderBys' => [
                            new OrderBy([
                                'dimension' => new OrderBy\DimensionOrderBy([
                                    'dimension_name' => 'date',
                                    'order_type' => OrderBy\DimensionOrderBy\OrderType::ALPHANUMERIC
                                ]),
                                'desc' => false,
                            ]),
                        ],
                    ]
                );

                $avgSessionDuration = $ga4_data->runReport(
                    [
                        'property' => 'properties/' . $property_id,
                        'dateRanges' => [
                            new DateRange([
                                'start_date' => $period,
                                'end_date' => 'today',
                            ]),
                        ],
                        'dimensions' => [new Dimension([
                            'name' => 'date',
                        ]),
                        ],
                        'metrics' => [new Metric([
                            'name' => 'userEngagementDuration',
                        ]),
                        ],
                        'orderBys' => [
                            new OrderBy([
                                'dimension' => new OrderBy\DimensionOrderBy([
                                    'dimension_name' => 'date',
                                    'order_type' => OrderBy\DimensionOrderBy\OrderType::ALPHANUMERIC
                                ]),
                                'desc' => false,
                            ]),
                        ],
                    ]
                );

                $results = [
                    'sessions' => $sessions,
                    'users' => $users,
                    'pageviews' => $pageviews,
                    'avgSessionDuration' => $avgSessionDuration
                ];

                foreach ($results as $key => $value) {
                    foreach ($value->getRows() as $row) {
                        $all[0][$key][$row->getDimensionValues()[0]->getValue()] = $row->getMetricValues()[0]->getValue();
                    }
                }
            }

            if (true === $clear) {
                delete_transient('seopress_results_google_analytics');
            }

            if (false === ($seopress_results_google_analytics_cache = get_transient('seopress_results_google_analytics'))) {
                $seopress_results_google_analytics_cache = [];

                //////GA4/////////////
                if (seopress_google_analytics_ga4_property_id_option()) {
                    $seopress_results_google_analytics_cache['sessions'] = isset($all[0]['sessions']) && is_array($all[0]['sessions']) ? array_sum($all[0]['sessions']) : 0;
                    $seopress_results_google_analytics_cache['users'] = isset($all[0]['users']) && is_array($all[0]['users']) ? array_sum($all[0]['users']) : 0;
                    $seopress_results_google_analytics_cache['pageviews'] = isset($all[0]['pageviews']) && is_array($all[0]['pageviews']) ? array_sum($all[0]['pageviews']) : 0;


                    $seopress_results_google_analytics_cache['avgSessionDuration'] = 0;
                    if (isset($all[0]['avgSessionDuration']) && is_array($all[0]['avgSessionDuration'])) {
                        $sum = array_sum($all[0]['avgSessionDuration']);
                        $divided = count($all[0]['avgSessionDuration']);
                        if ($divided === 0) {
                            $divided = 1;
                        }

                        $seopress_results_google_analytics_cache['avgSessionDuration'] = gmdate('i:s', $sum / $divided);
                    }


                    switch ($seopress_ga_dashboard_widget_options_type) {
                        case 'ga_sessions':
                            $ga_sessions_rows = $all[0]['sessions'];
                            $seopress_ga_dashboard_widget_options_title = __('Sessions', 'wp-seopress-pro');
                            break;
                        case 'ga_users':
                            $ga_sessions_rows = $all[0]['users'];
                            $seopress_ga_dashboard_widget_options_title = __('Users', 'wp-seopress-pro');
                            break;
                        case 'ga_pageviews':
                            $ga_sessions_rows = $all[0]['pageviews'];
                            $seopress_ga_dashboard_widget_options_title = __('Page Views', 'wp-seopress-pro');
                            break;
                        case 'ga_avgSessionDuration':
                            $ga_sessions_rows = $all[0]['avgSessionDuration'];
                            $seopress_ga_dashboard_widget_options_title = __('Session Duration', 'wp-seopress-pro');
                            break;
                        default:
                            $ga_sessions_rows = $all[0]['sessions'];
                            $seopress_ga_dashboard_widget_options_title = __('Sessions', 'wp-seopress-pro');
                    }

                    function seopress_ga_dashboard_4_get_sessions_labels($ga_date) {
                        $labels = [];
                        foreach ($ga_date as $key => $value) {
                            array_push($labels, date_i18n(get_option('date_format'), strtotime($key)));
                        }

                        return $labels;
                    }

                    function seopress_ga_dashboard_4_get_sessions_data($ga_sessions_rows) {
                        $data = [];
                        foreach ($ga_sessions_rows as $key => $value) {
                            array_push($data, $value);
                        }

                        return $data;
                    }
                    $seopress_results_google_analytics_cache['sessions_graph_labels'] = seopress_ga_dashboard_4_get_sessions_labels($ga_sessions_rows);
                    $seopress_results_google_analytics_cache['sessions_graph_data'] = seopress_ga_dashboard_4_get_sessions_data($ga_sessions_rows);
                    $seopress_results_google_analytics_cache['sessions_graph_title'] = $seopress_ga_dashboard_widget_options_title;
                } else {

                    ////////////////////////////////////////////////////////////////////////////////////////
                    //Request Google Stats
                    ////////////////////////////////////////////////////////////////////////////////////////

                    //DATE RANGE
                    ////////////////////////////////////////////////////////////////////////////////////////

                    // Date
                    $dateRange = new Google_Service_AnalyticsReporting_DateRange();
                    $dateRange->setStartDate($period);
                    $dateRange->setEndDate('today');

                    //METRICS
                    ////////////////////////////////////////////////////////////////////////////////////////

                    // Sessions
                    $sessions = new Google_Service_AnalyticsReporting_Metric();
                    $sessions->setExpression('ga:sessions');
                    $sessions->setAlias('sessions');

                    // Users
                    $users = new Google_Service_AnalyticsReporting_Metric();
                    $users->setExpression('ga:users');
                    $users->setAlias('users');

                    // Page Views
                    $pageviews = new Google_Service_AnalyticsReporting_Metric();
                    $pageviews->setExpression('ga:pageviews');
                    $pageviews->setAlias('pageviews');

                    // Page Views per session
                    $pageviewsPerSession = new Google_Service_AnalyticsReporting_Metric();
                    $pageviewsPerSession->setExpression('ga:pageviewsPerSession');
                    $pageviewsPerSession->setAlias('pageviewsPerSession');

                    // Average session duration
                    $avgSessionDuration = new Google_Service_AnalyticsReporting_Metric();
                    $avgSessionDuration->setExpression('ga:avgSessionDuration');
                    $avgSessionDuration->setAlias('avgSessionDuration');

                    // Bounce rate
                    $bounceRate = new Google_Service_AnalyticsReporting_Metric();
                    $bounceRate->setExpression('ga:bounceRate');
                    $bounceRate->setAlias('bounceRate');

                    // % New sessions
                    $percentNewSessions = new Google_Service_AnalyticsReporting_Metric();
                    $percentNewSessions->setExpression('ga:percentNewSessions');
                    $percentNewSessions->setAlias('percentNewSessions');

                    // Total events
                    $totalEvents = new Google_Service_AnalyticsReporting_Metric();
                    $totalEvents->setExpression('ga:totalEvents');
                    $totalEvents->setAlias('totalEvents');

                    // Unique events
                    $uniqueEvents = new Google_Service_AnalyticsReporting_Metric();
                    $uniqueEvents->setExpression('ga:uniqueEvents');
                    $uniqueEvents->setAlias('uniqueEvents');

                    //DIMENSIONS
                    ////////////////////////////////////////////////////////////////////////////////////////

                    // Date
                    $date = new Google_Service_AnalyticsReporting_Dimension();
                    $date->setName('ga:date');

                    // Language
                    $language = new Google_Service_AnalyticsReporting_Dimension();
                    $language->setName('ga:language');

                    // Country
                    $country = new Google_Service_AnalyticsReporting_Dimension();
                    $country->setName('ga:country');

                    // Device Category
                    $deviceCategory = new Google_Service_AnalyticsReporting_Dimension();
                    $deviceCategory->setName('ga:deviceCategory');

                    // Browser
                    $browser = new Google_Service_AnalyticsReporting_Dimension();
                    $browser->setName('ga:browser');

                    // Social Network
                    $socialNetwork = new Google_Service_AnalyticsReporting_Dimension();
                    $socialNetwork->setName('ga:socialNetwork');

                    // Channel Grouping
                    $channelGrouping = new Google_Service_AnalyticsReporting_Dimension();
                    $channelGrouping->setName('ga:channelGrouping');

                    // Source
                    $source = new Google_Service_AnalyticsReporting_Dimension();
                    $source->setName('ga:source');

                    // Full Referrer
                    $fullReferrer = new Google_Service_AnalyticsReporting_Dimension();
                    $fullReferrer->setName('ga:fullReferrer');

                    // Page Title
                    $pageTitle = new Google_Service_AnalyticsReporting_Dimension();
                    $pageTitle->setName('ga:pageTitle');

                    // Event Category
                    $eventCategory = new Google_Service_AnalyticsReporting_Dimension();
                    $eventCategory->setName('ga:eventCategory');

                    // Event Action
                    $eventAction = new Google_Service_AnalyticsReporting_Dimension();
                    $eventAction->setName('ga:eventAction');

                    // Event Label
                    $eventLabel = new Google_Service_AnalyticsReporting_Dimension();
                    $eventLabel->setName('ga:eventLabel');

                    //ORDERS
                    ////////////////////////////////////////////////////////////////////////////////////////

                    // Order by user desc
                    $order_by_users_desc = new Google_Service_AnalyticsReporting_OrderBy();
                    $order_by_users_desc->setFieldName('ga:users');
                    $order_by_users_desc->setOrderType('VALUE');
                    $order_by_users_desc->setSortOrder('DESCENDING');

                    // Order by page views desc
                    $order_by_pageviews_desc = new Google_Service_AnalyticsReporting_OrderBy();
                    $order_by_pageviews_desc->setFieldName('ga:pageviews');
                    $order_by_pageviews_desc->setOrderType('VALUE');
                    $order_by_pageviews_desc->setSortOrder('DESCENDING');

                    // Order by total events desc
                    $order_by_events_desc = new Google_Service_AnalyticsReporting_OrderBy();
                    $order_by_events_desc->setFieldName('ga:totalEvents');
                    $order_by_events_desc->setOrderType('VALUE');
                    $order_by_events_desc->setSortOrder('DESCENDING');

                    //REPORTS
                    ////////////////////////////////////////////////////////////////////////////////////////

                    // Sessions, Users, Page Views, Page Views Per Session, Average Session Duration, Bounce Rate, New Sessions, Total Events and Unique Events by Date
                    $request_by_date = new Google_Service_AnalyticsReporting_ReportRequest();
                    $request_by_date->setViewId(seopress_google_analytics_auth_option());
                    $request_by_date->setDateRanges($dateRange);
                    $request_by_date->setDimensions([$date]);
                    $request_by_date->setMetrics([$sessions, $users, $pageviews, $pageviewsPerSession, $avgSessionDuration, $bounceRate, $percentNewSessions, $totalEvents, $uniqueEvents]);
                    $request_by_date->setSamplingLevel('SMALL');

                    // Users by language
                    $request_users_by_language = new Google_Service_AnalyticsReporting_ReportRequest();
                    $request_users_by_language->setViewId(seopress_google_analytics_auth_option());
                    $request_users_by_language->setDateRanges($dateRange);
                    $request_users_by_language->setDimensions([$language]);
                    $request_users_by_language->setMetrics([$users]);
                    $request_users_by_language->setSamplingLevel('SMALL');
                    $request_users_by_language->setOrderBys($order_by_users_desc);

                    // Users by country
                    $request_users_by_country = new Google_Service_AnalyticsReporting_ReportRequest();
                    $request_users_by_country->setViewId(seopress_google_analytics_auth_option());
                    $request_users_by_country->setDateRanges($dateRange);
                    $request_users_by_country->setDimensions([$country]);
                    $request_users_by_country->setMetrics([$users]);
                    $request_users_by_country->setSamplingLevel('SMALL');
                    $request_users_by_country->setOrderBys($order_by_users_desc);

                    // Users by device category
                    $request_users_by_device_cat = new Google_Service_AnalyticsReporting_ReportRequest();
                    $request_users_by_device_cat->setViewId(seopress_google_analytics_auth_option());
                    $request_users_by_device_cat->setDateRanges($dateRange);
                    $request_users_by_device_cat->setDimensions([$deviceCategory]);
                    $request_users_by_device_cat->setMetrics([$users]);
                    $request_users_by_device_cat->setSamplingLevel('SMALL');
                    $request_users_by_device_cat->setOrderBys($order_by_users_desc);

                    // Users by Browser
                    $request_users_by_browser = new Google_Service_AnalyticsReporting_ReportRequest();
                    $request_users_by_browser->setViewId(seopress_google_analytics_auth_option());
                    $request_users_by_browser->setDateRanges($dateRange);
                    $request_users_by_browser->setDimensions([$browser]);
                    $request_users_by_browser->setMetrics([$users]);
                    $request_users_by_browser->setSamplingLevel('SMALL');
                    $request_users_by_browser->setOrderBys($order_by_users_desc);

                    // Users by Social Networks
                    $request_users_by_social_network = new Google_Service_AnalyticsReporting_ReportRequest();
                    $request_users_by_social_network->setViewId(seopress_google_analytics_auth_option());
                    $request_users_by_social_network->setDateRanges($dateRange);
                    $request_users_by_social_network->setDimensions([$socialNetwork]);
                    $request_users_by_social_network->setMetrics([$users]);
                    $request_users_by_social_network->setSamplingLevel('SMALL');
                    $request_users_by_social_network->setOrderBys($order_by_users_desc);

                    // Users by Channel
                    $request_users_by_channel = new Google_Service_AnalyticsReporting_ReportRequest();
                    $request_users_by_channel->setViewId(seopress_google_analytics_auth_option());
                    $request_users_by_channel->setDateRanges($dateRange);
                    $request_users_by_channel->setDimensions([$channelGrouping]);
                    $request_users_by_channel->setMetrics([$users]);
                    $request_users_by_channel->setSamplingLevel('SMALL');

                    // Users by Source
                    $request_users_by_source = new Google_Service_AnalyticsReporting_ReportRequest();
                    $request_users_by_source->setViewId(seopress_google_analytics_auth_option());
                    $request_users_by_source->setDateRanges($dateRange);
                    $request_users_by_source->setDimensions([$source]);
                    $request_users_by_source->setMetrics([$users]);
                    $request_users_by_source->setSamplingLevel('SMALL');
                    $request_users_by_source->setOrderBys($order_by_users_desc);

                    // Users by Referrer
                    $request_users_by_ref = new Google_Service_AnalyticsReporting_ReportRequest();
                    $request_users_by_ref->setViewId(seopress_google_analytics_auth_option());
                    $request_users_by_ref->setDateRanges($dateRange);
                    $request_users_by_ref->setDimensions([$fullReferrer]);
                    $request_users_by_ref->setMetrics([$users]);
                    $request_users_by_ref->setSamplingLevel('SMALL');
                    $request_users_by_ref->setOrderBys($order_by_users_desc);

                    // Page Views by Page Title
                    $request_page_views_page_title = new Google_Service_AnalyticsReporting_ReportRequest();
                    $request_page_views_page_title->setViewId(seopress_google_analytics_auth_option());
                    $request_page_views_page_title->setDateRanges($dateRange);
                    $request_page_views_page_title->setDimensions([$pageTitle]);
                    $request_page_views_page_title->setMetrics([$pageviews]);
                    $request_page_views_page_title->setSamplingLevel('SMALL');
                    $request_page_views_page_title->setOrderBys($order_by_pageviews_desc);

                    // Event Cat
                    $request_events_by_cat = new Google_Service_AnalyticsReporting_ReportRequest();
                    $request_events_by_cat->setViewId(seopress_google_analytics_auth_option());
                    $request_events_by_cat->setDateRanges($dateRange);
                    $request_events_by_cat->setDimensions([$eventCategory]);
                    $request_events_by_cat->setMetrics([$totalEvents]);
                    $request_events_by_cat->setSamplingLevel('SMALL');
                    $request_events_by_cat->setOrderBys($order_by_events_desc);

                    // Event Action
                    $request_events_by_action = new Google_Service_AnalyticsReporting_ReportRequest();
                    $request_events_by_action->setViewId(seopress_google_analytics_auth_option());
                    $request_events_by_action->setDateRanges($dateRange);
                    $request_events_by_action->setDimensions([$eventAction]);
                    $request_events_by_action->setMetrics([$totalEvents]);
                    $request_events_by_action->setSamplingLevel('SMALL');
                    $request_events_by_action->setOrderBys($order_by_events_desc);

                    // Event Label
                    $request_events_by_label = new Google_Service_AnalyticsReporting_ReportRequest();
                    $request_events_by_label->setViewId(seopress_google_analytics_auth_option());
                    $request_events_by_label->setDateRanges($dateRange);
                    $request_events_by_label->setDimensions([$eventLabel]);
                    $request_events_by_label->setMetrics([$totalEvents]);
                    $request_events_by_label->setSamplingLevel('SMALL');
                    $request_events_by_label->setOrderBys($order_by_events_desc);

                    //BATCH REPORT
                    ////////////////////////////////////////////////////////////////////////////////////////

                    function seopress_analytics_get_reports($reports) {
                        $return = [];

                        for ($reportIndex = 0; $reportIndex < count($reports); ++$reportIndex) {
                            $report = $reports[$reportIndex];
                            $header = $report->getColumnHeader();
                            $dimensionHeaders = $header->getDimensions();
                            $metricHeaders = $header->getMetricHeader()->getMetricHeaderEntries();
                            $rows = $report->getData()->getRows();

                            for ($rowIndex = 0; $rowIndex < count($rows); ++$rowIndex) {
                                $row = $rows[$rowIndex];
                                $dimensions = $row->getDimensions();
                                $metrics = $row->getMetrics();
                                for ($i = 0; $i < count($dimensionHeaders) && $i < count($dimensions); ++$i) {
                                    $return[$dimensionHeaders[$i]][] = $dimensions[$i];
                                }

                                for ($j = 0; $j < count($metrics); ++$j) {
                                    $values = $metrics[$j]->getValues();
                                    for ($k = 0; $k < count($values); ++$k) {
                                        $entry = $metricHeaders[$k];
                                        $return[$entry->getName()][] = $values[$k];
                                    }
                                }
                            }
                        }

                        return $return;
                    }

                    $all = [];

                    $requests = [
                        $request_by_date,
                        $request_users_by_country,
                        $request_users_by_device_cat,
                        $request_users_by_browser,
                        $request_users_by_social_network,
                        $request_users_by_channel,
                        $request_users_by_source,
                        $request_users_by_ref,
                        $request_page_views_page_title,
                        $request_events_by_cat,
                        $request_events_by_action,
                        $request_events_by_label,
                        $request_users_by_language,
                    ];

                    foreach ($requests as $key => $request) {
                        $body = new Google_Service_AnalyticsReporting_GetReportsRequest();
                        $body->setReportRequests([$request]);
                        $body = $service->reports->batchGet($body);

                        $all[$key] = seopress_analytics_get_reports($body);
                    }

                    ////////////////////////////////////////////////////////////////////////////////////////
                    //Saving datas
                    ////////////////////////////////////////////////////////////////////////////////////////
                    $seopress_results_google_analytics_cache['sessions'] = isset($all[0]['sessions']) && $all[0]['sessions'] !== null ? array_sum($all[0]['sessions']) : 0;
                    $seopress_results_google_analytics_cache['users'] = isset($all[0]['users']) && $all[0]['users'] !== null ? array_sum($all[0]['users']) : 0;
                    $seopress_results_google_analytics_cache['pageviews'] = isset($all[0]['pageviews']) && $all[0]['pageviews'] !== null ? array_sum($all[0]['pageviews']) : 0;

                    $seopress_results_google_analytics_cache['pageviewsPerSession'] = 0;
                    if (isset($all[0]['pageviewsPerSession']) && $all[0]['pageviewsPerSession'] !== null) {
                        $divided = isset($all[0]['pageviewsPerSession']) && $all[0]['pageviewsPerSession'] !== null ? count($all[0]['pageviewsPerSession']) : 1;
                        if ($divided === 0) {
                            $divided = 1;
                        }

                        $seopress_results_google_analytics_cache['pageviewsPerSession'] = round(array_sum($all[0]['pageviewsPerSession']) / $divided, 2);
                    }


                    $seopress_results_google_analytics_cache['avgSessionDuration'] = 0;
                    if (isset($all[0]['avgSessionDuration']) && $all[0]['avgSessionDuration'] !== null) {
                        $divided = isset($all[0]['avgSessionDuration']) && $all[0]['avgSessionDuration'] !== null ? count($all[0]['avgSessionDuration']) : 1;
                        if ($divided === 0) {
                            $divided = 1;
                        }
                        $avg = array_sum($all[0]['avgSessionDuration']);
                        $seopress_results_google_analytics_cache['avgSessionDuration'] = gmdate('i:s', round($avg / $divided));
                    }

                    $seopress_results_google_analytics_cache['bounceRate'] = 0;
                    if (isset($all[0]['bounceRate']) && $all[0]['bounceRate'] !== null) {
                        $divided = isset($all[0]['bounceRate']) && $all[0]['bounceRate'] !== null ? count($all[0]['bounceRate']) : 1;
                        if ($divided === 0) {
                            $divided = 1;
                        }
                        $seopress_results_google_analytics_cache['bounceRate'] = round(array_sum($all[0]['bounceRate']) / $divided, 2);
                    }

                    $seopress_results_google_analytics_cache['percentNewSessions'] = 0;
                    if (isset($all[0]['percentNewSessions']) && $all[0]['percentNewSessions'] !== null) {
                        $divided = isset($all[0]['percentNewSessions']) && $all[0]['percentNewSessions'] !== null ? count($all[0]['percentNewSessions']) : 1;
                        if ($divided === 0) {
                            $divided = 1;
                        }
                        $seopress_results_google_analytics_cache['percentNewSessions'] = round(array_sum($all[0]['percentNewSessions']) / $divided, 2);
                    }

                    $seopress_results_google_analytics_cache['language'] = $all[12];
                    $seopress_results_google_analytics_cache['country'] = $all[1];
                    $seopress_results_google_analytics_cache['deviceCategory'] = $all[2];
                    $seopress_results_google_analytics_cache['browser'] = $all[3];
                    $seopress_results_google_analytics_cache['socialNetwork'] = $all[4];
                    $seopress_results_google_analytics_cache['channelGrouping'] = $all[5];
                    $seopress_results_google_analytics_cache['source'] = $all[6];
                    $seopress_results_google_analytics_cache['fullReferrer'] = $all[7];
                    $seopress_results_google_analytics_cache['contentpageviews'] = $all[8];
                    $seopress_results_google_analytics_cache['totalEvents'] = $all[0]['totalEvents'] ? $all[0]['totalEvents'] : '';
                    $seopress_results_google_analytics_cache['uniqueEvents'] = $all[0]['uniqueEvents'] ? $all[0]['uniqueEvents'] : '';
                    $seopress_results_google_analytics_cache['eventCategory'] = $all[9];
                    $seopress_results_google_analytics_cache['eventAction'] = $all[10];
                    $seopress_results_google_analytics_cache['eventLabel'] = $all[11];

                    switch ($seopress_ga_dashboard_widget_options_type) {
                        case 'ga_sessions':
                            $ga_sessions_rows = $all[0]['sessions'];
                            $seopress_ga_dashboard_widget_options_title = __('Sessions', 'wp-seopress-pro');
                            break;
                        case 'ga_users':
                            $ga_sessions_rows = $all[0]['users'];
                            $seopress_ga_dashboard_widget_options_title = __('Users', 'wp-seopress-pro');
                            break;
                        case 'ga_pageviews':
                            $ga_sessions_rows = $all[0]['pageviews'];
                            $seopress_ga_dashboard_widget_options_title = __('Page Views', 'wp-seopress-pro');
                            break;
                        case 'ga_pageviewsPerSession':
                            $ga_sessions_rows = $all[0]['pageviewsPerSession'];
                            $seopress_ga_dashboard_widget_options_title = __('Page Views Per Session', 'wp-seopress-pro');
                            break;
                        case 'ga_avgSessionDuration':
                            $ga_sessions_rows = $all[0]['avgSessionDuration'];
                            $seopress_ga_dashboard_widget_options_title = __('Average Session Duration', 'wp-seopress-pro');
                            break;
                        case 'ga_bounceRate':
                            $ga_sessions_rows = $all[0]['bounceRate'];
                            $seopress_ga_dashboard_widget_options_title = __('Bounce Rate', 'wp-seopress-pro');
                            break;
                        case 'ga_percentNewSessions':
                            $ga_sessions_rows = $all[0]['percentNewSessions'];
                            $seopress_ga_dashboard_widget_options_title = __('New Sessions', 'wp-seopress-pro');
                            break;
                        default:
                            $ga_sessions_rows = $all[0]['sessions'];
                            $seopress_ga_dashboard_widget_options_title = __('Sessions', 'wp-seopress-pro');
                    }

                    function seopress_ga_dashboard_get_sessions_labels($ga_date) {
                        $labels = [];
                        if ( ! empty($ga_date) && is_array($ga_date)) {
                            foreach ($ga_date as $key => $value) {
                                array_push($labels, date_i18n(get_option('date_format'), strtotime($value)));
                            }
                        }

                        return $labels;
                    }

                    function seopress_ga_dashboard_get_sessions_data($ga_sessions_rows) {
                        $data = [];
                        if ( ! empty($ga_sessions_rows) && is_array($ga_sessions_rows)) {
                            foreach ($ga_sessions_rows as $key => $value) {
                                array_push($data, $value);
                            }
                        }

                        return $data;
                    }
                    $ga_date = $all[0]['ga:date'];
                    $seopress_results_google_analytics_cache['sessions_graph_labels'] = seopress_ga_dashboard_get_sessions_labels($ga_date);
                    $seopress_results_google_analytics_cache['sessions_graph_data'] = seopress_ga_dashboard_get_sessions_data($ga_sessions_rows);
                    $seopress_results_google_analytics_cache['sessions_graph_title'] = $seopress_ga_dashboard_widget_options_title;
                }

                //Transient
                set_transient('seopress_results_google_analytics', $seopress_results_google_analytics_cache, 2 * HOUR_IN_SECONDS);
            }

            //Return
            $seopress_results_google_analytics_transient = get_transient('seopress_results_google_analytics');

            wp_send_json_success($seopress_results_google_analytics_transient);

        } catch (\Exception $e) {
            $error = $e->getMessage();
            wp_send_json(json_decode($error));
        }
    }

    exit();
}
/**
 * Request GA stats by CRON.
 *
 * @since 4.2
 *
 * @author Benjamin
 */
function seopress_request_google_analytics_cron() {
    if (function_exists('seopress_get_toggle_option') && '1' === seopress_get_toggle_option('google-analytics')) {
        seopress_request_google_analytics_fn(true);
    }
}
add_action('seopress_google_analytics_cron', 'seopress_request_google_analytics_cron');

function seopress_request_google_analytics() {
    check_ajax_referer('seopress_request_google_analytics_nonce');
    if ((current_user_can(seopress_capability('manage_options', 'cron')) || seopress_advanced_security_ga_widget_check() === true) && is_admin()) {
        if (function_exists('seopress_get_toggle_option') && '1' === seopress_get_toggle_option('google-analytics')) {
            seopress_request_google_analytics_fn(false);
        }
    }
}
add_action('wp_ajax_seopress_request_google_analytics', 'seopress_request_google_analytics');

///////////////////////////////////////////////////////////////////////////////////////////////////
//Request Matomo Analytics
///////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Request Matomo stats.
 *
 * @since 6.0
 *
 * @author Benjamin
 */
function seopress_request_matomo_analytics_fn($clear = false) {
    if (function_exists('seopress_google_analytics_matomo_dashboard_widget_option') && seopress_google_analytics_matomo_dashboard_widget_option() === '1') {
        exit();
    }

    //Clear cache if CRON
    if (true === $clear) {
        delete_transient('seopress_results_matomo');
    }

    if (false === ($seopress_results_matomo_cache = get_transient('seopress_results_matomo'))) {
        $seopress_results_matomo_cache = [];

        $matomoID = seopress_get_service('GoogleAnalyticsOption')->getMatomoId() ? seopress_get_service('GoogleAnalyticsOption')->getMatomoId() : null;

        if (empty($matomoID)) {
            exit();
        }

        $siteID = seopress_get_service('GoogleAnalyticsOption')->getMatomoSiteId() ? seopress_get_service('GoogleAnalyticsOption')->getMatomoSiteId() : null;

        if (empty($siteID)) {
            exit();
        }

        $authToken = seopress_get_service('GoogleAnalyticsOption')->getMatomoAuthToken() ? seopress_get_service('GoogleAnalyticsOption')->getMatomoAuthToken() : null;

        if (empty($authToken)) {
            exit();
        }

        // get saved data
        if ( ! $widget_options = get_option('seopress_matomo_dashboard_widget_options')) {
            $widget_options = [];
        }

        // check if saved data contains content
        $seopress_matomo_dashboard_widget_options_period = isset($widget_options['period']) ? $widget_options['period'] : false;

        $seopress_matomo_dashboard_widget_options_type = isset($widget_options['type']) ? $widget_options['type'] : 'nb_visits';

        // custom content saved by control callback, modify output
        if ($seopress_matomo_dashboard_widget_options_period) {
            $period = $seopress_matomo_dashboard_widget_options_period;
        } else {
            $period = 'last30';
        }

        $url = 'https://' . $matomoID . '?module=API&method=API.getProcessedReport&idSite=' . $siteID . '&date=' . $period . '&period=day&apiModule=VisitsSummary&apiAction=get&format=json&token_auth=' . $authToken . '&filter_truncate=5&language=en';

        $args = [
            'blocking'    => true,
            'timeout'     => 10,
            'sslverify'   => false,
        ];

        $response = wp_remote_get($url, $args);

        //Check for error
        if (!is_wp_error($response)) {
            $response = wp_remote_retrieve_body($response);
            $response = json_decode($response, true);
        }

        switch ($seopress_matomo_dashboard_widget_options_type) {
            case 'nb_uniq_visitors':
                $widget_title = __('Unique visitors', 'wp-seopress-pro');
                break;
            case 'nb_visits':
                $widget_title = __('Visits', 'wp-seopress-pro');
                break;
            case 'max_actions':
                $widget_title = __('Maximum actions in one visit', 'wp-seopress-pro');
                break;
            case 'nb_actions_per_visit':
                $widget_title = __('Average actions per visit', 'wp-seopress-pro');
                break;
            case 'bounce_rate':
                $widget_title = __('Bounce Rate', 'wp-seopress-pro');
                break;
            case 'avg_time_on_site':
                $widget_title = __('Avg. Visit Duration (in seconds)', 'wp-seopress-pro');
                break;
            default:
                $widget_title = __('Unique visitors', 'wp-seopress-pro');
        }

        function seopress_matomo_get_sessions_labels($rows) {
            $labels = [];

            if (is_array($rows) && isset($rows['reportMetadata'])) {
                $rows = $rows['reportMetadata'];
                foreach ($rows as $key => $value) {
                    $labels[] = date_i18n(get_option('date_format'), strtotime($key));
                }
            }
            return $labels;
        }

        function seopress_matomo_get_sessions_data($rows, $seopress_matomo_dashboard_widget_options_type) {
            $data = [];
            if (is_array($rows) && isset($rows['reportMetadata'])) {
                $rows = array_values($rows['reportData']);
                foreach ($rows as $key => $value) {
                    //Bounce rate: remove %
                    if ($seopress_matomo_dashboard_widget_options_type === 'bounce_rate') {
                        $value[$seopress_matomo_dashboard_widget_options_type] = rtrim($value[$seopress_matomo_dashboard_widget_options_type], '%');
                    }

                    //Average time: convert to seconds
                    if ($seopress_matomo_dashboard_widget_options_type === 'avg_time_on_site') {
                        $value[$seopress_matomo_dashboard_widget_options_type] = strtotime("1970-01-01 $value[$seopress_matomo_dashboard_widget_options_type] UTC");
                    }

                    if (isset($seopress_matomo_dashboard_widget_options_type)) {
                        $data[] = $value[$seopress_matomo_dashboard_widget_options_type];
                    }
                }
            }
            return $data;
        }

        function seopress_timestamp_to_seconds($n) {
            return strtotime("1970-01-01 $n UTC");
        }

        function seopress_remove_pourcentage($n) {
            return rtrim($n, '%');
        }

        function seopress_matomo_get_all_data($rows) {
            $data = [];
            $rows = $rows['reportData'];

            //Unique Visitors
            $data['nb_uniq_visitors'] = array_sum(array_column($rows, 'nb_uniq_visitors'));

            //Visits
            $data['nb_visits'] = array_sum(array_column($rows, 'nb_visits'));

            //Max actions
            $data['max_actions'] = max(array_column($rows, 'max_actions'));

            //Actions per visit
            $data['nb_actions_per_visit'] = array_column($rows, 'nb_actions_per_visit');
            $count = count($data['nb_actions_per_visit']);
            if ($count > 1) {
                $data['nb_actions_per_visit'] = round(array_sum($data['nb_actions_per_visit']) / $count, 2);
            } else {
                $data['nb_actions_per_visit'] = $data['nb_actions_per_visit'][0];
            }

            //Bounce rate
            $data['bounce_rate'] = array_map('seopress_remove_pourcentage', array_column($rows, 'bounce_rate'));
            $count = count($data['bounce_rate']);
            if ($count > 1) {
                $data['bounce_rate'] = round(array_sum($data['bounce_rate']) / $count, 2);
            } else {
                $data['bounce_rate'] = $data['bounce_rate'][0];
            }

            //Avg. Visit Duration
            $data['avg_time_on_site'] = array_map('seopress_timestamp_to_seconds', array_column($rows, 'avg_time_on_site'));
            $count = count($data['avg_time_on_site']);
            if ($count > 1) {
                $data['avg_time_on_site'] = round(array_sum($data['avg_time_on_site']) / $count, 2);
            } else {
                $data['avg_time_on_site'] = $data['avg_time_on_site'][0];
            }

            return $data;
        }

        $response['sessions_graph_labels'] = seopress_matomo_get_sessions_labels($response);
        $response['sessions_graph_data'] = seopress_matomo_get_sessions_data($response, $seopress_matomo_dashboard_widget_options_type);
        $response['sessions_graph_title'] = $widget_title;
        $response['all'] = seopress_matomo_get_all_data($response);

        //Transient
        set_transient('seopress_results_matomo', $response, 2 * HOUR_IN_SECONDS);
    }
    //Return
    $seopress_results_matomo_transient = get_transient('seopress_results_matomo');

    wp_send_json_success($seopress_results_matomo_transient);
    exit();
}
/**
 * Request Matomo Analytics by CRON.
 *
 * @since 6.0
 * @param boolean Is is a CRON request?
 *
 * @author Benjamin
 */
function seopress_request_matomo_analytics_cron() {
    if (function_exists('seopress_get_toggle_option') && '1' === seopress_get_toggle_option('google-analytics')) {
        seopress_request_matomo_analytics_fn(true);
    }
}
add_action('seopress_matomo_analytics_cron', 'seopress_request_matomo_analytics_cron');

function seopress_request_matomo_analytics() {
    check_ajax_referer('seopress_request_matomo_analytics_nonce');

    if ((current_user_can(seopress_capability('manage_options', 'cron')) || seopress_advanced_security_matomo_widget_check() === true) && is_admin()) {
        if (function_exists('seopress_get_toggle_option') && '1' === seopress_get_toggle_option('google-analytics')) {
            seopress_request_matomo_analytics_fn();
        }
    }
}
add_action('wp_ajax_seopress_request_matomo_analytics', 'seopress_request_matomo_analytics');

///////////////////////////////////////////////////////////////////////////////////////////////////
//Send 404 weekly email notifications
///////////////////////////////////////////////////////////////////////////////////////////////////
function seopress_404_send_alert() {
    function seopress_404_send_alert_content_type() {
        return 'text/html';
    }
    add_filter('wp_mail_content_type', 'seopress_404_send_alert_content_type');

    $to = seopress_pro_get_service('OptionPro')->get404RedirectEnableMailsFrom();
    $subject = sprintf(__('404 alert - %s', 'wp-seopress-pro'), get_bloginfo('name'));
    $content = '';

    // Get the Latest 404 errors
    $args = [
        'date_query' => [
            [
                'column' => 'post_date_gmt',
                'before' => '1 week ago',
            ],
        ],
        'posts_per_page' => 10,
        'post_type' => 'seopress_404',
        'meta_key' => '_seopress_redirections_type',
        'meta_compare' => 'NOT EXISTS',
    ];

    $args = apply_filters('seopress_404_email_alerts_latest_query', $args);

    $latest_404_query = new WP_Query($args);

    if ($latest_404_query->have_posts()) {
        $errors['latest'] = [];
        while ($latest_404_query->have_posts()) {
            $latest_404_query->the_post();

            $errors['latest'][] = ['url' => get_the_title(), 'count' => get_post_meta( get_the_ID(), 'seopress_404_count', true )];
        }
        wp_reset_postdata();
    }

    if (!empty($errors['latest'])) {
        $content .= '<h2>' . __('Latest 404 errors since 1 week', 'wp-seopress-pro') . '</h2>';
        $content .= '<ul>';
        foreach($errors['latest'] as $error) {
            $hits = !empty($error['count']) ? ' - ' . $error['count'] . __(' Hits','wp-seopress-pro') : '';
            $content .= '<li>' . get_home_url() . '/' . $error['url'] . $hits . '</li>';
        }
        $content .= '</ul>';
    }

    // Get the top 404 errors
    $args = [
        'posts_per_page' => 10,
        'post_type' => 'seopress_404',
        'meta_key' => 'seopress_404_count',
        'meta_query' => [
            'relation' => 'AND',
            [
                'key' => 'seopress_404_count',
                'compare' => 'EXISTS',
                'type' => 'NUMERIC'
            ],
            [
                'key' => '_seopress_redirections_type',
                'compare' => 'NOT EXISTS',
            ],
        ],
        'order' => 'DESC',
        'orderby' => 'meta_value_num',
    ];

    $args = apply_filters('seopress_404_email_alerts_top_query', $args);

    $top_404_query = new WP_Query($args);

    if ($top_404_query->have_posts()) {
        $errors['top'] = [];
        while ($top_404_query->have_posts()) {
            $top_404_query->the_post();

            $errors['top'][] = ['url' => get_the_title(), 'count' => get_post_meta( get_the_ID(), 'seopress_404_count', true )];

        }
        wp_reset_postdata();
    }

    if (!empty($errors['top'])) {
        $content .= '<h2>' . __('Top 404 errors', 'wp-seopress-pro') . '</h2>';
        $content .= '<ul>';
        foreach($errors['top'] as $error) {
            $hits = !empty($error['count']) ? ' - ' . $error['count'] . __(' Hits','wp-seopress-pro') : '';
            $content .= '<li>' . get_home_url() . '/' . $error['url'] . $hits . '</li>';
        }
        $content .= '</ul>';
    }

    $body = "<style>
        #wrapper {
            background-color: #F9F9F9;
            margin: 0;
            padding: 70px 0 70px 0;
            -webkit-text-size-adjust: none !important;
            width: 100%;
        }

        #template_container {
            box-shadow:0 0 0 1px #f3f3f3 !important;
            background-color: #ffffff;
            border: 1px solid #e9e9e9;
            padding: 0;
        }

        #template_header {
            color: #333;
            font-family: 'Helvetica Neue', Helvetica, Roboto, Arial, sans-serif;
        }

        #template_header h1,
        #template_header h1 a {
            color: #232323;
        }

        #template_footer td {
            padding: 0;
        }

        #template_footer #credit a {
            font-size: 13px;
            line-height: 125%;
            text-align: center;
            padding: 12px 28px 28px 28px;
            display: block;
            font-family: 'Helvetica Neue', Helvetica, Roboto, Arial, sans-serif;
        }

        #body_content {
            background-color: #ffffff;
        }

        #body_content table td {
            padding: 30px;
        }

        #body_content table td td {
            padding: 12px;
        }

        #body_content table td th {
            padding: 12px;
        }

        #body_content p {
            margin: 0 0 16px;
        }

        .button {
            font-size: 13px;
            font-weight: bold;
            background: #007cba;
            color: #fff;
            text-decoration: none;
            display: inline-block;
            margin: 0;
            border: 0;
            cursor: pointer;
            -webkit-appearance: none;
            height: 36px;
            padding: 6px 24px;
            border-radius: 2px;
            vertical-align: middle;
            white-space: nowrap;
            line-height: 36px;
            outline: 1px solid transparent;
            font-family: 'Helvetica Neue', Helvetica, Roboto, Arial, sans-serif;
        }

        #body_content_inner {
            color: #505050;
            font-family: 'Helvetica Neue', Helvetica, Roboto, Arial, sans-serif;
            font-size: 14px;
            line-height: 150%;
        }

        .td {
            color: #505050;
            border: 1px solid #E5E5E5;
        }

        .text {
            color: #505050;
            font-family: 'Helvetica Neue', Helvetica, Roboto, Arial, sans-serif;
        }

        .link {
            color: #232323;
        }

        #header_wrapper {
            padding: 24px 48px 24px 48px;
            display: block;
            border-bottom: 1px solid #F1F1F1;
            text-align: center;
        }

        h1 {
            color: #232323;
            font-family: 'Helvetica Neue', Helvetica, Roboto, Arial, sans-serif;
            font-size: 18px;
            margin: 0;
            -webkit-font-smoothing: antialiased;
        }

        h2 {
            color: #232323;
            display: block;
            font-family: 'Helvetica Neue', Helvetica, Roboto, Arial, sans-serif;
            font-size: 18px;
            font-weight: bold;
            line-height: 130%;
            margin: 16px 0 8px;
        }

        h3 {
            color: #232323;
            display: block;
            font-family: 'Helvetica Neue', Helvetica, Roboto, Arial, sans-serif;
            font-size: 16px;
            font-weight: bold;
            line-height: 130%;
            margin: 16px 0 8px;
        }

        a {
            color: #232323;
            font-weight: normal;
            text-decoration: underline;
        }

        img {
            border: none;
            display: inline;
            font-size: 14px;
            font-weight: bold;
            height: auto;
            line-height: 100%;
            outline: none;
            text-decoration: none;
            text-transform: capitalize;
        }
    </style>";
    $body .= '<body leftmargin="0" marginwidth="0" topmargin="0" marginheight="0" offset="0">
        <div id="wrapper">
            <table border="0" cellpadding="0" cellspacing="0" height="100%" width="100%">
                <tr>
                    <td align="center" valign="top">
                        <table border="0" cellpadding="0" cellspacing="0" width="600" id="template_container">
                            <tr>
                                <td align="center" valign="top">
                                    <!-- Header -->
                                    <table border="0" cellpadding="0" cellspacing="0" width="600" id="template_header">
                                        <tr>
                                            <td id="header_wrapper">
                                                <h1>' . __('404 Error Reporting', 'wp-seopress-pro') . '</h1>
                                            </td>
                                        </tr>
                                    </table>
                                    <!-- End Header -->
                                </td>
                            </tr>
                            <tr>
                                <td align="center" valign="top">
                                    <!-- Body -->
                                    <table border="0" cellpadding="0" cellspacing="0" width="600" id="template_body">
                                        <tr>
                                            <td valign="top" id="body_content">
                                                <!-- Content -->
                                                <table border="0" cellpadding="20" cellspacing="0" width="100%">
                                                    <tr>
                                                        <td valign="top">
                                                            <div id="body_content_inner">
                                                                <p>' . __('You are receiving this email because 404 error notifications are enabled on your WordPress site.', 'wp-seopress-pro') . '</p>
                                                                ' . $content . '
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td valign="top" align="center">
                                                            <div id="body_content_inner">
                                                                <a class="button" href="' . get_home_url() . '/wp-admin/edit.php?post_type=seopress_404&action=-1&m=0&redirect-cat=0&redirection-type=404&redirection-enabled&filter_action=Filter&paged=1&action2=-1&post_status=404">' . __('View all 404 errors', 'wp-seopress-pro') . '</a>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                </table>
                                                <!-- End Content -->
                                            </td>
                                        </tr>
                                    </table>
                                    <!-- End Body -->
                                </td>
                            </tr>
                            <tr>
                                <td align="center" valign="top">
                                    <!-- Footer -->
                                    <table border="0" cellpadding="10" cellspacing="0" width="600" id="template_footer">
                                        <tr>
                                            <td valign="top">
                                                <table border="0" cellpadding="10" cellspacing="0" width="100%">
                                                    <tr>
                                                        <td colspan="2" id="credit" style="border:0;color: #878787; border-top: 1px solid #F1F1F1;" valign="middle">
                                                            <p><a href="' . get_home_url() . '">' . get_bloginfo('name') . '</a></p>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                    <!-- End Footer -->
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </div>
    </body>';

    if (!empty($content)) {
        wp_mail($to, $subject, $body);
    }

    remove_filter('wp_mail_content_type', 'seopress_404_send_alert_content_type');
}

/**
 * Send 404 email alerts by CRON.
 *
 * @since 6.3
 *
 * @author Benjamin
 */
function seopress_404_send_alert_cron() {
    if ((function_exists('seopress_get_toggle_option') && '1' === seopress_get_toggle_option('404')) && '1' === seopress_pro_get_service('OptionPro')->get404RedirectEnableMails() && '' !== seopress_pro_get_service('OptionPro')->get404RedirectEnableMailsFrom()) {
        seopress_404_send_alert();
    }
}
add_action('seopress_404_email_alerts_cron', 'seopress_404_send_alert_cron');

///////////////////////////////////////////////////////////////////////////////////////////////////
// 404 Cleaning CRON
///////////////////////////////////////////////////////////////////////////////////////////////////
function seopress_404_cron_cleaning_action($force = false) {
    if ('1' === seopress_pro_get_service('OptionPro')->get404Cleaning() || true === $force) {
        $args = [
            'date_query' => [
                [
                    'column' => 'post_date_gmt',
                    'before' => '1 month ago',
                ],
            ],
            'posts_per_page' => -1,
            'post_type' => 'seopress_404',
            'meta_key' => '_seopress_redirections_type',
            'meta_compare' => 'NOT EXISTS',
        ];

        $args = apply_filters('seopress_404_cleaning_query', $args);

        // The Query
        $old_404_query = new WP_Query($args);

        // The Loop
        if ($old_404_query->have_posts()) {
            while ($old_404_query->have_posts()) {
                $old_404_query->the_post();
                wp_delete_post(get_the_ID(), true);
            }
            /* Restore original Post Data */
            wp_reset_postdata();
        }
    }
}
add_action('seopress_404_cron_cleaning', 'seopress_404_cron_cleaning_action', 10, 1);

///////////////////////////////////////////////////////////////////////////////////////////////////
//Daily Get Insights from Google Search Console
///////////////////////////////////////////////////////////////////////////////////////////////////
function seopress_get_insights_gsc_cron() {
    //Check if GSC toggle is ON
    if (seopress_get_service('ToggleOption')->getToggleInspectUrl() !=='1') {
        return;
    }

    //Get Google API Key
    $options = get_option('seopress_instant_indexing_option_name');
    $google_api_key = isset($options['seopress_instant_indexing_google_api_key']) ? $options['seopress_instant_indexing_google_api_key'] : '';

    if (empty($google_api_key)) {
        return;
    }

    try {
        $service = seopress_pro_get_service('SearchConsole');

        $response = $service->handle();
        if($response['status'] === 'error'){
            return;
        }

        foreach($response['data'] as $row){
            $result = $service->saveDataFromRowResult($row);
        }

    } catch (\Exception $e) {
        // No need to do anything here
    }
}
add_action('seopress_insights_gsc_cron', 'seopress_get_insights_gsc_cron');
