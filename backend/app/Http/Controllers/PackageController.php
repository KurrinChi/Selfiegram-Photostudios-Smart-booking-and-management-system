<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class PackageController extends Controller
{
    //Get all packages
    public function index()
    {
        // Public packages list now also exposes discount metadata similar to admin endpoint
        $selects = [
            'packages.packageID as id',
            'packages.name as title',
            'packages.price',
            'packages.description',
            'package_images.imagePath',
            'package_types.typeName as tag'
        ];
        // Include duration if column exists
        if (Schema::hasColumn('packages', 'duration')) {
            // Put duration right after title for consistency
            array_splice($selects, 2, 0, ['packages.duration as duration']);
        }
        // Include discount related columns if they exist (backward compatible with older schema)
        if (Schema::hasColumn('packages', 'base_price')) {
            $selects[] = 'packages.base_price';
        }
        if (Schema::hasColumn('packages', 'is_discounted')) {
            $selects[] = 'packages.is_discounted';
        }
        if (Schema::hasColumn('packages', 'discount')) {
            $selects[] = 'packages.discount';
        }

        $raw = DB::table('packages')
            ->where('packages.status', 1)
            ->leftJoin('package_images', 'packages.packageID', '=', 'package_images.packageID')
            ->leftJoin('package_type_mapping', 'packages.packageID', '=', 'package_type_mapping.packageID')
            ->leftJoin('package_types', 'package_type_mapping.typeID', '=', 'package_types.typeID')
            ->select($selects)
            ->get();

        $grouped = $raw->groupBy('id');

        $packages = $grouped->map(function ($items, $id) {
            $first = $items->first();

            // Derive discount if columns exist; remain backward compatible
            $basePrice = property_exists($first, 'base_price') && $first->base_price !== null ? (float) $first->base_price : (float) $first->price;
            $price = (float) $first->price;
            $isDiscounted = property_exists($first, 'is_discounted') ? (int) $first->is_discounted : null;
            $discount = property_exists($first, 'discount') ? (int) $first->discount : null;

            // If discounted flag missing but base_price > price, derive flag & percentage
            if ($basePrice > $price) {
                if ($discount === null || $discount <= 0) {
                    $discount = (int) round((($basePrice - $price) / $basePrice) * 100);
                }
                if ($isDiscounted === null) {
                    $isDiscounted = $discount > 0 ? 1 : 0;
                }
            }

            return [
                'id' => $id,
                'title' => $first->title,
                // Return raw duration (do not force int cast so formats like "1 hr 30 mins" survive)
                'duration' => property_exists($first, 'duration') ? $first->duration : null,
                'price' => $price,
                'base_price' => $basePrice,
                'is_discounted' => $isDiscounted ?? 0,
                'discount' => $discount ?? 0,
                'description' => $first->description,
                'images' => $items->pluck('imagePath')->filter()->unique()->map(fn($path) => url($path))->values(),
                'tags' => $items->pluck('tag')->filter()->unique()->values(),
            ];
        })->values();

        return response()->json($packages);
    }

    //Get a single package by ID
    public function show($id)
    {
        $showSelects = [
            'packages.packageID as id',
            'packages.name as title',
            'packages.price',
            'packages.description',
            'package_images.imagePath',
            'package_types.typeName as tag'
        ];
        if (Schema::hasColumn('packages', 'duration')) {
            array_splice($showSelects, 2, 0, ['packages.duration as duration']);
        }
        $raw = DB::table('packages')
            ->where('packages.status', 1)
            ->where('packages.packageID', $id)
            ->leftJoin('package_images', 'packages.packageID', '=', 'package_images.packageID')
            ->leftJoin('package_type_mapping', 'packages.packageID', '=', 'package_type_mapping.packageID')
            ->leftJoin('package_types', 'package_type_mapping.typeID', '=', 'package_types.typeID')
            ->select($showSelects)
            ->get();

        if ($raw->isEmpty()) {
            return response()->json(['message' => 'Package not found'], 404);
        }

        $first = $raw->first();

        $package = [
            'id' => $first->id,
            'title' => $first->title,
            'duration' => property_exists($first, 'duration') ? $first->duration : null,
            'price' => (float) $first->price,
            'description' => $first->description,
            'images' => $raw->pluck('imagePath')->filter()->unique()->map(fn($path) => url($path))->values(),
            'tags' => $raw->pluck('tag')->filter()->unique()->values(),
        ];

        return response()->json($package);
    }


    public function adminShowAll()
    {
        $selects = [
            'packages.packageID as id',
            'packages.name as title',
            'packages.base_price',
            'packages.price',
            'packages.is_discounted',
            'packages.discount',
            'package_images.imagePath',
            'package_types.typeName as tag',
            'packages.status'
        ];
        if (Schema::hasColumn('packages', 'duration')) {
            array_splice($selects, 3, 0, ['packages.duration as duration']); // insert after title
        }
        $raw = DB::table('packages')
            ->leftJoin('package_images', 'packages.packageID', '=', 'package_images.packageID')
            ->leftJoin('package_type_mapping', 'packages.packageID', '=', 'package_type_mapping.packageID')
            ->leftJoin('package_types', 'package_type_mapping.typeID', '=', 'package_types.typeID')
            ->select($selects)
            ->get();

        $grouped = $raw->groupBy('id');

        $packages = $grouped->map(function ($items, $id) {
            $first = $items->first();

            return [
                'id' => $id,
                'title' => $first->title,
                'duration' => (int) $first->duration,
                'base_price' => (float) $first->base_price,
                'price' => (float) $first->price,
                'is_discounted' => (int) $first->is_discounted,
                'discount' => (int) $first->discount,
                'images' => $items->pluck('imagePath')->filter()->unique()->map(fn($path) => url($path))->values(),
                'tags' => $items->pluck('tag')->filter()->unique()->values(),
                'status' => $first->status
            ];
        })->values();

        return response()->json($packages);
    }

   public function adminShow($id)
    {
        $detailSelects = [
            'packages.packageID as id',
            'packages.name as title',
            'packages.base_price',
            'packages.price',
            'packages.is_discounted',
            'packages.discount',
            'packages.description',
            'package_images.imageID',
            'package_images.imagePath',
            'package_types.typeName as tag',
            'packages.status',
            'package_add_ons.addOn',
            'package_add_ons.addOnID',
            'package_sets.setName'
        ];
        if (Schema::hasColumn('packages', 'duration')) {
            array_splice($detailSelects, 2, 0, ['packages.duration as duration']);
        }
        $raw = DB::table('packages')
            ->where('packages.status', 1)
            ->where('packages.packageID', $id)
            ->leftJoin('package_images', 'packages.packageID', '=', 'package_images.packageID')
            ->leftJoin('package_type_mapping', 'packages.packageID', '=', 'package_type_mapping.packageID')
            ->leftJoin('package_types', 'package_type_mapping.typeID', '=', 'package_types.typeID')
            ->leftJoin('package_sets', 'packages.setID', '=', 'package_sets.setID')
            ->leftJoin('package_add_on_mapping', 'packages.packageID', '=', 'package_add_on_mapping.packageID')
            ->leftJoin('package_add_ons', 'package_add_on_mapping.addOnID', '=', 'package_add_ons.addOnID')
            ->select($detailSelects)
            ->get();

        if ($raw->isEmpty()) {
            return response()->json(['message' => 'Package not found'], 404);
        }

        $first = $raw->first();

        $package = [
            'id' => $first->id,
            'title' => $first->title,
            'duration' => (int) $first->duration,
            'base_price' => (float) $first->base_price,
            'price' => (float) $first->price,
            'is_discounted' => (int) $first->is_discounted,
            'discount' => (int) $first->discount,
            'description' => $first->description,
            'images' => $raw
                ->filter(fn($row) => $row->imagePath) // only keep rows with image
                ->map(fn($row) => [
                    'id' => $row->imageID,
                    'path' => url($row->imagePath), // full URL for frontend display
                ])
                ->unique('id')
                ->values(),
            'tags' => $raw->pluck('tag')->filter()->unique()->values(),
            'status' => $first->status,
            'backgroundType' => $first->setName,
            'addons' => $raw
                ->filter(fn($row) => $row->addOn)
                ->map(fn($row) => [
                    'addOnID' => $row->addOnID,
                    'addOn' => $row->addOn,
                ])
                ->unique('addOnID')
                ->values()
            
        ];

        return response()->json($package);
    }

    public function packageType()
    {
        $raw = DB::table('package_types')
            ->select('typeID as id', 'typeName as name')
            ->get();

        if ($raw->isEmpty()) {
            return response()->json(['message' => 'Package not found'], 404);
        }

        $first = $raw->first();

        $grouped = $raw->groupBy('id');

        $package = $grouped->map(function ($items, $id) {
            $first = $items->first();

            return [
                'id' => $first->id,
                'name' => $first->name,
            ];
        })->values();

        return response()->json($package);
    }

    public function archivePackage($id)
    {
        $currentStatus = DB::table('packages')
            ->where('packageID', $id)
            ->value('status');
    
        if ($currentStatus === null) {
            return response()->json(['message' => 'Package not found'], 404);
        }

        //for toggling to
        $newStatus = $currentStatus == 0 ? 1 : 0;

        //for update
        $affected = DB::table('packages')
            ->where('packageID', $id)
            ->update(['status' => $newStatus]);

        if ($affected) {
            $message = $newStatus == 0 ? 'Package archived successfully' : 'Package unarchived successfully';
            return response()->json([
                'message' => $message,
                'newStatus' => $newStatus
            ]);
        } else {
            return response()->json(['message' => 'Package not found or no change made'], 404);
        }
    }

    public function updatePackage(Request $request, $id)
    {
        $exists = DB::table('packages')->where('packageID', $id)->exists();
        if (!$exists) {
            return response()->json(['message' => 'Package not found'], 404);
        }

        DB::beginTransaction();

        try {
            $packageData = $request->only(['name', 'duration', 'price', 'description', 'base_price' , 'is_discounted', 'discount']);
            DB::table('packages')->where('packageID', $id)->update($packageData);

            // handle images
            if ($request->hasFile('images')) {
                $packageName = DB::table('packages')->where('packageID', $id)->value('name');
                $safeName = preg_replace('/[^A-Za-z0-9_\- ]/', '_', $packageName); // sanitize folder
                $folder = public_path("storage/packages/{$safeName}");

                // Create folder if it doesn't exist
                if (!file_exists($folder)) {
                    mkdir($folder, 0777, true);
                }

                // Loop files with index
                foreach ($request->file('images') as $index => $file) {
                    $filename = time() . '_' . $file->getClientOriginalName();
                    $file->move($folder, $filename);

                    // Check if frontend sent an imageID for this file
                    $imageId = $request->input("imageIDs.$index");

                    if ($imageId) {
                        // Replace existing image
                        DB::table('package_images')
                            ->where('imageID', $imageId)
                            ->update([
                                'imagePath' => "storage/packages/{$safeName}/{$filename}",
                            ]);
                    } 
                }
            }

            // Handle tag/type mapping (frontend sends names)
            $tags = $request->input('tags', []);

            DB::table('package_type_mapping')->where('packageID', $id)->delete();

            $insertData = [];
            foreach ($tags as $tagName) {
                $typeID = DB::table('package_types')
                    ->where('typeName', $tagName)
                    ->value('typeID');

                if ($typeID) {
                    $insertData[] = [
                        'packageID' => $id,
                        'typeID' => $typeID,
                    ];
                }
            }

            if (!empty($insertData)) {
                DB::table('package_type_mapping')->insert($insertData);
            }

            // Handle add-on mapping (frontend sends IDs)
            $addons = $request->input('addons', []);

            DB::table('package_add_on_mapping')->where('packageID', $id)->delete();

            $addonInsertData = [];
            foreach ($addons as $addonID) {
                // Verify addon exists
                $exists = DB::table('package_add_ons')
                    ->where('addOnID', $addonID)
                    ->exists();

                if ($exists) {
                    $addonInsertData[] = [
                        'packageID' => $id,
                        'addOnID'   => $addonID,
                    ];
                }
            }

            if (!empty($addonInsertData)) {
                DB::table('package_add_on_mapping')->insert($addonInsertData);
            }

            $background = $request->input('background'); // this is a string like "Plain"

            if ($background) {
                // find the setID for this background
                $setID = DB::table('package_sets')
                    ->where('setName', $background)
                    ->value('setID');

                if ($setID) {
                    // valid background found → update package
                    DB::table('packages')
                        ->where('packageID', $id)
                        ->update(['setID' => $setID]);
                }
            }
            
            DB::commit();
            return response()->json(['message' => 'Package updated successfully']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error updating package',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function addPackage(Request $request)
    {
        DB::beginTransaction();

        try {
            // Insert base package
            $setID = null;
            $background = $request->input('background');
            if ($background) {
                $setID = DB::table('package_sets')
                    ->where('setName', $background)
                    ->value('setID');
            }

            // Insert base package, including setID if available
            $packageData = [
                'name' => $request->input('title'),
                'duration' => $request->input('duration'),
                'price' => $request->input('price'),
                'description' => $request->input('description'),
                'status' => 1, // default to active
            ];

            if ($setID !== null) {
                $packageData['setID'] = $setID;
            }

            $packageID = DB::table('packages')->insertGetId($packageData);

            // Handle image upload (cover + carousel as same array)
            if ($request->hasFile('images')) {
                $safeName = preg_replace('/[^A-Za-z0-9_\- ]/', '_', $request->input('title'));
                $folder = public_path("storage/packages/{$safeName}");

                if (!file_exists($folder)) {
                    mkdir($folder, 0777, true);
                }

                foreach ($request->file('images') as $file) {
                    $filename = time() . '_' . $file->getClientOriginalName();
                    $file->move($folder, $filename);

                    DB::table('package_images')->insert([
                        'packageID' => $packageID,
                        'imagePath' => "storage/packages/{$safeName}/{$filename}",
                    ]);
                }
            }

            // Tags (package types)
            $tags = $request->input('tags', []);
            foreach ($tags as $tagName) {
                $typeID = DB::table('package_types')
                    ->where('typeName', $tagName)
                    ->value('typeID');

                if ($typeID) {
                    DB::table('package_type_mapping')->insert([
                        'packageID' => $packageID,
                        'typeID' => $typeID,
                    ]);
                }
            }

            // Add-ons
            $addons = $request->input('addons', []);
            foreach ($addons as $addonID) {
                $exists = DB::table('package_add_ons')
                    ->where('addOnID', $addonID)
                    ->exists();

                if ($exists) {
                    DB::table('package_add_on_mapping')->insert([
                        'packageID' => $packageID,
                        'addOnID' => $addonID,
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'message' => 'Package added successfully',
                'packageID' => $packageID,
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error adding package',
                'error' => $e->getMessage(),
            ], 500);
        }
    }


    public function getPackageSetAndConcepts($id)
    {
            // 1. Get the setID for the package
            $set = DB::table('packages')
                ->where('packageID', $id)
                ->join('package_sets', 'packages.setID', '=', 'package_sets.setID')
                ->select('package_sets.setID', 'package_sets.setName')
                ->first();

            if (!$set) {
                return response()->json(['message' => 'No set assigned for this package'], 404);
            }

            // 2. Get all concepts linked to this set
            $concepts = DB::table('package_sets_mapping')
                ->where('package_sets_mapping.setID', $set->setID)
                ->join('package_concept', 'package_sets_mapping.conceptID', '=', 'package_concept.conceptID')
                ->select(
                    'package_concept.conceptID as id',
                    'package_concept.backdrop as label',
                    'package_concept.conceptType as type'
                )
                ->get();

            return response()->json([
                'setId' => $set->setID,
                'setName' => $set->setName,
                'concepts' => $concepts->map(function ($c) {
                    return [
                        'id' => $c->id,
                        'label' => $c->label,
                        'type' => $c->type,
                    ];
                })->values()
            ]);
    }

    //customer side - get add-ons for a specific package
    public function getAddOns($id)
    {
        try {
        // Make sure $id comes from the route: /api/packages/{id}/addons
            $addOnSelects = ['pa.addOnID', 'pa.addOn', 'pa.addOnPrice', 'pa.type'];
            // Support both camelCase and snake_case column naming (in case columns were added manually)
            $hasMinCamel = Schema::hasColumn('package_add_ons', 'minQuantity');
            $hasMinSnake = Schema::hasColumn('package_add_ons', 'min_quantity');
            $hasMaxCamel = Schema::hasColumn('package_add_ons', 'maxQuantity');
            $hasMaxSnake = Schema::hasColumn('package_add_ons', 'max_quantity');

            if ($hasMinCamel) {
                $addOnSelects[] = 'pa.minQuantity as minQuantity';
            } elseif ($hasMinSnake) {
                $addOnSelects[] = 'pa.min_quantity as minQuantity';
            }
            if ($hasMaxCamel) {
                $addOnSelects[] = 'pa.maxQuantity as maxQuantity';
            } elseif ($hasMaxSnake) {
                $addOnSelects[] = 'pa.max_quantity as maxQuantity';
            }
            $addOns = DB::table('package_add_ons as pa')
                ->join('package_add_on_mapping as pam', 'pa.addOnID', '=', 'pam.addOnID')
                ->where('pam.packageID', $id)
                ->select($addOnSelects)
                ->get()
                ->map(function ($row) {
                    // Fallback mapping only if DB type is missing/empty (do not override explicit values)
                    $derived = is_string($row->type) ? strtolower(trim($row->type)) : $row->type;
                    if ($derived === null || $derived === '') {
                        // quantity add-ons
                        if (in_array($row->addOnID, [10, 20, 30, 40])) {
                            $derived = 'multiple';
                        }
                        // dropdown add-on (backdrop)
                        if ($row->addOnID == 50) {
                            $derived = 'dropdown';
                        }
                    }
                    $row->type = $derived ?: 'single';
                    return $row;
                });

                return response()->json([
                    'success' => true,
                    'data' => $addOns
                ], 200);

        } catch (\Exception $e) {
             return response()->json([
                'success' => false,
                'message' => 'Failed to fetch add-ons',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    //admin side - get all add-ons
    public function getAllAddOns()
    {
        try {
            $addOnSelects = ['pa.addOnID', 'pa.addOn', 'pa.addOnPrice', 'pa.type'];
            $hasMinCamel = Schema::hasColumn('package_add_ons', 'minQuantity');
            $hasMinSnake = Schema::hasColumn('package_add_ons', 'min_quantity');
            $hasMaxCamel = Schema::hasColumn('package_add_ons', 'maxQuantity');
            $hasMaxSnake = Schema::hasColumn('package_add_ons', 'max_quantity');

            if ($hasMinCamel) {
                $addOnSelects[] = 'pa.minQuantity as minQuantity';
            } elseif ($hasMinSnake) {
                $addOnSelects[] = 'pa.min_quantity as minQuantity';
            }
            if ($hasMaxCamel) {
                $addOnSelects[] = 'pa.maxQuantity as maxQuantity';
            } elseif ($hasMaxSnake) {
                $addOnSelects[] = 'pa.max_quantity as maxQuantity';
            }
            $addOns = DB::table('package_add_ons as pa')
                ->select($addOnSelects)
                ->get()
                ->map(function ($row) {
                    // Fallback mapping only if DB type is missing/empty (do not override explicit values)
                    $derived = is_string($row->type) ? strtolower(trim($row->type)) : $row->type;
                    if ($derived === null || $derived === '') {
                        if (in_array($row->addOnID, [10, 20, 30, 40])) {
                            $derived = 'multiple';
                        }
                        if ($row->addOnID == 50) {
                            $derived = 'dropdown';
                        }
                    }
                    $row->type = $derived ?: 'single';
                    return $row;
                });

                return response()->json([
                    'success' => true,
                    'data' => $addOns
                ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch add-ons',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getAllBackgrounds()
    {
        $raw = DB::table('package_sets')
            ->select('setID', 'setName')
            ->get();

        if ($raw->isEmpty()) {
            return response()->json(['message' => 'Package not found'], 404);
        }

        $first = $raw->first();

        $grouped = $raw->groupBy('setID');

        $package = $grouped->map(function ($items, $id) {
            $first = $items->first();

            return [
                'setID' => $first->setID,
                'setName' => $first->setName,
            ];
        })->values();

        return response()->json($package);
    }

}
?>