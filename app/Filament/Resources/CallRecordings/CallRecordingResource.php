<?php

namespace App\Filament\Resources\CallRecordings;

use App\Filament\Resources\CallRecordings\Pages\CreateCallRecording;
use App\Filament\Resources\CallRecordings\Pages\EditCallRecording;
use App\Filament\Resources\CallRecordings\Pages\ListCallRecordings;
use App\Filament\Resources\CallRecordings\Schemas\CallRecordingForm;
use App\Filament\Resources\CallRecordings\Tables\CallRecordingsTable;
use App\Models\CallRecording;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class CallRecordingResource extends Resource
{
    protected static ?string $model = CallRecording::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    public static function form(Schema $schema): Schema
    {
        return CallRecordingForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return CallRecordingsTable::configure($table);
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
            'index' => ListCallRecordings::route('/'),
            'create' => CreateCallRecording::route('/create'),
            'edit' => EditCallRecording::route('/{record}/edit'),
        ];
    }
}
