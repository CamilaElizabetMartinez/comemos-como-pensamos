<?php
// To prevent calling the plugin directly
if (! function_exists('add_action')) {
    echo 'Please don&rsquo;t call the plugin directly. Thanks :)';
    exit;
}

add_action('seopress_notifications_center_item', 'seopress_pro_notifications');
function seopress_pro_notifications() {
    if ('1' === seopress_pro_get_service('OptionPro')->get404Cleaning() && ! wp_next_scheduled('seopress_404_cron_cleaning')) {
        $args = [
            'id'         => 'notice-title-tag',
            'title'      => __('You have enabled 404 cleaning BUT the scheduled task is not running.', 'wp-seopress-pro'),
            'desc'       => __('To solve this, please disable and re-enable SEOPress PRO. No data will be lost.', 'wp-seopress-pro'),
            'icon'       => 'dashicons-clock',
            'deleteable' => false,
        ];
        seopress_notification($args);
    }

    if ('1' !== seopress_pro_get_service('OptionPro')->getRichSnippetEnable()) {
        $args = [
            'id'     => 'notice-schemas-metabox',
            'title'  => __('Structured data types is not correctly enabled', 'wp-seopress-pro'),
            'desc'   => __('Please enable <strong>Structured Data Types metabox for your posts, pages and custom post types</strong> option in order to use automatic and manual schemas. (SEO > PRO > Structured Data Types (schema.org)', 'wp-seopress-pro'),
            'impact' => [
                'high' => __('High impact', 'wp-seopress-pro'),
            ],
            'link' => [
                'en'       => esc_url(admin_url('admin.php?page=seopress-pro-page#tab=tab_seopress_rich_snippets')),
                'title'    => __('Fix this!', 'wp-seopress-pro'),
                'external' => false,
            ],
            'icon'       => 'dashicons-warning',
            'deleteable' => false,
        ];
        seopress_notification($args);
    }

    if ('valid' != get_option('seopress_pro_license_status')) {
        $args = [
            'id'     => 'notice-license',
            'title'  => __('You have to enter your licence key to get updates and support', 'wp-seopress-pro'),
            'desc'   => __('Please activate the SEOPress PRO license key to automatically receive updates to guarantee you the best user experience possible.', 'wp-seopress-pro'),
            'impact' => [
                'info' => __('License', 'wp-seopress-pro'),
            ],
            'link' => [
                'en'       => admin_url('admin.php?page=seopress-license'),
                'title'    => __('Fix this!', 'wp-seopress-pro'),
                'external' => false,
            ],
            'icon'       => 'dashicons-admin-network',
            'deleteable' => false,
        ];
        seopress_notification($args);
    }


    function seopress_get_hidden_notices_robots_txt_option()
    {
        $options = get_option('seopress_notices');
        if (empty($options)) {
            return;
        }
        if (!isset($options['notice-robots-txt'])) {
            return;
        }

        return $options['notice-robots-txt'];
    }

    function seopress_get_hidden_notices_robots_txt_valid()
    {
        $options = get_option('seopress_notices');
        if (empty($options)) {
            return;
        }
        if (!isset($options['notice-robots-txt-valid'])) {
            return;
        }

        return $options['notice-robots-txt-valid'];
    }

    if(file_exists(ABSPATH . 'robots.txt') && '1' !== seopress_get_hidden_notices_robots_txt_option() && empty(seopress_get_hidden_notices_robots_txt_option())){

        $args = [
            'id'     => 'notice-robots-txt',
            'title'  => __('A physical robots.txt file has been found', 'wp-seopress-pro'),
            'desc'   => __('A robots.txt file already exists at the root of your site. We invite you to remove it so SEOPress can handle it virtually.', 'wp-seopress-pro'),
            'impact' => [
                'high' => __('High impact', 'wp-seopress-pro'),
            ],
            'deleteable' => true,
        ];
        seopress_notification($args);
    }

    if ('1' !== seopress_get_hidden_notices_robots_txt_valid()) {
        try {
            $contentRobotsTxt = wp_remote_retrieve_body( wp_remote_get( site_url( 'robots.txt' ) ) );
            if(!empty($contentRobotsTxt)){
                $contentRobotsTxt = explode("\n", $contentRobotsTxt);

                $checkDisallowAfter = false;
                $validRobotsTxt = true;
                foreach($contentRobotsTxt as $line){
                    if(strpos($line, 'User-agent:') !== false && strpos($line, '*') !== false){
                        $checkDisallowAfter = true;
                    }

                    if(trim($line) === 'Disallow: /' && $checkDisallowAfter){
                        $validRobotsTxt = false;
                    }
                }

                if(!$validRobotsTxt  && '1' !== seopress_get_hidden_notices_robots_txt_valid() && empty(seopress_get_hidden_notices_robots_txt_valid())){
                    $args = [
                        'id'     => 'notice-robots-txt-valid',
                        'title'  => __('Your site is not indexable!', 'wp-seopress-pro'),
                        'desc'   => __('Your robots.txt file contains a rule that prevents search engines to index your all site: <code>Disallow: /</code>', 'wp-seopress-pro'),
                        'impact' => [
                            'high' => __('High impact', 'wp-seopress-pro'),
                        ],
                        'link' => [
                            'en'       => is_multisite() ? network_admin_url('admin.php?page=seopress-network-option#tab=tab_seopress_robots') : admin_url('admin.php?page=seopress-pro-page#tab=tab_seopress_robots'),
                            'title'    => __('Fix this!', 'wp-seopress-pro'),
                            'external' => false,
                        ],
                        'deleteable' => true,
                    ];
                    seopress_notification($args);
                }
            }
        } catch (\Exception $e) {

        }
    }
}
