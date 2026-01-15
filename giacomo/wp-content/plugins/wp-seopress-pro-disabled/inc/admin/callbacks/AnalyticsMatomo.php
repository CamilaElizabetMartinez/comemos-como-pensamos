<?php
defined('ABSPATH') or exit('Please don&rsquo;t call the plugin directly. Thanks :)');

//Matomo Analytics Dashboard Widget
function seopress_google_analytics_matomo_widget_auth_token_callback() {
    $docs = seopress_get_docs_links();

    $options = get_option('seopress_google_analytics_option_name');

    $check = isset($options['seopress_google_analytics_matomo_widget_auth_token']) ? 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' : null;

    printf('<input type="password" autocomplete="off" spellcheck="false" autocorrect="off" autocapitalize="off" name="seopress_google_analytics_option_name[seopress_google_analytics_matomo_widget_auth_token]" value="%s" aria-label="' . __('Matomo authentication token', 'wp-seopress-pro') . '"/>', esc_html($check));
}

function seopress_google_analytics_matomo_dashboard_widget_callback() {
    $options = get_option('seopress_google_analytics_option_name');
    $check   = isset($options['seopress_google_analytics_matomo_dashboard_widget']); ?>


<label for="seopress_google_analytics_matomo_dashboard_widget">
    <input id="seopress_google_analytics_matomo_dashboard_widget"
        name="seopress_google_analytics_option_name[seopress_google_analytics_matomo_dashboard_widget]" type="checkbox" <?php if ('1' == $check) { ?>
    checked="yes"
    <?php } ?>
    value="1"/>

    <?php _e('Remove Matomo stats widget from WordPress dashboard', 'wp-seopress-pro'); ?>
</label>

<?php if (isset($options['seopress_google_analytics_matomo_dashboard_widget'])) {
        esc_attr($options['seopress_google_analytics_matomo_dashboard_widget']);
    }
}
