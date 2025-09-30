<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\PackageAddOn;
use Illuminate\Support\Facades\DB;

class PackageAddOnController extends Controller
{
    public function index()
    {
        return response()->json(PackageAddOn::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'addOn' => 'required|string|max:255',
            'addOnPrice' => 'required|numeric|min:0',
            'type' => 'required|in:single,multiple,spinner',
            'min_quantity' => 'nullable|integer|min:1',
            'max_quantity' => 'nullable|integer|min:1',
        ]);

        if ($validated['type'] !== 'multiple') {
            $validated['min_quantity'] = 1;
            $validated['max_quantity'] = 1;
        }

        // Get last addon
        $lastId = PackageAddOn::max('addOnID');

        // If no record yet, start at 10, else increment by 10
        $nextId = $lastId + 10;

        // Manually assign the id
        $validated['addOnID'] = $nextId;

        $addon = PackageAddOn::create($validated);

        return response()->json($addon, 201);
    }


    public function update(Request $request, $id)
    {
        $addon = PackageAddOn::findOrFail($id);

        $validated = $request->validate([
            'addOn' => 'required|string|max:255',
            'addOnPrice' => 'required|numeric|min:0',
            'type' => 'required|in:single,multiple,spinner',
            'min_quantity' => 'integer|min:1',
            'max_quantity' => 'integer|min:1',
        ]);

        $addon->update($validated);
        return response()->json($addon);
    }

    public function destroy($id)
    {
        $addon = PackageAddOn::findOrFail($id);
        $addon->delete();

        return response()->json(['message' => 'Add-on deleted']);
    }
}

