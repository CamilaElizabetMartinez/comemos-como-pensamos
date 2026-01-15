<?php

defined('ABSPATH') or exit('Please don&rsquo;t call the plugin directly. Thanks :)');

function print_section_info_breadcrumbs() {
    print_pro_section('breadcrumbs'); ?>

    <div class="seopress-notice">
        <h3><?php _e('How to install the Breadcrumbs?', 'wp-seopress-pro'); ?></h3>

        <h4><?php _e('Block Editor / FSE', 'wp-seopress-pro'); ?></h4>
        <p><?php _e('Add the Breadcrumbs block using the <strong>Block Editor</strong> or the <strong>Full Site Editing</strong> feature.', 'wp-seopress-pro'); ?></p>

        <hr>
        <h4><?php _e('Shortcode', 'wp-seopress-pro'); ?></h4>
        <p><?php _e('You can also use this shortcode in your content (post, page, post type...):', 'wp-seopress-pro'); ?></p>

        <pre>[seopress_breadcrumbs]</pre>

        <hr>
        <h4><?php _e('PHP template', 'wp-seopress-pro'); ?></h4>
        <p><?php _e('Copy and paste this function into your theme (eg: header.php) to enable your breadcrumbs:', 'wp-seopress-pro'); ?></p>

        <pre>&lt;?php if(function_exists('seopress_display_breadcrumbs')) { seopress_display_breadcrumbs(); } ?&gt;</pre>

        <p><?php _e('This function accepts 1 parameter: <strong>true / false</strong> for <strong>echo / return</strong>. Default: <strong>true</strong>.', 'wp-seopress-pro'); ?></p>

        <p><?php _e('<a class="seopress-help" href="https://www.youtube.com/watch?v=YP6QG9qO0ps" target="_blank">Watch this video guide to easily integrate your breadcrumbs with your WordPress theme</a><span class="seopress-help dashicons dashicons-external"></span>', 'wp-seopress-pro'); ?></p>
    </div>

    <?php
    //Elementor
    if (did_action('elementor/loaded')) {
        ?>

        <div class="seopress-notice">
            <h3><?php _e('Elementor user?', 'wp-seopress-pro'); ?></h3>
            <p><?php _e('We also provide a widget for <strong>Elementor users</strong> (Elementor Builder > Elements tab > Site section > Breadcrumbs widget). <a class="seopress-help" href="https://www.youtube.com/watch?v=ID4xm1UVikc" target="_blank">Click to watch the video tutorial</a><span class="seopress-help dashicons dashicons-external"></span>', 'wp-seopress-pro'); ?></p>
        </div>

        <?php
    } ?>


    <?php
}

function print_section_info_breadcrumbs_i18n() {
    $docs = seopress_get_docs_links();
    ?>
    <hr>

    <h3><?php _e('Translations', 'wp-seopress-pro'); ?></h3>

    <p class="description">
        <a href="<?php echo $docs['breadcrumbs']['i18n']; ?>"
            class="seopress-help" target="_blank">
            <?php _e('Learn how to translate these options with multilingual plugins', 'wp-seopress-pro'); ?>
        </a>
        <span class="seopress-help dashicons dashicons-external"></span>
    </p>
<?php
}

function print_section_info_breadcrumbs_misc() {
    ?>
    <hr>

    <h3><?php _e('Misc', 'wp-seopress-pro'); ?></h3>
<?php
}
