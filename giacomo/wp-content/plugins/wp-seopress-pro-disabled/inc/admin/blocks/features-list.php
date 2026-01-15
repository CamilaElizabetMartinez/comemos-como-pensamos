<?php
// To prevent calling the plugin directly
if (! function_exists('add_action')) {
    echo 'Please don&rsquo;t call the plugin directly. Thanks :)';
    exit;
}

/* Add PRO features to SEO dashboard */
add_filter('seopress_features_list_before_tools', 'seopress_pro_features_list_before_tools');
function seopress_pro_features_list_before_tools($features) {

    $features['404'] = [
        'title'       => __('Redirections', 'wp-seopress-pro'),
        'desc'        => __('Monitor 404, create 301, 302 and 307 redirections.', 'wp-seopress-pro'),
        'btn_primary' => admin_url('admin.php?page=seopress-pro-page#tab=tab_seopress_404'),
        'filter'      => 'seopress_remove_feature_redirects',
    ];
    $features['rich-snippets'] = [
        'title'         => __('Structured Data Types', 'wp-seopress-pro'),
        'desc'          => __('Add data types to your content: articles, courses, recipes, videos, events, products and more.', 'wp-seopress-pro'),
        'btn_primary'   => admin_url('admin.php?page=seopress-pro-page#tab=tab_seopress_rich_snippets'),
        'filter'        => 'seopress_remove_feature_schemas',
    ];
    if (! is_multisite() || (is_multisite() && defined('SUBDOMAIN_INSTALL') && true === constant('SUBDOMAIN_INSTALL'))) {//subdomains or single site
        $features['robots'] = [
            'title'       => __('robots.txt', 'wp-seopress-pro'),
            'desc'        => __('Edit your robots.txt file.', 'wp-seopress-pro'),
            'btn_primary' => admin_url('admin.php?page=seopress-pro-page#tab=tab_seopress_robots'),
            'filter'      => 'seopress_remove_feature_robots',
        ];
    }
    if (! is_multisite()) {
        $features['htaccess'] = [
            'title'         => __('.htaccess', 'wp-seopress-pro'),
            'desc'          => __('Edit your htaccess file.', 'wp-seopress-pro'),
            'btn_primary'   => admin_url('admin.php?page=seopress-pro-page#tab=tab_seopress_htaccess'),
            'filter'        => 'seopress_remove_feature_htaccess',
            'toggle'        => false,
        ];
    }
    $features['local-business'] = [
        'title'         => __('Local Business', 'wp-seopress-pro'),
        'desc'          => __('Add Google Local Business data type.', 'wp-seopress-pro'),
        'btn_primary'   => admin_url('admin.php?page=seopress-pro-page#tab=tab_seopress_local_business'),
        'filter'        => 'seopress_remove_feature_local_business',
    ];
    $features['ai'] = [
        'title'         => __('AI', 'wp-seopress-pro'),
        'desc'          => __('Use the power of artificial intelligence to increase your productivity.', 'wp-seopress-pro'),
        'btn_primary'   => admin_url('admin.php?page=seopress-pro-page#tab=tab_seopress_ai'),
        'filter'        => 'seopress_remove_feature_ai',
    ];
    $features['breadcrumbs'] = [
        'title'         => __('Breadcrumbs', 'wp-seopress-pro'),
        'desc'          => __('Enable Breadcrumbs for your theme and improve your SEO in SERPs.', 'wp-seopress-pro'),
        'btn_primary'   => admin_url('admin.php?page=seopress-pro-page#tab=tab_seopress_breadcrumbs'),
        'filter'        => 'seopress_remove_feature_breadcrumbs',
    ];
    $features['woocommerce'] = [
        'title'         => __('WooCommerce', 'wp-seopress-pro'),
        'desc'          => __('Improve WooCommerce SEO.', 'wp-seopress-pro'),
        'btn_primary'   => admin_url('admin.php?page=seopress-pro-page#tab=tab_seopress_woocommerce'),
        'filter'        => 'seopress_remove_feature_woocommerce',
    ];
    $features['edd'] = [
        'title'         => __('Easy Digital Downloads', 'wp-seopress-pro'),
        'desc'          => __('Improve Easy Digital Downloads SEO.', 'wp-seopress-pro'),
        'btn_primary'   => admin_url('admin.php?page=seopress-pro-page#tab=tab_seopress_edd'),
        'filter'        => 'seopress_remove_feature_edd',
    ];
    $features['page-speed'] = [
        'title'         => __('Google Page Speed', 'wp-seopress-pro'),
        'desc'          => __('Track your website performance to improve SEO with Google Page Speed.', 'wp-seopress-pro'),
        'btn_primary'   => admin_url('admin.php?page=seopress-pro-page#tab=tab_seopress_page_speed'),
        'filter'        => 'seopress_remove_feature_page_speed',
        'toggle'        => false,
    ];
    $features['inspect-url'] = [
        'title'         => __('Google Search Console', 'wp-seopress-pro'),
        'desc'          => __('Get clicks, positions, CTR and impressions</strong>. Inspect your URL for details about crawling, indexing, mobile compatibility, schemas and more.', 'wp-seopress-pro'),
        'btn_primary'   => admin_url('admin.php?page=seopress-pro-page#tab=tab_seopress_inspect_url'),
        'filter'        => 'seopress_remove_feature_inspect_url',
        'toggle'        => true,
    ];
    $features['news'] = [
        'title'         => __('Google News Sitemap', 'wp-seopress-pro'),
        'desc'          => __('Optimize your site for Google News.', 'wp-seopress-pro'),
        'btn_primary'   => admin_url('admin.php?page=seopress-pro-page#tab=tab_seopress_news'),
        'filter'        => 'seopress_remove_feature_news',
    ];
    $features['bot'] = [
        'title'       => __('Broken links', 'wp-seopress-pro'),
        'desc'        => __('Scan your site to find SEO problems.', 'wp-seopress-pro'),
        'btn_primary' => admin_url('admin.php?page=seopress-bot-batch'),
        'filter'      => 'seopress_remove_feature_bot',
    ];
    $features['dublin-core'] = [
        'title'         => __('Dublin Core', 'wp-seopress-pro'),
        'desc'          => __('Add Dublin Core meta tags.', 'wp-seopress-pro'),
        'btn_primary'   => admin_url('admin.php?page=seopress-pro-page#tab=tab_seopress_dublin_core'),
        'filter'        => 'seopress_remove_feature_dublin_core',
    ];
    $features['rewrite'] = [
        'title'         => __('URL Rewriting', 'wp-seopress-pro'),
        'desc'          => __('Customize your permalinks.', 'wp-seopress-pro'),
        'btn_primary'   => admin_url('admin.php?page=seopress-pro-page#tab=tab_seopress_rewrite'),
        'filter'        => 'seopress_remove_feature_rewrite',
    ];
    $features['rss'] = [
        'title'         => __('RSS', 'wp-seopress-pro'),
        'desc'          => __('Configure default WordPress RSS.', 'wp-seopress-pro'),
        'btn_primary'   => admin_url('admin.php?page=seopress-pro-page#tab=tab_seopress_rss'),
        'filter'        => 'seopress_remove_feature_rss',
        'toggle'        => false,
    ];

    return $features;
}

/* Add PRO features to SEO dashboard (after Tools) */
add_filter('seopress_features_list_after_tools', 'seopress_pro_features_list_after_tools');
function seopress_pro_features_list_after_tools($features) {
    $features['license'] = [
        'title'         => __('License', 'wp-seopress-pro'),
        'desc'          => __('Edit your license key.', 'wp-seopress-pro'),
        'btn_primary'   => admin_url('admin.php?page=seopress-license'),
        'filter'        => 'seopress_remove_feature_license',
        'toggle'        => false,
    ];

    return $features;
}
