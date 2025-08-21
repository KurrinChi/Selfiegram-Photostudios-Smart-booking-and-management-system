<?php

namespace App\Http\Controllers;

use App\Models\Favorite;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FavoriteController extends Controller
{
    public function getByUser($userID)
    {
        try {
        $favorites = DB::table('favorites')
            ->join('packages', 'favorites.packageID', '=', 'packages.packageID')
            ->leftJoin('package_images', 'packages.packageID', '=', 'package_images.packageID')
            ->where('favorites.userID', $userID)
            ->select(
                'packages.packageID as id',
                'packages.name as title',
                'packages.description',
                'packages.price',
                'packages.status',
                'package_images.imagePath'
            )
            ->get();

        // Group images by package
        $grouped = $favorites->groupBy('id')->map(function ($items) {
            $first = $items->first();
            return [
                'id' => $first->id,
                'title' => $first->title,
                'description' => $first->description,
                'price' => (float) $first->price,
                'status' => $first->status,
                'images' => $items->pluck('imagePath')->filter()->unique()->values(),
            ];
        })->values();

        return response()->json($grouped);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => $e->getMessage(),
        ], 500);
    }
    }
     public function add(Request $request)
    {
        $validated = $request->validate([
            'userID' => 'required|integer',
            'packageID' => 'required|integer',
        ]);

        // Prevent duplicate due to unique index
        $exists = Favorite::where('userID', $validated['userID'])
                          ->where('packageID', $validated['packageID'])
                          ->exists();

        if (!$exists) {
            Favorite::create($validated);
        }

        return response()->json(['success' => true]);
    }

    public function remove(Request $request)
    {
        $validated = $request->validate([
            'userID' => 'required|integer',
            'packageID' => 'required|integer',
        ]);

        Favorite::where('userID', $validated['userID'])
                ->where('packageID', $validated['packageID'])
                ->delete();

        return response()->json(['success' => true]);
    }

    public function removeFavorite(Request $request)
        {
            $userID = $request->input('userID');
            $packageID = $request->input('packageID');

            $deleted = DB::table('favorites')
                ->where('userID', $userID)
                ->where('packageID', $packageID)
                ->delete();

            return response()->json([
                'success' => $deleted > 0,
                'message' => $deleted > 0 ? 'Removed from favorites' : 'No favorite found to delete',
            ]);
        }
    public function getFavoritesWithPackages($userID)
        {
            try {
                $favorites = DB::table('favorites')
                    ->join('packages', 'favorites.packageID', '=', 'packages.packageID')
                    ->where('favorites.userID', $userID)
                    ->select(
                        'packages.packageID as id',
                        'packages.name as title',
                        'packages.description',
                        'packages.price',
                        'packages.status'
                    )
                    ->get();

                foreach ($favorites as $fav) {
                    $fav->images = DB::table('package_images')
                        ->where('packageID', $fav->id)
                        ->pluck('imagePath');
                }

                return response()->json($favorites);
            } catch (\Exception $e) {
                return response()->json(['error' => $e->getMessage()], 500);
            }
        }
        public function getFavorites($id)
            {
                $favorites = DB::table('favorites')
                    ->where('userID', $id)
                    ->pluck('packageID');

                return response()->json($favorites);
            }
}
