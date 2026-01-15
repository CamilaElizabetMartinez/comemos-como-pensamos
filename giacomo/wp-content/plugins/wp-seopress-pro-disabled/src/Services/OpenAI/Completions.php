<?php

namespace SEOPressPro\Services\OpenAI;

defined('ABSPATH') || exit;

class Completions {
    private const OPENAI_URL_COMPLETIONS = 'https://api.openai.com/v1/completions';
    private const OPENAI_URL_CHAT_COMPLETIONS = 'https://api.openai.com/v1/chat/completions';

    public function generateTitlesDesc($post_id, $meta = '') {
        $content = get_post_field('post_content', $post_id);
        $content = esc_attr(stripslashes_deep(wp_filter_nohtml_kses(wp_strip_all_tags(strip_shortcodes($content)))));

        //Compatibility with current page and theme builders
        $theme = wp_get_theme();

        //Divi
        if ('Divi' == $theme->template || 'Divi' == $theme->parent_theme) {
            $regex = '/\[(\[?)(et_pb_[^\s\]]+)(?:(\s)[^\]]+)?\]?(?:(.+?)\[\/\2\])?|\[\/(et_pb_[^\s\]]+)?\]/';
            $content = preg_replace($regex, '', $content);
        }

        //Bricks compatibility
        if (defined('BRICKS_DB_EDITOR_MODE') && ('bricks' == $theme->template || 'Bricks' == $theme->parent_theme)) {
            $page_sections = get_post_meta($post_id, BRICKS_DB_PAGE_CONTENT, true);
            $editor_mode   = get_post_meta($post_id, BRICKS_DB_EDITOR_MODE, true);

            if (is_array($page_sections) && 'wordpress' !== $editor_mode) {
                $content = \Bricks\Frontend::render_data($page_sections);
            }
        }

        //Limit post content sent to 500 words (higher value will return a 400 error)
        $content = wp_trim_words( $content, 500 );

        //If no post_content use the permalink
        if (empty($content)) {
            $content = get_permalink($post_id);
        }

        //Get OpenAI API Key
        $options = get_option('seopress_pro_option_name');
        $api_key = isset($options['seopress_ai_openai_api_key']) ? $options['seopress_ai_openai_api_key'] : '';

        //Get OpenAI model
        $model = isset($options['seopress_ai_openai_model']) ? $options['seopress_ai_openai_model'] : 'text-davinci-003';

        if (empty($api_key)) {
            return;
        }

        $body = array(
            'model'    => $model,
            'temperature' => 1,
            'max_tokens' => 220,
        );

        if ($model ==='gpt-3.5-turbo') {
            $body['messages'] = [];
        } else {
            $body['prompt'] = [];
        }

        //Prompt for meta title
        $msg   = apply_filters( 'seopress_ai_openai_meta_title', 'Generate an engaging SEO title metadata in one sentence of sixty characters maximum for this article: ' . $content, $post_id );

        if (empty($meta) || $meta === 'title') {
            if ($model ==='gpt-3.5-turbo') {
                $body['messages'][] = ['role' => 'user', 'content' => $msg];
            } else {
                $body['prompt'][]   = $msg;
            }
        }

        //Prompt for meta description
        $msg   = apply_filters( 'seopress_ai_openai_meta_desc','Generate an engaging SEO meta description in less than 160 characters for this article: ' . $content, $post_id );

        if (empty($meta) || $meta === 'desc') {
            if ($model ==='gpt-3.5-turbo') {
                $body['messages'][] = ['role' => 'user', 'content' => $msg];
            } else {
                $body['prompt'][]   = $msg;
            }
        }

        if ($model ==='gpt-3.5-turbo') {
            $body['messages'][] = ['role' => 'user', 'content' => 'Provide the answer as an object with "title" as first key and "desc" for second key for parsing.'];
        }

        $args = array(
            'body'        => json_encode($body),
            'timeout'     => '30',
            'redirection' => '5',
            'httpversion' => '1.0',
            'blocking'    => true,
            'headers' => array(
                'Authorization' => 'Bearer ' . $api_key,
                'Content-Type' => 'application/json'
            ),
        );

        $args = apply_filters('seopress_ai_openai_request_args', $args);

        $url = self::OPENAI_URL_COMPLETIONS;
        if ($model ==='gpt-3.5-turbo') {
            $url = self::OPENAI_URL_CHAT_COMPLETIONS;
        }

        $response = wp_remote_post( $url, $args );

        $title = '';
        $description = '';
        $message = '';

        // make sure the response came back okay
        if (is_wp_error($response) || 200 !== wp_remote_retrieve_response_code($response)) {
            if (is_wp_error($response)) {
                $message = $response->get_error_message();
            } else {
                $message = __('An error occurred, please try again. Response code: ', 'wp-seopress-pro') . wp_remote_retrieve_response_code($response);
            }
        } else {
            $data = json_decode(wp_remote_retrieve_body($response), true);

            $message = 'Success';

            if (empty($meta) || $meta === 'title') {
                if ($model ==='gpt-3.5-turbo') {
                    $result = json_decode($data['choices'][0]['message']['content'], true);
                    $result = $result['title'];
                } else {
                    $result = $data['choices'][0]['text'];
                }
                $title = esc_attr(trim(stripslashes_deep(wp_filter_nohtml_kses(wp_strip_all_tags(strip_shortcodes($result)))), '"'));
                update_post_meta( $post_id, '_seopress_titles_title', $title);
            }

            if (empty($meta)) {
                if ($model ==='gpt-3.5-turbo') {
                    $result = json_decode($data['choices'][0]['message']['content'], true);
                    $result = $result['desc'];
                } else {
                    $result = $data['choices'][1]['text'];
                }
            } elseif ($meta === 'desc') {
                if ($model ==='gpt-3.5-turbo') {
                    $result = json_decode($data['choices'][0]['message']['content'], true);
                    $result = $result['desc'];
                } else {
                    $result = $data['choices'][0]['text'];
                }
            }

            if (empty($meta) || $meta === 'desc') {
                $description = esc_attr(trim(stripslashes_deep(wp_filter_nohtml_kses(wp_strip_all_tags(strip_shortcodes($result)))), '"'));

                update_post_meta( $post_id, '_seopress_titles_desc', $description);
            }
        }

        $data = [
            'message' => $message,
            'title' => $title,
            'desc' => $description
        ];

        return $data;
    }
}
