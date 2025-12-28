<?php

namespace App\Filament\Resources\Products\Schemas;

use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class ProductForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('product_name')
                    ->required(),
                TextInput::make('product_price')
                    ->required(),
                FileUpload::make('product_image')
                    ->image()
                    ->required(),
                TextInput::make('product_description')
                    ->required(),
                TextInput::make('product_quantity')
                    ->required(),
                TextInput::make('product_discount')
                    ->required(),
            ]);
    }
}
