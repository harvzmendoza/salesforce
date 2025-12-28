<?php

namespace App\Filament\Resources\CallRecordings\Pages;

use App\Filament\Resources\CallRecordings\CallRecordingResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditCallRecording extends EditRecord
{
    protected static string $resource = CallRecordingResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
