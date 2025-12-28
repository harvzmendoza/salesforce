<?php

namespace App\Filament\Resources\CallRecordings\Schemas;

use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Schemas\Schema;

class CallRecordingForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('call_schedule_id')
                    ->required()
                    ->numeric(),
                TextInput::make('name')
                    ->required(),
                TextInput::make('price')
                    ->required(),
                TextInput::make('quantity')
                    ->required(),
                TextInput::make('discount')
                    ->required(),
                TextInput::make('signature')
                    ->required(),
                Textarea::make('post_activity')
                    ->required()
                    ->columnSpanFull(),
            ]);
    }
}
