<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Daftar semua user (admin).
     */
    public function index(Request $request)
    {
        $users = User::query()
            ->when($request->query('search'), function ($query, $search) {
                // Sanitize: escape SQL wildcards to prevent pattern abuse
                $safeSearch = str_replace(['%', '_'], ['\%', '\_'], $search);
                $query->where(function ($q) use ($safeSearch) {
                    $q->where('name', 'like', "%{$safeSearch}%")
                        ->orWhere('email', 'like', "%{$safeSearch}%");
                });
            })
            ->when($request->query('role'), function ($query, $role) {
                $query->where('role', $role);
            })
            ->orderBy('name')
            ->paginate($request->integer('per_page', 10));

        return UserResource::collection($users);
    }

    /**
     * Detail satu user.
     */
    public function show(User $user)
    {
        return new UserResource($user);
    }

    /**
     * Tambah user baru (admin).
     */
    public function store(StoreUserRequest $request)
    {
        $user = User::create($request->validated());

        return new UserResource($user);
    }

    /**
     * Ubah data user (admin).
     */
    public function update(UpdateUserRequest $request, User $user)
    {
        $user->update($request->validated());

        return new UserResource($user->fresh());
    }

    /**
     * Hapus user (admin).
     */
    public function destroy(Request $request, User $user)
    {
        // Admin tidak boleh menghapus diri sendiri.
        if ($request->user()->id === $user->id) {
            return response()->json([
                'message' => 'Tidak dapat menghapus akun Anda sendiri.',
            ], 422);
        }

        $user->delete();

        return response()->json([
            'message' => 'User berhasil dihapus.',
        ]);
    }
}
