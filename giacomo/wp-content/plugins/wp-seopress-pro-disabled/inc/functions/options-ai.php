<?php
defined('ABSPATH') or exit('Please don&rsquo;t call the plugin directly. Thanks :)');

//Bulk actions
//Generate automatically SEO metadata
$postTypes = seopress_get_service('WordPressData')->getPostTypes();


foreach ($postTypes as $key => $value) {
    add_filter('bulk_actions-edit-' . $key, 'seopress_bulk_actions_ai_title');
    add_filter('bulk_actions-edit-' . $key, 'seopress_bulk_actions_ai_desc');
}

function seopress_bulk_actions_ai_title($bulk_actions)
{
    $bulk_actions['seopress_ai_title'] = __('Generate meta title with AI', 'wp-seopress-pro');

    return $bulk_actions;
}

function seopress_bulk_actions_ai_desc($bulk_actions)
{
    $bulk_actions['seopress_ai_desc'] = __('Generate meta description with AI', 'wp-seopress-pro');

    return $bulk_actions;
}

foreach ($postTypes as $key => $value) {
    add_filter('handle_bulk_actions-edit-' . $key, 'seopress_bulk_action_ai_title_handler', 10, 3);
    add_filter('handle_bulk_actions-edit-' . $key, 'seopress_bulk_action_ai_desc_handler', 10, 3);
}

function seopress_bulk_action_ai_title_handler($redirect_to, $doaction, $post_ids)
{
    if ('seopress_ai_title' !== $doaction) {
        return $redirect_to;
    }
    foreach ($post_ids as $post_id) {
        seopress_pro_get_service('Completions')->generateTitlesDesc($post_id, 'title');
    }
    $redirect_to = add_query_arg('bulk_ai_title_posts', count($post_ids), $redirect_to);

    return $redirect_to;
}

add_action('admin_notices', 'seopress_bulk_action_ai_title_admin_notice');

function seopress_bulk_action_ai_title_admin_notice()
{
    if (! empty($_REQUEST['bulk_ai_title_posts'])) {
        $ai_title_count = intval($_REQUEST['bulk_ai_title_posts']);
        printf('<div id="message" class="updated fade"><p>' .
                _n(
                    '%s meta title generated with AI.',
                    '%s meta titles generated with AI.',
                    $ai_title_count,
                    'wp-seopress-pro'
                ) . '</p></div>', $ai_title_count);
    }
}

function seopress_bulk_action_ai_desc_handler($redirect_to, $doaction, $post_ids)
{
    if ('seopress_ai_desc' !== $doaction) {
        return $redirect_to;
    }
    foreach ($post_ids as $post_id) {
        seopress_pro_get_service('Completions')->generateTitlesDesc($post_id, 'desc');
    }
    $redirect_to = add_query_arg('bulk_ai_desc_posts', count($post_ids), $redirect_to);

    return $redirect_to;
}

add_action('admin_notices', 'seopress_bulk_action_ai_desc_admin_notice');

function seopress_bulk_action_ai_desc_admin_notice()
{
    if (! empty($_REQUEST['bulk_ai_desc_posts'])) {
        $ai_desc_count = intval($_REQUEST['bulk_ai_desc_posts']);
        printf('<div id="message" class="updated fade"><p>' .
                _n(
                    '%s meta description generated with AI.',
                    '%s meta descriptions generated with AI.',
                    $ai_desc_count,
                    'wp-seopress-pro'
                ) . '</p></div>', $ai_desc_count);
    }
}
