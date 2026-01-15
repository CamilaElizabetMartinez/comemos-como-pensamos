<?php

defined('ABSPATH') or exit('Please don&rsquo;t call the plugin directly. Thanks :)');

function print_section_info_page_speed() {
    print_pro_section('page-speed');
    $options = get_option('seopress_pro_option_name');
    $url = isset($options['seopress_ps_url']) ? $options['seopress_ps_url'] : get_home_url();
    ?>

    <p><?php _e('Learn how your site has performed, based on data from your actual users around the world.', 'wp-seopress-pro'); ?>
    </p>

    <p>
        <button type="button" class="seopress-request-page-speed btn btnPrimary"
            data_permalink="<?php if (isset($url)) {
                echo esc_html($url);
            } else {
             echo get_home_url();
            } ?>">
            <?php _e('Analyse with PageSpeed Insights', 'wp-seopress-pro'); ?>
        </button>

        <a href="javascript:window.print()" class="btn btnSecondary">
            <?php _e('Save as PDF', 'wp-seopress-pro'); ?>
        </a>

        <button type="button" id="seopress-clear-page-speed-cache" class="btn btnSecondary">
            <?php _e('Remove last analysis', 'wp-seopress-pro'); ?>
        </button>

        <span class="spinner"></span>
    </p>
    <?php
}
