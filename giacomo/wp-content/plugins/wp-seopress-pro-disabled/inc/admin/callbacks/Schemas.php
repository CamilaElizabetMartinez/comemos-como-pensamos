<?php

defined('ABSPATH') or exit('Please don&rsquo;t call the plugin directly. Thanks :)');

function seopress_rich_snippets_enable_callback() {
    $options = get_option('seopress_pro_option_name');

    $check = isset($options['seopress_rich_snippets_enable']); ?>

<label for="seopress_rich_snippets_enable">
    <input id="seopress_rich_snippets_enable" name="seopress_pro_option_name[seopress_rich_snippets_enable]"
        type="checkbox" <?php if ('1' == $check) { ?>
    checked="yes"
    <?php } ?>
    value="1"/>

    <?php _e('Enable Structured Data Types metabox for your posts, pages and custom post types', 'wp-seopress-pro'); ?>
</label>

<?php if (isset($options['seopress_rich_snippets_enable'])) {
        esc_attr($options['seopress_rich_snippets_enable']);
    }
}

function seopress_rich_snippets_publisher_logo_callback() {
    $options = get_option('seopress_pro_option_name');

    $options_set = isset($options['seopress_rich_snippets_publisher_logo']) ? esc_attr($options['seopress_rich_snippets_publisher_logo']) : null;

    $options_set2 = isset($options['seopress_rich_snippets_publisher_logo_width']) ? esc_attr($options['seopress_rich_snippets_publisher_logo_width']) : null;
    $options_set3 = isset($options['seopress_rich_snippets_publisher_logo_height']) ? esc_attr($options['seopress_rich_snippets_publisher_logo_height']) : null;

    $check = isset($options['seopress_rich_snippets_publisher_logo']); ?>

<input id="seopress_rich_snippets_publisher_logo_meta" autocomplete="off" type="text"
    value="<?php echo $options_set; ?>"
    name="seopress_pro_option_name[seopress_rich_snippets_publisher_logo]"
    aria-label="<?php _e('Upload your publisher logo', 'wp-seopress-pro'); ?>"
    placeholder="<?php esc_html_e('Select your logo', 'wp-seopress-pro'); ?>" />

<input id="seopress_rich_snippets_publisher_logo_width" type="hidden"
    value="<?php echo $options_set2; ?>"
    name="seopress_pro_option_name[seopress_rich_snippets_publisher_logo_width]" />
<input id="seopress_rich_snippets_publisher_logo_height" type="hidden"
    value="<?php echo $options_set3; ?>"
    name="seopress_pro_option_name[seopress_rich_snippets_publisher_logo_height]" />

<input id="seopress_rich_snippets_publisher_logo_upload" class="btn btnSecondary" type="button"
    value="<?php _e('Upload an Image', 'wp-seopress-pro'); ?>" />

<?php if (isset($options['seopress_rich_snippets_publisher_logo'])) {
        esc_attr($options['seopress_rich_snippets_publisher_logo']);
    } ?>

<p>
    <img style="width:auto;height:auto;max-width:560px;margin-top:15px;display:inline-block;"
        src="<?php echo esc_attr(seopress_pro_get_service('OptionPro')->getArticlesPublisherLogo()); ?>" />
</p>

<div class="seopress-notice">
    <h3>
        <?php _e('Make sure your image follow these Google guidelines', 'wp-seopress-pro'); ?>
    </h3>
    <ul>
        <li>
            <?php _e('A logo that is representative of the organization.', 'wp-seopress-pro'); ?>
        </li>
        <li>
            <?php _e('Files must be BMP, GIF, JPEG, PNG, WebP or SVG.', 'wp-seopress-pro'); ?>
        </li>
        <li>
            <?php _e('The image must be 112x112px, at minimum.', 'wp-seopress-pro'); ?>
        </li>
        <li>
            <?php _e('The image URL must be crawlable and indexable.', 'wp-seopress-pro'); ?>
        </li>
        <li>
            <?php _e('Make sure the image looks how you intend it to look on a purely white background (for example, if the logo is mostly white or gray, it may not look how you want it to look when displayed on a white background).', 'wp-seopress-pro'); ?>
        </li>
    </ul>

    <p>
        <span class="seopress-help dashicons dashicons-external"></span>
        <a class="seopress-help" href="https://developers.google.com/search/docs/appearance/structured-data/logo#structured-data-type-definitions"
            target="_blank">
            <?php _e('Learn more', 'wp-seopress-pro'); ?>
        </a>
    </p>
</div>

<?php
}

function seopress_rich_snippets_site_nav_callback() {
    $options = get_option('seopress_pro_option_name');

    $selected = isset($options['seopress_rich_snippets_site_nav']) ? $options['seopress_rich_snippets_site_nav'] : null; ?>

<select id="seopress_rich_snippets_site_nav" name="seopress_pro_option_name[seopress_rich_snippets_site_nav]">
    <option <?php if ('none' == $selected) { ?>
        selected="selected"
        <?php } ?>
        value="none"><?php _e('None', 'wp-seopress-pro'); ?>
    </option>

    <?php if (function_exists('wp_get_nav_menus')) {
        $menus = wp_get_nav_menus();
        if ( ! empty($menus)) {
            foreach ($menus as $menu) { ?>
    <option <?php if (esc_attr($menu->term_id) == $selected) { ?>
        selected="selected"
        <?php } ?>
        value="<?php esc_attr_e($menu->term_id); ?>"><?php esc_html_e($menu->name); ?>
    </option>
    <?php }
        }
    } ?>
</select>

<p class="description">
    <?php _e('Select your primary navigation. This can help search engines better understand the structure of your site.', 'wp-seopress-pro'); ?>
</p>

<p class="description">
    <?php _e('This schema will be printed in the source code of your homepage.', 'wp-seopress-pro'); ?>
</p>

<?php if (isset($options['seopress_rich_snippets_site_nav'])) {
        esc_attr($options['seopress_rich_snippets_site_nav']);
    }
}
