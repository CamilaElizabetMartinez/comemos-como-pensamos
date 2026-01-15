<?php

defined('ABSPATH') or exit('Please don&rsquo;t call the plugin directly. Thanks :)');

function print_section_info_google_analytics_matomo_widget()
{
    $docs     = function_exists('seopress_get_docs_links') ? seopress_get_docs_links() : ''; ?>
    <hr>
    <h3 id="seopress-matomo-stats">
        <?php _e('Stats in dashboard', 'wp-seopress-pro'); ?>
    </h3>

    <p><?php _e('Connect your WordPress site with Matomo Analytics API and get statistics right in your Dashboard.', 'wp-seopress-pro'); ?>
    </p>
    <p><?php _e('This feature is completely independent of user tracking. For example, statistical data will be collected even if you have not entered your API key below.', 'wp-seopress-pro'); ?>
    </p>

    <span class="seopress-help dashicons dashicons-external"></span>
    <a class="seopress-help"
        href="<?php echo $docs['analytics']['matomo']['token']; ?>"
        target="_blank">
        <?php _e('Read our guide to connect your WordPress site with Matomo Analytics API', 'wp-seopress-pro'); ?>
    </a>
<?php
}
