<?php

namespace App\Filament\Resources\CallSchedules\Pages;

use App\Filament\Resources\CallSchedules\CallScheduleResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListCallSchedules extends ListRecords
{
    protected static string $resource = CallScheduleResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
