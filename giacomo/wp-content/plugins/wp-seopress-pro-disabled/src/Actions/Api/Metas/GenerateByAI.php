<?php

namespace SEOPressPro\Actions\Api\Metas;

if ( ! defined('ABSPATH')) {
    exit;
}

use SEOPress\Core\Hooks\ExecuteHooks;

class GenerateByAI implements ExecuteHooks {
    public function hooks() {
        add_action('rest_api_init', [$this, 'register']);
    }


    public function register() {

        register_rest_route('seopress/v1', '/posts/(?P<id>\d+)/generate-metas-by-ai', [
            'methods'             => 'POST',
            'callback'            => [$this, 'processPost'],
            'args'                => [
                'id' => [
                    'validate_callback' => function ($param, $request, $key) {
                        return is_numeric($param);
                    },
                ],
            ],
            'permission_callback' => function ($request) {
                $nonce = $request->get_header('x-wp-nonce');
                if ( ! wp_verify_nonce($nonce, 'wp_rest')) {
                    return false;
                }

                if(!current_user_can('edit_posts')){
                    return false;
                }

                return true;
            },

        ]);
    }

    public function processPost(\WP_REST_Request $request) {
        $id    = $request->get_param('id');

        $data = seopress_pro_get_service('Completions')->generateTitlesDesc($id);

        return new \WP_REST_Response($data);
    }
}
