<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('package_add_ons', function (Blueprint $table) {
            $hasMinCamel = Schema::hasColumn('package_add_ons', 'minQuantity');
            $hasMinSnake = Schema::hasColumn('package_add_ons', 'min_quantity');
            $hasMaxCamel = Schema::hasColumn('package_add_ons', 'maxQuantity');
            $hasMaxSnake = Schema::hasColumn('package_add_ons', 'max_quantity');

            if (!$hasMinCamel && !$hasMinSnake) {
                $table->unsignedSmallInteger('minQuantity')->default(1)->after('addOnPrice');
            }
            if (!$hasMaxCamel && !$hasMaxSnake) {
                $after = $hasMinCamel ? 'minQuantity' : ($hasMinSnake ? 'min_quantity' : 'minQuantity');
                $table->unsignedSmallInteger('maxQuantity')->default(5)->after($after);
            }
        });

        // Ensure existing rows have sensible bounds (min <= max)
        $minCol = Schema::hasColumn('package_add_ons', 'minQuantity') ? 'minQuantity' : (Schema::hasColumn('package_add_ons', 'min_quantity') ? 'min_quantity' : null);
        $maxCol = Schema::hasColumn('package_add_ons', 'maxQuantity') ? 'maxQuantity' : (Schema::hasColumn('package_add_ons', 'max_quantity') ? 'max_quantity' : null);
        if ($minCol) {
            DB::table('package_add_ons')
                ->whereNull($minCol)
                ->orWhere($minCol, 0)
                ->update([$minCol => 1]);
        }
        if ($maxCol) {
            DB::table('package_add_ons')
                ->whereNull($maxCol)
                ->orWhere($maxCol, 0)
                ->update([$maxCol => 5]);
        }

        // Fix any inverted values
        $minCol = Schema::hasColumn('package_add_ons', 'minQuantity') ? 'minQuantity' : (Schema::hasColumn('package_add_ons', 'min_quantity') ? 'min_quantity' : null);
        $maxCol = Schema::hasColumn('package_add_ons', 'maxQuantity') ? 'maxQuantity' : (Schema::hasColumn('package_add_ons', 'max_quantity') ? 'max_quantity' : null);
        if ($minCol && $maxCol) {
            $rows = DB::table('package_add_ons')->select('addOnID', $minCol.' as minV', $maxCol.' as maxV')->get();
            foreach ($rows as $row) {
                if ($row->minV > $row->maxV) {
                    DB::table('package_add_ons')->where('addOnID', $row->addOnID)->update([
                        $minCol => 1,
                        $maxCol => $row->minV
                    ]);
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('package_add_ons', function (Blueprint $table) {
            if (Schema::hasColumn('package_add_ons', 'minQuantity')) {
                $table->dropColumn('minQuantity');
            }
            if (Schema::hasColumn('package_add_ons', 'maxQuantity')) {
                $table->dropColumn('maxQuantity');
            }
        });
    }
};
