<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cache Time-To-Live (TTL) Configuration
    |--------------------------------------------------------------------------
    |
    | Configure cache duration for different data types.
    | Values are in minutes.
    |
    */

    // Dashboard data - refresh every 5 minutes
    'dashboard' => [
        'stats' => 5,
        'recent_bookings' => 5,
        'pending_approvals' => 2,
        'lab_usage' => 15,
    ],

    // Labs - rarely change, cache longer
    'labs' => [
        'list' => 30,
        'single' => 30,
        'availability' => 2, // Short TTL for availability
    ],

    // Bookings - medium frequency changes
    'bookings' => [
        'list' => 3,
        'single' => 3,
        'calendar' => 5,
    ],

    // Reports - medium frequency
    'reports' => [
        'list' => 5,
        'single' => 5,
        'analytics' => 15,
    ],

    // Users - admin only, less frequent
    'users' => [
        'list' => 10,
        'single' => 10,
    ],

    // Notifications - real-time
    'notifications' => [
        'list' => 1,
        'unread_count' => 1,
    ],

    // Analytics - computed data, cache longer
    'analytics' => [
        'monthly_trend' => 30,
        'status_distribution' => 30,
        'peak_days' => 60,
        'peak_hours' => 60,
    ],

    // Static data
    'static' => [
        'config' => 60,
        'roles' => 120,
    ],

];
