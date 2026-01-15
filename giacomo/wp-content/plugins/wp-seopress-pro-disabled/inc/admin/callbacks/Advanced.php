<?php

defined('ABSPATH') or exit('Please don&rsquo;t call the plugin directly. Thanks :)');

function seopress_pro_advanced_appearance_ps_col_callback() {
    $options = get_option('seopress_advanced_option_name');

    $check = isset($options['seopress_advanced_appearance_ps_col']); ?>

<label for="seopress_advanced_appearance_ps_col">
	<input id="seopress_advanced_appearance_ps_col"
		name="seopress_advanced_option_name[seopress_advanced_appearance_ps_col]" type="checkbox" <?php if ('1' == $check) { ?>
	checked="yes"
	<?php } ?>
	value="1"/>

	<?php _e('Display Page Speed column to check performances', 'wp-seopress-pro'); ?>
</label>

<?php if (isset($options['seopress_advanced_appearance_ps_col'])) {
        esc_attr($options['seopress_advanced_appearance_ps_col']);
    }
}

function seopress_pro_advanced_appearance_search_console_callback() {
        $options = get_option('seopress_advanced_option_name');

        $check = isset($options['seopress_advanced_appearance_search_console']); ?>

    <label for="seopress_advanced_appearance_search_console">
        <input id="seopress_advanced_appearance_search_console"
            name="seopress_advanced_option_name[seopress_advanced_appearance_search_console]" type="checkbox" <?php if ('1' == $check) { ?>
        checked="yes"
        <?php } ?>
        value="1"/>

        <?php _e('Display Search Console Data (clicks, impressions, CTR, positions)', 'wp-seopress-pro');
    ?>
</label>

<?php if (isset($options['seopress_advanced_appearance_search_console'])) {
		esc_attr($options['seopress_advanced_appearance_search_console']);
	}
}
