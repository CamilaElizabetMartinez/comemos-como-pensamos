<?php

defined('ABSPATH') or exit('Please don&rsquo;t call the plugin directly. Thanks :)');

//AI SECTION=======================================================================================
add_settings_section(
    'seopress_setting_section_ai', // ID
    '',
    //__("AI","wp-seopress-pro"), // Title
    'print_section_info_ai', // Callback
    'seopress-settings-admin-ai' // Page
);

add_settings_field(
    'seopress_ai_openai_api_key', // ID
    __('OpenAI API key', 'wp-seopress-pro'), // Title
    'seopress_ai_openai_api_key_callback', // Callback
    'seopress-settings-admin-ai', // Page
    'seopress_setting_section_ai' // Section
);

add_settings_field(
    'seopress_ai_openai_model', // ID
    __('OpenAI model', 'wp-seopress-pro'), // Title
    'seopress_ai_openai_model_callback', // Callback
    'seopress-settings-admin-ai', // Page
    'seopress_setting_section_ai' // Section
);
