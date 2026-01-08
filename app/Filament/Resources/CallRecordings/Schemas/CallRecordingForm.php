<?php

namespace App\Filament\Resources\CallRecordings\Schemas;

use Filament\Forms\Components\KeyValue;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class CallRecordingForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('call_schedule_id')
                    ->label('Call Schedule ID')
                    ->required()
                    ->numeric(),
                KeyValue::make('product_id')
                    ->label('Products JSON')
                    ->keyLabel('Index')
                    ->valueLabel('Product data (id, quantity, discount)')
                    ->columnSpanFull(),
                TextInput::make('signature')
                    ->label('Signature')
                    ->required(),
                Textarea::make('post_activity')
                    ->label('Post Activity')
                    ->nullable()
                    ->columnSpanFull(),
            ]);
    }
}
