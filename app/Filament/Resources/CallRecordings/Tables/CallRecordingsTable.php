<?php

namespace App\Filament\Resources\CallRecordings\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class CallRecordingsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('call_schedule_id')
                    ->label('Call Schedule ID')
                    ->numeric()
                    ->sortable(),
                TextColumn::make('product_id')
                    ->label('Products')
                    ->formatStateUsing(static function ($state): string {
                        if (! is_array($state)) {
                            return (string) $state;
                        }

                        return collect($state)
                            ->map(static function ($item) {
                                if (is_array($item) && isset($item['id'])) {
                                    $quantity = $item['quantity'] ?? null;
                                    $discount = $item['discount'] ?? null;

                                    return sprintf(
                                        'ID: %s%s%s',
                                        $item['id'],
                                        $quantity !== null ? " / Qty: {$quantity}" : '',
                                        $discount !== null ? " / Disc: {$discount}" : ''
                                    );
                                }

                                return (string) $item;
                            })
                            ->implode('; ');
                    })
                    ->wrap()
                    ->toggleable(),
                TextColumn::make('signature')
                    ->searchable(),
                TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('updated_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                //
            ])
            ->recordActions([
                EditAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
