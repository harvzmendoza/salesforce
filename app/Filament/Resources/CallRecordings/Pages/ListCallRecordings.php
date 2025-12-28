<?php

namespace App\Filament\Resources\CallRecordings\Pages;

use App\Filament\Resources\CallRecordings\CallRecordingResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListCallRecordings extends ListRecords
{
    protected static string $resource = CallRecordingResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
