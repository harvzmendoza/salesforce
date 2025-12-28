<?php

namespace App\Filament\Resources\CallSchedules;

use App\Filament\Resources\CallSchedules\Pages\CreateCallSchedule;
use App\Filament\Resources\CallSchedules\Pages\EditCallSchedule;
use App\Filament\Resources\CallSchedules\Pages\ListCallSchedules;
use App\Filament\Resources\CallSchedules\Schemas\CallScheduleForm;
use App\Filament\Resources\CallSchedules\Tables\CallSchedulesTable;
use App\Models\CallSchedule;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class CallScheduleResource extends Resource
{
    protected static ?string $model = CallSchedule::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    public static function form(Schema $schema): Schema
    {
        return CallScheduleForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return CallSchedulesTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListCallSchedules::route('/'),
            'create' => CreateCallSchedule::route('/create'),
            'edit' => EditCallSchedule::route('/{record}/edit'),
        ];
    }
}
