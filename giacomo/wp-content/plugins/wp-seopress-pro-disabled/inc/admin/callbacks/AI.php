<?php
defined('ABSPATH') or exit('Please don&rsquo;t call the plugin directly. Thanks :)');

//OpenAI API key
function seopress_ai_openai_api_key_callback() {
    $docs = seopress_get_docs_links();

    $options = get_option('seopress_pro_option_name');
    $check = isset($options['seopress_ai_openai_api_key']) ? 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' : null;

    printf('<input type="password" name="seopress_pro_option_name[seopress_ai_openai_api_key]" autocomplete="off" spellcheck="false" autocorrect="off" autocapitalize="off" value="%s" aria-label="' . __('OpenAI API key', 'wp-seopress-pro') . '"/>', esc_html($check));
    ?>
        <p class="description">
            <?php printf(__('Sign up to <a href="%s" target="_blank">OpenAI</a> to generate your API key.', 'wp-seopress-pro'), esc_url( 'https://beta.openai.com/account/api-keys' )); ?>
        </p>
    <?php
}

//Open AI model
function seopress_ai_openai_model_callback() {
    $options = get_option('seopress_pro_option_name');

    $selected = isset($options['seopress_ai_openai_model']) ? $options['seopress_ai_openai_model'] : null; ?>

<select id="seopress_ai_openai_model" name="seopress_pro_option_name[seopress_ai_openai_model]">
    <?php
        $models = [
            'gpt-3.5-turbo'      => __('GPT-3.5 Turbo (Most efficient)','wp-seopress-pro'),
            'text-davinci-003'   => __('Davinci','wp-seopress-pro'),
            'text-curie-001'     => __('Curie','wp-seopress-pro'),
            'text-babbage-001'   => __('Babbage','wp-seopress-pro'),
            'text-ada-001'       => __('Ada (Fastest, less expensive)','wp-seopress-pro'),
        ];
        if ( ! empty($models)) {
            foreach ($models as $key => $model) { ?>
    <option <?php if (esc_attr($key) == $selected) { ?>
        selected="selected"
        <?php } ?>
        value="<?php esc_attr_e($key); ?>"><?php esc_html_e($model); ?>
    </option>
    <?php }
        }
    ?>
</select>

<p class="description">
    <?php _e('Select your OpenAI model.', 'wp-seopress-pro'); ?>
</p>

<?php if (isset($options['seopress_ai_openai_model'])) {
        esc_attr($options['seopress_ai_openai_model']);
    }
}
