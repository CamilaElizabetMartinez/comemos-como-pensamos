<?php

defined('ABSPATH') or exit('Please don&rsquo;t call the plugin directly. Thanks :)');

function print_section_info_news() {
    print_pro_section('news');
    $docs = seopress_get_docs_links();

    if ('1' !== seopress_get_service('SitemapOption')->isEnabled() || '1' !== seopress_get_toggle_option('xml-sitemap')) { ?>
        <div class="seopress-notice is-error">
            <p>
                <?php _e('You need to enable XML Sitemap feature, in order to use Google News Sitemap.', 'wp-seopress-pro'); ?>
                <a href="<?php echo admin_url('admin.php?page=seopress-xml-sitemap'); ?>">
                    <?php _e('Change this settings', 'wp-seopress-pro'); ?>
                </a>
            </p>
        </div>
    <?php
    } ?>

    <p>
        <?php _e('We respect the rules of <strong>Google News</strong>: Only articles published during the <strong>previous two days</strong>, and, to a limit of <strong>1000 articles</strong>, are visible in the sitemap.', 'wp-seopress-pro'); ?>
    </p>

    <p>
        <pre><span class="dashicons dashicons-external"></span><a href="<?php echo get_option('home'); ?>/news.xml" target="_blank"><?php echo get_option('home'); ?>/news.xml</a></pre>
    </p>

    <p>
        <a href="https://www.google.com/ping?sitemap=<?php echo get_option('home'); ?>/news.xml"
            target="_blank" class="btn btnSecondary">
            <?php _e('Ping Google manually', 'wp-seopress-pro'); ?>
        </a>

        <button type="button" id="seopress-flush-permalinks" class="btn btnSecondary">
            <?php _e('Flush permalinks', 'wp-seopress-pro'); ?>
        </button>
        <span class="spinner"></span>
    </p>

    <div class="seopress-notice">
        <p>
            <?php _e('To view your sitemap, <strong>enable permalinks</strong> (not default one), and save settings to flush them.', 'wp-seopress-pro'); ?>
        </p>
        <p>
            <?php _e('<strong>Noindex content</strong> will not be displayed in Sitemaps. Same for custom canonical URLs.', 'wp-seopress-pro'); ?>
        </p>

        <p class="seopress-help">
            <span class="dashicons dashicons-external"></span>
            <a href="<?php echo $docs['sitemaps']['error']['blank']; ?>"
                target="_blank">
                <?php _e('Blank sitemap?', 'wp-seopress-pro'); ?></a>

            <span class="dashicons dashicons-external"></span>
            <a href="<?php echo $docs['sitemaps']['error']['404']; ?>"
                target="_blank">
                <?php _e('404 error?', 'wp-seopress-pro'); ?></a>

            <span class="dashicons dashicons-external"></span>
            <a href="<?php echo $docs['sitemaps']['error']['html']; ?>"
                target="_blank">
                <?php _e('HTML error? Exclude XML and XSL from caching plugins!', 'wp-seopress-pro'); ?></a>
            <span class="dashicons dashicons-external"></span>
            <a href="<?php echo array_shift($docs['get_started']['sitemaps']); ?>"
                target="_blank">
                <?php _e('Add your XML sitemaps to Google Search Console (video)', 'wp-seopress-pro'); ?></a>
        </p>
    </div>

<?php
}
