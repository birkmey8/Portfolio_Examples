view: ga4_campaign_analytics_sql {
  derived_table: {
    sql: SELECT
        FORMAT_DATE('%d-%m-%Y', PARSE_DATE('%Y%m%d', event_date)) AS date,
        FORMAT_TIME('%T', TIME(TIMESTAMP_MICROS(event_timestamp))) AS time,
        event_name,
        (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id') AS ga_session_id,
        (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'logged_in_status') AS logged_in_status,
        (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'session_engaged') AS session_engaged,
        (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_location') AS page_location,
        (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'accountId') AS accountId,
        (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'shiptoId') AS shiptoId,
        (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'customerShiptoName') AS customerShiptoName,
        (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'customerAccountName') AS customerAccountName,
        traffic_source.name AS Name,
        traffic_source.medium AS Medium,
        (SELECT value.int_value FROM UNNEST(user_properties) WHERE key = 'user_id') AS user_id,
        (SELECT value.string_value FROM UNNEST(user_properties) WHERE key = 'decoded_user_name') AS decoded_user_name,
        (SELECT value.string_value FROM UNNEST(user_properties) WHERE key = 'campaign') AS campaign,
        traffic_source.name,
        traffic_source.medium,
        traffic_source.source,
        session_traffic_source_last_click.cross_channel_campaign.campaign_name AS cross_channel_campaign_last_click_attr,
        session_traffic_source_last_click.manual_campaign.campaign_name AS manual_campaign_last_click_attr,
        ecommerce.purchase_revenue AS purchase_revenue
      FROM `project.dataset.events_*`
      WHERE event_name = 'purchase'
        AND TIMESTAMP_MICROS(event_timestamp) >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 365 DAY)
        AND (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'logged_in_status') = 'true';;
  }

  measure: count { type: count }

  dimension: date { type: string sql: ${TABLE}.date ;; }
  dimension: time { type: string sql: ${TABLE}.time ;; }
  dimension: event_name { type: string sql: ${TABLE}.event_name ;; }
  dimension: ga_session_id { type: number sql: ${TABLE}.ga_session_id ;; }
  dimension: logged_in_status { type: string sql: ${TABLE}.logged_in_status ;; }
  dimension: session_engaged { type: string sql: ${TABLE}.session_engaged ;; }
  dimension: page_location { type: string sql: ${TABLE}.page_location ;; }
  dimension: account_id { type: number sql: ${TABLE}.accountId ;; }
  dimension: shipto_id { type: number sql: ${TABLE}.shiptoId ;; }
  dimension: customer_shipto_name { type: string sql: ${TABLE}.customerShiptoName ;; }
  dimension: customer_account_name { type: string sql: ${TABLE}.customerAccountName ;; }
  dimension: name { type: string sql: ${TABLE}.Name ;; }
  dimension: medium { type: string sql: ${TABLE}.Medium ;; }
  dimension: user_id { type: number sql: ${TABLE}.user_id ;; }
  dimension: decoded_user_name { type: string sql: ${TABLE}.decoded_user_name ;; }
  dimension: campaign { type: string sql: ${TABLE}.campaign ;; }
  dimension: source { type: string sql: ${TABLE}.source ;; }
  dimension: cross_channel_campaign_last_click_attr { type: string sql: ${TABLE}.cross_channel_campaign_last_click_attr ;; }
  dimension: manual_campaign_last_click_attr { type: string sql: ${TABLE}.manual_campaign_last_click_attr ;; }
  dimension: purchase_revenue { type: number sql: ${TABLE}.purchase_revenue ;; }
}
