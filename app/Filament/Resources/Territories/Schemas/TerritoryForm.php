<?php

namespace App\Filament\Resources\Territories\Schemas;

use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class TerritoryForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('territory_name')
                    ->required(),
                TextInput::make('district_id')
                    ->required()
                    ->numeric(),
            ]);
    }
}
