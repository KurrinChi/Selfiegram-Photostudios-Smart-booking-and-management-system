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

}
?>