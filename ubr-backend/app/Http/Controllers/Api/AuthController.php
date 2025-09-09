<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'firstName' => 'required|string|max:255',
            'lastName' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', Password::min(8)],
            'dateOfBirth' => 'required|date|before:' . now()->subYears(config('app.min_age', 20))->format('Y-m-d'),
            'gender' => 'required|in:male,female',
            'city' => 'required|string|max:255',
            'denomination' => 'required|in:catholic,protestant,evangelical,pentecostal,orthodox,other',
            'subscription' => 'required|in:discovery,serious,commitment',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Vérifier l'âge minimum
        $birthDate = \Carbon\Carbon::parse($request->dateOfBirth);
        $age = $birthDate->age;
        
        if ($age < config('app.min_age', 20)) {
            return response()->json([
                'message' => 'Vous devez avoir au moins 20 ans pour vous inscrire.'
            ], 422);
        }

        $user = User::create([
            'first_name' => $request->firstName,
            'last_name' => $request->lastName,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'date_of_birth' => $request->dateOfBirth,
            'gender' => $request->gender,
            'city' => $request->city,
            'denomination' => $request->denomination,
            'subscription_type' => $request->subscription,
            'subscription_expires_at' => now()->addMonths(
                \App\Models\Subscription::getPlanDurations()[$request->subscription]
            ),
        ]);

        // Créer la souscription
        \App\Models\Subscription::create([
            'user_id' => $user->id,
            'plan' => $request->subscription,
            'amount' => \App\Models\Subscription::getPlanPrices()[$request->subscription],
            'status' => 'pending',
            'starts_at' => now(),
            'expires_at' => now()->addMonths(
                \App\Models\Subscription::getPlanDurations()[$request->subscription]
            ),
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Inscription réussie',
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Email ou mot de passe incorrect.'
            ], 401);
        }

        if (!$user->is_active) {
            return response()->json([
                'message' => 'Votre compte a été suspendu. Contactez le support.'
            ], 403);
        }

        // Mettre à jour la dernière activité
        $user->updateLastActive();

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Connexion réussie',
            'user' => $user->load('primaryPhoto'),
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Déconnexion réussie'
        ]);
    }

    public function me(Request $request)
    {
        return response()->json([
            'user' => $request->user()->load(['primaryPhoto', 'photos'])
        ]);
    }

    public function refreshToken(Request $request)
    {
        $user = $request->user();
        $user->currentAccessToken()->delete();
        
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $user
        ]);
    }
}