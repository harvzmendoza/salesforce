<?php

namespace App\Filament\Resources\CallRecordings\Pages;

use App\Filament\Resources\CallRecordings\CallRecordingResource;
use Filament\Resources\Pages\CreateRecord;

class CreateCallRecording extends CreateRecord
{
    protected static string $resource = CallRecordingResource::class;
}
