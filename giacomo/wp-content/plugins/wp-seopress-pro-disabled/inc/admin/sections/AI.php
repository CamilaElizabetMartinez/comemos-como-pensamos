<?php

defined('ABSPATH') or exit('Please don&rsquo;t call the plugin directly. Thanks :)');

function print_section_info_ai()
{
    print_pro_section('ai');

    $docs     = function_exists('seopress_get_docs_links') ? seopress_get_docs_links() : ''; ?>


    <p>
        <?php _e('Enter your <strong>API key</strong>, select an <strong>AI model</strong>, and start <strong>auto-generating your title and description meta tags automagically</strong> (from the SEO metabox or from your posts‘ list view bulk actions).', 'wp-seopress-pro'); ?>
    </p>
<?php
}
