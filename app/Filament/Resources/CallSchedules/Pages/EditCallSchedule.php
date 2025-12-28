<?php

namespace App\Filament\Resources\CallSchedules\Pages;

use App\Filament\Resources\CallSchedules\CallScheduleResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditCallSchedule extends EditRecord
{
    protected static string $resource = CallScheduleResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
