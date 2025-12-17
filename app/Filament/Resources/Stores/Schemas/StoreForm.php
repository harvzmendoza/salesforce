<?php

namespace App\Filament\Resources\Stores\Schemas;

use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class StoreForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('store_name')
                    ->required(),
                TextInput::make('territory_id')
                    ->required()
                    ->numeric(),
            ]);
    }
}
