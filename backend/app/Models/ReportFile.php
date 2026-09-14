<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
class ReportFile extends Model
{
    protected $fillable = [
        'report_id',
        'type',
        'file',
    ];
    public function report(): BelongsTo
    {
        return $this->belongsTo(Report::class);
    }
}
