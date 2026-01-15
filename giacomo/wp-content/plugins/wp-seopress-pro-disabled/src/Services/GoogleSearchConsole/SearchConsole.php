<?php

namespace SEOPressPro\Services\GoogleSearchConsole;

defined('ABSPATH') || exit;

class SearchConsole {
    protected $client = null;

    public function handle($options = []) {
        //Cleaning old data
        delete_post_meta_by_key('_seopress_search_console_analysis_clicks');
        delete_post_meta_by_key('_seopress_search_console_analysis_ctr');
        delete_post_meta_by_key('_seopress_search_console_analysis_impressions');
        delete_post_meta_by_key('_seopress_search_console_analysis_position');

        $client = seopress_pro_get_service('GoogleClient')->getClient();

        $date_range = seopress_pro_get_service('OptionPro')->getGSCDateRange() ? seopress_pro_get_service('OptionPro')->getGSCDateRange() : '- 3 months';

        $date_range = apply_filters('seopress_search_console_date_range', $date_range);

        $startDate = isset($options['startDate']) ? $options['startDate'] : (new \DateTime('today'))->modify($date_range)->format('Y-m-d');

        $startDate = apply_filters('seopress_search_console_start_date', $startDate);

        $endDate = isset($options['endDate']) ? $options['endDate'] : (new \DateTime('today'))->format('Y-m-d');

        $endDate = apply_filters('seopress_search_console_end_date', $endDate);

        $dimensions = isset($options['dimensions']) ? $options['dimensions'] : ['PAGE'];

        $url = seopress_pro_get_service('OptionPro')->getGSCDomainProperty() ? true : site_url();

        if ($url === true) {
            $url = wp_parse_url(site_url($post));
            if (is_array($url) && isset($url['host'])) {
                $url = 'sc-domain:' . $url['host'];
            }
        }

        $url = apply_filters('seopress_search_console_base_url', $url);

        if(SEOPRESS_VERSION === "{VERSION}"){
            $url = 'https://protuts.net'; // Use for testing in dev mode
        }

        $queryRequest = new \Google_Service_SearchConsole_SearchAnalyticsQueryRequest();
        $queryRequest->setStartDate($startDate);
        $queryRequest->setEndDate($endDate);
        $queryRequest->setDimensions($dimensions);
        try {
            $response = $client->searchanalytics->query($url, $queryRequest);

            if(!property_exists($response, 'rows')){
                return [];
            }

            return [
                'data' => $response->rows,
                'status' => 'success'
            ];
        } catch (\Exception $e) {
            return [
                'error' => $e->getMessage(),
                'status' => 'error'
            ];
        }
    }

    public function saveDataFromRowResult($row){

        if(is_array($row)){
            $keys = isset($row['keys']) ? $row['keys'] : [];
        }
        else{
            $keys = property_exists($row, 'keys') ? $row->keys : [];
        }

        $url = null;

        if(!isset($keys[0])){
            return;
        }

        $url = $keys[0];

        if(!is_array($row)){
            $clicks = property_exists($row, 'clicks') ? $row->clicks : 0;
            $ctr = property_exists($row, 'ctr') ? $row->ctr : 0;
            $impressions = property_exists($row, 'impressions') ? $row->impressions : 0;
            $position = property_exists($row, 'position') ? $row->position : 0;
        }
        else{
            $clicks = isset($row['clicks']) ? $row['clicks'] : 0;
            $ctr = isset($row['ctr']) ? $row['ctr'] : 0;
            $impressions = isset($row['impressions']) ? $row['impressions'] : 0;
            $position = isset($row['position']) ? $row['position'] : 0;
        }

        if(SEOPRESS_VERSION === "{VERSION}"){
            $url = str_replace('https://protuts.net', site_url(), $url); // Use for testing in dev mode
        }

        $postId = url_to_postid($url);

        if(!$postId){
            return;
        }

        update_post_meta($postId, '_seopress_search_console_analysis_clicks', $clicks);
        update_post_meta($postId, '_seopress_search_console_analysis_ctr', $ctr);
        update_post_meta($postId, '_seopress_search_console_analysis_impressions', $impressions);
        update_post_meta($postId, '_seopress_search_console_analysis_position', $position);

        return [
            'post_id' => $postId,
            'data' => [
                'clicks' => $clicks,
                'ctr' => $ctr,
                'impressions' => $impressions,
                'position' => $position,
            ],
        ];
    }
}
