<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
class PackageController extends Controller
{
    // 📦 Get all packages
    public function index()
    {
        $raw = DB::table('packages')
            ->where('packages.status', 1)
            ->leftJoin('package_images', 'packages.packageID', '=', 'package_images.packageID')
            ->leftJoin('package_type_mapping', 'packages.packageID', '=', 'package_type_mapping.packageID')
            ->leftJoin('package_types', 'package_type_mapping.typeID', '=', 'package_types.typeID')
            ->select(
                'packages.packageID as id',
                'packages.name as title',
                'packages.price',
                'package_images.imagePath',
                'package_types.typeName as tag'
            )
            ->get();

        $grouped = $raw->groupBy('id');

        $packages = $grouped->map(function ($items, $id) {
            $first = $items->first();

            return [
                'id' => $id,
                'title' => $first->title,
                'price' => (float) $first->price,
                'images' => $items->pluck('imagePath')->filter()->unique()->map(fn($path) => url($path))->values(),
                'tags' => $items->pluck('tag')->filter()->unique()->values(),
            ];
        })->values();

        return response()->json($packages);
    }

    // 📦 Get a single package by ID
    public function show($id)
    {
        $raw = DB::table('packages')
            ->where('packages.status', 1)
            ->where('packages.packageID', $id)
            ->leftJoin('package_images', 'packages.packageID', '=', 'package_images.packageID')
            ->leftJoin('package_type_mapping', 'packages.packageID', '=', 'package_type_mapping.packageID')
            ->leftJoin('package_types', 'package_type_mapping.typeID', '=', 'package_types.typeID')
            ->select(
                'packages.packageID as id',
                'packages.name as title',
                'packages.price',
                'packages.description',
                'package_images.imagePath',
                'package_types.typeName as tag'
            )
            ->get();

        if ($raw->isEmpty()) {
            return response()->json(['message' => 'Package not found'], 404);
        }

        $first = $raw->first();

        $package = [
            'id' => $first->id,
            'title' => $first->title,
            'price' => (float) $first->price,
            'description' => $first->description,
            'images' => $raw->pluck('imagePath')->filter()->unique()->map(fn($path) => url($path))->values(),
            'tags' => $raw->pluck('tag')->filter()->unique()->values(),
        ];

        return response()->json($package);
    }


    public function adminShowAll()
    {
        $raw = DB::table('packages')
            ->leftJoin('package_images', 'packages.packageID', '=', 'package_images.packageID')
            ->leftJoin('package_type_mapping', 'packages.packageID', '=', 'package_type_mapping.packageID')
            ->leftJoin('package_types', 'package_type_mapping.typeID', '=', 'package_types.typeID')
            ->select(
                'packages.packageID as id',
                'packages.name as title',
                'packages.price',
                'package_images.imagePath',
                'package_types.typeName as tag',
                'packages.status'
            )
            ->get();

        $grouped = $raw->groupBy('id');

        $packages = $grouped->map(function ($items, $id) {
            $first = $items->first();

            return [
                'id' => $id,
                'title' => $first->title,
                
                'price' => (float) $first->price,
                'images' => $items->pluck('imagePath')->filter()->unique()->map(fn($path) => url($path))->values(),
                'tags' => $items->pluck('tag')->filter()->unique()->values(),
                'status' => $first->status
            ];
        })->values();

        return response()->json($packages);
    }

    public function adminShow($id)
    {
        $raw = DB::table('packages')
            ->where('packages.status', 1)
            ->where('packages.packageID', $id)
            ->leftJoin('package_images', 'packages.packageID', '=', 'package_images.packageID')
            ->leftJoin('package_type_mapping', 'packages.packageID', '=', 'package_type_mapping.packageID')
            ->leftJoin('package_types', 'package_type_mapping.typeID', '=', 'package_types.typeID')
            ->select(
                'packages.packageID as id',
                'packages.name as title',
                'packages.price',
                'packages.description',
                'package_images.imagePath',
                'package_types.typeName as tag',
                'packages.status'
            )
            ->get();

        if ($raw->isEmpty()) {
            return response()->json(['message' => 'Package not found'], 404);
        }

        $first = $raw->first();

        $package = [
            'id' => $first->id,
            'title' => $first->title,
            'price' => (float) $first->price,
            'description' => $first->description,
            'images' => $raw->pluck('imagePath')->filter()->unique()->map(fn($path) => url($path))->values(),
            'tags' => $raw->pluck('tag')->filter()->unique()->values(),
            'status' => $first->status
        ];

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

          public function getAddOns($id)
                {
                     try {
                            // Make sure $id comes from the route: /api/packages/{id}/addons
                            $addOns = DB::table('package_add_ons as pa')
                                ->join('package_add_on_mapping as pam', 'pa.addOnID', '=', 'pam.addOnID')
                                ->where('pam.packageID', $id)
                                ->select('pa.addOnID', 'pa.addOn', 'pa.addOnPrice')
                                ->get();

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


}
?>