<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class AuditLog extends Model
{
    use HasFactory;

    protected $table = 'audit_logs';

    protected $fillable = [
        'user_id',
        'action',
        'entity_type',
        'entity_id',
        'old_values',
        'new_values',
        'ip_address',
        'user_agent',
        'metadata',
    ];

    protected $casts = [
        'old_values' => 'array',
        'new_values' => 'array',
        'metadata' => 'array',
    ];

    protected $hidden = [
        'user_agent',
    ];

    /**
     * Action types
     */
    const ACTION_LOGIN = 'login';
    const ACTION_LOGOUT = 'logout';
    const ACTION_REGISTER = 'register';
    const ACTION_CREATE = 'create';
    const ACTION_UPDATE = 'update';
    const ACTION_DELETE = 'delete';
    const ACTION_APPROVE = 'approve';
    const ACTION_REJECT = 'reject';
    const ACTION_CANCEL = 'cancel';
    const ACTION_EXPORT = 'export';
    const ACTION_UPLOAD = 'upload';

    /**
     * Get the user that performed the action.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the entity that was acted upon (polymorphic).
     */
    public function auditable()
    {
        return $this->morphTo();
    }

    /**
     * Create an audit log entry.
     */
    public static function log(string $action, ?Model $entity = null, array $oldValues = [], array $newValues = [], array $metadata = []): self
    {
        $request = request();

        return static::create([
            'user_id' => $request->user()?->id,
            'action' => $action,
            'entity_type' => $entity ? get_class($entity) : null,
            'entity_id' => $entity?->id,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'metadata' => $metadata,
        ]);
    }

    /**
     * Scope: get logs for a specific user.
     */
    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope: get logs for a specific action.
     */
    public function scopeForAction($query, string $action)
    {
        return $query->where('action', $action);
    }

    /**
     * Scope: get logs for a specific entity.
     */
    public function scopeForEntity($query, string $type, int $id)
    {
        return $query->where('entity_type', $type)
                     ->where('entity_id', $id);
    }

    /**
     * Scope: get recent logs.
     */
    public function scopeRecent($query, int $hours = 24)
    {
        return $query->where('created_at', '>=', now()->subHours($hours));
    }

    /**
     * Get human-readable action label.
     */
    public function getActionLabelAttribute(): string
    {
        return match($this->action) {
            self::ACTION_LOGIN => 'Login',
            self::ACTION_LOGOUT => 'Logout',
            self::ACTION_REGISTER => 'Register',
            self::ACTION_CREATE => 'Membuat',
            self::ACTION_UPDATE => 'Mengubah',
            self::ACTION_DELETE => 'Menghapus',
            self::ACTION_APPROVE => 'Menyetujui',
            self::ACTION_REJECT => 'Menolak',
            self::ACTION_CANCEL => 'Membatalkan',
            self::ACTION_EXPORT => 'Export',
            self::ACTION_UPLOAD => 'Upload',
            default => ucfirst($this->action),
        };
    }

    /**
     * Get entity name.
     */
    public function getEntityNameAttribute(): string
    {
        if (!$this->entity_type) return '-';
        
        $class = class_basename($this->entity_type);
        
        return match($class) {
            'User' => 'User',
            'Lab' => 'Lab',
            'Booking' => 'Booking',
            'Report' => 'Laporan',
            default => $class,
        };
    }
}
