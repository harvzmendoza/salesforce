<?php

namespace App\Filament\Resources\Districts\Schemas;

use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class DistrictForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('region_id')
                    ->required()
                    ->numeric(),
                TextInput::make('district_name')
                    ->required(),
            ]);
    }
}
